import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import UserSidebar from "../components/UserSidebar";
import { createBooking } from "../services/bookingService";

const Payment = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { date, time } = location.state || {};

  const handlePaymentSuccess = async () => {
    if (!date || !time) {
      setError("Missing appointment date or time. Please go back.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await createBooking({
        provider_id: providerId,
        booking_date: date,
        booking_time: time,
        notes: "Paid via QR scan"
      });
      alert("Payment successful! Booking confirmed.");
      navigate(`/dashboard/user/appointments`);
    } catch (err) {
      setError(err.message || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 px-6 py-12 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">

          <h1 className="text-3xl font-bold text-center mb-4">
            Complete Payment
          </h1>

          <p className="text-center text-gray-600 mb-6">
            Scan the QR code below to complete your payment
          </p>

          {/* QR IMAGE */}
          <div className="flex justify-center mb-6">
            <img
              src="/images/qr.png"
              alt="Payment QR"
              className="w-56 h-56 object-contain border rounded-lg"
            />
          </div>

          {/* Payment Info */}
          <div className="text-center text-gray-600 mb-6">
            <p>Provider ID: <strong>{providerId}</strong></p>
            {date && <p>Date: <strong>{date}</strong>, Time: <strong>{time}</strong></p>}
            <p>Amount: <strong>Rs. {location.state?.price || '0'}</strong></p>
            <p className="text-sm text-gray-500 mt-2">
              (Demo payment – frontend only)
            </p>
          </div>

          {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

          {/* Confirm Button */}
          <button
            onClick={handlePaymentSuccess}
            disabled={loading}
            className={`w-full text-white py-3 rounded-lg transition font-semibold ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'Processing...' : 'Submit payment'}
          </button>

        </div>
      </div>
    </div>
  );
};

export default Payment;
