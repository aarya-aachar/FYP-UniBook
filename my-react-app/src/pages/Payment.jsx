import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { createBooking } from "../services/bookingService";
import { useUserTheme } from "../context/UserThemeContext";

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
    navigate('/dashboard/user/appointments');
  };

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden transition-all duration-500">
        <div className={`absolute top-0 right-[-10%] w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-400/5'}`} />
        <div className={`absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] blur-[150px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulseScale { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); } 70% { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
          @keyframes dash { 0% { stroke-dashoffset: 1000; } 100% { stroke-dashoffset: 0; } }
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .pulse-btn { animation: pulseScale 2s infinite; }
          .path-success { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: dash 1.5s ease-in-out forwards; }
        `}</style>

        <div className="max-w-[450px] w-full slide-up">
           
           <div className="text-center mb-10">
              <div className={`w-16 h-16 rounded-3xl border flex items-center justify-center text-3xl mx-auto mb-6 shadow-2xl transition-all
                ${isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-inner shadow-emerald-200/20'}`}>
                 🔒
              </div>
              <h1 className={`text-4xl font-black tracking-tight mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Complete Booking</h1>
              <p className={`text-lg transition-colors font-medium ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Secure Payment via QR Scan</p>
           </div>

           <div className={`rounded-[3rem] border p-10 shadow-3xl backdrop-blur-3xl relative transition-all duration-500
             ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-slate-200/40'}`}>
              
              <div className={`rounded-3xl p-6 mb-8 border transition-all ${isDark ? 'bg-[#0f172a] border-white/5' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                 <p className={`text-xs font-black uppercase tracking-[0.2em] mb-4 transition-colors ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Booking Details</p>
                 <h3 className={`font-black text-2xl mb-1 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>{providerName || `Service Provider`}</h3>
                 <p className={`text-sm mb-6 transition-colors ${isDark ? 'text-white/60' : 'text-slate-500 font-bold'}`}>{date} • {time}</p>
                 
                 <div className={`flex items-end justify-between pt-6 border-t transition-colors ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                    <span className={`font-black uppercase tracking-widest text-xs transition-colors ${isDark ? 'text-white/40' : 'text-slate-400'}`}>Total Amount</span>
                    <span className={`text-3xl font-black tracking-tighter transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rs. {price || '0'}</span>
                 </div>
              </div>

              <div className="min-h-[280px] flex flex-col items-center justify-center transition-all duration-500">
                 
                 {step === 'scan' && (
                    <div className="w-full flex flex-col items-center slide-up">
                       <div className={`relative p-3 rounded-[2.5rem] mb-8 group border transition-all ${isDark ? 'bg-white border-white/10' : 'bg-white border-slate-100 shadow-2xl'}`}>
                          <div className={`w-48 h-48 border-4 rounded-3xl flex items-center justify-center group-hover:scale-95 transition-transform overflow-hidden ${isDark ? 'border-slate-900 shadow-inner' : 'border-slate-50 bg-white'}`}>
                             <img src="/images/qr.png" alt="Merchant QR" className="w-full h-full object-contain" />
                          </div>
                       </div>
                       
                       <div className="w-full mb-8">
                         <label className={`block text-xs font-black uppercase tracking-widest mb-3 text-center transition-colors ${isDark ? 'text-white/50' : 'text-slate-500'}`}>Transaction ID</label>
                         <input 
                           type="text"
                           value={transactionId}
                           onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                           placeholder="Enter: DEMO12345K"
                           className={`w-full border rounded-2xl px-6 py-4 text-center font-black placeholder-white/20 focus:outline-none transition-all uppercase tracking-widest text-lg
                             ${isDark ? 'bg-white/5 border-white/10 text-emerald-400 focus:border-emerald-500 focus:bg-white/10' : 'bg-slate-50 border-slate-200 text-emerald-600 focus:border-blue-600 focus:bg-white shadow-sm placeholder-slate-400'}`}
                         />
                       </div>
                       
                       {error && <p className={`text-sm font-bold mb-8 w-full text-center px-6 py-3 rounded-2xl border transition-all ${isDark ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-600 bg-red-50 border-red-100 shadow-sm'}`}>{error}</p>}
                       
                       <button 
                         onClick={handleSimulateScan} 
                         disabled={transactionId.length === 0}
                         className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 flex items-center justify-center gap-3 mt-2 shadow-2xl
                           ${transactionId.length === 0 ? (isDark ? 'bg-white/5 text-white/20 cursor-not-allowed shadow-none' : 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none') : 'pulse-btn bg-emerald-600 text-white hover:bg-emerald-500 hover:-translate-y-1'}`}
                       >
                          <span className="text-xl">✅</span> {transactionId.length === 0 ? 'Waiting for ID' : 'Confirm Payment'}
                       </button>
                    </div>
                 )}

                 {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center slide-up py-10">
                       <div className="relative w-24 h-24 mb-10">
                          <div className={`absolute inset-0 border-4 rounded-full transition-all ${isDark ? 'border-white/10' : 'border-slate-100'}`} />
                          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin shadow-lg" />
                          <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">🏦</div>
                       </div>
                       <h3 className={`text-2xl font-black mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Verifying...</h3>
                       <p className={`text-sm text-center font-bold transition-colors ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Contacting banking network for authorization</p>
                    </div>
                 )}

                 {step === 'success' && (
                    <div className="flex flex-col items-center justify-center slide-up py-6 w-full">
                       <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center mb-8 shadow-2xl transition-all ${isDark ? 'bg-emerald-500/20 border-emerald-500/50' : 'bg-emerald-50 border-emerald-200 shadow-emerald-100'}`}>
                          <svg className="w-12 h-12 text-emerald-400 path-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                       </div>
                        <h3 className={`text-3xl font-black mb-2 transition-colors ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Confirmed!</h3>
                       <p className={`text-sm text-center mb-10 font-bold leading-relaxed transition-colors ${isDark ? 'text-white/60' : 'text-slate-500'}`}>Your transaction has been verified. Your appointment is now completely secured.</p>
                       
                       <button onClick={handleFinish} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 shadow-2xl
                         ${isDark ? 'bg-white/10 text-white hover:bg-white hover:text-[#0f172a]' : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-500/20'}`}>
                          View Appointments →
                       </button>
                    </div>
                 )}

              </div>

           </div>
           
           <div className={`mt-10 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.3em] transition-colors ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
              <span>Verified by</span>
              <span className={`text-sm transition-colors ${isDark ? 'text-white/40 font-bold' : 'text-slate-600 font-bold'}`}>UniBook SecurePay™</span>
           </div>

        </div>
      </main>
    </div>
  );
};

export default Payment;
