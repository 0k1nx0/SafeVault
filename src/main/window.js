// src/main/window.js
// BrowserWindow factory

const { BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200, height: 800, show: false,
    backgroundColor: '#141e30',
    icon: path.join(__dirname, '../../assets/icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, '../../preload.js'),
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.maximize();
  win.show();
  win.setMenu(null);
  win.loadFile('src/renderer/views/index.html');
  // Note: relative paths in HTML files use __dirname of the loaded file

  win.on('minimize', () => {
    win.webContents.executeJavaScript(`
      sessionStorage.removeItem('vaultKey');
      if (!window.location.href.includes('index.html')) window.location.href = 'index.html';
    `).catch(() => {});
  });

  return win;
}

module.exports = { createWindow };
