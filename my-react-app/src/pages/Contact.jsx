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
  const inputBase = isDark ? "bg-slate-900 border-slate-700 text-white placeholder-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-sm";

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
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 flex flex-col items-center justify-center py-12 px-6 relative overflow-hidden transition-all duration-500">
        <div className={`absolute top-0 right-[-10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <div className="max-w-xl mx-auto w-full relative z-10 animate-[fadeIn_0.5s_ease-out] flex flex-col items-center justify-center">
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold mb-2 tracking-tight ${textPrimary}`}>Reach Out</h1>
            <p className={`text-base font-medium ${textSecondary}`}>Have questions? We're here to help.</p>
          </div>

          <div className={`w-full rounded-2xl p-8 border backdrop-blur-3xl transition-all ${cardBase}`}>
             <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-1.5">
                 <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${textSecondary}`}>Full Name</label>
                 <input 
                   type="text" 
                   placeholder="John Doe" 
                   value={form.name} 
                   onChange={e=>setForm({...form, name: e.target.value})}
                   className={`w-full px-4 py-3 rounded-lg border transition-all font-medium outline-none text-sm ${inputBase}`}
                   required
                 />
               </div>

               <div className="space-y-1.5">
                 <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${textSecondary}`}>Email Address</label>
                 <input 
                   type="email" 
                   placeholder="john@example.com" 
                   value={form.email} 
                   onChange={e=>setForm({...form, email: e.target.value})}
                   className={`w-full px-4 py-3 rounded-lg border transition-all font-medium outline-none text-sm ${inputBase}`}
                   required
                 />
               </div>

               <div className="space-y-1.5">
                 <label className={`text-xs font-semibold uppercase tracking-wider ml-1 ${textSecondary}`}>Your Message</label>
                 <textarea 
                   rows={4}
                   placeholder="How can we help you today?" 
                   value={form.message} 
                   onChange={e=>setForm({...form, message: e.target.value})}
                   className={`w-full px-4 py-3 rounded-lg border transition-all font-medium outline-none resize-none text-sm ${inputBase}`}
                   required
                 />
               </div>

               <button 
                 type="submit" 
                 disabled={loading}
                 className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-semibold text-sm transition-all text-white shadow-sm
                   ${loading ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow'}`}
               >
                 {loading ? 'Sending...' : <><Send className="w-4 h-4" /> Send Message</>}
               </button>
             </form>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
             <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-700 text-blue-400' : 'bg-white border md:border-slate-100 text-blue-600 shadow-sm'}`}><Mail className="w-5 h-5" /></div>
                <div>
                   <h4 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Email Us</h4>
                   <p className={`text-sm font-semibold mt-0.5 ${textPrimary}`}>support@unibook.com</p>
                </div>
             </div>
             <div className={`p-5 rounded-xl border flex items-center gap-4 transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-700 text-green-400' : 'bg-white border border-slate-100 text-green-600 shadow-sm'}`}><Phone className="w-5 h-5" /></div>
                <div>
                   <h4 className={`text-xs font-semibold uppercase tracking-wider ${textSecondary}`}>Hotline</h4>
                   <p className={`text-sm font-semibold mt-0.5 ${textPrimary}`}>+977 980-0000000</p>
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
