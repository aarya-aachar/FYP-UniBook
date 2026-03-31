const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// ─── Multer Setup (image upload) ─────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
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

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// ─── GET all providers ────────────────────────────────────────────────────────
router.get('/providers', async (req, res) => {
  try {
    const { category } = req.query;
    const pool = getPool();

    let query = 'SELECT * FROM providers ORDER BY created_at DESC';
    const params = [];

    if (category) {
      query = 'SELECT * FROM providers WHERE category = ? ORDER BY created_at DESC';
      params.push(category);
    }

    const [providers] = await pool.query(query, params);
    res.json(providers);
  } catch (error) {
    console.error('Fetch Providers Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ─── GET single provider ──────────────────────────────────────────────────────
router.get('/providers/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [providers] = await pool.query('SELECT * FROM providers WHERE id = ?', [req.params.id]);

    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const [services] = await pool.query('SELECT * FROM services WHERE provider_id = ?', [req.params.id]);
    const provider = providers[0];
    provider.services = services;

    res.json(provider);
  } catch (error) {
    console.error('Fetch Single Provider Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ─── POST create provider (admin only, with optional image upload) ─────────────
router.post('/providers', authenticateToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, address } = req.body;

    if (!name || !address || !category) {
      return res.status(400).json({ message: 'Name, address, and category are required' });
    }

    const imageUrl = req.file
      ? `/uploads/${req.file.filename}`
      : (req.body.imageUrl || '/images/default.jpg');

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO providers (name, category, description, image, address) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), category, description || '', imageUrl, address.trim()]
    );

    res.status(201).json({ message: 'Provider created successfully', id: result.insertId, imageUrl });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A provider with this name already exists' });
    }
    console.error('Create Provider Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ─── PUT update provider (admin only, with optional image upload) ──────────────
router.put('/providers/:id', authenticateToken, verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, address } = req.body;
    const pool = getPool();

    // Check duplicate name (exclude self)
    if (name) {
      const [existing] = await pool.query(
        'SELECT id FROM providers WHERE name = ? AND id != ?',
        [name.trim(), req.params.id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: 'A provider with this name already exists' });
      }
    }

    // Build update fields dynamically
    const fields = [];
    const values = [];

    if (name)        { fields.push('name = ?');        values.push(name.trim()); }
    if (category)    { fields.push('category = ?');    values.push(category); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (address)     { fields.push('address = ?');     values.push(address.trim()); }
    if (req.file)    { fields.push('image = ?');       values.push(`/uploads/${req.file.filename}`); }

    if (fields.length === 0) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    values.push(req.params.id);
    const [result] = await pool.query(
      `UPDATE providers SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // Return updated image if changed
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    res.json({ message: 'Provider updated successfully', imageUrl });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Provider name must be unique' });
    }
    console.error('Update Provider Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// ─── DELETE provider (admin only) ─────────────────────────────────────────────
router.delete('/providers/:id', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();

    // Clean up uploaded image if exists
    const [providers] = await pool.query('SELECT image FROM providers WHERE id = ?', [req.params.id]);
    if (providers.length > 0 && providers[0].image?.startsWith('/uploads/')) {
      const imgPath = path.join(__dirname, '..', providers[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    const [result] = await pool.query('DELETE FROM providers WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    res.json({ message: 'Provider deleted successfully' });
  } catch (error) {
    console.error('Delete Provider Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
