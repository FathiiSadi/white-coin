import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { PlanPanel } from './PlanPanel';
import { ChatPanel } from './ChatPanel';

interface Message {
  role: string;
  content: string;
}

export const FinancialPlan = () => {
  const [planData, setPlanData] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  
  const [status, setStatus] = useState<'loading' | 'no_plan' | 'clarifying' | 'generating' | 'locked'>('loading');
  const [isStreaming, setIsStreaming] = useState(false);

  const loadedRef = React.useRef(false);
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadPlan();
    }
  }, []);

  const loadPlan = async () => {
    try {
      const res = await api.get('/financial-plan');
      if (res.status === 'no_plan') {
        setStatus('clarifying');
        startClarification();
      } else {
        // Assume plan was saved before
        setPlanData(typeof res.plan === 'string' ? res.plan : JSON.stringify(res.plan, null, 2) || '');
        setMessages(res.clarification_history || []);
        setStatus(res.status);
      }
    } catch (e) {
      console.error(e);
      setStatus('no_plan');
    }
  };

  const startClarification = async () => {
    setIsStreaming(true);
    let currentContent = '';
    setMessages([{ role: 'assistant', content: '' }]);
    
    try {
      await api.streamPost('/financial-plan/clarify', {}, (chunk) => {
        currentContent += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          const lastIndex = newMessages.length - 1;
          newMessages[lastIndex] = { ...newMessages[lastIndex], content: currentContent };
          return newMessages;
        });
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  const savePlan = async (finalPlan: string, finalHistory: Message[]) => {
    try {
      await api.post('/financial-plan/save', {
        plan_data: finalPlan,
        history: finalHistory
      });
      setStatus('locked');
    } catch (e) {
      console.error("Failed to save plan", e);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsStreaming(true);

    try {
      if (status === 'clarifying') {
        const userMessageCount = updatedMessages.filter(m => m.role === 'user').length;
        
        if (userMessageCount < 3) {
            let currentContent = '';
            setMessages([...updatedMessages, { role: 'assistant', content: '' }]);
            
            await api.streamPost('/financial-plan/clarify-next', { history: updatedMessages }, (chunk) => {
              currentContent += chunk;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastIndex = newMessages.length - 1;
                newMessages[lastIndex] = { ...newMessages[lastIndex], content: currentContent };
                return newMessages;
              });
            });
        } else {
            setPlanData('');
            setStatus('generating');
            let currentPlanData = '';
            
            setMessages([...updatedMessages, { role: 'assistant', content: 'Thank you! I have all the information I need. I am crunching the numbers to generate your comprehensive financial dashboard now...' }]);
            
            await api.streamPost('/financial-plan/answer', { history: updatedMessages }, (chunk) => {
              currentPlanData += chunk;
              setPlanData(currentPlanData);
            });

            const newHistory = [...updatedMessages, { role: 'assistant', content: 'I have generated your financial dashboard. It is now locked. You can ask me to modify any numbers, goals, or targets!' }];
            setMessages(newHistory);
            
            await savePlan(currentPlanData, newHistory);
        }
      } else if (status === 'locked' || status === 'generating') {
        setPlanData(''); 
        let currentPlanData = '';
        
        setMessages([...updatedMessages, { role: 'assistant', content: 'Updating your financial dashboard...' }]);
        
        await api.streamPost('/financial-plan/chat', { instruction: userMessage.content }, (chunk) => {
          currentPlanData += chunk;
          setPlanData(currentPlanData);
        });

        const finalHistory = [...updatedMessages, { role: 'assistant', content: 'I have updated your dashboard successfully.' }];
        setMessages(finalHistory);
        await savePlan(currentPlanData, finalHistory);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsStreaming(false);
    }
  };

  if (status === 'loading') {
    return <div className="p-12 text-center text-slate-500">Loading your financial profile...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Financial Plan</h1>
          <p className="text-slate-500 font-medium mt-1">Your AI-optimized strategy.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7">
          <PlanPanel 
            planData={planData} 
            isStreaming={isStreaming && (status === 'generating' || status === 'locked')} 
            isLocked={status === 'locked'} 
          />
        </div>
        <div className="lg:col-span-5">
          <ChatPanel 
            messages={messages}
            input={input}
            setInput={setInput}
            onSendMessage={handleSendMessage}
            isStreaming={isStreaming}
            isDisabled={false}
          />
        </div>
      </div>
    </div>
  );
};
