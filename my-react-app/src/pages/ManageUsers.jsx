import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getUsers, updateUserStatus, updateUserRole } from '../services/adminService';

const ROLE_CONFIG = {
  admin: { 
    color: 'from-purple-500 to-indigo-600', 
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    badgeLight: 'bg-purple-50 text-purple-600 border-purple-100 font-black',
    label: 'System Admin' 
  },
  user:  { 
    color: 'from-blue-500 to-cyan-500',   
    badge: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
    badgeLight: 'bg-blue-50 text-blue-600 border-blue-100 font-black',
    label: 'Standard Client' 
  }
};

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
      toast(`Failed to load: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    document.title = "Client List | Admin UniBook";
    fetchUsers(); 
  }, [fetchUsers]);

  const handleToggleStatus = async (user) => {
    try {
      const newStatus = !user.is_active;
      await updateUserStatus(user.id, newStatus);
      setUsers(users.map(u => u.id === user.id ? { ...u, is_active: newStatus } : u));
      toast(`${user.name} has been ${newStatus ? 'restored' : 'suspended'}`);
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const filtered = (users || [])
    .filter(u => {
      const matchSearch = String(u.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        String(u.email || '').toLowerCase().includes(search.toLowerCase());
      const matchRole = roleFilter === 'All' || String(u.role).toLowerCase() === String(roleFilter).toLowerCase();
      return matchSearch && matchRole;
    });

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-600";

  return (
    <div className="flex min-h-screen transition-colors duration-500 font-inter" 
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-sm font-black pointer-events-auto
            ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-red-500'}`}
            style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 px-10 py-12 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12" style={{ animation: 'fadeIn 0.5s ease-out' }}>
          <div>
            <h1 className={`text-4xl font-black tracking-tight mb-2 transition-colors ${textPrimary}`}>Client List</h1>
            <p className={`text-lg font-medium transition-colors ${textSecondary}`}>
              Total {users.length} registered accounts
            </p>
          </div>
          <div className={`flex items-center gap-4 px-8 py-5 rounded-[2.5rem] border transition-all shadow-2xl ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-slate-200/20'}`}>
             <span className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Active Members:</span>
             <span className={`font-black text-2xl ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{users.filter(u => u.is_active).length}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10">
          <div className="relative flex-1">
            <span className={`absolute left-6 top-1/2 -translate-y-1/2 text-xl transition-colors ${textSecondary} opacity-40`}>🔍</span>
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-16 pr-8 py-5 border rounded-3xl transition-all font-black text-lg outline-none
                ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/10 focus:border-blue-400 focus:bg-white/10' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-300 focus:border-blue-600 shadow-sm'}`} 
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
            className={`px-10 py-5 border rounded-3xl transition-all cursor-pointer font-black text-xs uppercase tracking-widest outline-none
              ${isDark ? 'bg-white/5 border-white/10 text-white/50 focus:border-blue-400' : 'bg-white border-slate-200 text-slate-700 focus:border-blue-600 shadow-sm'}`}
          >
            <option value="All">Global Roles</option>
            <option value="admin">Administrators</option>
            <option value="user">Standard Clients</option>
          </select>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1,2,3,4,5,6,7,8].map(i => (
              <div key={i} className={`h-64 rounded-[2.5rem] animate-pulse border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map(u => {
              const cfg = ROLE_CONFIG[String(u.role).toLowerCase()] || ROLE_CONFIG['user'];
              return (
                <div key={u.id} className={`group relative rounded-[3rem] p-8 transition-all duration-500 hover:-translate-y-2 border-b-8
                  ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-b-blue-500 shadow-2xl' : 'bg-white border-slate-200 hover:border-b-blue-600 shadow-xl shadow-slate-200/40'}
                  ${!u.is_active ? 'opacity-40 grayscale-[0.5]' : 'opacity-100'}`}
                  style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                  <div className="absolute top-8 right-8">
                      <div className={`w-3.5 h-3.5 rounded-full ${u.is_active ? 'bg-emerald-500 shadow-[0_0_15px_#10b981]' : 'bg-red-500 shadow-[0_0_15px_#ef4444]'}`} />
                  </div>
                  <div className="flex gap-6 items-center mb-10">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cfg.color} flex items-center justify-center text-2xl font-black text-white shadow-xl group-hover:scale-110 transition-transform`}>
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className={`font-black text-xl truncate tracking-tight transition-colors font-outfit ${textPrimary}`}>{u.name}</h3>
                      <p className={`text-xs font-bold truncate mt-1 transition-colors tracking-wide ${textSecondary}`}>{u.email}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-black border uppercase tracking-widest transition-all ${isDark ? cfg.badge : cfg.badgeLight}`}>
                        {cfg.label}
                      </span>
                      <span className={`text-xs font-black uppercase tracking-widest transition-colors ${textSecondary}`}>
                        EST. {new Date(u.created_at).getFullYear()}
                      </span>
                    </div>
                    <div className={`h-px w-full transition-colors ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
                    <button 
                      onClick={() => handleToggleStatus(u)}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border flex items-center justify-center gap-2
                        ${u.is_active 
                          ? (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-600 hover:text-white shadow-sm shadow-red-200/20') 
                          : (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-600 hover:text-white shadow-sm shadow-emerald-200/20')}`}
                    >
                      {u.is_active ? 'Suspend Access' : 'Restore Access'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={`text-center py-32 rounded-[3.5rem] border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-2xl'}`}>
            <div className="text-8xl mb-6 opacity-10">👥</div>
            <h3 className={`text-3xl font-black font-outfit ${textPrimary}`}>No members matched</h3>
            <p className={`mt-4 max-w-sm mx-auto text-lg font-bold tracking-tight ${textSecondary}`}>Adjust filters to find the account you need.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUsers;
