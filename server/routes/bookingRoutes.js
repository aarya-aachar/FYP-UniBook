const express = require('express');
const { getPool } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Create a new booking
router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { provider_id, service_id, booking_date, booking_time, notes } = req.body;
    const user_id = req.user.id;
    const pool = getPool();

    const [result] = await pool.query(
      'INSERT INTO bookings (user_id, provider_id, service_id, booking_date, booking_time, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, provider_id, service_id || null, booking_date, booking_time, notes || '']
    );

    res.status(201).json({ message: 'Booking created successfully', id: result.insertId });
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
      ORDER BY b.booking_date DESC, b.booking_time DESC
    `;

    const [bookings] = await pool.query(query, [user_id]);
    res.json(bookings);
  } catch (error) {
    console.error('Get User Bookings Error:', error);
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
    const { status } = req.body; // 'confirmed', 'cancelled', 'pending'
    const booking_id = req.params.id;
    const pool = getPool();

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, booking_id]);

    res.json({ message: 'Booking status updated successfully' });
  } catch (error) {
    console.error('Update Booking Status Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
