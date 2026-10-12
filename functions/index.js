const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
require('dotenv').config();

const {
  getInitialConfirmationEmail,
  getConfirmedEmail,
  getCancelledEmail
} = require('./templates/emailTemplates');
const smsService = require('./services/smsService');

admin.initializeApp();

/**
 * Configure Nodemailer Transporter
 * Reads from .env file (deployed securely alongside functions).
 * Gmail App Passwords may contain spaces — strip them before use.
 */
function createTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  // Strip spaces from Gmail App Password (e.g. "uxnf rcic esnm vogx" -> "uxnfrcicesmnvogx")
  const rawPass = process.env.SMTP_PASS || process.env.GMAIL_PASS || '';
  const pass = rawPass.replace(/\s+/g, '');

  if (user && pass) {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  }

  // Fallback: log-only transport for testing when credentials are not set
  console.warn('[Mailer] No SMTP credentials found — using JSON transport (emails will be logged, not sent).');
  return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = createTransporter();
const SENDER_EMAIL = process.env.SMTP_FROM || process.env.SMTP_USER || 'reservations@mochaandmiso.com';

/**
 * Helper to safely dispatch email and update Firestore status
 */
async function sendEmailAndUpdateStatus(docRef, recipientEmail, mailOptions) {
  if (!recipientEmail) {
    console.warn(`[Cloud Functions] Missing email address for doc ${docRef.id}`);
    await docRef.update({ emailStatus: 'Failed', updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return;
  }

  try {
    const info = await transporter.sendMail({
      from: `"Mocha & Miso Craft Café" <${SENDER_EMAIL}>`,
      to: recipientEmail,
      subject: mailOptions.subject,
      html: mailOptions.html
    });

    console.log(`[Cloud Functions Email Sent] Message ID: ${info.messageId || 'DEV_STREAM'} to ${recipientEmail}`);

    await docRef.update({
      emailStatus: 'Sent',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error(`[Cloud Functions Email Error] Failed to send email to ${recipientEmail}:`, error);

    // Reservation remains saved! Mark emailStatus as Failed.
    await docRef.update({
      emailStatus: 'Failed',
      emailError: error.message || 'Transmission failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }).catch(err => console.error('Failed to update emailStatus field:', err));
  }
}

/**
 * 1. Firestore Trigger: onCreate
 * Automatically sends initial confirmation email immediately after reservation is created.
 */
exports.onReservationCreated = functions.firestore
  .document('reservations/{resId}')
  .onCreate(async (snap, context) => {
    const res = snap.data();
    const resId = context.params.resId;
    res.id = res.id || resId;
    res.reservationId = res.reservationId || resId;

    console.log(`[onReservationCreated] New reservation created: ${resId} for ${res.email}`);

    // Generate initial confirmation email
    const mailOptions = getInitialConfirmationEmail(res);

    // Dispatch email
    await sendEmailAndUpdateStatus(snap.ref, res.email, mailOptions);

    // SMS readiness trigger (optional)
    if (res.phone) {
      await smsService.sendSMS(res.phone, `Mocha & Miso: Đã nhận yêu cầu đặt bàn ${res.reservationId} của bạn vào ngày ${res.date}, lúc ${res.time}.`);
    }
  });

/**
 * 2. Firestore Trigger: onUpdate
 * Automatically sends follow-up email when Admin changes status to "Confirmed" or "Cancelled".
 */
exports.onReservationStatusUpdated = functions.firestore
  .document('reservations/{resId}')
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();
    const resId = context.params.resId;
    afterData.id = afterData.id || resId;
    afterData.reservationId = afterData.reservationId || resId;

    // Check if status changed
    const oldStatus = (beforeData.status || '').toLowerCase();
    const newStatus = (afterData.status || '').toLowerCase();

    if (oldStatus === newStatus) {
      return null;
    }

    console.log(`[onReservationStatusUpdated] Reservation ${resId} status changed from "${oldStatus}" to "${newStatus}"`);

    let mailOptions = null;
    if (newStatus === 'confirmed') {
      mailOptions = getConfirmedEmail(afterData);
    } else if (newStatus === 'cancelled') {
      mailOptions = getCancelledEmail(afterData);
    }

    if (mailOptions) {
      await sendEmailAndUpdateStatus(change.after.ref, afterData.email, mailOptions);

      // Send SMS status update if phone exists
      if (afterData.phone) {
        const localizedStatus = newStatus === 'confirmed' ? 'đã được xác nhận' : 'đã bị hủy';
        await smsService.sendSMS(afterData.phone, `Mocha & Miso: Đặt bàn ${afterData.reservationId} ${localizedStatus}.`);
      }
    }
  });
