import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword || !age || !gender) {
      return alert('Please fill all fields');
    }
    if (password !== confirmPassword) {
      return alert('Passwords do not match');
    }
    try {
      await register(name, email, password);
      alert('Registration successful! Please log in.');
      navigate('/login');
    } catch (err) {
      alert(err.message || 'Registration failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-400 to-gray-600 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
        {/* Branding */}
        <h1 className="text-4xl font-bold mb-2 text-center text-gray-800">UniBook</h1>
        <p className="text-center text-gray-500 mb-6">Your smart booking companion for restaurants, hospitals, futsal, and more!</p>

        <h2 className="text-2xl font-semibold mb-4 text-center text-gray-700">Create Your Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" 
            placeholder="Full Name" 
            value={name} 
            onChange={e => setName(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <div className="flex space-x-4">
            <input 
              type="number" 
              placeholder="Age" 
              value={age} 
              onChange={e => setAge(e.target.value)}
              className="w-1/2 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
            />
            <select 
              value={gender} 
              onChange={e => setGender(e.target.value)} 
              className="w-1/2 p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
            >
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <input 
            type="password" 
            placeholder="Confirm Password" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400"
          />
          <button 
            type="submit" 
            className="w-full bg-gray-800 hover:bg-gray-900 text-white p-3 rounded-xl font-semibold transition"
          >
            Register
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500">
          Already have an account? <Link to="/login" className="text-gray-800 font-semibold hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
