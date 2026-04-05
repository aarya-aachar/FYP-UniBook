require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');
const authRoutes = require('./routes/authRoutes');
const providerRoutes = require('./routes/providerRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const adminRoutes = require('./routes/adminRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

const PORT = process.env.PORT || 4001;

// Loosen CORS for development cross-network access
app.use(cors({ origin: true, credentials: true }));
// Increased payload limits for large Base64 profile photos
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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
    app.use('/api/reviews', reviewRoutes);
    app.use('/api/notifications', notificationRoutes);

    // Serve profile photo uploads
    app.use('/uploads/profiles', express.static(path.join(__dirname, 'routes', 'uploads', 'profiles')));

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

      // Booking reminder: check every 5 minutes for bookings within the next 60 minutes
      setInterval(async () => {
        try {
          const { getPool } = require('./db');
          const pool = getPool();
          
          // Find confirmed bookings happening within the next 60 minutes that haven't been reminded
          const [upcoming] = await pool.query(`
            SELECT b.id, b.user_id, b.booking_date, b.booking_time, p.name as provider_name
            FROM bookings b
            JOIN providers p ON b.provider_id = p.id
            WHERE b.status = 'confirmed'
              AND b.booking_date = CURDATE()
              AND b.booking_time BETWEEN CURTIME() AND ADDTIME(CURTIME(), '01:00:00')
              AND b.id NOT IN (
                SELECT JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.booking_id')) 
                FROM notifications 
                WHERE type = 'booking_reminder'
                AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.booking_id')) IS NOT NULL
              )
          `);
          
          for (const booking of upcoming) {
            const timeStr = booking.booking_time.substring(0, 5);
            await pool.query(
              'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
              [booking.user_id, 'booking_reminder', 'Upcoming Booking Reminder', `Reminder: Your booking at ${booking.provider_name} is in less than 1 hour (${timeStr}).`, JSON.stringify({ booking_id: String(booking.id) })]
            );
          }
          
          if (upcoming.length > 0) {
            console.log(`>>> [REMINDER] Sent ${upcoming.length} booking reminder(s)`);
          }
        } catch (err) {
          // Silent fail for reminder — non-critical
        }
      }, 5 * 60 * 1000); // every 5 minutes
    });
  } catch (error) {
    console.error('❌ FATAL SERVER CRASH DURING BOOTSTRAP:');
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
