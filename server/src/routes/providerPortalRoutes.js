const express = require('express');
const { getPool } = require('../config/db');
const { authenticateToken, verifyProvider } = require('../middleware/authMiddleware');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// GET /api/provider/profile
// Returns the provider's own provider record + application data
// ─────────────────────────────────────────────────────────────
router.get('/provider/profile', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [providers] = await pool.query(
      `SELECT p.*, pa.pan_number, pa.document_path 
       FROM providers p 
       JOIN users u ON p.user_id = u.id
       LEFT JOIN provider_applications pa ON pa.email = u.email 
       WHERE p.user_id = ?`,
      [userId]
    );

    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider profile not found.' });
    }

    // Also get user info
    const [users] = await pool.query('SELECT id, name, email, profile_photo, created_at FROM users WHERE id = ?', [userId]);
    const user = users[0] || {};

    res.json({ ...providers[0], user_email: user.email, user_name: user.name, user_photo: user.profile_photo });
  } catch (err) {
    console.error('>>> [PROVIDER PROFILE ERROR]', err);
    res.status(500).json({ message: 'Failed to load provider profile.' });
  }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer Setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `provider_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadImages = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return res.status(400).json({ message: `Upload Error: ${err.message}` });
    next();
  });
};

// ─────────────────────────────────────────────────────────────
// PUT /api/provider/profile
// Update provider's own service details
// ─────────────────────────────────────────────────────────────
router.put('/provider/profile', authenticateToken, verifyProvider, uploadImages, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;
    const { description, address, base_price, opening_time, closing_time, capacity } = req.body;

    const fields = ['description = ?', 'address = ?', 'base_price = ?', 'opening_time = ?', 'closing_time = ?', 'capacity = ?'];
    const values = [description, address, base_price, opening_time, closing_time, capacity];

    // Handle Image Gallery Uploads
    let mergedGallery = [];
    let existingToKeep = [];
    
    if (req.body.existing_gallery) {
      try {
        const parsed = JSON.parse(req.body.existing_gallery);
        if (Array.isArray(parsed)) existingToKeep = parsed;
      } catch (e) {
        console.error("Failed to parse existing_gallery:", e);
      }
    }

    if (req.files && req.files.length > 0) {
      const newFiles = req.files.filter(f => f.fieldname === 'images');
      const newPaths = newFiles.map(f => `/uploads/${f.filename}`);
      mergedGallery = [...existingToKeep, ...newPaths].slice(0, 4);
    } else {
      mergedGallery = existingToKeep.slice(0, 4);
    }

    // Update image and gallery_images
    fields.push('image = ?');
    values.push(mergedGallery.length > 0 ? mergedGallery[0] : '');
    
    fields.push('gallery_images = ?');
    values.push(JSON.stringify(mergedGallery));

    values.push(userId);
    await pool.query(`UPDATE providers SET ${fields.join(', ')} WHERE user_id = ?`, values);

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('>>> [PROVIDER PROFILE UPDATE ERROR]', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/provider/bookings
// Returns all bookings for this provider's service
// ─────────────────────────────────────────────────────────────
router.get('/provider/bookings', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    // Get provider_id for this user
    const [providerRows] = await pool.query('SELECT id FROM providers WHERE user_id = ?', [userId]);
    if (providerRows.length === 0) {
      return res.status(404).json({ message: 'No provider linked to this account.' });
    }
    const providerId = providerRows[0].id;

    const [bookings] = await pool.query(
      `SELECT b.id, b.provider_id, b.user_id, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, b.booking_time, b.status, b.paid_amount, b.created_at,
              u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.provider_id = ? AND b.status = 'confirmed'
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [providerId]
    );

    res.json(bookings);
  } catch (err) {
    console.error('>>> [PROVIDER BOOKINGS ERROR]', err);
    res.status(500).json({ message: 'Failed to load bookings.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/provider/dashboard
// Returns summary stats for provider dashboard
// ─────────────────────────────────────────────────────────────
router.get('/provider/dashboard', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [providerRows] = await pool.query('SELECT id, name, category FROM providers WHERE user_id = ?', [userId]);
    if (providerRows.length === 0) {
      return res.status(404).json({ message: 'No provider linked to this account.' });
    }
    const provider = providerRows[0];
    const providerId = provider.id;

    console.log(`\n>>> [DEBUG] DASHBOARD REQUEST FOR PROVIDER ID: ${providerId}`);

    // 1. Fetch Definitive Revenue (Direct SQL Sum)
    const [revenueRows] = await pool.query(
      "SELECT SUM(paid_amount) AS total_revenue FROM bookings WHERE provider_id = ? AND status = 'confirmed'",
      [providerId]
    );
    const revenueVal = parseFloat(revenueRows[0]?.total_revenue || 0);
    console.log(`>>> [DEBUG] Raw Total Revenue from SQL: ${revenueVal}`);

    // 2. Fetch Raw Bookings (Ordered for grouping)
    const [allConfirmed] = await pool.query(
      `SELECT id, user_id, DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date, booking_time, paid_amount 
       FROM bookings 
       WHERE provider_id = ? AND status = 'confirmed' 
       ORDER BY booking_date ASC, booking_time ASC`,
      [providerId]
    );

    // 3. User Map for Names
    const [userRows] = await pool.query("SELECT id, name FROM users");
    const userMap = Object.fromEntries(userRows.map(u => [String(u.id), u.name]));

    // 4. Hyper-Resilient Session Grouping
    const sessions = [];
    allConfirmed.forEach(booking => {
      const last = sessions[sessions.length - 1];
      
      // Use String() for safety on all IDs and Dates
      const curUID  = String(booking.user_id);
      const curDate = String(booking.booking_date);
      const lastUID = last ? String(last.user_id) : null;
      const lastDate = last ? String(last.booking_date) : null;

      if (last && curUID === lastUID && curDate === lastDate) {
        const lastSlot = last.slots[last.slots.length - 1];
        // Handle '09:00:00' or '9:00' or '09:00'
        const lastH = parseInt(lastSlot.booking_time.split(':')[0], 10);
        const thisH = parseInt(booking.booking_time.split(':')[0], 10);
        
        // Group if consecutive hours
        if (thisH === lastH + 1) {
          last.slots.push(booking);
          last.times.push(booking.booking_time);
          return;
        }
      }

      sessions.push({
        ...booking,
        slots: [booking],
        times: [booking.booking_time],
        user_name: userMap[String(booking.user_id)] || 'Anonymous'
      });
    });

    // 5. Time-Sensitive Categorization
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const nowTimeStr = now.toTimeString().substring(0, 5);

    let upcomingCount = 0;
    let completedCount = 0;

    sessions.forEach(s => {
      const bDate = String(s.booking_date);
      const bTime = String(s.booking_time).substring(0, 5);

      if (bDate < todayStr) {
        completedCount++;
      } else if (bDate === todayStr) {
        if (bTime < nowTimeStr) completedCount++;
        else upcomingCount++;
      } else {
        upcomingCount++;
      }
    });

    const finalStats = { 
      total: sessions.length, 
      upcoming: upcomingCount, 
      completed: completedCount, 
      revenue: Math.round(revenueVal * 100) / 100 
    };

    console.log(`>>> [SUCCESS] Final Metrics: Total=${finalStats.total}, Revenue=${finalStats.revenue}, Upcoming=${finalStats.upcoming}`);

    res.json({ 
      provider, 
      stats: finalStats, 
      recentBookings: [...sessions].reverse().slice(0, 5) 
    });
  } catch (err) {
    console.error('>>> [PROVIDER DASHBOARD ERROR]', err);
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/provider/notifications
// Returns notifications only for this provider
// ─────────────────────────────────────────────────────────────
router.get('/provider/notifications', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.json(notifications);
  } catch (err) {
    console.error('>>> [PROVIDER NOTIFICATIONS ERROR]', err);
    res.status(500).json({ message: 'Failed to load notifications.' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/provider/notifications/:id/read
// Mark a provider notification as read
// ─────────────────────────────────────────────────────────────
router.put('/provider/notifications/:id/read', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read.' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/provider/bookings/:id/reschedule
// Allows provider to change date/time of a booking
// ─────────────────────────────────────────────────────────────
router.put('/provider/bookings/:id/reschedule', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const { id } = req.params;
    const { booking_date, booking_time } = req.body;
    const pool = getPool();
    const userId = req.user.id;

    // 1. Verify this provider owns the booking
    const [providerRows] = await pool.query('SELECT id, name FROM providers WHERE user_id = ?', [userId]);
    if (providerRows.length === 0) return res.status(403).json({ message: 'Unauthorized' });
    const provider = providerRows[0];

    const [bookingCheck] = await pool.query('SELECT * FROM bookings WHERE id = ? AND provider_id = ?', [id, provider.id]);
    if (bookingCheck.length === 0) return res.status(404).json({ message: 'Booking not found.' });
    const booking = bookingCheck[0];

    // 2. Validate: new date must not be in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(booking_date);
    if (selectedDate < today) {
      return res.status(400).json({ message: 'Cannot reschedule to a past date.' });
    }

    // 3. Validate availability (Capacity check)
    const [existing] = await pool.query(
      "SELECT COUNT(*) as count FROM bookings WHERE provider_id = ? AND booking_date = ? AND booking_time = ? AND status = 'confirmed' AND id != ?",
      [provider.id, booking_date, booking_time, id]
    );

    const [capRows] = await pool.query("SELECT capacity FROM providers WHERE id = ?", [provider.id]);
    const capacity = capRows[0]?.capacity || 1;
    if ((existing[0].count || 0) >= capacity) {
      return res.status(400).json({ message: 'The selected slot is already full. Please choose another time.' });
    }

    // 3. Update the booking
    await pool.query('UPDATE bookings SET booking_date = ?, booking_time = ? WHERE id = ?', [booking_date, booking_time, id]);

    // 4. Notify User
    try {
      const dateStr = new Date(booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = booking_time.substring(0, 5);
      await pool.query(
        'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
        [booking.user_id, 'booking_rescheduled', 'Booking Rescheduled', `Your booking for ${provider.name} has been rescheduled to ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: id }), id]
      );
    } catch (notifErr) {
      console.error('Reschedule notification error:', notifErr.message);
    }

    res.json({ message: 'Booking rescheduled successfully.' });
  } catch (err) {
    console.error('>>> [RESCHEDULE ERROR]', err);
    res.status(500).json({ message: 'Failed to reschedule booking.' });
  }
});

module.exports = router;
