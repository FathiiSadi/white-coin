import React from 'react';
import { Lock, Unlock } from 'lucide-react';

interface PlanPanelProps {
  planData: string;
  isStreaming: boolean;
  isLocked: boolean;
}

export const PlanPanel: React.FC<PlanPanelProps> = ({ planData, isStreaming, isLocked }) => {
  return (
    <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-[800px] overflow-hidden">
      <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50">
        <h2 className="text-xl font-bold text-slate-900">Your Financial Plan</h2>
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
      <div className="flex-1 overflow-y-auto p-8 whitespace-pre-wrap text-slate-700 leading-relaxed text-sm font-medium">
        {planData || (
          <div className="flex h-full items-center justify-center text-slate-400">
            Awaiting AI generation...
          </div>
        )}
        {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-primary animate-pulse" />}
      </div>
    </div>
  );
};
