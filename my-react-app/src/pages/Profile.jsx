import { useState } from "react";
import UserSidebar from "../components/UserSidebar";

const Profile = () => {
  const [photo, setPhoto] = useState(null);
  const [form, setForm] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    age: 22,
    gender: "Male",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhoto(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert("New passwords do not match");
      return;
    }

    alert("Profile updated successfully!");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <UserSidebar />

      {/* Content */}
      <div className="flex-1 p-8">
        <div className="bg-white max-w-4xl mx-auto rounded-2xl shadow-xl p-8">

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-8">
            My Profile
          </h1>

          {/* Profile Photo */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-36 h-36 rounded-full border-4 border-blue-500 overflow-hidden shadow-md">
              <img
                src={
                  photo ||
                  "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                }
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            <label className="mt-4 cursor-pointer text-blue-600 font-medium hover:underline">
              Change Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
          </div>

          {/* Profile Form */}
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block font-semibold mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Password Section */}
            <div className="border-t pt-8">
              <h2 className="text-xl font-bold mb-4">
                Change Password
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                <input
                  type="password"
                  name="currentPassword"
                  placeholder="Current Password"
                  value={form.currentPassword}
                  onChange={handleChange}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  type="password"
                  name="newPassword"
                  placeholder="New Password"
                  value={form.newPassword}
                  onChange={handleChange}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm New Password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Save Changes
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
