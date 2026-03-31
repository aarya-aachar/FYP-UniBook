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

const PORT = process.env.PORT || 4001;

// Loosen CORS for development cross-network access
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- GLOBAL DIAGNOSTIC LOGGERS ---
app.use((req, res, next) => {
  console.log(`>>> [SERVER] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// A public health check to verify browser connectivity
app.get('/api/ping', (req, res) => {
  res.json({ status: 'pong', time: new Date().toISOString() });
});

// Main init logic
async function bootstrap() {
  try {
    console.log('>>> [BOOTSTRAP] Connecting to database...');
    await initDB();
    console.log('>>> [BOOTSTRAP] Table initialization complete');

    // Basic health test
    app.get('/', (req, res) => res.send('UniBook API is up and running!'));

    // Load API routes
    app.use('/api', authRoutes);
    app.use('/api', providerRoutes);
    app.use('/api', bookingRoutes);
    app.use('/api', adminRoutes);

    // Global Error Handler
    app.use((err, req, res, next) => {
      console.error('>>> [SERVER ERROR]:', err);
      res.status(500).json({ message: 'Internal Server Error: ' + err.message });
    });

    app.listen(PORT, () => {
      console.log(`\n==========================================`);
      console.log(`🚀 UniBook Server Running on Port ${PORT}`);
      console.log(`📡 Endpoints prefix: /api`);
      console.log(`==========================================\n`);

      // Heartbeat to detect silent crashes
      setInterval(() => {
        console.log(`>>> [SERVER] Heartbeat: Active at ${new Date().toLocaleTimeString()}`);
      }, 30000);
    });
  } catch (error) {
    console.error('❌ FATAL SERVER CRASH DURING BOOTSTRAP:');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
