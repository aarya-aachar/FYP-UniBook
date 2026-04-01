import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { getProviders } from "../services/providerService";

const BACKEND_URL = 'http://localhost:4001';

const CAT_CONFIG = {
  'Restaurants': { icon: '🍽️', gradient: 'from-orange-500/20 to-red-500/10', color: 'text-orange-400' },
  'Futsal':      { icon: '⚽', gradient: 'from-blue-500/20 to-indigo-500/10', color: 'text-blue-400' },
  'Hospitals':   { icon: '🏥', gradient: 'from-emerald-500/20 to-teal-500/10', color: 'text-emerald-400' },
  'Salon / Spa': { icon: '💆', gradient: 'from-purple-500/20 to-pink-500/10', color: 'text-purple-400' },
};

const ServiceProviders = () => {
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
    document.title = `${serviceName} Providers | UniBook`;
  }, [serviceName]);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <UserSidebar />

      <div className="flex-1 overflow-y-auto px-10 py-12 relative">
        {/* Background Decor */}
        <div className="absolute top-[10%] left-[20%] w-96 h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none" />

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>

        <div className="max-w-6xl mx-auto w-full fade-in pt-4">
          {/* Header / Breadcrumbs */}
          <div className="mb-12">
            <button onClick={() => navigate('/services')} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold mb-6 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Services
            </button>
            
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center text-4xl shadow-2xl">
                {cfg.icon}
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight">{serviceName}</h1>
                <p className="text-white/40 text-lg font-medium mt-2">
                  {providers.length} premium providers available for booking
                </p>
              </div>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 [animation-delay:100ms]">
            {loading ? (
               [1,2,3,4].map(i => (
                 <div key={i} className="h-64 rounded-[2.5rem] bg-white/5 border border-white/10 animate-pulse" />
               ))
            ) : providers.length > 0 ? (
              providers.map((p) => {
                const imgSrc = p.image ? (p.image.startsWith('/uploads') ? `${BACKEND_URL}${p.image}` : p.image) : null;
                
                return (
                  <div
                    key={p.id}
                    className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-8 flex flex-col hover:border-white/20 transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden"
                  >
                    {/* Image Background */}
                    {imgSrc && (
                      <div className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none">
                        <img src={imgSrc} alt={p.name} className="w-full h-full object-cover mix-blend-overlay" />
                      </div>
                    )}
                    
                    <div className={`absolute inset-0 bg-gradient-to-br ${cfg.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                    
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between mb-6">
                        {imgSrc ? (
                          <div className="w-14 h-14 rounded-2xl border border-white/10 overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-500">
                             <img src={imgSrc} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/80 font-black text-xl group-hover:bg-white group-hover:text-slate-950 transition-all duration-500">
                            {p.name.charAt(0)}
                          </div>
                        )}
                        
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 bg-white/5 ${cfg.color}`}>
                          Featured
                        </span>
                      </div>

                    <h2 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">
                      {p.name}
                    </h2>

                    <p className="text-white/60 mb-4 flex items-center gap-2 text-sm font-medium">
                      <span className="opacity-40 text-lg">📍</span> {p.address}
                    </p>
                    
                    <p className="text-white/60 mb-8 text-sm leading-relaxed line-clamp-3 font-medium">
                      {p.description || "Discover high-quality services and professional care at our location. Book your appointment now for a seamless experience."}
                    </p>

                    <Link
                      to={`/booking/${p.id}`}
                      className="mt-auto py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs text-center hover:bg-white hover:text-slate-950 transition-all duration-300 shadow-xl"
                    >
                      Check Availability
                    </Link>
                  </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full py-32 text-center bg-white/5 border border-white/10 rounded-[3rem]">
                <div className="text-6xl mb-6 opacity-20">🏢</div>
                <h3 className="text-2xl font-bold text-white/40">No providers found in this category</h3>
                <Link to="/services" className="inline-block mt-6 text-blue-400 font-bold hover:underline">Explore other services</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceProviders;

