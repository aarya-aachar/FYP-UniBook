import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useAdminTheme } from "../context/AdminThemeContext";

const AdminProfile = () => {
  const { adminTheme, setAdminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const [form, setForm] = useState({
    name: "",
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
    document.title = "Settings | Admin UniBook";
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get("http://localhost:4001/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setForm(f => ({ ...f, name: res.data.name }));
    } catch (err) {
      toast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) return toast("Current password is required", "error");
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return toast("Passwords do not match", "error");
    }

    try {
      setUpdating(true);
      const token = localStorage.getItem('token');
      await axios.post("http://localhost:4001/api/auth/profile/update", {
        name: form.name,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      toast("Profile updated successfully!");
      setForm(f => ({ ...f, currentPassword: "", newPassword: "", confirmPassword: "" }));
      fetchProfile();
    } catch (err) {
      toast(err.response?.data?.message || "Update failed", "error");
    } finally {
      setUpdating(false);
    }
  };

  const cardBase = isDark 
    ? "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl" 
    : "bg-white border border-slate-200 shadow-xl shadow-slate-200/20";

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-500";
  const inputBase = isDark 
    ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-blue-500" 
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white";

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-base font-bold pointer-events-auto
            ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}
            style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex min-h-screen transition-colors duration-500 font-inter" 
           style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Sidebar />
        
        <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div>
              <h1 className={`text-6xl font-black tracking-tighter mb-4 transition-colors font-outfit ${textPrimary}`}>Admin Settings</h1>
              <p className={`text-lg font-bold tracking-tight transition-colors ${textSecondary}`}>Manage your administrative profile and preferences</p>
            </div>
          </div>

          {loading ? (
            <div className={`h-96 rounded-[3.5rem] animate-pulse border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />
          ) : (
            <div className="grid gap-10 animate-in fade-in duration-700">
              
              <div className={`rounded-[3.5rem] p-12 flex flex-col md:flex-row items-center gap-12 transition-all duration-500 border relative overflow-hidden ${cardBase}`}
                   style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                 <div className="w-48 h-48 rounded-[3rem] bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-7xl shadow-2xl shadow-blue-500/30 relative z-10 transition-transform hover:scale-105 duration-500">👤</div>
                 <div className="flex-1 text-center md:text-left relative z-10">
                    <h2 className={`text-5xl font-black font-outfit tracking-tighter mb-2 ${textPrimary}`}>{user?.name}</h2>
                    <p className={`text-2xl font-bold opacity-60 mb-10 ${textSecondary}`}>{user?.email}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                       <div className={`px-8 py-4 rounded-3xl border transition-all flex flex-col ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-inner shadow-slate-200/10'}`}>
                          <span className={`text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-50 ${textSecondary}`}>Access Role</span>
                          <span className={`font-black text-sm uppercase tracking-widest ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>System Administrator</span>
                       </div>
                       <div className={`px-8 py-4 rounded-3xl border transition-all flex flex-col ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-inner shadow-slate-200/10'}`}>
                          <span className={`text-xs font-black uppercase tracking-[0.2em] mb-2 opacity-50 ${textSecondary}`}>Account Status</span>
                          <span className={`font-black text-sm uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Verified / Active</span>
                       </div>
                    </div>
                 </div>
                 <div className="absolute top-[-10%] right-[-5%] w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
              </div>

              <div className="grid lg:grid-cols-2 gap-10">
                <div className={`rounded-[3.5rem] p-12 relative overflow-hidden transition-all duration-500 border ${cardBase}`}>
                  <div className="flex items-center gap-4 mb-10">
                    <h3 className={`text-3xl font-black tracking-tight transition-colors font-outfit ${textPrimary}`}>Security Suite</h3>
                    <div className={`h-px flex-1 transition-colors ${isDark ? 'bg-white/10' : 'bg-slate-100'}`} />
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div>
                      <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-4 ml-2 transition-colors ${textSecondary}`}>Update Display Name</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Full administrative name" className={`w-full px-8 py-5 rounded-3xl border font-black transition-all outline-none text-sm ${inputBase}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-4 ml-2 transition-colors ${textSecondary}`}>Current Authorization</label>
                      <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="Verify your current password" className={`w-full px-8 py-5 rounded-3xl border font-black transition-all outline-none text-sm ${inputBase}`} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-4 ml-2 transition-colors ${textSecondary}`}>New Password</label>
                        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="New secret key" className={`w-full px-8 py-5 rounded-3xl border font-black transition-all outline-none text-sm ${inputBase}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-4 ml-2 transition-colors ${textSecondary}`}>Confirm New</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Verify secret key" className={`w-full px-8 py-5 rounded-3xl border font-black transition-all outline-none text-sm ${inputBase}`} />
                      </div>
                    </div>
                    <button type="submit" disabled={updating} className={`w-full py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] text-white transition-all shadow-2xl mt-4 ${updating ? 'bg-white/10 text-white/20 cursor-wait shadow-none' : 'bg-gradient-to-r from-blue-600 to-indigo-800 hover:opacity-95 hover:shadow-blue-500/30 active:scale-[0.98]'}`}>
                      {updating ? 'Processing...' : 'Apply Secure Changes →'}
                    </button>
                  </form>
                </div>

                <div className="space-y-10">
                  <div className={`rounded-[3.5rem] p-12 transition-all duration-500 border ${cardBase}`}>
                    <div className="flex items-center gap-4 mb-10">
                      <h3 className={`text-3xl font-black tracking-tight transition-colors font-outfit ${textPrimary}`}>UI Style Engine</h3>
                      <div className={`h-px flex-1 transition-colors ${isDark ? 'bg-white/10' : 'bg-slate-100'}`} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <button onClick={() => setAdminTheme('light')} className={`flex flex-col items-center gap-6 p-8 rounded-[3rem] border-2 transition-all group ${!isDark ? 'bg-white border-blue-600 shadow-2xl shadow-blue-200/20' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                           <span className={`text-5xl transition-transform duration-500 group-hover:rotate-12 ${!isDark ? 'grayscale-0' : 'grayscale'}`}>☀️</span>
                           <span className={`text-xs font-black uppercase tracking-[0.2em] ${!isDark ? 'text-blue-600' : 'text-white/40'}`}>Professional Light</span>
                        </button>
                        <button onClick={() => setAdminTheme('dark')} className={`flex flex-col items-center gap-6 p-8 rounded-[3rem] border-2 transition-all group ${isDark ? 'bg-blue-500/10 border-blue-500 shadow-2xl shadow-blue-500/30' : 'bg-slate-50 border-transparent hover:bg-slate-100'}`}>
                           <span className={`text-5xl transition-transform duration-500 group-hover:-rotate-12 ${isDark ? 'grayscale-0' : 'grayscale'}`}>🌙</span>
                           <span className={`text-xs font-black uppercase tracking-[0.2em] ${isDark ? 'text-blue-400' : 'text-slate-400'}`}>Advanced Dark</span>
                        </button>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className={`rounded-[3rem] p-10 transition-all duration-500 border ${cardBase}`}>
                        <div className="flex items-center gap-6">
                          <span className="text-4xl">🔱</span>
                          <div>
                              <p className={`text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-1 ${textSecondary}`}>Permission Status</p>
                              <p className={`font-black text-2xl tracking-tighter transition-colors font-outfit ${textPrimary}`}>Full Global Admin</p>
                          </div>
                        </div>
                    </div>
                    <div className={`rounded-[3rem] p-10 transition-all duration-500 border ${cardBase}`}>
                        <div className="flex items-center gap-6">
                          <span className="text-4xl">🛡️</span>
                          <div>
                              <p className={`text-xs font-black uppercase tracking-[0.2em] opacity-50 mb-1 ${textSecondary}`}>Security Profile</p>
                              <p className={`font-black text-2xl tracking-tighter transition-colors font-outfit ${textPrimary}`}>Verified Identity</p>
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminProfile;
