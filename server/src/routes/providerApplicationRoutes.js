const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../config/db');
const { authenticateToken, verifyAdmin } = require('../middleware/authMiddleware');
const { sendProviderApproved, sendProviderRejected, sendProviderApplicationReceived } = require('../services/emailService');
const { createOTP, verifyOTP, sendOTPEmail } = require('../services/otpService');

const router = express.Router();

// --- Multer Setup for Provider Documents ---
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'provider-docs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `doc_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// ─────────────────────────────────────────────────────────────
// PUBLIC: Provider Self-Registration
// POST /api/provider/apply
// ─────────────────────────────────────────────────────────────
router.post('/provider/apply', upload.fields([
  { name: 'document', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), async (req, res) => {
  try {
    const { name, email, password, pan_number, service_type, address, description, base_price, opening_time, closing_time, capacity } = req.body;

    if (!name || !email || !password || !pan_number || !service_type) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const pool = getPool();

    // Check availability
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) return res.status(409).json({ message: 'Email already registered.' });

    const [existingApps] = await pool.query('SELECT status FROM provider_applications WHERE email = ?', [email]);
    if (existingApps.length > 0) {
      if (existingApps[0].status === 'pending') {
        return res.status(409).json({ message: 'An application with this email is already under review.' });
      }
      if (existingApps[0].status === 'approved') {
        return res.status(409).json({ message: 'This email is already associated with an approved provider.' });
      }
      // If status is 'rejected', we silently allow them to proceed and re-apply!
    }

    // Store in OTP memory
    const document_path = req.files?.document?.[0]?.filename ? `/uploads/provider-docs/${req.files.document[0].filename}` : null;
    const image_path = req.files?.image?.[0]?.filename ? `/uploads/provider-docs/${req.files.image[0].filename}` : null;

    const applicationData = {
      name, email, password, pan_number, service_type, address, description, 
      base_price, opening_time, closing_time, capacity, document_path, image_path
    };

    const otp = createOTP(email, applicationData);
    await sendOTPEmail(email, otp, 'Verify your Business Application');

    res.json({ message: 'Verification code sent to email.' });
  } catch (err) {
    console.error('>>> [PROVIDER SEND OTP ERROR]', err);
    res.status(500).json({ message: 'Failed to send verification code.' });
  }
});

/**
 * Finalize registration after OTP verification
 */
router.post('/provider/apply/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { valid, data, message } = verifyOTP(email, otp);

    if (!valid) return res.status(400).json({ message });

    const pool = getPool();
    const password_hash = await bcrypt.hash(data.password, 10);

    // Safely remove any previously rejected application so the UNIQUE email constraint doesn't fail
    await pool.query('DELETE FROM provider_applications WHERE email = ? AND status = ?', [data.email, 'rejected']);

    await pool.query(
      `INSERT INTO provider_applications 
       (name, email, password_hash, pan_number, service_type, address, description, base_price, opening_time, closing_time, capacity, document_path, image_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [data.name, data.email, password_hash, data.pan_number, data.service_type, data.address || '', data.description || '', data.base_price || 0, data.opening_time || '09:00', data.closing_time || '18:00', data.capacity || 1, data.document_path, data.image_path]
    );

    await sendProviderApplicationReceived(data.email, data.name);
    res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('>>> [PROVIDER VERIFY ERROR]', err);
    res.status(500).json({ message: 'Final verification failed.' });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN: List all provider applications
// GET /api/admin/provider-applications
// ─────────────────────────────────────────────────────────────
router.get('/admin/provider-applications', authenticateToken, verifyAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const [applications] = await pool.query(
      'SELECT * FROM provider_applications ORDER BY created_at DESC'
    );
    res.json(applications);
  } catch (err) {
    console.error('>>> [PROVIDER APPS LIST ERROR]', err);
    res.status(500).json({ message: 'Failed to load applications.' });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN: Approve a provider application
// POST /api/admin/provider-applications/:id/approve
// ─────────────────────────────────────────────────────────────
router.post('/admin/provider-applications/:id/approve', authenticateToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const pool = getPool();

  try {
    const [apps] = await pool.query('SELECT * FROM provider_applications WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'Application not found.' });
    const app = apps[0];

    if (app.status !== 'pending') {
      return res.status(400).json({ message: `Application is already ${app.status}.` });
    }

    // 1. Create the user account with role='provider'
    const [userResult] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'provider')",
      [app.name, app.email, app.password_hash]
    );
    const newUserId = userResult.insertId;

    // 2. Create the provider record linked to this user
    await pool.query(
      `INSERT INTO providers (user_id, application_id, name, category, description, image, address, base_price, opening_time, closing_time, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newUserId, id, app.name, app.service_type, app.description || '', app.image_path || '', app.address || '', app.base_price, app.opening_time, app.closing_time, app.capacity]
    );

    // 3. Mark application as approved
    await pool.query("UPDATE provider_applications SET status = 'approved' WHERE id = ?", [id]);

    // 4. Send approval email
    await sendProviderApproved(app.email, app.name);

    console.log(`>>> [ADMIN] Approved provider application #${id} - Created user #${newUserId}`);
    res.json({ message: `Provider "${app.name}" approved successfully. Login credentials sent via email.` });
  } catch (err) {
    console.error('>>> [PROVIDER APPROVE ERROR]', err);
    res.status(500).json({ message: 'Failed to approve application.' });
  }
});

// ─────────────────────────────────────────────────────────────
// ADMIN: Reject a provider application
// POST /api/admin/provider-applications/:id/reject
// ─────────────────────────────────────────────────────────────
router.post('/admin/provider-applications/:id/reject', authenticateToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const pool = getPool();

  try {
    const [apps] = await pool.query('SELECT * FROM provider_applications WHERE id = ?', [id]);
    if (apps.length === 0) return res.status(404).json({ message: 'Application not found.' });
    const app = apps[0];

    await pool.query(
      "UPDATE provider_applications SET status = 'rejected', rejection_reason = ? WHERE id = ?",
      [reason || '', id]
    );

    await sendProviderRejected(app.email, app.name, reason);

    console.log(`>>> [ADMIN] Rejected provider application #${id}`);
    res.json({ message: `Application from "${app.name}" has been rejected.` });
  } catch (err) {
    console.error('>>> [PROVIDER REJECT ERROR]', err);
    res.status(500).json({ message: 'Failed to reject application.' });
  }
});

module.exports = router;
