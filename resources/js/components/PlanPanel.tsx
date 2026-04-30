import React from 'react';
import { Lock, Unlock, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
            <p className="text-slate-500 font-bold">Crunching your numbers and generating dashboard...</p>
        </div>
     );
  }

  let data: any = null;
  if (planData) {
      try {
          const cleaned = planData.replace(/```json/g, '').replace(/```/g, '').trim();
          data = JSON.parse(cleaned);
      } catch (e) {
          // Streaming incomplete JSON
      }
  }

  if (!data) {
     return (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-[800px] overflow-hidden">
            <div className="flex-1 p-8 whitespace-pre-wrap font-mono text-xs overflow-auto bg-slate-900 text-green-400">
                {planData || 'Awaiting AI generation...'}
                {isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-green-400 animate-pulse" />}
            </div>
        </div>
     );
  }

  return (
    <div className="bg-slate-50/50 rounded-[32px] border border-slate-100 shadow-sm flex flex-col h-[800px] overflow-hidden">
      <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-white">
        <h2 className="text-xl font-bold text-slate-900">Financial Dashboard</h2>
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
      
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Net Worth & Cash Flow */}
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Worth</p>
                  <h3 className="text-4xl font-black text-slate-900 mt-2">${data.netWorth?.total?.toLocaleString()}</h3>
                  <div className="flex flex-col gap-1 mt-6 text-sm">
                      <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg">
                        <span className="font-semibold text-slate-500">Assets</span> 
                        <span className="font-bold text-emerald-600">${data.netWorth?.assets?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-slate-50 px-3 py-2 rounded-lg">
                        <span className="font-semibold text-slate-500">Liabilities</span> 
                        <span className="font-bold text-rose-500">${data.netWorth?.liabilities?.toLocaleString()}</span>
                      </div>
                  </div>
              </div>
              
              <div className="bg-gradient-to-br from-primary to-emerald-700 p-6 rounded-3xl shadow-lg border border-slate-100 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                     <TrendingUp size={64} />
                  </div>
                  <p className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Monthly Surplus</p>
                  <h3 className="text-4xl font-black mt-2">${data.cashFlow?.surplus?.toLocaleString()}</h3>
                  <div className="flex flex-col gap-1 mt-6 text-sm">
                      <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg">
                        <span className="font-medium text-emerald-100">Income</span> 
                        <span className="font-bold">${data.cashFlow?.income?.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg">
                        <span className="font-medium text-emerald-100">Expenses</span> 
                        <span className="font-bold">${data.cashFlow?.expenses?.toLocaleString()}</span>
                      </div>
                  </div>
              </div>
          </div>

          {/* Goals Tracker */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h4 className="font-black text-slate-900 mb-6 flex items-center gap-2">
                 Goal Tracker
             </h4>
             <div className="space-y-5">
                {data.goals?.map((goal: any, i: number) => (
                    <div key={i}>
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-bold text-slate-800">{goal.name}</span>
                            <span className="font-bold text-primary">${goal.current?.toLocaleString()} <span className="text-slate-400 font-medium">/ ${goal.target?.toLocaleString()}</span></span>
                        </div>
                        <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, goal.progress || 0)}%` }} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 mt-2">Saving ${goal.monthly}/mo</p>
                    </div>
                ))}
             </div>
          </div>

          {/* Recommended Actions */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
             <h4 className="font-black text-slate-900 mb-4">Recommended Actions</h4>
             <div className="space-y-3">
                 {data.actions?.map((action: any, i: number) => (
                     <div key={i} className="flex gap-4 items-start bg-slate-50 hover:bg-slate-100 transition-colors p-4 rounded-2xl">
                         <div className="bg-white p-2 rounded-xl shadow-sm text-primary shrink-0">
                           <AlertCircle size={20} />
                         </div>
                         <div>
                             <h5 className="font-bold text-sm text-slate-900">{action.title}</h5>
                             <p className="text-xs font-medium text-slate-500 mt-1 leading-relaxed">{action.description}</p>
                         </div>
                     </div>
                 ))}
             </div>
          </div>
      </div>
    </div>
  );
};

// Dummy component just to satisfy the import if it's used
const TrendingUp = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
);
