import { useState, useEffect } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import api from '../services/api';
import { Calendar, User, Clock, CheckCircle2, XCircle, AlertCircle, Search } from 'lucide-react';

import AdminTopHeader from '../components/AdminTopHeader';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const STATUS_CONFIG = {
  confirmed: { label: 'Confirmed', bg: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  pending:   { label: 'Pending',   bg: 'bg-amber-100 text-amber-700',    icon: Clock       },
  cancelled: { label: 'Cancelled', bg: 'bg-rose-100 text-rose-700',      icon: XCircle     },
};

const ProviderBookings = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');

  useEffect(() => {
    document.title = 'My Bookings | Provider Portal';
    api.get('/provider/bookings')
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = !search || b.user_name?.toLowerCase().includes(search.toLowerCase()) || b.user_email?.toLowerCase().includes(search.toLowerCase());
    return matchSearch;
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
        <div className={`rounded-2xl border p-5 mb-6 flex flex-wrap gap-4 items-center ${cardBg}`}>
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by customer name..." className={`${inputCls} w-full pl-9`} />
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
              {/* Table Header */}
              <div className={`grid grid-cols-5 px-8 py-4 border-b text-[10px] font-black uppercase tracking-widest ${isDark ? 'border-slate-800 text-slate-500' : 'border-slate-100 text-slate-400'}`}>
                <span>Customer</span><span>Date</span><span>Time</span><span>Amount</span><span>Status</span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map(b => {
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  const Icon = cfg.icon;
                  return (
                    <div key={b.id} className={`grid grid-cols-5 items-center px-8 py-5 transition-all ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${textPrimary}`}>{b.user_name}</p>
                          <p className={`text-xs ${textSecondary}`}>{b.user_email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className={`w-3.5 h-3.5 ${textSecondary}`} />
                        <span className={`text-sm font-semibold ${textPrimary}`}>{formatDate(b.booking_date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className={`w-3.5 h-3.5 ${textSecondary}`} />
                        <span className={`text-sm font-semibold ${textPrimary}`}>{String(b.booking_time).substring(0,5)}</span>
                      </div>
                      <span className={`text-sm font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                        {b.paid_amount > 0 ? `Rs. ${b.paid_amount}` : '—'}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider w-fit ${cfg.bg}`}>
                        <Icon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProviderBookings;
