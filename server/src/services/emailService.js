/**
 * Communication Hub (Email Service)
 * 
 * relative path: /src/services/emailService.js
 * 
 * This file is responsible for all outgoing communication with users. 
 * We use Nodemailer with Gmail SMTP to send professionally branded HTML emails 
 * for everything from account verification to appointment reminders.
 * 
 * Security: SMTP credentials are pulled from Environment Variables (process.env).
 */

const nodemailer = require('nodemailer');

// --- SMTP CONFIGURATION ---
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * sendEmail
 * The base function that handles the heavy lifting of connecting to Gmail servers.
 */
const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"UniBook" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`>>> [EMAIL] Sent to ${to}: ${subject}`);
    return info;
  } catch (err) {
    // We log the error but don't crash the server (important for "fire-and-forget" calls)
    console.error(`>>> [EMAIL ERROR] Failed to send to ${to}:`, err.message);
  }
};

/**
 * --- PROVIDER ONBOARDING TEMPLATES ---
 */

// Sent when an Admin approves a new business listing
const sendProviderApproved = (email, name) => sendEmail(
  email,
  '🎉 Your UniBook Provider Account is Approved!',
  `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
    <div style="background: #10b981; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">✅ Account Verified!</h1>
    </div>
    <h2 style="color: #1e293b;">Hello, ${name}!</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      Great news! Your UniBook Service Provider application has been <strong>approved</strong> by our admin team.
    </p>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      You can now log in to your Provider Portal and start managing your bookings.
    </p>
    <div style="text-align: center; margin: 32px 0;">
      <a href="http://localhost:3000/login" 
         style="background: #10b981; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 16px;">
        Login to Your Portal
      </a>
    </div>
    <p style="color: #94a3b8; font-size: 13px; text-align: center;">
      Welcome to the UniBook provider family! If you have any questions, contact our support team.
    </p>
  </div>
  `
);

// Sent when an Admin rejects a business application (includes the reason)
const sendProviderRejected = (email, name, reason = '') => sendEmail(
  email,
  'UniBook Provider Application Update',
  `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
    <div style="background: #ef4444; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Application Update</h1>
    </div>
    <h2 style="color: #1e293b;">Hello, ${name}!</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      We have reviewed your UniBook Service Provider application. Unfortunately, we were unable to approve your application at this time.
    </p>
    ${reason ? `<div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <p style="color: #dc2626; margin: 0;"><strong>Reason:</strong> ${reason}</p>
    </div>` : ''}
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      Please contact our support team if you believe this is a mistake or wish to re-apply.
    </p>
    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">
      UniBook Support | contact@unibook.io
    </p>
  </div>
  `
);

// Auto-reply sent as soon as a provider submits their documents
const sendProviderApplicationReceived = (email, name) => sendEmail(
  email,
  '📝 Application Received - UniBook',
  `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
    <div style="background: #3b82f6; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Application Under Review</h1>
    </div>
    <h2 style="color: #1e293b;">Hello, ${name}!</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      Thank you for applying to become a Service Provider on UniBook. We have received your application successfully.
    </p>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      Our admin team is currently reviewing your submitted details and verification documents. This process typically takes 24-48 hours.
    </p>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      We will notify you via email as soon as a decision is made.
    </p>
    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">
      UniBook Support | contact@unibook.io
    </p>
  </div>
  `
);

// Sent if an Admin manually deactivates/removes a partner account
const sendProviderDeleted = (email, name) => sendEmail(
  email,
  '⚠️ Account Restricted - UniBook',
  `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
    <div style="background: #ef4444; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Account Removed</h1>
    </div>
    <h2 style="color: #1e293b;">Hello, ${name},</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      This email is to inform you that your Service Provider account on UniBook has been <strong>deleted</strong> by the administration team.
    </p>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      As a result, you will no longer be able to log in, access your Provider Portal, or receive bookings through our platform.
    </p>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      If you believe this action was taken in error or if you have any outstanding concerns regarding your account, please reach out to our administration team immediately.
    </p>
    <p style="color: #94a3b8; font-size: 13px; text-align: center; margin-top: 32px;">
      UniBook Administration | contact@unibook.io
    </p>
  </div>
  `
);

/**
 * --- CLIENT & TRANSACTIONAL TEMPLATES ---
 */

// The automated 1-hour appointment reminder
const sendBookingReminder = (email, name, providerName, time, date) => sendEmail(
  email,
  '⏰ Reminder: Your UniBook Appointment is in 1 Hour!',
  `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
    <div style="background: #0f172a; padding: 24px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
      <h1 style="color: #10b981; margin: 0; font-size: 24px;">Appointment Reminder</h1>
    </div>
    <h2 style="color: #1e293b;">Hello, ${name}!</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      This is a friendly reminder that you have an appointment today at <strong>${providerName}</strong>.
    </p>
    <div style="background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <div style="margin-bottom: 12px;">
        <span style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">Service Provider</span>
        <div style="color: #1e293b; font-weight: bold; font-size: 18px;">${providerName}</div>
      </div>
      <div style="display: flex; gap: 24px;">
        <div>
          <span style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">Date</span>
          <div style="color: #1e293b; font-weight: bold;">${date}</div>
        </div>
        <div style="margin-left: 40px;">
          <span style="color: #94a3b8; font-size: 12px; font-weight: bold; text-transform: uppercase;">Time</span>
          <div style="color: #10b981; font-weight: bold; font-size: 20px;">${time}</div>
        </div>
      </div>
    </div>
    <p style="color: #475569; font-size: 14px; text-align: center;">
      Please aim to arrive 5-10 minutes before your scheduled time. We look forward to seeing you!
    </p>
    <p style="color: #94a3b8; font-size: 11px; text-align: center; margin-top: 32px;">
      Manage your bookings at: <a href="http://localhost:3000/dashboard" style="color: #10b981; text-decoration: none;">UniBook Dashboard</a>
    </p>
  </div>
  `
);

// A security alert sent as soon as a password reset is completed
const sendPasswordResetAlert = (email, name) => sendEmail(
  email,
  '🔐 Security Alert: Your Password was Reset',
  `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f8fafc; border-radius: 12px;">
    <h2 style="color: #1e293b;">Hello, ${name},</h2>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      Your UniBook account password was recently successfully reset.
    </p>
    <p style="color: #475569; font-size: 16px; line-height: 1.6;">
      <strong>If this was not you:</strong> Please contact our support team immediately as your account security may be at risk.
    </p>
    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; text-align: center;">
      <p style="color: #94a3b8; font-size: 11px;">
        This is an automated security notification.
      </p>
    </div>
  </div>
  `
);

module.exports = { 
  sendProviderApproved, 
  sendProviderRejected, 
  sendProviderApplicationReceived, 
  sendProviderDeleted,
  sendBookingReminder,
  sendPasswordResetAlert
};
