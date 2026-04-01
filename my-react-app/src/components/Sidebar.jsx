import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminTheme } from '../context/AdminThemeContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminTheme } = useAdminTheme();
  
  const isDark = adminTheme === 'dark';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard/admin', label: 'Dashboard', icon: '📊' },
    { path: '/dashboard/admin/providers', label: 'Providers', icon: '🏢' },
    { path: '/dashboard/admin/users', label: 'Users', icon: '👥' },
    { path: '/dashboard/admin/bookings', label: 'Bookings', icon: '📅' },
    { path: '/dashboard/admin/reports', label: 'Reports', icon: '📈' },
    { path: '/dashboard/admin/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className={`w-80 min-h-screen p-6 flex flex-col justify-between sticky top-0 h-screen border-r shadow-2xl z-[100] transition-all duration-500
      ${isDark ? 'border-white/5 shadow-black/40' : 'border-slate-200 shadow-slate-200/50'}`}
         style={{ 
           background: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
           backdropFilter: 'blur(16px)' 
         }}>
      
      <div>
        {/* Modern Branding */}
        <div className="flex items-center gap-4 mb-14 px-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-2xl shadow-xl shadow-blue-500/30">
            🌌
          </div>
          <div>
            <h2 className={`text-2xl font-black tracking-tight leading-none transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>UniBook</h2>
            <p className={`text-[10px] font-bold tracking-wider mt-1 opacity-60 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Admin Panel</p>
          </div>
        </div>

        {/* Navigation - Professional List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold group relative overflow-hidden
                  ${isActive 
                    ? (isDark ? 'bg-white/5 text-white' : 'bg-blue-50 text-blue-600') 
                    : (isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50')}`}
              >
                {/* Active Indicator Pillar */}
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-blue-500 rounded-r-full shadow-[0_0_15px_#3b82f6]" />
                )}
                
                <span className={`text-xl transition-all duration-500 group-hover:scale-110 ${isActive ? 'opacity-100 scale-100' : 'opacity-40 group-hover:opacity-70'}`}>
                  {item.icon}
                </span>
                <span className={`text-base tracking-wide font-extrabold ${isActive ? 'translate-x-1' : ''} transition-transform`}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className={`ml-auto w-1.5 h-1.5 rounded-full ${isDark ? 'bg-blue-500/50' : 'bg-blue-600'}`} />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session Footer */}
      <div className="space-y-6">
        <div className={`h-px w-full transition-colors ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
        
        <div className="px-4 py-3 flex items-center gap-4">
           <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl shadow-inner transition-all
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>👤</div>
           <div className="flex-1 overflow-hidden">
              <h4 className={`text-sm font-black truncate leading-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Admin System</h4>
              <p className={`text-[10px] font-bold tracking-wider opacity-60 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Admin access</p>
           </div>
        </div>

        <button
          onClick={handleLogout}
          className={`group w-full flex items-center justify-between px-6 py-4 rounded-3xl border font-black text-xs tracking-wider shadow-lg transition-all
            ${isDark 
              ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white shadow-red-900/10' 
              : 'bg-red-50/50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white shadow-red-100'}`}
        >
          <span>Logout</span>
          <span className="text-xl transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
