import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import { getUserBookings, updateBookingStatus } from '../services/bookingService';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  useEffect(() => {
    document.title = "User | Appointments - UniBook";
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setAppointments(data);
    } catch (err) {
      console.error(err);
      toast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if(!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await updateBookingStatus(id, 'cancelled');
      setAppointments(
        appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
      );
      toast('Booking cancelled successfully');
    } catch (err) {
      toast("Failed to cancel booking.", 'error');
    }
  }

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'confirmed': return { badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: '✅' };
      case 'pending':   return { badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',     icon: '⏳' };
      case 'cancelled': return { badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',       icon: '❌' };
      default:          return { badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20',      icon: '❓' };
    }
  }

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
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

        <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div>
              <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-2">My Appointments</h1>
              <p className="text-white/30 text-lg font-medium">History and status of your service bookings</p>
            </div>
            <Link to="/services" 
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-500/20 hover:-translate-y-0.5 transition-all active:scale-95 text-center">
              ✨ New Booking
            </Link>
          </div>

          <div className="space-y-4">
            {loading ? (
               <div className="flex flex-col gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
                 ))}
               </div>
            ) : appointments.length === 0 ? (
               <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/10 border-dashed">
                 <p className="text-7xl mb-6 opacity-20">📅</p>
                 <h3 className="text-2xl font-black text-white/50">No bookings yet</h3>
                 <p className="text-white/20 mt-2 font-medium">Find expert services and make your first booking today.</p>
                 <Link to="/services" className="inline-block mt-8 text-blue-400 font-black uppercase tracking-widest hover:text-blue-300 transition-colors">Start Browsing →</Link>
               </div>
            ) : appointments.map((a, i) => {
              const cfg = getStatusConfig(a.status);
              return (
              <div key={a.id} 
                className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-[2rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 shadow-lg"
                style={{ animation: `fadeIn 0.5s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-xl shadow-indigo-500/20 flex-shrink-0">
                    {a.category === 'Restaurants' ? '🍽️' : a.category === 'Futsal' ? '⚽' : a.category === 'Hospitals' ? '🏥' : '💆'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black text-white text-xl truncate tracking-tight">{a.provider_name}</h3>
                      <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border flex items-center gap-1.5 whitespace-nowrap ${cfg.badge}`}>
                        <span>{cfg.icon}</span> {a.status}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><span className="opacity-40 text-base">🗓️</span> {new Date(a.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><span className="opacity-40 text-base">⏰</span> {a.booking_time}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  {a.status !== 'cancelled' ? (
                    <button onClick={() => cancelAppointment(a.id)} 
                      className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-black text-xs uppercase tracking-widest">
                      Cancel
                    </button>
                  ) : (
                    <div className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 text-white/20 border border-white/5 font-black text-xs uppercase tracking-widest">
                      Closed
                    </div>
                  )}
                  <Link to={`/service/${a.provider_id}`} 
                    className="flex-1 md:flex-none px-6 py-3 rounded-xl bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-all font-black text-xs uppercase tracking-widest text-center whitespace-nowrap">
                    Re-book
                  </Link>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewAppointments;
