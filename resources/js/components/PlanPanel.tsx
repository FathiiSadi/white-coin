import React from 'react';
import { Lock, Unlock, Sparkles } from 'lucide-react';

interface PlanPanelProps {
  planData: string;
  isStreaming: boolean;
  isLocked: boolean;
}

export const PlanPanel: React.FC<PlanPanelProps> = ({ planData, isStreaming, isLocked }) => {
  if (!planData && isStreaming) {
     return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-[800px] items-center justify-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-slate-500 font-bold">Structuring your financial plan...</p>
        </div>
     );
  }

  // Very basic Markdown to clean HTML rendering specifically for this use case
  const renderMarkdown = (text: string) => {
      if (!text) return null;
      
      const lines = text.split('\n');
      return lines.map((line, i) => {
          if (line.startsWith('### ')) return <h3 key={i} className="text-xl font-bold text-slate-800 mt-6 mb-3">{line.replace('### ', '')}</h3>;
          if (line.startsWith('## ')) return <h2 key={i} className="text-2xl font-black text-slate-900 mt-8 mb-4 border-b pb-2">{line.replace('## ', '')}</h2>;
          if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-primary mt-8 mb-4">{line.replace('# ', '')}</h1>;
          if (line.startsWith('- **') || line.startsWith('* **')) {
              const parts = line.split('**');
              return <li key={i} className="ml-4 mb-2 text-slate-600"><span className="font-bold text-slate-800">{parts[1]}</span>{parts.slice(2).join('**')}</li>;
          }
          if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-4 mb-2 text-slate-600">{line.substring(2)}</li>;
          if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-4 mb-3 text-slate-600 font-medium">{line}</li>;
          if (line.trim() === '') return <br key={i} />;
          
          // Bold text replacement
          const boldParts = line.split('**');
          if (boldParts.length > 2) {
              return <p key={i} className="text-slate-600 mb-2 leading-relaxed">
                  {boldParts.map((part, index) => index % 2 === 1 ? <strong key={index} className="text-slate-800 font-bold">{part}</strong> : part)}
              </p>;
          }
          
          return <p key={i} className="text-slate-600 mb-2 leading-relaxed">{line}</p>;
      });
  };

  return (
    <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-[800px] overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2"><Sparkles className="text-primary" size={20} /> Financial Plan</h2>
        <div className="flex items-center gap-2">
          {isLocked ? (
            <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <Lock size={14} /> Locked (Chat to edit)
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-primary bg-white px-3 py-1.5 rounded-lg border border-slate-200">
              <Unlock size={14} /> Editable
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-8 bg-white max-w-none">
          {renderMarkdown(planData)}
          {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
      </div>
    </div>
  );
};
