'use strict';
// src/renderer/controllers/dashboardController.js
// Accounts CRUD, settings, restore, strength checker, auto-lock

const crypto = require('crypto');
const {
  encryptObject, decryptObject, derivePhoneKey,
  encrypt, randomSalt, randomPassword
} = require('../services/cryptoService');
const {
  loadBlocks, saveBlocks,
  loadMaster, saveMaster,
  loadRecovery, saveRecovery,
  deletePasswordsFile, deleteRecoveryFile,
  dataDir
} = require('../services/vaultService');

// ── Session key ───────────────────────────────────────────────────────────────
function getKeyBuffer() {
  const hex = sessionStorage.getItem('vaultKey');
  return hex ? Buffer.from(hex, 'hex') : null;
}

// ── Auto-lock on inactivity ───────────────────────────────────────────────────
const INACTIVITY_MS = 6000;
let inactivityTimer = null;
function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    sessionStorage.removeItem('vaultKey');
    window.location.href = 'index.html';
  }, INACTIVITY_MS);
}
['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'].forEach(evt =>
  document.addEventListener(evt, resetInactivityTimer, { passive: true })
);
resetInactivityTimer();

// ── Helpers ───────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function makeOverlay() {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(5,18,28,0.85);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;`;
  return el;
}

function shakeEl(el) {
  el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

function svAlert(message, icon = '⚠️') {
  return new Promise((resolve) => {
    const ov = makeOverlay();
    ov.innerHTML = `<div style="background:linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018));border:1px solid rgba(0,240,201,0.14);border-radius:18px;padding:32px 28px;width:380px;max-width:calc(100vw - 32px);box-shadow:0 20px 80px rgba(0,0,0,0.7);color:#eafbf6;text-align:center;"><div style="font-size:36px;margin-bottom:12px;">${icon}</div><p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.8);line-height:1.6;">${message}</p><button id="_svAlertOk" style="background:linear-gradient(90deg,#00f0c9,#00d8b0);color:#072824;border:none;border-radius:10px;padding:11px 32px;font-weight:700;font-size:14px;cursor:pointer;">OK</button></div>`;
    document.body.appendChild(ov);
    ov.querySelector('#_svAlertOk').onclick = () => { ov.remove(); resolve(); };
  });
}

function svConfirm(message, icon = '🗑️') {
  return new Promise((resolve) => {
    const ov = makeOverlay();
    ov.innerHTML = `<div style="background:linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018));border:1px solid rgba(255,94,94,0.25);border-radius:18px;padding:32px 28px;width:400px;max-width:calc(100vw - 32px);box-shadow:0 20px 80px rgba(0,0,0,0.7);color:#eafbf6;text-align:center;"><div style="font-size:36px;margin-bottom:12px;">${icon}</div><p style="margin:0 0 24px;font-size:15px;color:rgba(255,255,255,0.8);line-height:1.6;">${message}</p><div style="display:flex;gap:12px;justify-content:center;"><button id="_svNo" style="background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.7);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:11px 26px;font-weight:600;font-size:14px;cursor:pointer;">Cancel</button><button id="_svYes" style="background:linear-gradient(90deg,#ff4b4b,#d63030);color:#fff;border:none;border-radius:10px;padding:11px 26px;font-weight:700;font-size:14px;cursor:pointer;">Confirm</button></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector('#_svYes').onclick = () => { ov.remove(); resolve(true); };
    ov.querySelector('#_svNo').onclick  = () => { ov.remove(); resolve(false); };
  });
}

// ── Password strength ─────────────────────────────────────────────────────────
function checkStrength(password) {
  const tips = []; let score = 0;
  if (password.length >= 8)          { score++; } else { tips.push('Use at least 8 characters'); }
  if (password.length >= 12)         { score++; } else if (password.length >= 8) { tips.push('12+ chars is even better'); }
  if (/[A-Z]/.test(password))        { score++; } else { tips.push('Add uppercase letters (A-Z)'); }
  if (/[a-z]/.test(password))        { score++; } else { tips.push('Add lowercase letters (a-z)'); }
  if (/[0-9]/.test(password))        { score++; } else { tips.push('Add numbers (0-9)'); }
  if (/[^A-Za-z0-9]/.test(password)) { score++; } else { tips.push('Add symbols (!@#$%^&*)'); }
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#ff4444', '#ff8c00', '#ffd700', '#7ec8e3', '#00d8b0', '#00f0c9'];
  return { score, label: labels[score] || 'Very Weak', color: colors[score] || '#ff4444', tips, percent: Math.round((score / 6) * 100) };
}

function bindStrengthChecker(inputId, fillId, labelId, tipsId) {
  const input = document.getElementById(inputId);
  const fill  = document.getElementById(fillId);
  const lbl   = document.getElementById(labelId);
  const tips  = tipsId ? document.getElementById(tipsId) : null;
  if (!input || !fill || !lbl) return;
  input.addEventListener('input', () => {
    const val = input.value;
    if (!val) { fill.style.width = '0%'; fill.style.background = 'transparent'; lbl.textContent = ''; if (tips) tips.innerHTML = ''; return; }
    const s = checkStrength(val);
    fill.style.width = s.percent + '%';
    fill.style.background = `linear-gradient(90deg, ${s.color}99, ${s.color})`;
    lbl.textContent = s.label; lbl.style.color = s.color;
    if (tips) tips.innerHTML = s.tips.map(t => `<li>${t}</li>`).join('');
  });
}

// ── Eye toggle ────────────────────────────────────────────────────────────────
const SVG_EYE_ON  = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const SVG_EYE_OFF = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;

function setupEyeToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if (!btn || !input) return;
  btn.onclick = () => {
    const showing = input.type === 'text';
    input.type = showing ? 'password' : 'text';
    btn.classList.toggle('active', !showing);
    const sv = btn.querySelector('svg');
    if (sv) sv.innerHTML = showing ? SVG_EYE_OFF : SVG_EYE_ON;
  };
}

// ── Master password verify modal ──────────────────────────────────────────────
function verifyMasterPassword() {
  return new Promise((resolve) => {
    const modal    = document.getElementById('masterVerifyModal');
    const input    = document.getElementById('mvInput');
    const errEl    = document.getElementById('mvError');
    const confirmB = document.getElementById('mvConfirm');
    const cancelB  = document.getElementById('mvCancel');
    const toggleB  = document.getElementById('mvToggle');
    input.value = ''; errEl.textContent = ''; input.type = 'password';
    modal.classList.remove('hidden');
    setTimeout(() => input.focus(), 80);
    toggleB.onclick = () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      toggleB.classList.toggle('active', input.type === 'text');
      const sv = toggleB.querySelector('svg');
      if (sv) sv.innerHTML = input.type === 'text' ? SVG_EYE_ON : SVG_EYE_OFF;
    };
    function cleanup(result) {
      modal.classList.add('hidden');
      confirmB.onclick = null; cancelB.onclick = null; input.onkeydown = null; modal.onclick = null;
      resolve(result);
    }
    function doVerify() {
      const entered = input.value.trim();
      if (!entered) { errEl.textContent = '⚠️ Please enter your master password.'; shakeEl(input); return; }
      try {
        const saved   = loadMaster();
        const derived = crypto.pbkdf2Sync(entered, Buffer.from(saved.salt, 'hex'), saved.iterations || 150000, 32, saved.digest || 'sha512');
        const hmac    = crypto.createHmac('sha256', derived).update('SafeVaultVerifier').digest('hex');
        if (hmac === saved.verifier) { cleanup(true); }
        else { errEl.textContent = '❌ Incorrect master password!'; input.value = ''; input.focus(); shakeEl(input); }
      } catch { errEl.textContent = '❌ Could not read master password file.'; }
    }
    confirmB.onclick = doVerify;
    input.onkeydown  = (e) => { if (e.key === 'Enter') doVerify(); };
    cancelB.onclick  = () => cleanup(false);
    modal.onclick    = (e) => { if (e.target === modal) cleanup(false); };
  });
}

// ── Render accounts ───────────────────────────────────────────────────────────
function renderAccounts(filterText = '') {
  const list = document.getElementById('accountsList');
  list.innerHTML = '';
  const key = getKeyBuffer();
  if (!key) {
    list.innerHTML = '<p style="text-align:center;color:var(--muted)">🔒 Session expired. Redirecting…</p>';
    setTimeout(() => window.location.href = 'index.html', 800);
    return;
  }
  const blocks = loadBlocks();
  const items  = [];
  blocks.forEach((block, index) => {
    try {
      const acc = decryptObject(block, key);
      if (!filterText || `${acc.website} ${acc.username}`.toLowerCase().includes(filterText.toLowerCase()))
        items.push({ acc, index });
    } catch {}
  });
  if (items.length === 0) {
    const noSavingsPath = require('path').join(__dirname, '../../../assets/no-savings.png').replace(/\\/g, '/');
    list.innerHTML = `<div class="empty-state"><img src="file:///${noSavingsPath}" alt="No accounts" class="empty-gif"><p>No accounts saved yet.<br><small style="color:var(--muted)">Add one above to get started.</small></p></div>`;
    return;
  }
  for (const { acc, index } of items) {
    const card = document.createElement('div');
    card.className = 'account-item';
    const row = document.createElement('div');
    row.className = 'account-row';
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.innerHTML = `<b>${escapeHtml(acc.website)}</b><div class="user">👤 ${escapeHtml(acc.username)}</div>`;
    const controls  = document.createElement('div');
    controls.className = 'controls';
    const passSpot = document.createElement('div');
    passSpot.className = 'pass-spot';
    passSpot.textContent = '••••••••';

    function btn(iconId, label, cls = 'btn-icon') {
      const b = document.createElement('button');
      b.className = cls;
      b.innerHTML = `<svg width="15" height="15"><use xlink:href="#${iconId}"></use></svg><span>${label}</span>`;
      return b;
    }
    const showBtn = btn('icon-eye',   'Show');
    const copyBtn = btn('icon-copy',  'Copy',   'btn-icon secondary');
    const editBtn = btn('icon-edit',  'Edit',   'btn-icon secondary');
    const delBtn  = btn('icon-trash', 'Delete', 'btn-icon ghost');

    let revealed = false, revealedVal = null, hideTimer = null;

    showBtn.onclick = async () => {
      if (revealed) {
        clearTimeout(hideTimer); passSpot.textContent = '••••••••';
        showBtn.querySelector('span').textContent = 'Show';
        showBtn.querySelector('use').setAttribute('xlink:href', '#icon-eye');
        revealed = false; revealedVal = null; return;
      }
      if (!await verifyMasterPassword()) return;
      try {
        revealedVal = decryptObject(loadBlocks()[index], getKeyBuffer()).password;
        passSpot.textContent = revealedVal;
        showBtn.querySelector('span').textContent = 'Hide (3s)';
        showBtn.querySelector('use').setAttribute('xlink:href', '#icon-eye-off');
        revealed = true;
        hideTimer = setTimeout(() => {
          passSpot.textContent = '••••••••';
          showBtn.querySelector('span').textContent = 'Show';
          showBtn.querySelector('use').setAttribute('xlink:href', '#icon-eye');
          revealed = false; revealedVal = null;
        }, 3000);
      } catch { await svAlert('Failed to decrypt password.'); }
    };

    copyBtn.onclick = async () => {
      if (!await verifyMasterPassword()) return;
      try {
        const toCopy = revealedVal || decryptObject(loadBlocks()[index], getKeyBuffer()).password;
        await navigator.clipboard.writeText(toCopy);
        copyBtn.querySelector('span').textContent = 'Copied!';
        setTimeout(() => copyBtn.querySelector('span').textContent = 'Copy', 1400);
      } catch { await svAlert('Failed to copy password.'); }
    };

    editBtn.onclick = async () => {
      const verifySub = document.querySelector('.verify-sub');
      if (verifySub) verifySub.textContent = 'Enter your master password to edit this account';
      if (!await verifyMasterPassword()) { if (verifySub) verifySub.textContent = 'Enter your master password to reveal this password'; return; }
      if (verifySub) verifySub.textContent = 'Enter your master password to reveal this password';
      try {
        const keyBuf       = getKeyBuffer();
        const blocksNow    = loadBlocks();
        const decryptedAcc = decryptObject(blocksNow[index], keyBuf);
        const modal     = document.getElementById('editModal');
        const siteInput = document.getElementById('editSite');
        const userInput = document.getElementById('editUser');
        const passInput = document.getElementById('editPass');
        const saveBtn   = document.getElementById('saveEdit');
        const cancelBtn = document.getElementById('cancelEdit');
        siteInput.value = decryptedAcc.website;
        userInput.value = decryptedAcc.username;
        passInput.value = decryptedAcc.password;
        passInput.type  = 'password';
        const editEyeSvg = document.querySelector('#toggleEditPass svg');
        if (editEyeSvg) editEyeSvg.innerHTML = SVG_EYE_OFF;
        document.getElementById('toggleEditPass').classList.remove('active');
        passInput.dispatchEvent(new Event('input'));
        modal.classList.remove('hidden');
        siteInput.focus();
        function closeEdit() { modal.classList.add('hidden'); saveBtn.onclick = null; cancelBtn.onclick = null; modal.onclick = null; }
        cancelBtn.onclick = closeEdit;
        modal.onclick = (e) => { if (e.target === modal) closeEdit(); };
        saveBtn.onclick = async () => {
          const newSite = siteInput.value.trim();
          const newUser = userInput.value.trim();
          const newPass = passInput.value.trim();
          if (!newSite || !newUser || !newPass) { await svAlert('All fields are required.'); return; }
          blocksNow[index] = encryptObject({ website: newSite, username: newUser, password: newPass }, keyBuf);
          saveBlocks(blocksNow);
          closeEdit();
          renderAccounts(document.getElementById('search').value);
        };
      } catch (err) { await svAlert('Failed to edit: ' + err.message); }
    };

    delBtn.onclick = async () => {
      if (!await svConfirm(`Delete <b>${acc.website}</b> / ${acc.username}?`)) return;
      const keyBuf    = getKeyBuffer();
      const blocksNow = loadBlocks();
      const deleted   = decryptObject(blocksNow[index], keyBuf);
      deletedAccounts.push(deleted);
      localStorage.setItem('deletedAccounts', JSON.stringify(deletedAccounts));
      blocksNow.splice(index, 1);
      saveBlocks(blocksNow);
      renderAccounts(document.getElementById('search').value);
    };

    controls.append(passSpot, showBtn, copyBtn, editBtn, delBtn);
    row.append(meta, controls);
    card.appendChild(row);
    list.appendChild(card);
  }
}

// ── Add account ───────────────────────────────────────────────────────────────
function addAccount() {
  const site = document.getElementById('site').value.trim();
  const user = document.getElementById('user').value.trim();
  const pass = document.getElementById('pass').value.trim();
  if (!site || !user || !pass) return svAlert('Please fill in all fields.');
  const keyBuf = getKeyBuffer();
  if (!keyBuf) return svAlert('Not authenticated. Please log in again.');
  const blocks = loadBlocks();
  blocks.push(encryptObject({ website: site, username: user, password: pass }, keyBuf));
  saveBlocks(blocks);
  document.getElementById('site').value = '';
  document.getElementById('user').value = '';
  document.getElementById('pass').value = '';
  document.getElementById('strengthFill').style.width = '0%';
  document.getElementById('strengthLabel').textContent = '';
  document.getElementById('strengthTips').innerHTML = '';
  renderAccounts(document.getElementById('search').value);
}

// ── Generate password ─────────────────────────────────────────────────────────
function generatePassword() {
  const passInput = document.getElementById('pass');
  passInput.value = randomPassword(16);
  passInput.type  = 'text';
  passInput.dispatchEvent(new Event('input'));
  setTimeout(() => { passInput.type = 'password'; }, 3000);
}

// ── Lock ──────────────────────────────────────────────────────────────────────
function lockAndLogout() {
  sessionStorage.removeItem('vaultKey');
  window.location.href = 'index.html';
}

// ── Restore deleted accounts ──────────────────────────────────────────────────
let deletedAccounts = JSON.parse(localStorage.getItem('deletedAccounts') || '[]');

function openRestoreModal() {
  const existing = document.getElementById('restoreModalDynamic');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'restoreModalDynamic';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content restore-modal-inner">
      <h3>♻️ Restore Deleted Accounts</h3>
      <div class="restore-list" id="restoreList">
        ${deletedAccounts.length === 0
          ? '<p style="text-align:center;color:var(--muted)">No deleted accounts.</p>'
          : deletedAccounts.map((acc, idx) => `
              <div class="account-item restore-row" data-idx="${idx}">
                <div class="meta"><b>${escapeHtml(acc.website)}</b><div class="user">👤 ${escapeHtml(acc.username)}</div></div>
                <div class="restore-actions">
                  <button class="btn-icon" onclick="restoreAccount(${idx})">Restore</button>
                  <button class="btn-icon ghost" onclick="permanentDelete(${idx})">Delete</button>
                </div>
              </div>`).join('')}
      </div>
      <div class="modal-actions" style="border-top:1px solid rgba(255,255,255,0.06);padding-top:12px;margin-top:12px;">
        <button class="btn-secondary" id="deleteAllDeletedBtn">Delete All</button>
        <button class="btn-primary"   id="closeRestoreBtn">Close</button>
      </div>
    </div>`;
  document.body.appendChild(modal);
  document.getElementById('closeRestoreBtn').onclick = () => modal.remove();
  modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
  document.getElementById('deleteAllDeletedBtn').onclick = async () => {
    if (!await svConfirm('Permanently delete all deleted accounts?')) return;
    deletedAccounts = [];
    localStorage.setItem('deletedAccounts', JSON.stringify([]));
    modal.remove();
  };
}

function restoreAccount(index) {
  const keyBuf = getKeyBuffer();
  if (!keyBuf) return svAlert('Not authenticated.');
  const acc = deletedAccounts[index];
  const blocks = loadBlocks();
  blocks.push(encryptObject(acc, keyBuf));
  saveBlocks(blocks);
  deletedAccounts.splice(index, 1);
  localStorage.setItem('deletedAccounts', JSON.stringify(deletedAccounts));
  renderAccounts(document.getElementById('search').value);
  openRestoreModal();
}

async function permanentDelete(index) {
  if (!await svConfirm('Permanently delete this account?')) return;
  deletedAccounts.splice(index, 1);
  localStorage.setItem('deletedAccounts', JSON.stringify(deletedAccounts));
  openRestoreModal();
}

// ── Settings ──────────────────────────────────────────────────────────────────
function openSettingsModal()  { document.getElementById('settingsModal').classList.remove('hidden'); }
function closeSettingsModal() { document.getElementById('settingsModal').classList.add('hidden'); }
function isValidPhone(phone)  { return /^\+[1-9]\d{7,14}$/.test(phone.trim()); }

// ── DOMContentLoaded: wire everything up ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (!getKeyBuffer()) { window.location.href = 'index.html'; return; }

  setupEyeToggle('toggleAddPass',  'pass');
  setupEyeToggle('toggleEditPass', 'editPass');
  bindStrengthChecker('pass',     'strengthFill',     'strengthLabel',     'strengthTips');
  bindStrengthChecker('editPass', 'editStrengthFill', 'editStrengthLabel', null);

  document.getElementById('search').addEventListener('input', (e) => renderAccounts(e.target.value));
  document.getElementById('lockBtn').addEventListener('click', lockAndLogout);
  document.getElementById('restoreBtn').addEventListener('click', openRestoreModal);

  // Settings: recovery phone
  document.getElementById('updatePhoneBtn').addEventListener('click', () => {
    closeSettingsModal();
    const vaultKeyHex = sessionStorage.getItem('vaultKey');
    if (!vaultKeyHex) return svAlert('Not authenticated.');
    const overlay = makeOverlay();
    overlay.innerHTML = `
      <div style="background:linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018));border:1px solid rgba(0,240,201,0.14);border-radius:18px;padding:30px 26px;width:400px;max-width:calc(100vw - 32px);box-shadow:0 20px 80px rgba(0,0,0,0.7);color:#eafbf6;text-align:center;">
        <div style="font-size:32px;margin-bottom:8px;">📱</div>
        <h2 style="margin:0 0 8px;font-size:19px;color:#00f0c9;">Update Recovery Phone</h2>
        <p style="color:rgba(255,255,255,0.5);font-size:13px;margin:0 0 16px;line-height:1.6;">This phone will be used to recover your vault if you forget your master password.</p>
        <input type="tel" id="dashPhoneInput" placeholder="+92 300 0000000" style="width:100%;padding:13px 15px;border-radius:11px;border:1px solid rgba(255,255,255,0.07);background:rgba(255,255,255,0.025);color:#e6ffff;outline:none;font-size:15px;box-sizing:border-box;margin-bottom:4px;">
        <p id="dashPhoneInfo" style="min-height:18px;font-size:13px;color:rgba(255,255,255,0.5);margin:8px 0 14px;"></p>
        <div style="display:flex;gap:10px;justify-content:center;">
          <button id="dashPhoneCancel" style="background:rgba(255,255,255,0.04);color:rgba(255,255,255,0.65);border:1px solid rgba(255,255,255,0.08);border-radius:10px;padding:10px 22px;font-weight:600;font-size:14px;cursor:pointer;">Cancel</button>
          <button id="dashPhoneSave"   style="background:linear-gradient(90deg,#00f0c9,#00d8b0);color:#072824;border:none;border-radius:10px;padding:10px 22px;font-weight:700;font-size:14px;cursor:pointer;">Save Phone</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.querySelector('#dashPhoneInput').focus(), 80);
    overlay.querySelector('#dashPhoneCancel').onclick = () => overlay.remove();
    overlay.querySelector('#dashPhoneSave').onclick = () => {
      const phone = overlay.querySelector('#dashPhoneInput').value.replace(/\s/g, '');
      if (!isValidPhone(phone)) { overlay.querySelector('#dashPhoneInfo').textContent = '⚠️ Enter a valid phone with country code.'; return; }
      saveRecovery(phone, vaultKeyHex);
      overlay.remove();
      const toast = document.createElement('div');
      toast.textContent = '✅ Recovery phone updated!';
      toast.style.cssText = `position:fixed;bottom:28px;left:50%;transform:translateX(-50%);background:rgba(0,240,201,0.12);border:1px solid rgba(0,240,201,0.2);color:#00f0c9;padding:12px 22px;border-radius:12px;font-size:14px;font-weight:600;z-index:9999;backdrop-filter:blur(8px);`;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2800);
    };
  });

  // Settings: about
  document.getElementById('infoBtn').addEventListener('click', () => {
    closeSettingsModal();
    const iconPath = require('path').join(__dirname, '../../../assets/icon.png').replace(/\\/g, '/');
    const overlay = makeOverlay();
    overlay.innerHTML = `
      <div style="background:linear-gradient(160deg,rgba(13,31,45,0.98),rgba(9,22,32,0.98));border:1px solid rgba(0,240,201,0.18);border-radius:22px;width:400px;max-width:calc(100vw - 32px);box-shadow:0 24px 80px rgba(0,0,0,0.8),0 0 60px rgba(0,240,201,0.06);color:#eafbf6;overflow:hidden;">
        <!-- Header band -->
        <div style="background:linear-gradient(135deg,rgba(0,240,201,0.1),rgba(0,240,201,0.03));padding:32px 28px 24px;text-align:center;border-bottom:1px solid rgba(0,240,201,0.1);position:relative;">
          <div style="position:relative;display:inline-block;margin-bottom:14px;">
            <img src="file:///${iconPath}" alt="SafeVault" style="width:72px;height:72px;border-radius:18px;object-fit:cover;box-shadow:0 8px 32px rgba(0,240,201,0.2);display:block;">
            <div style="position:absolute;inset:-4px;border-radius:22px;border:1.5px solid rgba(0,240,201,0.35);pointer-events:none;"></div>
          </div>
          <div style="font-size:24px;font-weight:800;color:#eafbf8;letter-spacing:.4px;margin-bottom:4px;">SafeVault</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.45);letter-spacing:.3px;">Secure Desktop Password Manager</div>
          <div style="display:inline-block;margin-top:10px;background:rgba(0,240,201,0.1);border:1px solid rgba(0,240,201,0.25);border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;color:#00f0c9;letter-spacing:.5px;">v 3.0.0</div>
        </div>
        <!-- Body -->
        <div style="padding:22px 28px 26px;">
          <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:rgba(255,255,255,0.3);margin-bottom:12px;">Core Developers</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:22px;">
            ${['Abdullah','Swastika','Karan'].map(name => `
              <div style="display:flex;align-items:center;gap:8px;background:rgba(0,240,201,0.06);border:1px solid rgba(0,240,201,0.15);border-radius:10px;padding:8px 14px;">
                <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,rgba(0,240,201,0.3),rgba(0,200,160,0.15));display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#00f0c9;">${name[0]}</div>
                <span style="font-size:13px;font-weight:600;color:#eafbf8;">${name}</span>
              </div>`).join('')}
          </div>
          <div style="background:rgba(0,0,0,0.2);border-radius:10px;padding:12px 14px;margin-bottom:22px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:rgba(255,255,255,0.35);">© 2026 Tangersoft. All rights reserved.</span>
            <span style="font-size:11px;color:rgba(0,240,201,0.5);font-weight:600;">AES-256</span>
          </div>
          <button id="closeInfoBtn" style="width:100%;background:linear-gradient(90deg,#00f0c9,#00d8b0);color:#063733;border:none;border-radius:11px;padding:12px;font-weight:700;font-size:14px;cursor:pointer;letter-spacing:.3px;transition:transform .12s;">Close</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#closeInfoBtn').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  });

  // Settings: factory reset
  document.getElementById('resetBtn').addEventListener('click', () => {
    closeSettingsModal();
    const overlay = makeOverlay();
    overlay.innerHTML = `
      <div style="background:linear-gradient(160deg,rgba(255,50,50,0.05),rgba(255,50,50,0.01));border:1px solid rgba(255,94,94,0.3);border-radius:18px;padding:32px 26px;width:420px;max-width:calc(100vw - 32px);box-shadow:0 20px 80px rgba(255,50,50,0.15);color:#eafbf6;text-align:center;">
        <div style="font-size:42px;margin-bottom:12px;">⚠️</div>
        <h2 style="margin:0 0 12px;font-size:20px;color:#ff5e5e;">Erase All Vault Data?</h2>
        <p style="color:rgba(255,255,255,0.7);font-size:14px;margin:0 0 28px;line-height:1.6;">This will <b>permanently delete</b> all your saved accounts, encrypted passwords, and recovery settings.<br><br>This action cannot be undone.</p>
        <div style="display:flex;gap:12px;justify-content:center;">
          <button id="cancelResetBtn"  style="background:rgba(255,255,255,0.05);color:rgba(255,255,255,0.8);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:12px 24px;font-weight:600;font-size:14px;cursor:pointer;">Cancel</button>
          <button id="confirmResetBtn" style="background:linear-gradient(90deg,#ff4b4b,#d63030);color:#fff;border:none;border-radius:10px;padding:12px 24px;font-weight:700;font-size:14px;cursor:pointer;">Yes, Erase Everything</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#cancelResetBtn').onclick = () => overlay.remove();
    overlay.querySelector('#confirmResetBtn').onclick = () => {
      try {
        deletePasswordsFile();
        deleteRecoveryFile();
        localStorage.clear();
        sessionStorage.clear();
        overlay.innerHTML = `<div style="background:linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018));border:1px solid rgba(0,240,201,0.25);border-radius:18px;padding:40px 32px;width:380px;box-shadow:0 20px 80px rgba(0,0,0,0.8);color:#eafbf6;text-align:center;"><div style="width:72px;height:72px;background:rgba(0,240,201,0.1);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 20px auto;border:1px solid rgba(0,240,201,0.3);"><svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#00f0c9" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg></div><h2 style="margin:0 0 8px;font-size:22px;color:#00f0c9;">Vault Wiped Successfully</h2><p style="color:rgba(255,255,255,0.6);font-size:15px;margin:0;">Returning to login...</p></div>`;
        setTimeout(() => window.location.href = 'index.html', 1500);
      } catch (err) { svAlert('Error resetting vault: ' + err.message); overlay.remove(); }
    };
  });

  document.getElementById('closeSettings').addEventListener('click', closeSettingsModal);
  window.addEventListener('click', (e) => { if (e.target === document.getElementById('settingsModal')) closeSettingsModal(); });

  renderAccounts();
});

// Expose to HTML onclicks
window.addAccount       = addAccount;
window.generatePassword = generatePassword;
window.openSettingsModal = openSettingsModal;
window.restoreAccount   = restoreAccount;
window.permanentDelete  = permanentDelete;
