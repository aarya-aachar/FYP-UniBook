const express = require('express');
const { getPool } = require('../config/db');
const { authenticateToken, verifyProvider } = require('../middleware/authMiddleware');

const router = express.Router();

// ─────────────────────────────────────────────────────────────
// GET /api/provider/profile
// Returns the provider's own provider record + application data
// ─────────────────────────────────────────────────────────────
router.get('/provider/profile', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [providers] = await pool.query(
      'SELECT p.*, pa.pan_number, pa.document_path FROM providers p LEFT JOIN provider_applications pa ON pa.email = p.name OR pa.name = p.name WHERE p.user_id = ?',
      [userId]
    );

    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider profile not found.' });
    }

    // Also get user info
    const [users] = await pool.query('SELECT id, name, email, profile_photo, created_at FROM users WHERE id = ?', [userId]);
    const user = users[0] || {};

    res.json({ ...providers[0], user_email: user.email, user_name: user.name, user_photo: user.profile_photo });
  } catch (err) {
    console.error('>>> [PROVIDER PROFILE ERROR]', err);
    res.status(500).json({ message: 'Failed to load provider profile.' });
  }
});

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer Setup ─────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `provider_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

const uploadImages = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) return res.status(400).json({ message: `Upload Error: ${err.message}` });
    next();
  });
};

// ─────────────────────────────────────────────────────────────
// PUT /api/provider/profile
// Update provider's own service details
// ─────────────────────────────────────────────────────────────
router.put('/provider/profile', authenticateToken, verifyProvider, uploadImages, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;
    const { description, address, base_price, opening_time, closing_time, capacity } = req.body;

    const fields = ['description = ?', 'address = ?', 'base_price = ?', 'opening_time = ?', 'closing_time = ?', 'capacity = ?'];
    const values = [description, address, base_price, opening_time, closing_time, capacity];

    // Handle Image Gallery Uploads
    let mergedGallery = [];
    let existingToKeep = [];
    
    if (req.body.existing_gallery) {
      try {
        const parsed = JSON.parse(req.body.existing_gallery);
        if (Array.isArray(parsed)) existingToKeep = parsed;
      } catch (e) {
        console.error("Failed to parse existing_gallery:", e);
      }
    }

    if (req.files && req.files.length > 0) {
      const newFiles = req.files.filter(f => f.fieldname === 'images');
      const newPaths = newFiles.map(f => `/uploads/${f.filename}`);
      mergedGallery = [...existingToKeep, ...newPaths].slice(0, 4);
    } else {
      mergedGallery = existingToKeep.slice(0, 4);
    }

    // Update image and gallery_images
    fields.push('image = ?');
    values.push(mergedGallery.length > 0 ? mergedGallery[0] : '');
    
    fields.push('gallery_images = ?');
    values.push(JSON.stringify(mergedGallery));

    values.push(userId);
    await pool.query(`UPDATE providers SET ${fields.join(', ')} WHERE user_id = ?`, values);

    res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('>>> [PROVIDER PROFILE UPDATE ERROR]', err);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/provider/bookings
// Returns all bookings for this provider's service
// ─────────────────────────────────────────────────────────────
router.get('/provider/bookings', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    // Get provider_id for this user
    const [providerRows] = await pool.query('SELECT id FROM providers WHERE user_id = ?', [userId]);
    if (providerRows.length === 0) {
      return res.status(404).json({ message: 'No provider linked to this account.' });
    }
    const providerId = providerRows[0].id;

    const [bookings] = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.provider_id = ?
       ORDER BY b.booking_date DESC, b.booking_time DESC`,
      [providerId]
    );

    res.json(bookings);
  } catch (err) {
    console.error('>>> [PROVIDER BOOKINGS ERROR]', err);
    res.status(500).json({ message: 'Failed to load bookings.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/provider/dashboard
// Returns summary stats for provider dashboard
// ─────────────────────────────────────────────────────────────
router.get('/provider/dashboard', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [providerRows] = await pool.query('SELECT id, name, category FROM providers WHERE user_id = ?', [userId]);
    if (providerRows.length === 0) {
      return res.status(404).json({ message: 'No provider linked to this account.' });
    }
    const provider = providerRows[0];
    const providerId = provider.id;
    const today = new Date().toISOString().split('T')[0];

    const [[{ total }]]     = await pool.query("SELECT COUNT(*) as total FROM bookings WHERE provider_id = ?", [providerId]);
    const [[{ upcoming }]]  = await pool.query("SELECT COUNT(*) as upcoming FROM bookings WHERE provider_id = ? AND booking_date >= ? AND status = 'confirmed'", [providerId, today]);
    const [[{ completed }]] = await pool.query("SELECT COUNT(*) as completed FROM bookings WHERE provider_id = ? AND booking_date < ?", [providerId, today]);
    const [[{ pending }]]   = await pool.query("SELECT COUNT(*) as pending FROM bookings WHERE provider_id = ? AND status = 'pending'", [providerId]);

    // Recent 5 bookings
    const [recent] = await pool.query(
      `SELECT b.*, u.name as user_name FROM bookings b JOIN users u ON b.user_id = u.id
       WHERE b.provider_id = ? ORDER BY b.created_at DESC LIMIT 5`,
      [providerId]
    );

    res.json({ provider, stats: { total, upcoming, completed, pending }, recentBookings: recent });
  } catch (err) {
    console.error('>>> [PROVIDER DASHBOARD ERROR]', err);
    res.status(500).json({ message: 'Failed to load dashboard.' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/provider/notifications
// Returns notifications only for this provider
// ─────────────────────────────────────────────────────────────
router.get('/provider/notifications', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [notifications] = await pool.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [userId]
    );

    res.json(notifications);
  } catch (err) {
    console.error('>>> [PROVIDER NOTIFICATIONS ERROR]', err);
    res.status(500).json({ message: 'Failed to load notifications.' });
  }
});

// ─────────────────────────────────────────────────────────────
// PUT /api/provider/notifications/:id/read
// Mark a provider notification as read
// ─────────────────────────────────────────────────────────────
router.put('/provider/notifications/:id/read', authenticateToken, verifyProvider, async (req, res) => {
  try {
    const pool = getPool();
    await pool.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark as read.' });
  }
});

module.exports = router;
