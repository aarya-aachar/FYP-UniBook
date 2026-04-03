import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserNavbar from "../components/UserNavbar";
import { useUserTheme } from "../context/UserThemeContext";
import { ArrowLeft, MapPin } from "lucide-react";

const ServiceDetails = () => {
  const { userTheme } = useUserTheme();
  const isDark = userTheme === 'dark';
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fallback demo data if provider not found in DB or for rapid prototyping
  const demoServiceDetails = {
    1: { name: 'City Hospital', description: 'General hospital offering a wide range of services.', address: '123 Health Ave', image: '/images/hospital1.jpg', category: 'Hospitals' },
    2: { name: 'Downtown Futsal', description: 'High quality turf, open 24/7.', address: '456 Sports St', image: '/images/futsal1.jpg', category: 'Futsal' },
    3: { name: 'Gourmet Restaurant', description: 'Fine dining with international cuisine.', address: '789 Food Court', image: '/images/restaurant1.jpg', category: 'Restaurants' },
    4: { name: 'Relax Spa', description: 'Premium wellness and beauty solutions.', address: '101 Beauty Blvd', image: '/images/salon1.jpg', category: 'Salon / Spa' },
  };

  useEffect(() => {
    const fetchProvider = async () => {
       // In a real app we'd fetch from /api/providers/:id
       // Simulating for now
       setProvider(demoServiceDetails[providerId] || demoServiceDetails[1]);
       setLoading(false);
    };
    fetchProvider();
    document.title = "Provider Details | UniBook";
  }, [providerId]);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-500
      ${isDark ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="font-black uppercase tracking-widest text-xs opacity-50">Securely Loading...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      
      <UserNavbar />

      <main className="flex-1 overflow-y-auto px-6 md:px-10 py-12 relative flex flex-col items-center transition-all duration-300">
        <div className={`absolute top-0 right-0 w-full h-96 bg-gradient-to-b opacity-50 pointer-events-none transition-all duration-300
          ${isDark ? 'from-indigo-900/10 to-transparent' : 'from-indigo-50 to-transparent'}`} />

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <div className="max-w-7xl mx-auto w-full fade-in pt-4">
          
          {/* Breadcrumbs */}
          <button onClick={() => navigate(-1)} 
            className={`flex items-center gap-2 transition-colors font-medium mb-8 group cursor-pointer
              ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back
          </button>

          <div className={`relative group border rounded-2xl p-8 md:p-10 shadow-sm transition-all duration-200
            ${isDark ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            
            {/* Image Banner Section */}
            <div className={`relative w-full h-[400px] rounded-2xl overflow-hidden mb-10 shadow-sm border transition-all
              ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <img 
                src={provider.image} 
                alt={provider.name} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
              />
              <div className={`absolute inset-0 bg-gradient-to-t opacity-70 transition-colors
                ${isDark ? 'from-slate-900 via-slate-900/40 to-transparent' : 'from-slate-900/60 via-transparent to-transparent'}`} />
              
              <div className="absolute bottom-8 left-8">
                 <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 text-slate-800 text-xs font-semibold tracking-wide shadow-sm">
                   {provider.category}
                 </span>
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-6">
              <h1 className={`text-4xl font-bold tracking-tight transition-colors
                ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {provider.name}
              </h1>
              
              <div className={`flex items-center gap-2 font-medium text-base transition-colors
                ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                 <MapPin className="w-5 h-5 opacity-70" /> {provider.address}
              </div>

              <div className={`p-6 md:p-8 rounded-xl border transition-all
                ${isDark ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <p className={`text-base leading-relaxed transition-colors
                  ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {provider.description}
                </p>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center gap-4">
                <Link
                  to={`/booking/${providerId}`}
                  className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm transition-all focus:ring-2 focus:ring-blue-500 text-center cursor-pointer shadow-sm
                    ${isDark ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  Book Appointment
                </Link>
                <Link
                   to="/services"
                   className={`w-full sm:w-auto px-8 py-3 rounded-xl border font-semibold text-sm transition-all text-center cursor-pointer shadow-sm
                     ${isDark ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                   Explore More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServiceDetails;
