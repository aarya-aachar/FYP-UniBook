import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
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
import { useAdminTheme } from "../context/AdminThemeContext";
import { getAdminMetrics } from "../services/adminService";

const COLORS = ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

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
  const [currentTime, setCurrentTime] = useState(new Date());

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

    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'NPR',
      minimumFractionDigits: 0
    }).format(val).replace('NPR', 'Rs.');
  };

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const statCards = [
    { label: 'Total Users', value: metrics.totals.users, icon: '👥', color: 'from-blue-600 to-indigo-600', shadow: isDark ? 'shadow-blue-900/40' : 'shadow-blue-200/40' },
    { label: 'Service Providers', value: metrics.totals.providers, icon: '🏢', color: 'from-emerald-600 to-teal-600', shadow: isDark ? 'shadow-emerald-900/40' : 'shadow-emerald-200/40' },
    { label: 'Active Bookings', value: metrics.totals.bookings, icon: '📅', color: 'from-amber-600 to-orange-600', shadow: isDark ? 'shadow-amber-900/40' : 'shadow-amber-200/40' },
    { label: 'Total Revenue', value: formatCurrency(metrics.totals.revenue), icon: '💰', color: 'from-purple-600 to-pink-600', shadow: isDark ? 'shadow-purple-900/40' : 'shadow-purple-200/40' },
  ];

  const cardBase = isDark
    ? "bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
    : "bg-white border border-slate-200 shadow-xl shadow-slate-200/20";

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-500";
  const textMuted = isDark ? "text-white/20" : "text-slate-400";

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>

      <div className="flex min-h-screen transition-colors duration-500 font-inter"
        style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Sidebar />

        <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full overflow-hidden">
          <div className="mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h1 className={`text-4xl font-black tracking-tight mb-2 transition-colors ${textPrimary}`}>Admin Dashboard</h1>
            <p className={`text-lg font-medium flex items-center gap-3 transition-colors ${textSecondary}`}>
              <span className={isDark ? "text-blue-400" : "text-blue-600"}>📅</span> {formattedDate}
              <span className={`mx-2 text-xl font-thin opacity-20 ${textPrimary}`}>|</span>
              <span className={`font-black tracking-widest opacity-90 ${textPrimary}`}>{formattedTime}</span>
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((card, i) => (
              <div key={i}
                className={`rounded-[3rem] p-8 transition-all duration-300 hover:-translate-y-1 ${cardBase}`}
                style={{ animation: `fadeIn 0.5s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-3xl shadow-xl ${card.shadow} mb-6`}>
                  {card.icon}
                </div>
                <h3 className={`text-xs font-black uppercase tracking-[0.2em] mb-2 ${textSecondary}`}>{card.label}</h3>
                <p className={`text-3xl font-black tabular-nums tracking-tighter ${textPrimary}`}>
                  {loading ? '---' : card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className={`lg:col-span-2 rounded-[3rem] p-10 transition-all duration-500 ${cardBase}`}
              style={{ animation: 'fadeIn 0.6s ease-out 0.4s forwards', opacity: 0 }}>
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h2 className={`text-2xl font-black tracking-tight mb-1 transition-colors ${textPrimary}`}>
                    Revenue Statistics
                  </h2>
                  <p className={`text-sm font-bold transition-colors ${textSecondary}`}>
                    Platform revenue growth over time
                  </p>
                </div>
                <div className={`font-black uppercase tracking-[0.2em] text-xs px-5 py-2 rounded-full border shadow-sm
                  ${isDark ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' : 'text-emerald-600 bg-emerald-50 border-emerald-100 shadow-emerald-200/10'}`}>
                  Live Analysis
                </div>
              </div>

              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={metrics.revenueTrends}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.4)', fontSize: 12, fontWeight: 900 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '24px',
                        color: isDark ? '#fff' : '#1e293b',
                        fontSize: '14px',
                        fontWeight: '900',
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                        fontFamily: 'Inter, sans-serif',
                        padding: '16px 24px'
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#3b82f6"
                      strokeWidth={5}
                      fillOpacity={1}
                      fill="url(#colorValue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`rounded-[3rem] p-10 flex flex-col items-center transition-all duration-500 ${cardBase}`}
              style={{ animation: 'fadeIn 0.6s ease-out 0.5s forwards', opacity: 0 }}>
              <h3 className={`text-xl font-black mb-10 self-start tracking-tight ${textPrimary}`}>Service Types</h3>
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.chartData.length ? metrics.chartData : [{ name: "Waiting...", value: 1 }]}
                      dataKey="value"
                      innerRadius={75}
                      outerRadius={100}
                      paddingAngle={10}
                      stroke="none"
                    >
                      {(metrics.chartData.length ? metrics.chartData : [{ name: "Waiting...", value: 1 }]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                        borderRadius: '24px',
                        color: isDark ? '#fff' : '#1e293b',
                        padding: '15px 25px',
                        fontWeight: '900',
                        boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '24px', fontSize: '13px', fontWeight: '900', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.5)', letterSpacing: '0.5px', textTransform: 'uppercase' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className={`mt-8 rounded-[3rem] p-10 transition-all duration-500 ${cardBase}`}
            style={{ animation: 'fadeIn 0.6s ease-out 0.7s forwards', opacity: 0 }}>
            <div className="flex justify-between items-end mb-10">
              <div>
                <h3 className={`text-2xl font-black tracking-tight ${textPrimary}`}>Recent System Activity</h3>
                <p className={`text-sm mt-2 font-bold transition-colors ${textSecondary}`}>Live updates on user and provider actions</p>
              </div>
              <Link to="/dashboard/admin/bookings" className="text-blue-500 text-sm font-black tracking-widest uppercase hover:underline">View All →</Link>
            </div>

            <div className="space-y-6">
              {loading ? [1, 2, 3].map(i => <div key={i} className={`h-24 rounded-3xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />) :
                metrics.recentActivity.map((activity, i) => (
                  <div key={i} className={`flex items-center gap-6 p-8 rounded-[2rem] border hover:scale-[1.01] transition-all group
                    ${isDark ? 'bg-white/[0.02] border-white/5 hover:bg-white/5' : 'bg-white border-slate-100 hover:bg-slate-50 shadow-sm shadow-slate-200/10'}`}
                    style={{ animation: `slideRight 0.5s ease-out ${0.8 + i * 0.1}s forwards`, opacity: 0 }}>
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-colors
                        ${isDark ? 'bg-white/5 text-white group-hover:bg-blue-500/20 group-hover:text-blue-400' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 border border-slate-100 shadow-slate-200/20'}`}>
                      {activity.status === 'confirmed' ? '✅' : '⏳'}
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`font-black text-base leading-none transition-colors ${textPrimary}`}>{activity.user}</span>
                        <span className={`text-sm font-bold tracking-tight lowercase ${textSecondary}`}>booked</span>
                        <span className={`font-black text-base leading-none transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{activity.provider}</span>
                      </div>
                      <p className={`text-xs font-black tracking-[0.2em] mt-3 uppercase transition-colors ${textMuted}`}>
                        {new Date(activity.created_at).toLocaleString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-[0.2em] border transition-all
                        ${activity.status === 'confirmed'
                        ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-200/10')
                        : (isDark ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-50 text-amber-600 border-amber-100 shadow-amber-200/10')}`}>
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
