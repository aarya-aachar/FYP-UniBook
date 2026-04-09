import { useParams, Link } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import { useUserTheme } from '../context/UserThemeContext';

const BookingConfirmation = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { id } = useParams();

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      
      <UserNavbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-24 p-6 relative overflow-hidden transition-all duration-300">

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes drawCheck { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .check-svg { stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawCheck 1s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.5s; }
        `}</style>

        <div className="max-w-[450px] w-full text-center slide-up z-10">
           
           <div className="relative mb-8 inline-block">
              <div className={`w-20 h-20 rounded-full border flex items-center justify-center text-3xl mx-auto shadow-sm transition-all
                ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                 <svg viewBox="0 0 24 24" className="w-10 h-10 fill-none stroke-current stroke-[3]">
                    <polyline points="20 6 9 17 4 12" className="check-svg" />
                 </svg>
              </div>
           </div>

           <h1 className={`text-3xl font-bold mb-3 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Booking Confirmed
           </h1>
           <p className={`text-sm font-medium mb-8 max-w-[300px] mx-auto leading-relaxed transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Your appointment has been successfully secured in our systems.
           </p>

           <div className={`border rounded-2xl p-6 mb-8 shadow-sm transition-all duration-300 glass-card`}>
              <div className="space-y-3">
                 <div className={`flex justify-between items-center py-2 border-b transition-colors ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Status</span>
                    <span className={`px-2.5 py-1 rounded-md border text-xs font-semibold tracking-wide transition-all
                      ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-sm'}`}>Verified</span>
                 </div>
                 <div className="flex justify-between items-center py-2">
                    <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Confirmation ID</span>
                    <span className={`font-semibold text-sm transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>#{id.slice(-8).toUpperCase()}</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
               <Link
                 to="/my-appointments"
                 className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm transition-all focus:ring-2 focus:ring-emerald-500 text-center cursor-pointer shadow-sm
                   ${isDark ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
               >
                 My Appointments
               </Link>
               <Link
                 to="/dashboard"
                 className={`w-full sm:w-auto px-8 py-3 rounded-xl border font-semibold text-sm transition-all text-center cursor-pointer shadow-sm
                   ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
               >
                 User Dashboard
               </Link>
            </div>

        </div>
      </main>
    </div>
  );
};

export default BookingConfirmation;
