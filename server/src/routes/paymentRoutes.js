const express = require('express');
const crypto = require('crypto');
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Test Credentials (V2 Sandbox)
const ESEWA_SECRET = '8gBm/:&EnhH.1/q'; 
const ESEWA_PRODUCT_CODE = 'EPAYTEST';
const FRONTEND_BASE = 'http://localhost:3000';
const BACKEND_BASE  = 'http://localhost:4001';

/**
 * @route POST /api/payment/initiate
 * @desc Generate signed parameters for eSewa form
 * 
 * Transaction UUID format: BOOK-{booking_id}-UID{user_id}-{timestamp}
 * This allows us to recover both booking_id AND user_id from the UUID
 * even if query params are corrupted by eSewa's redirect handling.
 */
router.post('/payment/initiate', authenticateToken, async (req, res) => {
  try {
    let { amount, booking_id, booking_ids } = req.body;
    booking_id = parseInt(booking_id);
    const user_id = req.user.id;

    console.log(`>>> [ESEWA] Initiating payment - Amount: ${amount}, BookingID: ${booking_id}, UserID: ${user_id}`);
    
    // 1. Generate transaction UUID with user_id embedded
    const transaction_uuid = `BOOK-${booking_id}-UID${user_id}-${Date.now()}`;

    // 2. Generate HMAC-SHA256 Signature
    const signatureInput = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const signature = crypto
      .createHmac('sha256', ESEWA_SECRET)
      .update(signatureInput)
      .digest('base64');

    // 3. Update database with the transaction UUID for ALL associated slots
    const pool = getPool();
    const idsToUpdate = (Array.isArray(booking_ids) && booking_ids.length > 0) ? booking_ids : [booking_id];
    
    // Calculate amount per slot for clean recordkeeping (optional, but requested for paid_amount parity)
    const amountPerSlot = parseFloat(amount) / idsToUpdate.length;

    await pool.query(
      "UPDATE bookings SET transaction_uuid = ?, paid_amount = ?, payment_status = 'pending' WHERE id IN (?)",
      [transaction_uuid, amountPerSlot, idsToUpdate]
    );

    // 4. Build success/failure URLs
    // IMPORTANT: Do NOT put any query params in these URLs that eSewa will corrupt.
    // eSewa appends "?data=BASE64" to the success_url. If our URL already has "?",
    // eSewa may append "?data=..." instead of "&data=...", breaking our params.
    // Solution: Embed booking_id directly in the path so it's never a query param.
    const success_url = `${BACKEND_BASE}/api/payment/success/${booking_id}`;
    const failure_url = `${BACKEND_BASE}/api/payment/failure/${booking_id}`;

    res.json({
      amount: amount.toString(),
      tax_amount: "0",
      total_amount: amount.toString(),
      transaction_uuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url,
      failure_url,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature
    });
  } catch (error) {
    console.error('>>> [ESEWA ERROR] Initiation failed:', error);
    res.status(500).json({ message: 'Failed to initiate payment request.' });
  }
});

/**
 * @route GET /api/payment/success/:booking_id
 * @desc Handle redirect from eSewa on successful payment
 * booking_id is in the PATH (not query string) so eSewa cannot corrupt it.
 */
