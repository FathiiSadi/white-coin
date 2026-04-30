import React, { useState } from 'react';
import { Zap, ShieldCheck, TrendingUp, DollarSign } from 'lucide-react';
import { useTranslation } from '../lib/LanguageContext';

export const RoundUpSettings = () => {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState(true);
  const [roundTo, setRoundTo] = useState('1');

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('roundup_title')}</h1>
        <p className="text-slate-500 font-medium mt-1">{t('roundup_desc')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{t('enable_roundup')}</h3>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Activate automatic savings</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              <div className="w-12 h-7 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-200 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">
              {t('roundup_amount')}
            </label>
            <div className="grid grid-cols-4 gap-3">
              {['1', '2', '5'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setRoundTo(amount)}
                  className={`py-4 rounded-2xl font-bold transition-all ${
                    roundTo === amount 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  ${amount}.00
                </button>
              ))}
              <div className="relative">
                <input 
                  type="number"
                  placeholder="0.00"
                  className={`w-full py-4 px-4 rounded-2xl font-bold transition-all outline-none border-2 ${
                    !['1', '2', '5'].includes(roundTo)
                      ? 'bg-white border-primary text-primary shadow-lg shadow-primary/10'
                      : 'bg-slate-50 border-transparent text-slate-500'
                  }`}
                  value={!['1', '2', '5'].includes(roundTo) ? roundTo : ''}
                  onChange={(e) => setRoundTo(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-6 bg-primary/5 rounded-[32px] border border-primary/10">
             <div className="flex gap-4">
                <ShieldCheck className="text-primary shrink-0" size={20} />
                <p className="text-xs font-medium text-slate-600 leading-relaxed">
                   {t('emergency_fund_tip')}
                </p>
             </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center text-accent">
                  <TrendingUp size={20} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{t('projected_savings')}</h2>
             </div>
             <div className="space-y-2">
                <h3 className="text-4xl font-black text-slate-900">${(parseFloat(roundTo || '0') * 45).toFixed(2)}</h3>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">{t('estimated_per_month')}</p>
             </div>
             <div className="mt-8 pt-8 border-t border-slate-50">
                <p className="text-xs font-medium text-slate-500 leading-relaxed">
                   Based on your average of 45 transactions per month with a ${roundTo || '0'}.00 round-up setting.
                </p>
             </div>
          </div>

          <div className="bg-primary rounded-[40px] p-8 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
             <h4 className="font-bold mb-2">{t('did_you_know')}</h4>
             <p className="text-white/80 text-sm font-medium leading-relaxed">
                {t('roundup_tip')}
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};
