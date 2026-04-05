require('dotenv').config();
const mysql = require('mysql2/promise');

const host = process.env.DB_HOST || '127.0.0.1';
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'unibook';

let pool;

async function initDB() {
  try {
    // 1. Create a connection without database to ensure the DB exists
    const connection = await mysql.createConnection({ host, user, password });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
    await connection.end();

    // 2. Initialize the connection pool pointing to the unibook database
    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    console.log(`Connected to MySQL database: ${database}`);

    // 3. Create Tables
    const createUsers = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin') DEFAULT 'user',
        profile_photo LONGTEXT,
        age INT,
        gender VARCHAR(20),
        phone VARCHAR(20),
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createProviders = `
      CREATE TABLE IF NOT EXISTS providers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        category ENUM('Restaurants', 'Futsal', 'Hospitals', 'Salon / Spa') NOT NULL,
        description TEXT,
        image VARCHAR(255),
        address VARCHAR(255),
        base_price DECIMAL(10,2) DEFAULT 0.00,
        opening_time TIME DEFAULT '09:00:00',
        closing_time TIME DEFAULT '18:00:00',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createServices = `
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        provider_id INT NOT NULL,
        name VARCHAR(255),
        price DECIMAL(10,2),
        duration_minutes INT DEFAULT 60,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE
      )
    `;

    const createBookings = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        provider_id INT NOT NULL,
        service_id INT,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE CASCADE,
        FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL
      )
    `;

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

    await pool.query(createUsers);
    await pool.query(createProviders);
    await pool.query(createServices);
    await pool.query(createBookings);
    await pool.query(createReviews);
    await pool.query(createNotifications);

    // One-time column check for existing systems
    try {
      // Adding columns individually to handle cases where some might exist and others don't
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

      // Check notifications table for metadata column
      const notifCols = await pool.query("SHOW COLUMNS FROM notifications");
      const existingNotifCols = notifCols[0].map(c => c.Field);
      if (!existingNotifCols.includes('metadata')) {
        await pool.query("ALTER TABLE notifications ADD COLUMN metadata JSON AFTER is_read");
      }
    } catch (err) {
      console.log('Migration check skipped or columns already handled:', err.message);
    }

    console.log('Database tables successfully initialized.');

    // Seed dummy providers if empty
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

    // Seed second admin if not exists
    const bcrypt = require('bcrypt');
    const [existingAdmin2] = await pool.query("SELECT id FROM users WHERE email = 'admin2@unibook.com'");
    if (existingAdmin2.length === 0) {
      const hashedPw = await bcrypt.hash('Admin@456', 10);
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
        ['Admin Two', 'admin2@unibook.com', hashedPw, 'admin']
      );
      console.log('Seeded second admin: admin2@unibook.com / Admin@456');
    }

  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database pool has not been initialized. Call initDB() first.');
  }
  return pool;
}

module.exports = { initDB, getPool };
