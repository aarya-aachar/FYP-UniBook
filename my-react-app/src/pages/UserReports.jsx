import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserNavbar from "../components/UserNavbar";
import { getPastUserBookings, submitReview, updateReview } from "../services/bookingService";
import { useUserTheme } from "../context/UserThemeContext";
import { FileText, CheckCircle, XCircle, Calendar, Clock, Utensils, Activity, Hospital, Sparkles, Star, Edit, Plus, MessageSquare } from 'lucide-react';

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
      if (activeBooking.review_id) {
        await updateReview(activeBooking.review_id, rating, comment);
      } else {
        await submitReview(activeBooking.id, activeBooking.provider_id, rating, comment);
      }
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

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Restaurants': return <Utensils className="w-6 h-6" />;
      case 'Futsal': return <Activity className="w-6 h-6" />;
      case 'Hospitals': return <Hospital className="w-6 h-6" />;
      default: return <Sparkles className="w-6 h-6" />;
    }
  }

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #020617 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-500">
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-400/5'}`} />

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
            <div key={t.id} className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg text-white text-sm font-medium pointer-events-auto
              ${t.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}
              style={{ animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
              {t.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              {t.message}
            </div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto w-full slide-up pt-4 relative z-10">
          
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b pb-6 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
              <h1 className={`text-3xl font-bold mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>My Reviews</h1>
              <p className={`text-base transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl`}>See the feedback you've shared for your past bookings.</p>
            </div>
            <button onClick={() => navigate('/services')} 
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium text-sm transition-all w-max shadow-sm cursor-pointer ${isDark ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
              <Plus className="w-4 h-4" /> New Booking
            </button>
          </div>

          <div className="space-y-6 pb-12">
            {loading ? (
               <div className="flex flex-col gap-4">
                 {[1,2,3].map(i => (
                   <div key={i} className={`h-40 rounded-2xl animate-pulse border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'}`} />
                 ))}
               </div>
            ) : reports.length === 0 ? (
               <div className={`text-center py-20 rounded-2xl border border-dashed transition-all ${isDark ? 'bg-slate-800/50 border-slate-600' : 'bg-slate-50 border-slate-300'}`}>
                 <div className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 transition-all ${isDark ? 'bg-slate-700 text-slate-500' : 'bg-slate-200 text-slate-400'}`}>
                    <FileText className="w-8 h-8" />
                 </div>
                 <h3 className={`text-xl font-semibold transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>No reviews yet</h3>
                 <p className={`mt-1 text-sm transition-colors ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>Once you attend an appointment, it will appear here for you to share your experience.</p>
               </div>
            ) : reports.map((b, i) => {
              const hasReviewed = !!b.review_id;
              return (
              <div key={b.id} 
                className={`group relative border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between gap-6 transition-all duration-300 shadow-sm
                  ${isDark ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-emerald-200'}`}
                style={{ animation: `slideUp 0.4s ease-out ${i * 0.05}s forwards`, opacity: 0 }}>
                
                <div className="flex items-start gap-6 w-full md:w-auto">
                  <div className={`w-14 h-14 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all
                    ${isDark ? 'bg-slate-700 border-slate-600 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                    {getCategoryIcon(b.category)}
                  </div>
                  <div className="min-w-0">
                    <h3 className={`text-xl font-bold truncate transition-colors group-hover:text-emerald-600 ${isDark ? 'text-white' : 'text-slate-900'}`}>{b.provider_name}</h3>
                    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 mb-4 text-sm transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4 opacity-60" /> {new Date(b.booking_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div className="flex items-center gap-2"><Clock className="w-4 h-4 opacity-60" /> {b.booking_time.substring(0,5)}</div>
                    </div>

                    {hasReviewed && (
                      <div className={`border rounded-xl p-5 mt-2 max-w-xl transition-all ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-inner'}`}>
                        <div className="flex text-amber-500 mb-3">
                          {[1,2,3,4,5].map(star => (
                            <Star key={star} className={`w-4 h-4 ${star <= b.rating ? 'fill-current' : 'opacity-30'}`} />
                          ))}
                        </div>
                        {b.comment && <p className={`text-sm italic transition-colors leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>"{b.comment}"</p>}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end justify-center w-full md:w-auto mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-none transition-colors border-slate-200 dark:border-slate-700">
                  <button 
                    onClick={() => openReviewModal(b)}
                    className={`px-5 py-2.5 flex items-center justify-center gap-2 w-full md:w-auto rounded-lg border font-medium text-sm transition-all shadow-sm cursor-pointer
                      ${hasReviewed 
                        ? (isDark ? 'bg-slate-800 text-slate-300 border-slate-600 hover:text-white hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:text-slate-900 hover:bg-slate-50')
                        : (isDark ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-500 hover:shadow' : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-sm')}`}
                  >
                    {hasReviewed ? <><Edit className="w-4 h-4" /> Edit Review</> : <><MessageSquare className="w-4 h-4" /> Leave Review</>}
                  </button>
                </div>
              </div>
            )})}
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center fade-in p-4">
          <div className="absolute inset-0 bg-[#020617]/70 backdrop-blur-md" onClick={closeReviewModal} />
          
          <div className={`relative w-full max-w-lg border rounded-2xl p-8 shadow-2xl slide-up transition-all duration-300
            ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-2xl font-bold mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {activeBooking?.review_id ? 'Edit Review' : 'Rate Your Experience'}
            </h2>
            <p className={`text-sm mb-6 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>How would you rate <span className={`transition-colors ${isDark ? 'text-white font-semibold' : 'text-slate-900 font-semibold'}`}>{activeBooking?.provider_name}</span>?</p>
            
            <div className="mb-6">
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select Rating</label>
              <div className="relative">
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className={`w-full border rounded-xl py-3 pl-4 pr-10 outline-none transition-all font-medium appearance-none cursor-pointer text-sm
                    ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm'}`}
                >
                  <option value={0} disabled className={isDark ? "bg-slate-900 text-slate-500" : "bg-white text-slate-400"}>-- Pick a rating --</option>
                  <option value={5} className={isDark ? "bg-slate-900" : "bg-white"}>⭐⭐⭐⭐⭐ Excellent</option>
                  <option value={4} className={isDark ? "bg-slate-900" : "bg-white"}>⭐⭐⭐⭐ Very Good</option>
                  <option value={3} className={isDark ? "bg-slate-900" : "bg-white"}>⭐⭐⭐ Average</option>
                  <option value={2} className={isDark ? "bg-slate-900" : "bg-white"}>⭐⭐ Poor</option>
                  <option value={1} className={isDark ? "bg-slate-900" : "bg-white"}>⭐ Terrible</option>
                </select>
                <div className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>▼</div>
              </div>
            </div>

            <div className="mb-8">
              <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Review (Optional)</label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us what you liked or how they can improve..."
                className={`w-full border rounded-xl p-4 outline-none transition-all font-medium resize-none h-32 text-sm
                  ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm placeholder-slate-400'}`}
              />
            </div>

            <div className="flex gap-4">
              <button 
                onClick={closeReviewModal}
                disabled={isSubmitting}
                className={`flex-1 px-4 py-2.5 rounded-lg border font-medium text-sm transition-colors cursor-pointer
                  ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
              >
                Cancel
              </button>
              <button 
                onClick={handleReviewSubmit}
                disabled={isSubmitting || rating === 0}
                className={`flex-1 px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer
                  ${isSubmitting || rating === 0 
                    ? (isDark ? 'bg-slate-700 text-slate-500 cursor-not-allowed border border-slate-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200') 
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow'}`}
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReports;
