import { useState, useEffect, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService';
import { 
  Check, 
  CheckCheck, 
  Trash2, 
  CalendarCheck, 
  Building2, 
  ShieldCheck, 
  Camera, 
  X, 
  Clock,
  Inbox,
  AlertCircle
} from 'lucide-react';
import AdminTopHeader from '../components/AdminTopHeader';

const ICON_MAP = {
  booking_confirmed: { icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  booking_cancelled: { icon: X, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  booking_reminder: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  provider_added: { icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  profile_updated: { icon: ShieldCheck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  photo_updated: { icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
};

const AdminNotifications = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      toast(`Failed to load notifications: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Notifications | Admin UniBook";
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkRead = async (id) => {
    try {
      await markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: 1 })));
      toast('All notifications marked as read');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast('Notification deleted');
    } catch (err) {
      toast(err.message, 'error');
    }
  };

  const timeAgo = (dateStr) => {
    const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-500";
  const cardBase = isDark ? "bg-slate-900 border border-slate-800 shadow-sm" : "bg-white border border-slate-200 shadow-sm";

  return (
    <div className="flex min-h-screen transition-colors duration-300 font-inter" 
         style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <Sidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Toasts */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-3 rounded-lg shadow-lg text-white text-sm font-bold pointer-events-auto
            ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
            style={{ animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            {t.type === 'success' ? <CheckCircle className="w-5 h-5 text-white"/> : <AlertCircle className="w-5 h-5 text-white"/>}
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 px-8 py-10 max-w-7xl mx-auto w-full overflow-hidden">
        <AdminTopHeader 
          title="System Notifications" 
          subtitle="Stay updated on provider activity, bookings, and system changes." 
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-6 mb-8 -mt-10">
          {notifications.some(n => !n.is_read) && (
            <button 
              onClick={handleMarkAllRead}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border outline-none cursor-pointer
                ${isDark ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500 hover:text-white' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'}`}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className={`rounded-3xl overflow-hidden shadow-sm border transition-all ${cardBase}`} style={{ animation: 'fadeIn 0.6s ease-out' }}>
          {loading ? (
             <div className="p-8 space-y-4">
               {[1, 2, 3, 4, 5].map(i => (
                 <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-white/5' : 'bg-slate-50'}`} />
               ))}
             </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 px-6">
              <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-50 text-slate-300'}`}>
                <Inbox className="w-10 h-10" />
              </div>
              <h3 className={`text-2xl font-black mb-2 tracking-tight ${textPrimary}`}>Clear Inbox</h3>
              <p className={`text-sm max-w-xs text-center font-medium ${textSecondary}`}>You don't have any notifications at the moment. We'll let you know when things happen.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map(n => {
                const cfg = ICON_MAP[n.type] || ICON_MAP.profile_updated;
                const Icon = cfg.icon;
                return (
                  <div 
                    key={n.id}
                    className={`flex items-start gap-5 p-8 transition-all group
                      ${!n.is_read 
                        ? (isDark ? 'bg-emerald-500/[0.03]' : 'bg-emerald-50/30')
                        : (isDark ? 'hover:bg-slate-800/30' : 'hover:bg-slate-50/50')}`}
                  >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border ${isDark ? 'border-transparent' : 'border-white'} ${cfg.bg}`}>
                      <Icon className={`w-7 h-7 ${cfg.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={`text-lg font-black leading-tight flex items-center gap-2 tracking-tight ${textPrimary}`}>
                            {n.title}
                            {!n.is_read && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 flex-shrink-0 animate-pulse" />
                            )}
                          </h4>
                          <p className={`mt-2 text-sm leading-relaxed font-medium ${textSecondary}`}>{n.message}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                          {!n.is_read && (
                            <button 
                              onClick={() => handleMarkRead(n.id)}
                              className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDark ? 'hover:bg-slate-700 text-slate-400 hover:text-white' : 'hover:bg-white text-slate-400 hover:text-emerald-600 border-transparent hover:border-slate-100 border shadow-sm'}`}
                              title="Mark as read"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDelete(n.id)}
                            className={`p-2.5 rounded-xl transition-all cursor-pointer ${isDark ? 'hover:bg-rose-500/20 text-slate-400 hover:text-rose-400' : 'hover:bg-white text-slate-400 hover:text-rose-600 border-transparent hover:border-rose-100 border shadow-sm'}`}
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center gap-4">
                         <div className={`flex items-center gap-2 text-xs font-bold tracking-tight ${textSecondary}`}>
                           <Clock className="w-3.5 h-3.5 opacity-50" />
                           {new Date(n.created_at).toLocaleString()}
                           <span className="mx-2 opacity-20 text-lg">•</span>
                           <span className="text-emerald-600/80">{timeAgo(n.created_at)}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CheckCircle = ({className}) => <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;

export default AdminNotifications;
