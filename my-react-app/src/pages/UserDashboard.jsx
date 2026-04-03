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
    { name: 'Restaurants', icon: Utensils, color: 'text-orange-500' },
    { name: 'Futsal', icon: Activity, color: 'text-blue-500' },
    { name: 'Hospitals', icon: Hospital, color: 'text-emerald-500' },
    { name: 'Salon / Spa', icon: Sparkles, color: 'text-purple-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-300">
        <div className={`absolute top-0 right-0 w-full h-96 bg-gradient-to-b opacity-50 pointer-events-none transition-all duration-300
          ${isDark ? 'from-blue-900/10 to-transparent' : 'from-blue-50 to-transparent'}`} />

        <div className="max-w-7xl mx-auto w-full pt-4 relative z-10">

          <div className={`flex flex-col mb-10 border-b pb-6 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <h1 className={`text-3xl font-bold tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Welcome, {user?.name?.split(' ')[0] || 'User'}
            </h1>
            <p className={`text-base transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'} max-w-2xl`}>
              What would you like to book today? Here is your dashboard overview.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8">
            
            <div className={`col-span-12 lg:col-span-8 group relative rounded-2xl p-8 overflow-hidden transition-all duration-200 border
              ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-8">
                     <span className={`px-3 py-1 rounded-md text-xs font-semibold tracking-wide ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-700'}`}>
                       Next Appointment
                     </span>
                  </div>

                  {nextAppointment ? (
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                        <div>
                           <h2 className={`text-3xl font-bold mb-4 tracking-tight transition-colors group-hover:text-blue-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                              {nextAppointment.provider_name}
                           </h2>
                           <div className={`flex flex-wrap gap-6 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                              <div className="flex items-center gap-2">
                                 <Calendar className="w-5 h-5 opacity-70" />
                                 <span className="text-sm font-medium">{new Date(nextAppointment.booking_date).toLocaleDateString([], { month: 'long', day: 'numeric' })}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Clock className="w-5 h-5 opacity-70" />
                                 <span className="text-sm font-medium">{nextAppointment.booking_time}</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center justify-center py-10">
                        <Calendar className="w-12 h-12 mb-4 text-slate-400 opacity-50" />
                        <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No Active Plans</h3>
                        <button onClick={() => navigate('/services')} className="mt-4 flex items-center gap-2 text-blue-500 font-medium text-sm hover:text-blue-600 cursor-pointer transition-colors">
                          Book your first service <ArrowRight className="w-4 h-4" />
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
                     className={`group cursor-pointer border rounded-2xl p-5 transition-all outline-none focus:ring-2 focus:ring-blue-500 hover:-translate-y-[2px]
                     ${isDark ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800' : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'}`}>
                     <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-700/50 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                         <Icon className="w-5 h-5" />
                       </div>
                       <div>
                         <h4 className={`text-base font-semibold mb-0.5 transition-colors ${isDark ? 'text-white group-hover:text-blue-400' : 'text-slate-900 group-hover:text-blue-600'}`}>{item.label}</h4>
                         <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{item.sub}</p>
                       </div>
                     </div>
                  </div>
               )})}
            </div>

          </div>
          
          <div className="mt-12 flex flex-col gap-4">
             <span className={`text-sm font-semibold tracking-wide ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>Browse Categories</span>
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
