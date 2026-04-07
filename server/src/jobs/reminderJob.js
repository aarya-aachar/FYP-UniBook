const { getPool } = require('../config/db');

function startReminderJob() {
  // Booking reminder: check every 5 minutes for bookings within the next 60 minutes
  setInterval(async () => {
    try {
      const pool = getPool();
      
      // 1. Find confirmed bookings happening within the next 60 minutes
      const [upcoming] = await pool.query(`
        SELECT b.id, b.user_id, b.booking_date, b.booking_time, p.name as provider_name
        FROM bookings b
        JOIN providers p ON b.provider_id = p.id
        WHERE b.status = 'confirmed'
          AND b.booking_date = CURDATE()
          AND b.booking_time BETWEEN CURTIME() AND ADDTIME(CURTIME(), '01:00:00')
      `);
      
      if (upcoming.length > 0) {
        // 2. Fetch all admins once
        const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");

        for (const booking of upcoming) {
          const timeStr = booking.booking_time.substring(0, 5);
          const bookingIdStr = String(booking.id);

          // 3. Check if reminder already exists for this booking (to avoid duplicates)
          const [exists] = await pool.query(
            "SELECT id FROM notifications WHERE type = 'booking_reminder' AND JSON_UNQUOTE(JSON_EXTRACT(metadata, '$.booking_id')) = ?",
            [bookingIdStr]
          );

          if (exists.length === 0) {
            // A. Notify User
            await pool.query(
              'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
              [booking.user_id, 'booking_reminder', 'Upcoming Booking Reminder', `Reminder: Your booking at ${booking.provider_name} is in less than 1 hour (${timeStr}).`, JSON.stringify({ booking_id: bookingIdStr })]
            );

            // B. Notify All Admins
            for (const admin of admins) {
              await pool.query(
                'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
                [admin.id, 'booking_reminder', 'Admin: Upcoming Booking Reminder', `Reminder: Booking #${bookingIdStr} at ${booking.provider_name} starts in less than 1 hour (${timeStr}).`, JSON.stringify({ booking_id: bookingIdStr })]
              );
            }
            console.log(`>>> [REMINDER] Sent reminders for Booking #${bookingIdStr}`);
          }
        }
      }
    } catch (err) {
      // Silent fail for reminder — non-critical
    }
  }, 5 * 60 * 1000); // every 5 minutes
}

module.exports = { startReminderJob };
