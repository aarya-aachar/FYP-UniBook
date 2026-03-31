import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { getUsers, updateUserStatus, updateUserRole } from '../services/adminService';

// ─── Constants ──────────────────────────────────────────────────────────────
const BACKEND_URL = 'http://localhost:4000';

const ROLE_CONFIG = {
  admin: { color: 'from-purple-500 to-indigo-600', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30', label: 'Administrator' },
  user:  { color: 'from-blue-500 to-cyan-500',   badge: 'bg-blue-500/15 text-blue-300 border-blue-500/20',   label: 'Standard User' }
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
const SkeletonCard = () => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5 overflow-hidden animate-pulse">
    <div className="flex gap-4 items-center">
      <div className="w-14 h-14 bg-white/10 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/5 rounded w-1/2" />
      </div>
    </div>
    <div className="flex gap-2 mt-6">
      <div className="flex-1 h-10 bg-white/5 rounded-xl" />
      <div className="flex-1 h-10 bg-white/5 rounded-xl" />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ManageUsers = () => {
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
      console.log('ManageUsers: Successfully loaded users:', data);
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

  const handleRoleChange = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await updateUserRole(user.id, newRole);
      setUsers(users.map(u => u.id === user.id ? { ...u, role: newRole } : u));
      toast(`${user.name} promoted to ${newRole}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = (users || [])
    .filter(u => {
      if (!u) return false;
      const matchSearch = String(u.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        String(u.email || '').toLowerCase().includes(search.toLowerCase());
      
      // Case-insensitive role matching
      const userRole = String(u.role || '').toLowerCase();
      const filterRole = String(roleFilter).toLowerCase();
      
      const matchRole = roleFilter === 'All' || userRole === filterRole;
      return matchSearch && matchRole;
    });

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <Toast toasts={toasts} />

      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <Sidebar />

        <div className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-5xl font-extrabold text-white tracking-tight">
                Manage Users
              </h1>
              <p className="text-white/40 mt-1 text-base">
                {users.length} registered accounts · {filtered.length} showing
              </p>
            </div>
            <div className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-white/40 text-sm font-medium uppercase tracking-wider">Total Active:</span>
              <span className="text-emerald-400 font-bold text-lg">{users.filter(u => Number(u.is_active) === 1).length}</span>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</span>
              <input 
                type="text" 
                placeholder="Search by name or email..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-blue-400 transition-all font-medium" 
              />
            </div>
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 focus:outline-none focus:border-blue-400 transition-all cursor-pointer font-semibold"
            >
              <option value="All" className="bg-slate-800">All Roles</option>
              <option value="admin" className="bg-slate-800">Admins</option>
              <option value="user" className="bg-slate-800">Users</option>
            </select>
          </div>

          {/* User Cards Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(u => {
                const roleKey = String(u.role || '').toLowerCase().trim();
                const cfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG['user'];
                return (
                  <div key={u.id} 
                    className={`group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:-translate-y-1 shadow-lg
                    ${!u.is_active ? 'opacity-60 saturate-50' : 'opacity-100'}`}
                    style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                    
                    {/* Status Badge */}
                    <div className="absolute top-4 right-4 animate-pulse">
                        <div className={`w-3 h-3 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'}`} />
                    </div>

                    <div className="flex gap-4 items-center">
                      <Avatar name={u.name} role={u.role} />
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-lg truncate leading-tight">{u.name}</h3>
                        <p className="text-white/40 text-sm truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                        <span className="text-white/20 text-[10px] font-medium uppercase tracking-widest">
                          Joined {new Date(u.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="h-px bg-white/5 w-full" />

                      <div className="flex gap-2 pt-1">
                        <button 
                          onClick={() => handleToggleStatus(u)}
                          className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all border flex items-center justify-center gap-2
                          ${Number(u.is_active) === 1 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20' 
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'}`}
                        >
                          {Number(u.is_active) === 1 ? '🔴 Deactivate' : '🟢 Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
              <div className="text-7xl mb-4 opacity-20">👥</div>
              <h3 className="text-2xl font-bold text-white/50">No users found</h3>
              <p className="text-white/25 mt-2 max-w-xs mx-auto">
                No accounts match your search or filter criteria. Try resetting them.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ManageUsers;
