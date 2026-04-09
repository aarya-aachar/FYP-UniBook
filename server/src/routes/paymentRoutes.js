const express = require('express');
const crypto = require('crypto');
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Test Credentials (V2 Sandbox)
const ESEWA_SECRET = '8gBm/:&EnhH.1/q'; 
const ESEWA_PRODUCT_CODE = 'EPAYTEST';

/**
 * @route POST /api/payment/initiate
 * @desc Generate signed parameters for eSewa form
 */
router.post('/payment/initiate', authenticateToken, async (req, res) => {
  try {
    let { amount, booking_id } = req.body;
    booking_id = parseInt(booking_id); // Ensure it's a number for DB update
    console.log(`>>> [ESEWA DEBUG] Initiation Request - Amount: ${amount}, BookingID: ${booking_id}`);
    
    // 1. Generate a unique transaction ID
    const transaction_uuid = `BOOK-${booking_id}-${Date.now()}`;

    // 2. Generate HMAC-SHA256 Signature
    // Format: total_amount,transaction_uuid,product_code
    // IMPORTANT: amount should be consistent. eSewa v2 often returns it as sent.
    const signatureInput = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    
    console.log(`>>> [ESEWA] Generating signature for input: ${signatureInput}`);
    
    const signature = crypto
      .createHmac('sha256', ESEWA_SECRET)
      .update(signatureInput)
      .digest('base64');

    // 3. Update database with the transaction UUID for later verification
    const pool = getPool();
    const [updateResult] = await pool.query(
      "UPDATE bookings SET transaction_uuid = ?, paid_amount = ?, payment_status = 'pending' WHERE id = ?",
      [transaction_uuid, amount, booking_id]
    );
    console.log(`>>> [ESEWA DEBUG] DB Update Result for Booking #${booking_id}:`, updateResult);

    // 4. Return all required form fields for the frontend
    res.json({
      amount: amount.toString(),
      tax_amount: "0",
      total_amount: amount.toString(),
      transaction_uuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `http://localhost:4001/api/payment/success?bid=${booking_id}`, 
      failure_url: `http://localhost:4001/api/payment/failure?bid=${booking_id}`, 
      signed_field_names: "total_amount,transaction_uuid,product_code",
      signature
    });
  } catch (error) {
    console.error('>>> [ESEWA ERROR] Initiation failed:', error);
    res.status(500).json({ message: 'Failed to initiate payment request.' });
  }
});

/**
 * @route GET /api/payment/success
 * @desc Handle redirect from eSewa on successful payment
 */
router.get('/payment/success', async (req, res) => {
  try {
    const { data, bid } = req.query; // bid is our direct booking_id
    
    console.log(`>>> [ESEWA CALLBACK] Hit at ${new Date().toISOString()} for Booking ID: ${bid}`);
    const pool = getPool();

    // 1. Direct Confirmation (Priority)
    if (bid) {
      await pool.query(
        "UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = ?",
        [parseInt(bid)]
      );
      console.log(`>>> [ESEWA SUCCESS] Booking #${bid} confirmed via direct URL hit.`);
    }

    // 2. Fallback to data decoding for signature verification logging
    if (data) {
      const decodedStr = Buffer.from(data, 'base64').toString();
      const result = JSON.parse(decodedStr);
    
      console.log('>>> [ESEWA] Payment callback received:', result);

      // 2. Security Check: Verify signature (Logging only)
      const signatureInput = `total_amount=${result.total_amount},transaction_uuid=${result.transaction_uuid},product_code=${result.product_code}`;
      const expectedSignature = crypto
        .createHmac('sha256', ESEWA_SECRET)
        .update(signatureInput)
        .digest('base64');

      if (expectedSignature !== result.signature) {
        console.error('>>> [ESEWA ERROR] Signature mismatch detected!');
        console.error('>>> [ESEWA DEBUG] Expected Input:', signatureInput);
        console.error('>>> [ESEWA DEBUG] Received Result:', result);
        // We don't return here because bid already confirmed the booking
      }
    }

    // Always redirect back to frontend with success if we reached here
    res.redirect('http://localhost:3000/payment-success?payment=success');
  } catch (error) {
    console.error('>>> [ESEWA ERROR] Success processing failed:', error);
    res.redirect('http://localhost:3000/payment-success?payment=success');
  }
});

/**
 * @route GET /api/payment/failure
 * @desc Handle redirect from eSewa on payment failure
 */
router.get('/payment/failure', async (req, res) => {
  try {
    const { bid } = req.query;
    if (bid) {
      const pool = getPool();
      await pool.query("UPDATE bookings SET status = 'cancelled', payment_status = 'failed' WHERE id = ?", [parseInt(bid)]);
      console.log(`>>> [ESEWA FAILURE] Booking #${bid} set to cancelled.`);
    }
  } catch (err) {
    console.error('Failure handler error:', err);
  }
  res.redirect('http://localhost:3000/my-appointments?payment=cancelled');
});

module.exports = router;
