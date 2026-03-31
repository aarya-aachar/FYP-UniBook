import { Link, useNavigate, useLocation } from "react-router-dom";

const UserSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate("/login");
  };

  const navItems = [
    { path: '/dashboard/user', label: 'Dashboard', icon: '🏠' },
    { path: '/services', label: 'Book Service', icon: '✨' },
    { path: '/my-appointments', label: 'Appointments', icon: '📅' },
    { path: '/my-reports', label: 'My Reports', icon: '📈' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="w-80 min-h-screen p-8 flex flex-col justify-between sticky top-0 h-screen border-r border-white/10"
         style={{ background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(10px)' }}>
      
      <div>
        {/* Branding */}
        <div className="flex items-center gap-3 mb-12 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">
            🌌
          </div>
          <h2 className="text-2xl font-black text-white tracking-tighter uppercase">UniBook</h2>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 font-bold group
                  ${isActive 
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/10 text-white border border-blue-500/30' 
                    : 'text-white/40 hover:text-white/70 hover:bg-white/5 border border-transparent'}`}
              >
                <span className={`text-2xl transition-transform group-hover:scale-110 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {item.icon}
                </span>
                <span className="text-base tracking-wide">{item.label}</span>
                {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Profile Summary & Logout */}
      <div className="space-y-4">
        <button
          onClick={handleLogout}
          className="group w-full flex items-center gap-4 px-5 py-4 rounded-2xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all font-bold"
        >
          <span className="text-2xl group-hover:rotate-12 transition-transform">🚪</span>
          <span className="text-base">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default UserSidebar;
