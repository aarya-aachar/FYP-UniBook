const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

// @route   POST /api/reviews
// @desc    Submit or Edit a review for a specific booking
// @access  Private (User only)
router.post('/', authenticateToken, async (req, res) => {
  const { booking_id, provider_id, rating, comment } = req.body;
  const user_id = req.user.id;

  try {
    const pool = getPool();

    // Verify booking belongs to user & is historical/confirmed
    const [bookings] = await pool.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [booking_id, user_id]);
    
    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found or unauthorized' });
    }

    const booking = bookings[0];

    // Ensure it's not pending/cancelled
    if (booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed and attended bookings can be reviewed' });
    }

    // Upsert Logic: Insert if entirely new, Update if modifying an existing review
    const [existing] = await pool.query('SELECT id FROM reviews WHERE booking_id = ?', [booking_id]);
    
    if (existing.length > 0) {
      // Edit Review
      await pool.query(
        'UPDATE reviews SET rating = ?, comment = ? WHERE booking_id = ? AND user_id = ?',
        [rating, comment || null, booking_id, user_id]
      );
      res.json({ message: 'Review updated successfully' });
    } else {
      // New Review
      await pool.query(
        'INSERT INTO reviews (booking_id, user_id, provider_id, rating, comment) VALUES (?, ?, ?, ?, ?)',
        [booking_id, user_id, provider_id, rating, comment || null]
      );
      res.status(201).json({ message: 'Review submitted successfully' });
    }

  } catch (error) {
    console.error('Error posting review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/reviews
// @desc    Get all reviews made by the logged-in user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE user_id = ?', [req.user.id]);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
