const express = require('express');
const { getPool } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get booked times for a provider on a specific date (Availability Engine)
router.get('/bookings/provider/:provider_id/date/:date', authenticateToken, async (req, res) => {
  try {
    const { provider_id, date } = req.params;
    const pool = getPool();

    const [bookings] = await pool.query(
      "SELECT booking_time FROM bookings WHERE provider_id = ? AND booking_date = ? AND status != 'cancelled'",
      [provider_id, date]
    );

    // Map to 'HH:MM' format for easy frontend comparison
    const bookedTimes = bookings.map(b => b.booking_time.substring(0, 5));
    res.json(bookedTimes);
  } catch (error) {
    console.error('Fetch Booked Times Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new booking
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { provider_id, service_id, booking_date, booking_time, status, notes } = req.body;
    const user_id = req.user.id;
    const pool = getPool();

    const bookingStatus = status || 'confirmed';

    const [result] = await pool.query(
      'INSERT INTO bookings (user_id, provider_id, service_id, booking_date, booking_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, provider_id, service_id || null, booking_date, booking_time, bookingStatus, notes || '']
    );

    const bookingId = result.insertId;

    // --- DEEP LOGGING & ROBUST NOTIFICATIONS ---
    try {
      console.log(`>>> [NOTIF] Starting notification flow for Booking #${bookingId}`);
      
      const [details] = await pool.query(
        "SELECT p.name as provider_name FROM providers p WHERE p.id = ?",
        [provider_id]
      );
      const providerName = details.length > 0 ? details[0].provider_name : 'Service Provider';
      const dateStr = new Date(booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = booking_time.substring(0, 5);
      const userName = req.user.name || 'A Customer';

      console.log(`>>> [NOTIF] Context: User ID ${user_id}, Provider: ${providerName}, Time: ${timeStr}`);

      // 1. Notify User (Confirmed)
      const [userInsert] = await pool.query(
        'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, 'booking_confirmed', 'Booking Confirmed!', `Your booking for ${providerName} on ${dateStr} at ${timeStr} has been successfully confirmed.`, JSON.stringify({ booking_id: bookingId }), bookingId]
      );
      console.log(`>>> [NOTIF] User confirmation inserted. ID: ${userInsert.insertId}`);

      // 2. Notify All Admins (New Confirmed Booking)
      const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      console.log(`>>> [NOTIF] Found ${admins.length} administrators to notify.`);
      
      for (const admin of admins) {
        const [adminInsert] = await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
          [admin.id, 'new_booking', 'New Confirmed Booking', `A new confirmed booking has been made by ${userName} for ${providerName} on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: bookingId }), bookingId]
        );
        console.log(`>>> [NOTIF] Admin (ID: ${admin.id}) notification inserted. ID: ${adminInsert.insertId}`);
      }
      
      console.log(`>>> [NOTIF] Notification flow completed successfully for Booking #${bookingId}`);
    } catch (notifErr) {
      console.error('>>> [NOTIF ERROR] Critical failure in booking notification:', notifErr.message);
      console.error(notifErr.stack);
    }

    res.status(201).json({ message: 'Booking confirmed successfully', id: bookingId });
  } catch (error) {
    console.error('Create Booking Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get bookings for the currently logged-in user
router.get('/bookings/user', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const pool = getPool();

    const query = `
      SELECT b.*, p.name as provider_name, p.category, s.name as service_name
      FROM bookings b
      JOIN providers p ON b.provider_id = p.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.user_id = ?
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

// Get user past/attended bookings for My Reports
router.get('/bookings/user/reports', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const pool = getPool();

    const query = `
      SELECT b.*, p.name as provider_name, p.category, s.name as service_name,
             r.rating, r.comment, r.id as review_id
      FROM bookings b
      JOIN providers p ON b.provider_id = p.id
      LEFT JOIN services s ON b.service_id = s.id
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

// Get all bookings (Admin only)
router.get('/bookings/admin', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();

    const query = `
      SELECT b.*, u.name as user_name, u.email as user_email, p.name as provider_name, p.category, s.name as service_name
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN providers p ON b.provider_id = p.id
      LEFT JOIN services s ON b.service_id = s.id
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `;

    const [bookings] = await pool.query(query);
    res.json(bookings);
  } catch (error) {
    console.error('Get All Bookings Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update booking status (Admin only)
router.put('/bookings/:id/status', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const booking_id = req.params.id;
    const pool = getPool();

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, booking_id]);

    // Send response immediately
    res.json({ message: 'Booking status updated successfully' });

    // Fire-and-forget notifications
    try {
      const [bookingDetails] = await pool.query(
        `SELECT b.*, u.name as user_name, p.name as provider_name 
         FROM bookings b JOIN users u ON b.user_id = u.id JOIN providers p ON b.provider_id = p.id 
         WHERE b.id = ?`, [booking_id]
      );
      
      if (bookingDetails.length > 0) {
        const b = bookingDetails[0];
        const dateStr = new Date(b.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = b.booking_time.substring(0, 5);
        
        if (status === 'confirmed') {
          await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
            [b.user_id, 'booking_confirmed', 'Booking Confirmed', `Your booking for ${b.provider_name} on ${dateStr} at ${timeStr} has been confirmed.`, JSON.stringify({ booking_id: b.id, provider_id: b.provider_id })]
          );
          const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
          for (const admin of admins) {
            await pool.query(
              'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
              [admin.id, 'booking_confirmed', 'Booking Confirmed', `${b.user_name} confirmed a booking at ${b.provider_name} on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: b.id })]
            );
          }
        } else if (status === 'cancelled') {
          await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
            [b.user_id, 'booking_cancelled', 'Booking Cancelled', `Your booking for ${b.provider_name} on ${dateStr} at ${timeStr} has been cancelled.`, JSON.stringify({ booking_id: b.id })]
          );
        }
      }
    } catch (notifErr) {
      console.error('Booking notification error (non-fatal):', notifErr.message);
    }
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
