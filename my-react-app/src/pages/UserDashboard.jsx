import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { getUserBookings } from "../services/bookingService";
import { getProfile } from "../services/authService";
import { useUserTheme } from "../context/UserThemeContext";

const UserDashboard = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const [appointments, setAppointments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "User Dashboard | UniBook";
    setUser(getProfile());
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getUserBookings();
        const active = data.filter(b => b.status !== 'cancelled');
        active.sort((a, b) => {
          const dateA = new Date(a.booking_date);
          const dateB = new Date(b.booking_date);
          if (dateA.getTime() !== dateB.getTime()) {
            return dateA - dateB;
          }
          return a.booking_time.localeCompare(b.booking_time);
        });
        setAppointments(active);
      } catch (err) {
        console.error("Failed to load dashboard bookings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const nextAppointment = appointments.length > 0 ? appointments[0] : null;

  const categories = [
    { name: 'Restaurants', icon: '🍽️', color: 'text-orange-400' },
    { name: 'Futsal', icon: '⚽', color: 'text-blue-400' },
    { name: 'Hospitals', icon: '🏥', color: 'text-emerald-400' },
    { name: 'Salon / Spa', icon: '💆', color: 'text-purple-400' },
  ];

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-500">
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <div className="max-w-7xl mx-auto w-full pt-4">

          <div className={`flex flex-col mb-12 border-b pb-8 transition-colors ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <h1 className={`text-4xl font-black mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className={`text-lg transition-colors font-medium ${isDark ? 'text-white/40' : 'text-slate-500'} max-w-2xl leading-relaxed`}>
              What would you like to book today? Here is your dashboard overview.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            <div className={`col-span-12 lg:col-span-8 group relative rounded-[3rem] p-8 md:p-10 overflow-hidden shadow-2xl transition-all duration-500 border
              ${isDark ? 'bg-white/5 backdrop-blur-2xl border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
               <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
                  <div className="text-[15rem] font-black leading-none -rotate-12 select-none">
                     {nextAppointment?.category === 'Restaurants' ? '🍽️' : nextAppointment?.category === 'Futsal' ? '⚽' : nextAppointment?.category === 'Hospitals' ? '🏥' : '💆'}
                  </div>
               </div>

               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <span className="px-4 py-1.5 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl">Next Appointment</span>
                     <span className={`font-black uppercase tracking-widest text-xs transition-colors ${isDark ? 'text-white/20' : 'text-slate-300'}`}>Confirmed Plans</span>
                  </div>

                  {nextAppointment ? (
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                           <h2 className={`text-4xl md:text-5xl font-black mb-4 tracking-tighter transition-colors group-hover:text-blue-400 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {nextAppointment.provider_name}
                           </h2>
                           <div className={`flex flex-wrap gap-6 transition-colors ${isDark ? 'text-white/60' : 'text-slate-500'}`}>
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>📅</div>
                                 <span className="text-sm font-bold uppercase tracking-widest">{new Date(nextAppointment.booking_date).toLocaleDateString([], { month: 'long', day: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-50 border border-slate-200'}`}>⏱️</div>
                                 <span className="text-sm font-bold uppercase tracking-widest">{nextAppointment.booking_time}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-10 opacity-40">
                        <p className="text-6xl mb-6 text-slate-400">📅</p>
                        <h3 className={`text-2xl font-black uppercase tracking-widest ${isDark ? 'text-white' : 'text-slate-900'}`}>No Active Plans</h3>
                        <button onClick={() => navigate('/services')} className="mt-6 text-blue-500 font-black uppercase tracking-widest text-sm hover:underline">Book your first service →</button>
                     </div>
                  )}
               </div>
            </div>

            <div className="col-span-12 lg:col-span-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6 md:gap-8">
               {[
                  { label: 'Find Services', sub: 'Explore categories', icon: '✨', path: '/services' },
                  { label: 'My Bookings', sub: 'View your plans', icon: '🎫', path: '/my-appointments' },
                  { label: 'Profile Settings', sub: 'Edit your profile', icon: '🛡️', path: '/profile' }
               ].map((item, i) => (
                  <div key={i} onClick={() => navigate(item.path)} 
                     className={`group cursor-pointer border rounded-[2.5rem] p-6 md:p-8 transition-all shadow-xl hover:-translate-y-1 overflow-hidden
                     ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-slate-200/50 shadow-slate-200/20'}`}>
                     <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
                     <h4 className={`text-xl font-black mb-1 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{item.label}</h4>
                     <p className={`text-xs font-black uppercase tracking-[0.1em] transition-colors ${isDark ? 'text-white/30' : 'text-slate-400'}`}>{item.sub}</p>
                  </div>
               ))}
            </div>

          </div>
          
          <div className="mt-16 flex items-center gap-6 overflow-x-auto pb-4 scrollbar-hide transition-all">
             <span className={`text-xs font-black uppercase tracking-[0.2em] transition-colors whitespace-nowrap ${isDark ? 'text-white/20' : 'text-slate-400'}`}>Browse Categories:</span>
             {categories.map((cat, i) => (
                <button key={i} onClick={() => navigate(`/services/${encodeURIComponent(cat.name)}`)} 
                   className={`flex items-center gap-3 px-6 py-3 rounded-full border transition-all whitespace-nowrap group
                     ${isDark ? 'bg-white/5 border-white/10 hover:bg-white hover:text-slate-900' : 'bg-white border-slate-200 hover:bg-slate-900 hover:text-white shadow-sm shadow-slate-200/20'}`}>
                   <span className="text-lg group-hover:scale-125 transition-transform">{cat.icon}</span>
                   <span className={`text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/60 group-hover:text-slate-900' : 'text-slate-700 group-hover:text-white'}`}>
                     {cat.name}
                   </span>
                </button>
             ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
