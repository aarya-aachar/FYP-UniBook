import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { getProviderById } from "../services/providerService";
import { getBookedTimes } from "../services/bookingService";

const BACKEND_URL = 'http://localhost:4001';

const Booking = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  
  const [bookedSlots, setBookedSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  
  const [duration, setDuration] = useState(30);

  // Get today's date in YYYY-MM-DD format for the 'min' attribute
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const data = await getProviderById(providerId);
        setProvider(data);
        
        // Dynamic Defaults based on Category
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
    fetchProvider();
    document.title = "Book Appointment | UniBook";
  }, [providerId]);

  // Fetch booked slots whenever the date changes
  useEffect(() => {
    if (!date || !providerId) return;
    
    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setTime(""); // Reset selected time on date change
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

  // Generate 30-minute time slots between opening and closing time
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
      
      // Add 30 minutes
      current.setMinutes(current.getMinutes() + 30);
    }
    return slots;
  };

  const getSlotStatus = (slot) => {
    // 1. Check if already booked
    if (bookedSlots.includes(slot)) return 'booked';

    // 2. Check if it's in the past (only if selected date is today)
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
    // Base is assumed to be per 30 minutes.
    return (base * (duration / 30)).toFixed(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !time) {
      alert("Please select a date and time slot.");
      return;
    }
    // Redirect to payment page
    navigate(`/payment/${providerId}`, {
      state: { date, time, duration, price: calculateTotal(), providerName: provider?.name }
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#0f172a] text-white">
        <UserSidebar />
        <div className="flex-1 flex items-center justify-center">
           <div className="animate-pulse flex flex-col items-center">
             <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
             <p className="text-white/50 font-medium tracking-widest uppercase">Loading Availability...</p>
           </div>
        </div>
      </div>
    );
  }

  const imgSrc = provider?.image ? (provider.image.startsWith('/uploads') ? `${BACKEND_URL}${provider.image}` : provider.image) : null;
  const timeSlots = generateTimeSlots();

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-inter">
      <UserSidebar />

      <div className="flex-1 overflow-y-auto px-10 py-12 relative">
        {/* Ambient Glow */}
        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <div className="max-w-6xl mx-auto slide-up">
          
          {/* Header */}
          <div className="mb-12">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold mb-6 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
            </button>
            <h1 className="text-5xl font-black tracking-tight mb-2">Check Availability</h1>
            <p className="text-white/40 text-lg font-medium">Select a secure date and time for your appointment</p>
          </div>

          <div className="grid lg:grid-cols-12 gap-10">
            
            {/* Provider Context Card (Left) */}
            <div className="lg:col-span-4 h-max rounded-[2.5rem] bg-white/5 border border-white/10 p-8 shadow-2xl relative overflow-hidden group">
              {imgSrc && (
                <div className="absolute inset-0 opacity-40 pointer-events-none transition-opacity duration-700">
                  <img src={imgSrc} alt={provider?.name} className="w-full h-full object-cover mix-blend-overlay" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent pointer-events-none" />
              
              <div className="relative z-10 flex flex-col">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-3xl mb-6 shadow-xl backdrop-blur-md">
                   {provider?.category === 'Hospitals' ? '🏥' : provider?.category === 'Restaurants' ? '🍽️' : provider?.category === 'Futsal' ? '⚽' : '💆'}
                </div>
                <h2 className="text-3xl font-black mb-2">{provider?.name}</h2>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/10 w-max mb-6">
                   {provider?.category}
                </span>
                
                <div className="space-y-4 text-sm font-medium text-white/60">
                  <p className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/80">📍</span>
                     {provider?.address || 'Location Unspecified'}
                  </p>
                  <p className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/80">⏱️</span>
                     {(provider?.opening_time || '09:00:00').substring(0,5)} - {(provider?.closing_time || '18:00:00').substring(0,5)}
                  </p>
                  <p className="flex items-center gap-3">
                     <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-white/80">💸</span>
                     Rs. {provider?.base_price || '0.00'} <span className="text-white/30 text-xs">/ 30 mins</span>
                  </p>
                </div>
                
                <div className="mt-8 pt-8 border-t border-white/10">
                   <label className="block text-xs font-black uppercase tracking-[0.2em] mb-4 text-white/50">Service Duration</label>
                   <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
                      {[30, 60, 90, 120].map((mins) => (
                         <button
                           key={mins}
                           type="button"
                           onClick={() => setDuration(mins)}
                           className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${duration === mins ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg' : 'text-white/40 hover:text-white/80 border border-transparent'}`}
                         >
                           {mins >= 60 ? (mins % 60 === 0 ? `${mins/60}h` : `${Math.floor(mins/60)}h ${mins%60}m`) : `${mins}m`}
                         </button>
                      ))}
                   </div>
                   <div className="mt-6 flex justify-between items-end">
                      <span className="text-white/40 font-bold uppercase tracking-widest text-xs">Total</span>
                      <span className="text-2xl font-black text-emerald-400">Rs. {calculateTotal()}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Interactive Booking Matrix (Right) */}
            <div className="lg:col-span-8 rounded-[2.5rem] bg-white/5 border border-white/10 p-10 shadow-2xl backdrop-blur-xl">
              <form onSubmit={handleSubmit} className="flex flex-col h-full">
                
                {/* Date Picker */}
                <div className="mb-10">
                  <label className="block text-xs font-black uppercase tracking-[0.2em] mb-4 text-white/50">1. Select Date</label>
                  <input
                    type="date"
                    min={today}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-white font-bold text-lg outline-none focus:border-blue-500 focus:bg-white/10 transition-all cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                    required
                  />
                </div>

                {/* Time Slots Matrix */}
                <div className="flex-1 mb-10">
                  <div className="flex items-center justify-between mb-4">
                     <label className="block text-xs font-black uppercase tracking-[0.2em] text-white/50">2. Select Availability</label>
                     {slotsLoading && <span className="text-xs font-bold text-blue-400 animate-pulse">Syncing...</span>}
                  </div>
                  
                  {!date ? (
                    <div className="h-48 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-white/30 font-medium">
                       Select a date first to view availability
                    </div>
                  ) : timeSlots.length === 0 ? (
                    <div className="h-48 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-red-400 font-medium">
                       No slots available for this provider.
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {timeSlots.map((slot) => {
                        const status = getSlotStatus(slot);
                        const isSelected = time === slot;
                        
                        let btnClass = "py-4 rounded-2xl text-sm font-bold border transition-all duration-300 relative overflow-hidden ";
                        
                        if (status === 'booked') {
                          btnClass += "bg-red-500/10 border-red-500/20 text-red-500/50 cursor-not-allowed";
                        } else if (status === 'past') {
                          btnClass += "bg-white/5 border-white/5 text-white/20 cursor-not-allowed";
                        } else if (isSelected) {
                          btnClass += "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/30 scale-105";
                        } else {
                          btnClass += "bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30 hover:-translate-y-1";
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
                            {status === 'booked' && <span className="absolute inset-0 flex flex-col items-center justify-center bg-[#0f172a]/80 backdrop-blur-[2px] text-[9px] font-black uppercase tracking-widest text-red-400/80 leading-none">Booked</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {date && (
                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-white/5 text-[10px] font-black uppercase tracking-widest text-white/30">
                       <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-white/5 border border-white/10" /> Available</span>
                       <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-blue-600 border border-blue-500" /> Selected</span>
                       <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded bg-red-500/10 border border-red-500/20" /> Conflict</span>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="mt-auto">
                   <button
                     type="submit"
                     disabled={!date || !time}
                     className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all duration-300 flex items-center justify-center gap-3
                       ${(!date || !time) ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1'}`}
                   >
                     {!date || !time ? 'Select Slot to Continue' : 'Proceed to Secure Checkout →'}
                   </button>
                </div>

              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
