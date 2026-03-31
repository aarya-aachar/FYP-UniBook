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

    await pool.query(createUsers);
    await pool.query(createProviders);
    await pool.query(createServices);
    await pool.query(createBookings);

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
