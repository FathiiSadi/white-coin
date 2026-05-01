import React, { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../lib/api';
import { PlanPanel } from './PlanPanel';
import { ChatPanel } from './ChatPanel';
import { RefreshCw } from 'lucide-react';

interface Message {
  role: string;
  content: string;
}

type Status = 'loading' | 'no_plan' | 'clarifying' | 'generating' | 'locked';

// Immutable snapshot of original user answers — never mutated after first lock
let originalUserContext: Message[] | null = null;

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
}

export const FinancialPlan = () => {
  const [planData, setPlanData] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState<Status>('loading');
  const [isStreaming, setIsStreaming] = useState(false);
  const [clarificationCount, setClarificationCount] = useState(0);
  const [realGoals, setRealGoals] = useState<SavingsGoal[]>([]);

  const loadedRef = useRef(false);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadPlan();
      // Fetch real goal balances independently to override AI values
      api.get('/savings-goals').then((res) => {
        if (Array.isArray(res)) setRealGoals(res);
        else if (Array.isArray(res.goals)) setRealGoals(res.goals);
      }).catch(() => {});
    }
  }, []);

  const loadPlan = async () => {
    try {
      const res = await api.get('/financial-plan');
      if (res.status === 'no_plan') {
        setStatus('clarifying');
        startClarification();
      } else {
        const planStr = typeof res.plan === 'string' ? res.plan : JSON.stringify(res.plan || '', null, 2);
        setPlanData(planStr);
        setMessages(res.clarification_history || []);
        setStatus(res.status as Status);
        // Count prior user messages to know where clarification ended
        const userMsgs = (res.clarification_history || []).filter((m: Message) => m.role === 'user');
        setClarificationCount(userMsgs.length);
        if (!originalUserContext) {
          originalUserContext = [...(res.clarification_history || [])];
        }
      }
    } catch (e) {
      console.error(e);
      setStatus('no_plan');
    }
  };

  const savePlan = async (finalPlan: string, finalHistory: Message[], currentStatus: string) => {
    try {
      await api.post('/financial-plan/save', {
        plan_data: finalPlan,
        history: finalHistory,
        status: currentStatus,
      });
    } catch (e) {
      console.error('Failed to save plan', e);
    }
  };

  const startClarification = async () => {
    setIsStreaming(true);
    let currentContent = '';
    setMessages([{ role: 'assistant', content: '' }]);

    try {
      await api.streamPost('/financial-plan/clarify', {}, (chunk) => {
        currentContent += chunk;
        setMessages([{ role: 'assistant', content: currentContent }]);
      });
      await savePlan('', [{ role: 'assistant', content: currentContent }], 'clarifying');
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  const generatePlan = async (history: Message[]) => {
    setPlanData('');
    setStatus('generating');
    setIsStreaming(true);

    const genMsg = { role: 'assistant', content: '✦ All inputs confirmed. Generating your personalized financial plan now...' };
    const updatedHistory = [...history, genMsg];
    setMessages(updatedHistory);

    let streamBuffer = '';
    try {
      // Collect full stream first — don't render partial JSON
      await api.streamPost('/financial-plan/answer', { history }, (chunk) => {
        streamBuffer += chunk;
      });

      // Validate that we got parseable JSON
      let jsonStart = -1;
      let jsonEnd = -1;
      let depth = 0;
      for (let i = 0; i < streamBuffer.length; i++) {
        if (streamBuffer[i] === '{') {
          if (depth === 0) jsonStart = i;
          depth++;
        } else if (streamBuffer[i] === '}') {
          depth--;
          if (depth === 0 && jsonStart !== -1) {
            jsonEnd = i;
            break;
          }
        }
      }

      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('AI response was not valid JSON');
      }
      const parsed = JSON.parse(streamBuffer.substring(jsonStart, jsonEnd + 1));

      // Only set planData once we have a complete, valid response
      setPlanData(streamBuffer.substring(jsonStart, jsonEnd + 1));

      // One-line health summary as final chat message
      const healthSummary = parsed.health_summary || 'Your plan has been generated.';
      const finalMsg = { role: 'assistant', content: `✅ ${healthSummary}\n\nYour plan is ready below. You can ask me to modify anything — I'll recalculate all deadlines and your health score instantly.` };
      const finalHistory = [...updatedHistory, finalMsg];
      setMessages(finalHistory);
      setStatus('locked');

      // Lock original context on first generation
      if (!originalUserContext) {
        originalUserContext = [...history];
      }

      await savePlan(streamBuffer.substring(jsonStart, jsonEnd + 1), finalHistory, 'locked');
    } catch (e) {
      console.error(e);
      const errorMsg = { role: 'assistant', content: '⚠️ Something went wrong generating your plan. Please try again or reset.' };
      setMessages(prev => [...prev, errorMsg]);
      setStatus('clarifying');
    } finally {
      setIsStreaming(false);
    }
  };

  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    try {
      if (status === 'clarifying') {
        const newCount = clarificationCount + 1;
        setClarificationCount(newCount);

        // Validate: check if user provided numbers before we proceed
        const hasNumbers = /\d/.test(userMessage.content);
        const isLastClarification = newCount >= 2;

        if (!isLastClarification) {
          // Ask next clarification question
          let currentContent = '';
          const tempMsg: Message = { role: 'assistant', content: '' };
          setMessages([...updatedMessages, tempMsg]);

          await api.streamPost('/financial-plan/clarify-next', { history: updatedMessages }, (chunk) => {
            currentContent += chunk;
            setMessages(prev => {
              const arr = [...prev];
              arr[arr.length - 1] = { role: 'assistant', content: currentContent };
              return arr;
            });
          });

          const saved = [...updatedMessages, { role: 'assistant', content: currentContent }];
          await savePlan('', saved, 'clarifying');
        } else {
          // Enough context — generate plan
          setIsStreaming(false);
          await generatePlan(updatedMessages);
          return;
        }
      } else if (status === 'locked') {
        // MODIFICATION MODE: stream invisibly, only swap plan on completion
        // DO NOT clear planData during streaming — keeps old plan visible
        setStatus('generating');

        const modInstruction = `User wants to modify the plan. Instruction: "${userMessage.content}". Apply this to the existing plan, recalculate all deadlines and health score, explain what changed.`;

        let streamBuffer = '';
        const thinkingMsg: Message = { role: 'assistant', content: '⏳ Updating your plan...' };
        setMessages([...updatedMessages, thinkingMsg]);

        // Collect the full stream into a buffer — don't touch planData at all yet
        await api.streamPost('/financial-plan/chat', { instruction: modInstruction }, (chunk) => {
          streamBuffer += chunk;
        });

        // Stream is done — now find and validate the JSON
        let jsonStart = -1;
        let jsonEnd = -1;
        let depth = 0;
        for (let i = 0; i < streamBuffer.length; i++) {
          if (streamBuffer[i] === '{') {
            if (depth === 0) jsonStart = i;
            depth++;
          } else if (streamBuffer[i] === '}') {
            depth--;
            if (depth === 0 && jsonStart !== -1) {
              jsonEnd = i;
              break;
            }
          }
        }

        if (jsonStart !== -1 && jsonEnd !== -1) {
          try {
            const parsed = JSON.parse(streamBuffer.substring(jsonStart, jsonEnd + 1));
            const aiExplanation = parsed.explanation || 'Your modification has been applied. All deadlines and your health score have been recalculated. Would you like to rebalance anything else?';
            const impactMsg: Message = { role: 'assistant', content: aiExplanation };
            const finalHistory = [...updatedMessages, impactMsg];

            // Only now do we swap the plan — guaranteed valid JSON
            setPlanData(streamBuffer.substring(jsonStart, jsonEnd + 1));
            setMessages(finalHistory);
            setStatus('locked');
            await savePlan(streamBuffer.substring(jsonStart, jsonEnd + 1), finalHistory, 'locked');
          } catch (parseErr) {
            console.error('Plan parse failed after stream:', parseErr);
            const errorMsg: Message = { role: 'assistant', content: '⚠️ Received an invalid plan response. Your previous plan is unchanged. Please try again.' };
            setMessages([...updatedMessages, errorMsg]);
            setStatus('locked');
          }
        } else {
          const fallbackMsg: Message = { role: 'assistant', content: '✅ Plan updated. Would you like to adjust anything else?' };
          const finalHistory = [...updatedMessages, fallbackMsg];
          setPlanData(streamBuffer);
          setMessages(finalHistory);
          setStatus('locked');
          await savePlan(streamBuffer, finalHistory, 'locked');
        }
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ Something went wrong. Please try again.' }]);
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages, status, clarificationCount]);

  const handleReset = async () => {
    if (!window.confirm('Reset your financial plan and start over?')) return;
    try {
      await api.post('/financial-plan/reset', {});
      originalUserContext = null;
      setPlanData('');
      setMessages([]);
      setStatus('clarifying');
      setClarificationCount(0);
      startClarification();
    } catch (e) {
      console.error(e);
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 font-bold">Loading your financial profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Plan</h1>
          <p className="text-slate-500 font-medium mt-1">AI-powered strategy, personalized for you.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
            status === 'locked' ? 'bg-emerald-50 text-emerald-600' :
            status === 'generating' ? 'bg-amber-50 text-amber-600' :
            'bg-slate-50 text-slate-500'
          }`}>
            {status === 'locked' ? '● Active Plan' : status === 'generating' ? '◎ Generating' : '○ Clarifying'}
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Plan Panel - wider */}
        <div className="lg:col-span-7 xl:col-span-8">
          <PlanPanel
            planData={planData}
            isStreaming={isStreaming && (status === 'generating')}
            isLocked={status === 'locked'}
            realGoals={realGoals}
          />
        </div>

        {/* Chat Panel - narrower */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-8">
          <ChatPanel
            messages={messages}
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            isDisabled={false}
            status={status}
            onReset={handleReset}
          />
        </div>
      </div>
    </div>
  );
};
