import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUserTheme } from "../context/UserThemeContext";

const UserSidebar = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/login");
  };

  const navItems = [
    { path: '/dashboard/user', label: 'Dashboard', icon: '🏠' },
    { path: '/services', label: 'Find Services', icon: '✨' },
    { path: '/my-appointments', label: 'My Bookings', icon: '📅' },
    { path: '/my-reports', label: 'My Reviews', icon: '⭐' },
    { path: '/profile', label: 'Settings', icon: '👤' },
  ];

  return (
    <div className={`w-80 min-h-screen p-8 flex flex-col justify-between sticky top-0 h-screen border-r transition-all duration-500
      ${isDark ? 'border-white/10' : 'border-slate-200'}`}
         style={{ 
           background: isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
           backdropFilter: 'blur(10px)' 
         }}>
      
      <div>
        {/* Branding */}
        <div className="flex items-center gap-4 mb-12 px-2 group cursor-pointer" onClick={() => navigate('/dashboard/user')}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-2xl shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
            🌌
          </div>
          <h2 className={`text-2xl font-black tracking-tighter uppercase transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>UniBook</h2>
        </div>

        {/* Navigation */}
        <nav className="space-y-3">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-6 py-5 rounded-3xl transition-all duration-300 font-black group relative
                  ${isActive 
                    ? (isDark ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/30' : 'bg-blue-50 text-blue-600 border border-blue-500/20 shadow-sm shadow-blue-200/20')
                    : (isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50 border border-transparent')}`}
              >
                <span className={`text-2xl transition-transform group-hover:scale-110 ${isActive ? 'opacity-100 scale-110' : 'opacity-40'}`}>
                  {item.icon}
                </span>
                <span className="text-sm tracking-widest uppercase">{item.label}</span>
                {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_15px_#3b82f6]" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="pt-6 border-t transition-colors border-white/5 mt-auto">
        <button
          onClick={handleLogout}
          className={`group w-full flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all font-black uppercase tracking-widest text-xs
            ${isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100 shadow-sm'}`}
        >
          <span className="text-2xl group-hover:rotate-12 transition-transform">🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
