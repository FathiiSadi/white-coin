import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  TrendingUp,
  Home,
  Car,
  Plane,
  Heart,
  MoreVertical,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Wallet
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';
import { useTranslation } from '../lib/LanguageContext';

interface SavingGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  category: string;
  color: string;
}

export const Goals = () => {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    category: 'General',
    deadline: ''
  });

  const [showEditModal, setShowEditModal] = useState<SavingGoal | null>(null);
  const [showFundModal, setShowFundModal] = useState<SavingGoal | null>(null);
  const [fundAmount, setFundAmount] = useState('');
  const [currentUsableBalance, setCurrentUsableBalance] = useState(0);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const [txData, incomeData, goalsData] = await Promise.all([
        api.get('/transactions'),
        api.get('/income-sources'),
        api.get('/savings-goals')
      ]);

      const dummyTxs = [
        { id: 'd1', amount: '20.45', category: 'Subscriptions' },
        { id: 'd2', amount: '15.99', category: 'Entertainment' },
        { id: 'd3', amount: '45.25', category: 'Food & Dining' },
        { id: 'd4', amount: '120.00', category: 'Housing' },
        { id: 'd5', amount: '12.80', category: 'Transport' },
      ];

      const allTxs = Array.isArray(txData) && txData.length > 0 ? txData : dummyTxs;
      const totalIncome = (Array.isArray(incomeData) ? incomeData.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0) : 0) || 5000;
      const actualExpenses = allTxs.reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
      const currentBalance = totalIncome - actualExpenses;
      setCurrentUsableBalance(currentBalance);

      const storedGoals = JSON.parse(localStorage.getItem('user_goals') || '[]');

      const dummyGoals: SavingGoal[] = [
        { id: '1', name: 'Emergency Fund', target_amount: 15000, current_amount: 0, category: 'Safety', color: '#006D5B' },
        { id: '2', name: 'Dream Home', target_amount: 250000, current_amount: 0, category: 'Housing', color: '#F6AD55' },
        { id: '3', name: 'New Car', target_amount: 35000, current_amount: 0, category: 'Transport', color: '#4299E1' },
      ];

      const finalGoals = storedGoals.length > 0 ? storedGoals : (Array.isArray(goalsData) && goalsData.length > 0 ? goalsData : dummyGoals);
      setGoals(finalGoals);
      localStorage.setItem('user_goals', JSON.stringify(finalGoals));
    } catch (err) {
      console.error('Failed to fetch goals', err);
      const fallback = JSON.parse(localStorage.getItem('user_goals') || '[{"id":"1","name":"Emergency Fund","target_amount":15000,"current_amount":1200,"category":"Safety","color":"#006D5B"}]');
      setGoals(fallback);
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = (updatedGoals: SavingGoal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem('user_goals', JSON.stringify(updatedGoals));
    window.dispatchEvent(new Event('storage')); // Trigger dashboard update
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target_amount) return;

    const payload = {
      ...newGoal,
      target_amount: parseFloat(newGoal.target_amount),
      current_amount: 0,
      id: Math.random().toString(36).substr(2, 9),
      color: ['#006D5B', '#F6AD55', '#4299E1', '#9B2C2C', '#6B46C1'][Math.floor(Math.random() * 5)]
    };

    saveGoals([...goals, payload as SavingGoal]);
    setShowAddModal(false);
    setNewGoal({ name: '', target_amount: '', category: 'General', deadline: '' });
    await api.post('/savings-goals', payload).catch(console.error);
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditModal) return;
    const updated = goals.map(g => g.id === showEditModal.id ? showEditModal : g);
    saveGoals(updated);
    
    // Persist to API
    await api.put(`/savings-goals/${showEditModal.id}`, showEditModal).catch(console.error);
    setShowEditModal(null);
  };

  const handleAddFunds = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showFundModal || !fundAmount) return;
    
    const amountToAdd = parseFloat(fundAmount);
    if (isNaN(amountToAdd) || amountToAdd <= 0) return;

    const updated = goals.map(g => {
      if (g.id === showFundModal.id) {
        return { 
          ...g, 
          current_amount: Number((parseFloat(g.current_amount.toString()) + amountToAdd).toFixed(2))
        };
      }
      return g;
    });
    
    saveGoals(updated);
    
    const updatedGoal = updated.find(g => g.id === showFundModal.id);
    if (updatedGoal) {
       await api.put(`/savings-goals/${updatedGoal.id}`, updatedGoal).catch(console.error);
    }
    
    setShowFundModal(null);
    setFundAmount('');
  };

  const getIcon = (category: string) => {
    const cat = category ? category.toLowerCase() : '';
    switch (cat) {
      case 'housing': return <Home size={20} />;
      case 'transport': return <Car size={20} />;
      case 'travel': return <Plane size={20} />;
      case 'safety': return <Heart size={20} />;
      default: return <Target size={20} />;
    }
  };

  const calculateProgress = (current: number, target: number) => {
    if (!target || target <= 0) return 0;
    return Math.min(Math.round((current / target) * 100), 100);
  };

  const totalSavedInGoals = goals.reduce((acc, g) => acc + (Number(g.current_amount) || 0), 0);
  const displayUsableBalance = currentUsableBalance - totalSavedInGoals;

  return (
    <div className="space-y-10 pb-20">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('savings_goals') || 'Savings Goals'}</h1>
          <p className="text-slate-500 font-medium mt-1">Plan your future and track your progress.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-primary-hover transition-all active:scale-95 shadow-xl shadow-primary/20"
        >
          <Plus size={20} />
          <span>{t('new_goal') || 'Create Goal'}</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-[#006D5B] p-8 rounded-[40px] text-white relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all" />
            <p className="text-white/60 font-bold text-xs uppercase tracking-widest mb-2">Total Saved</p>
            <h3 className="text-4xl font-black mb-4">
              ${totalSavedInGoals.toLocaleString()}
            </h3>
            <div className="flex items-center gap-2 text-white/80 text-xs font-bold">
               <TrendingUp size={14} />
               <span>Usable Balance: ${displayUsableBalance.toLocaleString()}</span>
            </div>
         </div>

         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Active Goals</p>
                  <h3 className="text-2xl font-black text-slate-900">{goals.length}</h3>
               </div>
               <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center">
                  <Target size={24} />
               </div>
            </div>
            <div className="mt-6 h-2 bg-slate-50 rounded-full overflow-hidden">
               <div className="h-full bg-orange-400 rounded-full" style={{ width: '65%' }} />
            </div>
         </div>

         <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Average Progress</p>
                  <h3 className="text-2xl font-black text-slate-900">
                    {goals.length > 0 ? Math.round(goals.reduce((acc, g) => acc + calculateProgress(g.current_amount, g.target_amount), 0) / goals.length) : 0}%
                  </h3>
               </div>
               <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
                  <Sparkles size={24} />
               </div>
            </div>
            <div className="mt-6 h-2 bg-slate-50 rounded-full overflow-hidden">
               <div className="h-full bg-primary rounded-full" style={{ width: '42%' }} />
            </div>
         </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary/10 transition-all group"
          >
            <div className="flex justify-between items-start mb-10">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-[24px] flex items-center justify-center text-white shadow-2xl"
                  style={{ backgroundColor: goal.color }}
                >
                  {getIcon(goal.category)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900">{goal.name}</h3>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">{goal.category}</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(goal)}
                className="p-2 bg-slate-50 rounded-xl text-slate-400 hover:text-primary transition-colors"
              >
                <MoreVertical size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Current Balance</p>
                  <p className="text-2xl font-black text-slate-900">${(Number(goal.current_amount) || 0).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">Target</p>
                  <p className="text-lg font-bold text-slate-500">${(Number(goal.target_amount) || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="relative h-4 bg-slate-50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress(goal.current_amount, goal.target_amount)}%` }}
                  className="absolute top-0 left-0 h-full rounded-full"
                  style={{ backgroundColor: goal.color }}
                />
              </div>

              <div className="flex justify-between items-center pt-2">
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                  {calculateProgress(goal.current_amount, goal.target_amount)}% Completed
                </p>
                <button
                  onClick={() => setShowFundModal(goal)}
                  className="flex items-center gap-1 text-primary text-xs font-black hover:underline"
                >
                  <span>Add Funds</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="mt-10 pt-8 border-t border-slate-50 flex items-center justify-between">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden">
                       <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${goal.id}${i}`} alt="Contributor" />
                    </div>
                  ))}
               </div>
               <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (confirm('Delete this goal?')) {
                        saveGoals(goals.filter(g => g.id !== goal.id));
                      }
                    }}
                    className="px-4 py-3 bg-red-50 text-red-500 rounded-2xl text-xs font-black hover:bg-red-100 transition-colors"
                  >
                    Delete
                  </button>
               </div>
            </div>
          </motion.div>
        ))}

        {/* Add New Card */}
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-slate-50/50 border-4 border-dashed border-slate-100 rounded-[48px] p-10 flex flex-col items-center justify-center gap-4 group hover:border-primary/20 hover:bg-white transition-all min-h-[400px]"
        >
           <div className="w-20 h-20 bg-white rounded-[32px] shadow-sm flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:shadow-xl group-hover:scale-110 transition-all">
              <Plus size={40} />
           </div>
           <div className="text-center">
              <p className="text-xl font-black text-slate-900">New Saving Plan</p>
              <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Start a new journey</p>
           </div>
        </button>
      </div>

      {/* Add Goal Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[40px] w-full max-w-lg p-10 relative shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Create Saving Goal</h2>
            <form onSubmit={handleAddGoal} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-4">Goal Name</label>
                <input required placeholder="e.g. New Macbook Pro" className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none" value={newGoal.name} onChange={e => setNewGoal({...newGoal, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-4">Target Amount</label>
                  <input required type="number" placeholder="2500" className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none" value={newGoal.target_amount} onChange={e => setNewGoal({...newGoal, target_amount: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-4">Category</label>
                  <select className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none appearance-none" value={newGoal.category} onChange={e => setNewGoal({...newGoal, category: e.target.value})}>
                    <option value="General">General</option>
                    <option value="Housing">Housing</option>
                    <option value="Transport">Transport</option>
                    <option value="Travel">Travel</option>
                    <option value="Safety">Safety</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-hover">Create Plan</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowEditModal(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[40px] w-full max-w-lg p-10 relative shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Edit Goal</h2>
            <form onSubmit={handleEditGoal} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-4">Goal Name</label>
                <input required className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none" value={showEditModal.name} onChange={e => setShowEditModal({...showEditModal, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-4">Target Amount</label>
                  <input required type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none" value={showEditModal.target_amount || ''} onChange={e => setShowEditModal({...showEditModal, target_amount: parseFloat(e.target.value) || 0})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-4">Current Balance</label>
                  <input required type="number" className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none" value={showEditModal.current_amount || ''} onChange={e => setShowEditModal({...showEditModal, current_amount: parseFloat(e.target.value) || 0})} />
                </div>
              </div>
              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setShowEditModal(null)} className="flex-1 px-8 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-hover">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Funds Modal */}
      {showFundModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowFundModal(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-[40px] w-full max-w-sm p-10 relative shadow-2xl">
            <h2 className="text-2xl font-black text-slate-900 mb-2">Add Funds</h2>
            <p className="text-slate-500 text-sm mb-6">Allocate from your usable balance: <span className="font-bold text-primary">${displayUsableBalance.toLocaleString()}</span></p>
            <form onSubmit={handleAddFunds} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-slate-400 tracking-widest ml-4">Amount to Transfer</label>
                <input required autoFocus type="number" max={displayUsableBalance} placeholder="0.00" className="w-full bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold outline-none" value={fundAmount} onChange={e => setFundAmount(e.target.value)} />
              </div>
              <button type="submit" className="w-full bg-primary text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95">Confirm Transfer</button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
