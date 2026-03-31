import { useState } from 'react';

const Contact = () => {
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="bg-white p-10 rounded-xl shadow-lg max-w-lg w-full">
        <h1 className="text-3xl font-bold mb-6 text-center">Contact Us</h1>
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
    </div>
  );
};

export default Contact;
