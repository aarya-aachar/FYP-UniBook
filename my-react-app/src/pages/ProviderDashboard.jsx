import { useState, useEffect } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import api from '../services/api';
import { 
  Calendar, CheckCircle2, Clock, TrendingUp,
  User, ArrowRight, DollarSign
} from 'lucide-react';
import { formatMultiSlotRange } from '../utils/dateUtils';
import { useNavigate } from 'react-router-dom';
import AdminTopHeader from '../components/AdminTopHeader';

const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const formatCurrency = (val) => {
  if (val === undefined || val === null || isNaN(val)) return 'Rs. 0';
  return `Rs. ${Number(val).toLocaleString()}`;
};

const StatCard = ({ title, value, icon: Icon, color, bg, border, isDark }) => (
  <div className={`rounded-2xl border p-6 flex items-center gap-5 ${bg} ${border} transition-all hover:shadow-md`}>
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-7 h-7" />
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">{title}</p>
      <p className={`text-3xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{value ?? '—'}</p>
    </div>
  </div>
);

const ProviderDashboard = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Provider Dashboard | UniBook';
    
    const fetchDashboard = () => {
      setLoading(true);
      // Cache-busting with timestamp
      api.get(`/provider/dashboard?t=${Date.now()}`)
        .then(res => {
          console.log('>>> [FRONTEND] Dashboard Data Received:', res.data);
          setData(res.data);
        })
        .catch(err => console.error('>>> [FRONTEND ERROR]', err))
        .finally(() => setLoading(false));
    };

    fetchDashboard();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchDashboard, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const textPrimary   = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg        = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200';

  return (
    <div className="flex min-h-screen font-inter transition-colors duration-300" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <ProviderSidebar isDark={isDark} />

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden flex flex-col">
        {/* Header directly matched to Admin UI */}
        <AdminTopHeader 
          title={data?.provider?.name || 'Dashboard'}
          subtitle={data ? `${data.provider.category} — Here's an overview of your service activity.` : 'Loading overview...'}
        />

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <div key={i} className={`h-28 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />)}
          </div>
        ) : (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
              <StatCard isDark={isDark} title="Total Bookings"   value={data?.stats?.total}    icon={Calendar}      color="bg-emerald-500/10 text-emerald-600" bg={isDark ? 'bg-slate-900' : 'bg-white'} border={isDark ? 'border-slate-800' : 'border-slate-200'} />
              <StatCard isDark={isDark} title="Upcoming"         value={data?.stats?.upcoming}  icon={TrendingUp}    color="bg-blue-500/10 text-blue-600"     bg={isDark ? 'bg-slate-900' : 'bg-white'} border={isDark ? 'border-slate-800' : 'border-slate-200'} />
              <StatCard isDark={isDark} title="Completed"        value={data?.stats?.completed} icon={CheckCircle2}  color="bg-teal-500/10 text-teal-600"     bg={isDark ? 'bg-slate-900' : 'bg-white'} border={isDark ? 'border-slate-800' : 'border-slate-200'} />
              <StatCard isDark={isDark} title="Total Revenue"   value={formatCurrency(data?.stats?.revenue)}   icon={DollarSign}    color="bg-emerald-600/10 text-emerald-600"   bg={isDark ? 'bg-slate-900' : 'bg-white'} border={isDark ? 'border-slate-800' : 'border-slate-200'} />
            </div>

            {/* Recent Bookings */}
            <div className={`rounded-3xl border shadow-sm overflow-hidden ${cardBg}`}>
              <div className={`flex items-center justify-between px-8 py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
                <h2 className={`text-lg font-black tracking-tight ${textPrimary}`}>Recent Bookings</h2>
                <button onClick={() => navigate('/provider/bookings')}
                  className={`flex items-center gap-1.5 text-xs font-black uppercase tracking-widest cursor-pointer ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}>
                  View All <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
              {data?.recentBookings?.length === 0 ? (
                <div className="py-16 text-center">
                  <Calendar className={`w-10 h-10 mx-auto mb-3 opacity-20 ${textSecondary}`} />
                  <p className={`text-sm font-bold ${textSecondary}`}>No bookings yet</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(data?.recentBookings || []).map((b, idx) => (
                    <div key={idx} className={`flex items-center justify-between px-8 py-4 transition-all ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60'}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className={`text-sm font-bold ${textPrimary}`}>{b.user_name}</p>
                          <p className={`text-xs font-medium ${textSecondary}`}>{formatDate(b.booking_date)} • {formatMultiSlotRange(b.times, 60)}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700`}>confirmed</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProviderDashboard;
