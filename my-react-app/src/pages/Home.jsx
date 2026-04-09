import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import { 
  ArrowRight, 
  CheckCircle2, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Search, 
  Phone, 
  Mail, 
  Globe,
  Clock,
  Star,
  Zap,
  Lock,
  Headphones,
  Layout,
  MousePointer2,
  CheckCircle,
  Building2,
  Trophy,
  Activity,
  UserCheck
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    document.title = "UniBook | Professional Appointment Scheduling Platform";
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const serviceCategories = [
    { name: "Hospitality", icon: "🍴", label: "Dining & Events" },
    { name: "Sports", icon: "⚽", label: "Arena Booking" },
    { name: "Healthcare", icon: "🏥", label: "Medical Visits" },
    { name: "Lifestyle", icon: "💆", label: "Salon & Wellness" },
    { name: "Education", icon: "📚", label: "Tutors & Labs" },
    { name: "Corporate", icon: "🏢", label: "Meeting Rooms" }
  ];

  const steps = [
    { 
      id: "01", 
      title: "Discover Services", 
      desc: "Browse through our network of verified service providers in your local area.",
      icon: Search 
    },
    { 
      id: "02", 
      title: "Schedule Time", 
      desc: "Select the perfect time slot from real-time availability calendars.",
      icon: Calendar 
    },
    { 
      id: "03", 
      title: "Instant Confirmation", 
      desc: "Book your appointment instantly with secure digital verification.",
      icon: CheckCircle2 
    }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-inter selection:bg-emerald-100 selection:text-emerald-900">
      <UserNavbar />
      
      {/* Hero Section - Clean & Refined */}
      <section className="relative pt-32 pb-40 overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-20 items-center">
          <div className="text-left animate-in fade-in slide-in-from-left duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-10">
              Trusted by 5,000+ businesses nationwide
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.1] mb-8 tracking-tight text-slate-950 px-0">
              The Professional Way to <br/>
              Manage Your <span className="text-emerald-600 underline underline-offset-[8px] decoration-4 decoration-emerald-100">Time.</span>
            </h1>
            <p className="text-lg text-slate-500 mb-12 max-w-xl leading-relaxed font-normal">
              UniBook is the enterprise-grade scheduling ecosystem. One platform to discover, book, and manage every appointment in your lifestyle.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-10 py-5 rounded-xl bg-slate-950 text-white font-bold text-lg hover:bg-emerald-600 shadow-xl shadow-slate-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer group">
                Start Booking Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-10 py-5 rounded-xl bg-white text-slate-900 border border-slate-200 font-bold text-lg hover:bg-slate-50 transition-all flex items-center justify-center cursor-pointer">
                Apply as Provider
              </button>
            </div>
          </div>

          <div className="relative hidden lg:block animate-in fade-in zoom-in duration-1000 delay-200">
            <div className="relative z-10 p-2 bg-slate-100 rounded-[2rem] shadow-2xl overflow-hidden group hover:shadow-emerald-500/10 transition-shadow duration-500">
               <img 
                 src="https://images.unsplash.com/photo-1506784911079-53934eaad337?q=80&w=2070&auto=format&fit=crop" 
                 alt="Professional Scheduling Interface" 
                 className="rounded-[1.8rem] w-full h-[500px] object-cover grayscale hover:grayscale-0 transition-all duration-700"
               />
               <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/5 to-transparent pointer-events-none" />
            </div>
            {/* Background elements */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -z-10 animate-pulse" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-50 rounded-full blur-2xl -z-10" />
          </div>
        </div>
      </section>

      {/* Social Proof - Subtle Grayscale */}
      <section className="py-12 border-y border-slate-100 bg-slate-50/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-10">Integration Ecosystem</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-30 grayscale pointer-events-none">
            {['RESTAURANTS', 'FOOTBALL ARENAS', 'HEALTH CENTERS', 'SPA & SALON', 'TUTORING HUBS', 'AUTO CARE'].map(name => (
              <span key={name} className="text-sm font-extrabold tracking-widest text-slate-900">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works - Structured & Subtle */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
           <div className="text-center mb-20">
             <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">The Workflow</p>
             <h2 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight text-slate-950">How it works.</h2>
             <p className="text-slate-500 font-medium text-base">Three simple steps to bridge the gap between need and service.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
             {steps.map((step) => (
                <div key={step.id} className="relative group">
                   <div className="text-5xl font-black text-slate-100 absolute -top-8 -left-2 -z-0">
                      {step.id}
                   </div>
                   <div className="relative z-10">
                      <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mb-6 shadow-sm group-hover:border-emerald-500 group-hover:bg-emerald-500 transition-all">
                         <step.icon className="w-5 h-5 text-slate-900 group-hover:text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-3 text-slate-950">{step.title}</h3>
                      <p className="text-slate-500 font-normal leading-relaxed text-sm">{step.desc}</p>
                   </div>
                </div>
             ))}
           </div>
        </div>
      </section>

      {/* Featured Service Grid - Professional & Clean */}
      <section className="py-24 bg-slate-50/30 border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-16 px-2">
            <div className="max-w-2xl">
              <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Enterprise Reach</p>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950">A category for every lifestyle.</h2>
            </div>
            <button onClick={() => navigate('/services')} className="flex items-center gap-2 font-bold text-sm text-slate-900 hover:text-emerald-600 transition-colors cursor-pointer group pb-1 border-b-2 border-transparent hover:border-emerald-600">
              Explore All Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-6 gap-6">
            {serviceCategories.map((c) => (
              <div key={c.name} 
                className="p-6 rounded-xl bg-white border border-slate-100 hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/5 transition-all cursor-pointer group text-center"
                onClick={() => navigate('/login')}
              >
                <div className="text-3xl mb-4 group-hover:scale-105 transition-transform">{c.icon}</div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">{c.name}</h4>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{c.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values - Professional Hierarchy */}
      <section className="py-24 px-6">
         <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2">
               <p className="text-emerald-600 font-bold text-[10px] uppercase tracking-[0.4em] mb-4">Why UniBook?</p>
               <h2 className="text-3xl md:text-4xl font-extrabold mb-10 tracking-tight leading-tight text-slate-950">
                  Built for scale. <br/>
                  Defined by precision.
               </h2>
               
               <div className="space-y-8">
                  {[
                    { icon: Zap, title: "Velocity First", desc: "Our real-time engine handles thousands of bookings per second with zero latency." },
                    { icon: ShieldCheck, title: "Verified Ecosystem", desc: "Every service provider is strictly audited to ensure the highest standards." },
                    { icon: Activity, title: "Live Tracking", desc: "Monitor your appointment status and updates in real-time on any device." }
                  ].map((v, i) => (
                    <div key={i} className="flex gap-5">
                       <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                          <v.icon className="w-4 h-4 text-emerald-600" />
                       </div>
                       <div>
                          <h4 className="text-base font-bold text-slate-900 mb-1.5">{v.title}</h4>
                          <p className="text-slate-500 font-normal leading-relaxed max-w-sm text-sm">{v.desc}</p>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
            
            <div className="lg:w-1/2 w-full">
               <div className="relative p-1 bg-slate-100/50 rounded-2xl overflow-hidden">
                  <div className="bg-white rounded-xl p-8 shadow-sm">
                     <div className="flex items-center justify-between mb-10">
                        <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
                           <div className="w-2.5 h-2.5 rounded-full bg-slate-100" />
                           <div className="w-2.5 h-2.5 rounded-full bg-slate-50" />
                        </div>
                        <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase tracking-widest">
                           Live Interface
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="h-10 bg-slate-50 rounded-lg w-full animate-pulse" />
                        <div className="grid grid-cols-3 gap-4">
                           <div className="h-24 bg-slate-50 rounded-xl animate-pulse" />
                           <div className="h-24 bg-emerald-600 rounded-xl shadow-lg border border-emerald-500" />
                           <div className="h-24 bg-slate-50 rounded-xl animate-pulse" />
                        </div>
                        <div className="h-32 bg-slate-50 rounded-xl w-full animate-pulse" />
                        <div className="flex justify-end pt-2">
                           <div className="h-10 w-32 bg-slate-950 rounded-lg" />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Testimonials - Balanced Typography */}
      <section className="py-24 bg-slate-950 text-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
             <div className="text-center lg:text-left">
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-8 leading-tight">The Voice of <br/>Our Global Partners.</h2>
                <div className="flex items-center justify-center lg:justify-start gap-8 py-6 border-t border-slate-800">
                   <div>
                      <p className="text-3xl font-bold text-emerald-500 mb-1">4.9/5</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Platform Rating</p>
                   </div>
                   <div className="w-px h-10 bg-slate-800" />
                   <div>
                      <p className="text-3xl font-bold text-white mb-1">2M+</p>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Reminders Sent</p>
                   </div>
                </div>
             </div>
             <div>
                <div className="p-8 lg:p-10 rounded-2xl bg-slate-900 border border-slate-800 relative">
                   <div className="text-5xl text-emerald-600/30 font-serif absolute top-4 left-6">“</div>
                   <p className="text-lg font-normal leading-relaxed text-slate-300 italic mb-10 relative z-10">
                      "UniBook has transformed the way we handle our weekly scheduling. The automation is flawless, and the real-time confirmation has reduced our coordination overhead by 60%."
                   </p>
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center font-bold text-base">S</div>
                      <div>
                         <h5 className="font-bold text-white text-base">Suman Gurung</h5>
                         <p className="text-emerald-500 text-[9px] font-bold uppercase tracking-widest">Elite Futsal Hub Manager</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Final Refined CTA */}
      <section className="py-32 bg-white">
         <div className="max-w-5xl mx-auto px-6">
            <div className="relative p-12 md:p-20 rounded-3xl bg-emerald-600 text-white text-center overflow-hidden">
               <div className="relative z-10">
                  <h2 className="text-3xl md:text-5xl font-extrabold mb-10 tracking-tight leading-tight">
                     Ready to automate <br/> your lifestyle?
                  </h2>
                  <div className="flex flex-col sm:flex-row justify-center gap-6 items-center">
                    <button onClick={() => navigate('/login')} className="w-full sm:w-auto px-10 py-4 bg-slate-950 text-white rounded-xl font-bold text-lg hover:bg-white hover:text-emerald-700 transition-all shadow-xl shadow-slate-950/20 cursor-pointer">
                       Book Your Slot Now
                    </button>
                    <div className="flex flex-col items-center sm:items-start text-emerald-50">
                       <Link to="/login" className="text-xs font-bold underline underline-offset-4 decoration-emerald-300 hover:text-white transition-colors cursor-pointer">Explore Platform</Link>
                       <p className="text-[9px] font-bold opacity-70 mt-2 uppercase tracking-widest">Join 50k+ local users</p>
                    </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* Minimalist Footer */}
      <footer className="pt-24 pb-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-12 gap-16 mb-20">
              <div className="lg:col-span-5">
                  <div className="flex items-center gap-2.5 mb-8">
                    <img src="/logo.png" alt="UniBook Logo" className="w-8 h-8 object-contain" />
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">UniBook<span className="text-emerald-600">.</span></h2>
                  </div>
                 <p className="text-slate-500 font-medium text-base mb-10 max-w-sm leading-relaxed">
                    The premium standard for local service discovery and automated appointment management.
                 </p>
                 <div className="flex gap-4">
                    {[Globe, Mail, Phone].map((Icon, i) => (
                      <a key={i} href="#" className="w-10 h-10 rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                 </div>
              </div>

              <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
                 <div>
                    <h5 className="font-bold text-slate-900 mb-6 uppercase text-[9px] tracking-[0.3em]">Services</h5>
                    <ul className="space-y-4">
                       {['Healthcare', 'Sports', 'Hospitality', 'Beauty'].map(link => (
                         <li key={link}><Link to="/login" className="text-slate-500 hover:text-emerald-600 transition-colors font-bold text-xs tracking-tight">{link}</Link></li>
                       ))}
                    </ul>
                 </div>
                 <div>
                    <h5 className="font-bold text-slate-900 mb-6 uppercase text-[9px] tracking-[0.3em]">Platform</h5>
                    <ul className="space-y-4">
                       {['Security', 'API Support', 'Enterprise', 'Providers'].map(link => (
                         <li key={link}><Link to="/login" className="text-slate-500 hover:text-emerald-600 transition-colors font-bold text-xs tracking-tight">{link}</Link></li>
                       ))}
                    </ul>
                 </div>
                 <div>
                    <h5 className="font-bold text-slate-900 mb-6 uppercase text-[9px] tracking-[0.3em]">Support</h5>
                    <ul className="space-y-4 text-slate-500 font-bold text-xs">
                       <li className="flex items-center gap-2.5 truncate"><Mail className="w-3.5 h-3.5 text-emerald-600" /> contact@unibook.io</li>
                       <li className="flex items-center gap-2.5"><Phone className="w-3.5 h-3.5 text-emerald-600" /> +977-1-4XXXXXX</li>
                    </ul>
                 </div>
              </div>
           </div>

           <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10 text-[9px] font-bold uppercase tracking-widest text-slate-400">
              <p>© 2026 UniBook Ecosystem.</p>
              <div className="flex gap-8">
                 <a href="#" className="hover:text-emerald-600 transition-colors">Privacy</a>
                 <a href="#" className="hover:text-emerald-600 transition-colors">Terms</a>
              </div>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
