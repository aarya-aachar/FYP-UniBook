/**
 * Authentication & User Profile Routes
 * 
 * relative path: /api/auth
 * 
 * This file contains all the "Member" related logic:
 * - Registering new users (with Email Verification via OTP)
 * - Logging in and issuing JWT tokens
 * - Viewing and updating user profiles
 * - Handling forgotten passwords
 */

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');
const { createOTP, verifyOTP, sendOTPEmail } = require('../services/otpService');
const { sendPasswordResetAlert } = require('../services/emailService');

const router = express.Router();

/**
 * --- MULTER CONFIGURATION ---
 * We use Multer to handle profile photo uploads.
 * Images are saved to "server/src/routes/uploads/profiles"
 */
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'profiles');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    // We name the file using the User ID and a Timestamp to ensure it's unique
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.user.id}_${Date.now()}${ext}`);
  }
});
const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * @route POST /api/auth/send-otp
 * @desc REGISTRATION STEP 1: Validate email and send a verification code
 */
router.post('/auth/send-otp', async (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;
    
    // Basic validation to ensure the form isn't empty
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const pool = getPool();
    // Check if the email is already in our system
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    /**
     * CENTRALIZED OTP SERVICE
     * Instead of saving to the DB immediately, we store the user's data 
     * in a temporary memory store until they verify their email.
     */
    const otp = createOTP(email, { name, email, password, age, gender, phone });
    await sendOTPEmail(email, otp, 'Verify your UniBook Email');

    res.json({ message: 'OTP sent successfully. Check your email.' });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

/**
 * @route POST /api/auth/verify-otp
 * @desc REGISTRATION STEP 2: Verify code and finally create the account
 */
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    // Use the service to check if the code matches what we sent
    const { valid, data, message } = verifyOTP(email, otp);

    if (!valid) {
      return res.status(400).json({ message });
    }

    // Code is valid! Now we pull the registration data from our temp store
    const { name, password, age, gender, phone } = data;

    const pool = getPool();
    // Use BCrypt to salt and hash the password so it's not stored in plain text
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user into the permanent 'users' table
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, age, gender, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'user', age || null, gender || null, phone || null]
    );

    // Create a login token immediately so they are automatically logged in after signing up
    const token = jwt.sign(
      { id: result.insertId, email, role: 'user', name },
      process.env.JWT_SECRET || 'super_secret_unibook_key_12345',
      { expiresIn: '24h' }
    );

    console.log(`>>> [REGISTER] New user created: ${email}`);
    res.status(201).json({
      message: 'Registration successful!',
      token,
      user: { id: result.insertId, name, email, role: 'user' }
    });

  } catch (error) {
    console.error('Verify OTP Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Regular login with Email and Password
 */
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = getPool();

    // 1. Find the user
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];

    // 2. Check if the admin has blocked this account
    if (!user.is_active || user.role === 'restricted') {
      return res.status(403).json({ message: 'Your account has been restricted or deactivated. Please contact support.' });
    }

    // 3. Compare the provided password with the hashed password in our DB
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 4. Generate a JWT token that expires in 24 hours
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'super_secret_unibook_key_12345',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route GET /api/auth/me
 * @desc Get the current logged-in user's profile data
 */
router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
    // We select only non-sensitive fields (skipping the password hash)
    const [users] = await pool.query('SELECT id, name, email, role, profile_photo, age, gender, created_at FROM users WHERE id = ?', [req.user.id]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Profile Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * @route POST /api/auth/profile/update
 * @desc Update profile details (requires providing current password for security)
 */
router.post('/auth/profile/update', authenticateToken, async (req, res) => {
  try {
    const { name, currentPassword, newPassword, age, gender } = req.body;
    const pool = getPool();
    
    // 1. Get current record
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = users[0];

    // 2. SECURITY CHECK: You must know your old password to change it or your name
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required.' });
    }
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // 3. Prepare the new data
    let updatedName = name || user.name;
    let updatedPassword = user.password;
    
    let updatedAge = user.age;
    if (age !== undefined && age !== "" && age !== null) {
      const parsedAge = parseInt(age);
      if (!isNaN(parsedAge)) updatedAge = parsedAge;
    }
    
    let updatedGender = gender !== undefined ? gender : user.gender;

    // Handle password change logic separately
    let passwordChanged = false;
    if (newPassword && newPassword.trim() !== "") {
      updatedPassword = await bcrypt.hash(newPassword, 10);
      passwordChanged = true;
    }

    // 4. Commit changes to database
    const sqlParams = [
      updatedName ?? null, 
      updatedPassword ?? null, 
      updatedAge ?? null, 
      updatedGender ?? null, 
      req.user.id
    ];
    
    await pool.query(
      'UPDATE users SET name = ?, password = ?, age = ?, gender = ? WHERE id = ?',
      sqlParams
    );

    // If the user is a service provider, we update their business name too for consistency
    if (user.role === 'provider' && updatedName !== user.name) {
      try {
        await pool.query('UPDATE providers SET name = ? WHERE user_id = ?', [updatedName, req.user.id]);
      } catch (syncErr) {
        console.error('Provider name sync error (non-fatal):', syncErr.message);
      }
    }

    res.json({ 
      message: 'Profile updated successfully', 
      user: { 
        id: user.id, 
        name: updatedName, 
        email: user.email, 
        role: user.role, 
        age: updatedAge,
        gender: updatedGender
      } 
    });

    // 5. In-app notification for security tracking
    if (passwordChanged) {
      try {
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
          [req.user.id, 'profile_updated', 'Password Changed', 'You recently updated your password. If this wasn\'t you, please contact support immediately.', JSON.stringify({ action: 'password_change' })]
        );
      } catch (notifErr) {
        console.error('Password notification error (non-fatal):', notifErr.message);
      }
    }
  } catch (error) {
    console.error('>>> [SERVER ERROR] Profile Update Failed:', error.stack);
    res.status(500).json({ message: 'Internal Server Error: ' + error.message });
  }
});

/**
 * @route POST /api/auth/profile/photo
 * @desc Upload or update the user's profile picture
 */
router.post('/auth/profile/photo', authenticateToken, uploadProfile.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const pool = getPool();
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    
    await pool.query('UPDATE users SET profile_photo = ? WHERE id = ?', [photoPath, req.user.id]);
    
    res.json({ message: 'Profile photo updated', profile_photo: photoPath });
    
    // Add to notification history
    try {
      await pool.query(
        'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, 'photo_updated', 'Profile Photo Updated', 'Your profile photo was updated successfully.', JSON.stringify({ photo: photoPath })]
      );
    } catch (notifErr) {
      console.error('Photo notification error (non-fatal):', notifErr.message);
    }
  } catch (error) {
    console.error('Photo Upload Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

/**
 * ─── FORGOT PASSWORD FLOW ───────────────────────────────────────────────
 */

/**
 * @route POST /api/auth/reset-password/send
 * @desc STEP 1: Verify the email exists and send a reset code
 */
router.post('/auth/reset-password/send', async (req, res) => {
  try {
    const { email } = req.body;
    const pool = getPool();
    const [users] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'No account found with this email address.' });
    }

    // Creates a temporary "Reset State" valid for a short duration
    const otp = createOTP(email, { email, resetting: true });
    await sendOTPEmail(email, otp, 'Reset your UniBook Password');

    res.json({ message: 'Reset code sent to your email.' });
  } catch (error) {
    console.error('Reset Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send reset code.' });
  }
});

/**
 * @route POST /api/auth/reset-password/verify
 * @desc STEP 2: Check if the user entered the correct reset code
 */
router.post('/auth/reset-password/verify', async (req, res) => {
  const { email, otp } = req.body;
  const { valid, message } = verifyOTP(email, otp);
  
  if (!valid) return res.status(400).json({ message });
  
  // Re-creates the session as 'verified' for 5 minutes so they can type a new password
  createOTP(email, { email, verifiedReset: true }, 5);
  res.json({ message: 'OTP verified. You can now reset your password.' });
});

/**
 * @route POST /api/auth/reset-password/confirm
 * @desc STEP 3: Finally apply the new password to the account
 */
router.post('/auth/reset-password/confirm', async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    // In this MVP, we assume the client reaching this step is authorized, 
    // but we use BCrypt for final storage security.
    const pool = getPool();
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
    
    if (result.affectedRows > 0) {
      const [users] = await pool.query('SELECT name FROM users WHERE email = ?', [email]);
      if (users.length > 0) {
        // Send an email alert letting them know their password change was successful
        await sendPasswordResetAlert(email, users[0].name);
      }
      res.json({ message: 'Password reset successful. You can now login.' });
    } else {
      res.status(400).json({ message: 'Failed to reset password.' });
    }
  } catch (error) {
    console.error('Reset Confirm Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;
