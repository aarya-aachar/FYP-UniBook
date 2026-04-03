import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUserTheme } from "../context/UserThemeContext";
import { 
  Home, 
  Search, 
  Calendar, 
  Star, 
  User, 
  LogOut, 
  Globe 
} from "lucide-react";

const UserNavbar = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/login");
  };

  const navItems = [
    { path: '/dashboard/user', label: 'Dashboard', icon: Home },
    { path: '/services', label: 'Find Services', icon: Search },
    { path: '/my-appointments', label: 'My Bookings', icon: Calendar },
    { path: '/my-reports', label: 'My Reviews', icon: Star },
    { path: '/profile', label: 'Settings', icon: User },
  ];

  return (
    <nav className={`sticky top-0 z-[100] w-full border-b transition-all duration-500 backdrop-blur-md
      ${isDark ? 'bg-slate-900/80 border-white/10 shadow-2xl shadow-black/20' : 'bg-white/80 border-slate-200 shadow-lg shadow-slate-200/20'}`}>
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Branding */}
        <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard/user')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
            <Globe className="text-white w-5 h-5" />
          </div>
          <h2 className={`text-xl font-black tracking-tighter uppercase transition-colors hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>UniBook</h2>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar py-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 font-bold whitespace-nowrap
                  ${isActive 
                    ? (isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600')
                    : (isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/5' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50')}`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-60'}`} />
                <span className="text-xs uppercase tracking-widest hidden lg:block">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Logout Action */}
        <button
          onClick={handleLogout}
          className={`group flex items-center gap-2 px-5 py-2.5 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px]
            ${isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 shadow-sm'}`}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden md:block">Logout</span>
        </button>

      </div>
    </nav>
  );
};

export default UserNavbar;
