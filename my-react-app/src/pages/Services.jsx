import { Link } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";

const services = [
  {
    name: "Restaurants",
    description: "Explore top restaurants and reserve your table instantly.",
    img: "/images/restaurant1.jpg",
    gradient: "from-orange-400 to-red-500",
  },
  {
    name: "Futsal",
    description: "Book futsal courts and enjoy the game with your team.",
    img: "/images/futsal1.jpg",
    gradient: "from-green-400 to-emerald-600",
  },
  {
    name: "Hospitals",
    description: "Schedule appointments with trusted hospitals easily.",
    img: "/images/hospital1.jpg",
    gradient: "from-blue-400 to-indigo-600",
  },
  {
    name: "Salon/Spas",
    description: "Relax and pamper yourself with top salons & spas.",
    img: "/images/salon1.jpg",
    gradient: "from-pink-400 to-purple-600",
  },
];

const Services = () => {
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <UserSidebar />

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-6 text-center">
          <h1 className="text-5xl font-extrabold mb-4">
            Discover Our Services
          </h1>
          <p className="text-lg max-w-2xl mx-auto">
            UniBook lets you book appointments across multiple services —
            restaurants, futsal, hospitals, and salons — all in one place.
          </p>
        </div>

        {/* Services Section */}
        <div className="max-w-7xl mx-auto py-16 px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {services.map((service) => (
              <Link
                key={service.name}
                to={`/services/${service.name}`}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 overflow-hidden"
              >
                {/* Image */}
                <img
                  src={service.img}
                  alt={service.name}
                  className="h-48 w-full object-cover"
                />

                {/* Gradient Overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${service.gradient} opacity-0 group-hover:opacity-80 transition`}
                />

                {/* Content */}
                <div className="relative p-6 text-center">
                  <h2 className="text-2xl font-bold mb-2">
                    {service.name}
                  </h2>
                  <p className="text-gray-600 group-hover:text-white transition">
                    {service.description}
                  </p>

                  <span className="inline-block mt-4 px-6 py-2 rounded-full bg-blue-600 text-white font-semibold group-hover:bg-white group-hover:text-blue-600 transition">
                    View Providers
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Book Your Appointment?
          </h2>
          <p className="text-gray-600 mb-6">
            Choose a service and find the best provider near you.
          </p>
          <Link
            to="/dashboard/user"
            className="inline-block bg-blue-600 text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Services;
