import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { createBooking } from "../services/bookingService";
import { useUserTheme } from "../context/UserThemeContext";
import { Lock, ShieldCheck, Check, Building, QrCode } from "lucide-react";

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

  const handleSimulateScan = async () => {
    const validDemoId = "DEMO12345K";
    
    if (transactionId !== validDemoId) {
      return setError(`Verification failed. Use the demo ID: ${validDemoId}`);
    }
    
    setStep('processing');
    setError(null);

    setTimeout(async () => {
      try {
        await createBooking({
          provider_id: providerId,
          booking_date: date,
          booking_time: time,
          status: 'confirmed',
          notes: "Verified QR Payment. ID: " + transactionId
        });
        setStep('success');
      } catch (err) {
        setError(err.message || "Payment failed. Please try again.");
        setStep('scan');
      }
    }, 2500);
  };

  const handleFinish = () => {
    navigate('/my-appointments');
  };

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #020617 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-300">
        <div className={`absolute top-0 right-0 w-full h-96 bg-gradient-to-b opacity-50 pointer-events-none transition-all duration-300
          ${isDark ? 'from-emerald-900/10 to-transparent' : 'from-emerald-50 to-transparent'}`} />

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
              <h1 className={`text-3xl font-bold tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Complete Booking</h1>
              <p className={`text-sm transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Secure Payment via QR Scan</p>
           </div>

           <div className={`rounded-2xl border p-8 shadow-sm relative transition-all duration-300
             ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
              
              <div className={`rounded-xl p-5 mb-6 border transition-all ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200 md:shadow-inner'}`}>
                 <p className={`text-xs font-semibold uppercase tracking-wider mb-3 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Booking Details</p>
                 <h3 className={`font-bold text-xl mb-1 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{providerName || `Service Provider`}</h3>
                 <p className={`text-sm mb-5 transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{date} • {time}</p>
                 
                 <div className={`flex items-end justify-between pt-4 border-t transition-colors ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                    <span className={`font-semibold uppercase tracking-wider text-xs transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Amount</span>
                    <span className={`text-2xl font-bold tracking-tight transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rs. {price || '0'}</span>
                 </div>
              </div>

              <div className="min-h-[260px] flex flex-col items-center justify-center transition-all duration-300">
                 
                 {step === 'scan' && (
                    <div className="w-full flex flex-col items-center slide-up">
                       <div className={`relative p-2 rounded-2xl mb-6 group border transition-all ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                          <div className={`w-40 h-40 border-2 rounded-xl flex items-center justify-center transition-transform overflow-hidden ${isDark ? 'border-slate-700 shadow-inner' : 'border-slate-100 bg-white'}`}>
                             <img src="/images/qr.png" alt="Merchant QR" className="w-full h-full object-contain" />
                          </div>
                       </div>
                       
                       <div className="w-full mb-6">
                         <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 text-center transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Transaction ID</label>
                         <input 
                           type="text"
                           value={transactionId}
                           onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                           placeholder="Enter: DEMO12345K"
                           className={`w-full border rounded-xl px-4 py-3 text-center font-bold outline-none transition-all uppercase tracking-widest text-sm
                             ${isDark ? 'bg-slate-900 border-slate-700 text-emerald-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder-slate-600' : 'bg-slate-50 border-slate-200 text-emerald-600 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm placeholder-slate-400'}`}
                         />
                       </div>
                       
                       {error && <p className={`text-xs font-medium mb-6 w-full text-center px-4 py-3 rounded-xl border transition-all ${isDark ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-600 bg-red-50 border-red-100'}`}>{error}</p>}
                       
                       <button 
                         onClick={handleSimulateScan} 
                         disabled={transactionId.length === 0}
                         className={`w-full py-3.5 rounded-xl font-bold uppercase tracking-wider text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm
                           ${transactionId.length === 0 ? (isDark ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200') : 'bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer hover:shadow'}`}
                       >
                          <ShieldCheck className="w-4 h-4" /> {transactionId.length === 0 ? 'Waiting for ID' : 'Confirm Payment'}
                       </button>
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
              <span>Verified by UniBook SecurePay™</span>
           </div>

        </div>
      </main>
    </div>
  );
};

export default Payment;
