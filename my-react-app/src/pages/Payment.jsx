import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { createBooking } from "../services/bookingService";
import { useUserTheme } from "../context/UserThemeContext";
import { Lock, ShieldCheck, CreditCard, Info, Calendar, Clock, CheckCircle2 } from "lucide-react";
import api from "../services/api";

// Khalti Logo — bold white K
const KhaltiLogo = ({ isDark }) => (
  <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '2rem', fontWeight: 900, color: 'white', lineHeight: 1, letterSpacing: '-1px' }}>K</span>
);

// eSewa SVG Logo
const EsewaLogo = () => (
  <svg viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
    <text x="4" y="44" fontFamily="Arial Black, sans-serif" fontSize="38" fontWeight="900" fill="white">e</text>
  </svg>
);

const Payment = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("esewa");

  const { date, time, price, providerName } = location.state || {};

  useEffect(() => {
    if (!date || !time) navigate('/services');
    document.title = "Secure Checkout | UniBook";
  }, [date, time, navigate]);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);
    try {
      const booking = await createBooking({
        provider_id: providerId,
        booking_date: date,
        booking_time: time,
        status: 'pending',
        notes: `${paymentMethod.toUpperCase()} Transaction Initiation`
      });

      if (paymentMethod === 'esewa') {
        const response = await api.post('/payment/initiate', {
          amount: price,
          booking_id: booking.id,
          booking_ids: booking.ids
        });
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
      } else {
        const response = await api.post('/payment/khalti/initiate', {
          amount: price,
          booking_id: booking.id
        });
        window.location.href = response.data.payment_url;
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to initiate payment.");
      setLoading(false);
    }
  };

  // Format time to 12-hour AM/PM
  const formatTime = (t) => {
    if (!t) return '';
    const [hours, minutes] = t.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const h12 = hours % 12 || 12;
    return `${h12}:${String(minutes).padStart(2, '0')} ${period}`;
  };
  const timeDisplay = Array.isArray(time)
    ? time.sort().map(formatTime).join(', ')
    : formatTime(time);

  return (
    <div className={`flex flex-col min-h-screen font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      <UserNavbar />

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .method-card { transition: all 0.2s ease; }
        .method-card:hover { transform: translateY(-2px); }
      `}</style>

      {/* Full screen layout below navbar */}
      <main className="flex-1 flex items-center justify-center px-4 pt-16 pb-4">
        <div className="w-full max-w-4xl fade-in">

          {/* TWO COLUMN GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">

            {/* ── LEFT PANEL: Order Summary ── */}
            <div className={`glass-card rounded-2xl border p-7 flex flex-col justify-between ${isDark ? 'border-white/10' : 'border-slate-200 shadow-xl shadow-slate-200/50'}`}
                 style={{ 
                   background: isDark ? 'rgba(10,14,25,0.85)' : '#ffffff', 
                   backdropFilter: isDark ? 'blur(20px)' : 'none' 
                 }}>

              {/* Header */}
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isDark ? 'bg-emerald-500/15 border-emerald-500/25 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-600'}`}>
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className={`font-bold text-xl leading-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Secure Checkout</h1>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>UniBook Payment Portal</p>
                  </div>
                </div>

                {/* Provider Name */}
                <div className="mb-5">
                  <p className={`text-[10px] uppercase tracking-widest font-semibold mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Service Provider</p>
                  <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{providerName || 'Service Provider'}</h2>
                </div>

                {/* Date & Time chips */}
                <div className="flex flex-col gap-2 mb-6">
                  <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <Calendar className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{date}</span>
                  </div>
                  <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <Clock className={`w-4 h-4 shrink-0 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <span className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{timeDisplay}</span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className={`rounded-xl border px-5 py-4 flex items-center justify-between ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                  <span className={`text-xs font-semibold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-emerald-700'}`}>Total Amount</span>
                  <span className={`text-3xl font-black tracking-tight ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Rs. {price || '0'}</span>
                </div>
              </div>

              {/* Policy */}
              <div className={`mt-5 flex items-start gap-2.5 border rounded-xl px-4 py-3 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-100'}`}>
                <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <p className={`text-[11px] leading-relaxed ${isDark ? 'text-amber-300/80' : 'text-amber-800'}`}>
                  <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Non-Refundable:</span> Once payment is made, bookings cannot be cancelled. Rescheduling is allowed via admin support.
                </p>
              </div>
            </div>

            {/* ── RIGHT PANEL: Payment Method ── */}
            <div className={`glass-card rounded-2xl border p-7 flex flex-col justify-between ${isDark ? 'border-white/10' : 'border-slate-200 shadow-xl shadow-slate-200/50'}`}
                 style={{ 
                   background: isDark ? 'rgba(10,14,25,0.85)' : '#ffffff', 
                   backdropFilter: isDark ? 'blur(20px)' : 'none' 
                 }}>

              <div>
                <p className={`text-[10px] uppercase tracking-widest font-semibold mb-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Select Payment Method</p>

                {/* eSewa Card */}
                <div
                  onClick={() => setPaymentMethod('esewa')}
                  className={`method-card relative mb-3 rounded-2xl border-2 p-4 cursor-pointer flex items-center gap-4
                    ${paymentMethod === 'esewa'
                      ? (isDark ? 'border-[#60bb46] bg-[#60bb46]/10 shadow-[0_0_0_3px_rgba(96,187,70,0.15)]' : 'border-[#60bb46] bg-[#60bb46]/5 shadow-lg shadow-emerald-100/50')
                      : (isDark ? 'border-white/10 bg-white/5 hover:border-white/20' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200')}`}
                >
                  {/* eSewa Logo Box */}
                  <div className="w-14 h-14 rounded-xl bg-[#60bb46] flex items-center justify-center shrink-0 shadow-lg">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/f/ff/Esewa_logo.webp"
                      alt="eSewa"
                      className="w-11 h-11 object-contain"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <EsewaLogo />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>eSewa</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Nepal's #1 Digital Wallet</p>
                  </div>
                  {/* Selected indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${paymentMethod === 'esewa' ? 'border-[#60bb46] bg-[#60bb46]' : 'border-slate-300'}`}>
                    {paymentMethod === 'esewa' && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>

                {/* Khalti Card */}
                <div
                  onClick={() => setPaymentMethod('khalti')}
                  className={`method-card relative rounded-2xl border-2 p-4 cursor-pointer flex items-center gap-4
                    ${paymentMethod === 'khalti'
                      ? (isDark ? 'border-[#5C2D91] bg-[#5C2D91]/10 shadow-[0_0_0_3px_rgba(92,45,145,0.2)]' : 'border-[#5C2D91] bg-[#5C2D91]/5 shadow-lg shadow-purple-100/50')
                      : (isDark ? 'border-white/10 bg-white/5 hover:border-white/20' : 'border-slate-100 bg-slate-50/50 hover:border-slate-200')}`}
                >
                  {/* Khalti Logo Box — actual brand colours */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 shadow-lg overflow-hidden"
                       style={{ background: 'linear-gradient(135deg, #5C2D91 0%, #7B3FC4 100%)' }}>
                    <KhaltiLogo isDark={isDark} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-slate-900'}`}>Khalti</p>
                    <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Fast & Secure Digital Payments</p>
                  </div>
                  {/* Selected indicator */}
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                    ${paymentMethod === 'khalti' ? 'border-[#5C2D91] bg-[#5C2D91]' : 'border-slate-300'}`}>
                    {paymentMethod === 'khalti' && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className={`mt-4 text-xs rounded-xl px-4 py-3 text-center border ${isDark ? 'text-red-400 bg-red-500/10 border-red-500/20' : 'text-red-600 bg-red-50 border-red-100'}`}>
                  {error}
                </p>
              )}

              {/* CTA Button */}
              <div className="mt-5">
                <button
                  onClick={handlePayment}
                  disabled={loading}
                  style={!loading && paymentMethod === 'khalti'
                    ? { background: 'linear-gradient(135deg, #5C2D91, #7B3FC4)', borderColor: '#4a2270' }
                    : !loading && paymentMethod === 'esewa'
                    ? { background: 'linear-gradient(135deg, #52a43b, #60bb46)', borderColor: '#3d8a2b' }
                    : {}}
                  className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-3 border-b-4 shadow-lg text-white
                    ${loading ? (isDark ? 'bg-slate-700 border-slate-900' : 'bg-slate-300 border-slate-400') + ' cursor-not-allowed opacity-60' : 'hover:opacity-90 hover:translate-y-[1px] active:translate-y-[3px] hover:border-b-2'}`}
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <CreditCard className="w-5 h-5" />
                  }
                  {loading ? 'Redirecting...' : `Pay with ${paymentMethod === 'esewa' ? 'eSewa' : 'Khalti'}`}
                </button>

                {/* Trust badges */}
                <div className="mt-4 flex items-center justify-center gap-4">
                  <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>256-bit SSL Encrypted</span>
                  </div>
                  <div className={`w-px h-3 ${isDark ? 'bg-slate-700' : 'bg-slate-200'}`} />
                  <div className={`flex items-center gap-1.5 text-[10px] font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PCI DSS Compliant</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Payment;
