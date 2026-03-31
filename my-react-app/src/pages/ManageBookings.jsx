import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getAllBookings, updateBookingStatus } from '../services/bookingService';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  useEffect(() => {
    document.title = "Admin | Manage Bookings - UniBook";
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
      toast('Failed to load bookings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      toast(`Booking ${status} successfully!`);
    } catch (err) {
      console.error(err);
      toast('Failed to update status', 'error');
    }
  }

  const getStatusConfig = (status) => {
    const s = status?.toLowerCase();
    switch(s) {
      case 'confirmed': return { badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: '✅ Status: Confirmed' };
      case 'pending':   return { badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',     icon: '⏳ Status: Pending' };
      case 'cancelled': return { badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',       icon: '❌ Status: Cancelled' };
      default:          return { badge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',      icon: '❓ Status: Unknown' };
    }
  }

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* Toast Notification */}
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

      <div className="flex min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <Sidebar />

        <div className="flex-1 px-6 py-10 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-10">
            <div>
              <h1 className="text-5xl font-extrabold text-white tracking-tight">Manage Bookings</h1>
              <p className="text-white/40 mt-1 text-base">Total {bookings.length} reservations found in system</p>
            </div>
            <div className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10">
               <span className="text-white/40 text-sm font-medium uppercase tracking-wider">Active:</span>
               <span className="text-emerald-400 font-bold text-lg">{bookings.filter(b => b.status === 'confirmed').length}</span>
            </div>
          </div>

          <div className="grid gap-5">
            {loading ? (
               <div className="flex flex-col gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-32 bg-white/5 rounded-3xl animate-pulse border border-white/10" />
                 ))}
               </div>
            ) : bookings.length === 0 ? (
               <div className="text-center py-28 bg-white/5 rounded-3xl border border-white/10">
                 <div className="text-7xl mb-4 opacity-20">📅</div>
                 <h3 className="text-2xl font-bold text-white/50">No bookings yet</h3>
                 <p className="text-white/20 mt-2">All new appointments will appear here.</p>
               </div>
            ) : bookings.map(b => {
              const cfg = getStatusConfig(b.status);
              return (
              <div key={b.id} className="group relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 transition-all duration-300 hover:border-white/20 hover:bg-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
                   style={{ animation: 'fadeIn 0.4s ease forwards' }}>
                <div className="flex gap-5 items-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl shadow-xl">
                    {b.category === 'Restaurants' ? '🍽️' : b.category === 'Futsal' ? '⚽' : b.category === 'Hospitals' ? '🏥' : '💆'}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-xl flex items-center gap-2">
                       {b.user_name}
                       <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-black border ${cfg.badge}`}>{b.status}</span>
                    </h3>
                    <p className="text-white/40 text-base font-medium">{b.user_email}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-white/60">
                       <span className="flex items-center gap-1.5"><span className="opacity-40">🏢</span> {b.provider_name}</span>
                       <span className="flex items-center gap-1.5"><span className="opacity-40">🗓️</span> {new Date(b.booking_date).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1.5"><span className="opacity-40">⏰</span> {b.booking_time}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {b.status?.toLowerCase() === 'pending' && (
                    <button onClick={() => updateStatus(b.id, 'confirmed')} 
                      className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-2">
                      ✅ Confirm
                    </button>
                  )}
                  {b.status?.toLowerCase() === 'pending' && (
                    <button onClick={() => updateStatus(b.id, 'cancelled')} 
                            className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-bold text-sm bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all flex items-center gap-2">
                      ❌ Cancel
                    </button>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>
    </>
  );
};

export default ManageBookings;
