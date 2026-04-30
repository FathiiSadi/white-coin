import React, { useState, useEffect } from 'react';
import { 
  User, 
  ChevronDown,
  Camera,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../lib/api';

import { useTranslation } from '../lib/LanguageContext';

export const ProfileSettings = () => {
  const { t, language: currentLang, setLanguage: setGlobalLang } = useTranslation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    language: currentLang,
    currency: 'SAR (﷼)',
    theme: 'light',
    imageUrl: localStorage.getItem('user_image') || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop'
  });

  useEffect(() => {
    fetchProfile();
    const isDark = document.documentElement.classList.contains('dark');
    setFormData(prev => ({ ...prev, theme: isDark ? 'dark' : 'light' }));
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await api.get('/user');
      setUser(data);
      setFormData({
        name: localStorage.getItem('user_name') || data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        language: (data.language as 'English' | 'Arabic') || currentLang,
        currency: data.currency || 'SAR (﷼)',
        theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
        imageUrl: localStorage.getItem('user_image') || data.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop'
      });
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const toggleTheme = () => {
    const newTheme = formData.theme === 'light' ? 'dark' : 'light';
    setFormData({ ...formData, theme: newTheme });
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSave = async () => {
    if (!validate()) return;
    
    setSaving(true);
    setStatus(null);
    try {
      await api.put('/user', {
        name: formData.name,
        phone: formData.phone,
        language: formData.language,
        currency: formData.currency
      });
      
      // Update global language if changed
      setGlobalLang(formData.language as 'English' | 'Arabic');
      
      // Update localStorage for navbar
      localStorage.setItem('user_name', formData.name);
      localStorage.setItem('user_image', formData.imageUrl);
      window.dispatchEvent(new Event('storage')); // Trigger update in other components

      setStatus({ type: 'success', message: 'Your profile has been updated successfully.' });
      
      // Clear success message after 3 seconds
      setTimeout(() => setStatus(null), 3000);
    } catch (err: any) {
      console.error('Failed to update profile', err);
      setStatus({ type: 'error', message: err.message || 'Failed to update profile. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  const arabCurrencies = [
    { code: 'SAR', symbol: '﷼', name: 'Saudi Riyal' },
    { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
    { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar' },
    { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar' },
    { code: 'OMR', symbol: 'ر.ع.', name: 'Omani Rial' },
    { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal' },
    { code: 'JOD', symbol: 'د.أ', name: 'Jordanian Dinar' },
    { code: 'EGP', symbol: 'ج.م', name: 'Egyptian Pound' },
    { code: 'LBP', symbol: 'ل.ل', name: 'Lebanese Pound' },
    { code: 'IQD', symbol: 'ع.د', name: 'Iraqi Dinar' },
    { code: 'LYD', symbol: 'ل.د', name: 'Libyan Dinar' },
    { code: 'MAD', symbol: 'د.م.', name: 'Moroccan Dirham' },
    { code: 'TND', symbol: 'د.ت', name: 'Tunisian Dinar' },
    { code: 'DZD', symbol: 'د.ج', name: 'Algerian Dinar' },
  ];

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('settings')}</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your identity and app preferences.</p>
        </div>
      </div>

      {status && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl flex items-center gap-3 font-bold text-sm ${
            status.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
          }`}
        >
          {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {status.message}
        </motion.div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900 text-xl tracking-tight">{t('profile')}</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Profile Information</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
               <img 
                 src={formData.imageUrl} 
                 className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-50 shadow-sm"
               />
               <button className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={18} />
               </button>
             </div>
          </div>
        </div>

        <div className="p-10 space-y-10">
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Profile Image URL</label>
            <div className="flex gap-4">
               <input 
                 className="flex-1 bg-[#F8FAFB] border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 transition-all outline-none"
                 value={formData.imageUrl}
                 onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                 placeholder="https://images.unsplash.com/..."
               />
               <button 
                 onClick={() => setFormData({...formData, imageUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop'})}
                 className="px-6 py-4 bg-slate-100 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-colors"
               >
                 Use Default
               </button>
            </div>
          </div>
          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">{t('name') || 'Name'}</label>
              <input 
                className={`w-full bg-[#F8FAFB] border-2 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 transition-all outline-none ${errors.name ? 'border-red-100 bg-red-50/30' : 'border-transparent focus:border-primary/20'}`}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <p className="text-[10px] text-red-500 font-bold pl-4">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Email Address</label>
              <input 
                className="w-full bg-slate-50 border-2 border-transparent rounded-2xl px-6 py-4 text-sm font-bold text-slate-400 cursor-not-allowed outline-none"
                value={formData.email}
                readOnly
              />
              <p className="text-[10px] font-bold text-slate-300 pl-4">Verified Account</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Phone Number</label>
              <input 
                className="w-full bg-[#F8FAFB] border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 transition-all outline-none"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">System Language</label>
              <div className="relative">
                <select 
                  className="w-full bg-[#F8FAFB] border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 transition-all outline-none appearance-none cursor-pointer"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value as 'English' | 'Arabic' })}
                >
                  <option value="English">English</option>
                  <option value="Arabic">Arabic</option>
                </select>
                <ChevronDown className={`absolute ${currentLang === 'Arabic' ? 'left-6' : 'right-6'} top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none`} size={18} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Base Currency</label>
              <div className="relative">
                <select 
                  className="w-full bg-[#F8FAFB] border-2 border-transparent focus:border-primary/20 rounded-2xl px-6 py-4 text-sm font-bold text-slate-800 transition-all outline-none appearance-none cursor-pointer"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                >
                  {arabCurrencies.map(c => (
                    <option key={c.code} value={`${c.code} (${c.symbol})`}>
                      {c.code} ({c.symbol}) - {c.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="pt-10 border-t border-slate-50 space-y-6">
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-sm tracking-tight">Interface Theme</h4>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Choose between light and dark mode appearances.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer" 
                    checked={formData.theme === 'dark'}
                    onChange={toggleTheme}
                  />
                  <div className="w-12 h-7 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
             </div>
             
             <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-slate-900 text-sm tracking-tight">Security Alerts</h4>
                  <p className="text-xs font-bold text-slate-400 mt-0.5">Get notified about suspicious login attempts.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-12 h-7 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
             </div>
          </div>

          <div className="flex justify-end pt-6">
             <button 
               onClick={handleSave}
               disabled={saving}
               className={`px-12 py-5 rounded-[24px] font-black text-lg shadow-2xl transition-all active:scale-95 flex items-center gap-3 ${
                 saving ? 'bg-zinc-100 text-zinc-400' : 'bg-primary text-white shadow-primary/20 hover:bg-primary-hover'
               }`}
             >
               {saving && <Loader2 className="animate-spin" size={20} />}
               {saving ? 'Updating...' : 'Apply Changes'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
