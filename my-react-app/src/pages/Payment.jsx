import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { createBooking } from "../services/bookingService";

const Payment = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState("scan"); // 'scan' | 'processing' | 'success'
  const [transactionId, setTransactionId] = useState("");

  const { date, time, price, providerName } = location.state || {};

  useEffect(() => {
    // If user arrived without selecting date/time, redirect back to home.
    if (!date || !time) {
      navigate('/services');
    }
    document.title = "Secure Checkout | UniBook";
  }, [date, time, navigate]);

  const handleSimulateScan = async () => {
    // In a real-world enterprise app, this would ping a Merchant Webhook verification endpoint.
    // For this demonstration, we are mocking the EXACT response.
    const validDemoId = "DEMO12345K";
    
    if (transactionId !== validDemoId) {
      return setError(`Payment Verification failed. The transaction ID '${transactionId}' could not be found on the banking network. For this demo, please use the simulated ID: ${validDemoId}`);
    }
    
    setStep('processing');
    setError(null);

    // Simulate network delay / bank authorization
    setTimeout(async () => {
      try {
        await createBooking({
          provider_id: providerId,
          booking_date: date,
          booking_time: time,
          status: 'confirmed',
          notes: "Verified QR Payment. Transaction ID: " + transactionId
        });
        setStep('success');
      } catch (err) {
        setError(err.message || "Authorization Failed. Please try again.");
        setStep('scan');
      }
    }, 2500);
  };

  const handleFinish = () => {
    navigate('/dashboard/user/appointments');
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white font-inter">
      <UserSidebar />

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-emerald-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />

        <style>{`
          @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes pulseScale { 0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); } 70% { transform: scale(1.02); box-shadow: 0 0 0 15px rgba(59, 130, 246, 0); } 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); } }
          @keyframes dash { 0% { stroke-dashoffset: 1000; } 100% { stroke-dashoffset: 0; } }
          
          .slide-up { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
          .pulse-btn { animation: pulseScale 2s infinite; }
          .path-success { stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: dash 1.5s ease-in-out forwards; }
        `}</style>

        <div className="max-w-[400px] w-full slide-up">
           
           <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                 🔒
              </div>
              <h1 className="text-4xl font-black tracking-tight mb-2">Secure Checkout</h1>
              <p className="text-white/40 text-sm font-medium">UniBook Encrypted Gateway via QR</p>
           </div>

           <div className="rounded-[2.5rem] bg-white/5 border border-white/10 p-8 shadow-2xl backdrop-blur-2xl relative">
              
              {/* Top Banner Context */}
              <div className="bg-[#0f172a] rounded-2xl p-5 mb-8 border border-white/5">
                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">Invoice Summary</p>
                 <h3 className="font-bold text-lg mb-1">{providerName || `Provider #${providerId}`}</h3>
                 <p className="text-sm text-white/60 mb-4">{date} • {time} (30 min block)</p>
                 
                 <div className="flex items-end justify-between pt-4 border-t border-white/10">
                    <span className="text-white/40 font-bold uppercase tracking-widest text-xs">Total Due</span>
                    <span className="text-3xl font-black tracking-tighter text-emerald-400">Rs. {price || '0'}</span>
                 </div>
              </div>

              {/* State Machine UI */}
              <div className="min-h-[250px] flex flex-col items-center justify-center transition-all duration-500">
                 
                 {/* State 1: Awaiting Scan */}
                 {step === 'scan' && (
                    <div className="w-full flex flex-col items-center slide-up">
                       <div className="relative p-2 bg-white rounded-3xl mb-6 group">
                          {/* Real Provider QR */}
                          <div className="w-48 h-48 border-4 border-slate-900 rounded-2xl flex items-center justify-center group-hover:opacity-80 transition-opacity overflow-hidden">
                             <img src="/images/qr.png" alt="Provider Custom QR" className="w-full h-full object-contain" />
                          </div>
                       </div>
                       
                       <div className="w-full mb-6">
                         <label className="block text-[10px] font-black uppercase tracking-widest text-white/50 mb-2 text-center">Enter Bank / Wallet Reference ID</label>
                         <input 
                           type="text"
                           value={transactionId}
                           onChange={(e) => setTransactionId(e.target.value.toUpperCase())}
                           placeholder="Enter: DEMO12345K"
                           className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-center font-bold text-emerald-400 placeholder-white/20 focus:outline-none focus:border-emerald-500 focus:bg-emerald-500/10 transition-all uppercase tracking-widest"
                         />
                       </div>
                       
                       {error && <p className="text-red-400 text-sm font-medium mb-6 w-full text-center bg-red-500/10 px-4 py-2 rounded-xl border border-red-500/20">{error}</p>}
                       
                       <button 
                         onClick={handleSimulateScan} 
                         disabled={transactionId.length === 0}
                         className={`w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 flex items-center justify-center gap-2 mt-2 
                           ${transactionId.length === 0 ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'pulse-btn bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-500 hover:-translate-y-1'}`}
                       >
                          <span className="text-lg">✅</span> {transactionId.length === 0 ? 'Enter ID to Unblock' : 'Verify & Complete Booking'}
                       </button>
                    </div>
                 )}

                 {/* State 2: Processing Authorization */}
                 {step === 'processing' && (
                    <div className="flex flex-col items-center justify-center slide-up py-10">
                       <div className="relative w-24 h-24 mb-8">
                          <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
                          <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">🏦</div>
                       </div>
                       <h3 className="text-xl font-bold mb-2">Authorizing Payment</h3>
                       <p className="text-white/40 text-sm text-center font-medium">Securely verifying transaction with Bank/Wallet API...</p>
                    </div>
                 )}

                 {/* State 3: Success Confirmation */}
                 {step === 'success' && (
                    <div className="flex flex-col items-center justify-center slide-up py-6 w-full">
                       <div className="w-24 h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                          <svg className="w-12 h-12 text-emerald-400 path-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                       </div>
                       <h3 className="text-2xl font-black text-emerald-400 mb-2">Booking Confirmed!</h3>
                       <p className="text-white/60 text-sm text-center mb-8 font-medium">Your transaction ID has been verified and your booking is completely secured.</p>
                       
                       <button onClick={handleFinish} className="w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-300 bg-white/10 text-white hover:bg-white hover:text-[#0f172a]">
                          View My Appointments →
                       </button>
                    </div>
                 )}

              </div>

           </div>
           
           <div className="mt-8 flex items-center justify-center gap-2 text-white/30 text-[10px] font-black uppercase tracking-[0.2em]">
              <span>Powered by</span>
              <span className="text-white/50 text-xs">UniBook SecurePay™</span>
           </div>

        </div>
      </div>
    </div>
  );
};

export default Payment;
