/**
 * Provider Directory & Management Routes
 * 
 * relative path: /api/providers
 * 
 * This file handles the "Public Catalog" of businesses (Hospitals, Futsals, etc.)
 * and allows Admins to manage these listings.
 * 
 * Key Features:
 * - Public searching/filtering of service providers.
 * - Multi-image gallery uploads using Multer.
 * - Logic for merging new photo uploads with existing ones during updates.
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../config/db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * --- MULTER SETUP ---
 * Configures how we save business banners and gallery photos.
 * Files are stored in the root '/uploads' directory.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Navigate up to the root project directory's 'uploads' folder
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename using a timestamp to prevent overwriting
    const uniqueName = `provider_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

/**
 * Filter out any non-image files to keep the storage clean.
 */
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  allowed.includes(file.mimetype) ? cb(null, true) : cb(new Error('Only images are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Custom wrapper to handle multiple file fields and catch errors gracefully
const uploadImages = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('>>> [MULTER ERROR]:', err);
      return res.status(400).json({ message: `Upload Error: ${err.message}` });
    } else if (err) {
      console.error('>>> [UPLOAD ERROR]:', err);
      return res.status(400).json({ message: `Server Error: ${err.message}` });
    }
    next();
  });
};

/**
 * @route GET /api/providers
 * @desc Public route to fetch businesses. Supports filtering by category and 
 *       hides inactive businesses unless requested by an Admin.
 */
