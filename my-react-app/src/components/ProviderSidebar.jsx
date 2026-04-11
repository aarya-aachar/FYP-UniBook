import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Calendar, User, LogOut, 
  Utensils, Trophy, Stethoscope, Scissors, Menu, X, Settings, MessageSquareQuote, BarChart2
} from 'lucide-react';
import { logout, getProfile } from '../services/authService';
import api from '../services/api';

const CATEGORY_ICONS = {
  'Restaurants': Utensils,
  'Futsal': Trophy,
  'Hospitals': Stethoscope,
  'Salon / Spa': Scissors,
};

const NAV_ITEMS = [
  { path: '/provider/dashboard',      label: 'Dashboard',        icon: LayoutDashboard },
  { path: '/provider/bookings',        label: 'Bookings',         icon: Calendar },
  { path: '/provider/availability',    label: 'Availability',     icon: BarChart2 },
  { path: '/provider/settings',        label: 'Service Settings', icon: Settings },
  { path: '/provider/chat',            label: 'Admin Support',     icon: MessageSquareQuote },
  { path: '/provider/profile',         label: 'My Profile',       icon: User },
];

const ProviderSidebar = ({ isDark = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = getProfile();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [category, setCategory] = useState(user?.category || null);
  const [displayName, setDisplayName] = useState(user?.name || 'Provider');

  useEffect(() => {
    // Fetch real provider profile to get the category (not available in JWT)
    api.get('/provider/profile')
      .then(res => setCategory(res.data?.category || null))
      .catch(() => {});

    // Listen for name updates from the profile page
    const handleProfileUpdate = (e) => {
      if (e.detail?.name) setDisplayName(e.detail.name);
    };
    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const CategoryIcon = CATEGORY_ICONS[category] || LayoutDashboard;

  return (
    <>
      <aside className={`${collapsed ? 'w-20' : 'w-64'} h-screen sticky top-0 flex-shrink-0 flex flex-col transition-all duration-300 border-r
        ${isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
        
        {/* Header */}
        <div className={`flex items-center ${collapsed ? 'justify-center px-4' : 'justify-between px-6'} py-5 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          {!collapsed && (
            <div className="flex items-center gap-2.5">
              <img src="/logo.png" alt="UniBook" className="w-8 h-8 object-contain" />
              <span className={`text-lg font-extrabold tracking-tighter ${isDark ? 'text-white' : 'text-slate-950'}`}>
                UniBook<span className="text-emerald-500">.</span>
              </span>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} className={`p-2 rounded-xl transition-all cursor-pointer ${isDark ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
            {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
          </button>
        </div>

        {/* Provider Badge */}
        {!collapsed && (
          <div className={`mx-4 mt-4 px-4 py-3 rounded-2xl border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center flex-shrink-0">
                <CategoryIcon className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{category || 'Provider'}</p>
                <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{displayName}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 mt-2 overflow-y-auto custom-scrollbar">
          {NAV_ITEMS.map(item => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}
                className={`flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded-xl transition-all font-semibold text-sm
                  ${isActive
                    ? (isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700 border border-emerald-100')
                    : (isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950')}`}>
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className={`p-3 border-t ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
          <button
            onClick={() => setShowLogout(true)}
            className={`w-full flex items-center ${collapsed ? 'justify-center px-3' : 'gap-3 px-4'} py-3 rounded-xl transition-all text-sm font-semibold cursor-pointer
              ${isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'}`}>
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && 'Sign Out'}
          </button>
        </div>
      </aside>

      {/* Logout Modal */}
      {showLogout && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
          <div className={`p-8 rounded-3xl w-full max-w-xs shadow-2xl border ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="w-14 h-14 rounded-2xl mb-6 flex items-center justify-center mx-auto bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <LogOut className="w-7 h-7" />
            </div>
            <h3 className={`text-xl font-black mb-2 tracking-tight text-center ${isDark ? 'text-white' : 'text-slate-950'}`}>Sign Out?</h3>
            <p className={`text-sm mb-8 font-medium text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Confirm that you want to sign out.</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setShowLogout(false)} className={`px-5 py-3 text-sm font-bold rounded-xl border cursor-pointer ${isDark ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700' : 'bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100'}`}>Cancel</button>
              <button onClick={handleLogout} className="px-5 py-3 text-sm font-bold rounded-xl bg-slate-950 text-white hover:bg-rose-600 transition-all cursor-pointer">Sign Out</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderSidebar;
