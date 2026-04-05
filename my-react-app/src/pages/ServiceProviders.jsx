import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import { getProviders } from "../services/providerService";
import { useUserTheme } from "../context/UserThemeContext";
import { Utensils, Activity, Hospital, Sparkles, MapPin, Star, Building, ArrowLeft } from "lucide-react";

const BACKEND_URL = 'http://localhost:4001';

const CAT_CONFIG = {
  'Restaurants': { 
    icon: Utensils, 
    color: 'text-emerald-500',
    bgLight: 'bg-emerald-50',
    bgDark: 'bg-emerald-500/10'
  },
  'Futsal': { 
    icon: Activity, 
    color: 'text-teal-500',
    bgLight: 'bg-teal-50',
    bgDark: 'bg-teal-500/10'
  },
  'Hospitals': { 
    icon: Hospital, 
    color: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    bgDark: 'bg-emerald-600/10'
  },
  'Salon / Spa': { 
    icon: Sparkles, 
    color: 'text-teal-600',
    bgLight: 'bg-teal-50',
    bgDark: 'bg-teal-600/10'
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
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #020617 0%, #064e3b 50%, #020617 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #ecfdf5 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-300">
        <div className={`absolute top-0 left-0 w-full h-96 bg-gradient-to-b opacity-50 pointer-events-none transition-all duration-300
          ${isDark ? 'from-emerald-900/10 to-transparent' : 'from-emerald-50 to-transparent'}`} />

        <div className="max-w-7xl mx-auto w-full pt-4 relative z-10">
          <div className="mb-10">
            <button onClick={() => navigate('/services')} className={`flex items-center gap-2 transition-colors font-medium mb-6 group cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Services
            </button>
            
            <div className="flex items-center gap-6">
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center shadow-sm transition-all
                ${isDark ? `bg-slate-800 border-slate-700 ${cfg.color}` : `bg-white border-slate-200 ${cfg.color}`}`}>
                <cfg.icon className="w-8 h-8" />
              </div>
              <div>
                <h1 className={`text-3xl font-bold tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Recommended {serviceName}</h1>
                <p className={`text-base mt-1 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  We found {providers.length} top-rated options for you
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
               [1,2,3,4].map(i => (
                 <div key={i} className={`h-64 rounded-2xl border animate-pulse ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-100 border-slate-200'}`} />
               ))
            ) : providers.length > 0 ? (
              providers.map((p) => {
                const imgSrc = p.image ? (p.image.startsWith('/uploads') ? `${BACKEND_URL}${p.image}` : p.image) : null;
                
                return (
                  <div
                    key={p.id}
                    className={`group relative rounded-2xl p-6 flex flex-col transition-all duration-200 shadow-sm hover:-translate-y-[2px] hover:shadow-md border overflow-hidden
                      ${isDark ? 'bg-slate-800/50 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    {imgSrc && (
                      <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 pointer-events-none">
                        <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-5">
                        {imgSrc ? (
                          <div className={`w-14 h-14 rounded-xl border overflow-hidden shadow-sm transition-transform duration-300 
                            ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                             <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className={`w-14 h-14 rounded-xl border flex items-center justify-center font-bold text-xl transition-all duration-300
                            ${isDark ? `bg-slate-700 border-slate-600 text-slate-300 ${cfg.bgDark}` : `bg-slate-50 border-slate-200 text-slate-500 ${cfg.bgLight}`}`}>
                            {p.name.charAt(0)}
                          </div>
                        )}
                        
                        <div className="flex flex-col items-end gap-2">
                           <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider border transition-colors 
                             ${isDark ? `border-slate-700 bg-slate-800 ${cfg.color}` : `border-slate-200 bg-slate-50 text-slate-700`}`}>
                             Featured
                           </span>
                           {p.review_count > 0 && (
                             <div className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors
                               ${isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' : 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm'}`}>
                               <Star className="w-3 h-3 fill-current" />
                               <span className="text-xs font-semibold">{p.average_rating} ({p.review_count})</span>
                             </div>
                           )}
                        </div>
                      </div>

                    <h2 className={`text-xl font-bold mb-2 transition-colors group-hover:text-emerald-500 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {p.name}
                    </h2>

                    <p className={`mb-3 flex items-center gap-1.5 text-sm transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <MapPin className="w-4 h-4 opacity-70" /> {p.address}
                    </p>
                    
                    <p className={`mb-6 text-sm leading-relaxed line-clamp-3 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {p.description || "Take a look at what we offer and book your spot today for the best experience."}
                    </p>

                    <Link
                      to={`/booking/${p.id}`}
                      className={`mt-auto py-2.5 rounded-lg border font-semibold text-sm text-center transition-all duration-200 shadow-sm cursor-pointer
                        ${isDark ? 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                    >
                      Check Availability
                    </Link>
                  </div>
                  </div>
                );
              })
            ) : (
              <div className={`col-span-full py-20 text-center rounded-2xl border shadow-sm
                ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <Building className="w-16 h-16 mx-auto mb-4 text-slate-400 opacity-50" />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>No providers found</h3>
                <Link to="/services" className="inline-flex items-center gap-2 mt-4 text-emerald-500 font-medium text-sm hover:underline cursor-pointer">
                  Try another category <ArrowLeft className="w-4 h-4 rotate-180" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceProviders;
