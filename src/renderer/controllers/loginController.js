// src/renderer/controllers/loginController.js
// Handles login, vault creation, and forgot-password OTP recovery flow

'use strict';

const crypto = require('crypto');
const {
  deriveKey, generateHmac, randomSalt, PBKDF2_ITER, DIGEST, KEY_LEN
} = require('../services/cryptoService');
const {
  masterExists, loadMaster, saveMaster,
  loadRecovery, saveRecovery,
  getMaskedPhone, getRecoveryPhone
} = require('../services/vaultService');
const { decrypt, derivePhoneKey } = require('../services/cryptoService');
const { sendOTP, verifyOTP } = require('../services/otpService');

// ── DOM refs ──────────────────────────────────────────────────────────────────
const passwordInput = document.getElementById('masterPassword');
const info          = document.getElementById('info');
const loginBtn      = document.getElementById('loginBtn');
const titleEl       = document.getElementById('title');
const toggleBtn     = document.getElementById('toggleLoginPass');
const forgotLink    = document.getElementById('forgotLink');

// ── Eye toggle ────────────────────────────────────────────────────────────────
const SVG_EYE_ON  = `<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>`;
const SVG_EYE_OFF = `<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>`;

if (toggleBtn) {
  toggleBtn.addEventListener('click', () => {
    const isHidden = passwordInput.type === 'password';
    passwordInput.type = isHidden ? 'text' : 'password';
    toggleBtn.classList.toggle('active', isHidden);
    const sv = toggleBtn.querySelector('svg');
    if (sv) sv.innerHTML = isHidden ? SVG_EYE_ON : SVG_EYE_OFF;
  });
}

// ── Mode: create vs login ─────────────────────────────────────────────────────
let mode = 'login';
if (!masterExists()) {
  mode = 'create';
  if (titleEl)    titleEl.textContent    = 'Create Master Password';
  if (loginBtn)   loginBtn.textContent   = 'Create Vault';
  if (info)       info.textContent       = 'Choose a strong master password — it protects all your data.';
  if (forgotLink) forgotLink.style.display = 'none';
}

if (passwordInput) passwordInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
if (forgotLink)    forgotLink.addEventListener('click', (e) => { e.preventDefault(); startForgotFlow(); });

// ── Utilities ─────────────────────────────────────────────────────────────────
function showInfo(msg, type) {
  if (!info) return;
  info.textContent = msg;
  info.className = 'p-muted' + (type === 'err' ? ' err-text' : type === 'ok' ? ' ok-text' : '');
}

function fadeOut(cb) {
  document.body.style.transition = 'opacity .4s ease';
  document.body.style.opacity = 0;
  setTimeout(cb, 420);
}

function shake(el) {
  el.classList.remove('shake');
  void el.offsetWidth;
  el.classList.add('shake');
  el.addEventListener('animationend', () => el.classList.remove('shake'), { once: true });
}

