import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PieChart,
  TrendingUp,
  Wallet,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';

import { LoginModal } from './LoginModal';

export const LandingPage = ({ onGetStarted, onLoginSuccess }: { onGetStarted: () => void, onLoginSuccess: () => void }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isLoginOpen, setIsLoginOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center overflow-hidden shadow-sm">
                <img src="/assets/logo.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
              <span className="font-display font-black text-xl tracking-tight text-primary">The White Coin</span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors">How it Works</a>
              <a href="#pricing" className="text-sm font-medium text-zinc-600 hover:text-primary transition-colors">Pricing</a>
              <button
                onClick={() => setIsLoginOpen(true)}
                className="text-sm font-bold text-zinc-800 hover:text-primary transition-colors"
              >
                Log In
              </button>
              <button
                onClick={onGetStarted}
                className="bg-primary text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-primary-container transition-all active:scale-95"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden p-2 text-zinc-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-background border-b border-outline-variant/30 p-4 space-y-4"
          >
            <a href="#features" className="block text-sm font-medium text-zinc-600">Features</a>
            <a href="#how-it-works" className="block text-sm font-medium text-zinc-600">How it Works</a>
            <a href="#pricing" className="block text-sm font-medium text-zinc-600">Pricing</a>
            <button
              onClick={onGetStarted}
              className="w-full bg-primary text-white px-5 py-3 rounded-xl text-sm font-semibold"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-8">
              <Sparkles size={14} className="text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-wider">Meet your financial future</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-extrabold text-zinc-900 leading-[1.1] mb-6 px-4">
              Master Your Money with <br className="hidden sm:block" />
              <span className="text-primary italic">The White Coin</span>
            </h1>

            <p className="text-lg sm:text-xl text-zinc-600 max-w-2xl mx-auto mb-10 leading-relaxed font-medium px-4">
              The AI-first financial companion that analyzes your spending, helps you save, and builds a personalized plan for your goals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto bg-primary text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-xl shadow-primary/20 active:scale-95"
              >
               Register Now
                <ArrowRight size={20} />
              </button>
              <button className="w-full sm:w-auto px-8 py-4 rounded-2xl text-lg font-bold text-zinc-600 hover:bg-zinc-100 transition-all flex items-center justify-center gap-2">
                Watch Demo
              </button>
            </div>
          </motion.div>

          {/* Hero App Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 mx-auto max-w-5xl rounded-3xl overflow-hidden border border-zinc-200 shadow-2xl relative"
          >
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
              alt="Dashboard Preview"
              className="w-full grayscale h-auto opacity-90"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background to-transparent" />
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-primary/5">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-x-16 gap-y-10 text-center">
          {[
            { label: 'Active Users', value: '450k+' },
            { label: 'Saved per month', value: '$1.2B' },
            { label: 'AI Accuracy', value: '99.9%' },
            { label: 'Secure Accounts', value: '1.5M+' },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl font-display font-extrabold text-primary mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-extrabold text-zinc-900 mb-4">Why choose The White Coin?</h2>
            <p className="text-lg text-zinc-600 max-w-2xl mx-auto">Modern banking and AI-driven insights to help you reach financial freedom faster.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: 'auto_graph',
                title: 'Smart Budgeting',
                desc: 'AI analyzes your spending patterns to suggest realistic budgets that actually stick.',
                color: 'primary'
              },
              {
                icon: 'verified_user',
                title: 'Bank-Grade Security',
                desc: 'Your data is encrypted with 256-bit AES protection. We never store your credentials.',
                color: 'secondary'
              },
              {
                icon: 'psychology',
                title: 'AI Financial Advisor',
                desc: 'Receive personalized investment and savings advice powered by Gemini AI.',
                color: 'tertiary'
              },
              {
                icon: 'payments',
                title: 'Auto-Bill Tracking',
                desc: 'Never miss a payment again. We detect subscriptions and upcoming bills automatically.',
                color: 'primary'
              },
              {
                icon: 'account_balance',
                title: 'Multi-Bank Sync',
                desc: 'Connect all your accounts in one place for a holistic view of your net worth.',
                color: 'secondary'
              },
              {
                icon: 'target',
                title: 'Goal Milestones',
                desc: 'Set goals and let our AI calculate exactly how much you need to save each week.',
                color: 'tertiary'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-white border border-zinc-100 hover:border-primary/20 transition-all hover:shadow-xl group">
                <div className={`w-14 h-14 bg-${feature.color}/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <span className={`material-symbols-outlined text-3xl text-${feature.color}`}>{feature.icon}</span>
                </div>
                <h3 className="text-xl font-display font-bold text-zinc-900 mb-3">{feature.title}</h3>
                <p className="text-zinc-600 leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto bg-primary rounded-[32px] sm:rounded-[40px] p-8 sm:p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl shadow-primary/40">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />

          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-display font-extrabold mb-6 sm:mb-8 leading-tight">Ready to take control <br />of your money?</h2>
            <p className="text-lg sm:text-xl text-zinc-100/80 mb-8 sm:mb-12 max-w-2xl mx-auto font-medium">Join 450,000+ users building their financial future today with AI-powered coaching.</p>
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto bg-white text-primary px-10 py-4 sm:py-5 rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-extrabold hover:bg-zinc-100 transition-all active:scale-95"
            >
                Register Now
            </button>
            <p className="mt-6 text-xs sm:text-sm font-semibold text-white/60">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-zinc-50 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">savings</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-primary">The White Coin</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Empowering individuals to master their finances with secure, AI-driven insights. Built for the modern saver.
            </p>
          </div>
          <div>
            <h4 className="font-display font-bold text-zinc-900 mb-6">Product</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-500">
              <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">App Download</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-zinc-900 mb-6">Company</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-500">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold text-zinc-900 mb-6">Support</h4>
            <ul className="space-y-4 text-sm font-medium text-zinc-500">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Live Chat</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-zinc-200 text-center">
          <p className="text-sm font-medium text-zinc-400">© 2026 The White Coin. All rights reserved.</p>
        </div>
      </footer>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSuccess={onLoginSuccess}
      />
    </div>
  );
};
