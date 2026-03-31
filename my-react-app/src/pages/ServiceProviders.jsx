import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";

import { getProviders } from "../services/providerService";

const ServiceProviders = () => {
  const { serviceName } = useParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        // Ensure "Salon/Spas" matches "Salon / Spa" from DB if needed, but let's query as is or fetch all and filter.
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
  }, [serviceName]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />

      <div className="flex-1">
        {/* Header */}
        <div className="bg-white shadow-sm py-10 px-6 text-center">
          <h1 className="text-4xl font-extrabold mb-2">
            {serviceName} Providers
          </h1>
          <p className="text-gray-600">
            Choose a provider and proceed with booking
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {providers.length} providers available
          </p>
        </div>

        {/* Providers */}
        <div className="max-w-6xl mx-auto px-6 py-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <p className="text-gray-500 text-center col-span-full">Loading providers...</p>
          ) : providers.length > 0 ? (
            providers.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 p-6 flex flex-col"
              >
                <div className="mb-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg mb-3">
                    {provider.name.charAt(0)}
                  </div>

                  <h2 className="text-xl font-bold mb-1">
                    {provider.name}
                  </h2>

                  <p className="text-gray-600 mb-2">
                    📍 {provider.address}
                  </p>
                  <p className="text-gray-500 mb-2 text-sm line-clamp-2">
                    {provider.description}
                  </p>
                </div>

                <Link
                  to={`/booking/${provider.id}`}
                  className="mt-auto bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                >
                  Book Now
                </Link>
              </div>
            ))
          ) : (
            <p className="text-gray-600 col-span-full text-center">
              No providers available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceProviders;
