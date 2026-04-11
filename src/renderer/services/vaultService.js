// src/renderer/services/vaultService.js
// File I/O for passwords, master password, and recovery data

const fs   = require('fs');
const path = require('path');
const { ipcRenderer } = require('electron');
const { encrypt, decrypt, derivePhoneKey, randomSalt } = require('./cryptoService');

const userDataPath  = ipcRenderer.sendSync('app:getUserDataPathSync');
const dataDir       = path.join(userDataPath, 'data');
const passwordsFile = path.join(dataDir, 'passwords.json');
const masterFile    = path.join(dataDir, 'master.json');
const recoveryFile  = path.join(dataDir, 'recovery.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ── Master password ───────────────────────────────────────────────────────────
function masterExists()   { return fs.existsSync(masterFile); }
function loadMaster()     { return JSON.parse(fs.readFileSync(masterFile, 'utf-8')); }
function saveMaster(data) { fs.writeFileSync(masterFile, JSON.stringify(data, null, 2), 'utf-8'); }

// ── Vault blocks ──────────────────────────────────────────────────────────────
function loadBlocks() {
  if (!fs.existsSync(passwordsFile)) return [];
  const raw = fs.readFileSync(passwordsFile, 'utf8').trim();
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveBlocks(blocks) {
  fs.writeFileSync(passwordsFile, JSON.stringify(blocks, null, 2), 'utf8');
}

function deletePasswordsFile() {
  if (fs.existsSync(passwordsFile)) fs.unlinkSync(passwordsFile);
}

// ── Recovery data ─────────────────────────────────────────────────────────────
function loadRecovery() {
  if (!fs.existsSync(recoveryFile)) return null;
  try { return JSON.parse(fs.readFileSync(recoveryFile, 'utf-8')); } catch { return null; }
}

function saveRecovery(phone, vaultKeyHex) {
  const phoneSalt   = randomSalt();
  const phoneKey    = derivePhoneKey(phone, phoneSalt);
  const encVaultKey = encrypt(vaultKeyHex, phoneKey);
  const metaSalt    = randomSalt();
  const metaKey     = require('crypto').scryptSync('safevault-meta', metaSalt, 32);
  const encPhone    = encrypt(phone, metaKey);
  fs.writeFileSync(recoveryFile, JSON.stringify(
    { phoneSalt, encryptedVaultKey: encVaultKey, encryptedPhone: encPhone, metaSalt }, null, 2
  ), 'utf-8');
}

function deleteRecoveryFile() {
  if (fs.existsSync(recoveryFile)) fs.unlinkSync(recoveryFile);
}

function getMaskedPhone(rec) {
  try {
    const metaKey = require('crypto').scryptSync('safevault-meta', rec.metaSalt, 32);
    const phone   = decrypt(rec.encryptedPhone, metaKey);
    return phone.slice(0, 3) + ' **** ***' + phone.slice(-2);
  } catch { return '*** **** ****'; }
}

function getRecoveryPhone(rec) {
  const metaKey = require('crypto').scryptSync('safevault-meta', rec.metaSalt, 32);
  return decrypt(rec.encryptedPhone, metaKey);
}

module.exports = {
  dataDir, masterFile, recoveryFile,
  masterExists, loadMaster, saveMaster,
  loadBlocks, saveBlocks, deletePasswordsFile,
  loadRecovery, saveRecovery, deleteRecoveryFile,
  getMaskedPhone, getRecoveryPhone
};
