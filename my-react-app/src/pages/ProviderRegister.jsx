import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  Utensils, Trophy, Stethoscope, Scissors, 
  ArrowRight, ArrowLeft, Building2, Mail, Lock, 
  FileText, MapPin, Clock, DollarSign, Users, Upload, CheckCircle
} from 'lucide-react';

const CATEGORIES = [
  { value: 'Restaurants',  label: 'Restaurant',  icon: Utensils,     color: 'from-orange-500 to-amber-400',   bg: 'bg-orange-50',   border: 'border-orange-200', text: 'text-orange-600', desc: 'Cafes, restaurants, dining' },
  { value: 'Futsal',       label: 'Futsal',       icon: Trophy,       color: 'from-emerald-500 to-teal-400',   bg: 'bg-emerald-50',  border: 'border-emerald-200', text: 'text-emerald-600', desc: 'Sports arenas, courts' },
  { value: 'Hospitals',    label: 'Hospital',     icon: Stethoscope,  color: 'from-blue-500 to-sky-400',       bg: 'bg-blue-50',     border: 'border-blue-200', text: 'text-blue-600', desc: 'Clinics, hospitals, health centers' },
  { value: 'Salon / Spa',  label: 'Salon & Spa',  icon: Scissors,     color: 'from-purple-500 to-fuchsia-400', bg: 'bg-purple-50',   border: 'border-purple-200', text: 'text-purple-600', desc: 'Salons, spas, wellness centers' },
];

const STEPS = ['Choose Type', 'Business Details', 'Account Setup'];

