import React, { useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight,
  Target,
  PieChart as PieIcon,
  Activity,
  List
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line
} from 'recharts';

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
}

interface PlanPanelProps {
  planData: string;
  isStreaming: boolean;
  isLocked: boolean;
  realGoals?: SavingsGoal[];
}

export const PlanPanel: React.FC<PlanPanelProps> = ({ planData, isStreaming, isLocked, realGoals = [] }) => {
  const data = useMemo(() => {
    try {
      // Find JSON block in case there's garbage
      const jsonStart = planData.indexOf('{');
      const jsonEnd = planData.lastIndexOf('}');
      if (jsonStart !== -1 && jsonEnd !== -1) {
        return JSON.parse(planData.substring(jsonStart, jsonEnd + 1));
      }
      return null;
    } catch (e) {
      return null;
    }
  }, [planData]);

  if (!data && isStreaming) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl flex flex-col h-[850px] items-center justify-center p-12 text-center">
        <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="text-primary animate-pulse" size={32} />
            </div>
        </div>
        <h3 className="text-2xl font-black text-slate-900 mb-2">Analyzing Financial Data</h3>
        <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
          Our AI is calculating your optimal budget split and goal deadlines...
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl flex flex-col h-[850px] items-center justify-center p-12 text-center text-slate-400">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
            <Activity size={40} />
        </div>
        <p className="font-bold text-lg">No plan generated yet.</p>
        <p className="text-sm mt-2">Chat with our AI to build your personalized strategy.</p>
      </div>
    );
  }

  const COLORS = ['#006D5B', '#F6AD55', '#9B2C2C', '#4299E1'];
  
  const budgetData = [
    { name: 'Needs', value: data.budget_split.needs_percent, color: '#006D5B' },
    { name: 'Wants', value: data.budget_split.wants_percent, color: '#F6AD55' },
    { name: 'Savings', value: data.budget_split.savings_percent, color: '#4299E1' },
  ];

  // Inject real saved balances from DB into AI goals — AI output is unreliable for this field
  const goals = (data.goals || []).map((g: any) => {
    const real = realGoals.find(
      (r) => r.name.toLowerCase().trim() === g.name?.toLowerCase().trim()
    );
    return {
      ...g,
      saved: real ? real.current_amount : (g.saved ?? 0),
      target: real ? real.target_amount : (g.target ?? 0),
    };
  });

  const goalsData = goals.map((g: any) => ({
    name: g.name,
    Saved: g.saved,
    Remaining: Math.max(0, g.target - g.saved),
  }));

  // Simple growth projection for line chart
  const projectionData = Array.from({ length: 12 }, (_, i) => ({
    month: `Month ${i + 1}`,
    Balance: data.snapshot.savings + (data.snapshot.income - data.snapshot.expenses) * (i + 1)
  }));

  return (
    <div className="space-y-6">
      {/* Health Header */}
      <div className="bg-gradient-to-r from-primary to-primary-hover p-1 rounded-[32px] shadow-lg">
        <div className="bg-white rounded-[28px] p-4 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                 <CheckCircle2 size={24} />
              </div>
              <p className="font-black text-slate-900 text-sm tracking-tight">{data.health_summary}</p>
           </div>
           <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Health Score</span>
              <span className="text-lg font-black text-primary">{data.snapshot.health_score}/100</span>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden flex flex-col">
        <div className="p-8 space-y-12 h-[850px] overflow-y-auto custom-scrollbar">
          
          {/* Section 1: Financial Snapshot Cards */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center"><Wallet size={18} /></div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Financial Snapshot</h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
               {[
                 { label: 'Monthly Income', val: data.snapshot.income, icon: ArrowUpRight, col: 'emerald' },
                 { label: 'Total Expenses', val: data.snapshot.expenses, icon: ArrowDownRight, col: 'rose' },
                 { label: 'Savings Committed', val: data.snapshot.savings, icon: TrendingUp, col: 'primary' },
                 { label: 'Free Cash Flow', val: data.snapshot.free_cash, icon: Sparkles, col: 'amber' }
               ].map((s, i) => (
                 <div key={i} className="bg-slate-50/50 p-5 rounded-3xl border border-slate-100 hover:border-primary/20 transition-colors">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <div className="flex items-center justify-between">
                       <span className="text-lg font-black text-slate-900">${s.val.toLocaleString()}</span>
                       <s.icon size={16} className={`text-${s.col}-500`} />
                    </div>
                 </div>
               ))}
            </div>
          </div>

          {/* Section 2: Goals Breakdown & Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
             <div>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center"><Target size={18} /></div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Goals Tracker</h3>
                </div>
                <div className="space-y-4">
                  {goals.map((g: any, i: number) => (
                    <div key={i} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                       <div className="flex justify-between items-start mb-2">
                          <div>
                             <p className="font-black text-slate-900 text-sm">{g.name}</p>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{g.projected_date}</p>
                          </div>
                          <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${
                            g.priority === 'High' ? 'bg-rose-50 text-rose-500' : 
                            g.priority === 'Medium' ? 'bg-amber-50 text-amber-500' : 'bg-slate-50 text-slate-500'
                          }`}>
                            {g.priority}
                          </span>
                       </div>
                       <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden mb-2">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((g.saved / g.target) * 100, 100)}%` }} />
                       </div>
                       <div className="flex justify-between text-[10px] font-black text-slate-500">
                          <span>${g.saved.toLocaleString()}</span>
                          <span>Target: ${g.target.toLocaleString()}</span>
                       </div>
                    </div>
                  ))}
                </div>
             </div>
             <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={goalsData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ fontSize: 12, fontWeight: 900 }}
                      />
                      <Bar dataKey="Saved" stackId="a" fill="#006D5B" radius={[0, 0, 4, 4]} />
                      <Bar dataKey="Remaining" stackId="a" fill="#E2E8F0" radius={[4, 4, 0, 0]} />
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Section 3: Budget Split & Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-slate-50/50 p-8 rounded-[40px] border border-slate-100">
             <div>
                <div className="flex items-center gap-2 mb-4">
                   <div className="w-8 h-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center"><PieIcon size={18} /></div>
                   <h3 className="text-xl font-black text-slate-900 tracking-tight">50/30/20 Rule Analysis</h3>
                </div>
                <div className="space-y-3">
                   {budgetData.map((b, i) => (
                     <div key={i} className="flex items-center justify-between p-3 bg-white rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                           <div className="w-3 h-3 rounded-full" style={{ backgroundColor: b.color }} />
                           <span className="font-bold text-slate-700 text-sm">{b.name}</span>
                        </div>
                        <span className="font-black text-slate-900">{b.value}%</span>
                     </div>
                   ))}
                </div>
                {data.budget_split.flags && data.budget_split.flags.length > 0 && (
                  <div className="mt-4 p-4 bg-rose-50 rounded-2xl border border-rose-100">
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-widest mb-2 flex items-center gap-1"><AlertTriangle size={12}/> Budget Flags</p>
                    <ul className="space-y-1">
                      {data.budget_split.flags.map((f: string, i: number) => (
                        <li key={i} className="text-sm font-medium text-rose-700 leading-tight flex items-start gap-2">
                           <span className="mt-1">•</span> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
             </div>
             <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie data={budgetData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
                         {budgetData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                         ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ fontSize: 12, fontWeight: 900 }}
                      />
                   </PieChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Section 4: Risk & Recommendations */}
          <div>
             <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center"><AlertTriangle size={18} /></div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Risk & Recommendations</h3>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.risks_recommendations.map((tip: string, i: number) => (
                  <div key={i} className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                     <div className="absolute -right-2 -top-2 w-12 h-12 bg-slate-50 rounded-full group-hover:scale-150 transition-transform" />
                     <p className="text-sm font-medium text-slate-600 leading-relaxed relative z-10">{tip}</p>
                  </div>
                ))}
             </div>
          </div>

          {/* Section 5: Action Plan */}
          {data.action_plan && data.action_plan.length > 0 && (
            <div>
               <div className="flex items-center gap-2 mb-6">
                  <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center"><List size={18} /></div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Detailed Action Plan</h3>
               </div>
               <div className="bg-slate-50/50 border border-slate-100 rounded-[32px] p-8 space-y-6">
                 {data.action_plan.map((paragraph: string, i: number) => (
                   <p key={i} className="text-slate-700 font-medium leading-relaxed flex items-start gap-4">
                      <span className="w-6 h-6 shrink-0 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-black">{i + 1}</span>
                      {paragraph}
                   </p>
                 ))}
               </div>
            </div>
          )}

          {/* Section 6: Summary */}
          <div className="bg-primary/5 p-8 rounded-[40px] border border-primary/10">
             <h3 className="text-lg font-black text-primary mb-2 flex items-center gap-2">
                <Sparkles size={20} /> Advisor Summary
             </h3>
             <p className="text-slate-700 font-medium leading-relaxed">
                {data.summary}
             </p>
          </div>

          {/* Savings Projection Chart */}
          <div>
             <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">12-Month Projection</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compound Savings Growth</p>
             </div>
             <div className="h-[300px] w-full bg-white p-4 rounded-3xl border border-slate-100">
                <ResponsiveContainer width="100%" height="100%">
                   <LineChart data={projectionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 700 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} 
                        itemStyle={{ fontSize: 12, fontWeight: 900 }}
                      />
                      <Line type="monotone" dataKey="Balance" stroke="#006D5B" strokeWidth={4} dot={{ fill: '#006D5B', strokeWidth: 2, r: 4 }} activeDot={{ r: 8 }} />
                   </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
