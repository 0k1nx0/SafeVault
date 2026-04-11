// src/main/controllers/otpController.js
// Handles IPC events for OTP send/verify

const { sendOTP, verifyOTP } = require('../services/otpService');

async function handleSendOTP(_event, phone) {
  return await sendOTP(phone);
}

function handleVerifyOTP(_event, phone, code) {
  return verifyOTP(phone, code);
}

module.exports = { handleSendOTP, handleVerifyOTP };
