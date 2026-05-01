import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Target,
  Settings,
  Search,
  Bell,
  User,
  ChevronRight,
  PieChart,
  UserCircle,
  Users,
  Wallet,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { api } from '../lib/api';
import { useTranslation } from '../lib/LanguageContext';

type Tab = 'dashboard' | 'plan' | 'goals' | 'settings_roundup' | 'settings_profile' | 'settings_dependents' | 'settings_income';

interface AppShellProps {
  children: React.ReactNode;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  onLogout: () => void;
}

export const AppShell = ({ children, activeTab, setActiveTab, onLogout }: AppShellProps) => {
  const { t, language } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState(() => localStorage.getItem('user_name') || 'Financial Explorer');
  const [userImage, setUserImage] = useState(() => localStorage.getItem('user_image') || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop');

  const isSettings = activeTab.startsWith('settings');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await api.get('/user');
        if (user && user.name) {
          setUserName(user.name);
          localStorage.setItem('user_name', user.name);
          if (user.avatar) {
              setUserImage(user.avatar);
              localStorage.setItem('user_image', user.avatar);
          }
        }
      } catch (err) {
        console.error('Failed to sync user data', err);
      }
    };

    fetchUserData();

    const handleStorage = () => {
        setUserName(localStorage.getItem('user_name') || 'Financial Explorer');
        setUserImage(localStorage.getItem('user_image') || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const mainMenuItems = [
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'plan', label: t('plan'), icon: Target },
    { id: 'goals', label: t('goals') || 'Goals', icon: PieChart },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const settingsMenuItems = [
    { id: 'settings_profile', label: t('profile'), icon: UserCircle },
    { id: 'settings_roundup', label: t('roundup'), icon: Zap },
    { id: 'settings_dependents', label: t('dependents'), icon: Users },
    { id: 'settings_income', label: t('income_sources'), icon: Wallet },
  ];

  const currentMainTab = isSettings ? 'settings' : activeTab;

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-sm border border-slate-50">
           <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
        </div>
        <div>
          <h1 className="font-black text-slate-900 leading-none tracking-tight">The White Coin</h1>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {mainMenuItems.map((item) => (
          <button
            key={item.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const targetTab = item.id === 'settings' ? 'settings_profile' : item.id as Tab;
              setActiveTab(targetTab);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
              currentMainTab === item.id
                ? 'bg-[#E6F1F0] text-primary'
                : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            <item.icon size={20} />
            <span>{item.label}</span>
            {currentMainTab === item.id && item.id !== 'settings' && (
              <div className={`${language === 'Arabic' ? 'mr-auto' : 'ml-auto'} w-1 h-4 bg-primary rounded-full`} />
            )}
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-50">
        <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl bg-slate-50">
            <div className="w-8 h-8 rounded-full border border-white overflow-hidden bg-white flex items-center justify-center">
                <img
                  src={userImage}
                  className="w-full h-full object-cover"
                  alt="User"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/logo.png';
                  }}
                />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{userName}</p>
                <p className="text-[10px] text-slate-400 font-medium">Premium Plan</p>
            </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 text-slate-400 hover:text-red-500 transition-colors text-sm font-medium w-full"
        >
          <X size={18} />
          <span>{t('sign_out')}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className={`min-h-screen bg-[#F8FAFB] flex flex-col lg:flex-row ${language === 'Arabic' ? 'font-display' : ''}`}>
      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-white border-b border-slate-100 px-4 flex items-center justify-between sticky top-0 z-[100]">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-slate-50">
              <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
           </div>
           <span className="font-black text-slate-900 text-sm">The White Coin</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-500 hover:text-primary transition-colors"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar (Desktop) */}
      <aside className={`hidden lg:flex w-64 bg-white flex-col shrink-0 ${language === 'Arabic' ? 'border-l' : 'border-r'} border-slate-100`}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-[90]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: language === 'Arabic' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'Arabic' ? '100%' : '-100%' }}
              className={`absolute top-0 ${language === 'Arabic' ? 'right-0' : 'left-0'} bottom-0 w-72 bg-white flex flex-col shadow-2xl`}
            >
               <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Settings Sub-Sidebar (Desktop/Mobile) */}
      {isSettings && (
        <aside className={`hidden lg:flex w-48 bg-[#F8FAFB] flex-col shrink-0 pt-8 ${language === 'Arabic' ? 'border-l' : 'border-r'} border-slate-100`}>
          <div className="px-6 mb-6">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('settings')}</h2>
          </div>
          <nav className="px-3 space-y-1">
            {settingsMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-medium text-[13px] ${
                  activeTab === item.id
                    ? 'bg-white text-primary shadow-sm border border-slate-100'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      )}

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Desktop) */}
        <header className="hidden lg:flex h-20 bg-white/80 backdrop-blur-sm border-b border-slate-100 px-8 items-center justify-between sticky top-0 z-10">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className={`absolute ${language === 'Arabic' ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors`} size={18} />
              <input
                type="text"
                placeholder="Search..."
                className={`w-full bg-[#F1F5F9] border-none rounded-2xl py-3 ${language === 'Arabic' ? 'pr-12 pl-4' : 'pl-12 pr-4'} text-sm focus:ring-2 focus:ring-primary/20 transition-all`}
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={22} />
              <span className={`absolute top-2 ${language === 'Arabic' ? 'left-2' : 'right-2'} w-2 h-2 bg-red-500 rounded-full border-2 border-white`}></span>
            </button>
            <div className={`flex items-center gap-3 ${language === 'Arabic' ? 'pr-6 border-r' : 'pl-6 border-l'} border-slate-100`}>
              <div className={`hidden sm:block ${language === 'Arabic' ? 'text-left' : 'text-right'}`}>
                <p className="text-sm font-bold text-slate-900 leading-none">{userName}</p>
                <p className="text-[10px] font-bold text-primary uppercase tracking-tighter mt-1">Premium Member</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-slate-50 flex items-center justify-center">
                <img
                  src={userImage}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/assets/logo.png';
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Sub-Navigation (if in settings) */}
        {isSettings && (
          <div className="lg:hidden bg-white border-b border-slate-100 px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar scroll-smooth">
            {settingsMenuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as Tab)}
                className={`whitespace-nowrap flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  activeTab === item.id
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <item.icon size={14} />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden h-20 bg-white border-t border-slate-100 px-6 flex items-center justify-around sticky bottom-0 z-[100] pb-safe">
         {mainMenuItems.map((item) => (
           <button
             key={item.id}
             onClick={(e) => {
               e.preventDefault();
               e.stopPropagation();
               const targetTab = item.id === 'settings' ? 'settings_profile' : item.id as Tab;
               setActiveTab(targetTab);
             }}
             className={`flex flex-col items-center gap-1 transition-all ${
               currentMainTab === item.id ? 'text-primary' : 'text-slate-400'
             }`}
           >
             <item.icon size={24} className={currentMainTab === item.id ? 'scale-110' : ''} />
             <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
             {currentMainTab === item.id && (
                <motion.div layoutId="mobileTabIndicator" className="w-1 h-1 bg-primary rounded-full mt-0.5" />
             )}
           </button>
         ))}
      </div>
    </div>
  );
};

