import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Login | UniBook";
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return alert('Please fill in all fields');

    try {
      setLoading(true);
      const data = await login(email, password);
      // Backend returns { token, user: { id, role, ... } }
      // Harden: check both data.user and data directly
      const candidateUser = data.user || data; 
      
      console.log('DEBUG: Login response body:', data);
      console.log('DEBUG: Candidate User for Role check:', candidateUser);

      // Robust role check (case-insensitive and trimmed)
      const rawRole = candidateUser.role || (data.user && data.user.role) || '';
      const userRole = String(rawRole).toLowerCase().trim();

      console.log('DEBUG: Final determined userRole:', userRole);

      if (userRole === 'admin') {
        console.log('DEBUG: REDIRECTING TO ADMIN ENGINE...');
        // Force a hard redirect to bypass all React state/navigate interference
        window.location.assign('/dashboard/admin');
      } else {
        console.log('DEBUG: REDIRECTING TO USER HUB...');
        navigate('/dashboard/user');
      }
    } catch (err) {
      alert(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-blue-600/10 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-600/10 blur-[120px]" />

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      <div className="w-full max-w-md relative z-10 slide-up">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/20 mx-auto mb-6">🛸</div>
          <h1 className="text-4xl font-black text-white tracking-tight">Welcome Back</h1>
          <p className="text-white/40 mt-2 font-medium">Log in to manage your appointments</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/40 ml-1 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="admin@unibook.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10 text-white" 
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-bold text-white/40 uppercase tracking-widest">Password</label>
                <a href="#" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">Forgot Pwd?</a>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10 text-white" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-black text-lg text-white hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all uppercase tracking-widest mt-4
                ${loading ? 'opacity-50 cursor-not-allowed translate-y-0 shadow-none' : ''}`}
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-white/30 font-medium">
              New to UniBook? {' '}
              <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
          <span>Security</span>
          <span>Privacy</span>
          <span>Help</span>
        </div>
      </div>
    </div>
  );
};

export default Login;

