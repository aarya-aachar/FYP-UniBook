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
import { getUnreadChatCount } from '../services/chatService';
import NotificationBell from './NotificationBell';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminTheme } = useAdminTheme();
  
  const isDark = adminTheme === 'dark';
  const [adminUser, setAdminUser] = useState(getProfile());
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadUserChats, setUnreadUserChats] = useState(0);
  const [unreadProviderChats, setUnreadProviderChats] = useState(0);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    fetchFullProfile().then(data => setAdminUser(data)).catch(() => {});
    
    // Initial fetch and poll for unread notifications and chats
    const updateCounts = () => {
      getUnreadCount().then(count => setUnreadCount(count)).catch(() => {});
      getUnreadChatCount('user').then(count => setUnreadUserChats(count)).catch(() => {});
      getUnreadChatCount('provider').then(count => setUnreadProviderChats(count)).catch(() => {});
    };
    
    updateCounts();
    const interval = setInterval(updateCounts, 5000); // Faster polling (5s)

    // Listen for instant sync event
    window.addEventListener('chat-read', updateCounts);

    return () => {
      clearInterval(interval);
      window.removeEventListener('chat-read', updateCounts);
    };
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
    { path: '/dashboard/admin/chats/users', label: 'Client Chats', icon: User },
    { path: '/dashboard/admin/chats/providers', label: 'Provider Chats', icon: Building2 },
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
            <div className="flex items-center justify-center">
              <img src="/logo.png" alt="UniBook Logo" className="w-10 h-10 object-contain" />
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
                  {item.label === 'Client Chats' && unreadUserChats > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-rose-500 text-[9px] font-black text-white border-2 border-white dark:border-slate-800 animate-in zoom-in flex-shrink-0">
                      {unreadUserChats}
                    </span>
                  )}
                  {item.label === 'Provider Chats' && unreadProviderChats > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 rounded-full bg-rose-500 text-[9px] font-black text-white border-2 border-white dark:border-slate-800 animate-in zoom-in flex-shrink-0">
                      {unreadProviderChats}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer actions */}
        <div className={`mt-auto pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border outline-none cursor-pointer
              ${isDark 
                ? 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/30' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-sm'}`}
          >
            <span>Log Out</span>
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
