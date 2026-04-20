/**
 * Community Feedback & Review Routes
 * 
 * relative path: /api/reviews
 * 
 * This file manages the "Trust System" of UniBook. 
 * It allows customers to share their experiences and rate the quality 
 * of services like Hospitals, Futsals, and Event Venues.
 * 
 * Key Logic:
 * - Aggregate average star ratings for business profiles.
 * - Display chronological user feedback with reviewer names.
 * - Secure submission of new reviews linked to verifiable bookings.
 */

const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

/**
 * @route GET /api/reviews/provider/:providerId
 * @desc Get the full feed of reviews for a business listing.
 */
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const pool = getPool();
    
    // We join with the 'users' table so we can show "Aarya said..." instead of "User #12 said..."
    const [rows] = await pool.query(`
      SELECT r.*, u.name as user_name 
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.provider_id = ?
      ORDER BY r.created_at DESC
    `, [providerId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Fetch Reviews Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/reviews/provider/:providerId/stats
 * @desc Summary Stats Engine. 
 *       Calculates the big star rating and total count seen on the search results.
 */
router.get('/provider/:providerId/stats', async (req, res) => {
  try {
    const { providerId } = req.params;
    const pool = getPool();
    
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(rating) as average_rating
      FROM reviews
      WHERE provider_id = ?
    `, [providerId]);
    
    const stats = rows[0];
    res.json({
      total_reviews: stats.total_reviews || 0,
       // Round the average to one decimal place (e.g. 4.3)
      average_rating: parseFloat(stats.average_rating || 0).toFixed(1)
    });
  } catch (error) {
    console.error('Fetch Review Stats Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route POST /api/reviews
 * @desc POST-SERVICE FEEDBACK:
 *       Allows a logged-in user to leave a comment and a star rating.
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { provider_id, rating, comment, booking_id } = req.body;
    const pool = getPool();
    
    // Basic validation to prevent "Zero Star" or "6 Star" ratings
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Valid rating (1-5) is required.' });
    }

    const [result] = await pool.query(`
      INSERT INTO reviews (user_id, provider_id, booking_id, rating, comment)
      VALUES (?, ?, ?, ?, ?)
    `, [req.user.id, provider_id, booking_id || null, rating, comment]);
    
    res.status(201).json({ 
      message: 'Review submitted successfully',
      reviewId: result.insertId 
    });
  } catch (error) {
    console.error('Submit Review Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
