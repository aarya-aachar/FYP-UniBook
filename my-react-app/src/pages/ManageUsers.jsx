import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getUsers, updateUserStatus, updateUserRole } from '../services/adminService';
import { Search, ShieldAlert, ShieldCheck, Ban, CheckCircle, UserX, UserCheck, Filter, AlertCircle } from 'lucide-react';
import AdminTopHeader from '../components/AdminTopHeader';

const ROLE_CONFIG = {
  admin: { 
    color: 'bg-emerald-600', 
    badge: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    badgeLight: 'bg-emerald-50 text-emerald-700 border-emerald-100 font-bold',
    label: 'System Admin',
    icon: ShieldCheck
  },
  user:  { 
    color: 'bg-teal-600',   
    badge: 'bg-teal-500/15 text-teal-400 border-teal-500/20',
    badgeLight: 'bg-teal-50 text-teal-700 border-teal-100 font-bold',
    label: 'Client',
    icon: ShieldAlert
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
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const textMuted = isDark ? "text-slate-500" : "text-slate-400";
  const cardBase = isDark ? "bg-slate-900 border border-slate-800 shadow-sm" : "bg-white border border-slate-200 shadow-sm";
  const borderCol = isDark ? "border-slate-800" : "border-slate-200";

  return (
    <div className="flex min-h-screen transition-colors duration-300 font-inter" 
         style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-lg shadow-lg text-white text-sm font-bold pointer-events-auto
            ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
            style={{ animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden">
        <AdminTopHeader 
          title="User Accounts" 
          subtitle={`Manage system access and privileges for ${users.length} registered accounts.`} 
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8 -mt-10">
           <div className={`flex items-center gap-3 px-4 py-2 rounded-lg border transition-all ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-emerald-400' : 'bg-emerald-500'} animate-pulse`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${textSecondary}`}>Active Members:</span>
              <span className={`font-bold text-sm ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>{users.filter(u => u.is_active).length}</span>
           </div>
        </div>

        {/* Data Table Controls */}
        <div className={`p-4 rounded-t-xl border-b-0 transition-all ${cardBase} flex flex-col md:flex-row gap-4 mb-0`} style={{ animation: 'fadeIn 0.6s ease-out' }}>
          <div className="relative flex-1">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${textMuted}`}>
              <Search className="w-5 h-5" />
            </span>
            <input 
              type="text" 
              placeholder="Search users by name or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-12 pr-6 py-3 border rounded-xl transition-all font-medium text-sm outline-none
                ${isDark ? 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:bg-white'}`} 
            />
          </div>
          <div className="relative">
            <span className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${textMuted} pointer-events-none`}>
              <Filter className="w-4 h-4" />
            </span>
            <select 
              value={roleFilter} 
              onChange={e => setRoleFilter(e.target.value)}
              className={`appearance-none pl-11 pr-10 py-3 border rounded-xl transition-all cursor-pointer font-bold text-xs uppercase tracking-widest outline-none
                ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300 focus:border-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-700 focus:border-emerald-600'}`}
            >
              <option value="All">All Roles</option>
              <option value="admin">Administrators</option>
              <option value="user">Clients</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className={`overflow-x-auto rounded-b-xl border border-t-0 transition-all ${cardBase}`} style={{ animation: 'fadeIn 0.7s ease-out' }}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${borderCol} ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>User Info</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Role</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Status</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider ${textSecondary}`}>Created</th>
                <th className={`px-6 py-4 text-xs font-black uppercase tracking-wider text-right ${textSecondary}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading Skeletons
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={`border-b ${borderCol}`}>
                    <td className="px-6 py-4"><div className={`h-10 w-48 rounded-lg animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    <td className="px-6 py-4"><div className={`h-6 w-24 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    <td className="px-6 py-4"><div className={`h-6 w-20 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    <td className="px-6 py-4"><div className={`h-4 w-24 rounded-full animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                    <td className="px-6 py-4 text-right"><div className={`h-8 w-24 rounded-lg animate-pulse ml-auto ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} /></td>
                  </tr>
                ))
              ) : filtered.length > 0 ? (
                filtered.map(u => {
                  const cfg = ROLE_CONFIG[String(u.role).toLowerCase()] || ROLE_CONFIG['user'];
                  const RoleIcon = cfg.icon;
                  return (
                    <tr key={u.id} className={`border-b last:border-b-0 transition-colors ${isDark ? 'border-slate-800 hover:bg-slate-800/50' : 'border-slate-200 hover:bg-slate-50'} ${!u.is_active && (isDark ? 'opacity-50 blur-[0.5px]' : 'opacity-60 grayscale-[30%]')}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${cfg.color}`}>
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-sm font-bold truncate ${textPrimary}`}>{u.name}</p>
                            <p className={`text-xs truncate ${textSecondary}`}>{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${isDark ? cfg.badge : cfg.badgeLight}`}>
                          <RoleIcon className="w-3 h-3" />
                          {cfg.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all
                          ${u.is_active 
                            ? (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200')
                            : (isDark ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-200')}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                          {u.is_active ? 'Active' : 'Suspended'}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${textSecondary}`}>
                        {new Date(u.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button 
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border outline-none cursor-pointer
                            ${u.is_active 
                              ? (isDark ? 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500 hover:text-white' : 'bg-white text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300') 
                              : (isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300')}`}
                        >
                          {u.is_active ? <UserX className="w-4 h-4"/> : <UserCheck className="w-4 h-4"/>}
                          {u.is_active ? 'Suspend' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Search className="w-8 h-8" />
                      </div>
                      <p className={`text-lg font-bold ${textPrimary}`}>No users found</p>
                      <p className={`text-sm mt-1 ${textSecondary}`}>Try adjusting your search query or role filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
