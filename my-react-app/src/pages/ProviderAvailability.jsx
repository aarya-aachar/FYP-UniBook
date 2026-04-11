import { useState, useEffect } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import api from '../services/api';
import { Calendar, Clock, UserCheck, UserPlus, Info, AlertCircle, Search } from 'lucide-react';
import AdminTopHeader from '../components/AdminTopHeader';
import { formatTime, formatTimeRange } from '../utils/dateUtils';

const ProviderAvailability = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    document.title = 'Availability Tracker | Provider Portal';
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [profRes, bookRes] = await Promise.all([
        api.get('/provider/profile'),
        api.get('/provider/bookings')
      ]);
      setProfile(profRes.data);
      setBookings(bookRes.data);
    } catch (err) {
      console.error('Failed to fetch availability data', err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlots = () => {
    if (!profile) return [];
    let { opening_time, closing_time } = profile;
    opening_time = opening_time || '09:00:00';
    closing_time = closing_time || '18:00:00';

    const slots = [];
    let current = new Date(`2000-01-01T${opening_time}`);
    const end = new Date(`2000-01-01T${closing_time}`);

    while (current < end) {
      const time = current.toTimeString().substring(0, 5);
      slots.push(time);
      current.setMinutes(current.getMinutes() + 60);
    }
    return slots;
  };

  const getSlotDetails = (time) => {
    const capacity = profile?.capacity || 1;
    // Filter bookings by date and time
    const filled = bookings.filter(b => {
      // Handle both plain "2026-04-11" and ISO "2026-04-11T00:00:00.000Z" formats
      const bDate = b.booking_date.includes('T') ? b.booking_date.split('T')[0] : b.booking_date;
      const bTime = (b.booking_time || '').substring(0, 5);
      return bDate === selectedDate && bTime === time && b.status !== 'cancelled';
    }).length;

    const left = Math.max(0, capacity - filled);
    const percentage = Math.min(100, (filled / capacity) * 100);
    
    return { filled, left, capacity, percentage };
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800 shadow-xl' : 'bg-white border-slate-100 shadow-sm';
  const slots = generateSlots();

  return (
    <div className="flex min-h-screen font-inter" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <ProviderSidebar isDark={isDark} />

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        <AdminTopHeader 
          title="Availability Tracker"
          subtitle="Monitor filled slots and remaining capacity for any date."
        />

        {/* Date Selector */}
        <div className={`rounded-2xl border p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 ${cardBg}`}>
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDark ? 'bg-emerald-500/10 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                 <Calendar className="w-6 h-6" />
              </div>
              <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Selected View</p>
                 <h3 className={`text-lg font-bold ${textPrimary}`}>{new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
              </div>
           </div>
           
           <div className="relative min-w-[240px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input 
                type="date" 
                value={selectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setSelectedDate(e.target.value)}
                className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-bold outline-none transition-all ${isDark ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500 focus:bg-white'}`}
              />
           </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <div key={i} className={`h-40 rounded-3xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />)}
          </div>
        ) : slots.length === 0 ? (
          <div className={`py-20 text-center rounded-3xl border border-dashed ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
             <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-20 text-slate-500" />
             <p className={`text-sm font-bold ${textSecondary}`}>No slots configured in service settings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map(time => {
              const { filled, left, capacity, percentage } = getSlotDetails(time);
              const isFull = left === 0;
              
              return (
                <div key={time} className={`relative rounded-3xl p-6 border transition-all hover:scale-[1.02] duration-300 ${cardBg} ${isFull ? 'border-rose-500/30' : ''}`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col gap-1">
                         <div className="flex items-center gap-2">
                           <Clock className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                           <span className={`text-sm font-black tracking-tight ${textPrimary}`}>
                              {formatTimeRange(time, 60)}
                           </span>
                         </div>
                         {isFull && <span className="text-[10px] font-black uppercase text-rose-500 tracking-widest">Fully Booked</span>}
                      </div>
                      <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${isFull ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                        {percentage.toFixed(0)}%
                      </div>
                   </div>

                   <div className="space-y-4 mb-6">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-emerald-500" />
                            <span className={`text-xs font-bold ${textSecondary}`}>Slots Filled</span>
                         </div>
                         <span className={`text-sm font-black ${textPrimary}`}>{filled}</span>
                      </div>
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-sky-500" />
                            <span className={`text-xs font-bold ${textSecondary}`}>Slots Left</span>
                         </div>
                         <span className={`text-sm font-black ${textPrimary}`}>{left}</span>
                      </div>
                   </div>

                   {/* Progress Bar */}
                   <div className={`h-2 w-full rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div 
                        className={`h-full transition-all duration-700 ${isFull ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                   </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info */}
        <div className={`mt-10 p-6 rounded-3xl border border-dashed flex items-start gap-4 transition-all ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
           <Info className="w-6 h-6 text-emerald-500 shrink-0 mt-0.5" />
           <div>
              <h4 className={`text-sm font-bold mb-1 ${textPrimary}`}>How capacity works</h4>
              <p className={`text-xs leading-relaxed ${textSecondary}`}>
                Capacity is based on your "Service Settings". If you have a capacity of {profile?.capacity || 1}, you can accept up to {profile?.capacity || 1} distinct bookings for each 1-hour slot. Rescheduling a booking will instantly update these numbers.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderAvailability;
