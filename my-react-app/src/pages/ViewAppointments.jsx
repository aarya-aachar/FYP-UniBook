import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import UserSidebar from '../components/UserSidebar';
import { getUserBookings, updateBookingStatus } from '../services/bookingService';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getUserBookings();
      setAppointments(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    if(!window.confirm("Are you sure you want to cancel?")) return;
    try {
      await updateBookingStatus(id, 'cancelled');
      setAppointments(
        appointments.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
      );
    } catch (err) {
      alert("Failed to cancel booking.");
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* User Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 py-12 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">My Appointments</h1>
        <div className="space-y-4">
          {loading ? (
             <p className="text-center text-gray-500">Loading appointments...</p>
          ) : appointments.length === 0 ? (
             <p className="text-center text-gray-500">No appointments found.</p>
          ) : appointments.map(a => (
            <div key={a.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-md border-l-4 border-blue-500">
              <div>
                <h3 className="font-semibold text-lg">{a.category} - {a.provider_name}</h3>
                <p className="text-sm text-gray-600">Date: {new Date(a.booking_date).toLocaleDateString()} | Time: {a.booking_time}</p>
                <p className="text-sm mt-1">Status: <span className={`uppercase font-bold ${a.status === 'confirmed' ? 'text-green-600' : a.status === 'cancelled' ? 'text-red-600' : 'text-yellow-500'}`}>{a.status}</span></p>
              </div>
              <div className="flex flex-col space-y-2">
                {a.status !== 'cancelled' && (
                  <button onClick={() => cancelAppointment(a.id)} 
                    className="bg-red-50 text-red-600 hover:bg-red-100 font-semibold px-4 py-2 rounded-lg transition border border-red-200">
                    Cancel
                  </button>
                )}
                <Link to={`/services`} 
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition text-center font-semibold">
                  New Booking
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewAppointments;
