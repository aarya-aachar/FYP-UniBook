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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#020617] font-inter">
      {/* Left Pane - Visual Branding */}
      <div className="hidden md:flex md:w-1/2 lg:w-[60%] relative overflow-hidden bg-slate-900 border-r border-white/5">
        <img 
          src="https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1470&auto=format&fit=crop" 
          alt="Time Efficiency" 
          className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-1000"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="relative z-10 p-16 flex flex-col justify-end h-full">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.png" alt="UniBook Logo" className="w-10 h-10 object-contain" />
            <h2 className="text-2xl font-black tracking-tighter text-white">UniBook<span className="text-emerald-500">.</span></h2>
          </div>
          <h2 className="text-5xl font-extrabold text-white tracking-tight mb-6 leading-tight max-w-lg">
            Stop chasing minutes. <br/>
            Start <span className="text-emerald-500">scheduling</span> them.
          </h2>
          <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed">
            The professional standard for automated appointment management. Join thousands of users optimizing their daily workflow.
          </p>
          <div className="mt-12 flex gap-8">
             <div>
                <p className="text-2xl font-black text-white">50k+</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Active Users</p>
             </div>
             <div className="w-px h-10 bg-white/10" />
             <div>
                <p className="text-2xl font-black text-white">99.9%</p>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Reliability</p>
             </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Authentication Form */}
      <div className="w-full md:w-1/2 lg:w-[40%] flex items-center justify-center p-8 md:p-16 bg-[#020617] relative">
        {/* Background Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-md bg-emerald-600/5 blur-[120px] -z-0" />
        
        <div className="w-full max-w-sm relative z-10">
          <div className="mb-12 md:hidden">
             <div className="flex items-center gap-2.5 mb-2">
                <img src="/logo.png" alt="UniBook Logo" className="w-8 h-8 object-contain" />
                <h2 className="text-lg font-black tracking-tighter text-white">UniBook<span className="text-emerald-600">.</span></h2>
             </div>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
            <p className="text-slate-400 font-medium text-sm">Sign in to your professional workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Professional Email</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center text-slate-500 group-focus-within:text-emerald-500 transition-colors">
                   <Mail className="w-4 h-4" />
                </div>
                <input 
                  type="email" 
                  placeholder="name@company.com" 
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
              className={`group w-full py-5 rounded-2xl bg-emerald-600 font-black text-[11px] text-white hover:bg-emerald-500 transition-all uppercase tracking-[0.3em] mt-4 flex items-center justify-center gap-2
                ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:shadow-emerald-500/20 hover:-translate-y-0.5'}`}
            >
              {loading ? 'Authenticating...' : (
                 <>
                    Sign In to Workspace
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                 </>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 text-center">
            <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest leading-loose">
              New to the platform? <br/>
              <Link to="/register" className="text-emerald-400 font-black hover:text-emerald-300 transition-colors">Create Professional Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
