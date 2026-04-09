import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, ArrowRight, Phone, Calendar as CalendarIcon, Users as UsersIcon, ShieldCheck, RotateCcw, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Register = () => {
  const [step, setStep] = useState('form'); // 'form' | 'otp' | 'success'
  const [form, setForm] = useState({ name:'', email:'', password:'', confirm:'', age:'', gender:'', phone:'' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Join UniBook | Create Your Account";
  }, []);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      return setError('Name, Email, and Password are compulsory fields.');
    }
    const ageNum = parseInt(form.age);
    if (isNaN(ageNum) || ageNum < 18) return setError('You must be at least 18 years old to register.');
    if (form.password !== form.confirm) return setError('Passwords do not match.');

    try {
      setLoading(true);
      await api.post('/auth/send-otp', {
        name: form.name, email: form.email, password: form.password,
        age: ageNum, gender: form.gender, phone: form.phone
      });
      setStep('otp');
      setResendCooldown(60);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) return setError('Please enter the complete 6-digit code.');

    try {
      setLoading(true);
      await api.post('/auth/verify-otp', { email: form.email, otp: code });
      setStep('success');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      setLoading(true);
      await api.post('/auth/send-otp', { name: form.name, email: form.email, password: form.password, age: parseInt(form.age), gender: form.gender, phone: form.phone });
      setResendCooldown(60);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ─── Left pane (shared) ───────────────────────────────────────────────
  const LeftPane = () => (
    <div className="hidden md:flex md:w-1/2 lg:w-[40%] relative overflow-hidden bg-slate-900 border-r border-white/5">
      <img src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop" alt="Time Efficiency" className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      <div className="relative z-10 p-12 flex flex-col justify-end h-full">
        <div className="flex items-center gap-3 mb-8">
          <img src="/logo.png" alt="UniBook Logo" className="w-10 h-10 object-contain" />
          <h2 className="text-2xl font-black tracking-tighter text-white">UniBook<span className="text-emerald-500">.</span></h2>
        </div>
        <h2 className="text-4xl font-extrabold text-white tracking-tight mb-6 leading-tight">
          The future of <br/><span className="text-emerald-500">automated</span> <br/>scheduling.
        </h2>
        <p className="text-slate-400 text-sm font-medium max-w-xs leading-relaxed">Join the platform designed for professionals. Optimize your appointments and focus on what truly matters.</p>
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Trusted features</p>
          <div className="space-y-3">
            {['Real-time Availability', 'Instant Verification', 'Secure Management'].map(f => (
              <div key={f} className="flex items-center gap-2 text-white text-xs font-bold">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // ─── OTP Step ─────────────────────────────────────────────────────────
  if (step === 'otp') return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] font-inter">
      <LeftPane />
      <div className="w-full md:w-1/2 lg:w-[60%] flex items-center justify-center p-8 md:p-16 bg-[#020617] relative overflow-y-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-emerald-600/5 blur-[120px] -z-0" />
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-8 h-8 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Check your email</h1>
            <p className="text-slate-400 text-sm font-medium">We sent a 6-digit code to</p>
            <p className="text-emerald-400 font-bold text-sm mt-1">{form.email}</p>
          </div>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] text-center mb-4">Enter Verification Code</label>
              <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => otpRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all text-white"
                  />
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm text-center font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group w-full py-4 rounded-2xl bg-emerald-600 font-black text-[11px] text-white hover:bg-emerald-500 transition-all uppercase tracking-[0.3em] flex items-center justify-center gap-2
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-0.5'}`}
            >
              {loading ? 'Verifying...' : (<><ShieldCheck className="w-4 h-4" /> Verify & Create Account</>)}
            </button>

            <div className="text-center">
              <p className="text-slate-500 text-xs mb-2">Didn't receive the code?</p>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || loading}
                className={`flex items-center gap-1.5 mx-auto text-sm font-bold transition-colors ${resendCooldown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-emerald-400 hover:text-emerald-300 cursor-pointer'}`}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>

            <div className="text-center">
              <button type="button" onClick={() => { setStep('form'); setError(''); setOtp(['','','','','','']); }} className="text-slate-500 text-xs hover:text-slate-300 transition-colors cursor-pointer">
                ← Back to registration
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // ─── Success Step ─────────────────────────────────────────────────────
  if (step === 'success') return (
    <div className="min-h-screen flex items-center justify-center font-inter user-panel-bg">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]" />
      <div className="relative z-10 text-center animate-in fade-in zoom-in duration-700">
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/20">
          <CheckCircle className="w-12 h-12 text-emerald-400" />
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">Account Verified!</h1>
        <p className="text-slate-300 font-medium text-lg max-w-sm mx-auto leading-relaxed">
          Welcome to the UniBook ecosystem. <br/>
          Preparing your personalized dashboard...
        </p>
        <div className="mt-10 flex flex-col items-center gap-2">
           <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
           </div>
           <p className="text-[10px] font-black text-emerald-500/50 uppercase tracking-[0.3em]">Transitioning to login</p>
        </div>
      </div>
    </div>
  );

  // ─── Registration Form Step ───────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] font-inter">
      <LeftPane />

      <div className="w-full md:w-1/2 lg:w-[60%] flex items-center justify-center p-8 md:p-16 bg-[#020617] relative overflow-y-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-lg bg-emerald-600/5 blur-[120px] -z-0" />
        
        <div className="w-full max-w-xl relative z-10 py-12">
          <div className="mb-12 md:hidden">
            <div className="flex items-center gap-2.5 mb-2">
              <img src="/logo.png" alt="UniBook Logo" className="w-8 h-8 object-contain" />
              <h2 className="text-lg font-black tracking-tighter text-white">UniBook<span className="text-emerald-600">.</span></h2>
            </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-slate-400 font-medium text-sm">Join the premium multi-service booking ecosystem</p>
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Full Name *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><User className="w-4 h-4" /></div>
                  <input type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Email Address *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><Mail className="w-4 h-4" /></div>
                  <input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Age (18+) *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><CalendarIcon className="w-4 h-4" /></div>
                  <input type="number" placeholder="25" value={form.age} onChange={e => setForm({...form, age: e.target.value})} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Gender</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><UsersIcon className="w-4 h-4" /></div>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[#020617] border border-white/10 focus:border-emerald-500 focus:outline-none transition-all text-white font-medium text-sm appearance-none">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Phone No</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><Phone className="w-4 h-4" /></div>
                  <input type="tel" placeholder="98XXXXXXXX" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Password *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><Lock className="w-4 h-4" /></div>
                  <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Confirm *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors"><Lock className="w-4 h-4" /></div>
                  <input type="password" placeholder="••••••••" value={form.confirm} onChange={e => setForm({...form, confirm: e.target.value})} className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`group w-full py-5 rounded-2xl bg-emerald-600 font-black text-[11px] text-white hover:bg-emerald-500 transition-all uppercase tracking-[0.3em] mt-6 flex items-center justify-center gap-2
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-0.5'}`}
            >
              {loading ? 'Sending Code...' : (<>Send Verification Code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>)}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-loose">
              Already using UniBook? <br/>
              <Link to="/login" className="text-emerald-400 font-black hover:text-emerald-300 transition-colors">Sign In to Dashboard</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
