import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserSidebar from "../components/UserSidebar";
import { getPastUserBookings, submitReview } from "../services/bookingService";
import { useUserTheme } from "../context/UserThemeContext";

const UserReports = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);
  
  // Review Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeBooking, setActiveBooking] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(t => [...t, { id, message, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  useEffect(() => {
    document.title = "My Reviews | UniBook";
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getPastUserBookings();
      setReports(data || []);
    } catch (err) {
      console.error(err);
      toast('Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (booking) => {
    setActiveBooking(booking);
    setRating(booking.rating || 0);
    setComment(booking.comment || "");
    setIsModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsModalOpen(false);
    setActiveBooking(null);
    setRating(0);
    setHoverRating(0);
    setComment("");
  };

  const handleReviewSubmit = async () => {
    if (rating === 0) {
      toast("Please select a star rating", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      await submitReview(activeBooking.id, activeBooking.provider_id, rating, comment);
      toast(activeBooking.review_id ? "Review updated successfully!" : "Review posted successfully!");
      closeReviewModal();
      fetchReports();
    } catch (err) {
      console.error(err);
      toast("Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <UserSidebar />

      <style>{`
        @keyframes toastIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
      `}</style>

      {/* Toast Notification */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`flex items-center gap-3 pl-4 pr-5 py-4 rounded-2xl shadow-2xl text-white text-base font-bold pointer-events-auto
            ${t.type === 'success' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-red-500'}`}
            style={{ animation: 'toastIn 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <span className="text-xl">{t.type === 'success' ? '✅' : '❌'}</span>
            {t.message}
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-10 py-12 relative transition-all duration-500">
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />
        
        <div className="max-w-6xl mx-auto w-full slide-up pt-4">
          
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b pb-8 transition-colors ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <h1 className={`text-4xl font-black mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>My Reviews</h1>
              <p className={`text-lg transition-colors font-medium ${isDark ? 'text-white/40' : 'text-slate-500'} max-w-2xl leading-relaxed`}>See the feedback you've shared for your past bookings.</p>
            </div>
            <button onClick={() => navigate('/services')} 
              className="px-8 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-sm uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-105 transition-all w-max whitespace-nowrap">
              + New Booking
            </button>
          </div>

          <div className="space-y-6 pb-12">
            {loading ? (
               <div className="flex flex-col gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className={`h-40 rounded-[2.5rem] animate-pulse border transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />
                 ))}
               </div>
            ) : reports.length === 0 ? (
               <div className={`text-center py-24 rounded-[2.5rem] border border-dashed backdrop-blur-sm transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-slate-200/20'}`}>
                 <div className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>📝</div>
                 <h3 className={`text-2xl font-black transition-colors ${isDark ? 'text-white/50' : 'text-slate-400'}`}>No reviews yet</h3>
                 <p className={`mt-2 text-sm font-bold transition-colors ${isDark ? 'text-white/20' : 'text-slate-300'}`}>Once you attend an appointment, it will appear here for you to share your experience.</p>
               </div>
            ) : reports.map((b, i) => {
              const hasReviewed = !!b.review_id;
              return (
              <div key={b.id} 
                className={`group relative border rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between gap-8 transition-all duration-500 shadow-xl
                  ${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-blue-200 shadow-slate-200/20'}`}
                style={{ animation: `slideUp 0.5s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
                
                <div className="flex items-start gap-6 w-full md:w-auto">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-all
                    ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-inner group-hover:bg-white'}`}>
                    {b.category === 'Restaurants' ? '🍽️' : b.category === 'Futsal' ? '⚽' : b.category === 'Hospitals' ? '🏥' : '💆'}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-2xl font-black truncate transition-colors group-hover:text-blue-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.provider_name}</h3>
                    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 mb-4 text-sm font-bold uppercase transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      <div className="flex items-center gap-2 tracking-widest"><span className="opacity-40">📅</span> {new Date(b.booking_date).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                      <div className="flex items-center gap-2 tracking-widest"><span className="opacity-40">⏱️</span> {b.booking_time.substring(0,5)}</div>
                    </div>

                    {hasReviewed && (
                      <div className={`border rounded-2xl p-6 mt-2 max-w-xl transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                        <div className="flex text-amber-500 text-xl mb-3">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className={star <= b.rating ? 'opacity-100' : 'opacity-20 grayscale'}>★</span>
                          ))}
                        </div>
                        {b.comment && <p className={`italic text-sm font-bold transition-colors leading-relaxed ${isDark ? 'text-white/70' : 'text-slate-600'}`}>"{b.comment}"</p>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-center w-full md:w-auto mt-4 md:mt-0 border-t border-white/10 md:border-none pt-6 md:pt-0">
                  <button 
                    onClick={() => openReviewModal(b)}
                    className={`px-8 py-5 rounded-2xl border transition-all font-black text-xs uppercase tracking-[0.2em] whitespace-nowrap shadow-xl flex items-center gap-3
                      ${hasReviewed 
                        ? (isDark ? 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10' : 'bg-white text-slate-400 border-slate-200 hover:text-slate-900 hover:bg-slate-50 shadow-slate-200/20')
                        : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-500 hover:-translate-y-1'}`}
                  >
                    {hasReviewed ? '✏️ Edit Review' : '⭐ Leave Review'}
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center fade-in p-4">
          <div className="absolute inset-0 bg-[#0f172a]/70 backdrop-blur-md" onClick={closeReviewModal} />
          
          <div className={`relative w-full max-w-lg border rounded-[2.5rem] p-10 shadow-2xl slide-up transition-all duration-500
            ${isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-3xl font-black mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeBooking?.review_id ? 'Edit Review' : 'Rate Your Experience'}
            </h2>
            <p className={`text-lg font-medium mb-8 transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>How would you rate <span className={`transition-colors ${isDark ? 'text-white' : 'text-slate-900 font-black'}`}>{activeBooking?.provider_name}</span>?</p>
            
            <div className="mb-8">
              <label className={`block text-xs font-black uppercase tracking-widest mb-4 transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Select Rating</label>
              <div className="relative">
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className={`w-full border rounded-2xl p-5 outline-none transition-all font-black appearance-none cursor-pointer text-sm
                    ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500/50 focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white shadow-sm'}`}
                >
                  <option value={0} disabled className={isDark ? "bg-[#1e293b] text-white/50" : "bg-white text-slate-400"}>-- Pick a status --</option>
                  <option value={5} className={isDark ? "bg-[#1e293b]" : "bg-white"}>⭐⭐⭐⭐⭐ Excellent</option>
                  <option value={4} className={isDark ? "bg-[#1e293b]" : "bg-white"}>⭐⭐⭐⭐ Very Good</option>
                  <option value={3} className={isDark ? "bg-[#1e293b]" : "bg-white"}>⭐⭐⭐ Average</option>
                  <option value={2} className={isDark ? "bg-[#1e293b]" : "bg-white"}>⭐⭐ Poor</option>
                  <option value={1} className={isDark ? "bg-[#1e293b]" : "bg-white"}>⭐ Terrible</option>
                </select>
                <div className={`absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isDark ? 'text-white/40' : 'text-slate-400'}`}>▼</div>
              </div>
            </div>

            <div className="mb-10">
              <label className={`block text-xs font-black uppercase tracking-widest mb-4 transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Review (Optional)</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you liked or how they can improve..."
                className={`w-full border rounded-2xl p-6 placeholder-white/20 outline-none transition-all font-bold resize-none h-40 text-sm
                  ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500/50 focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white shadow-sm placeholder-slate-400'}`}
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={closeReviewModal}
                disabled={isSubmitting}
                className={`flex-1 px-6 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-colors
                  ${isDark ? 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-900'}`}
              >
                Close
              </button>
              <button 
                onClick={handleReviewSubmit}
                disabled={isSubmitting}
                className={`flex-1 px-6 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl
                  ${isSubmitting || rating === 0 
                    ? 'bg-blue-600/30 text-white/30 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-[1.02]'}`}
              >
                {isSubmitting ? 'Posting...' : 'Post Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReports;
