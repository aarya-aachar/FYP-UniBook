import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import { getUserBookings, updateBookingStatus } from '../services/bookingService';
import { useUserTheme } from '../context/UserThemeContext';

const ViewAppointments = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  useEffect(() => {
    document.title = "My Bookings | UniBook";
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      data.sort((a, b) => {
        const dateA = new Date(a.booking_date);
        const dateB = new Date(b.booking_date);
        if (dateA.getTime() !== dateB.getTime()) {
          return dateA - dateB;
        }
        return a.booking_time.localeCompare(b.booking_time);
      });
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
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
      toast('Booking cancelled successfully');
    } catch (err) {
      toast("Failed to cancel booking.", 'error');
    }
  }

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'confirmed': return { 
        badge: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200 font-bold', 
        icon: '✅' 
      };
      case 'pending': return { 
        badge: isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200 font-bold', 
        icon: '⏳' 
      };
      case 'cancelled': return { 
        badge: isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200 font-bold', 
        icon: '❌' 
      };
      default: return { 
        badge: isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-50 text-slate-500 border-slate-200 font-bold', 
        icon: '❓' 
      };
    }
  }

  return (
    <div className="flex min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <UserSidebar />

      <div className="flex-1 overflow-y-auto px-10 py-12 relative transition-all duration-500">
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

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

        <div className="max-w-6xl mx-auto w-full slide-up pt-4">
          
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b pb-8 transition-colors ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <h1 className={`text-4xl font-black mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>My Appointments</h1>
              <p className={`text-lg transition-colors font-medium ${isDark ? 'text-white/40' : 'text-slate-500'} max-w-2xl leading-relaxed`}>Check and manage all your active and past appointments.</p>
            </div>
            <Link to="/services" 
              className="px-8 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-105 transition-all w-max whitespace-nowrap">
              + New Booking
            </Link>
          </div>

          <div className="space-y-4 pb-12">
            {loading ? (
               <div className="flex flex-col gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className={`h-32 rounded-[2.5rem] animate-pulse border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />
                 ))}
               </div>
            ) : appointments.length === 0 ? (
               <div className={`text-center py-24 rounded-[2.5rem] border border-dashed backdrop-blur-sm transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-slate-200/20'}`}>
                 <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>📅</div>
                 <h3 className={`text-2xl font-black transition-colors ${isDark ? 'text-white/50' : 'text-slate-400'}`}>No bookings found</h3>
                 <p className={`mt-2 text-sm font-bold transition-colors ${isDark ? 'text-white/20' : 'text-slate-300'}`}>Make a new booking to get started.</p>
               </div>
            ) : appointments.map((a, i) => {
              const cfg = getStatusConfig(a.status);
              return (
              <div key={a.id} 
                className={`group relative border rounded-[2.5rem] p-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-500 shadow-xl
                  ${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-blue-200 shadow-slate-200/20 shadow-slate-200/20'}`}
                style={{ animation: `slideUp 0.5s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-all
                    ${isDark ? 'bg-white/5 border-white/10 group-hover:bg-white/10' : 'bg-slate-50 border-slate-100 shadow-inner group-hover:bg-white'}`}>
                    {a.category === 'Restaurants' ? '🍽️' : a.category === 'Futsal' ? '⚽' : a.category === 'Hospitals' ? '🏥' : '💆'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-2">
                      <h3 className={`text-2xl font-black truncate group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{a.provider_name}</h3>
                      <span className={`text-xs uppercase font-black px-4 py-1.5 rounded-full border flex items-center gap-2 whitespace-nowrap tracking-widest transition-all w-max ${cfg.badge}`}>
                        <span>{cfg.icon}</span> {a.status}
                      </span>
                    </div>
                    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-bold transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      <div className="flex items-center gap-2"><span className="opacity-40">📅</span> {new Date(a.booking_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      <div className="flex items-center gap-2"><span className="opacity-40">⏱️</span> {a.booking_time.substring(0,5)}</div>
                    </div>
                  </div>
                </div>

                {a.status?.toLowerCase() === 'pending' && (
                  <div className={`flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none transition-colors ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                    <button onClick={() => cancelAppointment(a.id)} 
                      className={`flex-1 md:flex-none px-6 py-4 rounded-xl border transition-all font-black text-xs uppercase tracking-[0.2em] text-center
                        ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white'}`}>
                      Cancel Booking
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