router.get('/payment/success/:booking_id', async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { data } = req.query; // eSewa appends ?data=BASE64 here

    console.log(`>>> [ESEWA CALLBACK] SUCCESS - Booking ID: ${booking_id} at ${new Date().toISOString()}`);
    const pool = getPool();

    // 1. Extract user_id from transaction_uuid for verification (optional but useful)
    let extractedUserId = null;
    if (data) {
      try {
        const decoded = JSON.parse(Buffer.from(data, 'base64').toString());
        console.log(`>>> [ESEWA] Decoded callback:`, decoded);

        // Parse user_id from UUID format: BOOK-{bid}-UID{uid}-{ts}
        const uuidMatch = decoded.transaction_uuid?.match(/BOOK-\d+-UID(\d+)-\d+/);
        if (uuidMatch) {
          extractedUserId = parseInt(uuidMatch[1]);
          console.log(`>>> [ESEWA] Extracted UserID: ${extractedUserId} from UUID`);
        }

        // Verify signature
        const sigInput = `total_amount=${decoded.total_amount},transaction_uuid=${decoded.transaction_uuid},product_code=${decoded.product_code}`;
        const expectedSig = crypto.createHmac('sha256', ESEWA_SECRET).update(sigInput).digest('base64');
        if (expectedSig !== decoded.signature) {
          console.error(`>>> [ESEWA ERROR] Signature mismatch for Booking #${booking_id}!`);
        } else {
          console.log(`>>> [ESEWA] Signature verified OK for Booking #${booking_id}`);
        }
      } catch (decodeErr) {
        console.error(`>>> [ESEWA] Could not decode data param:`, decodeErr.message);
      }
    }

    // 2. Confirm the booking as paid for ALL slots associated with this transaction
    const [bookingRows] = await pool.query("SELECT transaction_uuid FROM bookings WHERE id = ?", [parseInt(booking_id)]);
    
    if (bookingRows.length > 0 && bookingRows[0].transaction_uuid) {
      const txUuid = bookingRows[0].transaction_uuid;
      await pool.query(
        "UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE transaction_uuid = ?",
        [txUuid]
      );
      console.log(`>>> [ESEWA SUCCESS] Transaction ${txUuid} confirmed. All associated slots marked as paid.`);
    } else {
      // Fallback
      await pool.query(
        "UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = ?",
        [parseInt(booking_id)]
      );
      console.log(`>>> [ESEWA SUCCESS] Booking #${booking_id} confirmed and marked as paid (fallback).`);
    }

    // --- Post Payment Success Notifications ---
    try {
      const [bookingDetails] = await pool.query(`
        SELECT b.id, b.booking_date, b.booking_time, p.name as provider_name, p.user_id as provider_user_id, u.id as user_id, u.name as user_name
        FROM bookings b
        JOIN providers p ON b.provider_id = p.id
        JOIN users u ON b.user_id = u.id
        WHERE b.id = ? 
           OR b.transaction_uuid = (SELECT transaction_uuid FROM bookings WHERE id = ?)
      `, [parseInt(booking_id), parseInt(booking_id)]);

      if (bookingDetails.length > 0) {
        const firstSlot = bookingDetails[0];
        const providerName = firstSlot.provider_name;
        const userName = firstSlot.user_name || 'A Customer';
        const dateStr = new Date(firstSlot.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = bookingDetails.map(b => b.booking_time.substring(0, 5)).join(', ');
        
        const mainId = firstSlot.id;
        const userId = firstSlot.user_id;
        const pvUserId = firstSlot.provider_user_id;

        // 1. Notify User
        await pool.query(
          'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
          [userId, 'booking_confirmed', 'Payment Successful!', `Your booking for ${providerName} on ${dateStr} at ${timeStr} is fully confirmed.`, JSON.stringify({ booking_id: mainId }), mainId]
        );

        // 2. Notify Admins
        const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
        for (const admin of admins) {
          await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
            [admin.id, 'new_booking', 'New Booking Received', `${userName} confirmed and paid for ${providerName} on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: mainId }), mainId]
          );
        }

        // 3. Notify Service Provider
        if (pvUserId) {
          await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
            [pvUserId, 'new_booking', 'New Booking Received', `${userName} completed payment for a booking on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: mainId }), mainId]
          );
        }
      }
    } catch (notifErr) {
      console.error('>>> [ESEWA SUCCESS NOTIF ERROR]', notifErr.message);
    }

    // 3. Redirect cleanly to the success page
    res.redirect(`${FRONTEND_BASE}/payment-success?payment=success&bid=${booking_id}`);
  } catch (error) {
    console.error('>>> [ESEWA ERROR] Success processing failed:', error);
    res.redirect(`${FRONTEND_BASE}/payment-success?payment=success`);
  }
});

/**
 * @route GET /api/payment/failure/:booking_id
 * @desc Handle redirect from eSewa on payment failure/cancellation
 */
router.get('/payment/failure/:booking_id', async (req, res) => {
  try {
    const { booking_id } = req.params;
    console.log(`>>> [ESEWA FAILURE] Booking #${booking_id} marked as cancelled.`);

    const pool = getPool();
    const [bookingRows] = await pool.query("SELECT transaction_uuid FROM bookings WHERE id = ?", [parseInt(booking_id)]);
    
    if (bookingRows.length > 0 && bookingRows[0].transaction_uuid) {
       await pool.query(
         "UPDATE bookings SET status = 'cancelled', payment_status = 'failed' WHERE transaction_uuid = ?",
         [bookingRows[0].transaction_uuid]
       );
    } else {
       await pool.query(
         "UPDATE bookings SET status = 'cancelled', payment_status = 'failed' WHERE id = ?",
         [parseInt(booking_id)]
       );
    }

    res.redirect(`${FRONTEND_BASE}/my-appointments?payment=cancelled`);
  } catch (err) {
    console.error('>>> [ESEWA] Failure handler error:', err);
    res.redirect(`${FRONTEND_BASE}/my-appointments?payment=cancelled`);
  }
});

module.exports = router;
