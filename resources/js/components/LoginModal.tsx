import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

export const LoginModal = ({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', { email, password });
      localStorage.setItem('auth_token', res.access_token);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[32px] sm:rounded-[40px] shadow-2xl p-6 sm:p-10 border border-zinc-100 overflow-hidden"
          >
             {/* Decorative */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
             
            <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-600 transition-colors">
              <X size={24} />
            </button>

            <div className="text-center mb-10">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-primary text-3xl">lock</span>
              </div>
              <h2 className="text-3xl font-display font-black text-zinc-900 mb-2">Welcome Back</h2>
              <p className="text-zinc-500 font-medium">Log in to manage your wealth.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com" 
                    className="w-full pl-14 pr-6 py-5 bg-zinc-50 border-2 border-transparent focus:border-primary/20 rounded-3xl transition-all font-bold text-zinc-800"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-300" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full pl-14 pr-6 py-5 bg-zinc-50 border-2 border-transparent focus:border-primary/20 rounded-3xl transition-all font-bold text-zinc-800"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-5 rounded-3xl font-black text-xl shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Log In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm font-bold text-zinc-400">
                Don't have an account? <button className="text-primary hover:underline">Get Started</button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
