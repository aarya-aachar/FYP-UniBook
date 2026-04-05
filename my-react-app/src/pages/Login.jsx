import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';
import { Globe, Lock, Mail, ArrowRight } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Access UniBook | Secure Login";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Please fill in all fields');

    try {
      setLoading(true);
      const data = await login(email, password);
      const candidateUser = data.user || data; 
      const rawRole = candidateUser.role || (data.user && data.user.role) || '';
      const userRole = String(rawRole).toLowerCase().trim();

      if (userRole === 'admin') {
        window.location.assign('/dashboard/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#020617] relative overflow-hidden font-inter">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] rounded-full bg-emerald-600/10 blur-[120px] transition-all duration-1000" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] rounded-full bg-teal-600/10 blur-[120px] transition-all duration-1000" />

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div className="w-full max-w-md relative z-10 slide-up">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6 transform hover:rotate-3 transition-transform">
             <img src="/logo.png" alt="UniBook Logo" className="w-16 h-16 object-contain" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-slate-400 mt-2 font-medium">Log in to manage your premium appointments</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 ml-1 uppercase tracking-[0.2em]">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                   <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  placeholder="admin@unibook.io" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                <a href="#" className="text-[10px] font-black text-emerald-400 hover:text-emerald-300 transition-colors uppercase tracking-widest">Forgot?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                   <Lock className="w-4 h-4" />
                </div>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-emerald-500 focus:bg-emerald-500/5 focus:outline-none transition-all placeholder:text-slate-600 text-white font-medium text-sm" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`group w-full py-5 rounded-2xl bg-emerald-600 font-black text-xs text-white hover:bg-emerald-500 hover:shadow-2xl hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all uppercase tracking-[0.3em] mt-4 flex items-center justify-center gap-2
                ${loading ? 'opacity-50 cursor-not-allowed translate-y-0 shadow-none' : 'cursor-pointer'}`}
            >
              {loading ? 'Authenticating...' : (
                 <>
                    Sign In to Account
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </>
              )}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
              New to UniBook? {' '}
              <Link to="/register" className="text-emerald-400 font-black hover:text-emerald-300 transition-colors ml-1">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-12 flex items-center justify-center gap-8 text-slate-600 text-[10px] font-black uppercase tracking-[0.3em]">
          <span className="hover:text-emerald-500 cursor-pointer transition-colors">Security</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span className="hover:text-emerald-500 cursor-pointer transition-colors">Privacy</span>
          <span className="w-1 h-1 rounded-full bg-slate-800" />
          <span className="hover:text-emerald-500 cursor-pointer transition-colors">Support</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
