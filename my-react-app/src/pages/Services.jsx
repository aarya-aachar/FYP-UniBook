import { useNavigate, Link } from "react-router-dom";
import UserNavbar from "../components/UserNavbar";
import { useEffect } from "react";
import { useUserTheme } from "../context/UserThemeContext";
import { Utensils, Activity, Hospital, Sparkles, ArrowRight } from "lucide-react";

const services = [
  {
    name: "Restaurants",
    description: "Explore top-tier dining and reserve your table instantly at the city's finest spots.",
    icon: Utensils,
    color: "text-emerald-500",
    bgHover: "hover:bg-emerald-50",
    darkBgHover: "hover:bg-emerald-500/10"
  },
  {
    name: "Futsal",
    description: "Book professional courts and enjoy the competitive edge with your team.",
    icon: Activity,
    color: "text-emerald-500",
    bgHover: "hover:bg-emerald-50",
    darkBgHover: "hover:bg-emerald-500/10"
  },
  {
    name: "Hospitals",
    description: "Seamlessly schedule appointments with trusted healthcare providers.",
    icon: Hospital,
    color: "text-emerald-500",
    bgHover: "hover:bg-emerald-50",
    darkBgHover: "hover:bg-emerald-500/10"
  },
  {
    name: "Salon / Spa",
    description: "Relax and pamper yourself with premium wellness and beauty services.",
    icon: Sparkles,
    color: "text-emerald-500",
    bgHover: "hover:bg-emerald-50",
    darkBgHover: "hover:bg-emerald-500/10"
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
    <div className={`flex flex-col min-h-screen transition-all duration-500 font-inter user-panel-bg ${isDark ? 'dark' : 'light'}`}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative transition-all duration-300">
        <div className="max-w-7xl mx-auto w-full pt-16 relative z-10">
          <div className="mb-12">
            <div className="glass-header">
              <h1 className={`text-4xl font-bold mb-2 tracking-tight transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Choose a Category
              </h1>
              <p className={`text-base font-medium transition-colors ${isDark ? 'text-slate-300' : 'text-slate-600'} max-w-2xl`}>
                Pick a service to find the best providers near you. Explore top-rated places and book instantly.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {services.map((service, i) => {
              const Icon = service.icon;
              return (
              <div
                key={service.name}
                onClick={() => navigate(`/services/${encodeURIComponent(service.name)}`)}
                className={`group cursor-pointer relative rounded-2xl p-6 transition-all duration-200 shadow-sm hover:-translate-y-[2px] hover:shadow-md border glass-card`}
              >
                
                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-6 transition-transform duration-200
                    ${isDark ? 'bg-slate-700/50 border-slate-600' : 'bg-slate-50 border-slate-200'} ${service.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className={`text-xl font-bold mb-3 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {service.name}
                  </h2>
                  <p className={`text-sm leading-relaxed mb-6 transition-colors ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    {service.description}
                  </p>

                  <div className={`flex items-center gap-2 text-sm font-medium transition-all duration-200
                    ${isDark ? 'text-emerald-400 group-hover:text-emerald-300' : 'text-emerald-600 group-hover:text-emerald-700'}`}>
                    View Options <ArrowRight className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            )})}
          </div>

          <div className={`mt-16 p-8 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300
            ${isDark ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/20' : 'bg-white border-slate-200 shadow-xl'}`}>
            <div>
              <h2 className={`text-xl font-bold mb-2 transition-colors ${isDark ? 'text-white' : 'text-slate-900'}`}>Need to check your bookings?</h2>
              <p className={`text-sm transition-colors ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                Visit your dashboard to see all your active and past appointments.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-medium text-sm shadow-sm hover:bg-emerald-700 hover:shadow shadow-emerald-500/20 transition-all cursor-pointer whitespace-nowrap"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Services;
