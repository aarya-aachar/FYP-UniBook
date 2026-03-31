import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import Sidebar from "../components/Sidebar";
import { getAdminMetrics } from "../services/adminService";

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const AdminDashboard = () => {
  const [metrics, setMetrics] = useState({
    totals: { users: 0, providers: 0, bookings: 0, reports: 0 },
    chartData: []
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await getAdminMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load metrics", err);
      }
    };
    fetchMetrics();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 px-6 py-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Monitor users, services and bookings in one place
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-gray-500">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{metrics.totals.users}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-gray-500">Service Providers</h3>
            <p className="text-3xl font-bold text-green-600">{metrics.totals.providers}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-gray-500">Bookings</h3>
            <p className="text-3xl font-bold text-yellow-600">{metrics.totals.bookings}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <h3 className="text-gray-500">Reports</h3>
            <p className="text-3xl font-bold text-red-600">{metrics.totals.reports}</p>
          </div>
        </div>

        {/* Management Links */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link
            to="/dashboard/admin/users"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-center"
          >
            👥
            <h3 className="text-lg font-semibold mt-2">Manage Users</h3>
          </Link>

          <Link
            to="/dashboard/admin/providers"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-center"
          >
            🏢
            <h3 className="text-lg font-semibold mt-2">Manage Providers</h3>
          </Link>

          <Link
            to="/dashboard/admin/bookings"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-center"
          >
            📅
            <h3 className="text-lg font-semibold mt-2">Manage Bookings</h3>
          </Link>

          <Link
            to="/dashboard/admin/reports"
            className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition text-center"
          >
            📊
            <h3 className="text-lg font-semibold mt-2">Reports</h3>
          </Link>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">
            Service Popularity Overview
          </h2>

          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={metrics.chartData.length ? metrics.chartData : [{name:"No Providers", value: 1}]}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={110}
                label
              >
                {(metrics.chartData.length ? metrics.chartData : [{name:"No Providers", value: 1}]).map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
