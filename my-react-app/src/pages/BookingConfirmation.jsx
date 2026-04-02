import { useParams, Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import { useUserTheme } from '../context/UserThemeContext';

const BookingConfirmation = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { id } = useParams();

  return (
    <div className="flex min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <UserSidebar />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500">
        {/* Ambient Glows */}
        <div className={`absolute top-0 right-[-10%] w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-400/5'}`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] blur-[150px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes drawCheck { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .check-svg { stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawCheck 1s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.5s; }
        `}</style>

        <div className="max-w-[500px] w-full text-center slide-up">
           
           <div className="relative mb-10 inline-block">
              <div className={`w-24 h-24 rounded-full border flex items-center justify-center text-5xl mx-auto shadow-2xl transition-all
                ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600 shadow-inner'}`}>
                 <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current stroke-3">
                    <polyline points="20 6 9 17 4 12" className="check-svg" />
                 </svg>
              </div>
              <div className={`absolute -inset-4 rounded-full border animate-ping opacity-20 ${isDark ? 'border-emerald-500/10' : 'border-emerald-500/30'}`} />
           </div>

           <h1 className={`text-4xl font-black mb-4 tracking-tighter transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Booking Confirmed!
           </h1>
           <p className={`text-lg font-medium mb-10 max-w-sm mx-auto leading-relaxed transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
              Your appointment (ID: {id}) has been successfully encrypted and secured in our systems.
           </p>

           <div className={`border rounded-[2.5rem] p-8 mb-10 shadow-2xl backdrop-blur-2xl transition-all duration-500
             ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="space-y-4">
                 <div className={`flex justify-between items-center py-3 border-b transition-colors ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Status</span>
                    <span className={`px-3 py-1 rounded-full border text-xs font-black uppercase tracking-widest transition-all
                      ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>Verified</span>
                 </div>
                 <div className="flex justify-between items-center py-3">
                    <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Confirmation ID</span>
                    <span className={`font-bold text-sm transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>#{id.slice(-8).toUpperCase()}</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
               <Link
                 to="/dashboard/user/appointments"
                 className={`w-full sm:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all text-center
                   ${isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/20 hover:scale-105' : 'bg-blue-600 text-white shadow-xl hover:bg-blue-700'}`}
               >
                 My Appointments
               </Link>
               <Link
                 to="/dashboard/user"
                 className={`w-full sm:w-auto px-10 py-5 rounded-2xl border font-black uppercase tracking-[0.2em] text-xs transition-all text-center
                   ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white hover:text-slate-950' : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-900 hover:text-white'}`}
               >
                 User Dashboard
               </Link>
            </div>

        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
