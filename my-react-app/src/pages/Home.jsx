import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import { 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  MapPin, 
  ShieldCheck, 
  TrendingUp, 
  Calendar, 
  Search, 
  Phone, 
  Mail, 
  Globe,
  Camera,
  Share2,
  Clock,
  Star,
  Zap,
  Award,
  Lock,
  Headphones
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    document.title = "UniBook | The Smart Way to Book Everything";
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const services = [
    { name: "Restaurants", icon: "🍽️", desc: "Reserve your table at the city's finest dining spots with instant digital confirmation.", stats: "1200+ Tables Booked" },
    { name: "Futsal", icon: "⚽", desc: "Book professional turf courts for your team. Real-time pitch availability tracking.", stats: "450+ Weekly Matches" },
    { name: "Hospitals", icon: "🏥", desc: "Secure priority appointments with top-tier medical specialists and holistic clinics.", stats: "800+ Verified Doctors" },
    { name: "Salon / Spa", icon: "💆", desc: "Premium wellness, grooming, and luxury spa treatments at your preferred time.", stats: "600+ Stylists" }
  ];

  const valueProps = [
    { icon: Zap, title: "Instant Booking", desc: "No more waiting for callbacks. Confirmation in seconds." },
    { icon: ShieldCheck, title: "Verified Providers", desc: "Every service provider is strictly vetted for quality and trust." },
    { icon: Headphones, title: "24/7 Support", desc: "Our concierge team is always here to help with your bookings." },
    { icon: Lock, title: "Secure Payments", desc: "Industry-standard encryption for all your transactions." }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] text-slate-900 font-inter overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900">
      <UserNavbar />
      
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl -z-10 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-300 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-teal-200 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-black mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Empowering 50,000+ Users Monthly
            </div>
            <h1 className="text-6xl lg:text-8xl font-black leading-[1.1] mb-8 tracking-tight text-slate-900">
              The Smart Way to <br/>
              <span className="text-emerald-600">Book Everything.</span>
            </h1>
            <p className="text-xl text-slate-600 mb-12 max-w-xl leading-relaxed font-medium">
              UniBook is the all-in-one ecosystem connecting you to premium local services. From futsal pitches to medical specialists, experience seamless scheduling today.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-slate-900 text-white font-black text-lg hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 cursor-pointer group">
                Get Started Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="mt-16 flex items-center gap-12 border-t border-slate-100 pt-10">
               <div>
                  <p className="text-3xl font-black text-slate-900">950+</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Verified Partners</p>
               </div>
               <div className="w-px h-12 bg-slate-200" />
               <div className="">
                  <div className="flex -space-x-3 mb-2">
                     {[1,2,3,4].map(i => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                           <img src={`https://i.pravatar.cc/100?u=user${i}`} alt="user" className="w-full h-full object-cover" />
                        </div>
                     ))}
                     <div className="w-10 h-10 rounded-full border-2 border-white bg-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-sm">+2k</div>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Community Members</p>
               </div>
            </div>
          </div>

          <div className="relative animate-in fade-in zoom-in-95 duration-1000 hidden lg:block">
            <div className="relative z-10 p-6 bg-white rounded-[4rem] shadow-2xl border border-slate-100 transform hover:rotate-1 transition-transform duration-700">
               <img src="/images/booking.jpg" alt="Platform usage" className="rounded-[3rem] w-full h-[550px] object-cover shadow-inner" />
               
               {/* Floating Card 1 */}
               <div className="absolute top-1/4 -right-12 bg-white p-5 rounded-3xl shadow-2xl border border-slate-100 animate-bounce-slow">
                  <div className="flex items-center gap-4 mb-3">
                     <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 className="text-white w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-xs font-black uppercase text-slate-400 tracking-widest leading-none">Status</p>
                        <p className="text-sm font-bold text-slate-900">Booking Verified</p>
                     </div>
                  </div>
               </div>

               {/* Floating Card 2 */}
               <div className="absolute -bottom-6 -left-12 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className="flex text-amber-400">
                        {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                     </div>
                     <p className="text-sm font-black text-slate-900">4.9/5 Rating</p>
                  </div>
               </div>
            </div>
            
            {/* Background Orbs */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-emerald-600/5 rounded-full blur-[100px] -z-10" />
          </div>
        </div>
      </section>

      {/* Trust & Logos Section */}
      <section className="py-24 border-y border-slate-100 bg-white/50 backdrop-blur-md relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-16">The Ecosystem Trusted by Leaders</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
            {['HOSPITAL NETWORK', 'FIFA PARTNERS', 'ELITE DINING', 'SPA ASSOCIATION', 'GYM GLOBAL'].map(name => (
              <span key={name} className="text-2xl font-black tracking-tighter text-slate-900 hover:text-emerald-600 cursor-default transition-colors">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section className="py-32 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24 max-w-3xl mx-auto">
            <h2 className="text-5xl font-black mb-8 tracking-tight text-slate-900">Professional Booking. <br/><span className="text-emerald-600">Zero Complications.</span></h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">No matter your need, UniBook provides a unified interface to reach the best service providers in the region.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((s, i) => (
              <div key={s.name} 
                onClick={() => navigate('/login')}
                className="group relative p-10 rounded-[3rem] bg-white border border-slate-100 hover:border-emerald-200 transition-all duration-500 hover:-translate-y-3 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-emerald-500/10 overflow-hidden">
                <div className="text-6xl mb-10 group-hover:scale-110 transition-transform duration-500 inline-block">{s.icon}</div>
                <div className="absolute top-8 right-8 w-12 h-12 rounded-full border border-slate-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                   <ArrowRight className="w-5 h-5 text-emerald-600" />
                </div>
                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-emerald-500 mb-3">{s.stats}</p>
                <h3 className="text-2xl font-black mb-5 text-slate-900">{s.name}</h3>
                <p className="text-slate-500 leading-relaxed font-medium text-sm">{s.desc}</p>
                
                {/* Decorative background element */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-emerald-50 rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us - Real Life Benefits */}
      <section className="py-32 bg-slate-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500 rounded-full blur-[150px]" />
             <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-500 rounded-full blur-[150px]" />
          </div>

          <div className="max-w-7xl mx-auto px-6 relative z-10">
             <div className="text-center mb-24">
                <h2 className="text-4xl lg:text-5xl font-black mb-6 tracking-tight">The UniBook Advantage</h2>
                <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">We've built a platform that prioritizes your time, security, and peace of mind.</p>
             </div>

             <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
                {[
                  { icon: Zap, title: "Velocity", desc: "Confirm your appointment in under 60 seconds with our optimized booking engine." },
                  { icon: ShieldCheck, title: "Trust", desc: "Every partner undergoes a 12-point authentication process before joining." },
                  { icon: Headphones, title: "Concierge", desc: "Dedicated support team available 24/7 to resolve any scheduling issues." },
                  { icon: Lock, title: "Encryption", desc: "Your data and payment info are protected by banking-grade security protocols." }
                ].map((item, i) => (
                   <div key={i} className="text-center group">
                      <div className="w-16 h-16 rounded-3xl bg-emerald-600 flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                         <item.icon className="w-8 h-8 text-white" />
                      </div>
                      <h4 className="text-xl font-bold mb-4">{item.title}</h4>
                      <p className="text-slate-400 font-medium text-sm leading-relaxed">{item.desc}</p>
                   </div>
                ))}
             </div>
          </div>
      </section>

      {/* Testimonials - Enhanced */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20">
             <div className="max-w-2xl">
               <h2 className="text-5xl font-black tracking-tight mb-6 text-slate-900 leading-tight">Stories from our <br/><span className="text-emerald-600">Community.</span></h2>
               <p className="text-xl text-slate-500 font-medium italic">"UniBook didn't just give me an app; it gave me back my weekends."</p>
             </div>
             <div className="flex gap-4">
                <div className="px-6 py-4 rounded-3xl bg-emerald-50 border border-emerald-100 flex flex-col items-center">
                   <p className="text-3xl font-black text-emerald-600 leading-none mb-1">4.9</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">App Store</p>
                </div>
                <div className="px-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col items-center">
                   <p className="text-3xl font-black text-slate-900 leading-none mb-1">2M+</p>
                   <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Active Daily</p>
                </div>
             </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             {[
               { name: "Anish Thapa", role: "Futsal Enthusiast", text: "UniBook has revolutionized how we organize our weekly matches. No more calling around—just tap and play.", avatar: "https://i.pravatar.cc/150?u=anish" },
               { name: "Suman Gurung", role: "Restaurateur", text: "As a partner, the platform reduced our no-shows by 45%. The automation is truly world-class tech.", avatar: "https://i.pravatar.cc/150?u=suman" },
               { name: "Prabin Rai", role: "Regular Client", text: "I book everything from my dental checkups to spa days here. It's the most reliable app on my phone.", avatar: "https://i.pravatar.cc/150?u=prabin" }
             ].map((t, idx) => (
               <div key={idx} className="p-12 rounded-[3.5rem] bg-[#fcfcfd] border border-slate-100 flex flex-col justify-between hover:border-emerald-200 transition-all duration-300 shadow-sm relative group">
                  <div className="absolute top-10 right-10 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Star className="w-12 h-12 fill-emerald-600" />
                  </div>
                  <div>
                    <div className="flex gap-1 mb-8 text-emerald-500">
                       {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                    </div>
                    <p className="text-slate-700 italic font-medium leading-relaxed mb-12 text-lg">"{t.text}"</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <img src={t.avatar} alt={t.name} className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow-md" />
                    <div className="text-left">
                       <h5 className="font-black text-slate-900 leading-none mb-1.5 text-base">{t.name}</h5>
                       <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">{t.role}</p>
                    </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Global Reach CTA */}
      <section className="py-32 px-6">
        <div className="max-w-5xl mx-auto">
            <div className="relative p-20 rounded-[4rem] bg-emerald-600 text-white shadow-3xl shadow-emerald-600/20 overflow-hidden group">
               <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full blur-[120px] opacity-20 -z-0 group-hover:scale-110 transition-transform duration-1000" />
               <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-400 rounded-full blur-[100px] opacity-30 -z-0" />
               
               <div className="relative z-10 text-center">
                  <h2 className="text-5xl lg:text-6xl font-black mb-10 tracking-tight leading-none">Your Next Appointment <br/> is Seconds Away.</h2>
                  <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
                    <button onClick={() => navigate('/login')} className="px-12 py-5 bg-white text-emerald-700 rounded-2xl font-black text-xl hover:bg-slate-900 hover:text-white transition-all shadow-2xl cursor-pointer">Start Booking Now</button>
                    <div className="flex flex-col items-center sm:items-start text-emerald-100">
                       <Link to="/login" className="text-sm font-bold flex items-center gap-2 underline underline-offset-4 cursor-pointer hover:text-white transition-colors">Apply as a Service Provider</Link>
                       <p className="text-[10px] font-medium opacity-70 mt-1 uppercase tracking-widest text-center sm:text-left">Join 5,000+ growing businesses</p>
                    </div>
                  </div>
               </div>
            </div>
        </div>
      </section>

      {/* Simplified, Modern Footer */}
      <footer className="pt-32 pb-16 bg-white border-t border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-12 gap-20 mb-24">
              <div className="lg:col-span-5">
                  <div className="flex items-center gap-3 mb-10">
                    <div className="flex items-center justify-center">
                      <img src="/logo.png" alt="UniBook Logo" className="w-12 h-12 object-contain" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900">UniBook<span className="text-emerald-600">.</span></h2>
                  </div>
                 <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10 max-w-sm">
                    The world's most intuitive ecosystem for local services. Designed for precision, built for velocity.
                 </p>
                 <div className="flex gap-5">
                    {[Globe, Share2, Camera].map((Icon, i) => (
                      <a key={i} href="#" className="w-12 h-12 rounded-2xl border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 transition-all shadow-sm">
                        <Icon className="w-5 h-5" />
                      </a>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12">
                 <div>
                    <h5 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-[0.3em]">Resources</h5>
                    <ul className="space-y-5">
                       {['Marketplace', 'Booking API', 'Documentation', 'Security Hub'].map(link => (
                         <li key={link}><Link to="/login" className="text-slate-500 hover:text-emerald-600 transition-colors font-bold text-sm">{link}</Link></li>
                       ))}
                    </ul>
                 </div>
                 <div>
                    <h5 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-[0.3em]">Company</h5>
                    <ul className="space-y-5">
                       {['Mission', 'Strategic Partners', 'Global Career', 'Press Kit'].map(link => (
                         <li key={link}><Link to="/login" className="text-slate-500 hover:text-emerald-600 transition-colors font-bold text-sm">{link}</Link></li>
                       ))}
                    </ul>
                 </div>
                 <div className="col-span-2 md:col-span-1">
                    <h5 className="font-black text-slate-900 mb-8 uppercase text-xs tracking-[0.3em]">Headquarters</h5>
                    <ul className="space-y-5 text-slate-500 font-bold text-sm">
                       <li className="flex items-center gap-4 group"><Phone className="w-5 h-5 text-emerald-600" /> <span className="group-hover:text-emerald-600 transition-colors">+977-1-4XXXXXX</span></li>
                       <li className="flex items-center gap-4 group"><Mail className="w-5 h-5 text-emerald-600" /> <span className="group-hover:text-emerald-600 transition-colors">hello@unibook.io</span></li>
                       <li className="flex items-center gap-4 group"><MapPin className="w-5 h-5 text-emerald-600" /> <span className="group-hover:text-emerald-600 transition-colors">Kathmandu, Nepal</span></li>
                    </ul>
                 </div>
              </div>
           </div>

           <div className="pt-16 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                 <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Platform Operational 24/7</p>
              </div>
              <p className="text-slate-400 text-xs font-bold">© 2026 UniBook Ecosystem. Global Operations.</p>
              <div className="flex gap-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                 <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
                 <a href="#" className="hover:text-emerald-600 transition-colors">Compliance</a>
                 <a href="#" className="hover:text-emerald-600 transition-colors">Legal</a>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
