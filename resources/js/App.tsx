import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { Onboarding } from './components/Onboarding';
import { AppShell } from './components/AppShell';
import { Dashboard } from './components/Dashboard';
import { FinancialPlan } from './components/FinancialPlan';
import { IncomeSources } from './components/IncomeSources';
import { Dependents } from './components/Dependents';
import { RoundUpSettings } from './components/RoundUpSettings';
import { ProfileSettings } from './components/ProfileSettings';

type AppState = 'landing' | 'onboarding' | 'app';
type Tab = 'dashboard' | 'plan' | 'settings_roundup' | 'settings_profile' | 'settings_dependents' | 'settings_income';

export default function App() {
  const [appState, setAppState] = useState<AppState>(
    localStorage.getItem('auth_token') ? 'app' : 'landing'
  );
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Simple scroll to top on state change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [appState]);

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setAppState('landing');
  };

  if (appState === 'landing') {
    return (
      <LandingPage 
        onGetStarted={() => setAppState('onboarding')} 
        onLoginSuccess={() => setAppState('app')}
      />
    );
  }

  if (appState === 'onboarding') {
    return <Onboarding onComplete={() => setAppState('app')} />;
  }

  return (
    <AppShell 
      activeTab={activeTab} 
      setActiveTab={setActiveTab} 
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && <Dashboard setActiveTab={setActiveTab} />}
      {activeTab === 'plan' && <FinancialPlan />}
      {activeTab === 'settings_roundup' && <RoundUpSettings />}
      {activeTab === 'settings_profile' && <ProfileSettings />}
      {activeTab === 'settings_dependents' && <Dependents />}
      {activeTab === 'settings_income' && <IncomeSources />}
    </AppShell>
  );
}
