import { useState, useEffect } from 'react';
import { useUserTheme } from "../context/UserThemeContext";
import UserSidebar from "../components/UserSidebar";

const Contact = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-600";
  const cardBase = isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-2xl shadow-slate-200/20";
  const inputBase = isDark ? "bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600";

  const handleSubmit = e => {
    e.preventDefault();
    if(form.name && form.email && form.message) {
      setLoading(true);
      setTimeout(() => {
        alert('🚀 Message received! We will connect with you soon.');
        setForm({ name: '', email: '', message: '' });
        setLoading(false);
      }, 1500);
    }
  }

  useEffect(() => {
    document.title = "Contact Support | UniBook";
  }, []);

  return (
    <div className="flex min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <UserSidebar />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500">
        <div className={`absolute top-0 right-[-10%] w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <div className="max-w-[550px] w-full relative z-10 animate-[fadeIn_0.5s_ease-out]">
          <div className="text-center mb-10">
            <h1 className={`text-4xl font-black mb-2 tracking-tighter ${textPrimary}`}>Reach Out</h1>
            <p className={`text-lg font-bold ${textSecondary}`}>Have questions? We're here to help.</p>
          </div>

          <div className={`rounded-[3rem] p-10 border backdrop-blur-3xl ${cardBase}`}>
             <form onSubmit={handleSubmit} className="space-y-8">
               <div className="space-y-2">
                 <label className={`text-xs font-black uppercase tracking-widest ml-1 ${textSecondary}`}>Full Name</label>
                 <input 
                   type="text" 
                   placeholder="John Doe" 
                   value={form.name} 
                   onChange={e=>setForm({...form, name: e.target.value})}
                   className={`w-full px-8 py-5 rounded-3xl border transition-all font-bold outline-none ${inputBase}`}
                   required
                 />
               </div>

               <div className="space-y-2">
                 <label className={`text-xs font-black uppercase tracking-widest ml-1 ${textSecondary}`}>Email Address</label>
                 <input 
                   type="email" 
                   placeholder="john@example.com" 
                   value={form.email} 
                   onChange={e=>setForm({...form, email: e.target.value})}
                   className={`w-full px-8 py-5 rounded-3xl border transition-all font-bold outline-none ${inputBase}`}
                   required
                 />
               </div>

               <div className="space-y-2">
                 <label className={`text-xs font-black uppercase tracking-widest ml-1 ${textSecondary}`}>Your Message</label>
                 <textarea 
                   rows={4}
                   placeholder="How can we help scale your UniBook experience?" 
                   value={form.message} 
                   onChange={e=>setForm({...form, message: e.target.value})}
                   className={`w-full px-8 py-5 rounded-3xl border transition-all font-bold outline-none resize-none ${inputBase}`}
                   required
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className={`w-full py-5 rounded-[2rem] bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl transition-all
                   ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-blue-500/30'}`}
               >
                 {loading ? 'Sending...' : 'Send Message →'}
               </button>
             </form>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 pb-4">
             <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="text-2xl">📧</div>
                <div>
                   <h4 className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Email Us</h4>
                   <p className={`text-sm font-bold ${textPrimary}`}>support@unibook.com</p>
                </div>
             </div>
             <div className={`p-6 rounded-3xl border flex items-center gap-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className="text-2xl">📱</div>
                <div>
                   <h4 className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Hotline</h4>
                   <p className={`text-sm font-bold ${textPrimary}`}>+977 980-0000000</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Contact;
