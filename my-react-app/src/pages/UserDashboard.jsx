import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { getUserBookings } from "../services/bookingService";
import { getProfile } from "../services/authService";

const UserDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "User | Dashboard - UniBook";
    setUser(getProfile());
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getUserBookings();
        // filter out cancelled
        const active = data.filter(b => b.status !== 'cancelled');
        setAppointments(active.slice(0, 3)); // show top 3 upcoming
      } catch (err) {
        console.error("Failed to load dashboard bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const stats = [
    { label: 'Active Bookings', value: appointments.length, icon: '📅', color: 'from-blue-500 to-indigo-600' },
    { label: 'Pending confirmed', value: appointments.filter(a => a.status === 'pending').length, icon: '⏳', color: 'from-amber-500 to-orange-600' },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideIn { from { transform: translateX(-30px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `}</style>

      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <UserSidebar />

        <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full">
          
          {/* Welcome Header */}
          <div className="mb-12" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-widest mb-4">
              ✨ Welcome back
            </div>
            <h1 className="text-4xl font-black text-white tracking-tight leading-none mb-2">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">{user?.name || 'User'}</span>
            </h1>
            <p className="text-white/40 text-lg font-medium mt-2">What would you like to book today?</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-10">
            {/* Left Column: Quick Actions & Stats */}
            <div className="lg:col-span-2 space-y-10">
              
              {/* Quick Actions Grid */}
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  { to: '/services', label: 'Book New', sub: 'Find expert services', icon: '✨', gradient: 'hover:border-blue-500/40' },
                  { to: '/my-appointments', label: 'My Bookings', sub: 'Manage appointments', icon: '📅', gradient: 'hover:border-indigo-500/40' },
                  { to: '/profile', label: 'My Profile', sub: 'Update your info', icon: '👤', gradient: 'hover:border-purple-500/40' },
                  { to: '/my-reports', label: 'Analytics', sub: 'View booking trends', icon: '📊', gradient: 'hover:border-emerald-500/40' },
                ].map((item, i) => (
                  <Link key={i} to={item.to} 
                    className={`group bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 transition-all duration-300 shadow-xl flex flex-col gap-4 ${item.gradient} hover:bg-white/10`}
                    style={{ animation: `fadeIn 0.6s ease-out ${0.2 + i * 0.1}s forwards`, opacity: 0 }}>
                    <div className="text-5xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">{item.icon}</div>
                    <div>
                      <h3 className="text-white font-black text-2xl mb-1">{item.label}</h3>
                      <p className="text-white/30 text-sm font-medium leading-relaxed">{item.sub}</p>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Snapshot Stats */}
              <div className="grid sm:grid-cols-2 gap-5">
                {stats.map((s, i) => (
                  <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 flex items-center gap-5"
                       style={{ animation: `fadeIn 0.6s ease-out ${0.6 + i * 0.1}s forwards`, opacity: 0 }}>
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {s.icon}
                    </div>
                    <div>
                      <p className="text-white/30 text-xs font-bold uppercase tracking-widest">{s.label}</p>
                      <p className="text-3xl font-black text-white">{loading ? '...' : s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Upcoming Sidebar */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xl font-black text-white tracking-tight">Timeline</h3>
                <Link to="/my-appointments" className="text-blue-400 text-xs font-black uppercase tracking-widest hover:text-blue-300 transition-colors">See all →</Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  [1,2].map(i => <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse border border-white/10" />)
                ) : appointments.length > 0 ? (
                  appointments.map((a, i) => (
                    <div key={a.id} 
                      className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-white/20 shadow-lg"
                      style={{ animation: `slideIn 0.5s ease-out ${0.8 + i * 0.1}s forwards`, opacity: 0 }}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-xl">
                          {a.category === 'Restaurants' ? '🍽️' : a.category === 'Futsal' ? '⚽' : a.category === 'Hospitals' ? '🏥' : '💆'}
                        </div>
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border 
                          ${a.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                          {a.status}
                        </span>
                      </div>
                      <h4 className="font-black text-white text-lg tracking-tight truncate">{a.provider_name}</h4>
                      <div className="mt-2 space-y-1">
                        <p className="text-white/40 text-xs font-bold uppercase flex items-center gap-2">
                          <span className="opacity-40 tracking-normal text-sm">🗓️</span> {new Date(a.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-white/40 text-xs font-bold uppercase flex items-center gap-2">
                          <span className="opacity-40 tracking-normal text-sm">⏰</span> {a.booking_time}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="text-white/30 text-sm font-bold uppercase tracking-widest">No upcoming events</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
