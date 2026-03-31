import { useParams, Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';

const demoServiceDetails = {
  1: { name: 'KMC Hospital', description: 'Top hospital in Kathmandu', address: 'Kathmandu', image: '/images/hospital1.jpg' },
  2: { name: 'Teaching Hospital', description: 'Famous teaching hospital', address: 'Kathmandu', image: '/images/hospital1.jpg' },
  3: { name: 'Spice Garden', description: 'Best restaurant', address: 'Kathmandu', image: '/images/restaurant1.jpg' },
  4: { name: 'Foodies', description: 'Delicious food', address: 'Lalitpur', image: '/images/restaurant1.jpg' },
  5: { name: 'City Futsal Arena', description: 'Futsal courts', address: 'Kathmandu', image: '/images/futsal1.jpg' },
  6: { name: 'Beauty Bliss', description: 'Top salon/spa', address: 'Kathmandu', image: '/images/salon1.jpg' },
};

const ServiceDetails = () => {
  const { providerId } = useParams();
  const provider = demoServiceDetails[providerId];

  if (!provider) return <p className="p-6">Provider not found</p>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* User Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 py-12 px-6">
        <div className="bg-white shadow rounded-lg p-6 max-w-3xl mx-auto">
          <img src={provider.image} alt={provider.name} className="w-full h-64 object-cover rounded mb-4" />
          <h1 className="text-3xl font-bold mb-2">{provider.name}</h1>
          <p className="mb-2 text-gray-600">{provider.address}</p>
          <p className="mb-4">{provider.description}</p>
          <Link
            to={`/booking/${providerId}`}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
          >
            Book Appointment
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetails;
