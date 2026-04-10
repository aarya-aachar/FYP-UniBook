const express = require('express');
const { getPool } = require('../config/db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get booked times for a provider on a specific date (Availability Engine)
router.get('/bookings/provider/:provider_id/date/:date', authenticateToken, async (req, res) => {
  try {
    const { provider_id, date } = req.params;
    const pool = getPool();

    const [bookings] = await pool.query(
      "SELECT booking_time, COUNT(*) as count FROM bookings WHERE provider_id = ? AND booking_date = ? AND status != 'cancelled' GROUP BY booking_time",
      [provider_id, date]
    );

    // Map to { 'HH:MM': count } for precise capacity checking
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

// Create a new booking (Supporting multiple slots & Capacity)
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { provider_id, service_id, booking_date, booking_time, status, notes } = req.body;
    const user_id = req.user.id;
    const pool = getPool();

    // 1. Convert booking_time to array (it might be a single string from older clients)
    const times = Array.isArray(booking_time) ? booking_time : [booking_time];
    const bookingStatus = status || 'confirmed';

    // 2. Fetch Provider Capacity
    const [providers] = await pool.query("SELECT name, capacity FROM providers WHERE id = ?", [provider_id]);
    if (providers.length === 0) return res.status(404).json({ message: 'Provider not found' });
    const provider = providers[0];
    const capacity = provider.capacity || 1;

    // 3. Validate Availability for ALL slots
    const [existing] = await pool.query(
      "SELECT booking_time, COUNT(*) as count FROM bookings WHERE provider_id = ? AND booking_date = ? AND status != 'cancelled' AND booking_time IN (?) GROUP BY booking_time",
      [provider_id, booking_date, times]
    );

    const counts = {};
    existing.forEach(e => { counts[e.booking_time.substring(0, 5)] = e.count; });

    for (const t of times) {
       const shortT = t.substring(0, 5);
       if ((counts[shortT] || 0) >= capacity) {
          return res.status(400).json({ message: `Slot ${shortT} is already full at ${capacity}/${capacity} capacity.` });
       }
    }

    // 4. Create Bookings (One entry per slot/time)
    const bookingIds = [];
    for (const t of times) {
      const [result] = await pool.query(
        'INSERT INTO bookings (user_id, provider_id, service_id, booking_date, booking_time, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [user_id, provider_id, service_id || null, booking_date, t, bookingStatus, notes || '']
      );
      bookingIds.push(result.insertId);
    }

    const mainBookingId = bookingIds[0];

    // --- NOTIFICATIONS ---
    try {
      const providerName = provider.name;
      const dateStr = new Date(booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const timeStr = times.map(t => t.substring(0, 5)).join(', ');
      const userName = req.user.name || 'A Customer';

      // 1. Notify User
      await pool.query(
        'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, 'booking_confirmed', 'Booking Confirmed!', `Your booking for ${providerName} on ${dateStr} at ${timeStr} has been confirmed.`, JSON.stringify({ booking_id: mainBookingId }), mainBookingId]
      );

      // 2. Notify Admins
      const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
      for (const admin of admins) {
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
          [admin.id, 'new_booking', 'New Booking', `${userName} booked ${providerName} on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: mainBookingId }), mainBookingId]
        );
      }

      // 3. Notify the Service Provider (if they have a portal account)
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

    res.status(201).json({ message: 'Booking confirmed successfully', id: mainBookingId, ids: bookingIds });
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
