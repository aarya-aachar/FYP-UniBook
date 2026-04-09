const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// In-memory OTP store: { email -> { otp, data, expiresAt } }
const otpStore = new Map();

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// Multer config for profile photos
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads', 'profiles');
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `profile_${req.user.id}_${Date.now()}${ext}`);
  }
});
const uploadProfile = multer({ storage: profileStorage, limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * @route POST /api/auth/send-otp
 * @desc Step 1 of registration: validate email and send OTP
 */
router.post('/auth/send-otp', async (req, res) => {
  try {
    const { name, email, password, age, gender, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const pool = getPool();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'This email is already registered.' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Store pending registration
    otpStore.set(email, { otp, expiresAt, data: { name, email, password, age, gender, phone } });

    // Send OTP email
    await transporter.sendMail({
      from: `"UniBook" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your UniBook Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
          <h2 style="color: #0f172a; margin-bottom: 4px;">Verify your email</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Welcome to <strong>UniBook</strong>! Use the code below to complete your registration.</p>
          <div style="background: #0f172a; color: #10b981; font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 24px; border-radius: 10px; margin: 24px 0;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
      `
    });

    console.log(`>>> [OTP] Sent code to ${email}`);
    res.json({ message: 'OTP sent successfully. Check your email.' });

  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: 'Failed to send OTP. Please try again.' });
  }
});

/**
 * @route POST /api/auth/verify-otp
 * @desc Step 2 of registration: verify OTP and create account
 */
router.post('/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ message: 'No pending registration for this email. Please start over.' });
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }
    if (record.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP. Please try again.' });
    }

    // OTP is valid — create the user
    const { name, password, age, gender, phone } = record.data;
    otpStore.delete(email);

    const pool = getPool();
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, age, gender, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, 'user', age || null, gender || null, phone || null]
    );

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

router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, age, gender, phone } = req.body;
    const pool = getPool();

    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Email is already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === 'admin' ? 'admin' : 'user';

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role, age, gender, phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, userRole, age || null, gender || null, phone || null]
    );

    const token = jwt.sign(
      { id: result.insertId, email, role: userRole, name },
      process.env.JWT_SECRET || 'super_secret_unibook_key_12345',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: result.insertId, name, email, role: userRole }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = getPool();

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

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

router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const pool = getPool();
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

router.post('/auth/profile/update', authenticateToken, async (req, res) => {
  try {
    const { name, currentPassword, newPassword, age, gender } = req.body;
    const pool = getPool();
    
    // 1. Get current user with password
    const [users] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ message: 'User not found' });
    
    const user = users[0];

    // 2. Verify current password (REQUIRED)
    if (!currentPassword) {
      return res.status(400).json({ message: 'Current password is required.' });
    }
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid current password' });
    }

    // 3. Prepare updates
    let updatedName = name || user.name;
    let updatedPassword = user.password;
    
    // Sanitize age
    let updatedAge = user.age;
    if (age !== undefined && age !== "" && age !== null) {
      const parsedAge = parseInt(age);
      if (!isNaN(parsedAge)) updatedAge = parsedAge;
    }
    
    let updatedGender = gender !== undefined ? gender : user.gender;

    let passwordChanged = false;
    if (newPassword && newPassword.trim() !== "") {
      updatedPassword = await bcrypt.hash(newPassword, 10);
      passwordChanged = true;
    }

    // 4. Update database
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

    // 5. Send response first
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

    // 6. Fire-and-forget notification on password change
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

// Upload/Change profile photo
router.post('/auth/profile/photo', authenticateToken, uploadProfile.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const pool = getPool();
    const photoPath = `/uploads/profiles/${req.file.filename}`;
    
    await pool.query('UPDATE users SET profile_photo = ? WHERE id = ?', [photoPath, req.user.id]);
    
    // Send response immediately so user doesn't get 500
    res.json({ message: 'Profile photo updated', profile_photo: photoPath });
    
    // Fire-and-forget notification
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

module.exports = router;
