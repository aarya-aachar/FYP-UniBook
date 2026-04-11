import { useState, useEffect, useRef } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import api from '../services/api';
import { Calendar, User, Clock, CheckCircle2, XCircle, AlertCircle, Search, RotateCcw, X, ShieldAlert } from 'lucide-react';
import AdminTopHeader from '../components/AdminTopHeader';
import { formatTime, formatTimeRange, getLocalDate, formatMultiSlotRange } from '../utils/dateUtils';

const formatDate = (d) => {
  const local = getLocalDate(d);
  if (!local) return '';
  const [year, month, day] = local.split('-');
  return new Date(year, month - 1, day).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
};

const ProviderBookings = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const [bookings, setBookings] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');
  
  // Reschedule State
  const [rescheduleBooking, setRescheduleBooking] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [rescheduling, setRescheduling] = useState(false);

  useEffect(() => {
    document.title = 'My Bookings | Provider Portal';
    fetchBookings();
  }, []);

  const fetchBookings = () => {
    setLoading(true);
    Promise.all([
      api.get('/provider/bookings'),
      api.get('/provider/profile')
    ])
      .then(([bookingsRes, profileRes]) => {
        const raw = bookingsRes.data;
        
        // Grouping Logic for Provider View
        const grouped = [];
        const sorted = [...raw].sort((a, b) => {
          const dateDiff = new Date(a.booking_date) - new Date(b.booking_date);
          if (dateDiff !== 0) return dateDiff;
          return a.booking_time.localeCompare(b.booking_time);
        });

        sorted.forEach(booking => {
          const last = grouped[grouped.length - 1];
          // Merge if same user, date, status AND is consecutive
          if (last && 
              last.user_id === booking.user_id && 
              last.booking_date === booking.booking_date && 
              last.status === booking.status) {
            
            const lastTime = new Date(`2000-01-01T${last.times[last.times.length - 1]}`);
            lastTime.setMinutes(lastTime.getMinutes() + 60);
            const lastEndTimeStr = lastTime.toTimeString().substring(0, 5);
            
            if (lastEndTimeStr === booking.booking_time.substring(0, 5)) {
              last.times.push(booking.booking_time);
              last.ids.push(booking.id);
              // Sum up the paid amount for the group
              last.paid_amount = (parseFloat(last.paid_amount) + parseFloat(booking.paid_amount)).toFixed(2);
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
        setProfile(profileRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  const handleReschedule = async () => {
    if (!newDate || !newTime) return alert('Please select both date and time.');
    
    // Calculate tomorrow's date at midnight local time
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const selectedDateObj = new Date(newDate + 'T00:00:00'); // Ensure local parsing

    if (selectedDateObj < tomorrow) {
      return alert('Cannot select today or past dates. Please pick a date starting from tomorrow.');
    }

    if (profile) {
      const opening = profile.opening_time || '09:00:00';
      const closing = profile.closing_time || '18:00:00';
      
      const selectedTime = newTime.length === 5 ? newTime + ':00' : newTime;
      if (selectedTime < opening || selectedTime >= closing) {
         return alert(`Please select a time within your working hours: ${opening.substring(0,5)} to ${closing.substring(0,5)}`);
      }
    }

    try {
      setRescheduling(true);
      await api.put(`/provider/bookings/${rescheduleBooking.id}/reschedule`, {
        booking_date: newDate,
        booking_time: newTime
      });
      fetchBookings();
      setRescheduleBooking(null);
      alert('Booking rescheduled successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reschedule.');
    } finally {
      setRescheduling(false);
    }
  };

  const filtered = bookings.filter(b => {
    const matchSearch = !search || b.user_name?.toLowerCase().includes(search.toLowerCase()) || b.user_email?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch || b.status !== 'confirmed') return false;

    if (filter === 'all') return true;

    const now = new Date();
    const bookingDateStr = b.booking_date.split('T')[0];
    const lastTime = b.times[b.times.length - 1]; // e.g. "09:00:00"
    const bookingEndDateTime = new Date(`${bookingDateStr}T${lastTime}`);
    bookingEndDateTime.setMinutes(bookingEndDateTime.getMinutes() + 60);

    if (filter === 'upcoming') {
      return bookingEndDateTime >= now;
    }
    if (filter === 'completed') {
      return bookingEndDateTime < now;
    }
    
    return true;
  });

  const textPrimary   = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg        = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';
  const inputCls      = `px-4 py-2.5 rounded-xl border text-sm font-medium outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500'}`;

  return (
    <div className="flex min-h-screen font-inter" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <ProviderSidebar isDark={isDark} />

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        <AdminTopHeader 
          title="My Bookings"
          subtitle="All bookings for your service"
        />

        {/* Filters */}
        <div className={`rounded-2xl border p-5 mb-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between ${cardBg}`}>
          <div className="relative flex-1 w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer name..." className={`${inputCls} w-full pl-9`} />
          </div>
          <div className="flex items-center">
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className={`${inputCls} min-w-[160px] cursor-pointer appearance-none`}
              style={{ backgroundImage: `url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2310b981%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem top 50%', backgroundSize: '0.65rem auto', paddingRight: '2.5rem' }}
            >
              <option value="all">All Bookings</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
          {loading ? (
            <div className="p-8 space-y-4">
              {[1,2,3,4,5].map(i => <div key={i} className={`h-16 rounded-xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <AlertCircle className={`w-10 h-10 mx-auto mb-3 opacity-20 ${textSecondary}`} />
              <p className={`text-sm font-bold ${textSecondary}`}>No bookings found</p>
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-5 px-8 py-4 border-b text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                <span className="col-span-2">Customer</span><span>Schedule</span><span>Amount</span><span>Status</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(b => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <div key={b.id} className={`grid grid-cols-5 items-center px-8 py-5 transition-all ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'}`}>
                      <div className="col-span-2 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${textPrimary}`}>{b.user_name}</p>
                          <p className={`text-xs ${textSecondary}`}>{b.user_email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <Calendar className={`w-3.5 h-3.5 ${textSecondary}`} />
                          <span className={`text-sm font-semibold ${textPrimary}`}>{formatDate(b.booking_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Clock className={`w-3.5 h-3.5 text-emerald-500`} />
                           <span className={`text-[11px] font-black text-emerald-500`}>{formatMultiSlotRange(b.times, 60)}</span>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {b.paid_amount > 0 ? `Rs. ${b.paid_amount}` : '—'}
                      </span>
                      <div className="flex items-center justify-between">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${cfg.bg}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                        
                        {/* Inline Reschedule button since we removed Actions column */}
                         {b.status === 'confirmed' && (
                           <button 
                             onClick={() => {
                               setRescheduleBooking(b);
                               setNewDate(b.booking_date.split('T')[0]);
                               setNewTime(b.booking_time.substring(0, 5));
                             }}
                             className={`p-2 rounded-lg border transition-all hover:shadow-lg cursor-pointer ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/50' : 'bg-white border-slate-200 text-slate-500 hover:text-emerald-600 hover:border-emerald-200'}`}
                             title="Reschedule Booking"
                           >
                             <RotateCcw className="w-4 h-4" />
                           </button>
                         )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleBooking && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setRescheduleBooking(null)} />
           <div className={`relative w-full max-w-md rounded-3xl p-8 border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className={`text-xl font-bold ${textPrimary}`}>Reschedule Booking</h3>
                    <p className={`text-sm font-medium ${textSecondary}`}>Changing time for {rescheduleBooking.user_name}</p>
                 </div>
                 <button onClick={() => setRescheduleBooking(null)} className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-100 text-slate-400'}`}>
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-5">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pick New Date</label>
                    <input 
                      type="date" 
                      min={(() => {
                        const t = new Date();
                        t.setDate(t.getDate() + 1);
                        return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
                      })()}
                      value={newDate} 
                      onChange={e => setNewDate(e.target.value)}
                      className={inputCls + " w-full"} 
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Pick New Time (1-hour block)</label>
                    <input 
                      type="time" 
                      step="3600"
                      value={newTime} 
                      onChange={e => setNewTime(e.target.value)}
                      className={inputCls + " w-full"} 
                    />
                 </div>
                 
                 <div className={`p-4 rounded-2xl border flex items-start gap-4 ${isDark ? 'bg-amber-500/5 border-amber-500/10' : 'bg-amber-50 border-amber-100'}`}>
                    <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-medium text-amber-600 dark:text-amber-500 leading-relaxed">
                       A notification will be sent to the customer immediately after you confirm the new time.
                    </p>
                 </div>

                 <button 
                   onClick={handleReschedule}
                   disabled={rescheduling}
                   className={`w-full py-4 rounded-2xl bg-emerald-600 text-white font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all cursor-pointer shadow-lg shadow-emerald-500/20 ${rescheduling ? 'opacity-50 cursor-not-allowed' : ''}`}
                 >
                   {rescheduling ? 'Updating Schedule...' : 'Confirm Reschedule'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;
