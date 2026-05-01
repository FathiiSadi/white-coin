import React, { useEffect, useRef } from 'react';
import { Send, Sparkles, Bot, User, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: string;
  content: string;
  type?: 'chat' | 'system';
}

interface ChatPanelProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSendMessage: () => void;
  isStreaming: boolean;
  isDisabled: boolean;
  status: string;
  onReset: () => void;
}

const SUGGESTIONS = [
  'Increase my savings to 500 JOD/month',
  'What if I add a new car goal?',
  'Swap the priority of my top two goals',
  'How long until I reach my first goal?',
];

// Strip JSON from AI messages so only conversational text shows
function stripJSON(content: string): string {
  // Remove JSON object blocks from the message
  return content
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/\{[\s\S]*"health_summary"[\s\S]*\}/g, '')
    .trim();
}

function renderMessageContent(content: string, role: string) {
  const cleaned = role === 'assistant' ? stripJSON(content) : content;
  if (!cleaned) return null;

  const lines = cleaned.split('\n').filter(Boolean);
  return lines.map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-black text-sm mt-1">{line.replace(/\*\*/g, '')}</p>;
    }
    if (line.startsWith('- ') || line.startsWith('• ')) {
      return (
        <p key={i} className="text-sm flex gap-1.5 mt-1">
          <span className="opacity-50 mt-0.5">•</span>
          <span>{line.substring(2)}</span>
        </p>
      );
    }
    return <p key={i} className={`text-sm leading-relaxed ${i > 0 ? 'mt-1' : ''}`}>{line}</p>;
  });
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  messages,
  input,
  setInput,
  onSendMessage,
  isStreaming,
  isDisabled,
  status,
  onReset,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) onSendMessage();
    }
  };

  const showSuggestions = status === 'locked' && !isStreaming && messages.length > 0;

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 200px)', minHeight: '700px', maxHeight: '950px' }}
    >
      {/* Header */}
      <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between bg-gradient-to-r from-white to-slate-50/50 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-md p-1.5">
              <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full ${isStreaming ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'}`} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base tracking-tight">Financial AI Advisor</h3>
            <span className="text-[11px] font-black tracking-wider uppercase text-primary">
              {isStreaming ? 'Thinking...' : status === 'locked' ? 'Plan Active · Chat to modify' : 'Building your plan'}
            </span>
          </div>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-black text-rose-500 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 bg-slate-50/30 custom-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const displayContent = isUser ? msg.content : stripJSON(msg.content);
            if (!displayContent && !isUser) return null;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <Bot size={16} />
                  </div>
                )}

                <div className={`max-w-[82%] rounded-[24px] px-5 py-4 shadow-sm ${
                  isUser
                    ? 'bg-primary text-white rounded-tr-md'
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-md'
                }`}>
                  {renderMessageContent(msg.content, msg.role)}
                </div>

                {isUser && (
                  <div className="w-8 h-8 bg-slate-100 text-slate-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Typing indicator */}
        {isStreaming && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot size={16} />
            </div>
            <div className="bg-white border border-slate-100 rounded-[24px] rounded-tl-md px-5 py-4 shadow-sm">
              <div className="flex items-center gap-1.5">
                {[0, 1, 2].map(j => (
                  <div
                    key={j}
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: `${j * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Quick Suggestions */}
      {showSuggestions && (
        <div className="px-6 pb-3 flex gap-2 flex-wrap flex-shrink-0">
          {SUGGESTIONS.map((s, i) => (
            <button
              key={i}
              onClick={() => { setInput(s); inputRef.current?.focus(); }}
              className="text-[11px] font-black text-primary bg-primary/5 border border-primary/10 px-3 py-1.5 rounded-xl hover:bg-primary/10 transition-colors whitespace-nowrap"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-3 border-t border-slate-50 flex-shrink-0">
        <div className="relative flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl py-4 pl-5 pr-14 text-sm font-medium outline-none transition-all placeholder:text-slate-400 disabled:opacity-40"
              placeholder={isStreaming ? 'Advisor is thinking...' : status === 'locked' ? 'Ask to modify your plan...' : 'Reply to the advisor...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isDisabled || isStreaming}
            />
            <button
              onClick={onSendMessage}
              disabled={isDisabled || isStreaming || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-40 hover:bg-primary-hover active:scale-95 transition-all"
            >
              {isStreaming ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-bold mt-2 text-center tracking-wide">
          Enter to send · The AI remembers all your financial data
        </p>
      </div>
    </div>
  );
};
