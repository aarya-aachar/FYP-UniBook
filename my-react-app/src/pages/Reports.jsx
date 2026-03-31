import { useState } from "react";
import Sidebar from "../components/Sidebar";

const Reports = () => {
  const [format, setFormat] = useState("CSV");

  const handleExport = () => {
    alert(`Exported as ${format}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 px-6 py-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold mb-2">Reports</h1>
          <p className="text-gray-600">
            Download system data and insights
          </p>
        </div>

        {/* Report Types */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">👥 Users Report</h3>
            <p className="text-gray-600">
              Registered users and activity overview
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">📅 Bookings Report</h3>
            <p className="text-gray-600">
              All booking history and statuses
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 text-center hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">📊 Services Report</h3>
            <p className="text-gray-600">
              Service popularity and demand
            </p>
          </div>
        </div>

        {/* Export Section */}
        <div className="bg-white rounded-2xl shadow-md p-8 max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Export Reports
          </h2>

          <p className="text-gray-600 text-center mb-6">
            Choose a file format and export reports instantly
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="p-3 border rounded-lg w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>CSV</option>
              <option>JSON</option>
            </select>

            <button
              onClick={handleExport}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
