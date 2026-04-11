// src/main/routes/ipcRoutes.js
// Registers all ipcMain handlers — the single place that wires routes to controllers

const { ipcMain } = require('electron');
const { handleSendOTP, handleVerifyOTP }             = require('../controllers/otpController');
const { handleGetUserDataPath, handleGetUserDataPathSync } = require('../controllers/appController');

function registerRoutes() {
  ipcMain.handle('app:getUserDataPath',    handleGetUserDataPath);
  ipcMain.on(    'app:getUserDataPathSync', handleGetUserDataPathSync);
  ipcMain.handle('otp:send',   handleSendOTP);
  ipcMain.handle('otp:verify', handleVerifyOTP);
}

module.exports = { registerRoutes };
