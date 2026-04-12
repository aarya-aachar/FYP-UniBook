const { getPool } = require('../config/db');
const { sendBookingReminder } = require('../services/emailService');

function startReminderJob() {
  // Booking reminder: check every 5 minutes for bookings within the next 60 minutes
  setInterval(async () => {
    try {
      const pool = getPool();
      
      // Heartbeat Log For Debugging
      console.log(`>>> [REMINDER ENGINE] Checking for appointments in the next hour... (System Time: ${new Date().toLocaleTimeString()})`);

      // 1. Find confirmed bookings happening within the next 60 minutes
      const [upcoming] = await pool.query(`
        SELECT b.id, b.user_id, b.booking_date, b.booking_time, p.name as provider_name, u.email as user_email, u.name as user_name
        FROM bookings b
        JOIN providers p ON b.provider_id = p.id
        JOIN users u ON b.user_id = u.id
        WHERE b.status = 'confirmed'
          AND b.booking_date = CURDATE()
          AND b.booking_time BETWEEN CURTIME() AND ADDTIME(CURTIME(), '01:00:00')
      `);
      
      if (upcoming.length > 0) {
        console.log(`>>> [REMINDER ENGINE] Found ${upcoming.length} upcoming appointments. Processing...`);

        for (const booking of upcoming) {
          const timeStr = booking.booking_time.substring(0, 5);
          const bookingIdStr = String(booking.id);

          // 3. Check if reminder already exists for this booking (Simplified Check)
          const [exists] = await pool.query(
            "SELECT id FROM notifications WHERE type = 'booking_reminder' AND metadata->>'$.booking_id' = ?",
            [bookingIdStr]
          );

          if (exists.length === 0) {
            console.log(`>>> [REMINDER ENGINE] Triggering reminder for User: ${booking.user_name} (Booking ID: ${bookingIdStr})`);
            
            // A. Notify User (In-App)
            await pool.query(
              'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
              [booking.user_id, 'booking_reminder', 'Upcoming Booking Reminder', `Reminder: Your booking at ${booking.provider_name} is in less than 1 hour (${timeStr}).`, JSON.stringify({ booking_id: bookingIdStr })]
            );

            // B. Send Email to User
            const dateStr = new Date(booking.booking_date).toLocaleDateString();
            try {
               await sendBookingReminder(booking.user_email, booking.user_name, booking.provider_name, timeStr, dateStr);
               console.log(`>>> [REMINDER ENGINE] Email sent to ${booking.user_email}`);
            } catch (emailErr) {
               console.error(`>>> [REMINDER ENGINE ERROR] Email failed for ${booking.user_email}:`, emailErr.message);
            }
          }
        }
      }

      // 4. Cleanup abandoned checkouts
      // If a user clicks checkout but abandons the eSewa window, the slot stays "pending" forever.
      // This automatically cancels those stuck bookings after 15 minutes so others can book the slot.
      const [cleanupResult] = await pool.query(`
        UPDATE bookings 
        SET status = 'cancelled', 
            payment_status = 'failed', 
            notes = CONCAT(IFNULL(notes, ''), ' (Auto-Cancelled: Checkout Abandoned)')
        WHERE status = 'pending' 
          AND created_at < NOW() - INTERVAL 15 MINUTE
      `);
      
      if (cleanupResult.affectedRows > 0) {
        console.log(`>>> [CLEANUP] Released ${cleanupResult.affectedRows} abandoned slots back to availability.`);
      }

    } catch (err) {
      // Silent fail for reminder — non-critical
    }
  }, 5 * 60 * 1000); // every 5 minutes
}

module.exports = { startReminderJob };
