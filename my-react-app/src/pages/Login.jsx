import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    if (!email || !password) {
      return alert('Please enter email and password');
    }

    try {
      const { user } = await login(email, password);
      // alert('Login successful!');
      if (user.role === 'admin') {
        navigate('/dashboard/admin');
      } else {
        navigate('/dashboard/user');
      }
    } catch (err) {
      alert(err.message || 'Login failed');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-400 to-indigo-500 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
        {/* Branding */}
        <h1 className="text-4xl font-bold mb-2 text-center text-blue-600">UniBook</h1>
        <p className="text-center text-gray-500 mb-6">Your smart booking companion for restaurants, hospitals, futsal, and more!</p>

        <h2 className="text-2xl font-semibold mb-4 text-center">Login to your account</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={e => setPassword(e.target.value)}
            className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl font-semibold transition"
          >
            Login
          </button>
        </form>
        <p className="mt-6 text-center text-gray-500">
          Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
