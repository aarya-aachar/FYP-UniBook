import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";
import { getProviders } from "../services/providerService";
import { useUserTheme } from "../context/UserThemeContext";

const BACKEND_URL = 'http://localhost:4001';

const CAT_CONFIG = {
  'Restaurants': { 
    icon: '🍽️', 
    gradient: 'from-orange-500/20 to-red-500/10', 
    color: 'text-orange-400',
    colorLight: 'text-orange-600 font-black'
  },
  'Futsal': { 
    icon: '⚽', 
    gradient: 'from-blue-500/20 to-indigo-500/10', 
    color: 'text-blue-400',
    colorLight: 'text-blue-600 font-black'
  },
  'Hospitals': { 
    icon: '🏥', 
    gradient: 'from-emerald-500/20 to-teal-500/10', 
    color: 'text-emerald-400',
    colorLight: 'text-emerald-600 font-black'
  },
  'Salon / Spa': { 
    icon: '💆', 
    gradient: 'from-purple-500/20 to-pink-500/10', 
    color: 'text-purple-400',
    colorLight: 'text-purple-600 font-black'
  },
};

const ServiceProviders = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { serviceName } = useParams();
  const navigate = useNavigate();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const cfg = CAT_CONFIG[serviceName] || CAT_CONFIG['Restaurants'];

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        let catQuery = serviceName;
        if (serviceName === 'Salon/Spas') catQuery = 'Salon / Spa';
        const data = await getProviders(catQuery);
        setProviders(data);
      } catch (error) {
        console.error("Failed to fetch providers", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProviders();
    document.title = `${serviceName} | UniBook`;
  }, [serviceName]);

  return (
    <div className="flex min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <UserSidebar />

      <div className="flex-1 overflow-y-auto px-10 py-12 relative transition-all duration-500">
        <div className={`absolute top-[10%] left-[20%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-400/5'}`} />

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>

        <div className="max-w-6xl mx-auto w-full fade-in pt-4">
          <div className="mb-12">
            <button onClick={() => navigate('/services')} className={`flex items-center gap-2 transition-colors font-bold mb-6 group ${isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Services
            </button>
            
            <div className="flex items-center gap-6">
              <div className={`w-20 h-20 rounded-[2rem] border flex items-center justify-center text-4xl shadow-2xl transition-all
                ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-slate-200/20'}`}>
                {cfg.icon}
              </div>
              <div>
                <h1 className={`text-4xl font-black tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Recommended {serviceName}</h1>
                <p className={`text-lg font-medium mt-2 transition-colors ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
                  We found {providers.length} top-rated options for you
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {loading ? (
               [1,2,3,4].map(i => (
                 <div key={i} className={`h-64 rounded-[2.5rem] border animate-pulse ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`} />
               ))
            ) : providers.length > 0 ? (
              providers.map((p) => {
                const imgSrc = p.image ? (p.image.startsWith('/uploads') ? `${BACKEND_URL}${p.image}` : p.image) : null;
                
                return (
                  <div
                    key={p.id}
                    className={`group relative rounded-[2.5rem] p-8 flex flex-col transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden border
                      ${isDark ? 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-blue-200 shadow-slate-200/50 shadow-slate-200/20 transition-all'}`}
                  >
                    {imgSrc && (
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
                        <img src={imgSrc} alt={p.name} className="w-full h-full object-cover mix-blend-overlay" />
                      </div>
                    )}
                    
                    <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                        {imgSrc ? (
                          <div className={`w-14 h-14 rounded-2xl border overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500 
                            ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
                             <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-black text-xl transition-all duration-500
                            ${isDark ? 'bg-white/5 border-white/10 text-white/80 group-hover:bg-white group-hover:text-slate-950' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover:bg-slate-900 group-hover:text-white'}`}>
                            {p.name.charAt(0)}
                          </div>
                        )}
                        
                        <div className="flex flex-col items-end gap-2">
                           <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-colors 
                             ${isDark ? `border-white/10 bg-white/5 ${cfg.color}` : `border-slate-100 bg-slate-50 shadow-sm ${cfg.colorLight}`}`}>
                             Featured
                           </span>
                           {p.review_count > 0 && (
                             <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border transition-colors
                               ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600 font-bold shadow-sm'}`}>
                               <span className="text-sm">⭐</span>
                               <span className="text-xs font-black whitespace-nowrap">{p.average_rating} ({p.review_count} reviews)</span>
                             </div>
                           )}
                        </div>
                      </div>

                    <h2 className={`text-2xl font-black mb-2 transition-colors group-hover:text-blue-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {p.name}
                    </h2>

                    <p className={`mb-4 flex items-center gap-2 text-sm font-bold transition-colors ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                      <span className="opacity-40 text-lg">📍</span> {p.address}
                    </p>
                    
                    <p className={`mb-8 text-sm leading-relaxed line-clamp-3 font-bold transition-colors ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                      {p.description || "Take a look at what we offer and book your spot today for the best experience."}
                    </p>

                    <Link
                      to={`/booking/${p.id}`}
                      className={`mt-auto py-4 rounded-2xl border font-black uppercase tracking-widest text-sm text-center transition-all duration-300 shadow-xl
                        ${isDark ? 'bg-white/5 border-white/10 text-white hover:bg-white hover:text-slate-950' : 'bg-slate-900 border-slate-900 text-white hover:bg-blue-600 hover:border-blue-600'}`}
                    >
                      Check Availability
                    </Link>
                  </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-32 text-center rounded-[3rem] border shadow-2xl
                ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-slate-200/20'}">
                <div className="text-6xl mb-6 opacity-20">🏢</div>
                <h3 className={`text-2xl font-black uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>No providers found</h3>
                <Link to="/services" className="inline-block mt-6 text-blue-500 font-black uppercase tracking-widest text-sm hover:underline">Try another category →</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviders;
