const express = require('express');
const router = express.Router();
const { getPool } = require('../db');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get all reviews for a specific provider
router.get('/provider/:providerId', async (req, res) => {
  try {
    const { providerId } = req.params;
    const pool = getPool();
    
    // Join with users to get the reviewer's name
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

// Get average rating and total count for a provider
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
      average_rating: parseFloat(stats.average_rating || 0).toFixed(1)
    });
  } catch (error) {
    console.error('Fetch Review Stats Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Submit a review (Simplified version)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { provider_id, rating, comment, booking_id } = req.body;
    const pool = getPool();
    
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
