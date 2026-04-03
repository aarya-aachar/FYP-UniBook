import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { fetchFullProfile, updateProfile } from "../services/authService";
import { useUserTheme } from "../context/UserThemeContext";

const Profile = () => {
  const { userTheme, toggleUserTheme, setUserTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    age: "",
    gender: "Male",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  useEffect(() => {
    document.title = "User | Profile - UniBook";
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchFullProfile();
      setForm(f => ({
        ...f,
        name: data.name || "",
        email: data.email || "",
        age: data.age || "",
        gender: data.gender || "Male",
      }));
    } catch (err) {
      toast("Failed to load official profile data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.currentPassword) {
      toast("Current password is required to authorize changes", 'error');
      return;
    }

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast("New authorization keys do not match", 'error');
      return;
    }

    try {
      setUpdating(true);
      await updateProfile({
        name: form.name,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        age: form.age,
        gender: form.gender
      });
      
      toast("Identity and profile updated successfully!");
      setForm(f => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
    } catch (err) {
      toast(err.message || "Failed to sync profile changes", "error");
    } finally {
      setUpdating(false);
    }
  };

  const cardBase = isDark 
    ? "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl" 
    : "bg-white border border-slate-200 shadow-xl shadow-slate-200/50 hover:shadow-slate-300/60";

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-600";
  const inputBase = isDark 
    ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-blue-500" 
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white";

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      {/* Static Toast Notification */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-base font-bold pointer-events-auto transition-all duration-300
            ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}
            style={{ transform: 'translateX(0)', opacity: 1 }}>
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            {t.message}
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-500">
        {/* Ambient background glow */}
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <div className="max-w-7xl mx-auto w-full fade-in pt-4">
          
          {/* Header with simplified alignment */}
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b pb-8 transition-colors ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <h1 className={`text-4xl font-black mb-2 tracking-tight transition-colors ${textPrimary}`}>
                Profile Settings
              </h1>
              <p className={`text-lg transition-colors font-medium ${textSecondary} max-w-2xl leading-relaxed`}>
                Update your personal info, change your theme, and manage account security.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10 pb-20">
            
            {/* Identity Header Card: More Compact & Professional */}
            <div className={`rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden group transition-all duration-500 ${cardBase}`}>
               <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
               
               <div className="relative">
                 <div className="w-32 h-32 rounded-[2rem] p-1 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20">
                   <div className={`w-full h-full rounded-[2rem] overflow-hidden border-4 transition-colors ${isDark ? 'border-[#0f172a]' : 'border-white'}`}>
                     <img
                       src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                       alt="Profile"
                       className="w-full h-full object-cover"
                     />
                   </div>
                 </div>
               </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-4">
                     <h2 className={`text-3xl font-black tracking-tighter transition-colors ${textPrimary}`}>{form.name}</h2>
                     <span className={`px-4 py-1 rounded-full border transition-all text-xs font-black uppercase tracking-widest w-max mx-auto md:mx-0
                       ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>Verified User Access</span>
                  </div>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                     <div className={`px-5 py-2.5 rounded-2xl border transition-all flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-emerald-400' : 'bg-emerald-600'}`} />
                        <span className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Active Session</span>
                     </div>
                     <div className={`px-5 py-2.5 rounded-2xl border transition-all flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                        <span className="text-sm">🛡️</span>
                        <span className={`font-black text-xs uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Secure Account</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bento Grid: Simplified Grid Flow */}
            <div className="grid lg:grid-cols-2 gap-8 items-start">
               
               {/* 1. Account Core Card */}
               <div className={`rounded-[2.5rem] p-8 space-y-8 transition-all duration-500 ${cardBase}`}>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${isDark ? 'bg-blue-500/10' : 'bg-blue-50'}`}>👤</div>
                        <h3 className={`text-lg font-black uppercase tracking-[0.1em] transition-colors ${textPrimary}`}>Personal Details</h3>
                     </div>
                     <span className={`text-xs font-bold transition-colors ${textSecondary}`}>Required</span>
                  </div>

                  <div className="grid gap-6">
                     {[
                       { label: 'Full Name', name: 'name', type: 'text' },
                       { label: 'Email Address', name: 'email', type: 'email' },
                       { label: 'Specify Age', name: 'age', type: 'number' },
                     ].map((field) => (
                       <div key={field.name} className="space-y-2">
                         <label className={`block text-xs font-black uppercase tracking-widest ml-1 transition-colors ${textSecondary}`}>{field.label}</label>
                         <input
                           type={field.type}
                           name={field.name}
                           value={form[field.name]}
                           onChange={handleChange}
                           className={`w-full px-5 py-4 rounded-xl border font-bold transition-all outline-none text-sm ${inputBase}`}
                         />
                       </div>
                     ))}

                     <div className="space-y-2">
                       <label className={`block text-xs font-black uppercase tracking-widest ml-1 transition-colors ${textSecondary}`}>Gender Selection</label>
                       <select
                         name="gender"
                         value={form.gender}
                         onChange={handleChange}
                         className={`w-full px-5 py-4 rounded-xl border font-bold transition-all outline-none cursor-pointer text-sm ${inputBase}`}
                       >
                         <option className={isDark ? "bg-[#0f172a]" : "bg-white"}>Male</option>
                         <option className={isDark ? "bg-[#0f172a]" : "bg-white"}>Female</option>
                         <option className={isDark ? "bg-[#0f172a]" : "bg-white"}>Other</option>
                       </select>
                     </div>
                  </div>
               </div>

               {/* 2. Security Suite Card */}
               <div className={`rounded-[2.5rem] p-8 space-y-8 transition-all duration-500 ${cardBase}`}>
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${isDark ? 'bg-indigo-500/10' : 'bg-indigo-50'}`}>🛡️</div>
                        <h3 className={`text-lg font-black uppercase tracking-[0.1em] transition-colors ${textPrimary}`}>Security Settings</h3>
                     </div>
                     <span className={`text-xs font-bold text-rose-500/60 uppercase tracking-widest`}>Password Required</span>
                  </div>

                  <div className="grid gap-6">
                     {[
                       { label: 'Current Password', name: 'currentPassword' },
                       { label: 'New Password', name: 'newPassword' },
                       { label: 'Verify New Password', name: 'confirmPassword' },
                     ].map((field) => (
                       <div key={field.name} className="space-y-2">
                          <label className={`block text-xs font-black uppercase tracking-widest ml-1 transition-colors ${textSecondary}`}>{field.label}</label>
                          <input
                            type="password"
                            name={field.name}
                            placeholder="••••••••"
                            value={form[field.name]}
                            onChange={handleChange}
                            className={`w-full px-5 py-4 rounded-xl border font-bold transition-all outline-none text-sm ${inputBase}`}
                          />
                       </div>
                     ))}
                  </div>
                  
                  <div className={`p-4 rounded-xl border transition-all text-xs font-medium leading-relaxed ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                     Updating your password will refresh your session. Please make sure your new password is safe and secure.
                  </div>
               </div>

               {/* 3. Theme Preferences: Professional Full Width Integration */}
               <div className={`rounded-[2.5rem] p-8 transition-all duration-500 col-span-1 md:col-span-2 ${cardBase}`}>
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors ${isDark ? 'bg-amber-500/10' : 'bg-amber-50'}`}>✨</div>
                    <h3 className={`text-lg font-black uppercase tracking-[0.1em] transition-colors ${textPrimary}`}>App Theme</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <button type="button" onClick={() => setUserTheme('light')} className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all group ${!isDark ? 'bg-blue-50 border-blue-600 shadow-xl' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                         <span className={`text-4xl transition-transform duration-500 group-hover:rotate-12 ${!isDark ? 'grayscale-0' : 'grayscale'}`}>☀️</span>
                         <div className="text-left">
                            <span className={`block text-sm font-black uppercase tracking-[0.1em] ${!isDark ? 'text-blue-600' : 'text-white/40'}`}>Professional Light</span>
                            <p className={`text-xs font-medium transition-colors ${!isDark ? 'text-blue-600/60' : 'text-white/20'}`}>Use the light theme for better clarity during the day.</p>
                         </div>
                      </button>
                      <button type="button" onClick={() => setUserTheme('dark')} className={`flex items-center gap-6 p-6 rounded-2xl border-2 transition-all group ${isDark ? 'bg-blue-500/10 border-blue-500 shadow-xl shadow-blue-500/20' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                         <span className={`text-4xl transition-transform duration-500 group-hover:-rotate-12 ${isDark ? 'grayscale-0' : 'grayscale'}`}>🌙</span>
                         <div className="text-left">
                            <span className={`block text-sm font-black uppercase tracking-[0.1em] ${isDark ? 'text-blue-400' : 'text-white/40'}`}>Advanced Dark</span>
                            <p className={`text-xs font-medium transition-colors ${isDark ? 'text-blue-400/60' : 'text-white/20'}`}>Use the dark theme to reduce eye strain in low light.</p>
                         </div>
                      </button>
                  </div>
               </div>
            </div>

            {/* Enhanced Global Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-white/5">
               <div className="max-w-md text-center sm:text-left">
                  <p className={`text-sm font-bold font-inter transition-colors ${textPrimary}`}>Double-check your info before saving.</p>
                  <p className={`text-xs mt-1 transition-colors leading-relaxed ${textSecondary}`}>Saving your profile will refresh your active login across the entire UniBook system.</p>
               </div>
               <button
                 type="submit"
                 disabled={updating}
                 className={`px-12 py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] text-white transition-all shadow-2xl w-full sm:w-auto
                   ${updating ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98] hover:shadow-blue-500/30'}`}
               >
                 {updating ? 'Saving Info...' : 'Save Configuration →'}
               </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
