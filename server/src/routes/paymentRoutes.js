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
    let { amount, booking_id } = req.body;
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

    // 3. Update database with the transaction UUID
    const pool = getPool();
    await pool.query(
      "UPDATE bookings SET transaction_uuid = ?, paid_amount = ?, payment_status = 'pending' WHERE id = ?",
      [transaction_uuid, amount, booking_id]
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

    // 2. Confirm the booking as paid
    await pool.query(
      "UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = ?",
      [parseInt(booking_id)]
    );
    console.log(`>>> [ESEWA SUCCESS] Booking #${booking_id} confirmed and marked as paid.`);

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
    await pool.query(
      "UPDATE bookings SET status = 'cancelled', payment_status = 'failed' WHERE id = ?",
      [parseInt(booking_id)]
    );

    res.redirect(`${FRONTEND_BASE}/my-appointments?payment=cancelled`);
  } catch (err) {
    console.error('>>> [ESEWA] Failure handler error:', err);
    res.redirect(`${FRONTEND_BASE}/my-appointments?payment=cancelled`);
  }
});

module.exports = router;
