import { useUserTheme } from "../context/UserThemeContext";
import UserSidebar from "../components/UserSidebar";

const About = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';

  const textPrimary = isDark ? "text-white" : "text-slate-900";
  const textSecondary = isDark ? "text-white/50" : "text-slate-600";
  const cardBase = isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-200 shadow-2xl shadow-slate-200/20";

  return (
    <div className="flex min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <UserSidebar />

      <div className="flex-1 overflow-y-auto px-10 py-12 relative flex flex-col items-center transition-all duration-500">
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <div className="max-w-4xl w-full pt-4 relative z-10">
          <div className="mb-16 text-center">
            <h1 className={`text-6xl font-black mb-4 tracking-tighter font-outfit ${textPrimary}`}>The UniBook Vision</h1>
            <p className={`text-xl font-bold tracking-tight ${textSecondary}`}>Redefining how you connect with local services.</p>
          </div>

          <div className={`rounded-[3.5rem] p-12 border backdrop-blur-xl mb-12 ${cardBase}`}>
            <h2 className={`text-3xl font-black mb-6 font-outfit ${textPrimary}`}>Our Mission</h2>
            <p className={`text-lg leading-relaxed font-medium mb-8 ${textSecondary}`}>
              UniBook was founded on a simple premise: scheduling your life shouldn't be a full-time job. 
              We've built a centralized hub that bridges the gap between premium service providers and clients who value their time.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {[
                { title: 'Centralized Hub', icon: '🎯', desc: 'Book restaurants, futsal courts, and healthcare in one unified platform.' },
                { title: 'Real-time Slots', icon: '⚡', desc: 'Instant verification and automatic synchronization with provider schedules.' }
              ].map(item => (
                <div key={item.title} className={`p-8 rounded-[2.5rem] border ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                   <div className="text-4xl mb-4">{item.icon}</div>
                   <h3 className={`text-xl font-black mb-2 ${textPrimary}`}>{item.title}</h3>
                   <p className={`text-sm font-bold ${textSecondary}`}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`rounded-[3.5rem] p-12 border backdrop-blur-xl text-center ${isDark ? 'bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border-white/10' : 'bg-blue-50 border-blue-100'}`}>
             <h2 className={`text-3xl font-black mb-4 font-outfit ${textPrimary}`}>Ready to begin?</h2>
             <p className={`text-lg font-bold mb-8 ${textSecondary}`}>Join thousand of users who have simplified their daily routines.</p>
             <button className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all">Explore Services →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
