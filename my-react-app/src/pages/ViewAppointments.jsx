import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import { getUserBookings, updateBookingStatus } from '../services/bookingService';
import { useUserTheme } from '../context/UserThemeContext';
import { CheckCircle, Clock, XCircle, HelpCircle, Calendar, Utensils, Activity, Hospital, Sparkles, Plus, CalendarX } from 'lucide-react';

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
        badge: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200', 
        icon: <CheckCircle className="w-3.5 h-3.5" /> 
      };
      case 'pending': return { 
        badge: isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-200', 
        icon: <Clock className="w-3.5 h-3.5" /> 
      };
      case 'cancelled': return { 
        badge: isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-600 border-rose-200', 
        icon: <XCircle className="w-3.5 h-3.5" /> 
      };
      default: return { 
        badge: isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-50 text-slate-500 border-slate-200', 
        icon: <HelpCircle className="w-3.5 h-3.5" /> 
      };
    }
  }

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Restaurants': return <Utensils className="w-6 h-6" />;
      case 'Futsal': return <Activity className="w-6 h-6" />;
      case 'Hospitals': return <Hospital className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-500">
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
          {toasts.map(t => (
            <div key={t.id} className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-white text-sm font-medium pointer-events-auto
              ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
              style={{ animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              {t.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {t.message}
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto w-full slide-up pt-4 relative z-10">
          
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b pb-6 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
              <h1 className={`text-3xl font-bold mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>My Appointments</h1>
              <p className={`text-base transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl`}>Check and manage all your active and past appointments.</p>
            </div>
            <Link to="/services" 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-all w-max shadow-sm cursor-pointer ${isDark ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-600 hover:bg-blue-700'}`}>
              <Plus className="w-4 h-4" /> New Booking
            </Link>
          </div>

          <div className="space-y-4 pb-12">
            {loading ? (
               <div className="flex flex-col gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className={`h-28 rounded-2xl animate-pulse border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`} />
                 ))}
               </div>
            ) : appointments.length === 0 ? (
               <div className={`text-center py-20 rounded-2xl border border-dashed transition-all ${isDark ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-50 border-slate-300'}`}>
                 <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all ${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                    <CalendarX className="w-8 h-8" />
                 </div>
                 <h3 className={`text-xl font-semibold transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No bookings found</h3>
                 <p className={`mt-1 text-sm transition-colors ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Make a new booking to get started.</p>
               </div>
            ) : appointments.map((a, i) => {
              const cfg = getStatusConfig(a.status);
              return (
              <div key={a.id} 
                className={`group relative border rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6 transition-all duration-300 shadow-sm
                  ${isDark ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-blue-200'}`}
                style={{ animation: `slideUp 0.4s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className={`w-14 h-14 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all
                    ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    {getCategoryIcon(a.category)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
                      <h3 className={`text-lg font-bold truncate transition-colors ${isDark ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>{a.provider_name}</h3>
                      <span className={`text-xs font-semibold px-3 py-1 rounded inline-flex items-center gap-1.5 whitespace-nowrap tracking-wide transition-all w-max border ${cfg.badge}`}>
                        {cfg.icon} <span className="uppercase">{a.status}</span>
                      </span>
                    </div>
                    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 text-sm transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 opacity-60" /> 
                        {new Date(a.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 opacity-60" /> 
                        {a.booking_time.substring(0,5)}
                      </div>
                    </div>
                  </div>
                </div>

                {a.status?.toLowerCase() === 'pending' && (
                  <div className={`flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-none transition-colors ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                    <button onClick={() => cancelAppointment(a.id)} 
                      className={`flex-1 md:flex-none px-4 py-2 rounded-lg border transition-all font-medium text-sm text-center cursor-pointer shadow-sm
                        ${isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' : 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300'}`}>
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            )})}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewAppointments;
