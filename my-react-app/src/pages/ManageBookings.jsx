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
    document.title = "Admin | Manage Bookings - UniBook";
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      toast('Failed to load bookings', 'error');
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
      console.error(err);
      toast('Failed to update status', 'error');
    }
  }

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'confirmed': return { 
        badge: isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-50 text-emerald-600 border-emerald-100', 
        icon: '✅' 
      };
      case 'pending':   return { 
        badge: isDark ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-amber-50 text-amber-600 border-amber-100',     
        icon: '⏳' 
      };
      case 'cancelled': return { 
        badge: isDark ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-rose-50 text-rose-600 border-rose-100',       
        icon: '❌' 
      };
      default:          return { 
        badge: isDark ? 'bg-slate-500/20 text-slate-300 border-slate-500/30' : 'bg-slate-100 text-slate-600 border-slate-200',      
        icon: '❓' 
      };
    }
  }

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-700";
  const cardBase = isDark 
    ? "bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg" 
    : "bg-white border border-slate-200 shadow-xl shadow-slate-200/50";

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Toast Notification */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-base font-bold pointer-events-auto
            ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}
            style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex min-h-screen transition-colors duration-500 font-inter" 
           style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Sidebar />

        <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div>
              <h1 className={`text-5xl font-black tracking-tighter mb-4 transition-colors font-outfit ${textPrimary}`}>Manage Bookings</h1>
              <p className={`text-lg font-semibold tracking-tight transition-colors ${textSecondary}`}>total {bookings.length} reservations found</p>
            </div>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] border transition-all shadow-xl
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
               <span className={`text-xs font-black uppercase tracking-[0.2em] ${textSecondary}`}>Confirmed Bookings:</span>
               <span className={`font-black text-2xl font-outfit ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{bookings.filter(b => b.status === 'confirmed').length}</span>
            </div>
          </div>

          <div className="grid gap-6">
            {loading ? (
               <div className="flex flex-col gap-6">
                 {[1,2,3].map(i => (
                   <div key={i} className={`h-40 rounded-[2.5rem] animate-pulse border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />
                 ))}
               </div>
            ) : bookings.length === 0 ? (
               <div className={`text-center py-32 rounded-[3.5rem] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-2xl shadow-slate-200/50'}`}>
                 <div className="text-8xl mb-6 opacity-25">📅</div>
                 <h3 className={`text-2xl font-black font-outfit ${textPrimary}`}>No bookings yet</h3>
                 <p className={`mt-4 max-w-sm mx-auto text-base font-semibold tracking-tight ${textSecondary}`}>All new appointments will be indexed here.</p>
               </div>
            ) : bookings.map(b => {
              const cfg = getStatusConfig(b.status);
              return (
              <div key={b.id} className={`group relative rounded-[2.5rem] p-8 transition-all duration-500 hover:-translate-y-2 flex flex-col md:flex-row md:items-center justify-between gap-8 ${cardBase} border-l-8
                   ${isDark 
                    ? (b.status === 'confirmed' ? 'border-l-emerald-500' : b.status === 'pending' ? 'border-l-amber-500' : 'border-l-rose-500')
                    : (b.status === 'confirmed' ? 'border-l-emerald-600' : b.status === 'pending' ? 'border-l-amber-500' : 'border-l-rose-600')}`}
                   style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                <div className="flex gap-7 items-center">
                  <div className={`w-20 h-20 rounded-[1.5rem] bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center text-4xl shadow-2xl shadow-indigo-500/20`}>
                    {b.category === 'Restaurants' ? '🍽️' : b.category === 'Futsal' ? '⚽' : b.category === 'Hospitals' ? '🏥' : '💆'}
                  </div>
                  <div>
                    <h3 className={`font-black text-xl flex items-center gap-3 tracking-tight transition-colors font-outfit ${textPrimary}`}>
                       {b.user_name}
                       <span className={`px-4 py-1 rounded-full text-[10px] uppercase font-black border tracking-widest transition-all ${cfg.badge}`}>{b.status}</span>
                    </h3>
                    <p className={`text-base font-bold tracking-tight mt-1 transition-colors ${textSecondary}`}>{b.user_email}</p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4">
                       <span className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${textSecondary}`}><span className="text-lg opacity-40">🏢</span> {b.provider_name}</span>
                       <span className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${textSecondary}`}><span className="text-lg opacity-40">🗓️</span> {new Date(b.booking_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                       <span className={`flex items-center gap-2 text-xs font-black uppercase tracking-widest ${textSecondary}`}><span className="text-lg opacity-40">⏰</span> {b.booking_time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {b.status?.toLowerCase() === 'pending' && (
                    <button onClick={() => updateStatus(b.id, 'confirmed')} 
                      className={`flex-1 md:flex-none px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border shadow-xl
                        ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white hover:shadow-emerald-200'}`}>
                      {cfg.icon} Confirm
                    </button>
                  )}
                  {b.status?.toLowerCase() === 'pending' && (
                    <button onClick={() => updateStatus(b.id, 'cancelled')} 
                            className={`flex-1 md:flex-none px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 border shadow-xl
                              ${isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500 hover:text-white' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white hover:shadow-red-200'}`}>
                      {cfg.icon === '✅' ? '❌' : cfg.icon} Cancel
                    </button>
                  )}
                   {b.status?.toLowerCase() !== 'pending' && (
                     <div className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest border opacity-60
                       ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                       Completed
                     </div>
                   )}
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageBookings;
