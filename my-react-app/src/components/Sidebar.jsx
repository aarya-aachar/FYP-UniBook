import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getProfile, fetchFullProfile } from '../services/authService';
import { getUnreadCount } from '../services/notificationService';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  ClipboardList, 
  Settings, 
  User, 
  LogOut,
  Hexagon,
  Bell,
  AlertCircle
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminTheme } = useAdminTheme();
  
  const isDark = adminTheme === 'dark';
  const [adminUser, setAdminUser] = useState(getProfile());
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchFullProfile().then(data => setAdminUser(data)).catch(() => {});
    
    // Initial fetch and poll for unread notifications
    const updateCount = () => {
      getUnreadCount().then(count => setUnreadCount(count)).catch(() => {});
    };
    
    updateCount();
    const interval = setInterval(updateCount, 30000); // 30s polling
    return () => clearInterval(interval);
  }, []);

  const proceedLogout = () => {
    localStorage.removeItem('token');
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard/admin', label: 'Overview', icon: LayoutDashboard },
    { path: '/dashboard/admin/providers', label: 'Providers', icon: Building2 },
    { path: '/dashboard/admin/users', label: 'Client List', icon: Users },
    { path: '/dashboard/admin/bookings', label: 'Bookings', icon: Calendar },
    { path: '/dashboard/admin/reports', label: 'Export Logs', icon: ClipboardList },
    { path: '/dashboard/admin/profile', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      
      {/* Sidebar */}
      <div className={`w-72 min-h-screen p-6 flex flex-col justify-between sticky top-0 h-screen border-r z-[100] transition-colors duration-300 font-inter
        ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-[#f8fafc] border-slate-200'}`}>
        
        <div>
          {/* Branding */}
          <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate('/dashboard/admin')}>
            <div className={`flex items-center justify-center ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
              <Hexagon className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>UniBook<span className="text-emerald-500">.</span></h2>
              <p className={`text-[10px] font-bold tracking-[0.2em] uppercase mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Admin Suite</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={item.path} 
                  to={item.path} 
                  className={`flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium group
                    ${isActive 
                      ? (isDark ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' : 'bg-white text-slate-900 shadow-sm border border-slate-200/50') 
                      : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-emerald-400' : 'text-emerald-600') : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                    <span>{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Information Footer */}
        <div className={`mt-auto space-y-6 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex flex-col items-center text-center gap-4">
             {/* Avatar Area */}
              <div className="relative group/avatar">
                <Link to="/dashboard/admin/profile" className="block relative">
                  {adminUser?.profile_photo ? (
                    <img 
                      src={`http://localhost:4001${adminUser.profile_photo}`} 
                      alt="Admin" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-transparent group-hover/avatar:border-emerald-500 transition-all shadow-md"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-2 border-transparent group-hover/avatar:border-emerald-500
                      ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <User className="w-8 h-8" />
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-slate-800 rounded-full shadow-sm" />
                </Link>
             </div>

             <div className="mt-1">
                <h4 className={`text-sm font-bold truncate tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {adminUser?.name || 'System Admin'}
                </h4>
             </div>
          </div>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border outline-none cursor-pointer
              ${isDark 
                ? 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-sm'}`}
          >
            <span>End Session</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Admin Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in transition-all">
          <div className={`p-8 rounded-[2rem] w-full max-w-sm shadow-2xl border transition-all animate-[zoomIn_0.3s_ease-out]
            ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center shadow-inner
              ${isDark ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className={`text-2xl font-black mb-3 tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to leave?</h3>
            <p className={`text-sm mb-8 font-medium leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Are you sure you want to end your administrative session? You will be redirected to the login page immediately.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className={`px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all border outline-none cursor-pointer
                  ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'}`}
              >
                Go Back
              </button>
              <button 
                onClick={proceedLogout} 
                className="px-5 py-4 text-xs font-black uppercase tracking-widest rounded-2xl bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-500/30 transition-all outline-none cursor-pointer"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
