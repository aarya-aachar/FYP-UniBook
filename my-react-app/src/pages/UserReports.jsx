import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";

// Demo monthly report data (frontend only)
const demoReports = [
  {
    id: 1,
    month: "September 2025",
    service: "Hospital",
    provider: "KMC Hospital",
    date: "2025-09-12",
    time: "10:00 AM",
    price: 1500,
  },
  {
    id: 2,
    month: "September 2025",
    service: "Restaurant",
    provider: "Spice Garden",
    date: "2025-09-18",
    time: "7:00 PM",
    price: 2000,
  },
];

const UserReports = () => {
  const [reports] = useState(demoReports);
  const [ratings, setRatings] = useState({});
  const [feedbacks, setFeedbacks] = useState({});
  const [toasts, setToasts] = useState([]);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  useEffect(() => {
    document.title = "User | Reports - UniBook";
  }, []);

  const handleRatingChange = (id, value) => {
    setRatings({ ...ratings, [id]: value });
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbacks({ ...feedbacks, [id]: value });
  };

  const submitReview = (id) => {
    if (!ratings[id]) {
      toast("Please select a rating first.", 'error');
      return;
    }
    toast(`Review submitted for ${reports.find(r => r.id === id)?.provider}!`);
  };

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes fadeIn  { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
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
        <UserSidebar />

        <div className="flex-1 px-10 py-12 max-w-6xl mx-auto w-full overflow-y-auto">
          
          <div className="mb-12" style={{ animation: 'fadeIn 0.6s ease-out' }}>
            <h1 className="text-5xl font-black text-white tracking-tight leading-none mb-2">Booking Reports</h1>
            <p className="text-white/30 text-lg font-medium">History of your service experiences and feedback</p>
          </div>

          <div className="space-y-8">
            {reports.map((r, i) => (
              <div
                key={r.id}
                className="group bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-8 shadow-2xl transition-all duration-300 hover:bg-white/10 hover:border-white/20"
                style={{ animation: `fadeIn 0.6s ease-out ${i * 0.1}s forwards`, opacity: 0 }}
              >
                <div className="grid lg:grid-cols-2 gap-12 items-center">

                  {/* Booking Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-xl shadow-blue-500/20">
                        {r.service === 'Hospital' ? '🏥' : r.service === 'Restaurant' ? '🍽️' : '💆'}
                      </div>
                      <div>
                        <h2 className="text-2xl font-black text-white tracking-tight leading-loose mb-1">
                          {r.provider}
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-widest">
                          {r.service}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Date & Time</p>
                        <p className="text-white/70 font-bold text-sm">
                          {new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {r.time}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                        <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Cost</p>
                        <p className="text-blue-400 font-bold text-sm">Rs. {r.price}</p>
                      </div>
                    </div>
                    
                    <p className="text-white/20 text-xs font-bold uppercase tracking-widest px-1">
                      Billing Cycle: <span className="text-white/40">{r.month}</span>
                    </p>
                  </div>

                  {/* Review Section */}
                  <div className="space-y-4">
                    <h3 className="text-white/40 text-[10px] font-black uppercase tracking-widest px-1">Quality Assessment</h3>
                    
                    <div className="relative group/select">
                      <select
                        value={ratings[r.id] || ""}
                        onChange={(e) => handleRatingChange(r.id, e.target.value)}
                        className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold appearance-none focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all cursor-pointer"
                      >
                        <option value="" className="bg-slate-900 text-white">Select Rating</option>
                        {[5,4,3,2,1].map(num => (
                          <option key={num} value={num} className="bg-slate-900 text-white">
                            {Array(num).fill('⭐').join(' ')} ({num})
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 group-hover/select:text-white/40 transition-colors">▼</div>
                    </div>

                    <textarea
                      placeholder="Share your experience (Optional)..."
                      value={feedbacks[r.id] || ""}
                      onChange={(e) => handleFeedbackChange(r.id, e.target.value)}
                      className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-medium focus:outline-none focus:border-blue-500 focus:bg-white/10 transition-all placeholder-white/20 min-h-[120px] resize-none"
                    />

                    <button
                      onClick={() => submitReview(r.id)}
                      className="w-full py-4 rounded-2xl bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                      Post Review →
                    </button>
                  </div>

                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <div className="text-center py-24 bg-white/5 rounded-[3rem] border border-white/10 border-dashed">
                <p className="text-7xl mb-6 opacity-20">📊</p>
                <h3 className="text-2xl font-black text-white/50">No activity yet</h3>
                <p className="text-white/20 mt-2 font-medium">Your booking reports will appear here after your appointments.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserReports;
