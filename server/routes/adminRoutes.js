const express = require('express');
const { getPool } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/admin/metrics', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    
    // 1. Total Counts
    const [[{ usersCount }]] = await pool.query('SELECT COUNT(*) as usersCount FROM users');
    const [[{ providersCount }]] = await pool.query('SELECT COUNT(*) as providersCount FROM providers');
    const [[{ bookingsCount }]] = await pool.query('SELECT COUNT(*) as bookingsCount FROM bookings');
    
    // 2. LIVE Revenue Calculation
    const [[{ totalRevenue }]] = await pool.query(`
      SELECT COALESCE(SUM(p.base_price), 0) as totalRevenue 
      FROM bookings b 
      LEFT JOIN providers p ON b.provider_id = p.id 
      WHERE b.status = 'confirmed'
    `);

    // 3. Revenue Trends (last 14 days)
    const [revenueTrends] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%m-%d') as name, COALESCE(SUM(revenue_total), 0) as value 
      FROM (
        SELECT b.created_at, p.base_price as revenue_total 
        FROM bookings b 
        LEFT JOIN providers p ON b.provider_id = p.id 
        WHERE b.status = 'confirmed' AND b.created_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
      ) as daily 
      GROUP BY DATE_FORMAT(created_at, '%m-%d') 
      ORDER BY name ASC
    `);

    // 4. Recent Activity (last 5 bookings)
    const [recentActivity] = await pool.query(`
      SELECT b.id, u.name as user, p.name as provider, b.status, b.created_at 
      FROM bookings b 
      LEFT JOIN users u ON b.user_id = u.id 
      LEFT JOIN providers p ON b.provider_id = p.id 
      ORDER BY b.created_at DESC 
      LIMIT 5
    `);

    // 5. Provider breakdown for chart
    const [breakdown] = await pool.query('SELECT category as name, COUNT(*) as value FROM providers GROUP BY category');

    res.json({
      totals: {
        users: usersCount,
        providers: providersCount,
        bookings: bookingsCount,
        revenue: parseFloat(totalRevenue || 0)
      },
      chartData: breakdown,
      revenueTrends: revenueTrends,
      recentActivity: recentActivity
    });
  } catch (error) {
    console.error('Admin Metrics Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ─── GET all users for management ─────────────────────────────────────────────
router.get('/admin/users', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    console.log('Admin: Fetching all users...');
    const [users] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    console.log(`Admin: Found ${users.length} users.`);
    res.json(users);
  } catch (error) {
    console.error('Admin Fetch Users SQL Error:', error);
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
});

// ─── PATCH update user status (Active/Inactive) ──────────────────────────────
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

// ─── PATCH update user role (Admin/User) ────────────────────────────────────
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

// ─── GET full reports and analytics (Stats Dashboard) ────────────────────────
router.get('/admin/reports/full', authenticateToken, verifyAdmin, async (req, res) => {
  console.log('>>> [SERVER] API RECEIVED: /api/admin/reports/full <<<');
  try {
    const pool = getPool();
    
    // 1. Total Revenue
    const [[{ total_revenue }]] = await pool.query(`
      SELECT COALESCE(SUM(p.base_price), 0) as total_revenue 
      FROM bookings b 
      LEFT JOIN providers p ON b.provider_id = p.id 
      WHERE b.status = 'confirmed'
    `);

    // 2. Booking Trends
    const [trends] = await pool.query(`
      SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as dr_date, COUNT(*) as count 
      FROM bookings 
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d') 
      ORDER BY dr_date ASC 
      LIMIT 30
    `);

    // 3. Revenue by Category
    const [categories] = await pool.query(`
      SELECT p.category as name, COALESCE(SUM(p.base_price), 0) as value 
      FROM bookings b 
      LEFT JOIN providers p ON b.provider_id = p.id 
      WHERE b.status = 'confirmed' AND p.category IS NOT NULL
      GROUP BY p.category
    `);

    // 4. Top Performers
    const [performers] = await pool.query(`
      SELECT p.name, p.category, COUNT(*) as bookings, COALESCE(SUM(p.base_price), 0) as revenue 
      FROM bookings b 
      LEFT JOIN providers p ON b.provider_id = p.id 
      WHERE b.status = 'confirmed' AND p.id IS NOT NULL
      GROUP BY p.id, p.name, p.category 
      ORDER BY revenue DESC 
      LIMIT 10
    `);

    // 5. Overall Stats
    const [[{ confirmedCount }]] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'confirmed'");
    const [[{ totalBookings }]] = await pool.query("SELECT COUNT(*) as count FROM bookings");
    const health = totalBookings > 0 ? (confirmedCount / totalBookings) * 100 : 100;

    res.json({
      summary: {
        total_revenue: parseFloat(total_revenue || 0),
        total_bookings: totalBookings,
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

// ─── GET User Report Data (for export) ────────────────────────────────────────
router.get('/admin/reports/users/export', authenticateToken, verifyAdmin, async (req, res) => {
  console.log('--- ENTERING /admin/reports/users/export ---');
  try {
    const pool = getPool();
    const [users] = await pool.query('SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC');
    res.json(users || []);
  } catch (error) {
    console.error('User Export Error:', error);
    res.status(500).json({ message: 'Database Error: ' + error.message });
  }
});

// ─── GET Booking Report Data (for export) ─────────────────────────────────────
router.get('/admin/reports/bookings/export', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const [bookings] = await pool.query(`
      SELECT b.id, u.name as user_name, p.name as provider_name, p.category, 
             b.booking_date, b.booking_time, b.status, p.base_price as revenue
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN providers p ON b.provider_id = p.id
      ORDER BY b.created_at DESC
    `);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch booking export data' });
  }
});

// ─── GET Provider Report Data (for export) ────────────────────────────────────
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
