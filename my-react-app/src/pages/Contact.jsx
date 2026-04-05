import { useState, useEffect } from 'react';
import { useUserTheme } from "../context/UserThemeContext";
import UserNavbar from "../components/UserNavbar";
import { Mail, Phone, Send } from "lucide-react";

const Contact = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [loading, setLoading] = useState(false);

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-600";
  const cardBase = isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-sm";
  const inputBase = isDark ? "bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm";

  const handleSubmit = e => {
    e.preventDefault();
    if(form.name && form.email && form.message) {
      setLoading(true);
      setTimeout(() => {
        alert('Message received! We will connect with you soon.');
        setForm({ name: '', email: '', message: '' });
        setLoading(false);
      }, 1500);
    }
  }

  useEffect(() => {
    document.title = "Contact Support | UniBook";
  }, []);

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #020617 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-6 relative overflow-hidden transition-all duration-500">
        <div className={`absolute top-0 right-[-10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-400/5'}`} />

        <div className="max-w-xl mx-auto w-full relative z-10 animate-[fadeIn_0.5s_ease-out] flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className={`text-4xl font-black mb-2 tracking-tight ${textPrimary}`}>Reach Out</h1>
            <p className={`text-base font-medium ${textSecondary}`}>Have questions? Our support team is here to help.</p>
          </div>

          <div className={`w-full rounded-[2.5rem] p-10 border backdrop-blur-3xl transition-all ${cardBase}`}>
             <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-1.5">
                 <label className={`text-xs font-black uppercase tracking-wider ml-1 ${textSecondary}`}>Full Name</label>
                 <input 
                   type="text" 
                   placeholder="John Doe" 
                   value={form.name} 
                   onChange={e=>setForm({...form, name: e.target.value})}
                   className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium outline-none text-sm ${inputBase}`}
                   required
                 />
               </div>

               <div className="space-y-1.5">
                 <label className={`text-xs font-black uppercase tracking-wider ml-1 ${textSecondary}`}>Email Address</label>
                 <input 
                   type="email" 
                   placeholder="john@example.com" 
                   value={form.email} 
                   onChange={e=>setForm({...form, email: e.target.value})}
                   className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium outline-none text-sm ${inputBase}`}
                   required
                 />
               </div>

               <div className="space-y-1.5">
                 <label className={`text-xs font-black uppercase tracking-wider ml-1 ${textSecondary}`}>Your Message</label>
                 <textarea 
                   rows={4}
                   placeholder="How can we help you today?" 
                   value={form.message} 
                   onChange={e=>setForm({...form, message: e.target.value})}
                   className={`w-full px-5 py-4 rounded-2xl border transition-all font-medium outline-none resize-none text-sm ${inputBase}`}
                   required
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 font-black uppercase tracking-wider text-sm transition-all text-white shadow-lg
                   ${loading ? 'bg-emerald-600/50 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-500/20 hover:-translate-y-0.5 active:translate-y-0'}`}
               >
                 {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
               </button>
             </form>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
             <div className={`p-6 rounded-3xl border flex items-center gap-5 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-700 text-emerald-400' : 'bg-emerald-50 text-emerald-600 shadow-inner'}`}><Mail className="w-6 h-6" /></div>
                <div>
                   <h4 className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Email Us</h4>
                   <p className={`text-sm font-bold mt-0.5 ${textPrimary}`}>support@unibook.io</p>
                </div>
             </div>
             <div className={`p-6 rounded-3xl border flex items-center gap-5 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-700 text-emerald-400' : 'bg-emerald-50 text-emerald-600 shadow-inner'}`}><Phone className="w-6 h-6" /></div>
                <div>
                   <h4 className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>Hotline</h4>
                   <p className={`text-sm font-bold mt-0.5 ${textPrimary}`}>+977 1-4XXXXXX</p>
                </div>
             </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Contact;
