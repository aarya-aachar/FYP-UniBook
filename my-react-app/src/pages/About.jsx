import { useUserTheme } from "../context/UserThemeContext";
import UserNavbar from "../components/UserNavbar";
import { Target, Zap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-slate-400" : "text-slate-600";
  const cardBase = isDark ? "bg-slate-800/80 border-slate-700" : "bg-white border-slate-200 shadow-sm";

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #020617 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-16 relative flex flex-col items-center transition-all duration-500">
        <div className={`absolute top-[10%] left-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500 ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-400/5'}`} />

        <div className="max-w-4xl mx-auto w-full pt-4 relative z-10">
          <div className="mb-16 text-center">
            <h1 className={`text-4xl md:text-5xl font-bold mb-4 tracking-tight ${textPrimary}`}>The UniBook Vision</h1>
            <p className={`text-lg md:text-xl font-medium tracking-tight ${textSecondary}`}>Redefining how you connect with local services.</p>
          </div>

          <div className={`rounded-3xl p-8 md:p-12 border backdrop-blur-xl mb-12 transition-all ${cardBase}`}>
            <h2 className={`text-2xl font-bold mb-6 ${textPrimary}`}>Our Mission</h2>
            <p className={`text-base leading-relaxed mb-8 ${textSecondary}`}>
              UniBook was founded on a simple premise: scheduling your life shouldn't be a full-time job. 
              We've built a centralized hub that bridges the gap between premium service providers and clients who value their time.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Centralized Hub', icon: <Target className="w-6 h-6" />, desc: 'Book restaurants, futsal courts, and healthcare in one unified platform.' },
                { title: 'Real-time Slots', icon: <Zap className="w-6 h-6" />, desc: 'Instant verification and automatic synchronization with provider schedules.' }
              ].map(item => (
                <div key={item.title} className={`p-6 rounded-2xl border transition-all ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${isDark ? 'bg-slate-800 text-emerald-400' : 'bg-white text-emerald-600 border border-slate-100 shadow-sm'}`}>{item.icon}</div>
                   <h3 className={`text-lg font-semibold mb-2 ${textPrimary}`}>{item.title}</h3>
                   <p className={`text-sm ${textSecondary}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-3xl p-10 md:p-12 border backdrop-blur-xl text-center transition-all ${isDark ? 'bg-gradient-to-br from-emerald-600/10 to-teal-600/5 border-emerald-500/20' : 'bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100'}`}>
             <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${textPrimary}`}>Ready to begin?</h2>
             <p className={`text-base mb-8 max-w-lg mx-auto ${textSecondary}`}>Join thousands of users who have simplified their daily routines.</p>
             <Link to="/login" className={`inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-all shadow-sm
                ${isDark ? 'bg-emerald-600 text-white hover:bg-emerald-500 hover:shadow' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md'}`}>
                Explore Services <ArrowRight className="w-4 h-4" />
             </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
