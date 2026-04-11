// main.js — entry point (thin)
const { app } = require('electron');

// Handle Squirrel install/uninstall events (creates/removes desktop & start menu shortcuts)
if (require('electron-squirrel-startup')) app.quit();

const { registerRoutes } = require('./src/main/routes/ipcRoutes');
const { createWindow }   = require('./src/main/window');

app.whenReady().then(() => {
  registerRoutes();
  createWindow();
});
