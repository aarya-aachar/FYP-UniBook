/**
 * The Personalized Header (User Navbar)
 * 
 * relative path: /src/components/UserNavbar.jsx
 * 
 * This is the high-performance navigation bar used within the User Dashboards.
 * It is much more complex than the standard Navbar because it handles:
 * - Real-time Chat Counters (polling every 30s).
 * - Dynamic Theme switching (Dark/Light).
 * - Role-specific shortcuts (e.g. "My Bookings" for users, "Admin Dash" for admins).
 * - Animated Profile Dropdowns.
 */

import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUserTheme } from "../context/UserThemeContext";
import { getProfile, logout, fetchFullProfile } from "../services/authService";
import { 
  Home, 
  Search, 
  Calendar, 
  Star, 
  LogOut, 
  Settings,
  Globe,
  Info,
  Phone,
  LayoutDashboard
} from "lucide-react";
import { getUnreadChatCount } from '../services/chatService';
import NotificationBell from './NotificationBell';

const UserNavbar = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for UI interactions
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [user, setUser] = useState(getProfile());

  useEffect(() => {
    // 1. On mount, refresh the user's latest stats (photo, name, etc.)
    if (user) {
      fetchFullProfile().then(data => setUser(data)).catch(() => {});
      
      /**
       * --- REAL-TIME CHAT MONITORING ---
       * We poll the server every 30 seconds to update the notification 
       * badge on the "Chat with Admin" button.
       */
      const updateChatCount = () => {
        getUnreadChatCount().then(count => setUnreadChatCount(count)).catch(() => {});
      };
      
      updateChatCount();
      const interval = setInterval(updateChatCount, 30000); 

      // Support for instant updates when a message is read in another tab
      window.addEventListener('chat-read', updateChatCount);

      return () => {
        clearInterval(interval);
        window.removeEventListener('chat-read', updateChatCount);
      };
    }
  }, []); 

  const proceedLogout = () => {
    logout();
    setDropdownOpen(false);
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const isHomePage = location.pathname === '/';

  /**
   * --- NAVIGATION BUILDER ---
   * We dynamically build the menu list based on whether the user 
   * is an Admin or a regular Customer.
   */
  let navItems = [];
  if (!isHomePage) {
    if (user?.role === 'admin') {
      navItems = [
        { path: '/dashboard/admin', label: 'Admin Dashboard', icon: LayoutDashboard },
        { path: '/services', label: 'Services', icon: Search },
      ];
    } else if (user?.role === 'user') {
      navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/services', label: 'Find Services', icon: Search },
        { path: '/my-appointments', label: 'My Bookings', icon: Calendar },
        { path: '/my-reports', label: 'My Reviews', icon: Star },
        { path: '/chat', label: 'Chat with Admin', icon: Phone },
      ];
    }
  }

  return (
    <>
      {/* 
          Glassmorphism Navbar: 
          Uses backdrop-filter for a premium "iPhone-style" transparent look.
      */}
      <nav className={`fixed top-0 z-[100] w-full border-b transition-all duration-300 backdrop-blur-md
        ${isDark ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-100 shadow-sm shadow-slate-200/20'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          
          {/* Logo Section */}
          <div className="flex items-center gap-2.5 group cursor-pointer" onClick={() => navigate(user ? (user.role === 'admin' ? '/dashboard/admin' : '/dashboard') : '/')}>
            <img src="/logo.png" alt="UniBook Logo" className="w-8 h-8 object-contain" />
            <h2 className={`text-lg font-extrabold tracking-tighter transition-colors hidden sm:block ${isDark ? 'text-white' : 'text-slate-950'}`}>
              UniBook<span className="text-emerald-500">.</span>
            </h2>
          </div>

          {/* Centered Navigation Menu */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={`${item.path}-${item.label}`} 
                  to={item.path} 
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 font-semibold whitespace-nowrap cursor-pointer text-xs relative
                    ${isActive 
                      ? (isDark ? 'bg-slate-900 text-emerald-400' : 'bg-slate-50 text-emerald-600')
                      : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50')}`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                  <span className="hidden lg:block">{item.label}</span>
                  
                  {/* Floating Notification Dot for Chat messages */}
                  {item.label === 'Chat with Admin' && unreadChatCount > 0 && (
                     <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[14px] h-3.5 px-1 rounded-full bg-rose-500 text-[8px] font-black text-white border border-white dark:border-slate-950 animate-bounce">
                        {unreadChatCount}
                     </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Side: Profile & Notifications */}
          <div className="relative flex items-center gap-4">
            {user && !isHomePage ? (
              <>
                <NotificationBell isDark={isDark} />
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-3 p-1 rounded-full border transition-all cursor-pointer bg-transparent
                    ${isDark ? 'border-slate-800 hover:border-slate-700' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  {/* User Avatar Circle */}
                  <div className="w-8 h-8 rounded-full border border-slate-200 overflow-hidden">
                    {user.profile_photo ? (
                      <img src={`http://localhost:4001${user.profile_photo}`} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User Avatar" className="w-full h-full object-cover" />
                    )}
                  </div>
                </button>

                {/* --- CUSTOM DROPDOWN MENU --- */}
                {dropdownOpen && (
                   <>
                     <div className="fixed inset-0 z-[110]" onClick={() => setDropdownOpen(false)} />
                     <div className={`absolute right-0 top-12 mt-2 w-56 rounded-2xl shadow-2xl border p-2 z-[120] animate-in fade-in slide-in-from-top-2
                       ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                       <div className="px-3 py-3 border-b border-slate-100/10 mb-2">
                          <p className={`text-xs font-black uppercase tracking-widest leading-none mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Logged in as</p>
                          <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-950'}`}>{user.email}</p>
                       </div>
                       <Link
                         to={user.role === 'admin' ? "/dashboard/admin/profile" : "/profile"}
                         onClick={() => setDropdownOpen(false)}
                         className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer
                           ${isDark ? 'text-slate-300 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-950'}`}
                       >
                         <Settings className="w-4 h-4 opacity-70" />
                         Account Settings
                       </Link>
                       <button
                         onClick={() => {
                           setDropdownOpen(false);
                           setShowLogoutConfirm(true);
                         }}
                         className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left cursor-pointer
                           ${isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                       >
                         <LogOut className="w-4 h-4 opacity-70" />
                         Sign Out
                       </button>
                     </div>
                   </>
                 )}
              </>
            ) : (
              <div className="flex items-center gap-5">
                <Link to="/login" className={`font-bold transition-colors text-xs uppercase tracking-widest ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'}`}>Login</Link>
                <Link to="/register" className="px-6 py-2.5 rounded-xl bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all shadow-xl shadow-slate-950/20">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in transition-all">
          <div className={`p-8 rounded-3xl w-full max-w-xs shadow-2xl border transition-all animate-in zoom-in duration-200
            ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-50'}`}>
            <div className={`w-14 h-14 rounded-2xl mb-6 flex items-center justify-center mx-auto
               bg-rose-500/10 text-rose-500 border border-rose-500/20`}>
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className={`text-xl font-black mb-2 tracking-tight text-center ${isDark ? 'text-white' : 'text-slate-950'}`}>Sign Out?</h3>
            <p className={`text-sm mb-8 font-medium leading-relaxed text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
               Confirm that you want to sign out of your account.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className={`px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border outline-none cursor-pointer
                  ${isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-100'}`}
              >
                Cancel
              </button>
              <button 
                onClick={proceedLogout} 
                className="px-5 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl bg-slate-950 text-white hover:bg-rose-600 shadow-xl shadow-slate-950/10 transition-all outline-none cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserNavbar;
