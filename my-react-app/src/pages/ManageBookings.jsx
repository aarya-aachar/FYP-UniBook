import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { getAllBookings, updateBookingStatus } from '../services/bookingService';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      setBookings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await updateBookingStatus(id, status);
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  }

  const getStatusClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 py-12 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">Manage Bookings</h1>
        <div className="grid gap-6">
          {loading ? (
             <p className="text-center text-gray-500">Loading bookings...</p>
          ) : bookings.length === 0 ? (
             <p className="text-center text-gray-500">No bookings found.</p>
          ) : bookings.map(b => (
            <div key={b.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{b.user_name} ({b.user_email})</h3>
                <p className="text-gray-600">{b.provider_name} ({b.category})</p>
                <p className="text-gray-500">Date: {new Date(b.booking_date).toLocaleDateString()} | Time: {b.booking_time}</p>
                <span className={`inline-block px-3 py-1 mt-2 rounded-full text-sm font-medium uppercase ${getStatusClass(b.status)}`}>
                  {b.status}
                </span>
              </div>
              <div className="flex flex-col space-y-2">
                {b.status !== 'confirmed' && (
                  <button 
                    onClick={() => updateStatus(b.id, 'confirmed')} 
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                  >
                    Confirm
                  </button>
                )}
                {b.status !== 'cancelled' && (
                  <button 
                    onClick={() => updateStatus(b.id, 'cancelled')} 
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageBookings;
