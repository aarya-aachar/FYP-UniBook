/**
 * UniBook Database Configuration
 * 
 * This file manages the connection to the MySQL database.
 * It also handles the "Auto-Migration" logic—meaning it automatically creates 
 * tables and updates columns whenever the server starts up.
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

// Database credentials pulled from the .env file with local fallback values
const host = process.env.DB_HOST || '127.0.0.1';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'unibook';

let pool; // This will hold our connection pool instance

/**
 * --- DATABASE INITIALIZATION ---
 * This function is called by server.js at startup.
 */
async function initDB() {
  try {
    // 1. First, we connect to MySQL without a specific database 
    // to ensure the 'unibook' database actually exists on the server.
    const connection = await mysql.createConnection({ host, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // 2. Initialize the connection pool. 
    // Using a pool is better for performance as it reuses existing connections.
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10, // Allows up to 10 simultaneous database queries
      queueLimit: 0
    });

    console.log(`Connected to MySQL database: ${database}`);

    /**
     * --- SCHEMA DEFINITIONS ---
     * Defining the structure of our tables if they don't exist yet.
     */

    // Users table: Handles authentication for all roles
    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'provider') DEFAULT 'user',
        profile_photo LONGTEXT,
        age INT,
        gender VARCHAR(20),
        phone VARCHAR(20),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Providers table: Stores business details for verified service providers
    const createProviders = `
      CREATE TABLE IF NOT EXISTS providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT DEFAULT NULL,
        name VARCHAR(255) UNIQUE NOT NULL,
        category ENUM('Restaurants', 'Futsal', 'Hospitals', 'Salon / Spa') NOT NULL,
        description TEXT,
        image VARCHAR(255),
        gallery_images JSON DEFAULT NULL,
        address VARCHAR(255),
        base_price DECIMAL(10,2) DEFAULT 0.00,
        opening_time TIME DEFAULT '09:00:00',
        closing_time TIME DEFAULT '18:00:00',
        capacity INT DEFAULT 1,
        application_id INT DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        FOREIGN KEY (application_id) REFERENCES provider_applications(id) ON DELETE SET NULL
      )
    `;

    // Provider Applications: Temporary storage for businesses waiting for Admin approval
    const createProviderApplications = `
      CREATE TABLE IF NOT EXISTS provider_applications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        pan_number VARCHAR(50) NOT NULL,
        service_type ENUM('Restaurants', 'Futsal', 'Hospitals', 'Salon / Spa') NOT NULL,
        address VARCHAR(255),
        description TEXT,
        base_price DECIMAL(10,2) DEFAULT 0.00,
        opening_time TIME DEFAULT '09:00:00',
        closing_time TIME DEFAULT '18:00:00',
        capacity INT DEFAULT 1,
        document_path VARCHAR(500),
        image_path VARCHAR(500),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Bookings table: Links Users and Providers with specific time slots
    const createBookings = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider_id INT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        transaction_uuid VARCHAR(255) DEFAULT NULL,
        paid_amount DECIMAL(10,2) DEFAULT 0.00,
        duration INT DEFAULT 60,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
      )
    `;

    // Reviews table: Handles feedback left by users after a service
    const createReviews = `
      CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider_id INT NOT NULL,
        booking_id INT DEFAULT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE SET NULL
      )
    `;

    // Notifications table: Stores alerts for low-priority events (e.g. "Booking Confirmed")
    const createNotifications = `
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Messages table: Handles direct communication between users/providers/admins
    const createMessages = `
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        sender_id INT NOT NULL,
        receiver_id INT NOT NULL,
        message TEXT NOT NULL,
        is_admin_sender TINYINT(1) DEFAULT 0,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    // Run all table creation queries sequentially
    await pool.query(createUsers);
    await pool.query(createProviders);
    await pool.query(createProviderApplications);
    await pool.query(createBookings);
    await pool.query(createReviews);
    await pool.query(createNotifications);
    await pool.query(createMessages);

    /**
     * --- SCHEMA MIGRATIONS & UPDATES ---
     * This logic checks if the existing tables have the correct columns. 
     * It allows us to add new features without losing existing data.
     */
    try {
      // 1. Column updates for the User profile
      const cols = await pool.query("SHOW COLUMNS FROM users");
      const existingCols = cols[0].map(c => c.Field);

      if (!existingCols.includes('profile_photo')) {
        await pool.query("ALTER TABLE users ADD COLUMN profile_photo LONGTEXT AFTER role");
      }
      if (!existingCols.includes('age')) {
        await pool.query("ALTER TABLE users ADD COLUMN age INT AFTER profile_photo");
      }
      if (!existingCols.includes('gender')) {
        await pool.query("ALTER TABLE users ADD COLUMN gender VARCHAR(20) AFTER age");
      }
      if (!existingCols.includes('phone')) {
        await pool.query("ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER gender");
      }

      // 2. Ensuring the notification metadata column exists for JSON data
      const notifCols = await pool.query("SHOW COLUMNS FROM notifications");
      const existingNotifCols = notifCols[0].map(c => c.Field);
      if (!existingNotifCols.includes('metadata')) {
        await pool.query("ALTER TABLE notifications ADD COLUMN metadata JSON AFTER is_read");
      }

      // 3. Adding Payment-related columns to the Bookings table
      const bookingCols = await pool.query("SHOW COLUMNS FROM bookings");
      const existingBookingCols = bookingCols[0].map(c => c.Field);
      if (!existingBookingCols.includes('payment_status')) {
        await pool.query("ALTER TABLE bookings ADD COLUMN payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending' AFTER status");
      }
      if (!existingBookingCols.includes('transaction_uuid')) {
        await pool.query("ALTER TABLE bookings ADD COLUMN transaction_uuid VARCHAR(255) DEFAULT NULL AFTER payment_status");
      }
      if (!existingBookingCols.includes('paid_amount')) {
        await pool.query("ALTER TABLE bookings ADD COLUMN paid_amount DECIMAL(10,2) DEFAULT 0.00 AFTER transaction_uuid");
      }

      /**
       * --- CLEANUP LOGIC ---
       * Removing old columns or tables that are no longer used in the new architecture.
       */
      try {
        const bookingsFullCols = await pool.query("SHOW COLUMNS FROM bookings");
        const hasServiceId = bookingsFullCols[0].some(c => c.Field === 'service_id');
        if (hasServiceId) {
          console.log(">>> [CLEANUP] Dropping unused service_id column...");
          // Drop FK first (it might fail if the constraint name is different, hence the try-catch)
          try { await pool.query("ALTER TABLE bookings DROP FOREIGN KEY fk_booking_service"); } catch(e) {}
          try { await pool.query("ALTER TABLE bookings DROP COLUMN service_id"); } catch(e) {}
        }
        await pool.query("DROP TABLE IF EXISTS services");
      } catch (cleanupErr) {
        console.log('Cleanup migration issues (non-fatal):', cleanupErr.message);
      }

      // Ensure booking duration exists and defaults to 60 minutes
      try {
        const checkCols = await pool.query("SHOW COLUMNS FROM bookings");
        const existing = checkCols[0].map(c => c.Field);
        if (!existing.includes('duration')) {
           await pool.query("ALTER TABLE bookings ADD COLUMN duration INT DEFAULT 60 AFTER paid_amount");
        } else {
           // Standardize all existing 30min slots to 60min as per project requirement
           await pool.query("UPDATE bookings SET duration = 60 WHERE duration = 30");
           await pool.query("ALTER TABLE bookings MODIFY COLUMN duration INT DEFAULT 60");
        }

        if (existing.includes('duration_minutes')) {
          console.log(">>> [CLEANUP] Dropping redundant duration_minutes column...");
          await pool.query("ALTER TABLE bookings DROP COLUMN duration_minutes");
        }
      } catch (err) {
        console.log('Duration migration skipped:', err.message);
      }

      // Update provider table with modern features like Image Gallery and Capacity
      const providerCols = await pool.query("SHOW COLUMNS FROM providers");
      const existingProviderCols = providerCols[0].map(c => c.Field);
      if (!existingProviderCols.includes('gallery_images')) {
        await pool.query("ALTER TABLE providers ADD COLUMN gallery_images JSON DEFAULT NULL AFTER image");
        await pool.query("UPDATE providers SET gallery_images = JSON_ARRAY(image) WHERE image IS NOT NULL");
      }
      if (!existingProviderCols.includes('capacity')) {
        await pool.query("ALTER TABLE providers ADD COLUMN capacity INT DEFAULT 1 AFTER closing_time");
      }
      if (!existingProviderCols.includes('user_id')) {
        await pool.query("ALTER TABLE providers ADD COLUMN user_id INT DEFAULT NULL AFTER id");
        await pool.query("ALTER TABLE providers ADD CONSTRAINT fk_provider_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
      }
      if (!existingProviderCols.includes('application_id')) {
        await pool.query("ALTER TABLE providers ADD COLUMN application_id INT DEFAULT NULL AFTER capacity");
        await pool.query("ALTER TABLE providers ADD CONSTRAINT fk_provider_application FOREIGN KEY (application_id) REFERENCES provider_applications(id) ON DELETE SET NULL");
      }

      // Update user roles to support 'provider' role explicitly
      try {
        await pool.query("ALTER TABLE users MODIFY COLUMN role ENUM('user', 'admin', 'provider') DEFAULT 'user'");
      } catch(e) { /* already updated */ }
    } catch (err) {
      console.log('Migration check skipped or columns already handled:', err.message);
    }

    console.log('Database tables successfully initialized.');

    /**
     * --- SEEDING LOGIC ---
     * If the providers table is empty, we add some default providers 
     * so the dashboard doesn't look empty on the first run.
     */
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM providers');
    if (rows[0].count === 0) {
      console.log('Seeding dummy providers...');
      await pool.query(`
        INSERT INTO providers (name, category, description, image, address) VALUES 
        ('City Hospital', 'Hospitals', 'General hospital offering a wide range of services.', '/images/hospital1.jpg', '123 Health Ave'),
        ('Downtown Futsal', 'Futsal', 'High quality turf, open 24/7.', '/images/futsal1.jpg', '456 Sports St'),
        ('Gourmet Restaurant', 'Restaurants', 'Fine dining with international cuisine.', '/images/restaurant1.jpg', '789 Food Court'),
        ('Relax Spa', 'Salon / Spa', 'Premium wellness and beauty solutions.', '/images/salon1.jpg', '101 Beauty Blvd')
      `);
    }

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

/**
 * Returns the active connection pool. 
 * Allows other parts of the app to run SQL queries.
 */
function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initDB() first.');
  }
  return pool;
}

module.exports = { initDB, getPool };
