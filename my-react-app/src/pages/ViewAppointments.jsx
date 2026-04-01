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
      // Update status locally
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
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
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <UserSidebar />

      <div className="flex-1 overflow-y-auto px-10 py-12 relative">
        <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .dash-border { background-image: linear-gradient(to right, rgba(255,255,255,0.2) 50%, transparent 50%); background-size: 20px 2px; background-repeat: repeat-x; background-position: center; }
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

        <div className="max-w-6xl mx-auto w-full slide-up pt-4">
          
          {/* Header & Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
            <div>
              <h1 className="text-4xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">My Appointments</h1>
              <p className="text-lg text-white/40 max-w-2xl leading-relaxed">Manage and view your service booking history.</p>
            </div>
            <Link to="/services" 
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-105 transition-all w-max whitespace-nowrap">
              + New Booking
            </Link>
          </div>

          {/* Appointments List */}
          <div className="space-y-4 pb-12">
            {loading ? (
               <div className="flex flex-col gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-32 bg-white/5 rounded-[2.5rem] animate-pulse border border-white/10" />
                 ))}
               </div>
            ) : appointments.length === 0 ? (
               <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed backdrop-blur-sm">
                 <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">📅</div>
                 <h3 className="text-2xl font-black text-white/50">No bookings found</h3>
                 <p className="text-white/20 mt-2 font-medium">Make a new booking to get started.</p>
               </div>
            ) : appointments.map((a, i) => {
              const cfg = getStatusConfig(a.status);
              return (
              <div key={a.id} 
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1 shadow-xl"
                style={{ animation: `slideUp 0.5s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:bg-white/10 transition-colors">
                    {a.category === 'Restaurants' ? '🍽️' : a.category === 'Futsal' ? '⚽' : a.category === 'Hospitals' ? '🏥' : '💆'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold truncate group-hover:text-blue-400 transition-colors">{a.provider_name}</h3>
                      <span className={`text-[10px] uppercase font-black px-3 py-1 rounded-full border flex items-center gap-1.5 whitespace-nowrap tracking-widest ${cfg.badge}`}>
                        <span>{cfg.icon}</span> {a.status}
                      </span>
                    </div>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest flex flex-wrap items-center gap-x-4 gap-y-1">
                      <span className="flex items-center gap-1.5"><span className="opacity-40 text-xs text-white">Date:</span> {new Date(a.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><span className="opacity-40 text-xs text-white">Time:</span> {a.booking_time.substring(0,5)}</span>
                    </p>
                  </div>
                </div>

                {a.status?.toLowerCase() === 'pending' && (
                  <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-white/10 md:border-none">
                    <button onClick={() => cancelAppointment(a.id)} 
                      className="flex-1 md:flex-none px-6 py-4 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-black text-[10px] uppercase tracking-[0.2em] text-center">
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewAppointments;
