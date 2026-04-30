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
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
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
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [txs, incomes, goals] = await Promise.all([
        api.get('/transactions'),
        api.get('/income-sources'),
        api.get('/savings-goals')
      ]);

      setTransactions(txs);

      const totalIncome = incomes.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
      const totalExpenses = txs.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
      const balance = totalIncome - totalExpenses;

      const currentMonth = new Date().getMonth();
      const monthlyIncome = incomes.reduce((acc: number, curr: any) => {
          return acc + parseFloat(curr.amount);
      }, 0);

      const monthlyExpenses = txs.filter((tx: any) => new Date(tx.created_at).getMonth() === currentMonth)
                                 .reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);

      const goal = goals[0] || { target_amount: 1, name: 'No goal set' };
      const savingsProgress = Math.min(Math.round((balance / parseFloat(goal.target_amount)) * 100), 100);

      setStats([
        { id: 'balance', label: t('total_balance'), value: `$${balance.toLocaleString()}`, trend: '+0% vs last month', trendType: 'neutral', icon: Wallet, color: '#E6F1F0', iconColor: '#006D5B' },
        { id: 'income', label: t('monthly_income'), value: `$${monthlyIncome.toLocaleString()}`, trend: `Expected: $${monthlyIncome.toLocaleString()}`, trendType: 'neutral', icon: ArrowUpRight, color: '#FFF5E6', iconColor: '#F6AD55' },
        { id: 'expenses', label: t('monthly_expenses'), value: `$${monthlyExpenses.toLocaleString()}`, trend: 'Budget: $4,000', trendType: 'neutral', icon: ArrowDownRight, color: '#FFE6E6', iconColor: '#F56565' },
        { id: 'savings', label: t('savings_progress'), value: `${savingsProgress}%`, trend: `Goal: ${goal.name}`, trendType: 'neutral', icon: Target, color: '#E6F1F0', iconColor: '#006D5B', isProgress: true }
      ]);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
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

  const categoryData = [
    { name: t('housing') || 'Housing', value: 45, color: '#006D5B' },
    { name: t('food_dining') || 'Food & Dining', value: 25, color: '#F6AD55' },
    { name: t('transport') || 'Transport', value: 15, color: '#9B2C2C' },
    { name: t('entertainment') || 'Entertainment', value: 10, color: '#4299E1' },
    { name: t('other') || 'Other', value: 5, color: '#E2E8F0' },
  ];

  if (loading) return <div className="p-8 text-slate-400 font-medium">{t('loading') || 'Loading...'}</div>;

  return (
    <div className="space-y-8">
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
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-6">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: stat.color }}>
                <stat.icon size={20} style={{ color: stat.iconColor }} />
              </div>
              <MoreVertical size={20} className="text-slate-300" />
            </div>
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
          <button className="relative z-10 bg-white text-primary px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-xl w-full sm:w-auto">
            {t('ask_ai')}
          </button>
        </div>

        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Zap size={20} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{t('roundup')}</h2>
            </div>
            <button 
              onClick={() => setActiveTab('settings_roundup')}
              className="p-2 text-slate-300 hover:text-primary transition-colors"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-1">
               <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
               <p className="text-[10px] font-black text-primary uppercase tracking-widest">Active & Syncing</p>
            </div>
            <h3 className="text-3xl font-black text-slate-900">$42.50</h3>
            <p className="text-slate-400 font-bold text-[13px] mt-1">{t('saved_this_week')}</p>
          </div>
        </div>
      </div>

      {/* Categories and Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Categories Chart */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">{t('overall_expenses') || 'Overall Expenses'}</h2>
            <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 px-3 py-1 rounded-full">
               <TrendingUp size={10} className="text-red-500" />
               +12.5% vs Prev
            </div>
          </div>
          <div className="h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-black text-slate-900">$3,420</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('monthly') || 'Monthly'}</span>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-y-4 gap-x-4 sm:gap-x-8">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-[12px] sm:text-sm font-medium text-slate-500 truncate max-w-[80px] sm:max-w-none">{cat.name}</span>
                </div>
                <span className="text-[12px] sm:text-sm font-bold text-slate-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-3 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-slate-900">{t('recent_transactions')}</h2>
            <button className="text-primary font-bold text-sm hover:underline">{t('view_all')}</button>
          </div>
          <div className="flex-1 divide-y divide-slate-50">
            {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                    <p className="font-medium">{t('no_transactions')}</p>
                </div>
            ) : transactions.slice(0, 5).map((tx, i) => (
              <div key={tx.id} className="py-5 flex items-center justify-between group cursor-pointer first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-slate-500 transition-colors group-hover:bg-slate-100 bg-slate-50 shrink-0">
                    <span className="material-symbols-outlined text-lg sm:text-xl">shopping_cart</span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-slate-900 group-hover:text-primary transition-colors text-sm sm:text-base truncate">{tx.category}</h4>
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
