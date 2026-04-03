import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { getProviderById } from "../services/providerService";
import { getBookedTimes } from "../services/bookingService";
import { getProviderReviews } from "../services/reviewService";
import { useUserTheme } from "../context/UserThemeContext";

const BACKEND_URL = 'http://localhost:4001';

const Booking = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { providerId } = useParams();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  const [duration, setDuration] = useState(30);
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchProviderData = async () => {
      try {
        const [data, reviewData] = await Promise.all([
          getProviderById(providerId),
          getProviderReviews(providerId)
        ]);
        
        setProvider(data);
        setReviews(reviewData || []);
        
        if (data?.category === 'Futsal' || data?.category === 'Salon / Spa') {
           setDuration(60);
        } else {
           setDuration(30);
        }
      } catch (err) {
        console.error("Failed to fetch provider details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProviderData();
    document.title = "Book Appointment | UniBook";
  }, [providerId]);

  useEffect(() => {
    if (!date || !providerId) return;
    
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setTime(""); 
        const taken = await getBookedTimes(providerId, date);
        setBookedSlots(taken || []);
      } catch (error) {
        console.error("Failed to fetch availability", error);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [date, providerId]);

  const generateTimeSlots = () => {
    if (!provider) return [];
    
    let { opening_time, closing_time } = provider;
    opening_time = opening_time || '09:00:00';
    closing_time = closing_time || '18:00:00';

    const slots = [];
    let current = new Date(`2000-01-01T${opening_time}`);
    const end = new Date(`2000-01-01T${closing_time}`);

    while (current < end) {
      const hours = String(current.getHours()).padStart(2, '0');
      const minutes = String(current.getMinutes()).padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  const getSlotStatus = (slot) => {
    if (bookedSlots.includes(slot)) return 'booked';
    if (date === today) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const [slotHour, slotMinute] = slot.split(':').map(Number);
      if (slotHour < currentHour || (slotHour === currentHour && slotMinute <= currentMinute)) {
        return 'past';
      }
    }
    return 'available';
  };

  const calculateTotal = () => {
    const base = parseFloat(provider?.base_price || 0);
    return (base * (duration / 30)).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) {
      alert("Please select a date and time slot.");
      return;
    }
    navigate(`/payment/${providerId}`, {
      state: { date, time, duration, price: calculateTotal(), providerName: provider?.name }
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
           style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        
        <UserNavbar />

        <div className="flex-1 flex items-center justify-center">
           <div className="animate-pulse flex flex-col items-center">
              <div className={`w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mb-6 ${isDark ? 'border-blue-500' : 'border-blue-600'}`} />
              <p className={`text-sm font-black tracking-widest uppercase ${isDark ? 'text-white/50' : 'text-slate-400'}`}>Finding Slots...</p>
           </div>
        </div>
      </div>
    );
  }

  const imgSrc = provider?.image ? (provider.image.startsWith('/uploads') ? `${BACKEND_URL}${provider.image}` : provider.image) : null;
  const timeSlots = generateTimeSlots();

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-500">
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <div className="max-w-7xl mx-auto w-full slide-up pt-4">
          
          <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b pb-8 transition-colors ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
            <div>
              <h1 className={`text-4xl font-black mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose Date & Time</h1>
              <p className={`text-lg transition-colors font-medium ${isDark ? 'text-white/40' : 'text-slate-500'} max-w-2xl leading-relaxed`}>Select a convenient time that works for you</p>
            </div>
            <button onClick={() => navigate(-1)} 
               className={`px-6 py-4 rounded-2xl border transition-all font-black text-xs uppercase tracking-[0.2em] whitespace-nowrap
                 ${isDark ? 'bg-white/5 text-white/60 border-white/10 hover:bg-white hover:text-slate-900' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-900 hover:text-white shadow-sm shadow-slate-200/20'}`}>
              ← Go Back
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            
            <div className={`lg:col-span-4 h-max rounded-[2.5rem] border p-8 shadow-2xl relative overflow-hidden group transition-all duration-500
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-slate-200/20'}`}>
              {imgSrc && (
                <div className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-700">
                  <img src={imgSrc} alt={provider?.name} className="w-full h-full object-cover mix-blend-overlay" />
                </div>
              )}
              {isDark && <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent pointer-events-none" />}
              
              <div className="relative z-10 flex flex-col">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-6 shadow-xl border transition-all
                  ${isDark ? 'bg-white/10 border-white/20 backdrop-blur-md' : 'bg-slate-100 border-slate-200'}`}>
                   {provider?.category === 'Hospitals' ? '🏥' : provider?.category === 'Restaurants' ? '🍽️' : provider?.category === 'Futsal' ? '⚽' : '💆'}
                </div>
                <h2 className={`text-3xl font-black mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{provider?.name}</h2>
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border w-max mb-6 transition-all
                  ${isDark ? 'border-white/10 bg-white/10 text-white/60' : 'border-blue-100 bg-blue-50 text-blue-600 shadow-sm'}`}>
                   {provider?.category}
                </span>

                {provider?.review_count > 0 && (
                   <div className="flex items-center gap-2 mb-6">
                      <div className="flex text-amber-400 text-sm">
                         {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={i < Math.floor(provider.average_rating) ? "opacity-100" : "opacity-30"}>★</span>
                         ))}
                      </div>
                      <span className={`text-sm font-bold transition-colors ${isDark ? 'text-white/60' : 'text-slate-600'}`}>{provider.average_rating} ({provider.review_count} Reviews)</span>
                   </div>
                )}
                
                <div className={`space-y-4 text-sm font-bold transition-colors ${isDark ? 'text-white/60' : 'text-slate-700'}`}>
                  <p className="flex items-center gap-3 leading-relaxed">
                     <span className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${isDark ? 'bg-white/5 border-white/10 text-white/80' : 'bg-slate-50 border-slate-100 text-slate-600 shadow-inner'}`}>📍</span>
                     {provider?.address || 'Location Unspecified'}
                  </p>
                  <p className="flex items-center gap-3">
                     <span className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${isDark ? 'bg-white/5 border-white/10 text-white/80' : 'bg-slate-50 border-slate-100 text-slate-600 shadow-inner'}`}>⏱️</span>
                     {(provider?.opening_time || '09:00:00').substring(0,5)} - {(provider?.closing_time || '18:00:00').substring(0,5)}
                  </p>
                  <p className="flex items-center gap-3">
                     <span className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all flex-shrink-0 ${isDark ? 'bg-white/5 border-white/10 text-white/80' : 'bg-slate-50 border-slate-100 text-slate-600 shadow-inner'}`}>💸</span>
                     Rs. {provider?.base_price || '0.00'} <span className={`text-xs transition-colors ${isDark ? 'text-white/30' : 'text-slate-500'}`}>/ 30 mins</span>
                  </p>
                </div>
                
                <div className={`mt-8 pt-8 border-t transition-colors ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                   <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-4 transition-colors ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Service Duration</label>
                   <div className={`flex border rounded-2xl p-1 transition-all ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                      {[30, 60, 90, 120].map((mins) => (
                         <button
                           key={mins}
                           type="button"
                           onClick={() => setDuration(mins)}
                           className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${duration === mins ? (isDark ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20') : (isDark ? 'text-white/40 hover:text-white/80' : 'text-slate-400 hover:text-slate-600')}`}
                         >
                           {mins >= 60 ? (mins % 60 === 0 ? `${mins/60}h` : `${Math.floor(mins/60)}h ${mins%60}m`) : `${mins}m`}
                         </button>
                      ))}
                   </div>
                   <div className="mt-8 flex justify-between items-end">
                      <span className={`font-black uppercase tracking-widest text-xs transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Total Amount</span>
                      <span className={`text-3xl font-black transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rs. {calculateTotal()}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className={`lg:col-span-8 rounded-[2.5rem] border p-10 shadow-2xl backdrop-blur-xl transition-all duration-500
              ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-slate-200/20'}`}>
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                
                <div className="mb-10">
                  <label className={`block text-xs font-black uppercase tracking-[0.2em] mb-4 transition-colors ${isDark ? 'text-white/50' : 'text-slate-500'}`}>1. Pick a Date</label>
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full rounded-2xl px-6 py-5 font-black text-lg outline-none transition-all cursor-pointer border
                      ${isDark ? 'bg-white/5 border-white/10 text-white focus:border-blue-500 focus:bg-white/10 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white shadow-sm'}`}
                    required
                  />
                </div>

                <div className="flex-1 mb-10">
                  <div className="flex items-center justify-between mb-4">
                     <label className={`block text-xs font-black uppercase tracking-[0.2em] transition-colors ${isDark ? 'text-white/50' : 'text-slate-500'}`}>2. Choose Availability</label>
                     {slotsLoading && <span className="text-xs font-black uppercase tracking-widest text-blue-500 animate-pulse">Syncing...</span>}
                  </div>
                  
                  {!date ? (
                    <div className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center font-bold transition-all ${isDark ? 'border-white/10 text-white/20' : 'border-slate-200 text-slate-400 bg-slate-50/50'}`}>
                       <span className="text-4xl mb-3 opacity-20">📅</span>
                       Select a date first to see available slots
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className={`h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center font-bold transition-all ${isDark ? 'border-white/10 text-red-400' : 'border-red-100 text-red-500 bg-red-50/30'}`}>
                       <span className="text-4xl mb-3 opacity-20">🚫</span>
                       No slots available for this provider.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {timeSlots.map((slot) => {
                         const status = getSlotStatus(slot);
                         const isSelected = time === slot;
                         
                         let btnClass = "py-4 rounded-2xl text-sm font-black border transition-all duration-300 relative overflow-hidden ";
                         
                         if (status === 'booked') {
                           btnClass += isDark ? "bg-red-500/10 border-red-500/20 text-red-500/50 cursor-not-allowed" : "bg-red-50 border-red-100 text-red-300 cursor-not-allowed";
                         } else if (status === 'past') {
                           btnClass += isDark ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed" : "bg-slate-50 border-slate-50 text-slate-300 cursor-not-allowed";
                         } else if (isSelected) {
                           btnClass += "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105";
                         } else {
                           btnClass += isDark ? "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1" : "bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 hover:-translate-y-1 shadow-sm";
                         }

                         return (
                           <button
                             key={slot}
                             type="button"
                             disabled={status !== 'available'}
                             onClick={() => setTime(slot)}
                             className={btnClass}
                           >
                             {slot}
                             {status === 'booked' && <span className={`absolute inset-0 flex flex-col items-center justify-center backdrop-blur-[2px] text-xs font-black uppercase tracking-widest text-red-400/80 leading-none ${isDark ? 'bg-[#0f172a]/80' : 'bg-white/80'}`}>Taken</span>}
                           </button>
                         );
                      })}
                    </div>
                  )}
                  {date && (
                    <div className={`flex flex-wrap items-center gap-6 mt-8 pt-8 border-t text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'border-white/5 text-white/30' : 'border-slate-100 text-slate-400'}`}>
                       <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`} /> Available</span>
                       <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600 border border-blue-500 shadow-sm shadow-blue-500/20" /> Selected</span>
                       <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded border ${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-100 border-red-200 shadow-sm'}`} /> Conflict</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                   <button
                     type="submit"
                     disabled={!date || !time}
                     className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl
                       ${(!date || !time) ? (isDark ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none') : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 hover:shadow-blue-500/20 hover:-translate-y-1'}`}
                   >
                     {!date || !time ? 'Pick a slot' : 'Confirm & Proceed to Checkout →'}
                   </button>
                </div>

              </form>
            </div>
          </div>

          <div className="mt-12">
            <div className={`rounded-[2.5rem] overflow-hidden shadow-2xl border transition-all duration-500 ${isDark ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-white border-slate-200 shadow-slate-200/20'}`}>
              <button 
                onClick={() => setShowReviews(!showReviews)}
                className={`w-full px-10 py-10 flex items-center justify-between transition-all text-left group ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600 shadow-inner'}`}>⭐</div>
                  <div>
                    <h3 className={`text-2xl font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Customer Reviews</h3>
                    <p className={`text-sm font-black uppercase tracking-widest mt-1 transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>
                      {reviews.length} Verified Experience{reviews.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <span className={`text-2xl transition-transform duration-500 ${showReviews ? 'rotate-180' : ''} ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
                  ▼
                </span>
              </button>

              {showReviews && (
                <div className="px-10 pb-10 space-y-6">
                  {reviews.length === 0 ? (
                    <div className={`py-12 text-center border-t border-dashed transition-colors ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                      <p className={`font-black uppercase tracking-[0.2em] text-xs transition-colors ${isDark ? 'text-white/20' : 'text-slate-300'}`}>No feedback shared yet for this provider.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-8 pt-4">
                      {reviews.map((r) => (
                        <div key={r.id} className={`rounded-3xl p-8 transition-all shadow-xl group border
                          ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-blue-100 shadow-slate-200/20'}`}>
                          <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl border flex items-center justify-center text-base font-black transition-all
                                ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600 shadow-inner'}`}>
                                {r.user_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h4 className={`font-black text-sm transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.user_name}</h4>
                                <p className={`text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'text-white/30' : 'text-slate-400'}`}>Verified User</p>
                              </div>
                            </div>
                            <div className="flex text-amber-500 text-sm">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={i < r.rating ? "opacity-100" : "opacity-20"}>★</span>
                              ))}
                            </div>
                          </div>
                          <p className={`text-sm leading-relaxed font-bold transition-colors ${isDark ? 'text-white/70' : 'text-slate-600'}`}>"{r.comment}"</p>
                          <div className={`mt-6 pt-6 border-t text-xs font-black uppercase tracking-widest transition-colors ${isDark ? 'border-white/5 text-white/20' : 'border-slate-100 text-slate-300'}`}>
                            Shared on {new Date(r.created_at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Booking;
