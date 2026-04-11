import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getAllBookings, updateBookingStatus } from '../services/bookingService';
import { CheckCircle, Clock, XCircle, CalendarX, AlertCircle, MapPin, CalendarDays, Key, Mail, User, Hash } from 'lucide-react';
import AdminTopHeader from '../components/AdminTopHeader';
import { formatMultiSlotRange } from '../utils/dateUtils';

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
      
      // Filter for confirmed bookings only
      const confirmed = data.filter(b => b.status === 'confirmed');

      // Grouping Logic for Admin View
      const grouped = [];
      const sorted = [...confirmed].sort((a, b) => {
        const d1 = new Date(a.booking_date);
        const d2 = new Date(b.booking_date);
        if (d1 - d2 !== 0) return d1 - d2;
        return a.booking_time.localeCompare(b.booking_time);
      });

      sorted.forEach(booking => {
        const last = grouped[grouped.length - 1];
        
        // Group consecutive 1-hour slots for the same session
        if (last && 
            last.user_id === booking.user_id && 
            last.provider_id === booking.provider_id && 
            last.booking_date === booking.booking_date && 
            last.status === booking.status) {
          
          const lastTime = new Date(`2000-01-01T${last.times[last.times.length - 1]}`);
          lastTime.setMinutes(lastTime.getMinutes() + 60);
          const lastEndTimeStr = lastTime.toTimeString().substring(0, 5);
          
          if (lastEndTimeStr === booking.booking_time.substring(0, 5)) {
            last.times.push(booking.booking_time);
            last.ids.push(booking.id);
            return;
          }
        }
        
        grouped.push({
          ...booking,
          times: [booking.booking_time],
          ids: [booking.id]
        });
      });

      setBookings(grouped);
    } catch (err) {
      toast('Failed to load system bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (group, status) => {
    try {
      await Promise.all(group.ids.map(id => updateBookingStatus(id, status)));
      setBookings(bookings.map(b => group.ids.includes(b.id) ? { ...b, status } : b));
      toast(`Session ${status} successfully!`);
    } catch (err) {
      toast('Operation failed', 'error');
    }
  }

  const getStatusConfig = (status) => {
    return { 
      badge: isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200', 
      Icon: CheckCircle, 
      label: 'Confirmed' 
    };
  }

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const cardBase = isDark ? "bg-slate-900/50 border border-slate-800" : "bg-white border border-slate-200 shadow-sm";

  return (
    <div className="flex min-h-screen transition-colors duration-500 font-inter" 
         style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .booking-table th { padding: 12px 24px; text-align: left; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
        .booking-table td { padding: 16px 24px; font-size: 13px; font-weight: 500; }
      `}</style>
      
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
          metrics={
            <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <span className={`text-xs font-bold uppercase tracking-widest ${textSecondary}`}>Total Bookings:</span>
              <span className={`font-bold text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{bookings.filter(b => b.status === 'confirmed').length}</span>
            </div>
          }
        />

        {loading ? (
          <div className="grid gap-4">
            {[1,2,3].map(i => <div key={i} className={`h-16 rounded-xl animate-pulse border ${isDark ? 'bg-slate-800/50 border-slate-800' : 'bg-white border-slate-200'}`} />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className={`text-center py-20 rounded-xl border transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
             <div className={`w-12 h-12 mx-auto rounded-lg flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'}`}>
                <CalendarX className="w-6 h-6" />
             </div>
             <h3 className={`text-base font-bold ${textPrimary}`}>No active system logs found</h3>
          </div>
        ) : (
          <div className={`overflow-hidden rounded-2xl border transition-all ${cardBase}`}>
            <div className="overflow-x-auto">
              <table className="w-full booking-table border-collapse">
                <thead>
                  <tr className={`${isDark ? 'bg-slate-800/50 border-b border-slate-800 text-slate-500' : 'bg-slate-50 border-b border-slate-100 text-slate-400'}`}>
                    <th><Hash className="w-3 h-3 inline mr-1" />ID</th>
                    <th>Customer</th>
                    <th>Provider / Location</th>
                    <th>Schedule</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                  {bookings.map(b => {
                    const cfg = getStatusConfig(b.status);
                    const StatusIcon = cfg.Icon;
                    
                    return (
                      <tr key={b.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50'}`}>
                        <td className={`font-black ${isDark ? 'text-slate-600' : 'text-slate-300'}`}>#{b.id}</td>
                        <td>
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold leading-none
                              ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                              {b.user_name?.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-bold ${textPrimary}`}>{b.user_name}</p>
                              <p className={`text-[11px] ${textSecondary}`}>{b.user_email}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <MapPin className={`w-4 h-4 ${isDark ? 'text-emerald-500' : 'text-emerald-600'}`} />
                            <div>
                               <p className={`font-bold ${textPrimary}`}>{b.provider_name}</p>
                               <p className={`text-[10px] font-black uppercase tracking-widest ${textSecondary}`}>{b.category}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                               <CalendarDays className={`w-3.5 h-3.5 ${textSecondary}`} />
                               <span className={`font-bold ${textPrimary}`}>{new Date(b.booking_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            </div>
                            <div className="flex items-center gap-2">
                               <Clock className={`w-3.5 h-3.5 ${textSecondary}`} />
                               <span className={`text-[11px] font-bold tracking-tight text-emerald-500`}>
                                 {formatMultiSlotRange(b.times, 60)}
                               </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border transition-all ${cfg.badge}`}>
                             <StatusIcon className="w-3 h-3" />
                             {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageBookings;
