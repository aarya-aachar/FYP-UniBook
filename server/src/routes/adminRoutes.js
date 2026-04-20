/**
 * Admin Dashboard & Management Routes
 * 
 * relative path: /api/admin
 * 
 * This file is the "Command Center" for System Administrators.
 * It provides the data needed for:
 * - High-level metrics (Total revenue, user count)
 * - User and Provider management (Banning, promoting, and status updates)
 * - Advanced Analytics (Trends, category breakdown, top businesses)
 * - Data Export (CSV/Report data generation)
 */

const express = require('express');
const { getPool } = require('../config/db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route GET /api/admin/metrics
 * @desc Data for the main Dashboard overview cards and recent activity feed
 */
router.get('/admin/metrics', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();

    // 1. Fetch raw data from various tables to calculate totals
    const [users] = await pool.query('SELECT id FROM users');
    const [providers] = await pool.query('SELECT id, category FROM providers');
    const [rawBookings] = await pool.query(`
      SELECT paid_amount, created_at, 
             DATE_FORMAT(booking_date, '%Y-%m-%d') as booking_date
      FROM bookings 
      WHERE status = 'confirmed'
    `);

    // 2. Aggregate final totals for the dashboard widgets
    const totals = {
      users: users.length,
      providers: providers.length,
      revenue: Math.round(rawBookings.reduce((sum, b) => sum + parseFloat(b.paid_amount || 0), 0) * 100) / 100
    };

    // 3. Trends & Breakdown Analysis
    // We look at the last 14 days to show how the system is growing
    const trendsMap = {}; 
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    rawBookings.forEach(b => {
      const bDate = new Date(b.created_at);
      if (bDate >= fourteenDaysAgo) {
        // Group revenue by date (excluding the time part)
        const key = bDate.toISOString().split('T')[0].slice(5);
        trendsMap[key] = (trendsMap[key] || 0) + parseFloat(b.paid_amount || 0);
      }
    });

    // Count how many providers we have in each business category
    const breakdownMap = {};
    providers.forEach(p => { breakdownMap[p.category] = (breakdownMap[p.category] || 0) + 1; });

    // 4. Fetch the latest 5 successful bookings to show on the "Recent Activity" list
    const [recentRaw] = await pool.query(`
      SELECT b.id, u.name as user, p.name as provider, b.status, b.created_at 
      FROM bookings b 
      LEFT JOIN users u ON b.user_id = u.id 
      LEFT JOIN providers p ON b.provider_id = p.id 
      WHERE b.status = 'confirmed'
      ORDER BY b.created_at DESC 
      LIMIT 5
    `);

    res.json({
      totals,
      chartData: Object.entries(breakdownMap).map(([name, value]) => ({ name, value })),
      revenueTrends: Object.entries(trendsMap).map(([name, value]) => ({ name, value })).sort((a, b) => a.name.localeCompare(b.name)),
      recentActivity: recentRaw
    });
  } catch (error) {
    console.error('Admin Metrics Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/admin/users
 * @desc Get a list of all accounts for the management table
 */
router.get('/admin/users', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    // Return all users, newest first
    const [users] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Admin Fetch Users SQL Error:', error);
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
});

/**
 * @route PATCH /api/admin/users/:id/status
 * @desc Ban or Unban a user by toggling their 'is_active' status
 */
router.patch('/admin/users/:id/status', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    const pool = getPool();

    const [result] = await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User ${is_active ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Admin Update User Status Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route PATCH /api/admin/users/:id/role
 * @desc Change a user's permissions (e.g. promoting a regular user to an Admin)
 */
router.patch('/admin/users/:id/role', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const pool = getPool();
    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: `User promoted to ${role} successfully` });
  } catch (error) {
    console.error('Admin Update User Role Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/admin/reports/full
 * @desc Complex analytics engine for the system report page
 */
router.get('/admin/reports/full', authenticateToken, verifyAdmin, async (req, res) => {

  try {
    const pool = getPool();

    // 1. Calculate Lifetime Revenue across all categories
    const [[{ total_revenue }]] = await pool.query(`
      SELECT COALESCE(SUM(paid_amount), 0) as total_revenue 
      FROM bookings 
      WHERE status = 'confirmed'
    `);

    // 2. Performance Trends (Daily volume of bookings)
    const [trends] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as dr_date, COUNT(*) as count 
      FROM bookings 
      WHERE status = 'confirmed'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
      ORDER BY dr_date ASC 
      LIMIT 30
    `);

    // 3. Category Breakdown - See where the money is coming from
    const [categories] = await pool.query(`
      SELECT p.category as name, COALESCE(SUM(b.paid_amount), 0) as value 
      FROM bookings b 
      LEFT JOIN providers p ON b.provider_id = p.id 
      WHERE b.status = 'confirmed' AND p.category IS NOT NULL
      GROUP BY p.category
    `);

    // 4. Top Performing Providers (Rank by revenue)
    const [performers] = await pool.query(`
      SELECT p.name, p.category, COUNT(*) as bookings, COALESCE(SUM(b.paid_amount), 0) as revenue 
      FROM bookings b 
      LEFT JOIN providers p ON b.provider_id = p.id 
      WHERE b.status = 'confirmed' AND p.id IS NOT NULL
      GROUP BY p.id, p.name, p.category 
      ORDER BY revenue DESC 
      LIMIT 10
    `);

    // 5. Overall System Health Stats
    const [[{ confirmedCount }]] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");
    const health = 100; 

    res.json({
      summary: {
        total_revenue: parseFloat(total_revenue || 0),
        total_bookings: confirmedCount,
        health_score: Math.round(health),
        active_providers: performers.length
      },
      trends: trends.map(t => ({ date: t.dr_date, count: t.count })) || [],
      categories: categories || [],
      performers: performers || []
    });
  } catch (error) {
    console.error('--- ANALYTICS SQL CRASH ---');
    console.error(error);
    res.status(500).json({ message: 'Database query failed: ' + error.message });
  }
});

/**
 * --- DATA EXPORT ENDPOINTS ---
 * These return plain JSON data formatted for easy conversion to PDF/CSV on the client side.
 */

// Export Users list
router.get('/admin/reports/users/export', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const [users] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(users || []);
  } catch (error) {
    console.error('User Export Error:', error);
    res.status(500).json({ message: 'Database Error: ' + error.message });
  }
});

// Export Booking history
router.get('/admin/reports/bookings/export', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const [bookings] = await pool.query(`
      SELECT b.id, u.name as user_name, p.name as provider_name, p.category, 
             b.booking_date, b.booking_time, b.status, p.base_price as revenue
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN providers p ON b.provider_id = p.id
      WHERE b.status = 'confirmed'
      ORDER BY b.created_at DESC
    `);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking export data' });
  }
});

// Export Provider directory
router.get('/admin/reports/providers/export', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const [providers] = await pool.query(`
      SELECT id, name, category, address, base_price, opening_time, closing_time 
      FROM providers 
      ORDER BY category ASC
    `);
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch provider export data' });
  }
}); 

module.exports = router;