router.get('/providers', async (req, res) => {
  try {
    const { category } = req.query;
    const pool = getPool();

    // Check if the requester wants to see hidden/inactive businesses (Admin view)
    const showAll = req.query.all === 'true';
    const activeFilter = showAll ? '1=1' : 'p.is_active = TRUE';

    // Core query to fetch provider details + their average rating/review count
    let query = `
      SELECT p.*, 
             (SELECT COUNT(*) FROM reviews WHERE provider_id = p.id) as review_count,
             (SELECT AVG(rating) FROM reviews WHERE provider_id = p.id) as average_rating
      FROM providers p
      WHERE ${activeFilter}
      ORDER BY p.created_at DESC
    `;
    const params = [];

    // Filter by category if the user clicked a specific category on the homepage
    if (category) {
      query = `
        SELECT p.*, 
               (SELECT COUNT(*) FROM reviews WHERE provider_id = p.id) as review_count,
               (SELECT AVG(rating) FROM reviews WHERE provider_id = p.id) as average_rating
        FROM providers p
        WHERE ${activeFilter} AND p.category = ?
        ORDER BY p.created_at DESC
      `;
      params.push(category);
    }

    const [providers] = await pool.query(query, params);
    
    // Clean up the numbers (rounding stars to 1 decimal place) before sending to React
    const formattedProviders = providers.map(p => ({
      ...p,
      average_rating: parseFloat(p.average_rating || 0).toFixed(1),
      review_count: parseInt(p.review_count || 0)
    }));

    res.json(formattedProviders);
  } catch (error) {
    console.error('Fetch Providers Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/providers/:id
 * @desc Fetch detailed data for a specific business (used on the Service Details page)
 */
router.get('/providers/:id', async (req, res) => {
  try {
    const pool = getPool();
    const [providers] = await pool.query(`
      SELECT p.*, 
             (SELECT COUNT(*) FROM reviews WHERE provider_id = p.id) as review_count,
             (SELECT AVG(rating) FROM reviews WHERE provider_id = p.id) as average_rating
      FROM providers p
      WHERE p.id = ?
    `, [req.params.id]);

    if (providers.length === 0) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const provider = providers[0];
    provider.average_rating = parseFloat(provider.average_rating || 0).toFixed(1);
    provider.review_count = parseInt(provider.review_count || 0);

    res.json(provider);
  } catch (error) {
    console.error('Fetch Single Provider Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route POST /api/providers
 * @desc Admin only: Manually create a new business listing. 
 *       Also handles multiple image uploads for the business gallery.
 */
router.post('/providers', authenticateToken, verifyAdmin, uploadImages, async (req, res) => {
  try {
    const { name, category, description, address, base_price, opening_time, closing_time, capacity } = req.body;

    if (!name || !address || !category) {
      return res.status(400).json({ message: 'Name, address, and category are required' });
    }

    // Convert the uploaded files into a list of accessible URL paths
    const galleryPaths = (req.files || [])
      .filter(f => f.fieldname === 'images')
      .map(f => `/uploads/${f.filename}`);
      
    const primaryImage = galleryPaths.length > 0 ? galleryPaths[0] : '/images/default.jpg';
    
    // We store the gallery as a JSON string in MySQL for easy retrieval
    const galleryJson = JSON.stringify(galleryPaths.length > 0 ? galleryPaths : [primaryImage]);

    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO providers (name, category, description, image, gallery_images, address, base_price, opening_time, closing_time, capacity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        name.trim(), 
        category, 
        description || '', 
        primaryImage,
        galleryJson,
        address.trim(), 
        base_price || 0, 
        opening_time || '09:00:00', 
        closing_time || '18:00:00',
        capacity ? parseInt(capacity) : 1
      ]
    );

    res.status(201).json({ message: 'Provider created successfully', id: result.insertId, imageUrl: primaryImage });

    // Send an alert notification to other admins so they know a new business was added
    try {
      const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin' AND id != ?", [req.user.id]);
      const creatorName = req.user.name || 'An admin';
      for (const admin of admins) {
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
          [admin.id, 'provider_added', 'New Provider Added', `${creatorName} added a new provider: "${name.trim()}".`, JSON.stringify({ provider_id: result.insertId })]
        );
      }
    } catch (notifErr) {
      console.error('Provider notification error (non-fatal):', notifErr.message);
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'A provider with this name already exists' });
    }
    console.error('Create Provider Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route PUT /api/providers/:id
 * @desc Admin only: Update an existing business. 
 *       This logic is sophisticated because it handles MERGING newly uploaded 
 *       photos with existing ones while keeping a maximum of 4 photos.
 */
router.put('/providers/:id', authenticateToken, verifyAdmin, uploadImages, async (req, res) => {
  try {
    const { name, category, description, address, base_price, opening_time, closing_time, capacity } = req.body;
    const pool = getPool();

    // Prevent name duplicates when renaming a business
    if (name) {
      const [existing] = await pool.query(
        'SELECT id FROM providers WHERE name = ? AND id != ?',
        [name.trim(), req.params.id]
      );
      if (existing.length > 0) {
        return res.status(400).json({ message: 'A provider with this name already exists' });
      }
    }

    // Build the SQL update string dynamically based on what fields changed
    const fields = [];
    const values = [];

    if (name)        { fields.push('name = ?');        values.push(name.trim()); }
    if (category)    { fields.push('category = ?');    values.push(category); }
    if (description !== undefined) { fields.push('description = ?'); values.push(description); }
    if (address)     { fields.push('address = ?');     values.push(address.trim()); }
    if (base_price !== undefined)  { fields.push('base_price = ?');   values.push(base_price); }
    if (opening_time) { fields.push('opening_time = ?'); values.push(opening_time); }
    if (closing_time) { fields.push('closing_time = ?'); values.push(closing_time); }
    if (capacity !== undefined) { fields.push('capacity = ?'); values.push(parseInt(capacity)); }
    
    let imageUrl = null;
    
    /**
     * --- GALLERY MERGE LOGIC ---
     * 1. Get the list of 'Existing photos' the admin wants to keep.
     * 2. Identify the 'Newly uploaded' files.
     * 3. Combine them and limit the total to 4 images.
     */
    if (req.files && req.files.length > 0) {
      let existingToKeep = [];
      try {
        if (req.body.existing_gallery) {
          existingToKeep = JSON.parse(req.body.existing_gallery);
        }
      } catch (e) { console.error('Error parsing existing_gallery', e); }

      const newFiles = req.files.filter(f => f.fieldname === 'images');
      const newPaths = newFiles.map(f => `/uploads/${f.filename}`);

      // Combine existing first, then new ones
      const mergedGallery = [...existingToKeep, ...newPaths].slice(0, 4);

      if (mergedGallery.length > 0) {
        imageUrl = mergedGallery[0]; // First image is the "Banner"
        fields.push('image = ?');
        values.push(imageUrl);
        fields.push('gallery_images = ?');
        values.push(JSON.stringify(mergedGallery));
      }
    } else if (req.body.existing_gallery) {
      // If no new files, just re-save the rearranged gallery order
      try {
        const existingToKeep = JSON.parse(req.body.existing_gallery);
        if (existingToKeep.length > 0) {
           imageUrl = existingToKeep[0];
           fields.push('image = ?'); values.push(imageUrl);
           fields.push('gallery_images = ?'); values.push(JSON.stringify(existingToKeep));
        }
      } catch (e) {}
    }

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

    res.json({ message: 'Provider updated successfully', imageUrl, version: '2.0-merged' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Provider name must be unique' });
    }
    console.error('Update Provider Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route PATCH /api/providers/:id/status
 * @desc Admin only: Toggle a business Between "Active" and "Deactivated".
 *       When deactivating, we also restrict the login access of the associated 
 *       Provider user for security.
 */
router.patch('/providers/:id/status', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const { is_active } = req.body;
    const pool = getPool();

    // Find the real user account linked to this business
    const [pRows] = await pool.query('SELECT user_id FROM providers WHERE id = ?', [req.params.id]);
    let targetUserId = null;

    if (pRows.length > 0) {
      targetUserId = pRows[0].user_id;
    } else {
      return res.status(404).json({ message: 'Provider not found' });
    }

    // 1. Update business listing status
    await pool.query('UPDATE providers SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, req.params.id]);
    
    // 2. Sync the user's role: If active, they are a 'provider'. If deactivated, they are 'restricted'.
    if (targetUserId) {
      const [uRows] = await pool.query('SELECT email, name FROM users WHERE id = ?', [targetUserId]);
      if (uRows.length > 0) {
         const user = uRows[0];
         await pool.query("UPDATE users SET role = ? WHERE id = ?", [is_active ? 'provider' : 'restricted', targetUserId]);
         
         // If we are banning them, send an email alert
         if (!is_active) {
           const { sendProviderDeleted } = require('../services/emailService');
           await sendProviderDeleted(user.email, user.name);
         }
      }
    }

    res.json({ message: `Provider ${is_active ? 'activated' : 'deactivated'} successfully.` });
  } catch (error) {
    console.error('Toggle Provider Status Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
