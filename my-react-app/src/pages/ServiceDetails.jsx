import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { useUserTheme } from "../context/UserThemeContext";

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
    <div className="flex min-h-screen transition-all duration-500 font-inter"
         style={{ background: isDark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <UserSidebar />
      
      <div className="flex-1 overflow-y-auto px-10 py-12 relative flex flex-col items-center transition-all duration-500">
        {/* Background Ambient Decor */}
        <div className={`absolute top-[10%] right-[10%] w-[500px] h-[500px] blur-[150px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-blue-600/10' : 'bg-blue-400/5'}`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] blur-[150px] rounded-full pointer-events-none transition-all duration-500
          ${isDark ? 'bg-purple-600/10' : 'bg-purple-400/5'}`} />

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <div className="max-w-4xl w-full fade-in pt-4">
          
          {/* Breadcrumbs */}
          <button onClick={() => navigate(-1)} 
            className={`flex items-center gap-2 transition-colors font-bold mb-8 group
              ${isDark ? 'text-white/40 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
          </button>

          <div className={`relative group border rounded-[3rem] p-12 shadow-2xl overflow-hidden transition-all duration-500 backdrop-blur-md
            ${isDark ? 'bg-white/5 border-white/10 hover:border-white/20' : 'bg-white border-slate-200 hover:border-blue-200'}`}>
            
            {/* Image Banner Section */}
            <div className={`relative w-full h-[400px] rounded-[2rem] overflow-hidden mb-12 shadow-2xl border transition-all
              ${isDark ? 'border-white/10' : 'border-slate-100'}`}>
              <img 
                src={provider.image} 
                alt={provider.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className={`absolute inset-0 bg-gradient-to-t opacity-60 transition-colors
                ${isDark ? 'from-[#0f172a] via-transparent to-transparent' : 'from-slate-900/40 via-transparent to-transparent'}`} />
              
              <div className="absolute bottom-10 left-10">
                 <span className="px-4 py-2 rounded-full bg-blue-600 text-white text-xs font-black uppercase tracking-widest shadow-xl">
                   {provider.category}
                 </span>
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-6">
              <h1 className={`text-4xl font-black tracking-tight leading-none transition-colors
                ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {provider.name}
              </h1>
              
              <div className={`flex items-center gap-4 font-bold text-lg transition-colors
                ${isDark ? 'text-white/40' : 'text-slate-600'}`}>
                 <span className="opacity-60">📍</span> {provider.address}
              </div>

              <div className={`p-8 rounded-[2rem] border transition-all
                ${isDark ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                <p className={`text-lg leading-relaxed font-medium transition-colors
                  ${isDark ? 'text-white/60' : 'text-slate-600'}`}>
                  {provider.description}
                </p>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
                <Link
                  to={`/booking/${providerId}`}
                  className={`w-full sm:w-auto px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all text-center
                    ${isDark ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/20 hover:scale-105' : 'bg-blue-600 text-white shadow-xl hover:bg-blue-700'}`}
                >
                  Book Secure Appointment
                </Link>
                <Link
                   to="/services"
                   className={`w-full sm:w-auto px-10 py-5 rounded-2xl border font-black uppercase tracking-[0.2em] text-xs transition-all text-center
                     ${isDark ? 'bg-white/5 border-white/10 text-white/60 hover:bg-white hover:text-slate-950' : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-900 hover:text-white'}`}
                >
                   Explore More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
