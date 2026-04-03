import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { getProviderById } from "../services/providerService";
import { getBookedTimes } from "../services/bookingService";
import { getProviderReviews } from "../services/reviewService";
import { useUserTheme } from "../context/UserThemeContext";
import { Hospital, Utensils, Activity, Sparkles, MapPin, Clock, CreditCard, ChevronDown, Calendar, Ban, Star, ArrowLeft } from "lucide-react";

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
      <div className="flex flex-col min-h-screen transition-all duration-300 font-inter"
           style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        
        <UserNavbar />

        <div className="flex-1 flex items-center justify-center">
           <div className="animate-pulse flex flex-col items-center">
              <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4 ${isDark ? 'border-blue-500' : 'border-blue-600'}`} />
              <p className={`text-sm font-semibold tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading slots...</p>
           </div>
        </div>
      </div>
    );
  }

  const imgSrc = provider?.image ? (provider.image.startsWith('/uploads') ? `${BACKEND_URL}${provider.image}` : provider.image) : null;
  
  let ProviderIcon = Sparkles;
  if (provider?.category === 'Hospitals') ProviderIcon = Hospital;
  if (provider?.category === 'Restaurants') ProviderIcon = Utensils;
  if (provider?.category === 'Futsal') ProviderIcon = Activity;
  const timeSlots = generateTimeSlots();

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative flex flex-col transition-all duration-300">
        <div className={`absolute top-0 right-0 w-full h-96 bg-gradient-to-b opacity-50 pointer-events-none transition-all duration-300
          ${isDark ? 'from-blue-900/10 to-transparent' : 'from-slate-100 to-transparent'}`} />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .slide-up { animation: slideUp 0.4s ease-out forwards; }
        `}</style>

        <div className="max-w-7xl mx-auto w-full slide-up pt-4 relative z-10">
          
          <div className={`flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b pb-6 transition-colors ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
            <div>
              <h1 className={`text-3xl font-bold tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose Date & Time</h1>
              <p className={`text-base transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'} max-w-2xl`}>Select a convenient time that works for you</p>
            </div>
            <button onClick={() => navigate(-1)} 
               className={`flex items-center gap-2 px-6 py-2.5 rounded-lg border transition-all font-medium text-sm whitespace-nowrap cursor-pointer
                 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}`}>
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            
            <div className={`lg:col-span-4 h-max rounded-2xl border p-8 shadow-sm relative overflow-hidden transition-all duration-200
              ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              {imgSrc && (
                <div className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-700">
                  <img src={imgSrc} alt={provider?.name} className="w-full h-full object-cover mix-blend-overlay" />
                </div>
              )}
              {isDark && <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent pointer-events-none" />}
              
              <div className="relative z-10 flex flex-col">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm border transition-all
                  ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                   <ProviderIcon className="w-6 h-6" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{provider?.name}</h2>
                <span className={`inline-block px-3 py-1 rounded inline-flex items-center text-xs font-semibold uppercase tracking-wider border w-max mb-5 transition-all
                  ${isDark ? 'border-slate-600 bg-slate-700 text-slate-300' : 'border-blue-200 bg-blue-50 text-blue-700'}`}>
                   {provider?.category}
                </span>

                {provider?.review_count > 0 && (
                   <div className="flex items-center gap-2 mb-6">
                      <div className="flex text-amber-500">
                         {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(provider.average_rating) ? "fill-current" : "opacity-30"}`} />
                         ))}
                      </div>
                      <span className={`text-sm font-medium transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{provider.average_rating} ({provider.review_count} Reviews)</span>
                   </div>
                )}
                
                <div className={`space-y-3 text-sm transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <p className="flex items-start gap-2.5 leading-relaxed">
                     <MapPin className="w-5 h-5 opacity-70 mt-0.5 shrink-0" />
                     {provider?.address || 'Location Unspecified'}
                  </p>
                  <p className="flex items-center gap-2.5">
                     <Clock className="w-5 h-5 opacity-70 shrink-0" />
                     {(provider?.opening_time || '09:00:00').substring(0,5)} - {(provider?.closing_time || '18:00:00').substring(0,5)}
                  </p>
                  <p className="flex items-center gap-2.5">
                     <CreditCard className="w-5 h-5 opacity-70 shrink-0" />
                     Rs. {provider?.base_price || '0.00'} <span className={`text-xs ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ 30 mins</span>
                  </p>
                </div>
                
                <div className={`mt-8 pt-8 border-t transition-colors ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                   <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Service Duration</label>
                   <div className={`flex border rounded-lg p-1 transition-all ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-slate-100 border-slate-200'}`}>
                      {[30, 60, 90, 120].map((mins) => (
                         <button
                           key={mins}
                           type="button"
                           onClick={() => setDuration(mins)}
                           className={`flex-1 py-2 rounded-md text-sm font-medium transition-all cursor-pointer ${duration === mins ? (isDark ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-600 shadow-sm border border-slate-200/60') : (isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700')}`}
                         >
                           {mins >= 60 ? (mins % 60 === 0 ? `${mins/60}h` : `${Math.floor(mins/60)}h ${mins%60}m`) : `${mins}m`}
                         </button>
                      ))}
                   </div>
                   <div className="mt-6 flex justify-between items-end">
                      <span className={`font-medium text-sm transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Amount</span>
                      <span className={`text-2xl font-bold transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rs. {calculateTotal()}</span>
                   </div>
                </div>
              </div>
            </div>

            <div className={`lg:col-span-8 rounded-2xl border p-8 shadow-sm transition-all duration-300
              ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                
                <div className="mb-8">
                  <label className={`block text-xs font-semibold uppercase tracking-wider mb-3 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>1. Pick a Date</label>
                  <div className="relative">
                     <Calendar className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                     <input
                       type="date"
                       min={today}
                       value={date}
                       onChange={(e) => setDate(e.target.value)}
                       className={`w-full rounded-xl pl-12 pr-4 py-3 text-base font-medium outline-none transition-all cursor-pointer border
                         ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-600 focus:bg-white focus:ring-1 focus:ring-blue-600'}`}
                       required
                     />
                  </div>
                </div>

                <div className="flex-1 mb-8">
                  <div className="flex items-center justify-between mb-4">
                     <label className={`block text-xs font-semibold uppercase tracking-wider transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>2. Choose Availability</label>
                     {slotsLoading && <span className="text-xs font-medium text-blue-500 animate-pulse">Syncing...</span>}
                  </div>
                  
                  {!date ? (
                    <div className={`h-48 border border-dashed rounded-xl flex flex-col items-center justify-center font-medium transition-all ${isDark ? 'border-slate-700 text-slate-500 bg-slate-900/30' : 'border-slate-300 text-slate-500 bg-slate-50'}`}>
                       <Calendar className="w-8 h-8 mb-3 opacity-40" />
                       Select a date first to see available slots
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className={`h-48 border border-dashed rounded-xl flex flex-col items-center justify-center font-medium transition-all ${isDark ? 'border-red-900/50 text-red-500 bg-red-900/10' : 'border-red-200 text-red-500 bg-red-50'}`}>
                       <Ban className="w-8 h-8 mb-3 opacity-40" />
                       No slots available for this provider.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {timeSlots.map((slot) => {
                         const status = getSlotStatus(slot);
                         const isSelected = time === slot;
                         
                         let btnClass = "py-3 rounded-lg text-sm font-semibold border transition-all duration-200 relative overflow-hidden ";
                         
                         if (status === 'booked') {
                           btnClass += isDark ? "bg-slate-800 border-slate-700/50 text-slate-600 cursor-not-allowed" : "bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed";
                         } else if (status === 'past') {
                           btnClass += isDark ? "bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-50 border-slate-100/50 text-slate-300 cursor-not-allowed";
                         } else if (isSelected) {
                           btnClass += "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20";
                         } else {
                           btnClass += isDark ? "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 cursor-pointer" : "bg-white border-slate-200 text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 cursor-pointer shadow-sm";
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
                             {status === 'booked' && <span className={`absolute flex items-center hidden justify-center text-[10px] font-bold uppercase`}>Taken</span>}
                           </button>
                         );
                      })}
                    </div>
                  )}
                  {date && (
                    <div className={`flex flex-wrap items-center gap-6 mt-6 pt-6 border-t text-xs font-semibold transition-colors ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                       <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300 shadow-sm'}`} /> Available</span>
                       <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-600 border border-blue-600 shadow-sm" /> Selected</span>
                       <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded border flex items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200 shadow-sm'}`}><div className="w-1.5 h-px bg-slate-400" /></div> Unavailable</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                   <button
                     type="submit"
                     disabled={!date || !time}
                     className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm
                       ${(!date || !time) ? (isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200') : 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer hover:shadow-md'}`}
                   >
                     {!date || !time ? 'Pick a slot' : 'Proceed to Checkout'}
                   </button>
                </div>

              </form>
            </div>
          </div>

          <div className="mt-8">
            <div className={`rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              <button 
                onClick={() => setShowReviews(!showReviews)}
                className={`w-full px-8 py-6 flex items-center justify-between transition-all text-left group cursor-pointer ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-amber-50 text-amber-600'}`}>
                    <Star className="w-6 h-6 fill-current" />
                  </div>
                  <div>
                    <h3 className={`text-xl font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Customer Reviews</h3>
                    <p className={`text-sm font-medium mt-1 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {reviews.length} Verified Experience{reviews.length === 1 ? '' : 's'}
                    </p>
                  </div>
                </div>
                <ChevronDown className={`w-6 h-6 transition-transform duration-300 ${showReviews ? 'rotate-180' : ''} ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
              </button>

              {showReviews && (
                <div className="px-8 pb-8 space-y-6">
                  {reviews.length === 0 ? (
                    <div className={`py-12 text-center border-t border-dashed transition-colors ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                      <p className={`font-medium text-sm transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>No feedback shared yet for this provider.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6 pt-2">
                      {reviews.map((r) => (
                        <div key={r.id} className={`rounded-xl p-6 transition-all border
                          ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-white shadow-sm'}`}>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-bold transition-all
                                ${isDark ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' : 'bg-blue-50 border-blue-100 text-blue-600'}`}>
                                {r.user_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <h4 className={`font-semibold text-sm transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{r.user_name}</h4>
                                <p className={`text-xs font-medium transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Verified User</p>
                              </div>
                            </div>
                            <div className="flex text-amber-500 text-sm">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "fill-current" : "opacity-30"}`} />
                              ))}
                            </div>
                          </div>
                          <p className={`text-sm leading-relaxed mb-4 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>"{r.comment}"</p>
                          <div className={`pt-4 border-t text-xs font-medium transition-colors ${isDark ? 'border-slate-700 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
                            Shared on {new Date(r.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
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
