/**
 * Business Onboarding (Provider Applications) Routes
 * 
 * relative path: /api/provider/apply
 * 
 * This system allows new businesses (like Futsals, Hospitals, or Event Venues)
 * to apply to join the UniBook platform. 
 * 
 * Process:
 * 1. Business submits details & legal documents (OTP sent).
 * 2. Business verifies email.
 * 3. Application enters a "Pending" state in the Admin Dashboard.
 * 4. Admin reviews documents and checks the PAN number.
 * 5. Admin Approves (Account Created) or Rejects (Email sent with reason).
 */

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

/**
 * --- STORAGE FOR BUSINESS DOCUMENTS ---
 * PAN cards and business licenses are saved to "uploads/provider-docs".
 * Access to these should ideally be restricted to Admins only.
 */
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'provider-docs');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    // Label files as 'doc' with a timestamp for easy tracking
    const ext = path.extname(file.originalname);
    cb(null, `doc_${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit for high-res docs

/**
 * @route POST /api/provider/apply
 * @desc PUBLIC: Step 1 of joining as a partner. 
 *       We collect business details and legal proof (PAN/Registration).
 */
router.post('/provider/apply', upload.fields([
  { name: 'document', maxCount: 1 }, // Business Registration / PAN
  { name: 'image', maxCount: 1 }    // Business Banner
]), async (req, res) => {
  try {
    const { name, email, password, pan_number, service_type, address, description, base_price, opening_time, closing_time, capacity } = req.body;

    if (!name || !email || !password || !pan_number || !service_type) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const pool = getPool();

    // Prevent duplicate registrations or multiple pending applications from the same email
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
    }

    // Capture the file paths so we can use them after the user enters their OTP
    const document_path = req.files?.document?.[0]?.filename ? `/uploads/provider-docs/${req.files.document[0].filename}` : null;
    const image_path = req.files?.image?.[0]?.filename ? `/uploads/provider-docs/${req.files.image[0].filename}` : null;

    const applicationData = {
      name, email, password, pan_number, service_type, address, description, 
      base_price, opening_time, closing_time, capacity, document_path, image_path
    };

    /**
     * Store the application in memory (via OTP service) temporarily.
     * This prevents filling the DB with "Ghost" applications from unverified emails.
     */
    const otp = createOTP(email, applicationData);
    await sendOTPEmail(email, otp, 'Verify your Business Application');

    res.json({ message: 'Verification code sent to email.' });
  } catch (err) {
    console.error('>>> [PROVIDER SEND OTP ERROR]', err);
    res.status(500).json({ message: 'Failed to send verification code.' });
  }
});

/**
 * @route POST /api/provider/apply/verify
 * @desc PUBLIC: Step 2. User enters OTP. If correct, their application is saved to the DB.
 */
router.post('/provider/apply/verify', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const { valid, data, message } = verifyOTP(email, otp);

    if (!valid) return res.status(400).json({ message });

    const pool = getPool();
    // Safety first: hash the suggested password for the future account
    const password_hash = await bcrypt.hash(data.password, 10);

    // If they were rejected before, we overwrite the old rejection with this new application
    await pool.query('DELETE FROM provider_applications WHERE email = ? AND status = ?', [data.email, 'rejected']);

    // Save to provider_applications table for Admin review
    await pool.query(
      `INSERT INTO provider_applications 
       (name, email, password_hash, pan_number, service_type, address, description, base_price, opening_time, closing_time, capacity, document_path, image_path, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [data.name, data.email, password_hash, data.pan_number, data.service_type, data.address || '', data.description || '', data.base_price || 0, data.opening_time || '09:00', data.closing_time || '18:00', data.capacity || 1, data.document_path, data.image_path]
    );

    // Inform the user we got their application
    await sendProviderApplicationReceived(data.email, data.name);
    res.status(201).json({ message: 'Application submitted successfully.' });
  } catch (err) {
    console.error('>>> [PROVIDER VERIFY ERROR]', err);
    res.status(500).json({ message: 'Final verification failed.' });
  }
});

/**
 * @route GET /api/admin/provider-applications
 * @desc ADMIN: Fetch the queue of businesses waiting for approval.
 */
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

/**
 * @route POST /api/admin/provider-applications/:id/approve
 * @desc ADMIN: Approve the partner. This triggers multiple "Birth" events:
 *       1. A User account is created.
 *       2. A Provider profile is created.
 *       3. A Welcome email is sent.
 */
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

    // 1. Create the account with 'provider' role permissions
    const [userResult] = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'provider')",
      [app.name, app.email, app.password_hash]
    );
    const newUserId = userResult.insertId;

    // 2. Create the business profile visible to users
    await pool.query(
      `INSERT INTO providers (user_id, application_id, name, category, description, image, address, base_price, opening_time, closing_time, capacity)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [newUserId, id, app.name, app.service_type, app.description || '', app.image_path || '', app.address || '', app.base_price, app.opening_time, app.closing_time, app.capacity]
    );

    // 3. Update the internal tracker
    await pool.query("UPDATE provider_applications SET status = 'approved' WHERE id = ?", [id]);

    // 4. Send the happy news via email!
    await sendProviderApproved(app.email, app.name);

    console.log(`>>> [ADMIN] Approved provider application #${id} - Created user #${newUserId}`);
    res.json({ message: `Provider "${app.name}" approved successfully. Login credentials sent via email.` });
  } catch (err) {
    console.error('>>> [PROVIDER APPROVE ERROR]', err);
    res.status(500).json({ message: 'Failed to approve application.' });
  }
});

/**
 * @route POST /api/admin/provider-applications/:id/reject
 * @desc ADMIN: Reject the partner. We log the reason and inform the user.
 */
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

    // Send the rejection email explaining why (e.g. "Blurry ID card")
    await sendProviderRejected(app.email, app.name, reason);

    console.log(`>>> [ADMIN] Rejected provider application #${id}`);
    res.json({ message: `Application from "${app.name}" has been rejected.` });
  } catch (err) {
    console.error('>>> [PROVIDER REJECT ERROR]', err);
    res.status(500).json({ message: 'Failed to reject application.' });
  }
});

module.exports = router;
