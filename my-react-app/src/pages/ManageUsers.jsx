import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getUsers, updateUserStatus, updateUserRole } from '../services/adminService';

// ─── Constants ──────────────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:4001';

const ROLE_CONFIG = {
  admin: { 
    color: 'from-purple-500 to-indigo-600', 
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    badgeLight: 'bg-purple-50 text-purple-600 border-purple-100',
    label: 'Administrator' 
  },
  user:  { 
    color: 'from-blue-500 to-cyan-500',   
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    badgeLight: 'bg-blue-50 text-blue-600 border-blue-100',
    label: 'Standard User' 
  }
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

// Toast Notification
const Toast = ({ toasts }) => (
  <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
    {toasts.map(t => (
      <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-base font-semibold pointer-events-auto
        ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-red-500 to-rose-600'}`}
        style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
        <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
        {t.message}
      </div>
    ))}
  </div>
);

// User Avatar (Initial based)
const Avatar = ({ name, role }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const userRole = String(role || '').toLowerCase().trim();
  const cfg = ROLE_CONFIG[userRole] || ROLE_CONFIG['user'];
  
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-black/20`}>
      {initials}
    </div>
  );
};

// Skeleton Card
const SkeletonCard = ({ isDark }) => (
  <div className={`border rounded-2xl p-5 overflow-hidden animate-pulse ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
    <div className="flex gap-4 items-center">
      <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
      <div className="flex-1 space-y-2">
        <div className={`h-5 rounded w-3/4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
      </div>
    </div>
    <div className="flex gap-2 mt-6">
      <div className={`flex-1 h-10 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`} />
      <div className={`flex-1 h-10 rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-50'}`} />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageUsers = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('ManageUsers: Error fetching users:', err);
      toast(`Failed to load: ${err.message || 'Server Error'}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    document.title = "Admin | Manage Users - UniBook";
    fetchUsers(); 
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      await updateUserStatus(user.id, newStatus);
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      toast(`${user.name} has been ${newStatus ? 'activated' : 'deactivated'}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = (users || [])
    .filter(u => {
      if (!u) return false;
      const matchSearch = String(u.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        String(u.email || '').toLowerCase().includes(search.toLowerCase());
      const userRole = String(u.role || '').toLowerCase();
      const matchRole = roleFilter === 'All' || userRole === String(roleFilter).toLowerCase();
      return matchSearch && matchRole;
    });

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-600";
  const cardBase = isDark 
    ? "bg-white/5 backdrop-blur-sm border border-white/10 shadow-lg" 
    : "bg-white border border-slate-200 shadow-sm hover:shadow-md";

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Toast toasts={toasts} />

      <div className="flex min-h-screen transition-colors duration-500 font-inter" 
           style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Sidebar />

        <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div>
              <h1 className={`text-5xl font-black tracking-tighter mb-4 transition-colors font-outfit ${textPrimary}`}>
                Manage Users
              </h1>
              <p className={`text-lg font-semibold tracking-tight transition-colors ${textSecondary}`}>
                {users.length} total users · {filtered.length} showing
              </p>
            </div>
            <div className={`flex items-center gap-3 px-6 py-4 rounded-[2rem] border transition-all shadow-xl
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
               <span className={`text-xs font-black uppercase tracking-[0.2em] ${textSecondary}`}>Active Users:</span>
               <span className={`font-black text-2xl font-outfit ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{users.filter(u => Number(u.is_active) === 1).length}</span>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <span className={`absolute left-5 top-1/2 -translate-y-1/2 text-xl transition-colors ${textSecondary}`}>🔍</span>
              <input 
                type="text" 
                placeholder="Search by name or email address..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className={`w-full pl-14 pr-6 py-4 border rounded-[1.5rem] transition-all font-bold text-lg outline-none
                  ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/20 focus:border-blue-400' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:bg-white shadow-sm'}`} 
              />
            </div>
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className={`px-8 py-4 border rounded-[1.5rem] transition-all cursor-pointer font-black text-xs uppercase tracking-[0.2em] outline-none
                ${isDark ? 'bg-white/5 border-white/10 text-white/70 focus:border-blue-400' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-blue-600 focus:bg-white shadow-sm'}`}
            >
              <option value="All">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Users</option>
            </select>
          </div>

          {/* User Cards Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} isDark={isDark} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(u => {
                const roleKey = String(u.role || '').toLowerCase().trim();
                const cfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG['user'];
                return (
                  <div key={u.id} 
                    className={`group relative rounded-[2.5rem] p-6 transition-all duration-500 hover:-translate-y-2 border-b-8
                    ${isDark 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-b-blue-500 shadow-2xl' 
                      : 'bg-white border-slate-200 hover:border-b-blue-600 shadow-xl shadow-slate-200/50'}
                    ${!u.is_active ? 'opacity-60 saturate-50' : 'opacity-100'}`}
                    style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                    
                    {/* Status Badge */}
                    <div className="absolute top-6 right-6">
                        <div className={`w-3.5 h-3.5 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`} />
                    </div>

                    <div className="flex gap-5 items-center">
                      <Avatar name={u.name} role={u.role} />
                      <div className="min-w-0">
                        <h3 className={`font-black text-xl truncate leading-none transition-colors font-outfit ${textPrimary}`}>{u.name}</h3>
                        <p className={`text-sm truncate mt-1 font-semibold tracking-tight transition-colors ${textSecondary}`}>{u.email}</p>
                      </div>
                    </div>

                    <div className="mt-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest transition-all
                          ${isDark ? cfg.badge : cfg.badgeLight}`}>
                          {cfg.label}
                        </span>
                        <span className={`text-[10px] font-black uppercase tracking-widest transition-colors ${textSecondary}`}>
                          Joined {new Date(u.created_at).getFullYear()}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className={`h-px w-full ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />

                      <div className="flex gap-2 pt-2">
                        <button 
                          onClick={() => handleToggleStatus(u)}
                          className={`flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border flex items-center justify-center gap-2
                          ${Number(u.is_active) === 1 
                            ? (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 shadow-sm') 
                            : (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 shadow-sm')}
                          hover:text-white hover:shadow-lg`}
                        >
                          {Number(u.is_active) === 1 ? 'Deactivate' : 'Activate User'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`text-center py-24 rounded-[3rem] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
              <div className="text-8xl mb-6 opacity-20">👥</div>
              <h3 className={`text-3xl font-black font-outfit ${textPrimary}`}>No users found</h3>
              <p className={`mt-4 max-w-sm mx-auto text-lg font-semibold tracking-tight ${textSecondary}`}>
                Try changing your search filters to find what you are looking for.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageUsers;

