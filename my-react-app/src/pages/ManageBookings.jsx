import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getAllBookings, updateBookingStatus } from '../services/bookingService';

const ManageBookings = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  useEffect(() => {
    document.title = "Booking Overview | Admin UniBook";
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      toast('Failed to load system bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast(`Booking ${status} successfully!`);
    } catch (err) {
      toast('Operation failed', 'error');
    }
  }

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'confirmed': return { badge: isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100', icon: '✅', label: 'Approved' };
      case 'pending':   return { badge: isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100',     icon: '⏳', label: 'Pending Review' };
      case 'cancelled': return { badge: isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-100',       icon: '❌', label: 'Declined' };
      default:          return { badge: isDark ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' : 'bg-slate-100 text-slate-600 border-slate-200',      icon: '❓', label: status };
    }
  }

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-500";
  const cardBase = isDark ? "bg-white/5 backdrop-blur-sm border border-white/10" : "bg-white border border-slate-200 shadow-xl shadow-slate-200/30";

  return (
    <div className="flex min-h-screen transition-colors duration-500 font-inter" 
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-black pointer-events-auto
            ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-red-500'}`}
            style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div>
            <h1 className={`text-6xl font-black tracking-tighter mb-4 transition-colors font-outfit ${textPrimary}`}>Booking Overview</h1>
            <p className={`text-lg font-bold tracking-tight transition-colors ${textSecondary}`}>{bookings.length} total system reservations</p>
          </div>
          <div className={`flex items-center gap-4 px-8 py-5 rounded-[2.5rem] border transition-all shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-slate-200/20'}`}>
             <span className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Active Slots:</span>
             <span className={`font-black text-3xl font-outfit ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{bookings.filter(b => b.status === 'confirmed').length}</span>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-6">
            {[1,2,3].map(i => <div key={i} className={`h-48 rounded-[3rem] animate-pulse border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className={`text-center py-40 rounded-[4rem] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white'}`}>
             <div className="text-8xl mb-6 opacity-10">🗓️</div>
             <h3 className={`text-3xl font-black ${textPrimary}`}>No system logs found</h3>
          </div>
        ) : (
          <div className="grid gap-8">
            {bookings.map(b => {
              const cfg = getStatusConfig(b.status);
              return (
                <div key={b.id} className={`group relative rounded-[3rem] p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10 border-l-[12px] transition-all duration-500 hover:-translate-y-2 ${cardBase}
                  ${b.status === 'confirmed' ? 'border-l-emerald-500' : b.status === 'pending' ? 'border-l-amber-500' : 'border-l-rose-500'}`}
                  style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                  <div className="flex flex-col md:flex-row gap-10 md:items-center flex-1">
                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-tr from-blue-600 to-indigo-800 flex items-center justify-center text-5xl shadow-2xl shadow-blue-500/20 group-hover:scale-105 transition-transform flex-shrink-0">
                      {b.category === 'Restaurants' ? '🍽️' : b.category === 'Futsal' ? '⚽' : b.category === 'Hospitals' ? '🏥' : '💆'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-4 mb-3">
                        <h3 className={`font-black text-3xl font-outfit tracking-tighter transition-colors ${textPrimary}`}>{b.user_name}</h3>
                        <span className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest border transition-all ${cfg.badge}`}>{cfg.label}</span>
                      </div>
                      <p className={`text-xl font-bold tracking-tight mb-8 opacity-60 ${textSecondary}`}>{b.user_email}</p>
                      <div className="flex flex-wrap items-center gap-x-10 gap-y-4">
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Provider</span>
                          <span className={`font-black text-sm uppercase tracking-wide ${textPrimary}`}>{b.provider_name}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Schedule</span>
                          <span className={`font-black text-sm uppercase tracking-wide ${textPrimary}`}>{new Date(b.booking_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} at {b.booking_time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    {b.status?.toLowerCase() === 'pending' && (
                      <button onClick={() => updateStatus(b.id, 'confirmed')} className={`flex-1 lg:flex-none px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all bg-emerald-600 text-white shadow-2xl shadow-emerald-500/20 hover:opacity-90`}>Approve Slot</button>
                    )}
                    {b.status?.toLowerCase() === 'pending' && (
                      <button onClick={() => updateStatus(b.id, 'cancelled')} className={`flex-1 lg:flex-none px-10 py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all bg-red-600 text-white shadow-2xl shadow-red-500/20 hover:opacity-90`}>Decline</button>
                    )}
                    {b.status?.toLowerCase() !== 'pending' && (
                      <div className={`px-10 py-5 rounded-[2rem] text-xs font-black uppercase tracking-widest border border-white/10 opacity-30 ${textPrimary}`}>System Log Finalized</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
