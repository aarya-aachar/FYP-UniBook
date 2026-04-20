/**
 * UniBook Backend - Entry Point
 * 
 * This is the root file for the Node.js server. It handles the core configuration,
 * database initialization, middleware setup, and routing for the entire API.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./src/config/db');

// --- ROUTE IMPORTS ---
// Importing various modules that handle specific parts of the system
const authRoutes = require('./src/routes/authRoutes');
const providerRoutes = require('./src/routes/providerRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const providerApplicationRoutes = require('./src/routes/providerApplicationRoutes');
const providerPortalRoutes = require('./src/routes/providerPortalRoutes');
const { startReminderJob } = require('./src/jobs/reminderJob');

const app = express();
const PORT = 4001; // The backend runs on port 4001

/**
 * --- MIDDLEWARE SETUP ---
 */

// Allow cross-origin requests so the React frontend can talk to this server
app.use(cors({ origin: true, credentials: true }));

// Express by default has a small payload limit. We increase it here to 50MB 
// to support uploading profile photos and documents via Base64 strings.
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable public access to the 'uploads' folder for profile pictures and documents
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

/**
 * --- DIAGNOSTIC LOGGING ---
 * Helps in debugging by showing which requests are hitting the server.
 * High-frequency "noisy" endpoints (like notification polling) are filtered out 
 * to keep the console clean.
 */
app.use((req, res, next) => {
  const noisyEndpoints = [
    '/api/chat/unread-total',
    '/api/notifications/unread-count',
    '/api/notifications',
    '/api/chat/history',
    '/api/chat/conversations',
    '/api/auth/me',
    '/api/bookings/user',
    '/api/admin/metrics',
    '/uploads/'
  ];
  
  const isNoisy = noisyEndpoints.some(endpoint => req.url.startsWith(endpoint));
  
  if (!isNoisy) {
    console.log(`>>> [SERVER] ${req.method} ${req.url} from ${req.ip}`);
  }
  next();
});

// Simple health check endpoint to verify server is alive
app.get('/api/ping', (req, res) => {
  res.json({ status: 'pong', time: new Date().toISOString() });
});

/**
 * --- MAIN STARTUP SEQUENCE ---
 * We wrap this in an async function so we can ensure the Database connects 
 * before we start accepting requests.
 */
async function startServer() {
  try {
    console.log('>>> [STARTUP] Connecting to database...');
    await initDB();
    console.log('>>> [STARTUP] Table initialization complete');

    // Root endpoint message
    app.get('/', (req, res) => res.send('UniBook API is up and running!'));

    /**
     * --- LOAD API ROUTES ---
     */
    app.use('/api', providerPortalRoutes);
    app.use('/api', authRoutes);
    app.use('/api', providerRoutes);
    app.use('/api', bookingRoutes);
    app.use('/api', adminRoutes);
    app.use('/api', paymentRoutes);
    app.use('/api/chat', chatRoutes);
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/notifications', notificationRoutes);
    app.use('/api', providerApplicationRoutes);

    // Static route for serving profile images specifically
    app.use('/uploads/profiles', express.static(path.join(__dirname, 'src', 'routes', 'uploads', 'profiles')));

    /**
     * --- GLOBAL ERROR HANDLING ---
     * This catches any unexpected errors in the request-response cycle 
     * to prevent the whole server from crashing.
     */
    app.use((err, req, res, next) => {
      console.error('>>> [SERVER ERROR]:', err);
      res.status(500).json({ message: 'Internal Server Error: ' + err.message });
    });

    // Start listening for incoming traffic
    app.listen(PORT, () => {
      console.log(`\n==========================================`);
      console.log(`🚀 UniBook Server Running on Port ${PORT}`);
      console.log(`📡 Endpoints prefix: /api`);
      console.log(`==========================================\n`);

      /**
       * --- BACKGROUND JOBS ---
       * This starts the automated job that sends email reminders 
       * to clients and providers for upcoming bookings.
       */
      startReminderJob();
      console.log('>>> [JOBS] Reminder engine started.');
    });
  } catch (error) {
    // If the database connection fails, we kill the process 
    // because the app cannot function without it.
    console.error('❌ FATAL SERVER CRASH DURING STARTUP:');
    console.error(error);
    process.exit(1);
  }
}

// Execute the startup logic
startServer();

