/**
 * Multi-Factor Authentication Service (OTP)
 * 
 * relative path: /src/services/otpService.js
 * 
 * This file handles the "Security Gates" for registration and password resets.
 * 
 * How it works:
 * 1. Generating a random 6-digit number.
 * 2. Storing it in RAM (not DB) for 10 minutes.
 * 3. Attaching "Pending Data" (like a user's signup info) to the code.
 * 4. Validating the code and releasing the data to the next step.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

/**
 * --- IN-MEMORY VAULT ---
 * We use a Map to store codes. This is faster than a DB and automatically 
 * keeps sensitive temporary codes out of the permanent logs.
 */
const otpStore = new Map();

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }
  return transporter;
}

/**
 * createOTP
 * Generates a fresh 100,000 - 999,999 range number.
 * We can attach any 'data' (like user profile info) to the code so we 
 * don't lose it while the user is checking their inbox.
 */
function createOTP(email, data = {}, minutes = 10) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + minutes * 60 * 1000;
  otpStore.set(email, { otp, expiresAt, data });
  return otp;
}

/**
 * verifyOTP
 * The Guard. This checks if:
 * 1. The email even has a code pending.
 * 2. The code hasn't expired (over 10 mins).
 * 3. The digits match exactly.
 */
function verifyOTP(email, otp) {
  const record = otpStore.get(email);
  if (!record) return { valid: false, message: 'No pending request found. Please start over.' };
  
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email); // Clean up the expired trash
    return { valid: false, message: 'Code has expired. Please request a new one.' };
  }
  
  if (record.otp !== otp) return { valid: false, message: 'Invalid code. Please try again.' };
  
  // SUCCESS: Remove from memory so it can't be used twice
  otpStore.delete(email);
  return { valid: true, data: record.data };
}

/**
 * sendOTPEmail
 * Branded email delivery for the verification code.
 */
async function sendOTPEmail(email, otp, title = 'Verify your email') {
  try {
    const transport = getTransporter();
    await transport.sendMail({
      from: `"UniBook" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Your ${title} Code: ${otp}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 12px; background: #f8fafc;">
          <h2 style="color: #0f172a; margin-bottom: 4px;">${title}</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Use the code below to securely complete your action on <strong>UniBook</strong>.</p>
          <div style="background: #020617; color: #10b981; font-size: 36px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 24px; border-radius: 12px; margin: 24px 0; border: 1px solid #1e293b;">
            ${otp}
          </div>
          <p style="color: #94a3b8; font-size: 12px; text-align: center;">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</p>
        </div>
      `
    });
    console.log(`>>> [OTP SERVICE] Sent code ${otp} to ${email}`);
    return true;
  } catch (error) {
    console.error('>>> [OTP SERVICE ERROR]', error);
    return false;
  }
}

module.exports = { createOTP, verifyOTP, sendOTPEmail };
