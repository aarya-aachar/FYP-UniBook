import { useParams, Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';

const BookingConfirmation = () => {
  const { id } = useParams();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="bg-white p-10 rounded-xl shadow-lg max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-4 text-green-600">Booking Confirmed!</h1>
          <p className="text-gray-700 mb-6">Your appointment (ID: {id}) has been successfully booked.</p>
          <Link
            to="/dashboard/user"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
