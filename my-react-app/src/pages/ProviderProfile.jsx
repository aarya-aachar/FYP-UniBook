import { useState, useEffect } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import AdminTopHeader from '../components/AdminTopHeader';
import { useAdminTheme } from '../context/AdminThemeContext';
import api from '../services/api';
import { User, Lock, Save, CheckCircle, AlertCircle, Sun, Moon } from 'lucide-react';

const ProviderProfile = () => {
  const { adminTheme, setAdminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [message, setMessage]   = useState(null);
  const [error, setError]       = useState(null);
  
  const [form, setForm] = useState({
    name: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    document.title = 'My Profile | Provider Portal';
    api.get('/auth/me')
      .then(res => {
        setProfile(res.data);
        setForm(prev => ({ ...prev, name: res.data.name || '' }));
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      setSaving(true);
      const res = await api.post('/auth/profile/update', form);
      setMessage(res.data.message);
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const textPrimary   = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg        = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
  const inputCls      = `w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'}`;
  const labelCls      = `block text-xs font-black uppercase tracking-widest mb-2 ${textSecondary}`;

  return (
    <div className="flex min-h-screen font-inter transition-colors duration-300" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <ProviderSidebar isDark={isDark} />

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        <AdminTopHeader 
            title="My Profile"
            subtitle="Manage your personal account details and security"
        />

        {loading ? (
          <div className="space-y-4">
            <div className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 grid lg:grid-cols-2 gap-6 w-full">
            <form onSubmit={handleSave} className={`rounded-3xl border p-8 flex flex-col h-full ${cardBg}`}>
              
              {/* Profile Details */}
              <div className="mb-8">
                <div className="flex flex-col items-center mb-8">
                   <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-4 transition-colors ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                      <User className="w-10 h-10" />
                   </div>
                   <h3 className={`text-xl font-black transition-colors ${textPrimary}`}>{profile?.name}</h3>
                   <p className={`text-sm font-medium transition-colors ${textSecondary}`}>{profile?.email}</p>
                </div>
                
                <h2 className={`text-sm font-black uppercase tracking-widest mb-5 transition-colors ${textSecondary}`}>Personal Details</h2>
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}><User className="inline w-3 h-3 mr-1" />Full Name</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} className={inputCls} placeholder="Your full name" required />
                  </div>
                </div>
              </div>

              {/* Password Section */}
              <div className="mb-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex-1">
                <h2 className={`text-sm font-black uppercase tracking-widest mb-5 transition-colors ${textSecondary}`}>Change Password</h2>
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}><Lock className="inline w-3 h-3 mr-1" />Current Password</label>
                    <input type="password" value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)} className={inputCls} placeholder="Required to save any changes" required />
                  </div>
                  <div>
                    <label className={labelCls}><Lock className="inline w-3 h-3 mr-1" />New Password</label>
                    <input type="password" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} className={inputCls} placeholder="Leave blank to keep current password" />
                  </div>
                </div>
              </div>

              {message && (
                <div className="mb-6 flex items-center justify-center gap-2 text-sm font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-4 py-3 rounded-xl animate-in fade-in">
                  <CheckCircle className="w-4 h-4" /> {message}
                </div>
              )}

              {error && (
                <div className="mb-6 flex items-center justify-center gap-2 text-sm font-bold text-rose-600 bg-rose-50 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/20 px-4 py-3 rounded-xl animate-in fade-in">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <button type="submit" disabled={saving}
                className={`w-full py-4 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:opacity-90 mt-auto ${saving ? 'opacity-60' : ''}`}>
                <Save className="w-5 h-5" /> {saving ? 'Saving Profile...' : 'Save Profile Details'}
              </button>
            </form>

            <div className={`rounded-3xl border p-8 flex flex-col h-full ${cardBg}`}>
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className={`text-base font-black uppercase tracking-widest transition-colors ${textSecondary}`}>Interface Preferences</h3>
                </div>
                
                <p className={`text-sm mb-6 transition-colors ${textSecondary}`}>Choose a theme style for the administrative and provider dashboard layout. This choice is linked locally.</p>
                
                <div className="grid grid-cols-2 gap-4">
                    <button type="button" onClick={() => setAdminTheme('light')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all cursor-pointer ${!isDark ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500 shadow-sm' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'} h-32`}>
                       <Sun className={`w-8 h-8 ${!isDark ? 'text-emerald-600' : 'text-slate-500'}`}/>
                       <span className={`text-xs font-bold uppercase tracking-wider ${!isDark ? 'text-emerald-700' : 'text-slate-400'}`}>Light Theme</span>
                    </button>
                    <button type="button" onClick={() => setAdminTheme('dark')} className={`flex flex-col items-center justify-center gap-3 p-6 rounded-xl border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-emerald-500/50 ring-2 ring-emerald-500 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'} h-32`}>
                       <Moon className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-slate-400'}`}/>
                       <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-slate-500'}`}>Dark Theme</span>
                    </button>
                </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
