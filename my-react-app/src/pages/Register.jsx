import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Join UniBook | Create Account";
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
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0f172a] relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[50%] rounded-full bg-blue-500/10 blur-[100px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[50%] rounded-full bg-indigo-500/10 blur-[100px]" />

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .slide-up { animation: slideUp 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
      `}</style>

      <div className="w-full max-w-lg relative z-10 slide-up">
        {/* Branding */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-3xl shadow-2xl shadow-blue-500/20 mx-auto mb-6">🛸</div>
          <h1 className="text-4xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-white/40 mt-2 font-medium">Join the multi-service booking revolution</p>
        </div>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/40 ml-1 uppercase tracking-widest">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10 text-white" 
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-white/40 ml-1 uppercase tracking-widest">Email Address</label>
              <input 
                type="email" 
                placeholder="john@example.com" 
                value={form.email} 
                onChange={(e) => setForm({...form, email: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10 text-white" 
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/40 ml-1 uppercase tracking-widest">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={form.password} 
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10 text-white" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-white/40 ml-1 uppercase tracking-widest">Confirm</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  value={form.confirm} 
                  onChange={(e) => setForm({...form, confirm: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10 text-white" 
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-black text-lg text-white hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all uppercase tracking-widest mt-6
                ${loading ? 'opacity-50 cursor-not-allowed translate-y-0 shadow-none' : ''}`}
            >
              {loading ? 'Creating Account...' : 'Continue'}
            </button>
          </form>

          <div className="mt-10 text-center">
            <p className="text-white/30 font-medium">
              Already have an account? {' '}
              <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 transition-colors">Sign In</Link>
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 flex items-center justify-center gap-6 text-white/20 text-xs font-bold uppercase tracking-[0.2em]">
          <span>Terms of Service</span>
          <span>Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

export default Register;

