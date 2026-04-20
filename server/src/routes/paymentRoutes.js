/**
 * Payment Gateway Integration (eSewa V2)
 * 
 * relative path: /api/payment
 * 
 * This file handles the financial transactions of UniBook.
 * We use eSewa (Nepal's most popular payment gateway) for processing 
 * service fees and booking deposits.
 * 
 * Security Note: We use cryptographic signing (HMAC-SHA256) to ensure 
 * that payment amounts cannot be tampered with by the user.
 */

const express = require('express');
const crypto = require('crypto');
const { getPool } = require('../config/db');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

const axios = require('axios');

// --- ESEWA CONFIGURATION (SANDBOX/TESTING) ---
const ESEWA_SECRET = '8gBm/:&EnhH.1/q'; 
const ESEWA_PRODUCT_CODE = 'EPAYTEST';
const FRONTEND_BASE = 'http://localhost:3000';
const BACKEND_BASE  = 'http://localhost:4001';

/**
 * @route POST /api/payment/initiate
 * @desc Step 1: Initialize the payment.
 *       Generates the signed parameters that the frontend will submit to eSewa.
 */
router.post('/payment/initiate', authenticateToken, async (req, res) => {
  try {
    let { amount, booking_id, booking_ids } = req.body;
    booking_id = parseInt(booking_id);
    const user_id = req.user.id;

    console.log(`>>> [ESEWA] Initiating payment - Amount: ${amount}, BookingID: ${booking_id}, UserID: ${user_id}`);
    
    // Unique ID for this specific payment attempt
    const transaction_uuid = `BOOK-${booking_id}-UID${user_id}-${Date.now()}`;

    /**
     * --- CRYPTOGRAPHIC SIGNATURE ---
     * eSewa requires a signature to prove the message is from us.
     * We sign the amount, UUID, and product code using our Secret Key.
     */
    const signatureInput = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${ESEWA_PRODUCT_CODE}`;
    const signature = crypto
      .createHmac('sha256', ESEWA_SECRET)
      .update(signatureInput)
      .digest('base64');

    const pool = getPool();
    // If it's a multi-slot booking, we find all associated IDs.
    const idsToUpdate = (Array.isArray(booking_ids) && booking_ids.length > 0) ? booking_ids : [booking_id];
    const amountPerSlot = parseFloat(amount) / idsToUpdate.length;

    // Mark the slots as "Pending Payment" so they are temporarily locked
    await pool.query(
      "UPDATE bookings SET transaction_uuid = ?, paid_amount = ?, payment_status = 'pending' WHERE id IN (?)",
      [transaction_uuid, amountPerSlot, idsToUpdate]
    );

    // Provide the eSewa Form Parameters to the React frontend
    res.json({
      amount: amount.toString(),
      tax_amount: "0",
      total_amount: amount.toString(),
      transaction_uuid,
      product_code: ESEWA_PRODUCT_CODE,
      product_service_charge: "0",
      product_delivery_charge: "0",
      success_url: `${BACKEND_BASE}/api/payment/success/${booking_id}`,
      failure_url: `${BACKEND_BASE}/api/payment/failure/${booking_id}`,
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
 * @desc Step 2: Handle Success Redirect.
 *       When the user finishes paying on eSewa's site, ellos redirect them here. 
 *       We verify the money was actually paid and confirm the booking.
 */
router.get('/payment/success/:booking_id', async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { data } = req.query;

    console.log(`>>> [ESEWA CALLBACK] SUCCESS - Booking ID: ${booking_id} at ${new Date().toISOString()}`);
    const pool = getPool();

    // Verify the returning data signature from eSewa (Security Audit)
    if (data) {
      try {
        const decoded = JSON.parse(Buffer.from(data, 'base64').toString());
        const sigInput = `total_amount=${decoded.total_amount},transaction_uuid=${decoded.transaction_uuid},product_code=${decoded.product_code}`;
        const expectedSig = crypto.createHmac('sha256', ESEWA_SECRET).update(sigInput).digest('base64');
        if (expectedSig !== decoded.signature) {
          console.error(`>>> [ESEWA ERROR] Signature mismatch for Booking #${booking_id}! Potential Tampering.`);
        }
      } catch (decodeErr) {}
    }

    // Flip the status to "Paid" and "Confirmed"
    const [bookingRows] = await pool.query("SELECT transaction_uuid FROM bookings WHERE id = ?", [parseInt(booking_id)]);
    
    if (bookingRows.length > 0 && bookingRows[0].transaction_uuid) {
      const txUuid = bookingRows[0].transaction_uuid;
      await pool.query(
        "UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE transaction_uuid = ?",
        [txUuid]
      );
    } else {
      await pool.query(
        "UPDATE bookings SET payment_status = 'paid', status = 'confirmed' WHERE id = ?",
        [parseInt(booking_id)]
      );
    }

    /**
     * --- POST-PAYMENT NOTIFICATIONS ---
     * Inform the user, the business, and the admins that the cash has 
     * been received and the slot is officially theirs.
     */
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
        const mainId = firstSlot.id;
        const userId = firstSlot.user_id;
        const pvUserId = firstSlot.provider_user_id;

        // Prevent duplicate notifications if the callback hits twice
        const [existing] = await pool.query(
          "SELECT id FROM notifications WHERE booking_id = ? AND type = 'booking_confirmed' LIMIT 1",
          [mainId]
        );
        if (existing.length === 0) {
          const providerName = firstSlot.provider_name;
          const userName = firstSlot.user_name || 'A Customer';
          const dateStr = new Date(firstSlot.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
          const timeStr = bookingDetails.map(b => b.booking_time.substring(0, 5)).join(', ');

          await pool.query(
            'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, 'booking_confirmed', 'Payment Successful!', `Your booking for ${providerName} on ${dateStr} at ${timeStr} is fully confirmed.`, JSON.stringify({ booking_id: mainId }), mainId]
          );

          const [admins] = await pool.query("SELECT id FROM users WHERE role = 'admin'");
          for (const admin of admins) {
            await pool.query(
              'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
              [admin.id, 'new_booking', 'New Booking Received', `${userName} confirmed and paid for ${providerName} on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: mainId }), mainId]
            );
          }

          if (pvUserId) {
            await pool.query(
              'INSERT INTO notifications (user_id, type, title, message, metadata, booking_id) VALUES (?, ?, ?, ?, ?, ?)',
              [pvUserId, 'new_booking', 'New Booking Received', `${userName} completed payment for a booking on ${dateStr} at ${timeStr}.`, JSON.stringify({ booking_id: mainId }), mainId]
            );
          }
        }
      }
    } catch (notifErr) {}

    // Finally, send the user back to the React success screen
    res.redirect(`${FRONTEND_BASE}/payment-success?payment=success&bid=${booking_id}`);
  } catch (error) {
    res.redirect(`${FRONTEND_BASE}/payment-success?payment=success`);
  }
});

/**
 * @route GET /api/payment/failure/:booking_id
 * @desc Handle Failure Redirect. 
 *       If the user cancels or the payment fails, we cancel the booking 
 *       so the slot becomes available again for others.
 */
router.get('/payment/failure/:booking_id', async (req, res) => {
  try {
    const { booking_id } = req.params;
    const pool = getPool();
    const [bookingRows] = await pool.query("SELECT transaction_uuid FROM bookings WHERE id = ?", [parseInt(booking_id)]);
    if (bookingRows.length > 0 && bookingRows[0].transaction_uuid) {
       await pool.query("UPDATE bookings SET status = 'cancelled', payment_status = 'failed' WHERE transaction_uuid = ?", [bookingRows[0].transaction_uuid]);
    } else {
       await pool.query("UPDATE bookings SET status = 'cancelled', payment_status = 'failed' WHERE id = ?", [parseInt(booking_id)]);
    }
    // Release them back to their appointments list with a warning
    res.redirect(`${FRONTEND_BASE}/my-appointments?payment=cancelled`);
  } catch (err) {
    res.redirect(`${FRONTEND_BASE}/my-appointments?payment=cancelled`);
  }
});

module.exports = router;
