import { useState, useEffect, useRef } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import AdminTopHeader from '../components/AdminTopHeader';
import { useAdminTheme } from '../context/AdminThemeContext';
import api from '../services/api';
import { updateProfile, uploadProfilePhoto } from '../services/authService';
import { User, Lock, Save, CheckCircle, AlertCircle, Sun, Moon, FileText, Hash, ExternalLink, ShieldCheck, Camera } from 'lucide-react';

const BACKEND_URL = 'http://localhost:4001';

const ProviderProfile = () => {
  const { adminTheme, setAdminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const [profile, setProfile]     = useState(null);
  const [providerData, setProviderData] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [message, setMessage]     = useState(null);
  const [error, setError]         = useState(null);
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);
  
  const [form, setForm] = useState({
    name: '',
    currentPassword: '',
    newPassword: ''
  });

  useEffect(() => {
    document.title = 'My Profile | Provider Portal';
    Promise.all([
      api.get('/auth/me'),
      api.get('/provider/profile')
    ])
      .then(([userRes, provRes]) => {
        setProfile(userRes.data);
        setProviderData(provRes.data);
        setProfilePhoto(userRes.data.profile_photo || null);
        setForm(prev => ({ ...prev, name: userRes.data.name || '' }));
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
      const res = await updateProfile(form);  // updates localStorage automatically
      setMessage(res.message || 'Profile updated successfully!');
      // Notify sidebar of the name change
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { name: form.name } }));
      setForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
      setTimeout(() => setError(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadProfilePhoto(file);
      setProfilePhoto(res.profile_photo);
      setMessage("Profile photo updated!");
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setError(err.message || "Photo upload failed");
      setTimeout(() => setError(null), 3000);
    }
  };

  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const textPrimary   = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg        = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
  const inputCls      = `w-full px-4 py-3 rounded-xl border text-sm font-medium outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10'}`;
  const labelCls      = `block text-xs font-black uppercase tracking-widest mb-2 ${textSecondary}`;
  const innerCard     = isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200';

  return (
    <div className="flex min-h-screen font-inter transition-colors duration-300" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <ProviderSidebar isDark={isDark} />

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        <AdminTopHeader 
            title="My Profile"
            subtitle="Manage your account details, security settings and review your verified credentials"
        />

        {loading ? (
          <div className="space-y-4">
            <div className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
          </div>
        ) : (
          <div className="animate-in slide-in-from-bottom-4 duration-500 grid lg:grid-cols-3 gap-6 w-full">
            
            {/* Left: Edit Profile Form */}
            <form onSubmit={handleSave} className={`lg:col-span-2 rounded-3xl border p-8 flex flex-col h-full ${cardBg}`}>
              
              {/* Profile Details */}
              <div className="mb-8">
                <div className="flex flex-col items-center mb-8">
                   <div 
                     className="relative group cursor-pointer" 
                     onClick={() => photoInputRef.current?.click()}
                   >
                     <div className={`w-20 h-20 rounded-xl flex items-center justify-center mb-4 transition-all relative overflow-hidden border-2 ${isDark ? 'bg-emerald-500/10 border-slate-700' : 'bg-emerald-50 border-slate-100'}`}>
                        {profilePhoto ? (
                          <img 
                            src={`${BACKEND_URL}${profilePhoto}`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Camera className="w-5 h-5 text-white" />
                        </div>
                     </div>
                     <input 
                       type="file" 
                       ref={photoInputRef} 
                       onChange={handlePhotoUpload} 
                       accept="image/*" 
                       className="hidden" 
                     />
                   </div>
                   <h3 className={`text-xl font-black transition-colors ${textPrimary}`}>{profile?.name}</h3>
                   <p className={`text-sm font-medium transition-colors ${textSecondary}`}>{profile?.email}</p>
                   <span className={`mt-2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                     Verified Provider
                   </span>
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

            {/* Right: Verification Info + Theme */}
            <div className="flex flex-col gap-6">

              {/* Verification Card */}
              <div className={`rounded-3xl border p-6 flex flex-col ${cardBg}`}>
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-black uppercase tracking-widest ${textSecondary}`}>Verification Details</h3>
                    <p className={`text-[11px] font-medium ${textSecondary} opacity-70`}>Submitted during registration</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* PAN Number */}
                  <div className={`p-4 rounded-2xl border ${innerCard}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">PAN Number</span>
                    </div>
                    <p className={`text-base font-black tracking-wider mt-1 ${textPrimary}`}>
                      {providerData?.pan_number || (
                        <span className={`text-sm font-medium italic ${textSecondary}`}>Not provided</span>
                      )}
                    </p>
                  </div>

                  {/* Document */}
                  <div className={`p-4 rounded-2xl border ${innerCard}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className={`w-3.5 h-3.5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Identity Document</span>
                    </div>
                    
                    {providerData?.document_path ? (
                      <div className="space-y-3">
                        {/* Preview if it's an image */}
                        {/\.(jpg|jpeg|png|webp|gif)$/i.test(providerData.document_path) ? (
                          <img
                            src={providerData.document_path.startsWith('/') ? `${BACKEND_URL}${providerData.document_path}` : providerData.document_path}
                            alt="Verification Document"
                            className="w-full rounded-xl border object-cover max-h-40"
                          />
                        ) : (
                          <div className={`flex items-center gap-3 p-3 rounded-xl border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200 shadow-sm'}`}>
                            <FileText className={`w-8 h-8 ${isDark ? 'text-sky-400' : 'text-sky-500'}`} />
                            <div className="min-w-0 flex-1">
                              <p className={`text-xs font-bold truncate ${textPrimary}`}>{providerData.document_path.split('/').pop()}</p>
                              <p className={`text-[10px] ${textSecondary}`}>PDF / Document</p>
                            </div>
                          </div>
                        )}
                        <a
                          href={providerData.document_path.startsWith('/') ? `${BACKEND_URL}${providerData.document_path}` : providerData.document_path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer border
                            ${isDark ? 'bg-sky-500/10 border-sky-500/20 text-sky-400 hover:bg-sky-500/20' : 'bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100'}`}
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> View Full Document
                        </a>
                      </div>
                    ) : (
                      <p className={`text-sm font-medium italic ${textSecondary}`}>No document uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Theme Card */}
              <div className={`rounded-3xl border p-6 flex flex-col ${cardBg}`}>
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                  <h3 className={`text-sm font-black uppercase tracking-widest transition-colors ${textSecondary}`}>Theme</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setAdminTheme('light')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border transition-all cursor-pointer ${!isDark ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-500 shadow-sm' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'} h-28`}>
                       <Sun className={`w-7 h-7 ${!isDark ? 'text-emerald-600' : 'text-slate-500'}`}/>
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${!isDark ? 'text-emerald-700' : 'text-slate-400'}`}>Light</span>
                    </button>
                    <button type="button" onClick={() => setAdminTheme('dark')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-emerald-500/50 ring-2 ring-emerald-500 shadow-sm' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'} h-28`}>
                       <Moon className={`w-7 h-7 ${isDark ? 'text-emerald-400' : 'text-slate-400'}`}/>
                       <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-emerald-400' : 'text-slate-500'}`}>Dark</span>
                    </button>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderProfile;