function makeOverlay() {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;inset:0;z-index:9999;background:rgba(5,18,28,0.85);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;`;
  return el;
}

function isValidPhone(phone) { return /^\+[1-9]\d{7,14}$/.test(phone.trim()); }

// ── Modal styles ──────────────────────────────────────────────────────────────
(function () {
  const s = document.createElement('style');
  s.textContent = `
    .sv-modal { background:linear-gradient(160deg,rgba(255,255,255,0.045),rgba(255,255,255,0.018)); border:1px solid rgba(0,240,201,0.14); border-radius:18px; padding:32px 28px; width:420px; max-width:calc(100vw - 32px); box-shadow:0 20px 80px rgba(0,0,0,0.7); color:#eafbf6; text-align:center; }
    .sv-modal-title { margin:0 0 8px; font-size:20px; color:#00f0c9; letter-spacing:.4px; }
    .sv-modal-sub   { color:rgba(255,255,255,0.52); font-size:13.5px; margin:0 0 18px; line-height:1.65; }
    .sv-input { width:100%; padding:13px 15px; border-radius:11px; border:1px solid rgba(255,255,255,0.07); background:rgba(255,255,255,0.025); color:#e6ffff; outline:none; font-size:15px; box-sizing:border-box; transition:border-color .12s,box-shadow .12s; }
    .sv-input:focus { border-color:rgba(0,240,201,0.4); box-shadow:0 0 14px rgba(0,240,201,0.07); }
    .sv-info { min-height:18px; font-size:13px; color:rgba(255,255,255,0.52); margin:10px 0 0; }
    .sv-btn-primary { background:linear-gradient(90deg,#00f0c9,#00d8b0); color:#072824; border:none; border-radius:10px; padding:11px 24px; font-weight:700; font-size:14px; cursor:pointer; transition:transform .12s; }
    .sv-btn-primary:hover { transform:translateY(-2px); }
    .sv-btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
    .sv-btn-ghost { background:rgba(255,255,255,0.04); color:rgba(255,255,255,0.65); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:11px 24px; font-weight:600; font-size:14px; cursor:pointer; }
    .sv-btn-ghost:hover { background:rgba(255,255,255,0.08); }
  `;
  document.head.appendChild(s);
})();

// ── Phone setup modal ─────────────────────────────────────────────────────────
function showPhoneModal(vaultKeyHex, onDone) {
  const overlay = makeOverlay();
  overlay.innerHTML = `
    <div class="sv-modal">
      <div style="font-size:34px;margin-bottom:10px;">📱</div>
      <h2 class="sv-modal-title">Add Recovery Phone</h2>
      <p class="sv-modal-sub">
        If you forget your master password, we'll send an OTP to verify your identity.<br>
        <span style="color:rgba(255,255,255,0.38);font-size:12px;">Format: +92XXXXXXXXXX · +1XXXXXXXXXX</span>
      </p>
      <input type="tel" id="phoneInput" placeholder="+92 300 0000000" class="sv-input">
      <p id="phoneInfo" class="sv-info"></p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;">
        <button id="skipPhone" class="sv-btn-ghost">Skip for now</button>
        <button id="savePhone" class="sv-btn-primary">Save &amp; Continue →</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#skipPhone').onclick = () => { overlay.remove(); onDone(); };
  overlay.querySelector('#savePhone').onclick = () => {
    const phone = overlay.querySelector('#phoneInput').value.replace(/\s/g, '');
    if (!isValidPhone(phone)) { overlay.querySelector('#phoneInfo').textContent = '⚠️ Enter a valid phone with country code (e.g. +923001234567)'; return; }
    saveRecovery(phone, vaultKeyHex);
    overlay.remove();
    onDone();
  };
}

// ── Forgot flow ───────────────────────────────────────────────────────────────
function startForgotFlow() {
  const rec = loadRecovery();
  if (!rec) {
    showSimpleAlert('❌', 'No Recovery Phone', "You didn't set a recovery phone.\nYou can add one in Dashboard → Settings after logging in.");
    return;
  }
  showOTPRequestModal(getMaskedPhone(rec), rec);
}

function showOTPRequestModal(masked, rec) {
  const overlay = makeOverlay();
  overlay.innerHTML = `
    <div class="sv-modal">
      <div style="font-size:34px;margin-bottom:10px;">🔐</div>
      <h2 class="sv-modal-title">Forgot Password</h2>
      <p class="sv-modal-sub">We'll send a 6-digit OTP to:<br><span style="color:#00f0c9;font-size:16px;font-weight:600;">${masked}</span></p>
      <p id="otpReqInfo" class="sv-info"></p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;">
        <button id="cancelOtp" class="sv-btn-ghost">Cancel</button>
        <button id="sendOtp"   class="sv-btn-primary">Send OTP</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#cancelOtp').onclick = () => overlay.remove();
  overlay.querySelector('#sendOtp').onclick = async () => {
    const btn = overlay.querySelector('#sendOtp');
    const reqInfo = overlay.querySelector('#otpReqInfo');
    let phone;
    try { phone = getRecoveryPhone(rec); }
    catch { reqInfo.textContent = '❌ Could not read recovery phone.'; return; }
    btn.disabled = true; btn.textContent = 'Sending…';
    const result = await sendOTP(phone);
    if (!result.success) { reqInfo.textContent = '❌ ' + result.error; btn.disabled = false; btn.textContent = 'Send OTP'; return; }
    overlay.remove();
    showOTPVerifyModal(phone, rec);
  };
}

function showOTPVerifyModal(phone, rec) {
  const overlay = makeOverlay();
  overlay.innerHTML = `
    <div class="sv-modal">
      <div style="font-size:34px;margin-bottom:10px;">✉️</div>
      <h2 class="sv-modal-title">Enter OTP</h2>
      <p class="sv-modal-sub">A 6-digit code was sent to your phone. It expires in 5 minutes.</p>
      <input type="text" id="otpInput" placeholder="• • • • • •" maxlength="6" class="sv-input" style="text-align:center;font-size:26px;letter-spacing:12px;padding:14px 10px;">
      <p id="otpInfo" class="sv-info"></p>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:14px;">
        <button id="otpBack"   class="sv-btn-ghost">Back</button>
        <button id="otpVerify" class="sv-btn-primary">Verify Code</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.querySelector('#otpInput').focus(), 100);
  overlay.querySelector('#otpBack').onclick = () => { overlay.remove(); startForgotFlow(); };
  overlay.querySelector('#otpVerify').onclick = async () => {
    const code = overlay.querySelector('#otpInput').value.trim();
    const otpInfo = overlay.querySelector('#otpInfo');
    if (!/^\d{6}$/.test(code)) { otpInfo.textContent = '⚠️ Enter the 6-digit code.'; return; }
    const result = await verifyOTP(phone, code);
    if (!result.valid) { otpInfo.textContent = '❌ ' + result.reason; return; }
    let vaultKeyHex;
    try {
      const phoneKey = derivePhoneKey(phone, rec.phoneSalt);
      vaultKeyHex = decrypt(rec.encryptedVaultKey, phoneKey);
    } catch { otpInfo.textContent = '❌ Recovery data is corrupt.'; return; }
    overlay.remove();
    showResetPasswordModal(vaultKeyHex);
  };
}

function showResetPasswordModal(vaultKeyHex) {
  const overlay = makeOverlay();
  overlay.innerHTML = `
    <div class="sv-modal">
      <div style="font-size:34px;margin-bottom:10px;">🔓</div>
      <h2 class="sv-modal-title">Set New Master Password</h2>
      <p class="sv-modal-sub">OTP verified! Choose a new master password.</p>
      <input type="password" id="newPass1" placeholder="New Master Password" class="sv-input">
      <input type="password" id="newPass2" placeholder="Confirm Password" class="sv-input" style="margin-top:10px;">
      <p id="resetInfo" class="sv-info"></p>
      <button id="doReset" class="sv-btn-primary" style="margin-top:14px;width:100%;padding:13px;">Reset &amp; Enter Vault</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#doReset').onclick = () => {
    const p1 = overlay.querySelector('#newPass1').value;
    const p2 = overlay.querySelector('#newPass2').value;
    const resetInfo = overlay.querySelector('#resetInfo');
    if (!p1)           { resetInfo.textContent = '⚠️ Please enter a password.'; return; }
    if (p1.length < 6) { resetInfo.textContent = '⚠️ Minimum 6 characters.'; return; }
    if (p1 !== p2)     { resetInfo.textContent = '❌ Passwords do not match.'; return; }
    const newSalt    = randomSalt();
    const newDerived = deriveKey(p1, newSalt);
    saveMaster({ salt: newSalt, verifier: generateHmac(newDerived), iterations: PBKDF2_ITER, digest: DIGEST });
    sessionStorage.setItem('vaultKey', vaultKeyHex);
    overlay.remove();
    showInfo('✅ Password reset successfully!', 'ok');
    fadeOut(() => window.location.href = 'dashboard.html');
  };
}

function showSimpleAlert(icon, title, message) {
  const overlay = makeOverlay();
  overlay.innerHTML = `
    <div class="sv-modal" style="max-width:380px;">
      <div style="font-size:34px;margin-bottom:10px;">${icon}</div>
      <h2 class="sv-modal-title">${title}</h2>
      <p class="sv-modal-sub" style="white-space:pre-line;">${message}</p>
      <button class="sv-btn-primary" style="margin-top:12px;" id="alertOk">OK</button>
    </div>`;
  document.body.appendChild(overlay);
  overlay.querySelector('#alertOk').onclick = () => overlay.remove();
}

// ── Main login handler (called from HTML onclick) ─────────────────────────────
function handleLogin() {
  const enteredPass = passwordInput.value || '';
  if (!enteredPass) { showInfo('⚠️ Please enter a password.', 'warn'); shake(passwordInput); return; }

  if (mode === 'create') {
    if (enteredPass.length < 6) { showInfo('⚠️ Password must be at least 6 characters.', 'warn'); shake(passwordInput); return; }
    const saltHex = randomSalt();
    const derived = deriveKey(enteredPass, saltHex);
    saveMaster({ salt: saltHex, verifier: generateHmac(derived), iterations: PBKDF2_ITER, digest: DIGEST });
    sessionStorage.setItem('vaultKey', derived.toString('hex'));
    showPhoneModal(derived.toString('hex'), () => {
      showInfo('✅ Master password created!', 'ok');
      fadeOut(() => window.location.href = 'dashboard.html');
    });
    return;
  }

  try {
    const saved   = loadMaster();
    const derived = crypto.pbkdf2Sync(enteredPass, Buffer.from(saved.salt, 'hex'), saved.iterations || PBKDF2_ITER, KEY_LEN, saved.digest || DIGEST);
    const hmac    = generateHmac(derived);
    if (hmac === saved.verifier) {
      sessionStorage.setItem('vaultKey', derived.toString('hex'));
      showInfo('✅ Access granted!', 'ok');
      fadeOut(() => window.location.href = 'dashboard.html');
    } else {
      showInfo('❌ Incorrect password. Try again.', 'err');
      shake(passwordInput);
      passwordInput.value = '';
      passwordInput.focus();
    }
  } catch (err) {
    console.error('Login error:', err);
    showInfo('❌ Unexpected error. See console.', 'err');
  }
}

// Expose to HTML onclick
window.handleLogin = handleLogin;
