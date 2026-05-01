import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Wallet,
  PieChart,
  ChevronRight,
  Sparkles,
  Zap,
  MoreVertical,
  Target,
  DollarSign
} from 'lucide-react';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip } from 'recharts';
import { api } from '../lib/api';
import { useTranslation } from '../lib/LanguageContext';

interface DashboardProps {
  setActiveTab: (tab: any) => void;
}

export const Dashboard = ({ setActiveTab }: DashboardProps) => {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [viewAllTransactions, setViewAllTransactions] = useState(false);
  const [roundUpActive, setRoundUpActive] = useState(() => localStorage.getItem('roundup_enabled') !== 'false');
  const [roundUpAmount, setRoundUpAmount] = useState(() => parseFloat(localStorage.getItem('roundup_amount') || '1'));
  const [roundUpSaved, setRoundUpSaved] = useState(0);
  const [dynamicCategoryData, setDynamicCategoryData] = useState<any[]>([]);
  const [editingStatId, setEditingStatId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [newTx, setNewTx] = useState({
    amount: '',
    category: 'Food & Dining',
    description: ''
  });

  const [stats, setStats] = useState([
    { id: 'balance', label: t('total_balance'), value: '$0.00', trend: 'Updating...', trendType: 'neutral', icon: Wallet, color: '#E6F1F0', iconColor: '#006D5B' },
    { id: 'income', label: t('monthly_income'), value: '$0.00', trend: 'Updating...', trendType: 'neutral', icon: ArrowUpRight, color: '#FFF5E6', iconColor: '#F6AD55' },
    { id: 'expenses', label: t('monthly_expenses'), value: '$0.00', trend: 'Updating...', trendType: 'neutral', icon: ArrowDownRight, color: '#FFE6E6', iconColor: '#F56565' },
    { id: 'savings', label: t('savings_progress'), value: '0%', trend: 'Updating...', trendType: 'neutral', icon: Target, color: '#E6F1F0', iconColor: '#006D5B', isProgress: true }
  ]);

  useEffect(() => {
    fetchDashboardData();
    const handleStorageChange = () => {
        setRoundUpActive(localStorage.getItem('roundup_enabled') !== 'false');
        setRoundUpAmount(parseFloat(localStorage.getItem('roundup_amount') || '1'));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const calculateRoundUp = (txs: any[], amount: number) => {
      if (!amount || amount <= 0) return 0;
      return txs.reduce((acc, tx) => {
          const val = parseFloat(tx.amount);
          if (isNaN(val) || val <= 0) return acc;
          const nextMultiple = Math.ceil(val / amount) * amount;
          const saving = nextMultiple - val;
          return acc + saving;
      }, 0);
  };

  const fetchDashboardData = async () => {
    try {
      const [txs, incomes, goalsData] = await Promise.all([
        api.get('/transactions'),
        api.get('/income-sources'),
        api.get('/savings-goals')
      ]);

      const dummyTxs = [
        { id: 'd1', amount: '20.45', category: 'Subscriptions', description: 'Claude Code Subscription', created_at: new Date().toISOString() },
        { id: 'd2', amount: '15.99', category: 'Entertainment', description: 'Netflix Premium', created_at: new Date(Date.now() - 86400000).toISOString() },
        { id: 'd3', amount: '45.25', category: 'Food & Dining', description: 'Lunch at Bistro', created_at: new Date(Date.now() - 172800000).toISOString() },
        { id: 'd4', amount: '120.00', category: 'Housing', description: 'Internet Bill', created_at: new Date(Date.now() - 259200000).toISOString() },
        { id: 'd5', amount: '12.80', category: 'Transport', description: 'Uber Ride', created_at: new Date(Date.now() - 345600000).toISOString() },
        { id: 'd6', amount: '8.15', category: 'Food & Dining', description: 'Coffee', created_at: new Date(Date.now() - 432000000).toISOString() },
        { id: 'd7', amount: '250.60', category: 'Shopping', description: 'Apple Store', created_at: new Date(Date.now() - 518400000).toISOString() },
        { id: 'd8', amount: '65.40', category: 'Food & Dining', description: 'Supermarket', created_at: new Date(Date.now() - 604800000).toISOString() },
        { id: 'd9', amount: '12.20', category: 'Subscriptions', description: 'Spotify Family', created_at: new Date(Date.now() - 691200000).toISOString() },
        { id: 'd10', amount: '35.10', category: 'Health', description: 'Pharmacy', created_at: new Date(Date.now() - 777600000).toISOString() },
      ];

      const allTxs = txs.length > 0 ? txs : dummyTxs;
      setTransactions(allTxs);

      const currentRoundUpAmount = parseFloat(localStorage.getItem('roundup_amount') || '1');
      setRoundUpSaved(calculateRoundUp(allTxs, currentRoundUpAmount));

      const totalIncome = incomes.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0) || 5000;
      const actualExpenses = allTxs.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
      
      // Calculate real category data
      const categoryMap: Record<string, number> = {};
      allTxs.forEach((tx: any) => {
        const cat = tx.category || 'Other';
        categoryMap[cat] = (categoryMap[cat] || 0) + parseFloat(tx.amount);
      });

      const colors = ['#006D5B', '#F6AD55', '#9B2C2C', '#4299E1', '#6B46C1', '#E2E8F0'];
      const realCategoryData = Object.entries(categoryMap).map(([name, value], i) => ({
        name,
        value: Math.round((value / actualExpenses) * 100),
        color: colors[i % colors.length]
      })).sort((a, b) => b.value - a.value);

      setDynamicCategoryData(realCategoryData);

      // Get saved amount from goals in localStorage
      const storedGoals = JSON.parse(localStorage.getItem('user_goals') || '[]');
      const totalSavedInGoals = storedGoals.reduce((acc: number, g: any) => acc + (parseFloat(g.current_amount) || 0), 0);

      const balance = totalIncome - actualExpenses - totalSavedInGoals;

      const monthlyIncome = totalIncome;
      const monthlyExpenses = actualExpenses;

      const primaryGoal = storedGoals[0] || goalsData[0] || { target_amount: 10000, name: 'Savings', current_amount: 0 };
      const totalProgress = Math.min(Math.round((totalSavedInGoals / parseFloat(primaryGoal.target_amount || '10000')) * 100), 100);

      setStats([
        { id: 'balance', label: t('total_balance'), value: `$${balance.toLocaleString()}`, trend: 'Usable Balance', trendType: 'neutral', icon: Wallet, color: '#E6F1F0', iconColor: '#006D5B' },
        { id: 'income', label: t('monthly_income'), value: `$${monthlyIncome.toLocaleString()}`, trend: `Safe Spend: $${(totalIncome * 0.6).toLocaleString()}`, trendType: 'neutral', icon: ArrowUpRight, color: '#FFF5E6', iconColor: '#F6AD55' },
        { id: 'expenses', label: t('monthly_expenses'), value: `$${monthlyExpenses.toLocaleString()}`, trend: `${Math.round((monthlyExpenses/monthlyIncome)*100)}% of income`, trendType: (monthlyExpenses/monthlyIncome) > 0.6 ? 'down' : 'up', icon: ArrowDownRight, color: '#FFE6E6', iconColor: '#F56565' },
        { id: 'savings', label: t('savings_progress'), value: `${totalProgress}%`, trend: `Goal: ${primaryGoal.name}`, trendType: 'neutral', icon: Target, color: '#E6F1F0', iconColor: '#006D5B', isProgress: true }
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatEdit = (id: string, currentValue: string) => {
    setEditingStatId(id);
    setEditValue(currentValue.replace('$', '').replace('%', '').replace(',', ''));
  };

  const saveStatEdit = () => {
    if (!editingStatId) return;
    setStats(prev => prev.map(s => {
        if (s.id === editingStatId) {
            const val = s.isProgress ? `${editValue}%` : `$${parseFloat(editValue).toLocaleString()}`;
            return { ...s, value: val };
        }
        return s;
    }));
    setEditingStatId(null);
  };

  const handleAddTransaction = async () => {
    if (!newTx.amount) return;
    setSubmitting(true);
    try {
      await api.post('/transactions', {
        amount: parseFloat(newTx.amount),
        category: newTx.category,
        description: newTx.description,
        date: new Date().toISOString().split('T')[0],
        type: 'expense'
      });
      setShowModal(false);
      setNewTx({ amount: '', category: 'Food & Dining', description: '' });
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to add transaction', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-slate-400 font-medium">{t('loading') || 'Loading...'}</div>;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('dashboard')}</h1>
          <p className="text-slate-500 font-medium mt-1">{t('welcome_back')} {t('financial_summary')}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          <span>{t('add_transaction')}</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group relative">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                <stat.icon size={20} style={{ color: stat.iconColor }} />
              </div>
              <button 
                onClick={() => handleStatEdit(stat.id, stat.value)}
                className="p-1 text-slate-300 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical size={20} />
              </button>
            </div>
            
            {editingStatId === stat.id ? (
                <div className="space-y-2">
                    <input 
                        autoFocus
                        className="w-full bg-slate-50 border-2 border-primary/20 rounded-xl px-3 py-1 font-bold text-xl outline-none"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onBlur={saveStatEdit}
                        onKeyDown={(e) => e.key === 'Enter' && saveStatEdit()}
                    />
                    <p className="text-[10px] text-primary font-bold">Press Enter to save</p>
                </div>
            ) : (
                <div>
                  <p className="text-[13px] font-bold text-slate-400 uppercase tracking-tight mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</h3>
                  {stat.isProgress ? (
                    <div className="space-y-2">
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: stat.value }} />
                      </div>
                      <p className="text-xs font-bold text-slate-400">{stat.trend}</p>
                    </div>
                  ) : (
                    <p className={`text-xs font-bold ${stat.trendType === 'up' ? 'text-primary' : 'text-slate-400'}`}>
                      {stat.trendType === 'up' && <TrendingUp size={12} className="inline mr-1" />}
                      {stat.trend}
                    </p>
                  )}
                </div>
            )}
          </div>
        ))}
      </div>

      {/* Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             className="bg-white w-full max-w-md rounded-[32px] p-8 shadow-2xl overflow-hidden relative"
           >
              <h2 className="text-2xl font-black text-slate-900 mb-8">{t('add_transaction')}</h2>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">{t('amount')}</label>
                  <div className="relative">
                    <DollarSign size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                      value={newTx.amount}
                      onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">{t('category')}</label>
                  <select 
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                    value={newTx.category}
                    onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                  >
                    <option>Food & Dining</option>
                    <option>Housing</option>
                    <option>Transport</option>
                    <option>Entertainment</option>
                    <option>Health</option>
                    <option>Shopping</option>
                    <option>Subscriptions</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">{t('description')}</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Weekly Groceries"
                    className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                    value={newTx.description}
                    onChange={(e) => setNewTx({...newTx, description: e.target.value})}
                  />
                </div>

                <div className="flex gap-4 mt-8">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    onClick={handleAddTransaction}
                    disabled={submitting || !newTx.amount}
                    className="flex-[2] bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {submitting ? 'Saving...' : t('save')}
                  </button>
                </div>
              </div>
           </motion.div>
        </div>
      )}

      {/* Insight and Round-Up Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-primary rounded-[32px] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="relative z-10 flex-1 max-w-lg mb-6 sm:mb-0">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Sparkles size={20} />
              </div>
              <h2 className="text-xl font-bold">{t('smart_insight')}</h2>
            </div>
            <p className="text-white/80 font-medium leading-relaxed text-sm sm:text-base">
              Your dining spend is 30% over budget this month. Consider cooking at home for the next two weeks to stay on track.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('plan')}
            className="relative z-10 bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-xl w-full sm:w-auto"
          >
            {t('ask_ai')}
          </button>
        </div>

        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${roundUpActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-300'}`}>
                <Zap size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{t('roundup')}</h2>
            </div>
            <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                      const newState = !roundUpActive;
                      setRoundUpActive(newState);
                      localStorage.setItem('roundup_enabled', newState.toString());
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${roundUpActive ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${roundUpActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <button 
                  onClick={() => setActiveTab('settings_roundup')}
                  className="p-2 text-slate-300 hover:text-primary transition-colors"
                >
                  <Plus size={18} />
                </button>
            </div>
          </div>
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-1">
               <div className={`w-2 h-2 rounded-full ${roundUpActive ? 'bg-primary animate-pulse' : 'bg-slate-300'}`} />
               <p className={`text-[10px] font-black uppercase tracking-widest ${roundUpActive ? 'text-primary' : 'text-slate-400'}`}>
                 {roundUpActive ? 'Active & Syncing' : 'Paused'}
               </p>
            </div>
            <h3 className={`text-3xl font-black transition-colors ${roundUpActive ? 'text-slate-900' : 'text-slate-300'}`}>
              ${roundUpActive ? roundUpSaved.toFixed(2) : '0.00'}
            </h3>
            <p className="text-slate-400 font-bold text-[13px] mt-1">{t('saved_this_week')}</p>
          </div>
        </div>
      </div>

      {/* Categories and Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Categories Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">{t('overall_expenses') || 'Overall Expenses'}</h2>
            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-3 py-1 rounded-full">
               <TrendingUp size={10} className="text-primary" />
               Under 60% Target
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicCategoryData} layout="vertical" margin={{ left: 10, right: 30, top: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }}
                  width={90}
                />
                <ReTooltip 
                   cursor={{ fill: '#f8fafb' }}
                   contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 10, 10, 0]} barSize={16}>
                  {dynamicCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-50">
             <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('total_spending') || 'Total Spending'}</p>
                <p className="text-2xl font-black text-slate-900">
                  ${stats.find(s => s.id === 'expenses')?.value.replace('$', '')}
                </p>
             </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col max-h-[600px] overflow-hidden">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">{t('recent_transactions')}</h2>
            <button 
              onClick={() => setViewAllTransactions(!viewAllTransactions)}
              className="text-primary font-bold text-sm hover:underline transition-all"
            >
              {viewAllTransactions ? t('show_less') || 'Show Less' : t('view_all')}
            </button>
          </div>
          <div className={`flex-1 divide-y divide-slate-50 overflow-y-auto pr-2 custom-scrollbar ${viewAllTransactions ? '' : 'max-h-[350px]'}`}>
            {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <p className="font-medium">{t('no_transactions')}</p>
                </div>
            ) : (viewAllTransactions ? transactions : transactions.slice(0, 5)).map((tx, i) => (
              <div key={tx.id} className="py-5 flex items-center justify-between group cursor-pointer first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-slate-500 transition-colors group-hover:bg-slate-100 bg-slate-50 shrink-0`}>
                    <span className="material-symbols-outlined text-lg sm:text-xl">
                      {tx.category === 'Subscriptions' ? 'event_repeat' : 
                       tx.category === 'Food & Dining' ? 'restaurant' :
                       tx.category === 'Housing' ? 'home' :
                       tx.category === 'Transport' ? 'directions_car' :
                       tx.category === 'Entertainment' ? 'movie' : 'shopping_cart'}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm sm:text-base truncate">{tx.description || tx.category}</h4>
                    <p className="text-[12px] sm:text-[13px] font-medium text-slate-400">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900 text-sm sm:text-base">-${parseFloat(tx.amount).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
