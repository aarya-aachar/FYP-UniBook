import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { getUserBookings } from "../services/bookingService";
import { getProfile } from "../services/authService";
import { useUserTheme } from "../context/UserThemeContext";
import { Utensils, Activity, Hospital, Sparkles, Calendar, Clock, Ticket, User, ArrowRight } from "lucide-react";

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
    { name: 'Restaurants', icon: Utensils, color: 'text-emerald-500' },
    { name: 'Futsal', icon: Activity, color: 'text-teal-500' },
    { name: 'Hospitals', icon: Hospital, color: 'text-emerald-600' },
    { name: 'Salon / Spa', icon: Sparkles, color: 'text-teal-600' },
  ];

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-300">
        <div className="max-w-7xl mx-auto w-full pt-16 relative z-10">

          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="glass-header">
              <h1 className={`text-4xl md:text-5xl font-extrabold tracking-tight mb-3 transition-colors ${isDark ? 'text-white drop-shadow-md' : 'text-slate-900'}`}>
                Welcome back, {user?.name?.split(' ')[0] || 'User'}
              </h1>
              <p className={`text-lg font-medium transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl leading-relaxed`}>
                Your personalized UniBook experience is ready. Manage your lifestyle with precision.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            <div className={`col-span-12 lg:col-span-8 group relative rounded-2xl p-8 overflow-hidden transition-all duration-200 border glass-card`}>
               
               {/* Simple Overlay for Depth */}
               <div className="absolute inset-0 z-0">
                  <div className={`absolute inset-0 ${isDark ? 'bg-slate-900/60' : 'bg-white/40'}`} />
               </div>

               <div className="relative z-10 py-4">
                  <div className="flex items-center justify-between mb-10">
                     <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-sm ${isDark ? 'bg-slate-900 text-emerald-400 border border-slate-700' : 'bg-white text-emerald-700 border border-emerald-100'}`}>
                        Upcoming Booking
                     </span>
                  </div>

                  {nextAppointment ? (
                     <div className="flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className={`animate-in fade-in slide-in-from-left-4 duration-700 p-6 rounded-2xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-100 shadow-sm'}`}>
                           <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-2">Provider</p>
                           <h2 className={`text-4xl font-black mb-6 tracking-tight transition-colors group-hover:text-emerald-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {nextAppointment.provider_name}
                           </h2>
                           <div className={`flex flex-wrap gap-8 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
                                    <Calendar className="w-5 h-5 text-emerald-500" />
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Date</p>
                                    <span className="text-sm font-bold">{new Date(nextAppointment.booking_date).toLocaleDateString([], { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                                 </div>
                              </div>
                              <div className="flex items-center gap-3">
                                 <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'}`}>
                                    <Clock className="w-5 h-5 text-emerald-500" />
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Time</p>
                                    <span className="text-sm font-bold">{nextAppointment.booking_time}</span>
                                 </div>
                              </div>
                           </div>
                        </div>
                        <div className="flex-shrink-0">
                           <button onClick={() => navigate('/my-appointments')} className="px-8 py-4 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-emerald-600 transition-all shadow-xl shadow-black/20 group/btn">
                              View Details <ArrowRight className="inline w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                           </button>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-16 animate-in zoom-in duration-700">
                        <div className="w-16 h-16 rounded-3xl bg-slate-800/20 border border-slate-700/30 flex items-center justify-center mb-6">
                           <Calendar className="w-8 h-8 text-slate-500 opacity-50" />
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>No Active Plans</h3>
                        <p className="text-slate-500 text-sm mb-6">Your schedule is currently clear.</p>
                        <button onClick={() => navigate('/services')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/10 cursor-pointer">
                          Schedule Service <ArrowRight className="w-4 h-4" />
                        </button>
                     </div>
                  )}
               </div>
            </div>

            <div className="col-span-12 lg:col-span-4 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
               {[
                  { label: 'Find Services', sub: 'Explore categories', icon: Sparkles, path: '/services' },
                  { label: 'My Bookings', sub: 'View your plans', icon: Ticket, path: '/my-appointments' },
                  { label: 'Profile Settings', sub: 'Edit your profile', icon: User, path: '/profile' }
               ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                  <div key={i} onClick={() => navigate(item.path)} 
                     className={`group cursor-pointer border rounded-2xl p-5 transition-all outline-none focus:ring-2 focus:ring-emerald-500 hover:-translate-y-[2px] glass-card`}>
                     <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className={`text-base font-semibold mb-0.5 transition-colors ${isDark ? 'text-white group-hover:text-emerald-400' : 'text-slate-900 group-hover:text-emerald-600'}`}>{item.label}</h4>
                         <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.sub}</p>
                       </div>
                     </div>
                  </div>
               )})}
            </div>

          </div>
          
          <div className="mt-12 flex flex-col gap-4">
             <div className="glass-header !py-2 !px-4 w-max">
               <span className={`text-sm font-bold tracking-wide ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Browse Categories</span>
             </div>
             <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
               {categories.map((cat, i) => {
                  const Icon = cat.icon;
                  return (
                  <button key={i} onClick={() => navigate(`/services/${encodeURIComponent(cat.name)}`)} 
                     className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all whitespace-nowrap cursor-pointer
                       ${isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-700 text-slate-300 hover:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 hover:text-slate-900 shadow-sm'}`}>
                     <Icon className="w-4 h-4" />
                     <span className="text-sm font-medium">
                       {cat.name}
                     </span>
                  </button>
               )})}
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
