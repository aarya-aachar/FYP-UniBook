const express = require('express');
const { getPool } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/admin/metrics', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    
    const [[{ usersCount }]] = await pool.query('SELECT COUNT(*) as usersCount FROM users');
    const [[{ providersCount }]] = await pool.query('SELECT COUNT(*) as providersCount FROM providers');
    const [[{ bookingsCount }]] = await pool.query('SELECT COUNT(*) as bookingsCount FROM bookings');
    
    // get providers breakdown for pie chart
    const [breakdown] = await pool.query('SELECT category as name, COUNT(*) as value FROM providers GROUP BY category');

    res.json({
      totals: {
        users: usersCount,
        providers: providersCount,
        bookings: bookingsCount,
        reports: 0 // Mock open reports for now
      },
      chartData: breakdown
    });
  } catch (error) {
    console.error('Admin Metrics Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
