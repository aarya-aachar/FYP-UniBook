import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';

const Home = () => {
  const navigate = useNavigate();

  // Contact form state
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [toasts, setToasts] = useState([]);

  const toast = (msg) => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 4000);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (form.name && form.email && form.message) {
      toast('🚀 Message sent! We will contact you soon.');
      setForm({ name: '', email: '', message: '' });
    }
  };

  useEffect(() => {
    document.title = "UniBook | Your Smart Booking Companion";
  }, []);

  const services = [
    { name: "Restaurants", icon: "🍽️", desc: "Reserve your table at the city's finest dining spots.", color: "from-orange-400 to-red-500" },
    { name: "Futsal", icon: "⚽", desc: "Book pro courts and enjoy the game with your team.", color: "from-blue-400 to-indigo-600" },
    { name: "Hospitals", icon: "🏥", desc: "Schedule appointments with trusted healthcare providers.", color: "from-emerald-400 to-teal-600" },
    { name: "Salon / Spa", icon: "💆", desc: "Relax and pamper yourself with top-tier wellness centers.", color: "from-purple-400 to-pink-600" }
  ];

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#0f172a' }}>
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/C:/Users/ACER/.gemini/antigravity/brain/28c59e9f-6ab8-44b0-b71a-a3ed20e75831/unibook_hero_image_1774955029493.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900/90 to-slate-950" />
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes toastIn { from { transform: translateY(100%); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .float { animation: float 6s ease-in-out infinite; }
      `}</style>

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
        {toasts.map(t => (
          <div key={t.id} className="bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm animate-[toastIn_0.3s_ease-out]">
            {t.msg}
          </div>
        ))}
      </div>

      {/* Navigation */}
      <div className="relative z-50">
        <UserNavbar />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-sm font-bold mb-8 fade-in shadow-inner">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
          The Multi-Service Revolution is Here
        </div>
        <h1 className="text-6xl md:text-8xl font-black leading-[0.9] mb-8 fade-in flex flex-col items-center">
          <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">Smarter Bookings.</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Better Living.</span>
        </h1>
        <p className="text-xl text-white/50 max-w-2xl mx-auto mb-10 fade-in [animation-delay:200ms]">
          One unified platform for restaurants, futsal, hospitals, and more. Experience the seamless flow of modern scheduling at your fingertips.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 fade-in [animation-delay:400ms]">
          <Link to="/login" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all">
            Browse Services Now
          </Link>
          <Link to="/about" className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/5 border border-white/10 font-bold text-lg hover:bg-white/10 transition-all">
            Learn More
          </Link>
        </div>
      </section>

      {/* Services Grid */}
      <section className="relative z-10 py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col items-center text-center mb-20 fade-in">
          <h2 className="text-4xl font-bold mb-4">Explore Our ecosystem</h2>
          <div className="w-20 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in [animation-delay:200ms]">
          {services.map((s, idx) => (
            <div key={s.name} 
              onClick={() => navigate(`/services/${encodeURIComponent(s.name)}`)}
              className="group cursor-pointer relative p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              <div className="text-5xl mb-6 float" style={{ animationDelay: `${idx * 0.5}s` }}>{s.icon}</div>
              <h3 className="text-2xl font-bold mb-3 group-hover:text-blue-400 transition-colors">{s.name}</h3>
              <p className="text-white/40 leading-relaxed">{s.desc}</p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-blue-400 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                Book Appointment <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="relative z-10 py-32 px-6 bg-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="fade-in">
            <h2 className="text-5xl font-black mb-8 leading-tight">Simplified Scheduling <br/> <span className="text-blue-400">For Everyone.</span></h2>
            <div className="space-y-6">
              {[
                { title: 'Centralized Hub', desc: 'No more jumping between apps. Manage all your appointments in one place.', icon: '🎯' },
                { title: 'Real-time Updates', desc: 'Instant confirmations and live status tracking for every booking.', icon: '⚡' },
                { title: 'Smart Analytics', desc: 'Deep insights for providers to optimize their service flow.', icon: '📊' }
              ].map(item => (
                <div key={item.title} className="flex gap-4">
                  <div className="w-12 h-12 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-xl shadow-lg">{item.icon}</div>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-white/40">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative fade-in [animation-delay:400ms]">
            <div className="aspect-square rounded-[4rem] bg-gradient-to-br from-blue-500 to-indigo-700 opacity-20 blur-3xl absolute inset-0 animate-pulse" />
            <div className="relative rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl backdrop-blur-2xl bg-white/5 p-2">
               <img src="/images/booking.jpg" alt="Interface" className="rounded-[2.5rem] w-full h-full object-cover opacity-80" />
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="relative z-10 py-32 px-6 max-w-3xl mx-auto">
        <div className="text-center mb-16 fade-in">
          <h2 className="text-5xl font-bold mb-4">Connect With Us</h2>
          <p className="text-white/40 text-lg">Have questions? We're here to help you scale your lifestyle.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-2xl shadow-2xl fade-in [animation-delay:200ms]">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/40 ml-1">Full Name</label>
              <input type="text" placeholder="John Doe" value={form.name} onChange={e=>setForm({...form, name: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-white/40 ml-1">Email Address</label>
              <input type="email" placeholder="john@example.com" value={form.email} onChange={e=>setForm({...form, email: e.target.value})}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10" />
            </div>
          </div>
          <div className="space-y-2 mb-8">
            <label className="text-sm font-bold text-white/40 ml-1">Your Message</label>
            <textarea rows={4} placeholder="How can we help you?" value={form.message} onChange={e=>setForm({...form, message: e.target.value})}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 focus:border-blue-500 focus:outline-none transition-all placeholder:text-white/10 resize-none" />
          </div>
          <button type="submit" className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 font-black text-lg hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 transition-all uppercase tracking-widest">
            Send Message
          </button>
        </form>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/5 text-center">
        <p className="text-white/20 text-sm font-medium">© 2026 UniBook Ecosystem · Redefining Local Services</p>
      </footer>

    </div>
  );
};

export default Home;

