require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');
const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());
// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Main init logic
async function bootstrap() {
  // Connect to DB and run migrations
  await initDB();

  // Basic health test
  app.get('/', (req, res) => res.send('UniBook API is up and running!'));

  // Load API routes
  app.use('/api', authRoutes);
  app.use('/api', providerRoutes);
  app.use('/api', bookingRoutes);
  app.use('/api', adminRoutes);

  // Global Error Handler
  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
}

bootstrap();
