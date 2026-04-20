/**
 * The Identity Governance Hub (User Profile)
 * 
 * relative path: /src/pages/Profile.jsx
 * 
 * This component oversees the personal identity and interface preferences 
 * of the standard client. It serves as the central authority for account 
 * security and platform personalization.
 * 
 * Technical Design:
 * - Distributed State Management: Synchronizes local form states with 
 *   federated backend services for both identity metadata and binary 
 *   profile avatars.
 * - Reactive Interface Personalization: Manages the high-fidelity theme 
 *   switching logic (UserThemeContext), allowing for dynamic recalibration 
 *   of the entire UI's visual palette (Emerald-Light vs Obsidian-Dark).
 * - Secure Authorization Workflows: Implements mandatory "Current Password" 
 *   verification for all sensitive profile mutations to prevent 
 *   unauthorized state changes.
 */

import { useState, useEffect, useRef } from "react";
import UserNavbar from "../components/UserNavbar";
import { fetchFullProfile, updateProfile, uploadProfilePhoto } from "../services/authService";
import { useUserTheme } from "../context/UserThemeContext";
import { CheckCircle, XCircle, ShieldCheck, User, Palette, Sun, Moon, Zap, Fingerprint, Camera } from "lucide-react";

const Profile = () => {
  const { userTheme, toggleUserTheme, setUserTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [profilePhoto, setProfilePhoto] = useState(null);
  const photoInputRef = useRef(null);
  
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
      setProfilePhoto(data.profile_photo || null);
    } catch (err) {
      toast("Failed to load official profile data", "error");
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
    ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-emerald-500" 
    : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white";

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      
      <UserNavbar />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
      `}</style>

      {/* Static Toast Notification */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-white text-sm font-medium pointer-events-auto transition-all duration-300
            ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
            style={{ transform: 'translateX(0)', opacity: 1 }}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            {t.message}
          </div>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-500">
        <div className="max-w-4xl mx-auto w-full fade-in pt-16">
          
          {/* Header with simplified alignment */}
          <div className="mb-8 fade-in">
            <div className="glass-header">
              <h1 className={`text-4xl font-bold mb-2 tracking-tight transition-colors ${textPrimary}`}>
                Profile Settings
              </h1>
              <p className={`text-base font-medium transition-colors ${textSecondary} max-w-2xl`}>
                Update your personal info, change your theme, and manage account security.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            
            {/* Identity Header Card: More Compact & Professional */}
            <div className={`rounded-2xl p-6 flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden transition-all duration-300 shadow-sm glass-card`}>
               
               <div className="relative group cursor-pointer" onClick={() => photoInputRef.current?.click()}>
                 <div className={`w-28 h-28 rounded-xl p-1 bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg`}>
                   <div className={`w-full h-full rounded-lg overflow-hidden border-2 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-50'}`}>
                     {profilePhoto ? (
                       <img
                         src={`http://localhost:4001${profilePhoto}`}
                         alt="Profile"
                         className="w-full h-full object-cover"
                       />
                     ) : (
                       <img
                         src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                         alt="Profile"
                         className="w-full h-full object-cover"
                       />
                     )}
                   </div>
                 </div>
                 <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera className="w-6 h-6 text-white" />
                 </div>
                 <input type="file" ref={photoInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
               </div>

                <div className="flex-1 text-center md:text-left space-y-3 mt-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-center md:justify-start gap-3">
                     <div>
                       <h2 className={`text-2xl font-bold tracking-tight transition-colors ${textPrimary}`}>{form.name}</h2>
                       <p className={`text-sm font-medium mt-1 transition-colors ${textSecondary}`}>{form.email}</p>
                     </div>
                  </div>
               </div>
            </div>

            {/* Bento Grid: Simplified Grid Flow */}
            <div className="grid lg:grid-cols-2 gap-6 items-start">
               
               {/* 1. Account Core Card */}
               <div className={`rounded-2xl p-6 space-y-6 transition-all duration-300 shadow-sm glass-card`}>
                  <div className={`flex items-center justify-between border-b pb-4 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}><User className="w-4 h-4" /></div>
                        <h3 className={`text-base font-semibold transition-colors ${textPrimary}`}>Personal Details</h3>
                     </div>
                  </div>

                  <div className="grid gap-5">
                     {[
                       { label: 'Full Name', name: 'name', type: 'text' },
                       { label: 'Email Address', name: 'email', type: 'email', readOnly: true },
                       { label: 'Age', name: 'age', type: 'number', readOnly: true },
                     ].map((field) => (
                       <div key={field.name} className="space-y-1.5">
                         <label className={`block text-xs font-semibold uppercase tracking-wider ml-1 transition-colors ${textSecondary}`}>{field.label}</label>
                         <input
                           type={field.type}
                           name={field.name}
                           value={form[field.name]}
                           onChange={handleChange}
                           disabled={field.readOnly}
                           className={`w-full px-4 py-3 rounded-lg border font-medium transition-all text-sm ${inputBase} ${field.readOnly ? 'opacity-60 cursor-not-allowed' : 'outline-none'}`}
                         />
                       </div>
                     ))}

                     <div className="space-y-1.5">
                       <label className={`block text-xs font-semibold uppercase tracking-wider ml-1 transition-colors ${textSecondary}`}>Gender</label>
                       <select
                         name="gender"
                         value={form.gender}
                         onChange={handleChange}
                         className={`w-full px-4 py-3 rounded-lg border font-medium transition-all outline-none cursor-pointer text-sm ${inputBase}`}
                       >
                         <option className={isDark ? "bg-[#020617]" : "bg-white"}>Male</option>
                         <option className={isDark ? "bg-[#020617]" : "bg-white"}>Female</option>
                         <option className={isDark ? "bg-[#020617]" : "bg-white"}>Other</option>
                       </select>
                     </div>
                  </div>
               </div>

               {/* 2. Security Suite Card */}
               <div className={`rounded-2xl p-6 space-y-6 transition-all duration-300 shadow-sm glass-card`}>
                  <div className={`flex items-center justify-between border-b pb-4 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                     <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-teal-400' : 'bg-teal-50 text-teal-600'}`}><ShieldCheck className="w-4 h-4" /></div>
                        <h3 className={`text-base font-semibold transition-colors ${textPrimary}`}>Security Settings</h3>
                     </div>
                  </div>

                  <div className="grid gap-5">
                     {[
                       { label: 'Current Password', name: 'currentPassword' },
                       { label: 'New Password', name: 'newPassword' },
                       { label: 'Verify New Password', name: 'confirmPassword' },
                     ].map((field) => (
                       <div key={field.name} className="space-y-1.5">
                          <label className={`block text-xs font-semibold uppercase tracking-wider ml-1 transition-colors ${textSecondary}`}>{field.label}</label>
                          <input
                            type="password"
                            name={field.name}
                            placeholder="••••••••"
                            value={form[field.name]}
                            onChange={handleChange}
                            className={`w-full px-4 py-3 rounded-lg border font-medium transition-all outline-none text-sm ${inputBase}`}
                          />
                       </div>
                     ))}
                  </div>
                  
                  <div className={`p-4 rounded-lg border transition-all text-sm font-medium leading-relaxed ${isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                     Updating your password will refresh your session. Ensure it is secure.
                  </div>
               </div>

               {/* 3. Theme Preferences: Professional Full Width Integration */}
               <div className={`rounded-2xl p-6 transition-all duration-300 col-span-1 lg:col-span-2 shadow-sm glass-card`}>
                  <div className={`flex items-center gap-3 border-b pb-4 mb-6 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800 text-teal-400' : 'bg-teal-50 text-teal-600'}`}><Palette className="w-4 h-4" /></div>
                    <h3 className={`text-base font-semibold transition-colors ${textPrimary}`}>App Theme</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button type="button" onClick={() => setUserTheme('light')} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${!isDark ? 'bg-emerald-50 border-emerald-200' : 'bg-transparent border-slate-700 hover:bg-slate-800'}`}>
                         <Sun className={`w-8 h-8 ${!isDark ? 'text-emerald-500' : 'text-slate-500'}`} />
                         <div className="text-left">
                            <span className={`block text-sm font-semibold ${!isDark ? 'text-emerald-700' : 'text-white'}`}>Light Variant</span>
                            <p className={`text-xs font-medium transition-colors ${!isDark ? 'text-emerald-600/70' : 'text-slate-400'}`}>Optimal for clarity</p>
                         </div>
                      </button>
                      <button type="button" onClick={() => setUserTheme('dark')} className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isDark ? 'bg-slate-800/80 border-emerald-500/50' : 'bg-transparent border-slate-200 hover:bg-slate-50'}`}>
                         <Moon className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-slate-400'}`} />
                         <div className="text-left">
                            <span className={`block text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-slate-700'}`}>Dark Variant</span>
                            <p className={`text-xs font-medium transition-colors ${isDark ? 'text-emerald-400' : 'text-slate-500'}`}>Optimal for low-light</p>
                         </div>
                      </button>
                  </div>
               </div>
            </div>

            {/* Enhanced Global Action Bar */}
            <div className={`flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 mt-8 border-t transition-colors ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
               <div className="max-w-md text-center sm:text-left">
                  <p className={`text-sm font-semibold transition-colors ${textPrimary}`}>Ready to save?</p>
                  <p className={`text-xs mt-1 transition-colors leading-relaxed ${textSecondary}`}>Saving forces a local session refresh to ensure identity synchronization.</p>
               </div>
               <button
                 type="submit"
                 disabled={updating}
                 className={`px-8 py-3 rounded-lg font-bold text-sm transition-all shadow-sm w-full sm:w-auto cursor-pointer
                   ${updating ? (isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200') : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
               >
                 {updating ? 'Saving Info...' : 'Save Configuration'}
               </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
};

export default Profile;
