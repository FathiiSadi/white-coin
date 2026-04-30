import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Trash2, 
  Users, 
  Loader2,
  Calendar,
  User,
  Heart,
  Baby
} from 'lucide-react';
import { api } from '../lib/api';
import { useTranslation } from '../lib/LanguageContext';

export const Dependents = () => {
  const { t } = useTranslation();
  const [dependents, setDependents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    relationship: 'Child',
    date_of_birth: '',
    notes: ''
  });

  useEffect(() => {
    fetchDependents();
  }, []);

  const fetchDependents = async () => {
    try {
      const data = await api.get('/dependents');
      setDependents(data);
    } catch (err) {
      console.error('Failed to fetch dependents', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.date_of_birth) return;
    setSubmitting(true);
    try {
      await api.post('/dependents', formData);
      setShowAdd(false);
      setFormData({
        name: '',
        relationship: 'Child',
        date_of_birth: '',
        notes: ''
      });
      fetchDependents();
    } catch (err) {
      console.error('Failed to add dependent', err);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteDependent = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/dependents/${id}`);
      fetchDependents();
    } catch (err) {
      console.error('Failed to delete dependent', err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-primary" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{t('dependents')}</h1>
          <p className="text-slate-500 font-medium mt-1">{t('manage_family')}</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 hover:bg-primary-hover transition-all active:scale-95 shadow-xl shadow-primary/20"
        >
          <Plus size={20} strokeWidth={3} />
          <span>{t('add_dependent')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dependents.length === 0 ? (
          <div className="col-span-full bg-white rounded-[40px] border-2 border-dashed border-slate-100 p-12 text-center">
             <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Users size={32} />
             </div>
             <h3 className="font-bold text-slate-900 mb-1">No dependents yet</h3>
             <p className="text-slate-400 text-sm font-medium">Add your family members to factor them into your plan.</p>
          </div>
        ) : dependents.map((dep) => (
          <div key={dep.id} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-md transition-all group">
             <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                   {dep.relationship === 'Child' ? <Baby size={24} /> : <User size={24} />}
                </div>
                <button 
                  onClick={() => deleteDependent(dep.id)}
                  className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                   <Trash2 size={18} />
                </button>
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 mb-1">{dep.name}</h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">{t(dep.relationship.toLowerCase()) || dep.relationship}</p>
                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full uppercase tracking-tighter w-fit">
                    <Calendar size={10} />
                    {dep.date_of_birth}
                </div>
             </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
           <div className="bg-white w-full max-w-lg rounded-[48px] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
              
              <h2 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">{t('add_dependent')}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">{t('full_name')}</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Sarah Sterling"
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">{t('relationship')}</label>
                       <select 
                         className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                         value={formData.relationship}
                         onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                       >
                          <option value="Child">{t('child')}</option>
                          <option value="Spouse">{t('spouse')}</option>
                          <option value="Parent">{t('parent')}</option>
                          <option value="Other">{t('other')}</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">{t('dob')}</label>
                       <input 
                         type="date" 
                         required
                         className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-slate-900 outline-none transition-all"
                         value={formData.date_of_birth}
                         onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                       />
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[11px] font-black uppercase text-zinc-400 tracking-widest pl-4 block">Notes (Optional)</label>
                    <textarea 
                      className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 rounded-2xl font-bold text-slate-900 outline-none transition-all resize-none h-32"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder="Any additional details..."
                    />
                 </div>

                 <div className="flex gap-4 mt-10">
                    <button 
                      type="button"
                      onClick={() => setShowAdd(false)}
                      className="flex-1 py-5 font-black text-slate-400 hover:text-slate-600 transition-colors"
                    >
                       {t('cancel')}
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="flex-[2] bg-primary text-white py-5 rounded-[28px] font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary-hover transition-all active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none"
                    >
                       {submitting ? t('saving') : t('save')}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};
