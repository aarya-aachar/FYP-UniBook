import { useParams, Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';

const BookingConfirmation = () => {
  const { id } = useParams();

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <UserSidebar />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes drawCheck { 0% { stroke-dashoffset: 100; } 100% { stroke-dashoffset: 0; } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .check-svg { stroke-dasharray: 100; stroke-dashoffset: 100; animation: drawCheck 1s cubic-bezier(0.65, 0, 0.45, 1) forwards 0.5s; }
        `}</style>

        <div className="max-w-[500px] w-full text-center slide-up">
           
           <div className="relative mb-10 inline-block">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-5xl mx-auto shadow-[0_0_50px_rgba(16,185,129,0.3)]">
                 <svg viewBox="0 0 24 24" className="w-12 h-12 fill-none stroke-current stroke-3">
                    <polyline points="20 6 9 17 4 12" className="check-svg" />
                 </svg>
              </div>
              <div className="absolute -inset-4 rounded-full border border-emerald-500/10 animate-ping opacity-20" />
           </div>

           <h1 className="text-4xl font-black mb-4 tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
              Booking Confirmed!
           </h1>
           <p className="text-white/40 text-lg font-medium mb-10 max-w-sm mx-auto leading-relaxed">
              Your appointment (ID: {id}) has been successfully encrypted and secured in our systems.
           </p>

           <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 mb-10 shadow-2xl">
              <div className="space-y-4">
                 <div className="flex justify-between items-center py-3 border-b border-white/5">
                    <span className="text-white/40 text-xs font-black uppercase tracking-widest">Status</span>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest">Verified</span>
                 </div>
                 <div className="flex justify-between items-center py-3">
                    <span className="text-white/40 text-xs font-black uppercase tracking-widest">Confirmation ID</span>
                    <span className="text-white font-bold text-sm">#{id.slice(-8).toUpperCase()}</span>
                 </div>
              </div>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Link
                to="/dashboard/user/appointments"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-center"
              >
                My Appointments
              </Link>
              <Link
                to="/dashboard/user"
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-slate-950 transition-all text-center"
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
