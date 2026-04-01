import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";

const Profile = () => {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const [form, setForm] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    age: 22,
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
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(URL.createObjectURL(file));
      toast("Photo uploaded!");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast("New passwords do not match", 'error');
      setLoading(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      toast("Profile updated successfully!");
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Toast Notification */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-base font-semibold pointer-events-auto
            ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}
            style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <UserSidebar />

        <div className="flex-1 px-10 py-12 max-w-5xl mx-auto w-full overflow-y-auto">
          
          <div className="mb-10" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">My Profile</h1>
            <p className="text-white/40 text-lg font-medium">Manage your personal identity and security</p>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-10 shadow-2xl"
               style={{ animation: 'fadeIn 0.7s ease-out 0.2s forwards', opacity: 0 }}>
            
            <form onSubmit={handleSubmit} className="space-y-12">
              
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center group">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/20">
                    <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0f172a]">
                      <img
                        src={photo || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"}
                        alt="Profile"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  </div>
                  <label className="absolute bottom-1 right-1 w-10 h-10 rounded-full bg-blue-500 border-4 border-[#0f172a] flex items-center justify-center cursor-pointer hover:bg-blue-400 transition-colors shadow-xl">
                    <span className="text-lg">📷</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
                <h3 className="mt-4 text-white font-black text-lg">{form.name}</h3>
                <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em]">{form.email}</p>
              </div>

              {/* Basic Information Grid */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Identity</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  {[
                    { label: 'Full Name', name: 'name', type: 'text' },
                    { label: 'Email address', name: 'email', type: 'email' },
                    { label: 'Age', name: 'age', type: 'number' },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">{field.label}</label>
                      <input
                        type={field.type}
                        name={field.name}
                        value={form[field.name]}
                        onChange={handleChange}
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/20"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-white/40 text-[10px] font-black uppercase tracking-widest mb-2.5 ml-1">Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all cursor-pointer"
                    >
                      <option className="bg-slate-900">Male</option>
                      <option className="bg-slate-900">Female</option>
                      <option className="bg-slate-900">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-8 border-t border-white/5 pt-12">
                <div className="flex items-center gap-3">
                  <div className="h-px bg-white/10 flex-1"></div>
                  <span className="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">Security</span>
                  <div className="h-px bg-white/10 flex-1"></div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {[
                    { placeholder: 'Current Password', name: 'currentPassword' },
                    { placeholder: 'New Password', name: 'newPassword' },
                    { placeholder: 'Verify New Password', name: 'confirmPassword' },
                  ].map((field) => (
                    <input
                      key={field.name}
                      type="password"
                      name={field.name}
                      placeholder={field.placeholder}
                      value={form[field.name]}
                      onChange={handleChange}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/20"
                    />
                  ))}
                </div>
              </div>

              {/* Action */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] text-white transition-all shadow-xl
                  ${loading ? 'bg-white/10 text-white/20 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 hover:shadow-blue-500/30 active:scale-[0.98]'}`}
              >
                {loading ? 'Processing...' : 'Save Configuration →'}
              </button>

            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
