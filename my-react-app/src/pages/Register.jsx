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
    <div className="min-h-screen flex items-center justify-center py-12 px-6 bg-[#020617] relative overflow-y-auto font-inter">
      {/* Background Decor */}
      <div className="absolute top-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-600/10 blur-[130px] transition-all duration-1000" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-teal-600/10 blur-[130px] transition-all duration-1000" />

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="w-full max-w-xl relative z-10 slide-up my-auto">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6 transform hover:-rotate-3 transition-transform">
             <img src="/logo.png" alt="UniBook Logo" className="w-16 h-16 object-contain shadow-2xl shadow-emerald-500/20" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-2 font-medium">Join the premium multi-service booking platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-10 shadow-2xl">
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
              className={`group w-full py-5 rounded-2xl bg-emerald-600 font-black text-xs text-white hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all uppercase tracking-[0.3em] mt-6 flex items-center justify-center gap-2
                ${loading ? 'opacity-50 cursor-not-allowed translate-y-0 shadow-none' : 'cursor-pointer'}`}
            >
              {loading ? 'Creating Account...' : (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              Already have an account? {' '}
              <Link to="/login" className="text-emerald-400 font-black hover:text-emerald-300 transition-colors ml-1">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 flex items-center justify-center gap-10 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
          <span className="hover:text-emerald-500 cursor-pointer transition-colors">Terms of Service</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span className="hover:text-emerald-500 cursor-pointer transition-colors">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

export default Register;
