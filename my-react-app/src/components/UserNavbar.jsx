import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { useUserTheme } from "../context/UserThemeContext";
import { getProfile, logout } from "../services/authService";
import { 
  Home, 
  Search, 
  Calendar, 
  Star, 
  LogOut, 
  Settings,
  Globe,
  Info,
  Phone
} from "lucide-react";
import NotificationBell from './NotificationBell';

const UserNavbar = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const user = getProfile();

  const proceedLogout = () => {
    logout();
    setDropdownOpen(false);
    setShowLogoutConfirm(false);
    navigate("/login");
  };

  const isHomePage = location.pathname === '/';

  let navItems = [];
  if (!isHomePage) {
    if (user?.role === 'admin') {
      navItems = [
        { path: '/dashboard/admin', label: 'Admin Dashboard', icon: Home },
        { path: '/services', label: 'Services', icon: Search },
      ];
    } else if (user?.role === 'user') {
      navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/services', label: 'Find Services', icon: Search },
        { path: '/my-appointments', label: 'My Bookings', icon: Calendar },
        { path: '/my-reports', label: 'My Reviews', icon: Star },
      ];
    }
  }

  return (
    <>
      <nav className={`sticky top-0 z-[100] w-full border-b transition-all duration-300 backdrop-blur-lg
        ${isDark ? 'bg-[#0f172a]/90 border-slate-800 shadow-sm shadow-black/20' : 'bg-white/95 border-slate-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Branding */}
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(user ? (user.role === 'admin' ? '/dashboard/admin' : '/dashboard') : '/')}>
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center shadow-sm group-hover:-translate-y-[2px] transition-transform duration-200">
              <Globe className="text-white w-5 h-5" />
            </div>
            <h2 className={`text-xl font-bold tracking-tight transition-colors hidden sm:block ${isDark ? 'text-white' : 'text-slate-900'}`}>UniBook</h2>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1 md:gap-4 overflow-x-auto no-scrollbar py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link 
                  key={`${item.path}-${item.label}`} 
                  to={item.path} 
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-200 font-medium whitespace-nowrap cursor-pointer
                    ${isActive 
                      ? (isDark ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-emerald-600')
                      : (isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50')}`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                  <span className="text-sm hidden lg:block">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="relative flex items-center gap-3">
            {user && !isHomePage ? (
              <>
                <NotificationBell isDark={isDark} />
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`w-10 h-10 rounded-full border-2 overflow-hidden cursor-pointer transition-all ${isDark ? 'border-slate-700 hover:border-slate-500' : 'border-slate-200 hover:border-slate-300'}`}
                >
                  {user.profile_photo ? (
                    <img src={`http://localhost:4001${user.profile_photo}`} alt="User Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="User Avatar" className="w-full h-full object-cover" />
                  )}
                </button>


                {dropdownOpen && (
                   <>
                     {/* Click outside overlay */}
                     <div className="fixed inset-0 z-[110]" onClick={() => setDropdownOpen(false)} />
                     
                     {/* Dropdown Menu */}
                     <div className={`absolute right-0 top-12 mt-2 w-48 rounded-xl shadow-lg border p-1 z-[120] transition-all animate-in fade-in slide-in-from-top-2
                       ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                       <Link
                         to={user.role === 'admin' ? "/dashboard/admin/profile" : "/profile"}
                         onClick={() => setDropdownOpen(false)}
                         className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer
                           ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                       >
                         <Settings className="w-4 h-4" />
                         Profile Settings
                       </Link>
                       <button
                         onClick={() => {
                           setDropdownOpen(false);
                           setShowLogoutConfirm(true);
                         }}
                         className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left cursor-pointer
                           ${isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}
                       >
                         <LogOut className="w-4 h-4" />
                         Log out
                       </button>
                     </div>
                   </>
                )}
              </>
            ) : (
              // Unauthenticated View OR Homepage Forced View
              <div className="flex items-center gap-2 md:gap-4">
                <Link to="/login" className={`font-semibold transition-colors text-sm px-4 py-2 rounded-lg ${isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}>Login</Link>
                <Link to="/register" className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-md text-sm hidden sm:block">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className={`p-8 rounded-3xl w-full max-sm shadow-2xl animate-in zoom-in-95 duration-200 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
            <div className={`w-12 h-12 rounded-full mb-4 flex items-center justify-center ${isDark ? 'bg-rose-500/20 text-rose-400' : 'bg-rose-100 text-rose-600'}`}>
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ready to leave?</h3>
            <p className={`text-sm mb-8 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Are you sure you want to log out of your UniBook account? You will need to log back in to manage your bookings.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowLogoutConfirm(false)} 
                className={`flex-1 px-4 py-3 text-sm font-semibold rounded-xl transition-colors cursor-pointer ${isDark ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}
              >
                Cancel
              </button>
              <button 
                onClick={proceedLogout} 
                className="flex-1 px-4 py-3 text-sm font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 shadow-sm transition-all cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserNavbar;
