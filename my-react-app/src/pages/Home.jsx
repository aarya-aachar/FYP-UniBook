// src/pages/Home.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  // Contact form state
  const [name,setName] = useState('');
  const [email,setEmail] = useState('');
  const [message,setMessage] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if(name && email && message) {
      alert('Message sent! We will contact you soon.');
      setName(''); setEmail(''); setMessage('');
    }
  }

  // Handler for clicking a service card
  const handleServiceClick = (categoryName) => {
    navigate(`/services/${encodeURIComponent(categoryName)}`);
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero Section */}
      <section className="text-center py-16 bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
        <h1 className="text-5xl font-bold mb-4">Welcome to UniBook</h1>
        <p className="text-xl mb-6">Your multi-service appointment booking system</p>
        <Link 
          to="/login" 
          className="bg-white text-blue-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition"
        >
          Browse Services
        </Link>
      </section>

      {/* Services Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold mb-8 text-center">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { name: "Restaurants", img: "/images/restaurant1.jpg" },
            { name: "Futsal", img: "/images/futsal1.jpg" },
            { name: "Hospitals", img: "/images/hospital1.jpg" },
            { name: "Salon / Spa", img: "/images/salon1.jpg" }
          ].map(service => (
            <div 
              key={service.name}
              onClick={() => handleServiceClick(service.name)}
              className="bg-white shadow rounded-lg p-4 text-center hover:shadow-xl transition cursor-pointer"
            >
              <img src={service.img} alt={service.name} className="w-full h-40 object-cover rounded mb-2" />
              <h3 className="font-semibold text-lg">{service.name}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-6 bg-gray-100">
        <h2 className="text-4xl font-bold mb-6 text-center">About UniBook</h2>
        <p className="text-lg text-gray-700 mb-4 text-center max-w-3xl mx-auto">
          UniBook is an online multi-service appointment booking system. Users can book appointments for restaurants, futsal, hospitals, and salon/spa services easily and efficiently.
        </p>
        <p className="text-lg text-gray-700 text-center max-w-3xl mx-auto">
          Admin can manage service providers, bookings, and view reports. Our goal is to simplify scheduling and improve service accessibility for everyone.
        </p>
      </section>

      {/* Contact Section */}
      <section className="py-16 px-6">
        <h2 className="text-4xl font-bold mb-6 text-center">Contact Us</h2>
        <div className="max-w-lg mx-auto bg-white p-10 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="text" placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <input type="email" placeholder="Your Email" value={email} onChange={e=>setEmail(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <textarea placeholder="Your Message" value={message} onChange={e=>setMessage(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">Send Message</button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
