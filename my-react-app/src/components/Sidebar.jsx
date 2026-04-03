import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminTheme } from '../context/AdminThemeContext';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  ClipboardList, 
  UserCog, 
  User, 
  LogOut, 
  Globe 
} from 'lucide-react';

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
    { path: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/admin/providers', label: 'Providers', icon: Building2 },
    { path: '/dashboard/admin/users', label: 'Client List', icon: Users },
    { path: '/dashboard/admin/bookings', label: 'All Bookings', icon: Calendar },
    { path: '/dashboard/admin/reports', label: 'Review Logs', icon: ClipboardList },
    { path: '/dashboard/admin/profile', label: 'Settings', icon: UserCog },
  ];

  return (
    <div className={`w-80 min-h-screen p-8 flex flex-col justify-between sticky top-0 h-screen border-r shadow-2xl z-[100] transition-all duration-500
      ${isDark ? 'border-white/10 shadow-black/40' : 'border-slate-200 shadow-slate-200/20'}`}
         style={{ 
           background: isDark ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)', 
           backdropFilter: 'blur(16px)' 
         }}>
      
      <div>
        {/* Branding */}
        <div className="flex items-center gap-4 mb-14 px-2 group cursor-pointer" onClick={() => navigate('/dashboard/admin')}>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
            <Globe className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className={`text-2xl font-black tracking-tighter leading-none transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>UniBook</h2>
            <p className={`text-xs font-black tracking-widest uppercase mt-1 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Admin Suite</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-6 py-5 rounded-[2rem] transition-all duration-300 font-black group relative overflow-hidden
                  ${isActive 
                    ? (isDark ? 'bg-white/5 text-white' : 'bg-blue-50 text-blue-600 shadow-sm shadow-blue-200/20') 
                    : (isDark ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]' : 'text-slate-400 hover:text-slate-900 hover:bg-slate-50')}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1.5 bg-blue-500 rounded-r-full shadow-[0_0_15px_#3b82f6]" />
                )}
                
                <Icon className={`w-5 h-5 transition-all duration-500 group-hover:scale-110 ${isActive ? 'opacity-100 scale-110' : 'opacity-40 group-hover:opacity-70'}`} />
                <span className={`text-sm tracking-widest uppercase ${isActive ? 'translate-x-1' : ''} transition-transform`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Information */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        <div className="px-2 py-2 flex items-center gap-4">
           <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center shadow-inner transition-all flex-shrink-0
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 shadow-slate-200/10'}`}>
             <User className={`w-6 h-6 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
           </div>
           <div className="flex-1 overflow-hidden">
              <h4 className={`text-sm font-black truncate leading-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>System Admin</h4>
              <p className={`text-xs font-black tracking-widest uppercase mt-1 transition-colors ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>Verified Access</p>
           </div>
        </div>

        <button
          onClick={handleLogout}
          className={`group w-full flex items-center justify-between px-7 py-5 rounded-[2rem] border font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all
            ${isDark 
              ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500 hover:text-white shadow-red-900/10' 
              : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white shadow-red-100'}`}
        >
          <span>Logout System</span>
          <LogOut className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