const ProviderRegister = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0, 1, 2 = business forms; 'otp' = verification; 'success' = done
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    service_type: '',
    name: '', address: '', description: '',
    base_price: '', opening_time: '09:00', closing_time: '18:00', capacity: 1,
    email: '', password: '', confirmPassword: '', pan_number: '',
    document: null, image: null,
  });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const nextStep = () => {
    setError('');
    if (step === 0 && !form.service_type) { setError('Please select a service type.'); return; }
    if (step === 1) {
      if (!form.name) { setError('Business name is required.'); return; }
      if (!form.address) { setError('Address is required.'); return; }
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.password || form.password !== form.confirmPassword) { setError('Passwords must match.'); return; }
    if (!form.pan_number) { setError('PAN number is required.'); return; }

    try {
      setLoading(true);
      const data = new FormData();
      Object.entries(form).forEach(([key, val]) => {
        if (val !== null && val !== undefined && key !== 'confirmPassword') {
          data.append(key, val);
        }
      });

      await api.post('/provider/apply', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6) return setError('Please enter the 6-digit code.');
    
    try {
      setLoading(true);
      await api.post('/provider/apply/verify', { email: form.email, otp: code });
      navigate('/provider/waiting');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = `w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 text-sm font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400`;
  const labelCls = `block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2`;
  const selected = CATEGORIES.find(c => c.value === form.service_type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50/30 font-inter flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="UniBook" className="w-8 h-8 object-contain" />
          <h1 className="text-xl font-extrabold tracking-tighter text-slate-950">UniBook<span className="text-emerald-600">.</span></h1>
        </div>
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Provider Registration</span>
      </header>

      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <div className="w-full max-w-2xl">

          {/* Step Indicator */}
          <div className="flex items-center gap-0 mb-10">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black border-2 transition-all ${
                    i < step ? 'bg-emerald-600 border-emerald-600 text-white' :
                    i === step ? 'bg-white border-emerald-600 text-emerald-600' :
                    'bg-white border-slate-200 text-slate-400'
                  }`}>
                    {i < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
                  </div>
                  <span className={`text-[10px] font-bold mt-2 uppercase tracking-wider ${i === step ? 'text-emerald-600' : 'text-slate-400'}`}>{s}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${i < step ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">

            {/* ── STEP 0: Choose service type ── */}
            {step === 0 && (
              <div className="p-8 md:p-10">
                <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2">What service do you offer?</h2>
                <p className="text-slate-500 mb-8 text-base font-medium">Select the category that best describes your business.</p>
                <div className="grid grid-cols-2 gap-4">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const isSelected = form.service_type === cat.value;
                    return (
                      <button key={cat.value} type="button" onClick={() => set('service_type', cat.value)}
                        className={`relative p-6 rounded-2xl border-2 text-left transition-all cursor-pointer group hover:shadow-md ${
                          isSelected ? `${cat.border} ${cat.bg} shadow-md` : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-4 shadow-md`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mb-1">{cat.label}</h3>
                        <p className="text-xs text-slate-500 font-medium">{cat.desc}</p>
                        {isSelected && <CheckCircle className={`absolute top-3 right-3 w-5 h-5 ${cat.text}`} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── STEP 1: Business Details ── */}
            {step === 1 && (
              <div className="p-8 md:p-10">
                {selected && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${selected.bg} ${selected.text} text-xs font-bold mb-6 border ${selected.border}`}>
                    <selected.icon className="w-3.5 h-3.5" /> {selected.label}
                  </div>
                )}
                <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2">Business Details</h2>
                <p className="text-slate-500 mb-8 text-base font-medium">Tell us about your service.</p>
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}><Building2 className="inline w-3 h-3 mr-1" />Business Name *</label>
                    <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Green Valley Restaurant" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><MapPin className="inline w-3 h-3 mr-1" />Address *</label>
                    <input value={form.address} onChange={e => set('address', e.target.value)} placeholder="e.g. 123 Main Street, Kathmandu" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><FileText className="inline w-3 h-3 mr-1" />Description</label>
                    <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Brief description of your service..." rows={3} className={`${inputCls} resize-none`} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}><DollarSign className="inline w-3 h-3 mr-1" />Base Price (Rs.)</label>
                      <input type="number" value={form.base_price} onChange={e => set('base_price', e.target.value)} placeholder="500" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}><Users className="inline w-3 h-3 mr-1" />Capacity (per slot)</label>
                      <input type="number" value={form.capacity} onChange={e => set('capacity', e.target.value)} min="1" className={inputCls} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}><Clock className="inline w-3 h-3 mr-1" />Opening Time</label>
                      <input type="time" value={form.opening_time} onChange={e => set('opening_time', e.target.value)} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}><Clock className="inline w-3 h-3 mr-1" />Closing Time</label>
                      <input type="time" value={form.closing_time} onChange={e => set('closing_time', e.target.value)} className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}><Upload className="inline w-3 h-3 mr-1" />Business Image (optional)</label>
                    <input type="file" accept="image/*" onChange={e => set('image', e.target.files[0])}
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer" />
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP 2: Account Setup ── */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="p-8 md:p-10">
                <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight mb-2">Account & Verification</h2>
                <p className="text-slate-500 mb-8 text-base font-medium">Set up your login credentials and submit your documents.</p>
                <div className="space-y-5">
                  <div>
                    <label className={labelCls}><Mail className="inline w-3 h-3 mr-1" />Email Address *</label>
                    <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="business@example.com" className={inputCls} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}><Lock className="inline w-3 h-3 mr-1" />Password *</label>
                      <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}><Lock className="inline w-3 h-3 mr-1" />Confirm Password *</label>
                      <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} placeholder="••••••••" className={inputCls} />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}><FileText className="inline w-3 h-3 mr-1" />PAN Number *</label>
                    <input value={form.pan_number} onChange={e => set('pan_number', e.target.value)} placeholder="e.g. 123456789" className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}><Upload className="inline w-3 h-3 mr-1" />Verification Document (PAN Card / Registration Certificate)</label>
                    <input type="file" accept="image/*,.pdf" onChange={e => set('document', e.target.files[0])}
                      className="w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer" />
                    <p className="text-xs text-slate-400 mt-1.5">Accepts JPG, PNG, or PDF. Max 10MB.</p>
                  </div>
                </div>

                {error && <p className="mt-5 text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl font-medium">{error}</p>}

                <div className="flex gap-3 mt-8">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button type="submit" disabled={loading}
                    className={`flex-1 py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {loading ? 'Sending Code...' : 'Submit Application'} {!loading && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}

            {/* OTP Verification Step */}
            {step === 'otp' && (
              <div className="p-8 md:p-10 text-center">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
                <h2 className="text-3xl font-extrabold text-slate-950 mb-2">Verify Your Email</h2>
                <p className="text-slate-500 mb-8 font-medium">We've sent a 6-digit code to <span className="text-emerald-600 font-bold">{form.email}</span></p>
                
                <form onSubmit={handleVerifyOtp} className="space-y-6">
                  <div className="flex justify-center gap-2 mb-6">
                    {otp.map((digit, i) => (
                      <input key={i} type="text" maxLength={1} value={digit}
                        onChange={e => {
                          const newOtp = [...otp];
                          newOtp[i] = e.target.value.slice(-1);
                          setOtp(newOtp);
                          if (e.target.value && e.target.nextSibling) e.target.nextSibling.focus();
                        }}
                        className="w-10 h-12 text-center text-lg font-bold border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none" />
                    ))}
                  </div>
                  {error && <p className="text-sm text-red-600 mb-4 bg-red-50 p-3 rounded-xl border border-red-100">{error}</p>}
                  <button type="submit" disabled={loading} className="w-full py-3.5 rounded-xl bg-slate-950 text-white font-bold hover:bg-emerald-600 transition-all shadow-xl shadow-slate-950/20">
                    {loading ? 'Verifying...' : 'Verify & Submit'}
                  </button>
                  <button type="button" onClick={() => setStep(2)} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">Start over</button>
                </form>
              </div>
            )}

            {/* Navigation for steps 0 and 1 */}
            {step < 2 && (
              <div className="px-8 md:px-10 pb-8 flex items-center justify-between">
                {step > 0 ? (
                  <button type="button" onClick={() => setStep(s => s - 1)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                ) : <div />}
                {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
                <button type="button" onClick={nextStep}
                  className="px-8 py-3 rounded-xl bg-slate-950 text-white font-bold text-sm hover:bg-emerald-600 transition-all flex items-center gap-2 shadow-lg shadow-slate-950/10 cursor-pointer">
                  Continue <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <p className="text-center text-sm text-slate-500 mt-6 font-medium">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-emerald-600 font-bold hover:underline cursor-pointer">Sign In</button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProviderRegister;
