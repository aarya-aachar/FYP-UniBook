import { useState, useEffect } from 'react';
import ProviderSidebar from '../components/ProviderSidebar';
import { useAdminTheme } from '../context/AdminThemeContext';
import api from '../services/api';
import { Bell, Calendar, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const NOTIFICATION_CONFIG = {
  new_booking: { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20' },
  booking_cancelled: { icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20' },
  system: { icon: Bell, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' }
};

const ProviderNotifications = () => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Notifications | Provider Portal';
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get('/provider/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/provider/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const textPrimary = isDark ? 'text-white' : 'text-slate-900';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm';

  return (
    <div className="flex min-h-screen font-inter" style={{ backgroundColor: isDark ? '#020617' : '#f1f5f9' }}>
      <ProviderSidebar isDark={isDark} />

      <div className="flex-1 px-8 py-10 max-w-4xl mx-auto overflow-hidden">
        <div className="mb-8">
          <p className={`text-xs font-black uppercase tracking-widest mb-2 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Provider Portal</p>
          <h1 className={`text-4xl font-extrabold tracking-tight ${textPrimary}`}>Notifications</h1>
          <p className={`mt-1 font-medium ${textSecondary}`}>Stay updated on your latest bookings and alerts</p>
        </div>

        <div className={`rounded-3xl border overflow-hidden ${cardBg}`}>
          {loading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className={`h-24 rounded-2xl animate-pulse ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-20 text-center">
              <Bell className={`w-12 h-12 mx-auto mb-4 opacity-20 ${textSecondary}`} />
              <p className={`text-base font-bold ${textSecondary}`}>You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {notifications.map(n => {
                const config = NOTIFICATION_CONFIG[n.type] || NOTIFICATION_CONFIG.system;
                const Icon = config.icon;
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={`flex items-start gap-4 px-8 py-6 transition-all ${
                      !n.is_read 
                        ? (isDark ? 'bg-slate-800/60 cursor-pointer' : 'bg-emerald-50/30 cursor-pointer') 
                        : (isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-50/60')
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4 mb-1">
                        <h3 className={`text-sm font-bold truncate ${textPrimary}`}>{n.title}</h3>
                        <span className={`text-[10px] font-bold uppercase tracking-widest flex-shrink-0 ${textSecondary}`}>
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm leading-relaxed ${textSecondary}`}>{n.message}</p>
                    </div>
                    {!n.is_read && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0" />
                    )}
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

export default ProviderNotifications;
