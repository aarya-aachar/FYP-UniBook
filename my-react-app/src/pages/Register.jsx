import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { User, Mail, Lock, ArrowRight, Phone, Calendar as CalendarIcon, Users as UsersIcon } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirm: '',
    age: '',
    gender: '',
    phone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Join UniBook | Create Your Account";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Compulsory fields check
    if (!form.name.trim() || !form.email.trim() || !form.password || !form.confirm) {
      return alert('Name, Email, and Password are compulsory fields.');
    }

    // Age validation
    const ageNum = parseInt(form.age);
    if (isNaN(ageNum) || ageNum < 18) {
      return alert('You must be at least 18 years old to register.');
    }

    if (form.password !== form.confirm) return alert('Passwords do not match');

    try {
      setLoading(true);
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        age: ageNum,
        gender: form.gender,
        phone: form.phone
      });
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] font-inter">
      {/* Left Pane - Visual Branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-[40%] relative overflow-hidden bg-slate-900 border-r border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop" 
          alt="Time Efficiency" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="relative z-10 p-12 flex flex-col justify-end h-full">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="UniBook Logo" className="w-10 h-10 object-contain" />
            <h2 className="text-2xl font-black tracking-tighter text-white">UniBook<span className="text-emerald-500">.</span></h2>
          </div>
          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-6 leading-tight">
            The future of <br/>
            <span className="text-emerald-500">automated</span> <br/>
            scheduling.
          </h2>
          <p className="text-slate-400 text-sm font-medium max-w-xs leading-relaxed">
            Join the platform designed for professionals. Optimize your appointments and focus on what truly matters.
          </p>
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

      {/* Right Pane - Registration Form */}
      <div className="w-full md:w-1/2 lg:w-[60%] flex items-center justify-center p-8 md:p-16 bg-[#020617] relative overflow-y-auto">
        {/* Background Decor */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Full Name *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <User className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={form.name} 
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Email Address *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    type="email" 
                    placeholder="john@example.com" 
                    value={form.email} 
                    onChange={(e) => setForm({...form, email: e.target.value})}
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Age (18+) *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <CalendarIcon className="w-4 h-4" />
                  </div>
                  <input 
                    type="number" 
                    placeholder="25" 
                    value={form.age} 
                    onChange={(e) => setForm({...form, age: e.target.value})}
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Gender</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <UsersIcon className="w-4 h-4" />
                  </div>
                  <select 
                    value={form.gender} 
                    onChange={(e) => setForm({...form, gender: e.target.value})}
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-[#020617] border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all text-white font-medium text-sm appearance-none"
                  >
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
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    type="tel" 
                    placeholder="98XXXXXXXX" 
                    value={form.phone} 
                    onChange={(e) => setForm({...form, phone: e.target.value})}
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Password *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Confirm *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={form.confirm} 
                    onChange={(e) => setForm({...form, confirm: e.target.value})}
                    className="w-full pl-12 pr-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`group w-full py-5 rounded-2xl bg-emerald-600 font-black text-[11px] text-white hover:bg-emerald-500 transition-all uppercase tracking-[0.3em] mt-6 flex items-center justify-center gap-2
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-0.5'}`}
            >
              {loading ? 'Creating Account...' : (
                <>
                  Begin Your Journey
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
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
