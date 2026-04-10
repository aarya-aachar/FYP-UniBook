import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell, Check, CheckCheck, Trash2, CalendarCheck, Building2, ShieldCheck, Camera, X, Clock, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../services/authService';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification } from '../services/notificationService';

const ICON_MAP = {
  booking_received: { icon: CalendarCheck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  new_booking: { icon: Building2, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
  booking_confirmed: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  booking_cancelled: { icon: X, color: 'text-rose-500', bg: 'bg-rose-500/10' },
  booking_reminder: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  provider_added: { icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  profile_updated: { icon: ShieldCheck, color: 'text-teal-500', bg: 'bg-teal-500/10' },
  photo_updated: { icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
};

const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const NotificationBell = ({ isDark = false }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const panelRef = useRef(null);
  const navigate = useNavigate();

  const refresh = useCallback(async () => {
    try {
      const [notifs, count] = await Promise.all([getNotifications(), getUnreadCount()]);
      setNotifications(notifs);
      setUnread(count);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    refresh();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    refresh();
  };

  const handleDelete = async (id) => {
    await deleteNotification(id);
    refresh();
  };

  const handleNotifClick = async (n) => {
    const user = getProfile();
    // Route logic
    let target = '';

    if (n.type.startsWith('booking_') || n.type === 'new_booking') {
      target = user?.role === 'admin' ? '/dashboard/admin/bookings' : '/my-appointments';
    } else if (n.type === 'photo_updated' || n.type === 'profile_updated') {
      target = user?.role === 'admin' ? '/dashboard/admin/profile' : '/profile';
    } else if (n.type === 'provider_added' && user?.role === 'admin') {
      target = '/dashboard/admin/providers';
    }

    // Mark as read immediately if not read
    if (!n.is_read) {
      await markAsRead(n.id);
      refresh();
    }

    if (target) {
      navigate(target);
      setOpen(false);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setOpen(!open); if (!open) refresh(); }}
        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border
          ${isDark 
            ? 'border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white' 
            : 'border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-900'}`}
      >
        <Bell className="w-[18px] h-[18px]" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1 shadow-sm animate-in zoom-in">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown Panel - Purely Absolute and Elevated */}
      {open && (
        <div className={`absolute right-0 top-12 w-[320px] sm:w-[380px] max-h-[480px] rounded-2xl shadow-2xl border overflow-hidden z-[999] animate-in fade-in duration-200
          ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          
          {/* Header */}
          <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
            <h3 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
            {unread > 0 && (
              <button 
                onClick={handleMarkAllRead}
                className={`flex items-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors
                  ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[380px] flex flex-col">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDark ? 'bg-slate-800 text-slate-600' : 'bg-slate-100 text-slate-400'}`}>
                  <Bell className="w-6 h-6" />
                </div>
                <p className={`text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>No notifications yet</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>You're all caught up!</p>
              </div>
            ) : (
              <>
                {/* View All Header Action - Now at top */}
                <button 
                  onClick={() => { 
                    const user = getProfile();
                    let path = '/notifications';
                    if (user?.role === 'admin') path = '/dashboard/admin/notifications';
                    if (user?.role === 'provider') path = '/provider/notifications';
                    navigate(path); 
                    setOpen(false); 
                  }}
                  className={`w-full py-3 text-xs font-bold transition-all border-b flex items-center justify-center gap-2 sticky top-0 z-10
                    ${isDark ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:bg-slate-800' : 'bg-slate-50 border-slate-100 text-emerald-600 hover:bg-emerald-50'}`}
                >
                  View All Notifications
                </button>

                {notifications.slice(0, 5).map(n => {
                  const cfg = ICON_MAP[n.type] || ICON_MAP.profile_updated;
                  const Icon = cfg.icon;
                  return (
                    <div 
                      key={n.id}
                      onClick={() => handleNotifClick(n)}
                      className={`flex items-start gap-3 px-5 py-4 transition-colors border-b cursor-pointer group
                        ${!n.is_read 
                          ? (isDark ? 'bg-emerald-500/5 border-slate-800/50' : 'bg-emerald-50/50 border-slate-100')
                          : (isDark ? 'border-slate-800/30 hover:bg-slate-800/30' : 'border-slate-50 hover:bg-slate-50')}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${cfg.bg}`}>
                        <Icon className={`w-4 h-4 ${cfg.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[13px] font-semibold leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{n.title}</p>
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{n.message}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-[10px] font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>{timeAgo(n.created_at)}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!n.is_read && (
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleMarkRead(n.id); }} 
                                className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'hover:bg-slate-700 text-slate-500' : 'hover:bg-slate-200 text-slate-400'}`} 
                                title="Mark as read"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDelete(n.id); }} 
                              className={`p-1 rounded transition-colors cursor-pointer ${isDark ? 'hover:bg-red-500/20 text-slate-500 hover:text-red-400' : 'hover:bg-red-50 text-slate-400 hover:text-red-500'}`} 
                              title="Delete"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
