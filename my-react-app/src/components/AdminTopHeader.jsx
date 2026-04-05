import { Clock } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { useAdminTheme } from '../context/AdminThemeContext';
import { useState, useEffect } from 'react';

const AdminTopHeader = ({ title, subtitle, showTimestamp = false }) => {
  const { adminTheme } = useAdminTheme();
  const isDark = adminTheme === 'dark';
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!showTimestamp) return;
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, [showTimestamp]);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10 border-b border-slate-200 dark:border-slate-800 pb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      <div>
        <h1 className={`text-3xl font-black tracking-tight mb-1 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {title}
        </h1>
        {subtitle && (
          <p className={`text-sm font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-4 ml-auto">
        {/* Timestamp - Only shown on main dashboard */}
        {showTimestamp && (
          <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all shadow-sm
            ${isDark ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-white border-slate-100 text-slate-600'}`}>
            <Clock className="w-4 h-4 opacity-40 text-emerald-500" />
            <span className="text-xs font-bold tracking-wide">
              {formattedDate} <span className="mx-1 opacity-30">•</span> {formattedTime}
            </span>
          </div>
        )}

        {/* The Notification Bell - Placed to the right */}
        <div className="relative hover:scale-105 transition-transform active:scale-95 duration-200">
          <NotificationBell isDark={isDark} />
        </div>
      </div>
    </div>
  );
};

export default AdminTopHeader;
