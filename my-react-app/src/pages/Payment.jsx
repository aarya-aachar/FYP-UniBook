/**
 * The Transaction Hub (Secure Checkout)
 * 
 * relative path: /src/pages/Payment.jsx
 * 
 * This component is the bridge between a user's intent to book 
 * and the final financial commitment. It handles the integration 
 * with the eSewa payment gateway.
 * 
 * Key Logic:
 * 1. Pre-Booking: Before going to eSewa, we save the booking in a 
 *    'pending' state to ensure the data persists if the user's internet drops.
 * 2. Signature Handshake: Requests the backend to generate a secure 
 *    eSewa payload (including a HMAC signature).
 * 3. Secure Redirection: Dynamically creates and submits a POST form 
 *    to eSewa's portal to ensure a seamless, secure transition.
 */

import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { createBooking } from "../services/bookingService";
import { useUserTheme } from "../context/UserThemeContext";
import { Lock, CreditCard, Info, ShieldCheck, CheckCircle2 } from "lucide-react";
import api from "../services/api";

const Payment = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Destructure the passed state from the Booking page
  const { date, time, price, providerName } = location.state || {};

  useEffect(() => {
    if (!date || !time) navigate('/services');
    document.title = "Secure Checkout | UniBook";
  }, [date, time, navigate]);

  /**
   * handlePayment
   * The master orchestrator for the eSewa workflow.
   */
  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      /**
       * Step 1: Create the Local Record
       * We mark it as 'pending' so it doesn't show up as 'Confirmed' until 
       * we receive the success callback from eSewa.
       */
      const booking = await createBooking({
        provider_id: providerId,
        booking_date: date,
        booking_time: time,
        status: 'pending',
        notes: "ESEWA Transaction Initiation"
      });

      /**
       * Step 2: Get Secure Parameters
       * The backend generates the signature and transaction IDs required by eSewa.
       */
      const response = await api.post('/payment/initiate', {
        amount: price,
        booking_id: booking.id,
        booking_ids: booking.ids
      });

      /**
       * Step 3: Secure Redirection (Form Injection)
       * We create a hidden HTML form in memory and submit it immediately. 
       * This is the standard, secure way to transition to eSewa's gateway.
       */
      const params = response.data;
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
      setError(err.response?.data?.message || err.message || "Failed to initiate payment.");
      setLoading(false);
    }
  };

  const formatToAMPM = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  const timeDisplay = Array.isArray(time)
    ? time.sort().map(formatToAMPM).join(', ')
    : formatToAMPM(time);

  return (
    <div className={`flex flex-col min-h-screen font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      <UserNavbar />

      <style>{`
        .glass-container {
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dark .glass-container {
           background: rgba(15, 23, 42, 0.7);
           border-color: rgba(255, 255, 255, 0.1);
        }
        .light .glass-container {
           background: rgba(255, 255, 255, 0.95);
           border-color: rgba(0, 0, 0, 0.05);
           box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .details-box {
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .dark .details-box {
          background: rgba(10, 14, 25, 0.6);
        }
        .light .details-box {
          background: #f8fafc;
          border-color: #e2e8f0;
        }

        .policy-box {
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.15);
        }
        .light .policy-box {
          background: #fffbeb;
          border-color: #fef3c7;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Main Content: Centered Card */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 pt-24 pb-12">
        <div className="w-full max-w-[500px] animate-fade-in text-center">
          
          {/* Header Section */}
          <div className="flex flex-col items-center mb-8">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border ${isDark ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-emerald-100 border-emerald-200'}`}>
              <Lock className={`w-8 h-8 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
            </div>
            <h1 className={`text-3xl font-black mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>Secure Checkout</h1>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Pay with eSewa (Sandbox)</p>
          </div>

          {/* Main Payment Card */}
          <div className="glass-container rounded-[32px] p-8 overflow-hidden relative shadow-2xl">
            
            {/* Booking Details Section */}
            <div className="details-box rounded-2xl p-6 text-left mb-6">
              <p className={`text-[10px] font-bold tracking-[0.15em] mb-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>BOOKING DETAILS</p>
              
              <div className="mb-5">
                <h2 className={`text-lg font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{providerName || 'KMC hospital'}</h2>
                <div className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span className="font-semibold">{date}</span>
                  <span className="opacity-40">•</span>
                  <span className="font-semibold">{timeDisplay}</span>
                </div>
              </div>

              <div className={`h-px w-full mb-5 ${isDark ? 'bg-white/5' : 'bg-slate-200'}`} />

              <div className="flex items-center justify-between">
                <p className={`text-xs font-bold tracking-wider ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>TOTAL AMOUNT</p>
                <div className="text-right">
                   <p className={`text-2xl font-black ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rs. {parseFloat(price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            {/* Payment Method Representative Logo - PLAIN BOX as requested */}
            <div className="flex justify-center mb-8">
              <div className="w-32 h-32 bg-[#60bb46] rounded-[24px] flex items-center justify-center">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp" 
                  alt="eSewa" 
                  className="w-20 h-20 object-contain"
                />
              </div>
            </div>

            {/* Refund Policy Disclosure: Vital for Legal Compliance */}
            <div className="policy-box rounded-2xl p-5 text-left mb-8 flex gap-4">
              <Info className={`w-6 h-6 shrink-0 mt-0.5 ${isDark ? 'text-amber-500' : 'text-amber-600'}`} />
              <div>
                <h3 className={`font-bold text-sm mb-1.5 ${isDark ? 'text-amber-500' : 'text-amber-700'}`}>Non-Refundable Policy</h3>
                <p className={`text-[11.5px] leading-[1.6] ${isDark ? 'text-amber-200/80' : 'text-amber-900/80'}`}>
                   There is a strict no-refund policy once payment is finalized. However, appointments can be shifted. 
                   Contact UniBook support for rescheduling requests.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`mb-6 p-4 rounded-xl border text-xs font-medium ${isDark ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-red-50 border-red-100 text-red-700'}`}>
                {error}
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full py-5 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all active:scale-[0.98]
                ${loading 
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed' 
                  : 'bg-[#60bb46] hover:bg-[#52a43b] text-white'
                }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              {loading ? 'PROCESSING...' : 'PROCEED TO ESEWA'}
            </button>

            <p className={`mt-5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              You will be redirected to eSewa's secure payment portal
            </p>
          </div>

          {/* Verification Badges */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              <ShieldCheck className="w-4 h-4" />
              256-bit secure
            </div>
            <div className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
            <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4" />
              PCI DSS Standard
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
