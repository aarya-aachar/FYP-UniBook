import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { createBooking } from "../services/bookingService";
import { useUserTheme } from "../context/UserThemeContext";
import { Lock, ShieldCheck, Check, Building, QrCode, CreditCard } from "lucide-react";
import api from "../services/api";

const Payment = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("scan"); // 'scan' | 'processing' | 'success'
  const [transactionId, setTransactionId] = useState("");

  const { date, time, price, providerName } = location.state || {};

  useEffect(() => {
    if (!date || !time) {
      navigate('/services');
    }
    document.title = "Secure Checkout | UniBook";
  }, [date, time, navigate]);

  const handleEsewaPayment = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create a pending booking first
      const booking = await createBooking({
        provider_id: providerId,
        booking_date: date,
        booking_time: time,
        status: 'pending',
        notes: "eSewa Transaction Initiation"
      });

      // 2. Call backend to get signed parameters
      const response = await api.post('/payment/initiate', {
        amount: price,
        booking_id: booking.id,
        booking_ids: booking.ids
      });
      
      const params = response.data;
      
      // 3. Create a hidden form and submit it to eSewa Sandbox
      const form = document.createElement('form');
      form.setAttribute('method', 'POST');
      form.setAttribute('action', 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');

      Object.keys(params).forEach(key => {
        const input = document.createElement('input');
        input.setAttribute('type', 'hidden');
        input.setAttribute('name', key);
        input.setAttribute('value', params[key]);
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      
    } catch (err) {
      console.error('>>> [eSewa Error]:', err);
      setError(err.response?.data?.message || err.message || "Failed to initiate eSewa payment.");
      setLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/my-appointments');
  };

  return (
    <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      
      <UserNavbar />

      <main className="flex-1 flex flex-col items-center justify-start pt-24 p-6 relative overflow-hidden transition-all duration-300">

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulseScale { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
          @keyframes dash { 0% { stroke-dashoffset: 1000; } 100% { stroke-dashoffset: 0; } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .pulse-btn { animation: pulseScale 2s infinite; }
          .path-success { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: dash 1.5s ease-in-out forwards; }
        `}</style>

        <div className="max-w-[450px] w-full slide-up z-10">
           
           <div className="text-center mb-8">
              <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mx-auto mb-4 shadow-sm transition-all
                ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600 md:shadow-inner'}`}>
                 <Lock className="w-6 h-6" />
              </div>
              <h1 className={`text-3xl font-bold tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Secure Checkout</h1>
              <p className={`text-sm transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pay with eSewa (Sandbox)</p>
           </div>

           <div className={`rounded-2xl border p-8 shadow-sm relative transition-all duration-300 glass-card`}>
              
              <div className={`rounded-xl p-5 mb-6 border transition-all ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200 md:shadow-inner'}`}>
                 <p className={`text-xs font-semibold uppercase tracking-wider mb-3 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Booking Details</p>
                 <h3 className={`font-bold text-xl mb-1 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{providerName || `Service Provider`}</h3>
                 <p className={`text-sm mb-5 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    {date} • {Array.isArray(time) ? time.sort().join(', ') : time}
                 </p>
                 
                 <div className={`flex items-end justify-between pt-4 border-t transition-colors ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <span className={`font-semibold uppercase tracking-wider text-xs transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Amount</span>
                    <span className={`text-2xl font-bold tracking-tight transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rs. {price || '0'}</span>
                 </div>
              </div>

              <div className="min-h-[260px] flex flex-col items-center justify-center transition-all duration-300">
                                  {step === 'scan' && (
                    <div className="w-full flex flex-col items-center slide-up">
                       <div className={`relative p-2 rounded-2xl mb-10 group border transition-all ${isDark ? 'bg-white/10 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <div className={`w-40 h-40 rounded-xl flex items-center justify-center transition-transform overflow-hidden bg-[#60bb46]`}>
                             <img 
                               src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp" 
                               alt="eSewa Logo" 
                               className="w-32 object-contain" 
                               onError={(e) => { e.target.src='/images/qr.png'; }}
                             />
                          </div>
                       </div>
                       
                       {error && <p className={`text-xs font-medium mb-6 w-full text-center px-4 py-3 rounded-xl border transition-all ${isDark ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-600 bg-red-50 border-red-100'}`}>{error}</p>}
                       
                       <button 
                         onClick={handleEsewaPayment} 
                         disabled={loading}
                         className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-300 flex items-center justify-center gap-3 shadow-md border-b-4 
                           ${loading 
                             ? (isDark ? 'bg-slate-800 text-slate-500 border-slate-900' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed') 
                             : 'bg-[#60bb46] text-white hover:bg-[#52a43b] border-[#458b32] hover:translate-y-[2px] hover:border-b-0 active:translate-y-[4px]'}`}
                       >
                          {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <CreditCard className="w-5 h-5" />
                          )}
                          {loading ? 'Initiating...' : 'Proceed to eSewa'}
                       </button>

                       <p className={`mt-6 text-[11px] text-center font-medium transition-colors ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                          You will be redirected to eSewa's secure payment portal
                       </p>
                    </div>
                 )}


                 {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center slide-up py-8">
                       <div className="relative w-20 h-20 mb-8">
                          <div className={`absolute inset-0 border-4 rounded-full transition-all ${isDark ? 'border-slate-700' : 'border-slate-200'}`} />
                          <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center animate-pulse text-emerald-500"><Building className="w-8 h-8" /></div>
                       </div>
                       <h3 className={`text-xl font-bold mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Verifying...</h3>
                       <p className={`text-sm text-center transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Contacting network for authorization</p>
                    </div>
                 )}

                 {step === 'success' && (
                    <div className="flex flex-col items-center justify-center slide-up py-4 w-full">
                       <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600'}`}>
                          <svg className="w-10 h-10 path-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                             <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                       </div>
                        <h3 className={`text-2xl font-bold mb-2 transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Confirmed!</h3>
                       <p className={`text-sm text-center mb-8 leading-relaxed transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Your transaction has been verified. Your appointment is now completely secured.</p>
                       
                       <button onClick={handleFinish} className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm cursor-pointer
                         ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}>
                          View Appointments
                       </button>
                    </div>
                 )}

              </div>

           </div>
           
           <div className={`mt-8 flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors z-10 relative ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Payment processed by eSewa ePay</span>
           </div>

        </div>
      </main>
    </div>
  );
};

export default Payment;
