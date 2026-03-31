import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import Sidebar from "../components/Sidebar";
import { getAdminMetrics } from "../services/adminService";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totals: { users: 0, providers: 0, bookings: 0, reports: 0 },
    chartData: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Admin | Dashboard - UniBook";
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

  const statCards = [
    { label: 'Total Users', value: metrics.totals.users, icon: '👥', color: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-900/40' },
    { label: 'Providers', value: metrics.totals.providers, icon: '🏢', color: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-900/40' },
    { label: 'Bookings', value: metrics.totals.bookings, icon: '📅', color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-900/40' },
    { label: 'Reports', value: metrics.totals.reports, icon: '📊', color: 'from-rose-500 to-pink-600', shadow: 'shadow-rose-900/40' },
  ];

  const quickLinks = [
    { to: '/dashboard/admin/users', label: 'Users', icon: '👥', desc: 'Securely manage all accounts' },
    { to: '/dashboard/admin/providers', label: 'Providers', icon: '🏢', desc: 'Configure service entities' },
    { to: '/dashboard/admin/bookings', label: 'Bookings', icon: '📅', desc: 'Monitor real-time reservations' },
    { to: '/dashboard/admin/reports', label: 'Reports', icon: '📊', desc: 'System-wide analytics' },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
      `}</style>

      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0a0f1e 0%, #111827 50%, #0a0f1e 100%)' }}>
        <Sidebar />

        <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="mb-12" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-3">System Pulse</h1>
            <p className="text-white/30 text-xl font-medium">Global administrative overview and live telemetry</p>
          </div>

          {/* Stats Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {statCards.map((card, i) => (
              <div key={i} 
                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-7 transition-all duration-500 hover:border-white/20 hover:bg-white/10 hover:-translate-y-2 shadow-2xl"
                style={{ animation: `fadeIn 0.6s ease-out ${i * 0.1}s forwards`, opacity: 0 }}>
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-3xl shadow-xl ${card.shadow} mb-6`}>
                  {card.icon}
                </div>
                <h3 className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mb-1">{card.label}</h3>
                <p className="text-4xl font-black text-white tabular-nums tracking-tighter">
                  {loading ? '---' : card.value}
                </p>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-5">
              {quickLinks.map((link, i) => (
                <Link key={i} to={link.to} 
                  className="group bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 transition-all duration-300 hover:border-blue-500/40 hover:bg-white/10 shadow-xl flex flex-col gap-4"
                  style={{ animation: `fadeIn 0.6s ease-out ${0.4 + i * 0.1}s forwards`, opacity: 0 }}>
                  <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{link.icon}</div>
                  <div>
                    <h3 className="text-white font-black text-2xl mb-1 tracking-tight">{link.label}</h3>
                    <p className="text-white/30 text-base font-medium leading-relaxed">{link.desc}</p>
                    <div className="mt-5 text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 group-hover:gap-4 transition-all">
                      ACCESS ENGINE <span className="text-xl">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Distribution Chart */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3.5rem] p-8 shadow-2xl flex flex-col items-center"
              style={{ animation: 'scaleIn 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.8s forwards', opacity: 0 }}>
              <h3 className="text-2xl font-black text-white mb-8 self-start tracking-tight">Service Mesh</h3>
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.chartData.length ? metrics.chartData : [{name:"Waiting...", value: 1}]}
                      dataKey="value"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={10}
                      stroke="none"
                    >
                      {(metrics.chartData.length ? metrics.chartData : [{name:"Waiting...", value: 1}]).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="focus:outline-none drop-shadow-2xl" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', color: '#fff', padding: '15px 25px', fontWeight: '900', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ paddingTop: '30px', fontSize: '13px', fontWeight: '900', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;
