import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { Users, Building2, CalendarCheck, DollarSign, CheckCircle2, Clock, Calendar, Activity } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import Sidebar from "../components/Sidebar";
import AdminTopHeader from "../components/AdminTopHeader";
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminMetrics } from "../services/adminService";

const COLORS = ["#10B981", "#0D9488", "#14B8A6", "#059669", "#34D399"];

const AdminDashboard = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [metrics, setMetrics] = useState({
    totals: { users: 0, providers: 0, bookings: 0, revenue: 0 },
    chartData: [],
    revenueTrends: [],
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin Dashboard | UniBook";

    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const data = await getAdminMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(val).replace('NPR', 'Rs.');
  };


  const statCards = [
    { label: 'Total Users', value: metrics.totals.users, icon: <Users className="w-5 h-5"/>, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Service Providers', value: metrics.totals.providers, icon: <Building2 className="w-5 h-5"/>, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { label: 'Active Bookings', value: metrics.totals.bookings, icon: <CalendarCheck className="w-5 h-5"/>, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Total Revenue', value: formatCurrency(metrics.totals.revenue), icon: <DollarSign className="w-5 h-5"/>, color: 'text-emerald-600', bg: 'bg-emerald-600/10' },
  ];

  const cardBase = isDark
    ? "bg-slate-900 border border-slate-800"
    : "bg-white border border-slate-200 shadow-sm";

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="flex min-h-screen transition-colors duration-300 font-inter"
        style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
        <Sidebar />

        <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden">
        <AdminTopHeader 
          title="Dashboard Overview" 
          subtitle="Monitor system metrics and platform health." 
          showTimestamp={true}
        />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => (
              <div key={i}
                className={`rounded-xl p-5 transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600 ${cardBase}`}
                style={{ animation: `fadeIn 0.4s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>{card.label}</h3>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${card.bg} ${card.color}`}>
                    {card.icon}
                  </div>
                </div>
                <p className={`text-2xl font-bold tracking-tight ${textPrimary}`}>
                  {loading ? '---' : card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-6">
            <div className={`lg:col-span-2 rounded-xl p-6 transition-all duration-300 ${cardBase}`}
              style={{ animation: 'fadeIn 0.5s ease-out 0.2s forwards', opacity: 0 }}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className={`text-base font-bold transition-colors ${textPrimary}`}>Revenue Trends</h2>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>
                  <Activity className="w-3 h-3" /> Live
                </div>
              </div>

              <div className="w-full h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.revenueTrends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12, fontWeight: 500 }} dx={-10} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        padding: '10px 14px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#10B981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`rounded-xl p-6 flex flex-col transition-all duration-300 ${cardBase}`}
              style={{ animation: 'fadeIn 0.5s ease-out 0.3s forwards', opacity: 0 }}>
              <h2 className={`text-base font-bold mb-6 transition-colors ${textPrimary}`}>Service Distribution</h2>
              <div className="w-full flex-1 min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.chartData.length ? metrics.chartData : [{ name: "Waiting...", value: 1 }]}
                      dataKey="value"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      stroke="none"
                    >
                      {(metrics.chartData.length ? metrics.chartData : [{ name: "Waiting...", value: 1 }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#0f172a' : '#ffffff',
                        border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: isDark ? '#f8fafc' : '#0f172a',
                        padding: '10px 14px',
                        fontSize: '13px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: '500', color: isDark ? '#94a3b8' : '#64748b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-6 transition-all duration-300 ${cardBase}`}
            style={{ animation: 'fadeIn 0.5s ease-out 0.4s forwards', opacity: 0 }}>
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-base font-bold transition-colors ${textPrimary}`}>Recent Activity Log</h2>
              <Link to="/dashboard/admin/bookings" className={`text-sm font-medium hover:underline ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>View All</Link>
            </div>

            <div className="space-y-3">
              {loading ? [1, 2, 3].map(i => <div key={i} className={`h-16 rounded-lg animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />) :
                metrics.recentActivity.map((activity, i) => (
                  <div key={i} className={`flex items-center gap-4 p-4 rounded-lg border transition-all
                    ${isDark ? 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-slate-200'}`}
                    style={{ animation: `fadeIn 0.4s ease-out ${0.5 + i * 0.1}s forwards`, opacity: 0 }}>
                    <div className={`w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0
                        ${isDark ? 'bg-slate-900 border border-slate-700 text-slate-400' : 'bg-white border border-slate-200 text-slate-500 shadow-sm'}`}>
                      {activity.status === 'confirmed' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Clock className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${textPrimary}`}>
                        <span className="font-semibold">{activity.user}</span> booked <span className="font-semibold">{activity.provider}</span>
                      </p>
                      <p className={`text-xs mt-0.5 ${textMuted}`}>
                        {new Date(activity.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                        ${activity.status === 'confirmed'
                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                        : (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200')}`}>
                      {activity.status}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
