import { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useAdminTheme } from "../context/AdminThemeContext";
import { uploadProfilePhoto } from "../services/authService";
import { User, Sun, Moon, Crown, ShieldCheck, CheckCircle, AlertCircle, Save, Camera } from "lucide-react";
import AdminTopHeader from "../components/AdminTopHeader";

const AdminProfile = () => {
  const { adminTheme, setAdminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);
  
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
      setProfilePhoto(res.data.profile_photo || null);
    } catch (err) {
      toast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await uploadProfilePhoto(file);
      setProfilePhoto(res.profile_photo);
      toast("Profile photo updated!");
    } catch (err) {
      toast(err.message || "Photo upload failed", "error");
    }
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
    ? "bg-slate-900 border border-slate-800" 
    : "bg-white border border-slate-200 shadow-sm";

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const inputBase = isDark 
    ? "bg-slate-900/50 border-slate-700 text-white placeholder-slate-600 focus:border-emerald-500" 
    : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600";

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-lg shadow-lg text-white text-sm font-bold pointer-events-auto
            ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
            style={{ animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex min-h-screen transition-colors duration-300 font-inter" 
           style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
        <Sidebar />
        
        <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden">
          <AdminTopHeader 
            title="Admin Settings" 
            subtitle="Manage your administrative profile and preferences." 
          />

          {loading ? (
            <div className={`h-[400px] rounded-xl animate-pulse border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-100 border-slate-200'}`} />
          ) : (
            <div className="grid gap-6 animate-in fade-in duration-500">
              
              <div className={`rounded-xl p-8 flex flex-col md:flex-row items-center gap-8 transition-all duration-300 border ${cardBase}`}
                   style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                 <div className="relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                   {profilePhoto ? (
                     <img src={`http://localhost:4001${profilePhoto}`} alt="Admin" className="w-24 h-24 rounded-full object-cover border-2 border-emerald-500" />
                   ) : (
                     <div className="w-24 h-24 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
                       <User className="w-10 h-10" />
                     </div>
                   )}
                   <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                     <Camera className="w-6 h-6 text-white" />
                   </div>
                   <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <h2 className={`text-xl font-bold tracking-tight mb-1 ${textPrimary}`}>{user?.name}</h2>
                    <p className={`text-sm font-medium mb-6 ${textSecondary}`}>{user?.email}</p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                       <div className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-3 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <div className={`p-1.5 rounded-md ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                             <Crown className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Access Role</p>
                            <p className={`font-bold text-xs ${textPrimary}`}>Administrator</p>
                          </div>
                       </div>
                       <div className={`px-4 py-2.5 rounded-lg border transition-all flex items-center gap-3 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <div className={`p-1.5 rounded-md ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                             <ShieldCheck className="w-4 h-4" />
                          </div>
                          <div>
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${textSecondary}`}>Account Status</p>
                            <p className={`font-bold text-xs ${textPrimary}`}>Verified</p>
                          </div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className={`rounded-xl p-8 transition-all duration-300 border flex flex-col ${cardBase}`}>
                  <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                    <h3 className={`text-base font-bold transition-colors ${textPrimary}`}>Security Details</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${textSecondary}`}>Display Name</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Admin Name" className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-all outline-none text-sm ${inputBase}`} />
                    </div>
                    <div>
                      <label className={`block text-xs font-bold mb-1.5 ${textSecondary}`}>Current Password</label>
                      <input type="password" name="currentPassword" value={form.currentPassword} onChange={handleChange} placeholder="Required to save changes" className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-all outline-none text-sm ${inputBase}`} />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 ${textSecondary}`}>New Password</label>
                        <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange} placeholder="Leave blank to keep" className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-all outline-none text-sm ${inputBase}`} />
                      </div>
                      <div>
                        <label className={`block text-xs font-bold mb-1.5 ${textSecondary}`}>Confirm Password</label>
                        <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Verify new password" className={`w-full px-4 py-2.5 rounded-lg border font-medium transition-all outline-none text-sm ${inputBase}`} />
                      </div>
                    </div>
                    <div className="mt-8 flex-1 flex items-end">
                      <button type="submit" disabled={updating} className={`w-full py-3 rounded-lg font-bold text-sm tracking-wide flex flex-row items-center justify-center gap-2 text-white transition-all cursor-pointer ${updating ? 'bg-slate-600 opacity-50 cursor-wait' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                        <Save className="w-4 h-4" />
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
                  </form>
                </div>

                <div className={`rounded-xl p-8 transition-all duration-300 border flex flex-col ${cardBase}`}>
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
                      <h3 className={`text-base font-bold transition-colors ${textPrimary}`}>Interface Preferences</h3>
                    </div>
                    
                    <p className={`text-sm mb-4 ${textSecondary}`}>Choose a theme style for the administrative dashboard.</p>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setAdminTheme('light')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border transition-all cursor-pointer ${!isDark ? 'bg-emerald-50 border-emerald-200 ring-1 ring-emerald-500' : 'bg-slate-900 border-slate-800 hover:bg-slate-800'}`}>
                           <Sun className={`w-6 h-6 ${!isDark ? 'text-emerald-600' : 'text-slate-500'}`}/>
                           <span className={`text-xs font-bold ${!isDark ? 'text-emerald-700' : 'text-slate-400'}`}>Light Theme</span>
                        </button>
                        <button onClick={() => setAdminTheme('dark')} className={`flex flex-col items-center justify-center gap-3 p-5 rounded-xl border transition-all cursor-pointer ${isDark ? 'bg-slate-800 border-emerald-500/50 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
                           <Moon className={`w-6 h-6 ${isDark ? 'text-emerald-400' : 'text-slate-400'}`}/>
                           <span className={`text-xs font-bold ${isDark ? 'text-emerald-400' : 'text-slate-500'}`}>Dark Theme</span>
                        </button>
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
