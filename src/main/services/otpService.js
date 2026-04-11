// src/main/services/otpService.js
// Handles OTP generation and SMS delivery via 2factor.in

const https  = require('https');
const crypto = require('crypto');

let smsConfig = null;
try {
  smsConfig = require('../../../sms-config');
} catch {
  smsConfig = null;
}

const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateOTP() {
  return String(Math.floor(100000 + crypto.randomInt(900000)));
}

function sendSMS(phone, otp) {
  return new Promise((resolve) => {
    if (!smsConfig?.apiKey) {
      resolve({ success: false, error: 'SMS OTP is not configured. Add sms-config.js with your 2Factor API key.' });
      return;
    }

    const number = phone.replace(/^\+91/, '').replace(/\s/g, '');
    const req = https.request({
      hostname: '2factor.in',
      path: `/API/V1/${smsConfig.apiKey}/SMS/${number}/${otp}`,
      method: 'GET'
    }, (res) => {
      let raw = '';
      res.on('data', c => raw += c);
      res.on('end', () => {
        try {
          const json = JSON.parse(raw);
          console.log('[2Factor]', json);
          if (json.Status === 'Success') resolve({ success: true });
          else resolve({ success: false, error: json.Details || raw });
        } catch { resolve({ success: false, error: raw }); }
      });
    });
    req.on('error', e => resolve({ success: false, error: e.message }));
    req.end();
  });
}

async function sendOTP(phone) {
  const code = generateOTP();
  otpStore.set(phone, { code, expiresAt: Date.now() + OTP_EXPIRY_MS });
  const result = await sendSMS(phone, code);
  if (!result.success) otpStore.delete(phone);
  return result;
}

function verifyOTP(phone, code) {
  const entry = otpStore.get(phone);
  if (!entry)                         return { valid: false, reason: 'No OTP sent to this number.' };
  if (Date.now() > entry.expiresAt) { otpStore.delete(phone); return { valid: false, reason: 'OTP has expired.' }; }
  if (entry.code !== String(code).trim()) return { valid: false, reason: 'Incorrect code. Try again.' };
  otpStore.delete(phone);
  return { valid: true };
}

module.exports = { sendOTP, verifyOTP };
