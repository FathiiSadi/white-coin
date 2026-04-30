import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Wallet, 
  ShieldCheck, 
  Smartphone,
  Check,
  TrendingUp,
  Target,
  Mail,
  User,
  Lock,
  DollarSign
} from 'lucide-react';
import { api } from '../lib/api';

export const Onboarding = ({ onComplete }: { onComplete: () => void }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    monthly_income: '',
    monthly_expenses: '',
    savings_goal_name: '',
    savings_goal_amount: '',
    consent_open_banking: false,
    bank_balance: '12450.75', // Dummy Open Banking data
  });

  const totalSteps = 4;

  const validateStep = async () => {
    const newErrors: Record<string, string> = {};
    
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Name is required';
      if (!formData.email) newErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
      if (!formData.password) newErrors.password = 'Password is required';
      else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';

      if (Object.keys(newErrors).length === 0) {
        setLoading(true);
        try {
          await api.post('/check-email', { email: formData.email });
        } catch (err: any) {
          newErrors.email = 'This email has already been taken.';
        } finally {
          setLoading(false);
        }
      }
    } else if (step === 2) {
      if (!formData.monthly_income) newErrors.monthly_income = 'Income is required';
      if (!formData.monthly_expenses) newErrors.monthly_expenses = 'Expenses are required';
      if (!formData.consent_open_banking) newErrors.consent_open_banking = 'Consent is required to continue';
    } else if (step === 3) {
      if (!formData.savings_goal_name) newErrors.savings_goal_name = 'Goal name is required';
      if (!formData.savings_goal_amount) newErrors.savings_goal_amount = 'Goal amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleFinalize();
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      let token = localStorage.getItem('auth_token');

      // 1. Register User only if not already logged in
      if (!token) {
        const authRes = await api.post('/register', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password
        });
        token = authRes.access_token;
        localStorage.setItem('auth_token', token as string);
      }

      // 2. Save Financial Profile
      await Promise.all([
        api.post('/income-sources', {
          name: 'Primary Income',
          type: 'Salary',
          amount: parseFloat(formData.monthly_income),
          frequency: 'Monthly',
          start_date: new Date().toISOString().split('T')[0]
        }),
        api.post('/savings-goals', {
          name: formData.savings_goal_name,
          target_amount: parseFloat(formData.savings_goal_amount),
          current_amount: 0
        })
      ]);

      onComplete();
    } catch (err: any) {
        console.error('Finalization failed', err);
        const message = err.errors ? Object.values(err.errors).flat()[0] : (err.message || 'An error occurred during registration');
        setErrors({ general: message as string });
        
        // If it's a validation error from register (unlikely if checkEmail worked, but for safety)
        if (err.errors && err.errors.email) {
          setStep(1);
          setErrors({ email: err.errors.email[0] });
        }
    } finally {
        setLoading(false);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFB] flex flex-col justify-center items-center px-4 py-12 sm:py-20 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary/5 rounded-full blur-[80px] sm:blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-secondary/5 rounded-full blur-[80px] sm:blur-[120px] translate-y-1/2 -translate-x-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full pointer-events-none opacity-20">
         <div className="w-full h-full bg-[radial-gradient(#006D5B_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="max-w-xl w-full relative z-10">
        {/* Progress Stepper */}
        <div className="flex justify-between items-center mb-8 sm:mb-12 relative px-4">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-white -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute top-1/2 left-4 h-1 bg-primary -translate-y-1/2 z-0 transition-all duration-500 rounded-full shadow-[0_0_15px_rgba(0,109,91,0.3)]" 
            style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}
          />
          
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s} 
              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center font-display font-black text-xs sm:text-sm z-10 transition-all duration-500 ${
                s <= step ? 'bg-primary text-white scale-110 shadow-xl shadow-primary/30' : 'bg-white text-zinc-300 border border-zinc-100 shadow-sm'
              }`}
            >
              {s < step ? <Check size={18} strokeWidth={3} /> : s}
            </div>
          ))}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.05, y: -20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-white rounded-[32px] sm:rounded-[48px] p-6 sm:p-14 border border-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] relative overflow-hidden"
          >
             {/* Decorative element */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />

            {step === 1 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-[36px] flex items-center justify-center mx-auto mb-6 transform rotate-6 hover:rotate-0 transition-transform duration-500">
                    <User size={48} className="text-primary" />
                  </div>
                  <h2 className="text-4xl font-display font-black text-zinc-900 mb-2 tracking-tight">Create Profile</h2>
                  <p className="text-zinc-500 font-medium leading-relaxed">Let's set up your personalized account.</p>
                </div>
                
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Full Name</label>
                    <div className="relative">
                      <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" />
                      <input 
                        type="text" 
                        placeholder="e.g. Alex Anderson" 
                        className={`w-full pl-14 pr-6 py-5 bg-zinc-50 border-2 rounded-3xl focus:ring-0 transition-all font-bold text-zinc-800 ${errors.name ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-primary/20'}`}
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    {errors.name && <p className="text-[10px] text-red-500 font-bold pl-4">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Email Address</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" />
                      <input 
                        type="email" 
                        placeholder="alex@example.com" 
                        className={`w-full pl-14 pr-6 py-5 bg-zinc-50 border-2 rounded-3xl focus:ring-0 transition-all font-bold text-zinc-800 ${errors.email ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-primary/20'}`}
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 font-bold pl-4">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" />
                      <input 
                        type="password" 
                        placeholder="••••••••" 
                        className={`w-full pl-14 pr-6 py-5 bg-zinc-50 border-2 rounded-3xl focus:ring-0 transition-all font-bold text-zinc-800 ${errors.password ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-primary/20'}`}
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                      />
                    </div>
                    {errors.password && <p className="text-[10px] text-red-500 font-bold pl-4">{errors.password}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-secondary/10 rounded-[36px] flex items-center justify-center mx-auto mb-6 transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                    <TrendingUp size={48} className="text-secondary" />
                  </div>
                  <h2 className="text-4xl font-display font-black text-zinc-900 mb-2 tracking-tight">Financial Profile</h2>
                  <p className="text-zinc-500 font-medium leading-relaxed">Help us understand your monthly cash flow.</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Estimated Monthly Income</label>
                    <div className="relative">
                      <DollarSign size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        className={`w-full pl-14 pr-6 py-5 bg-zinc-50 border-2 rounded-3xl focus:ring-0 transition-all font-bold text-2xl text-primary ${errors.monthly_income ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-primary/20'}`}
                        value={formData.monthly_income}
                        onChange={(e) => setFormData({...formData, monthly_income: e.target.value})}
                      />
                    </div>
                    {errors.monthly_income && <p className="text-[10px] text-red-500 font-bold pl-4">{errors.monthly_income}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Estimated Monthly Expenses</label>
                    <div className="relative">
                      <DollarSign size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        className={`w-full pl-14 pr-6 py-5 bg-zinc-50 border-2 rounded-3xl focus:ring-0 transition-all font-bold text-2xl text-accent ${errors.monthly_expenses ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-primary/20'}`}
                        value={formData.monthly_expenses}
                        onChange={(e) => setFormData({...formData, monthly_expenses: e.target.value})}
                      />
                    </div>
                    {errors.monthly_expenses && <p className="text-[10px] text-red-500 font-bold pl-4">{errors.monthly_expenses}</p>}
                  </div>

                  <div className="pt-4">
                    <label className="flex items-start gap-4 p-6 bg-zinc-50 rounded-[32px] border-2 border-transparent hover:border-primary/20 transition-all cursor-pointer group">
                      <div className="relative flex items-center justify-center mt-1">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={formData.consent_open_banking}
                          onChange={(e) => setFormData({...formData, consent_open_banking: e.target.checked})}
                        />
                        <div className="w-6 h-6 border-2 border-zinc-200 rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center">
                          <Check size={14} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={4} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-zinc-800 mb-1">Enable Open Banking Integration</p>
                        <p className="text-xs font-medium text-zinc-500 leading-relaxed">
                          I agree to securely connect my bank accounts. The White Coin will automatically sync my overall balance and transactions (Current Balance: <span className="text-primary font-bold">${formData.bank_balance}</span>).
                        </p>
                      </div>
                    </label>
                    {errors.consent_open_banking && <p className="text-[10px] text-red-500 font-bold pl-4 mt-2">{errors.consent_open_banking}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/10 rounded-[36px] flex items-center justify-center mx-auto mb-6">
                    <Target size={48} className="text-primary" />
                  </div>
                  <h2 className="text-4xl font-display font-black text-zinc-900 mb-2 tracking-tight">Savings Goal</h2>
                  <p className="text-zinc-500 font-medium leading-relaxed">What are you working towards right now?</p>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Goal Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. New Tesla, Emergency Fund" 
                      className={`w-full px-8 py-5 bg-zinc-50 border-2 rounded-3xl focus:ring-0 transition-all font-bold text-zinc-800 ${errors.savings_goal_name ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-primary/20'}`}
                      value={formData.savings_goal_name}
                      onChange={(e) => setFormData({...formData, savings_goal_name: e.target.value})}
                    />
                    {errors.savings_goal_name && <p className="text-[10px] text-red-500 font-bold pl-4">{errors.savings_goal_name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Target Amount</label>
                    <div className="relative">
                      <DollarSign size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        className={`w-full pl-14 pr-6 py-5 bg-zinc-50 border-2 rounded-3xl focus:ring-0 transition-all font-bold text-2xl text-primary ${errors.savings_goal_amount ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-primary/20'}`}
                        value={formData.savings_goal_amount}
                        onChange={(e) => setFormData({...formData, savings_goal_amount: e.target.value})}
                      />
                    </div>
                    {errors.savings_goal_amount && <p className="text-[10px] text-red-500 font-bold pl-4">{errors.savings_goal_amount}</p>}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-8">
                <div className="w-32 h-32 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-8 relative">
                   <motion.div 
                     initial={{ scale: 0 }}
                     animate={{ scale: 1 }}
                     transition={{ type: 'spring', damping: 12, delay: 0.2 }}
                     className="absolute inset-0 bg-primary/10 rounded-full"
                   />
                   <CheckCircle2 size={72} className="text-primary relative z-10" />
                </div>
                <h2 className="text-5xl font-display font-black text-zinc-900 mb-4 tracking-tight">You're ready!</h2>
                <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-sm mx-auto">
                  Welcome aboard, <span className="text-primary font-black italic">{formData.name.split(' ')[0]}</span>. Your financial journey begins now.
                </p>
                {errors.general && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-bold">
                    {errors.general}
                  </div>
                )}
              </div>
            )}

            <div className="mt-14 flex items-center gap-5">
              {step > 1 && (
                <button 
                  onClick={prevStep}
                  disabled={loading}
                  className="flex-1 py-5 font-black text-zinc-400 hover:text-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
              )}
              <button 
                onClick={nextStep}
                disabled={loading}
                className={`flex-[2] py-5 rounded-[28px] font-black text-xl shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${
                  loading ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed' : 'bg-primary text-white shadow-primary/30 hover:bg-primary-hover'
                }`}
              >
                <span>{loading ? 'Finalizing...' : step === 4 ? 'Let\'s Go!' : 'Continue'}</span>
                {!loading && <ArrowRight size={22} />}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>

        <p className="text-center mt-10 text-zinc-400 text-sm font-bold tracking-tight">
          Secure, Private & Powered by The White Coin AI
        </p>
      </div>
    </div>
  );
};
