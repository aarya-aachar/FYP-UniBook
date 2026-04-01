import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";
import { getPastUserBookings, submitReview } from "../services/bookingService";

const UserReports = () => {
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
    document.title = "My Reports | UniBook";
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
    // Pre-fill if editing an existing review
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
      fetchReports(); // Refresh data to show the new review
    } catch (err) {
      console.error(err);
      toast("Failed to submit review", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
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

      <div className="flex-1 overflow-y-auto px-10 py-12 relative">
        {/* Ambient background glow */}
        <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-6xl mx-auto w-full slide-up pt-4">
          
          {/* Header to match ViewAppointments identically */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
            <div>
              <h1 className="text-4xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">My Reports</h1>
              <p className="text-lg text-white/40 max-w-2xl leading-relaxed">Review and manage your past service experiences.</p>
            </div>
            <button onClick={() => navigate('/services')} 
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:scale-105 transition-all w-max whitespace-nowrap">
              + New Booking
            </button>
          </div>

          {/* Bookings List */}
          <div className="space-y-6 pb-12">
            {loading ? (
               <div className="flex flex-col gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className="h-40 bg-white/5 rounded-[2.5rem] animate-pulse border border-white/10" />
                 ))}
               </div>
            ) : reports.length === 0 ? (
               <div className="text-center py-24 bg-white/5 rounded-[2.5rem] border border-white/10 border-dashed backdrop-blur-sm">
                 <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">📝</div>
                 <h3 className="text-xl font-black text-white/50">No past bookings yet</h3>
                 <p className="text-white/20 mt-2 font-medium">Once you attend a booking, it will appear here for review.</p>
               </div>
            ) : reports.map((b, i) => {
              const hasReviewed = !!b.review_id;
              return (
              <div key={b.id} 
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between gap-8 transition-all duration-300 hover:bg-white/10 hover:border-white/20 shadow-xl"
                style={{ animation: `slideUp 0.5s ease-out ${i * 0.08}s forwards`, opacity: 0 }}>
                
                <div className="flex items-start gap-6 w-full md:w-auto">
                  <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-110 transition-transform">
                    {b.category === 'Restaurants' ? '🍽️' : b.category === 'Futsal' ? '⚽' : b.category === 'Hospitals' ? '🏥' : '💆'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold truncate group-hover:text-blue-400 transition-colors mb-2">{b.provider_name}</h3>
                    <p className="text-white/40 text-sm font-bold uppercase tracking-widest flex flex-wrap items-center gap-x-4 gap-y-1 mb-4">
                      <span className="flex items-center gap-1.5"><span className="opacity-40 text-xs text-white">Date:</span> {new Date(b.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="flex items-center gap-1.5"><span className="opacity-40 text-xs text-white">Time:</span> {b.booking_time.substring(0,5)}</span>
                    </p>

                    {/* Display Review Summary if it exists */}
                    {hasReviewed && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mt-2 max-w-lg">
                        <div className="flex text-yellow-500 text-lg mb-2">
                          {[1,2,3,4,5].map(star => (
                            <span key={star} className={star <= b.rating ? 'opacity-100' : 'opacity-20 grayscale'}>★</span>
                          ))}
                        </div>
                        {b.comment && <p className="text-white/70 italic text-sm">"{b.comment}"</p>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-center w-full md:w-auto mt-4 md:mt-0 border-t border-white/10 md:border-none pt-6 md:pt-0">
                  <button 
                    onClick={() => openReviewModal(b)}
                    className={`px-8 py-4 rounded-xl border transition-all font-black text-xs uppercase tracking-[0.2em] whitespace-nowrap shadow-lg flex items-center gap-2
                      ${hasReviewed 
                        ? 'bg-white/5 text-white/50 border-white/10 hover:text-white hover:bg-white/10' 
                        : 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/40 hover:-translate-y-1'}`}
                  >
                    {hasReviewed ? '✏️ Edit Review' : '⭐ Leave Review'}
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* Review Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center fade-in p-4">
          <div className="absolute inset-0 bg-[#0f172a]/80 backdrop-blur-sm" onClick={closeReviewModal} />
          
          <div className="relative w-full max-w-lg bg-[#1e293b] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl slide-up">
            <h2 className="text-3xl font-black text-white mb-2">
              {activeBooking?.review_id ? 'Edit Review' : 'Rate Your Experience'}
            </h2>
            <p className="text-white/40 font-medium mb-8">Tell us about your time at <span className="text-white/80">{activeBooking?.provider_name}</span></p>
            
            <div className="mb-8">
              <label className="block text-white/40 text-sm font-bold uppercase tracking-widest mb-3">Service Rating</label>
              <div className="relative">
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-bold appearance-none cursor-pointer"
                >
                  <option value={0} disabled className="bg-[#1e293b] text-white/50">-- Select Rating --</option>
                  <option value={5} className="bg-[#1e293b]">⭐⭐⭐⭐⭐ (5 Stars) - Excellent</option>
                  <option value={4} className="bg-[#1e293b]">⭐⭐⭐⭐ (4 Stars) - Very Good</option>
                  <option value={3} className="bg-[#1e293b]">⭐⭐⭐ (3 Stars) - Average</option>
                  <option value={2} className="bg-[#1e293b]">⭐⭐ (2 Stars) - Poor</option>
                  <option value={1} className="bg-[#1e293b]">⭐ (1 Star) - Terrible</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">▼</div>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-white/40 text-sm font-bold uppercase tracking-widest mb-3">Optional Feedback</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share more details about your experience..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder-white/20 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium resize-none h-32"
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={closeReviewModal}
                disabled={isSubmitting}
                className="flex-1 px-6 py-4 rounded-xl bg-white/5 text-white/60 font-black uppercase tracking-[0.1em] text-xs hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleReviewSubmit}
                disabled={isSubmitting}
                className={`flex-1 px-6 py-4 rounded-xl font-black uppercase tracking-[0.1em] text-xs transition-all shadow-xl
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
