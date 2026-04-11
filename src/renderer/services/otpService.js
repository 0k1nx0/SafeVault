// src/renderer/services/otpService.js
// Thin wrappers around IPC calls to the main process OTP handlers

const { ipcRenderer } = require('electron');

function sendOTP(phone)        { return ipcRenderer.invoke('otp:send', phone); }
function verifyOTP(phone, code){ return ipcRenderer.invoke('otp:verify', phone, code); }

module.exports = { sendOTP, verifyOTP };
