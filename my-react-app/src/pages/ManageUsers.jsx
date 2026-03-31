import { useState } from 'react';
import Sidebar from '../components/Sidebar';

const initialUsers = [
  { id: 1, name: 'Milan Dhamala', email: 'milan@example.com', role: 'user', active: true },
  { id: 2, name: 'Chotu Ashish', email: 'chotu@example.com', role: 'user', active: false },
  { id: 3, name: 'Admin', email: 'admin@example.com', role: 'admin', active: true }
];

const ManageUsers = () => {
  const [users, setUsers] = useState(initialUsers);

  const toggleActive = (id) => {
    setUsers(users.map(u => u.id === id ? { ...u, active: !u.active } : u));
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Admin Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 py-12 px-6 max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">Manage Users</h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {users.map(user => (
            <div key={user.id} className="flex justify-between items-center p-4 mb-3 rounded-lg bg-gray-50 shadow-sm">
              <div>
                <h3 className="font-semibold">{user.name}</h3>
                <p>{user.email} ({user.role})</p>
              </div>
              <button
                onClick={() => toggleActive(user.id)}
                className={`px-4 py-2 rounded-lg ${user.active ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} text-white transition`}
              >
                {user.active ? 'Active' : 'Inactive'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
