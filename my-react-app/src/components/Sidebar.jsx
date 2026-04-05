import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getProfile, fetchFullProfile } from '../services/authService';
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  Calendar, 
  ClipboardList, 
  Settings, 
  User, 
  LogOut,
  Hexagon
} from 'lucide-react';
import NotificationBell from './NotificationBell';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { adminTheme } = useAdminTheme();
  
  const isDark = adminTheme === 'dark';
  const [adminUser, setAdminUser] = useState(getProfile());

  useEffect(() => {
    fetchFullProfile().then(data => setAdminUser(data)).catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
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
      {/* Sidebar */}
      <div className={`w-72 min-h-screen p-6 flex flex-col justify-between sticky top-0 h-screen border-r z-[100] transition-colors duration-300 font-inter
        ${isDark ? 'bg-[#0f172a] border-slate-800' : 'bg-[#f8fafc] border-slate-200'}`}>
        
        <div>
          {/* Branding */}
          <div className="flex items-center gap-3 mb-10 px-2 cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate('/dashboard/admin')}>
            <div className={`flex items-center justify-center ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
              <Hexagon className="w-8 h-8" strokeWidth={2.5} />
            </div>
            <div>
              <h2 className={`text-xl font-bold tracking-tight leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>UniBook<span className="text-blue-500">.</span></h2>
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
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive 
                      ? (isDark ? 'bg-slate-800 text-white shadow-sm border border-slate-700/50' : 'bg-white text-slate-900 shadow-sm border border-slate-200/50') 
                      : (isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent')}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? (isDark ? 'text-blue-400' : 'text-blue-600') : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Information Footer */}
        <div className={`mt-auto space-y-6 pt-6 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex flex-col items-center text-center gap-4">
             {/* Avatar Area */}
             <div className="relative">
                <Link to="/dashboard/admin/profile" className="block">
                  {adminUser?.profile_photo ? (
                    <img 
                      src={`http://localhost:4001${adminUser.profile_photo}`} 
                      alt="Admin" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-transparent hover:border-blue-500 transition-all shadow-md"
                    />
                  ) : (
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all border-2 border-transparent hover:border-blue-500
                      ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                      <User className="w-8 h-8" />
                    </div>
                  )}
                </Link>
             </div>

             {/* UI Refinement: Notification Bell below Avatar */}
             <div className="flex flex-col items-center gap-2">
                <NotificationBell isDark={isDark} />
                <div className="mt-1">
                  <h4 className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {adminUser?.name || 'System Admin'}
                  </h4>
                </div>
             </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border cursor-pointer
              ${isDark 
                ? 'bg-slate-900/50 text-slate-400 border-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 shadow-sm'}`}
          >
            <span>Logout</span>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
