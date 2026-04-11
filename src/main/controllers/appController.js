// src/main/controllers/appController.js
// Handles IPC events for app-level utilities

const { app } = require('electron');

function handleGetUserDataPath() {
  return app.getPath('userData');
}

function handleGetUserDataPathSync(event) {
  event.returnValue = app.getPath('userData');
}

module.exports = { handleGetUserDataPath, handleGetUserDataPathSync };
