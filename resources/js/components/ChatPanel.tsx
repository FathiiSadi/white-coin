import React from 'react';
import { Send, MoreHorizontal, Settings2, Play } from 'lucide-react';

interface Message {
  role: string;
  content: string;
}

interface ChatPanelProps {
  messages: Message[];
  input: string;
  setInput: (val: string) => void;
  onSendMessage: () => void;
  isStreaming: boolean;
  isDisabled: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ messages, input, setInput, onSendMessage, isStreaming, isDisabled }) => {
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-[800px]">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm p-1">
                 <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
               <h3 className="font-bold text-slate-900">القرش الذكي (Smart Shark)</h3>
               <div className="flex items-center gap-1.5">
                 <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                   {isStreaming ? 'Typing...' : 'Online & Ready'}
                 </span>
               </div>
            </div>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
         {messages.map((msg, i) => (
           <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
             <div className={`max-w-[85%] p-4 rounded-2xl text-[14px] leading-relaxed ${
               msg.role === 'user' 
                 ? 'bg-primary text-white rounded-tr-none' 
                 : 'bg-white text-slate-600 shadow-sm border border-slate-100 rounded-tl-none'
             }`}>
               {msg.content.split('\n').map((line, j) => (
                 <p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>
               ))}
             </div>
           </div>
         ))}
      </div>

      <div className="p-6 border-t border-slate-50">
         <div className="relative">
            <input 
              className="w-full bg-slate-100 border-none rounded-2xl py-4 pl-4 pr-12 text-sm focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
              placeholder="Ask the Smart Shark..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSendMessage(); }}
              disabled={isDisabled || isStreaming}
            />
            <button 
              onClick={onSendMessage}
              disabled={isDisabled || isStreaming || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
         </div>
      </div>
    </div>
  );
};
