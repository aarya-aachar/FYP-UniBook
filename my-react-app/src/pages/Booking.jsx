import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import UserSidebar from "../components/UserSidebar";
import { getProviderById } from "../services/providerService";

const Booking = () => {
  const { providerId } = useParams();
  const navigate = useNavigate();
  const [provider, setProvider] = useState(null);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const data = await getProviderById(providerId);
        setProvider(data);
      } catch (err) {
        console.error("Failed to fetch provider details", err);
      }
    };
    fetchProvider();
  }, [providerId]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!date || !time) {
      alert("Please select date and time");
      return;
    }

    // ❗ DO NOT confirm booking here
    // Redirect to payment page
    navigate(`/payment/${providerId}`, {
      state: { date, time, price: provider?.base_price || 0 }
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />

      <div className="flex-1 px-6 py-12">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold mb-2">
              Book Your Appointment
            </h1>
            <p className="text-gray-600">
              Choose your preferred date and time
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">

            {/* Provider Info */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">
                Provider Details
              </h2>

              <div className="space-y-2 text-gray-600">
                <p>
                  🆔 Provider ID:
                  <span className="font-semibold ml-1">
                    {providerId}
                  </span>
                </p>
                <p>⭐ Rating: 4.5 / 5</p>
                <p>📍 Location: {provider?.address || 'Kathmandu, Nepal'}</p>
                <p className="font-semibold text-blue-700">
                  Price: Rs. {provider?.base_price || '0.00'}
                </p>
              </div>
            </div>

            {/* Booking Form */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6 text-center">
                Appointment Details
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label className="block font-semibold mb-1">
                    Select Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">
                    Select Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
                >
                  Proceed to Payment
                </button>

              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
