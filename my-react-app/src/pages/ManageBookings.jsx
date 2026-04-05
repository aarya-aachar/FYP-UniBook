import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getAllBookings, updateBookingStatus } from '../services/bookingService';
import { CheckCircle, Clock, XCircle, CalendarX, Coffee, Activity, Stethoscope, Sparkles, AlertCircle, MapPin, CalendarDays, Key } from 'lucide-react';
import AdminTopHeader from '../components/AdminTopHeader';

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
      case 'confirmed': return { badge: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200', Icon: CheckCircle, label: 'Approved' };
      case 'pending':   return { badge: isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200',     Icon: Clock, label: 'Pending Review' };
      case 'cancelled': return { badge: isDark ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200',       Icon: XCircle, label: 'Declined' };
      default:          return { badge: isDark ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' : 'bg-slate-100 text-slate-600 border-slate-300',      Icon: AlertCircle, label: status };
    }
  }

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Restaurants': return Coffee;
      case 'Futsal': return Activity;
      case 'Hospitals': return Stethoscope;
      case 'Salon / Spa': return Sparkles;
      default: return CalendarDays;
    }
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const cardBase = isDark ? "bg-slate-900/50 border border-slate-800" : "bg-white border border-slate-200 shadow-sm";
  const innerCard = isDark ? "bg-slate-800/50 border border-slate-700/50" : "bg-slate-50 border border-slate-100";

  return (
    <div className="flex min-h-screen transition-colors duration-500 font-inter" 
         style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {/* Toast and other content untouched up to header */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-lg shadow-lg text-white text-sm font-bold pointer-events-auto
            ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
            style={{ animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden">
        <AdminTopHeader 
          title="Booking Overview" 
          subtitle={`Monitor and manage ${bookings.length} operational system reservations.`} 
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 -mt-10">
           <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Active Slots:</span>
              <span className={`font-bold text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{bookings.filter(b => b.status === 'confirmed').length}</span>
           </div>
        </div>

        {loading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => <div key={i} className={`h-32 rounded-xl animate-pulse border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-200'}`} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className={`text-center py-20 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
             <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                <CalendarX className="w-6 h-6" />
             </div>
             <h3 className={`text-base font-bold ${textPrimary}`}>No system logs found</h3>
          </div>
        ) : (
          <div className="grid gap-4">
            {bookings.map(b => {
              const cfg = getStatusConfig(b.status);
              const CatIcon = getCategoryIcon(b.category);
              const StatusIcon = cfg.Icon;
              
              return (
                <div key={b.id} className={`group relative rounded-xl p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-l-[4px] transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 ${cardBase}
                  ${b.status === 'confirmed' ? 'border-l-emerald-500' : b.status === 'pending' ? 'border-l-amber-500' : 'border-l-rose-500'}`}
                  style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                  
                  <div className="flex flex-col md:flex-row gap-5 lg:items-center flex-1">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0
                      ${isDark ? 'bg-slate-800 text-emerald-400 border border-slate-700' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                      <CatIcon className="w-6 h-6" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-1">
                        <h3 className={`font-bold text-lg tracking-tight transition-colors ${textPrimary}`}>{b.user_name}</h3>
                        <span className={`inline-flex flex-row items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border transition-all ${cfg.badge}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className={`text-xs font-medium mb-4 ${textSecondary}`}>{b.user_email}</p>
                      
                      <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-3 rounded-lg ${innerCard}`}>
                        <div className="flex items-start gap-3">
                          <MapPin className={`w-4 h-4 mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}/>
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${textSecondary}`}>Provider Location</span>
                            <span className={`font-bold text-sm tracking-tight ${textPrimary}`}>{b.provider_name}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className={`w-4 h-4 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}/>
                          <div className="flex flex-col">
                            <span className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${textSecondary}`}>Reservation Block</span>
                            <span className={`font-bold text-sm tracking-tight ${textPrimary}`}>
                              {new Date(b.booking_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} • {b.booking_time}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row xl:flex-col gap-2 min-w-[130px]">
                    {b.status?.toLowerCase() === 'pending' && (
                      <>
                        <button 
                          onClick={() => updateStatus(b.id, 'confirmed')} 
                          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer bg-emerald-600 text-white hover:bg-emerald-700`}
                        >
                           <CheckCircle className="w-4 h-4"/>
                           Approve
                        </button>
                        <button 
                          onClick={() => updateStatus(b.id, 'cancelled')} 
                          className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${isDark ? 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 hover:text-white' : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:text-slate-900'}`}
                        >
                           <XCircle className="w-4 h-4"/>
                           Decline
                        </button>
                      </>
                    )}
                    {b.status?.toLowerCase() !== 'pending' && (
                      <div className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-all select-none
                        ${isDark ? 'bg-slate-800/50 border-slate-700/50 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                        <Key className="w-4 h-4"/>
                        Processed
                      </div>
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
