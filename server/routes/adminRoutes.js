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

module.exports = router;
