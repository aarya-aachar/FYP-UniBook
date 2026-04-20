/**
 * Appointment & Booking Routes
 * 
 * relative path: /api/bookings
 * 
 * This is the "Heart" of the system. It handles:
 * - Checking if a specific time slot is free or taken.
 * - Creating new appointments (handling single or multiple hour blocks).
 * - Enforcing "Capacity" limits (e.g., if a hospital has 5 doctors, it can take 5 bookings per hour).
 * - Categorizing bookings into "Upcoming" and "History" for user dashboards.
 */

const express = require('express');
const { getPool } = require('../config/db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/bookings/provider/:provider_id/date/:date
 * @desc AVAILABILITY ENGINE:
 *       Checks a provider's calendar for a specific date and returns how 
 *       many people have already booked each hour.
 */
router.get('/bookings/provider/:provider_id/date/:date', authenticateToken, async (req, res) => {
  try {
    const { provider_id, date } = req.params;
    const pool = getPool();

    const [bookings] = await pool.query(
      "SELECT booking_time, COUNT(*) as count FROM bookings WHERE provider_id = ? AND booking_date = ? AND status = 'confirmed' GROUP BY booking_time",
      [provider_id, date]
    );

    // Map the results into a clean object like { '09:00': 1, '10:00': 2 }
    const bookedData = {};
    bookings.forEach(b => {
      const slot = b.booking_time.substring(0, 5);
      bookedData[slot] = b.count;
    });
    res.json(bookedData);
  } catch (error) {
    console.error('Fetch Booked Times Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route POST /api/bookings
 * @desc THE BOOKING ENGINE:
 *       Handles creating new appointments. It is "Capacity Aware" and 
 *       prevents double-booking. It also supports booking multiple 
 *       consecutive hours in one go.
 */
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { provider_id, booking_date, booking_time, status, notes } = req.body;
    const user_id = req.user.id;
    const pool = getPool();

    // 1. We treat 'booking_time' as an array to support multi-hour matches (like Futsal)
    const times = Array.isArray(booking_time) ? booking_time : [booking_time];
    const bookingStatus = status || 'confirmed';

    // 2. Look up the business capacity (e.g. how many slots per hour?)
    const [providers] = await pool.query("SELECT name, capacity FROM providers WHERE id = ?", [provider_id]);
    if (providers.length === 0) return res.status(404).json({ message: 'Provider not found' });
    const provider = providers[0];
    const capacity = provider.capacity || 1;

    // 3. SECURE CHECK: Ensure EVERY requested slot has at least one free space left
    const [existing] = await pool.query(
      "SELECT booking_time, COUNT(*) as count FROM bookings WHERE provider_id = ? AND booking_date = ? AND status = 'confirmed' AND booking_time IN (?) GROUP BY booking_time",
      [provider_id, booking_date, times]
    );

    const counts = {};
    existing.forEach(e => { counts[e.booking_time.substring(0, 5)] = e.count; });

    for (const t of times) {
      const shortT = t.substring(0, 5);
      if ((counts[shortT] || 0) >= capacity) {
        // If even ONE slot in the range is full, the whole booking fails
        return res.status(400).json({ message: `Slot ${shortT} is already full at ${capacity}/${capacity} capacity.` });
      }
    }

    // 4. Create the records. One row per hour slot in the database.
    const bookingIds = [];
    const slotDuration = req.body.duration ? (req.body.duration / times.length) : 60;

    for (const t of times) {
      const [result] = await pool.query(
        'INSERT INTO bookings (user_id, provider_id, booking_date, booking_time, status, notes, duration) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, provider_id, booking_date, t, bookingStatus, notes || '', slotDuration]
      );
      bookingIds.push(result.insertId);
    }

    const mainBookingId = bookingIds[0];

    /**
     * --- MULTI-PARTY NOTIFICATION CHAIN ---
     * If the payment was successful (or skipped for testing), 
     * we alert everyone involved.
     */
    if (bookingStatus === 'confirmed') {
      try {
        const providerName = provider.name;
        const dateStr = new Date(booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = times.map(t => t.substring(0, 5)).join(', ');
        const userName = req.user.name || 'A Customer';

        // 1. Notify the User (Confirmation)
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
          [user_id, 'booking_confirmed', 'Booking Confirmed!', `Your booking for ${providerName} on ${dateStr} at ${timeStr} has been confirmed.`, JSON.stringify({ booking_id: mainBookingId }), mainBookingId]
        );

        // 2. Notify System Admins (Audit/Tracking)
        const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of admins) {
          await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
            [admin.id, 'new_booking', 'New Booking', `${userName} booked ${providerName} on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: mainBookingId }), mainBookingId]
          );
        }

        // 3. Notify the Service Provider (Business Alert)
        const [providerUser] = await pool.query("SELECT user_id FROM providers WHERE id = ?", [provider_id]);
        if (providerUser.length > 0 && providerUser[0].user_id) {
          await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
            [providerUser[0].user_id, 'new_booking', '📅 New Booking Received!', `${userName} booked your service on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: mainBookingId }), mainBookingId]
          );
        }
      } catch (notifErr) {
        console.error('>>> [NOTIF ERROR]', notifErr.message);
      }
    }

    const payloadMsg = bookingStatus === 'pending' ? 'Booking initialized for payment' : 'Booking confirmed successfully';
    res.status(201).json({ message: payloadMsg, id: mainBookingId, ids: bookingIds });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/bookings/user
 * @desc Used for the "My Bookings" page. 
 *       Shows only future/upcoming appointments that have been confirmed.
 */
router.get('/bookings/user', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const pool = getPool();

    const query = `
      SELECT b.id, b.provider_id, b.user_id, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, b.booking_time, b.status, b.paid_amount, b.created_at, p.name as provider_name, p.category
      FROM bookings b
      JOIN providers p ON b.provider_id = p.id
      WHERE b.user_id = ?
        AND b.status != 'pending'
        AND NOT (b.status = 'confirmed' AND (b.booking_date < CURDATE() OR (b.booking_date = CURDATE() AND b.booking_time <= CURTIME())))
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `;

    const [bookings] = await pool.query(query, [user_id]);
    res.json(bookings);
  } catch (error) {
    console.error('Get User Bookings Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/bookings/user/reports
 * @desc Used for the "My Reports" page. 
 *       Shows historical appointments so the user can review them or export their history.
 */
router.get('/bookings/user/reports', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const pool = getPool();

    const query = `
      SELECT b.id, b.provider_id, b.user_id, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, b.booking_time, b.status, b.paid_amount, b.created_at, p.name as provider_name, p.category,
             r.rating, r.comment, r.id as review_id
      FROM bookings b
      JOIN providers p ON b.provider_id = p.id
      LEFT JOIN reviews r ON b.id = r.booking_id
      WHERE b.user_id = ? 
        AND b.status = 'confirmed'
        AND (b.booking_date < CURDATE() OR (b.booking_date = CURDATE() AND b.booking_time <= CURTIME()))
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `;

    const [bookings] = await pool.query(query, [user_id]);
    res.json(bookings);
  } catch (error) {
    console.error('Get User Reports Bookings Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/bookings/admin
 * @desc Admin only: See every appointment in the whole system for audit purposes.
 */
router.get('/bookings/admin', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();

    const query = `
      SELECT b.id, b.provider_id, b.user_id, DATE_FORMAT(b.booking_date, '%Y-%m-%d') as booking_date, b.booking_time, b.status, b.paid_amount, b.created_at, u.name as user_name, u.email as user_email, p.name as provider_name, p.category
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN providers p ON b.provider_id = p.id
      WHERE b.status != 'pending'
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `;

    const [bookings] = await pool.query(query);
    res.json(bookings);
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
;
