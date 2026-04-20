/**
 * Background Automation Engine
 * 
 * This file handles tasks that need to run automatically without user interaction.
 * It currently handles two main things:
 * 1. Sending email and in-app reminders for upcoming appointments.
 * 2. Cleaning up "Abandoned" bookings that were started but never paid for.
 */

const { getPool } = require('../config/db');
const { sendBookingReminder } = require('../services/emailService');

function startReminderJob() {
  // We run this check every 5 minutes
  setInterval(async () => {
    try {
      const pool = getPool();
      
      console.log(`>>> [REMINDER ENGINE] Checking for appointments in the next hour... (System Time: ${new Date().toLocaleTimeString()})`);

      /**
       * --- PHASE 1: APPOINTMENT REMINDERS ---
       * We look for bookings that are 'confirmed' for today and starting 
       * in the next 60 minutes.
       */
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

          // Before sending a reminder, we check if we already sent one 
          // (to avoid spamming the user every 5 minutes).
          const [exists] = await pool.query(
            "SELECT id FROM notifications WHERE type = 'booking_reminder' AND metadata->>'$.booking_id' = ?",
            [bookingIdStr]
          );

          if (exists.length === 0) {
            console.log(`>>> [REMINDER ENGINE] Triggering reminder for User: ${booking.user_name} (Booking ID: ${bookingIdStr})`);
            
            // 1. Create an in-app notification for the User's dashboard
            await pool.query(
              'INSERT INTO notifications (user_id, type, title, message, metadata) VALUES (?, ?, ?, ?, ?)',
              [booking.user_id, 'booking_reminder', 'Upcoming Booking Reminder', `Reminder: Your booking at ${booking.provider_name} is in less than 1 hour (${timeStr}).`, JSON.stringify({ booking_id: bookingIdStr })]
            );

            // 2. Send an actual Email via the Email Service
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

      /**
       * --- PHASE 2: ABANDONED CHECKOUT CLEANUP ---
       * When a user starts a payment with eSewa but closes the tab, the booking 
       * stays 'pending' and blocks that time slot for others. 
       * This logic automatically cancels any 'pending' booking that is older than 15 minutes.
       */
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
      // If something fails (like a DB error), we just wait for the next 5-minute cycle.
    }
  }, 5 * 60 * 1000); // 5 minutes in milliseconds
}

module.exports = { startReminderJob };
