/**
 * The Booking Engine
 * 
 * relative path: /src/pages/Booking.jsx
 * 
 * This is the most critical and complex component in the customer journey. 
 * It handles the "Reservation Workflow" where users select their slots 
 * and prepare for payment.
 * 
 * Major Technical Features:
 * - Dynamic Slot Generation: Creates booking blocks based on business hours.
 * - Real-Time Availability: Checks the database to see which slots are full.
 * - Multi-Slot Logic: Allows users to book a range (e.g. 2pm - 4pm) in one go.
 * - Social Validation: Displays verified customer reviews to aid decision making.
 */

import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { getProviderById } from "../services/providerService";
import { getBookedTimes, getProviderReviews } from "../services/bookingService";
import { useUserTheme } from "../context/UserThemeContext";
import { Hospital, Utensils, Trophy, Scissors, MapPin, Clock, CreditCard, ChevronDown, Calendar, Ban, Star, ArrowLeft, X } from "lucide-react";

import { formatTime, formatMultiSlotRange } from "../utils/dateUtils";

const BACKEND_URL = 'http://localhost:4001';

const Booking = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { providerId } = useParams();
  const navigate = useNavigate();

  // State Management
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [selectedTimes, setSelectedTimes] = useState([]); // Array of strings like ["14:00", "15:00"]
  const [bookedSlots, setBookedSlots] = useState({}); // Example: { "10:00": 2 } (where 2 is the number of existing bookings)
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [duration, setDuration] = useState(60); 
  const [reviews, setReviews] = useState([]);
  const [showReviews, setShowReviews] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    /**
     * Initial Data Load
     * We pull the provider profile and their entire review history simultaneously 
     * to populate the page as fast as possible.
     */
    const fetchProviderData = async () => {
      try {
        const [data, reviewData] = await Promise.all([
          getProviderById(providerId),
          getProviderReviews(providerId)
        ]);

        setProvider(data);
        setReviews(reviewData || []);
        setDuration(60); // Standard 1-hour interval
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
    /**
     * Availability Sync
     * Triggered every time the user picks a new date. 
     * It queries the backend to see which time slots are still open.
     */
    if (!date || !providerId) return;

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setSelectedTimes([]); // Clear selections when date changes
        const taken = await getBookedTimes(providerId, date);
        setBookedSlots(taken || {});
      } catch (error) {
        console.error("Failed to fetch availability", error);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [date, providerId]);

  /**
   * generateTimeSlots
   * Uses the provider's opening and closing hours to build 
   * an array of hourly booking strings.
   */
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
      // Increment by 1 hour (60 mins)
      current.setMinutes(current.getMinutes() + 60); 
    }
    return slots;
  };

  /**
   * getSlotStatus
   * Determines if a specific hour is 'booked' (capacity reached), 
   * 'past' (time already passed today), or 'available'.
   */
  const getSlotStatus = (slot) => {
    const capacity = provider?.capacity || 1;
    const currentBooked = bookedSlots[slot] || 0;

    // Gate 1: Capacity Check
    if (currentBooked >= capacity) return 'booked';
    
    // Gate 2: Real-time Chronology Check (for current day bookings)
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

  /**
   * Final Price Calculation
   * Multiplies the number of selected slots by the business's base price.
   */
  const calculateTotal = () => {
    const base = parseFloat(provider?.base_price || 0);
    const slotsCount = selectedTimes.length || 1;
    return (base * slotsCount).toFixed(2);
  };

  /**
   * handleSubmit
   * Prepares the booking payload and passes it to the Payment page 
   * via React Router state (to avoid unnecessary API calls during transition).
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || selectedTimes.length === 0) {
      alert("Please select a date and at least one time slot.");
      return;
    }
    navigate(`/payment/${providerId}`, {
      state: {
        date,
        time: selectedTimes, 
        duration: selectedTimes.length * 60,
        price: calculateTotal(),
        providerName: provider?.name
      }
    });
  };

  if (loading) {
    return (
      <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
        <UserNavbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className={`w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4 ${isDark ? 'border-emerald-500' : 'border-emerald-600'}`} />
            <p className={`text-sm font-semibold tracking-widest uppercase ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Loading slots...</p>
          </div>
        </div>
      </div>
    );
  }

  // Gallery Processing: Handles both single images and full arrays
  const gallery = provider?.gallery_images
    ? (typeof provider.gallery_images === 'string' ? JSON.parse(provider.gallery_images) : provider.gallery_images)
    : (provider?.image ? [provider.image] : []);

  const imgSrc = gallery[0]
    ? (gallery[0].startsWith('/uploads') ? `${BACKEND_URL}${gallery[0]}` : gallery[0]) : null;

  let ProviderIcon = Scissors;
  if (provider?.category === 'Hospitals') ProviderIcon = Hospital;
  if (provider?.category === 'Restaurants') ProviderIcon = Utensils;
  if (provider?.category === 'Futsal') ProviderIcon = Trophy;
  if (provider?.category === 'Salon / Spa') ProviderIcon = Scissors;
  const timeSlots = generateTimeSlots();

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>

      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative flex flex-col transition-all duration-300">

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .slide-up { animation: slideUp 0.4s ease-out forwards; }
        `}</style>

        <div className="max-w-7xl mx-auto w-full slide-up pt-16 relative z-10">

          {/* Page Headers */}
          <div className="mb-10">
            <div className="glass-header">
              <h1 className={`text-4xl font-bold tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Choose Date & Time</h1>
              <p className={`text-base font-medium transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl`}>Select a convenient time that works for you</p>
            </div>
            <button onClick={() => navigate(-1)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg border transition-all font-medium text-sm whitespace-nowrap cursor-pointer mt-6
                 ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-sm'}`}>
              <ArrowLeft className="w-4 h-4" /> Go Back
            </button>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">

            {/* --- LEFT SIDE: Provider Details Summary --- */}
            <div className={`lg:col-span-4 h-max rounded-2xl border p-8 shadow-sm relative overflow-hidden transition-all duration-200 glass-card`}>
              {imgSrc && (
                <>
                  <div className="absolute inset-0 opacity-100 pointer-events-none transition-opacity duration-700">
                    <img src={imgSrc} alt={provider?.name} className="w-full h-full object-cover" />
                  </div>
                  <button
                    onClick={() => { setActiveImageIndex(0); setShowImageModal(true); }}
                    className="absolute top-4 right-4 px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white hover:bg-black/60 transition-all z-20 cursor-pointer flex items-center gap-2 group"
                  >
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {gallery.length > 1 ? `View All (${gallery.length})` : 'View Photo'}
                    </span>
                  </button>
                </>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

              <div className={`relative z-10 flex flex-col p-6 rounded-[1.5rem] border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-white/90 border-slate-100 shadow-sm'}`}>
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 shadow-sm border transition-all
                  ${isDark ? 'bg-slate-700 border-slate-600 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <ProviderIcon className="w-6 h-6" />
                </div>
                <h2 className={`text-2xl font-bold mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{provider?.name}</h2>
                <span className={`inline-block px-3 py-1 rounded inline-flex items-center text-xs font-semibold uppercase tracking-wider border w-max mb-5 transition-all
                  ${isDark ? 'border-slate-600 bg-slate-700 text-slate-300' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
                  {provider?.category}
                </span>

                {/* Ratings Hook */}
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
                    {formatTime(provider?.opening_time || '09:00:00')} - {formatTime(provider?.closing_time || '18:00:00')}
                  </p>
                  <p className="flex items-center gap-2.5">
                    <CreditCard className="w-5 h-5 opacity-70 shrink-0" />
                    Rs. {provider?.base_price || '0.00'} <span className={`text-xs ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>/ hour</span>
                  </p>
                </div>

                {/* Live Order Calculation Bar */}
                <div className={`mt-8 pt-8 border-t transition-colors ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className={`text-xs font-semibold uppercase tracking-wider transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Selection Summary</span>
                    <span className={`text-xs font-black uppercase text-emerald-500`}>{selectedTimes.length} slots</span>
                  </div>
                  <div className="flex flex-col gap-2 mb-6">
                    {selectedTimes.length > 0 ? (
                      <div className={`px-3 py-2.5 rounded-xl border flex flex-col gap-1 ${isDark ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                        <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Reserved Time Range</span>
                        <span className="text-sm font-bold tracking-tight">
                          {formatMultiSlotRange(selectedTimes, 60)}
                        </span>
                      </div>
                    ) : (
                      <span className={`text-[10px] font-medium transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400 italic'}`}>No slots selected</span>
                    )}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className={`font-medium text-sm transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Amount</span>
                    <span className={`text-2xl font-bold transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rs. {calculateTotal()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* --- RIGHT SIDE: Slot Selection Interface --- */}
            <div className={`lg:col-span-8 rounded-2xl border p-8 shadow-sm transition-all duration-300 glass-card`}>
              <form onSubmit={handleSubmit} className="flex flex-col h-full">

                {/* Date Selection */}
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
                         ${isDark ? 'bg-slate-900 border-slate-700 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600'}`}
                      required
                    />
                  </div>
                </div>

                {/* Slot Grid */}
                <div className="flex-1 mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <label className={`block text-xs font-semibold uppercase tracking-wider transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>2. Choose Availability</label>
                    {slotsLoading && <span className="text-xs font-medium text-emerald-500 animate-pulse">Syncing...</span>}
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
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {timeSlots.map((slot) => {
                        const status = getSlotStatus(slot);
                        const isSelected = selectedTimes.includes(slot);

                        let btnClass = "py-3 rounded-lg text-xs font-bold border transition-all duration-200 relative overflow-hidden ";

                        // Visual State Management
                        if (status === 'booked') {
                          btnClass += isDark ? "bg-slate-800 border-slate-700/50 text-slate-600 cursor-not-allowed" : "bg-slate-100 border-slate-200/50 text-slate-400 cursor-not-allowed";
                        } else if (status === 'past') {
                          btnClass += isDark ? "bg-slate-900/50 border-slate-800 text-slate-600 cursor-not-allowed" : "bg-slate-50 border-slate-100/50 text-slate-300 cursor-not-allowed";
                        } else if (isSelected) {
                          btnClass += "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20";
                        } else {
                          btnClass += isDark ? "bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500 cursor-pointer" : "bg-white border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 cursor-pointer shadow-sm";
                        }

                        const toggleSlot = () => {
                          if (status !== 'available') return;
                          if (isSelected) {
                            setSelectedTimes(selectedTimes.filter(t => t !== slot));
                          } else {
                            setSelectedTimes([...selectedTimes, slot]);
                          }
                        };

                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={status !== 'available'}
                            onClick={toggleSlot}
                            className={btnClass}
                          >
                            {formatTime(slot)}
                            {status === 'booked' && <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-black uppercase text-red-500 bg-red-500/5`}>Full</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {/* Legend */}
                  {date && (
                    <div className={`flex flex-wrap items-center gap-6 mt-6 pt-6 border-t text-xs font-semibold transition-colors ${isDark ? 'border-slate-700 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                      <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded border ${isDark ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-300 shadow-sm'}`} /> Available</span>
                      <span className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-600 border border-emerald-600 shadow-sm" /> Selected</span>
                      <span className="flex items-center gap-2"><div className={`w-3 h-3 rounded border flex items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200 shadow-sm'}`}><div className="w-1.5 h-px bg-slate-400" /></div> Unavailable</span>
                    </div>
                  )}
                </div>

                <div className="mt-auto">
                  <button
                    type="submit"
                    disabled={!date || selectedTimes.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm
                       ${(!date || selectedTimes.length === 0) ? (isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200') : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer hover:shadow-md'}`}
                  >
                    {!date || selectedTimes.length === 0 ? 'Pick your slots' : `Confirm Bookings (${selectedTimes.length})`}
                  </button>
                </div>

              </form>
            </div>
          </div>

          {/* Social Feedback Section */}
          <div className="mt-8">
            <div className={`rounded-2xl overflow-hidden shadow-sm border transition-all duration-300 glass-card`}>
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
                                ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
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

      {/* High-Fidelity Image Carousel */}
      {showImageModal && gallery.length > 0 && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setShowImageModal(false)} />

          <div className="relative max-w-5xl w-full h-[80vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/10 slide-up group">
            <img
              src={gallery[activeImageIndex]?.startsWith('/uploads') ? `${BACKEND_URL}${gallery[activeImageIndex]}` : gallery[activeImageIndex]}
              alt="Provider Gallery"
              className="w-full h-full object-contain"
            />

            {/* Modal Navigation */}
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-6 right-6 p-3 rounded-2xl bg-black/60 text-white hover:bg-red-500 transition-all cursor-pointer border border-white/10 z-30"
            >
              <X className="w-6 h-6" />
            </button>

            {gallery.length > 1 && (
              <>
                <div className="absolute inset-y-0 left-0 flex items-center pl-6">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev === 0 ? gallery.length - 1 : prev - 1); }}
                    className="p-4 rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/10 backdrop-blur-sm transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-6">
                  <button
                    onClick={(e) => { e.stopPropagation(); setActiveImageIndex(prev => prev === gallery.length - 1 ? 0 : prev + 1); }}
                    className="p-4 rounded-full bg-black/40 text-white hover:bg-black/60 border border-white/10 backdrop-blur-sm transition-all cursor-pointer scale-x-[-1]"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                </div>

                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2">
                  {gallery.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeImageIndex ? 'w-8 bg-emerald-500' : 'w-2 bg-white/20'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Booking;
