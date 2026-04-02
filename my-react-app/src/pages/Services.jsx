import { useNavigate, Link } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";
import { useEffect } from "react";
import { useUserTheme } from "../context/UserThemeContext";

const services = [
  {
    name: "Restaurants",
    description: "Explore top-tier dining and reserve your table instantly at the city's finest spots.",
    icon: "🍽️",
    gradient: "from-orange-400 to-red-500",
  },
  {
    name: "Futsal",
    description: "Book professional courts and enjoy the competitive edge with your team.",
    icon: "⚽",
    gradient: "from-blue-400 to-indigo-600",
  },
  {
    name: "Hospitals",
    description: "Seamlessly schedule appointments with trusted healthcare providers.",
    icon: "🏥",
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    name: "Salon / Spa",
    description: "Relax and pamper yourself with premium wellness and beauty services.",
    icon: "💆",
    gradient: "from-purple-400 to-pink-600",
  },
];

const Services = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Explore Services | UniBook";
  }, []);

  return (
    <div className="flex min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <UserSidebar />

      <div className="flex-1 overflow-y-auto px-10 py-12 relative transition-all duration-500">
        <div className={`absolute top-[10%] right-[10%] w-96 h-96 blur-[120px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>

        <div className="max-w-6xl mx-auto w-full fade-in pt-4">
          <div className="mb-16">
            <h1 className={`text-4xl font-black mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Choose a Category
            </h1>
            <p className={`text-lg transition-colors font-medium ${isDark ? 'text-white/40' : 'text-slate-600'} max-w-2xl leading-relaxed`}>
              Pick a service to find the best providers near you. Explore top-rated places and book instantly.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
            {services.map((service) => (
              <div
                key={service.name}
                onClick={() => navigate(`/services/${encodeURIComponent(service.name)}`)}
                className={`group cursor-pointer relative rounded-[2.5rem] p-10 transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden border
                  ${isDark ? 'bg-white/5 backdrop-blur-md border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-blue-200 shadow-slate-200/20'}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-500
                    ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100'}`}>
                    {service.icon}
                  </div>
                  <h2 className={`text-2xl font-black mb-4 group-hover:text-blue-500 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {service.name}
                  </h2>
                  <p className={`text-sm leading-relaxed font-bold mb-8 transition-colors ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
                    {service.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-black text-blue-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                    View Options <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-20 p-12 rounded-[3.5rem] border text-center transition-all duration-500
            ${isDark ? 'bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border-white/10' : 'bg-blue-50 border-blue-100/50'}`}>
            <h2 className={`text-2xl font-black mb-4 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Need to check your bookings?</h2>
            <p className={`text-sm mb-10 max-w-xl mx-auto font-bold transition-colors ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
              Visit your dashboard to see all your active and past appointments. You can also edit your profile and settings there.
            </p>
            <Link
              to="/dashboard/user"
              className="inline-block px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Services;
