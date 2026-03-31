import { useState } from "react";
import UserSidebar from "../components/UserSidebar";

// Demo monthly report data (frontend only)
const demoReports = [
  {
    id: 1,
    month: "September 2025",
    service: "Hospital",
    provider: "KMC Hospital",
    date: "2025-09-12",
    time: "10:00 AM",
    price: 1500,
  },
  {
    id: 2,
    month: "September 2025",
    service: "Restaurant",
    provider: "Spice Garden",
    date: "2025-09-18",
    time: "7:00 PM",
    price: 2000,
  },
];

const UserReports = () => {
  const [reports] = useState(demoReports);
  const [ratings, setRatings] = useState({});
  const [feedbacks, setFeedbacks] = useState({});

  const handleRatingChange = (id, value) => {
    setRatings({ ...ratings, [id]: value });
  };

  const handleFeedbackChange = (id, value) => {
    setFeedbacks({ ...feedbacks, [id]: value });
  };

  const submitReview = (id) => {
    if (!ratings[id]) {
      alert("Please select a rating first.");
      return;
    }

    alert(
      `Review submitted!\nRating: ${ratings[id]}⭐\nFeedback: ${feedbacks[id] || "No comment"}`
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <UserSidebar />

      {/* Main Content */}
      <div className="flex-1 px-6 py-12">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-4xl font-extrabold mb-2">
              My Booking Reports
            </h1>
            <p className="text-gray-600">
              Monthly overview of your bookings and feedback
            </p>
          </div>

          {/* Report Cards */}
          <div className="space-y-6">
            {reports.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-md p-6"
              >
                <div className="grid md:grid-cols-2 gap-6">

                  {/* Booking Info */}
                  <div>
                    <h2 className="text-xl font-bold mb-2">
                      {r.provider}
                    </h2>
                    <p className="text-gray-600">
                      Service: <span className="font-semibold">{r.service}</span>
                    </p>
                    <p className="text-gray-600">
                      Date: {r.date} at {r.time}
                    </p>
                    <p className="text-gray-600">
                      Price: Rs. {r.price}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Month: {r.month}
                    </p>
                  </div>

                  {/* Rating & Feedback */}
                  <div>
                    <h3 className="font-semibold mb-2">
                      Rate this Provider
                    </h3>

                    {/* Star Rating */}
                    <select
                      value={ratings[r.id] || ""}
                      onChange={(e) =>
                        handleRatingChange(r.id, e.target.value)
                      }
                      className="w-full p-2 border rounded-lg mb-3"
                    >
                      <option value="">Select Rating</option>
                      <option value="1">⭐ 1</option>
                      <option value="2">⭐ 2</option>
                      <option value="3">⭐ 3</option>
                      <option value="4">⭐ 4</option>
                      <option value="5">⭐ 5</option>
                    </select>

                    {/* Feedback */}
                    <textarea
                      placeholder="Write your feedback (optional)"
                      value={feedbacks[r.id] || ""}
                      onChange={(e) =>
                        handleFeedbackChange(r.id, e.target.value)
                      }
                      className="w-full p-2 border rounded-lg mb-3"
                    />

                    <button
                      onClick={() => submitReview(r.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                    >
                      Submit Review
                    </button>
                  </div>

                </div>
              </div>
            ))}

            {reports.length === 0 && (
              <p className="text-center text-gray-500">
                No booking reports available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReports;
