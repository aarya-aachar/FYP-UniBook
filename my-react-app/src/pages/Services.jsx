import { Link, useNavigate } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";
import { useEffect } from "react";

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
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Explore Services | UniBook";
  }, []);

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      {/* Sidebar */}
      <UserSidebar />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-10 py-12 relative">
        {/* Background Decor */}
        <div className="absolute top-[10%] right-[10%] w-96 h-96 bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        `}</style>

        {/* Hero Section */}
        <div className="mb-16 fade-in">
          <h1 className="text-5xl font-black mb-4 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
            Discover Our Services
          </h1>
          <p className="text-xl text-white/40 max-w-2xl leading-relaxed">
            UniBook gives you instant access to a diverse ecosystem of lifestyle services. 
            Choose a category to find premium providers near you.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8 fade-in [animation-delay:100ms]">
          {services.map((service, idx) => (
            <div
              key={service.name}
              onClick={() => navigate(`/services/${service.name}`)}
              className="group cursor-pointer relative bg-white/5 backdrop-blur-md border border-white/10 rounded-[2.5rem] p-10 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 shadow-2xl overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform duration-500">
                  {service.icon}
                </div>
                <h2 className="text-2xl font-bold mb-4 group-hover:text-blue-400 transition-colors">
                  {service.name}
                </h2>
                <p className="text-white/40 leading-relaxed font-medium mb-8">
                  {service.description}
                </p>

                <div className="flex items-center gap-2 text-sm font-black text-blue-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-[-10px] group-hover:translate-x-0">
                  Explore Providers <span>→</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 p-12 rounded-[3.5rem] bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border border-white/10 text-center fade-in [animation-delay:200ms]">
          <h2 className="text-3xl font-black mb-4">Ready to manage your appointments?</h2>
          <p className="text-white/40 mb-10 max-w-xl mx-auto font-medium">
            Track your history, view reports, and manage all your bookings from your personal user dashboard.
          </p>
          <Link
            to="/dashboard/user"
            className="inline-block px-10 py-5 rounded-2xl bg-white text-slate-950 font-black uppercase tracking-widest text-sm hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl shadow-white/5"
          >
            Go to User Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Services;

