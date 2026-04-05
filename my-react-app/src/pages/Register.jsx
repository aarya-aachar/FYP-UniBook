import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import { Globe, User, Mail, Lock, ArrowRight } from 'lucide-react';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Join UniBook | Create Your Account";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) return alert('Please fill in all fields');
    if (form.password !== form.confirm) return alert('Passwords do not match');

    try {
      setLoading(true);
      await register(form.name, form.email, form.password);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-inter">
      {/* Background Decor */}
      <div className="absolute top-[-15%] right-[-5%] w-[45%] h-[45%] rounded-full bg-emerald-600/10 blur-[130px] transition-all duration-1000" />
      <div className="absolute bottom-[-15%] left-[-5%] w-[45%] h-[45%] rounded-full bg-teal-600/10 blur-[130px] transition-all duration-1000" />

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="w-full max-w-lg relative z-10 slide-up">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/30 mx-auto mb-6 transform hover:-rotate-3 transition-transform">
             <Globe className="text-white w-7 h-7" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-slate-400 mt-2 font-medium">Join the premium multi-service booking platform</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                   <User className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                   <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  placeholder="john@example.com" 
                  value={form.email} 
                  onChange={(e) => setForm({...form, email: e.target.value})}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={form.password} 
                    onChange={(e) => setForm({...form, password: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Confirm</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                     <Lock className="w-4 h-4" />
                  </div>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={form.confirm} 
                    onChange={(e) => setForm({...form, confirm: e.target.value})}
                    className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
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
