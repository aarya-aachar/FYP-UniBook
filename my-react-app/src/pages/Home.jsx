/**
 * The Front Window (Landing Page)
 * 
 * relative path: /src/pages/Home.jsx
 * 
 * This is the primary marketing page for UniBook. It is designed to be 
 * professional and "Enterprise-Grade," aiming to build trust with 
 * both regular customers and business providers.
 * 
 * Major Sections:
 * - Hero Area: High-impact copy and a dashboard mockup to show the product in action.
 * - Social Proof: Trust marquee and customer reviews.
 * - Ecosystem Grid: Categories (Futsal, Hospitals, etc.) to show versatility.
 * - Business CTA: A dedicated section to recruit new service providers.
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';
import heroDashboard from '../assets/hero-dashboard.png';
import userReview1 from '../assets/user-review.png';
import userReview2 from '../assets/user-review-2.png';
import userReview3 from '../assets/user-review-3.png';
import { 
  ArrowRight, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Trophy, 
  TrendingUp, 
  Utensils, 
  Hospital, 
  Scissors
} from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Tracks scroll position to adjust navbar styles if needed
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    
    // SEO Optimization: Clear Page Title
    document.title = "UniBook | The Professional Operating System for Your Lifestyle";
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  /**
   * --- SERVICE CATEGORIES ---
   * The 4 pillars of the UniBook ecosystem.
   */
  const serviceCategories = [
    { name: "Restaurants", icon: Utensils, label: "Fine Dining & Cafes" },
    { name: "Futsal", icon: Trophy, label: "Sports & Arena Booking" },
    { name: "Hospitals", icon: Hospital, label: "Medical & Health Services" },
    { name: "Salon / Spa", icon: Scissors, label: "Beauty & Wellness" }
  ];

  const reviews = [userReview1, userReview2, userReview3];

  return (
    <div className="min-h-screen bg-white text-slate-900 font-inter selection:bg-emerald-100 selection:text-emerald-900">
      <UserNavbar />
      
      {/* 
          --- HERO SECTION --- 
          Designed with a "SaaS" (Software as a Service) aesthetic. 
          Uses plenty of white space and bold typography.
      */}
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          <div className="text-left">
            {/* The "Social Proof" Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-widest mb-8 border border-emerald-100">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              Join 5,000+ businesses automating their growth
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] mb-8 tracking-tight text-slate-950">
              The Professional <br/>
              Standard for <span className="text-emerald-600">Scheduling.</span>
            </h1>
            
            <p className="text-lg text-slate-500 mb-10 max-w-xl leading-relaxed font-semibold">
              UniBook is more than an appointment manager. It's an enterprise-grade ecosystem designed to maximize your time and streamline every booking in your life.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-5">
              <button 
                onClick={() => navigate('/login')} 
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-slate-950 text-white font-bold text-lg hover:bg-emerald-600 shadow-2xl shadow-slate-950/20 hover:shadow-emerald-500/20 transition-all flex items-center justify-center gap-3 cursor-pointer group"
              >
                Start Booking Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => navigate('/provider/register')} 
                className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white text-slate-900 border-2 border-slate-100 font-bold text-lg hover:border-emerald-600 hover:text-emerald-600 transition-all flex items-center justify-center cursor-pointer"
              >
                Apply as Provider
              </button>
            </div>
          </div>

          {/* RIGHT SIDE: The Product Visualization */}
          <div className="relative">
             <div className="relative z-10 p-2 bg-gradient-to-br from-slate-200 to-slate-50 rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden">
                <img 
                   src={heroDashboard} 
                   alt="UniBook Dynamic Interface" 
                   className="rounded-[2.2rem] w-full h-auto object-cover"
                />
             </div>
          </div>
        </div>
      </section>

      {/* --- TRUST MARQUEE --- */}
      <section className="py-16 border-y border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] mb-12">Empowering Local Ecosystems</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale transition-all hover:grayscale-0 hover:opacity-100">
            {['RESTAURANTS', 'FOOTBALL ARENAS', 'MEDICAL HUBS', 'SALON & SPA'].map(name => (
              <span key={name} className="text-sm font-black tracking-widest text-slate-950 font-outfit">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* --- USER REVIEWS --- */}
      <section className="py-32 bg-slate-50 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
           <p className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.4em] mb-12 text-center">Validated by Industry Leaders</p>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((img, i) => (
                <div key={i} className="group cursor-pointer">
                   <img 
                    src={img} 
                    alt={`User Review ${i+1}`} 
                    className="w-full h-auto rounded-[2.5rem] shadow-xl border border-white hover:border-emerald-500 hover:scale-[1.02] transition-all duration-300"
                  />
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* --- CATEGORY EXPLORATION --- */}
      <section className="py-32 bg-white border-y border-slate-100 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 px-4 text-center md:text-left">
            <div className="max-w-2xl mx-auto md:mx-0">
              <p className="text-emerald-600 font-extrabold text-[10px] uppercase tracking-[0.5em] mb-4">Service Ecosystem</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-950">A category for every habit.</h2>
            </div>
            <button onClick={() => navigate('/login')} className="flex items-center gap-3 font-black text-sm text-slate-950 hover:text-emerald-600 transition-colors cursor-pointer group pb-2 border-b-2 border-slate-200 hover:border-emerald-600 mx-auto md:mx-0">
              EXPLORE ALL SERVICES <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCategories.map((c) => {
              const IconComp = c.icon;
              return (
                <div key={c.name} 
                  className="p-10 rounded-[2.5rem] bg-white border border-slate-100 hover:border-emerald-500 hover:shadow-[0_30px_60px_-15px_rgba(16,185,129,0.1)] transition-all cursor-pointer group text-center flex flex-col items-center"
                  onClick={() => navigate('/login')}
                >
                  <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-8 group-hover:bg-emerald-50 transition-colors duration-500">
                    <IconComp className="w-10 h-10 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                  </div>
                  <h4 className="text-lg font-black text-slate-950 mb-2 tracking-tight group-hover:text-emerald-600">{c.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* --- BUSINESS / PROVIDER SECTION --- */}
      <section id="business-section" className="py-20 px-6 mb-20">
         <div className="max-w-7xl mx-auto overflow-hidden rounded-[3rem] bg-slate-950 relative border border-slate-800/50">
            <div className="relative z-10 px-10 md:px-20 py-24 grid lg:grid-cols-2 gap-16 items-center text-center lg:text-left">
               <div className="text-white">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-8 border border-emerald-500/20">
                     UniBook for Business
                  </div>
                  <h2 className="text-4xl md:text-5xl xl:text-6xl font-black mb-8 tracking-tighter leading-tight">
                     Scale your business <br/> with professional <br/> orchestration.
                  </h2>
                  <p className="text-slate-400 font-bold text-lg mb-10 max-w-lg leading-relaxed mx-auto lg:mx-0">
                     Automate your appointments, manage staff, and accept digital payments with the world's most versatile service platform.
                  </p>
                  <button onClick={() => navigate('/provider/register')} className="mx-auto lg:mx-0 px-10 py-5 rounded-2xl bg-emerald-600 text-white font-bold text-lg hover:bg-emerald-500 shadow-2xl shadow-emerald-500/20 transition-all flex items-center gap-3 group">
                     Register as Provider <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
               </div>
               
               {/* Visual Mockup for Admins */}
               <div className="relative hidden lg:block">
                  <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl">
                     <div className="space-y-6">
                        <div className="flex items-center justify-between p-5 rounded-2xl bg-white/10 border border-white/5">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center">
                                 <ShieldCheck className="w-6 h-6 text-white" />
                              </div>
                              <div className="text-left">
                                 <h4 className="text-sm font-black">Secure Core</h4>
                                 <p className="text-[10px] text-slate-400 font-bold">Encrypted End-to-End</p>
                              </div>
                           </div>
                           <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="h-28 bg-white/5 rounded-2xl border border-white/5 flex items-center justify-center">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">Merchant Dashboard</p>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="pt-32 pb-12 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid lg:grid-cols-12 gap-20 mb-24">
              <div className="lg:col-span-12 xl:col-span-5 text-center xl:text-left">
                  <div className="flex items-center justify-center xl:justify-start gap-4 mb-10">
                    <img src="/logo.png" alt="UniBook Logo" className="w-12 h-12 object-contain" />
                    <h2 className="text-3xl font-black tracking-tighter text-slate-950 font-outfit">UniBook<span className="text-emerald-600">.</span></h2>
                  </div>
                 <p className="text-slate-500 font-bold text-lg mb-12 max-w-sm leading-relaxed mx-auto xl:mx-0">
                    The enterprise standard for service discovery and automated appointment management.
                 </p>
              </div>

              <div className="lg:col-span-12 xl:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-12 text-center md:text-left">
                 <div>
                    <h5 className="font-black text-slate-950 mb-8 uppercase text-[10px] tracking-[0.4em]">Eco-System</h5>
                    <ul className="space-y-5">
                       {serviceCategories.map(c => (
                         <li key={c.name}><Link to="/login" className="text-slate-500 hover:text-emerald-600 transition-colors font-bold text-sm tracking-tight">{c.name}</Link></li>
                       ))}
                    </ul>
                 </div>
                 <div>
                    <h5 className="font-black text-slate-950 mb-8 uppercase text-[10px] tracking-[0.4em]">Company</h5>
                    <ul className="space-y-5">
                        <li><Link to="/provider/register" className="text-emerald-600 hover:text-emerald-700 transition-colors font-black text-sm tracking-tight group font-outfit">Become a Partner →</Link></li>
                    </ul>
                 </div>
                 <div>
                    <h5 className="font-black text-slate-950 mb-8 uppercase text-[10px] tracking-[0.4em]">Get in touch</h5>
                    <ul className="space-y-6 text-slate-500 font-bold text-sm flex flex-col items-center md:items-start">
                       <li className="flex items-center gap-4 truncate font-outfit uppercase tracking-wider text-[11px]"><Mail className="w-4 h-4 text-emerald-600" /> contact@unibook.io</li>
                       <li className="flex items-center gap-4 font-outfit uppercase tracking-wider text-[11px]"><Phone className="w-4 h-4 text-emerald-600" /> +977-1-4XXXXXX</li>
                    </ul>
                 </div>
              </div>
           </div>

           <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
              <p>&copy; 2026 UNIBOOK ECOSYSTEM. ALL RIGHTS RESERVED.</p>
           </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
