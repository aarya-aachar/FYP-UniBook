import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";

const ServiceDetails = () => {
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

  if (loading) return <div className="min-h-screen bg-[#0f172a] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-white">
      <UserSidebar />
      
      <div className="flex-1 overflow-y-auto px-10 py-12 relative flex flex-col items-center">
        {/* Background Ambient Decor */}
        <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none" />

        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          .fade-in { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>

        <div className="max-w-4xl w-full fade-in pt-4">
          
          {/* Breadcrumbs */}
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-white/40 hover:text-white transition-colors font-bold mb-8 group">
            <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
          </button>

          <div className="relative group bg-white/5 backdrop-blur-md border border-white/10 rounded-[3rem] p-12 shadow-2xl overflow-hidden transition-all duration-500 hover:border-white/20">
            {/* Image Banner Section */}
            <div className="relative w-full h-[400px] rounded-[2rem] overflow-hidden mb-12 shadow-2xl border border-white/10">
              <img 
                src={provider.image} 
                alt={provider.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-60" />
              
              <div className="absolute bottom-10 left-10">
                 <span className="px-4 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                   {provider.category}
                 </span>
              </div>
            </div>

            {/* Typography Section */}
            <div className="space-y-6">
              <h1 className="text-4xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/40">
                {provider.name}
              </h1>
              
              <div className="flex items-center gap-4 text-white/40 font-bold text-lg">
                 <span className="opacity-60">📍</span> {provider.address}
              </div>

              <div className="p-8 rounded-[2rem] bg-white/5 border border-white/10">
                <p className="text-white/60 text-lg leading-relaxed font-medium">
                  {provider.description}
                </p>
              </div>

              <div className="pt-8 flex flex-col sm:flex-row items-center gap-6">
                <Link
                  to={`/booking/${providerId}`}
                  className="w-full sm:w-auto px-12 py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-blue-500/20 hover:scale-105 transition-all text-center"
                >
                  Book Secure Appointment
                </Link>
                <Link
                   to="/services"
                   className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-white/5 border border-white/10 text-white/60 font-black uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-slate-950 transition-all text-center"
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
