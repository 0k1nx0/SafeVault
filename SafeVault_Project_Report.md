# Project Report on "SafeVault"
### Secure Desktop Password Manager

---

**Submitted By:**

Name: Abdullah, Swastika, Karan

Product: SafeVault v3.0.0

Organization: Tangersoft

---

## Acknowledgement

We take this occasion to thank God Almighty for blessing us with His grace and taking our endeavor to a successful culmination. We extend our sincere and heartfelt thanks to our esteemed guide and faculty for providing us with the right guidance and advice at crucial junctures and for showing us the right way.

We extend our sincere thanks to our respected Head of the Department for allowing us to use the facilities available. We would also like to thank the other faculty members on this occasion.

Last but not the least, we would like to thank our friends and family for the support and encouragement they have given us during the course of our work.

— Abdullah, Swastika, Karan

---

## Declaration

We, the undersigned, solemnly declare that the report of this project work entitled **"SafeVault — Secure Desktop Password Manager"** is based on our own work carried out during the course of our study.

We assert that the statements made and conclusions drawn are the outcome of our project work. We further declare that to the best of our knowledge and belief, the report contains entirely our original work and all ideas and references have been duly acknowledged.

*(Signature of the Candidates)*

Names: Abdullah, Swastika, Karan

---

## Certificate

This is to certify that the work incorporated in the project report **"SafeVault — Secure Desktop Password Manager"** is a record of project work carried out by **Abdullah, Swastika, and Karan** under our guidance and supervision.

To the best of our knowledge and belief, the project:

i. Embodies the work of the candidates themselves
ii. Has been duly completed
iii. Fulfills the requirements of the degree
iv. Is up to the desired standard both in respect of contents and language

_____________________
(Signature of Guide)

______________________
(Signature of Coordinator of Department)

(Seal)

---

## Table of Contents

1. Introduction
2. Objectives of Project
3. Problem Definition
4. Feasibility Study
5. System Analysis
6. System Designing
7. Introduction to Tools Used
8. Key Features with Code
9. Testing
10. Snapshots of Project
11. Bibliography

---

## 1. Introduction

SafeVault is a secure, offline-first desktop password manager built using Electron.js. It allows users to store, manage, and retrieve their passwords in a fully encrypted vault protected by a master password. The application is designed to run entirely on the user's local machine — no passwords are ever sent to any server or cloud service.

The vault is protected using AES-256-CBC encryption, and the master password is never stored in plain text. Instead, it is verified using a PBKDF2-derived key and an HMAC verifier. In the event a user forgets their master password, a secure OTP-based recovery system is available via a registered phone number.

SafeVault is packaged as a native Windows installer (.exe) using Electron Builder and NSIS, making it easy to install and use on any Windows machine.

---

## 2. Objectives of Project

The main aim of this project is to provide a secure, easy-to-use, and fully offline password management solution.

- To allow users to securely store website credentials (site, username, password) in an encrypted local vault.
- To protect all stored data using AES-256-CBC encryption with a user-defined master password.
- To implement a secure master password recovery system using OTP verification via SMS.
- To provide a password strength checker to encourage users to create strong passwords.
- To allow users to generate strong random passwords automatically.
- To implement an auto-lock feature that locks the vault after a period of inactivity.
- To allow users to restore accidentally deleted accounts from a recycle bin.
- To package the application as a native Windows installer for easy distribution.

---

## 3. Problem Definition

In today's digital world, users are required to maintain dozens of accounts across various websites and services. Managing all these passwords manually leads to:

- Reuse of weak passwords across multiple sites.
- Passwords written on paper or stored in plain text files, which are highly insecure.
- Difficulty remembering complex passwords, leading to account lockouts.
- Risk of data theft if passwords are stored in unencrypted formats.

**SafeVault** solves these problems by:

- Storing all passwords in a single encrypted vault protected by one strong master password.
- Using military-grade AES-256-CBC encryption so that even if the vault file is accessed, the data is unreadable without the key.
- Providing a secure OTP-based recovery mechanism so users are never permanently locked out.
- Running entirely offline — no data ever leaves the user's machine.

---

## 4. Feasibility Study

### Technical Feasibility

The project uses Electron.js, which allows building cross-platform desktop applications using web technologies (HTML, CSS, JavaScript). Node.js built-in `crypto` module provides all required cryptographic functions without any external dependencies. The application can run on any modern Windows, macOS, or Linux machine.

### Operational Feasibility

The application is designed with a simple and intuitive UI. Users only need to remember one master password to access all their stored credentials. The installer is a standard Windows .exe file, making deployment straightforward.

### Economic Feasibility

The project uses entirely free and open-source technologies:
- Electron.js (MIT License)
- Node.js built-in crypto module
- Electron Builder for packaging
- 2Factor.in API for SMS OTP delivery

### Drawbacks of the Existing (Manual) System

1. Passwords written on paper can be lost, stolen, or damaged.
2. Plain text files storing passwords offer zero security.
3. Browser-saved passwords are tied to a single browser and can be exported by anyone with physical access.
4. No central, encrypted, offline store exists for all credentials.

---

## 5. System Analysis

### Software Requirement Specification (SRS)

**General Description:**

SafeVault is a desktop application that provides a secure, encrypted local vault for storing user credentials. It uses a master password to derive an encryption key, which is then used to encrypt and decrypt all stored data. The application is built on Electron.js and uses Node.js's built-in `crypto` module for all cryptographic operations.

**Functional Requirements:**

1. **Master Password Setup** — On first launch, the user creates a master password. The password is never stored; instead, a PBKDF2-derived key and HMAC verifier are saved.
2. **Vault Login** — On subsequent launches, the user enters their master password. The system derives the key and verifies it against the stored HMAC.
3. **Add Account** — The user can add a new credential (website, username, password). The entry is encrypted with AES-256-CBC before being saved to disk.
4. **View / Reveal Password** — Passwords are hidden by default. Revealing a password requires re-entering the master password for security.
5. **Edit Account** — Users can update any saved credential after verifying their master password.
6. **Delete / Restore Account** — Deleted accounts go to a recycle bin and can be restored or permanently deleted.
7. **Password Strength Checker** — Real-time feedback on password strength as the user types.
8. **Password Generator** — Generates a cryptographically random 16-character password.
9. **OTP Recovery** — If the user forgets their master password, they can recover access via a 6-digit OTP sent to their registered phone number.
10. **Auto-Lock** — The vault automatically locks after 6 seconds of inactivity, clearing the session key from memory.
11. **Factory Reset** — Users can erase all vault data from the Settings panel.

**Non-Functional Requirements:**

- **Security:** All data is encrypted with AES-256-CBC. The master password is never stored in plain text. The session key is held only in `sessionStorage` and cleared on lock or minimize.
- **Performance:** The application loads quickly with a splash screen sequence. Encryption and decryption operations are near-instantaneous for typical vault sizes.
- **Usability:** The UI is clean, modern, and requires no technical knowledge to operate.
- **Reliability:** All data is stored locally in the user's AppData directory, ensuring no dependency on internet connectivity for core operations.

---

## 6. System Designing

### Architecture Overview

SafeVault follows the Electron two-process architecture:

- **Main Process** (`main.js`, `src/main/`) — Manages the application lifecycle, creates the BrowserWindow, and handles IPC (Inter-Process Communication) events such as OTP sending/verification and file path resolution.
- **Renderer Process** (`src/renderer/`) — Runs the UI (HTML/CSS/JS). Handles all user interactions, encryption/decryption, and vault file I/O.

### Data Flow

```
User Input (Master Password)
        ↓
PBKDF2 Key Derivation (150,000 iterations, SHA-512)
        ↓
AES-256-CBC Encryption
        ↓
Encrypted JSON Block saved to passwords.json
        ↓
(On Load) AES-256-CBC Decryption using session key
        ↓
Plaintext credentials displayed in UI
```

### File Storage Structure

All data is stored in the user's AppData directory:

```
%APPDATA%/SafeVault/data/
  ├── master.json      ← PBKDF2 salt + HMAC verifier (no plain password)
  ├── passwords.json   ← Array of AES-256-CBC encrypted credential blocks
  └── recovery.json    ← Phone-encrypted vault key for OTP recovery
```

### Entity Relationship (Logical)

```
[User]
  └── has one → [MasterPassword] (stored as PBKDF2 salt + HMAC verifier)
  └── has one → [RecoveryPhone]  (stored encrypted with phone-derived key)
  └── has many → [Account]       (each stored as AES-256-CBC encrypted block)
                    ├── website
                    ├── username
                    └── password
```

---

## 7. Introduction to Tools Used

### Electron.js

Electron is an open-source framework developed by GitHub that allows building cross-platform desktop applications using web technologies — HTML, CSS, and JavaScript. It combines the Chromium rendering engine and the Node.js runtime into a single executable. SafeVault uses Electron to create a native desktop window, handle file system access, and manage IPC communication between the main and renderer processes.

Key Electron APIs used:
- `BrowserWindow` — creates and manages the application window.
- `ipcMain` / `ipcRenderer` — enables communication between main and renderer processes.
- `app.getPath('userData')` — resolves the platform-specific user data directory for storing vault files.

### Node.js `crypto` Module

The built-in Node.js `crypto` module provides all cryptographic functionality used in SafeVault. No third-party crypto library is required.

Functions used:
- `crypto.pbkdf2Sync` — derives the vault encryption key from the master password.
- `crypto.createCipheriv` / `crypto.createDecipheriv` — AES-256-CBC encryption and decryption.
- `crypto.createHmac` — generates the master password verifier.
- `crypto.randomBytes` — generates cryptographically secure random IVs and salts.
- `crypto.randomInt` — used in OTP and password generation.
- `crypto.scryptSync` — derives the metadata key for encrypting the recovery phone number.

### HTML / CSS / JavaScript

The UI is built with standard HTML5, CSS3, and vanilla JavaScript. No frontend framework is used, keeping the application lightweight. CSS custom properties and gradients are used for the dark-themed UI.

### Electron Builder

Electron Builder is used to package the application into a distributable Windows installer (.exe) using NSIS. It handles code signing configuration, installer assets (sidebar, header bitmaps), desktop shortcut creation, and uninstaller generation.

### 2Factor.in SMS API

The OTP recovery system uses the 2Factor.in HTTP API to deliver 6-digit OTP codes via SMS to the user's registered phone number. The API is called from the main process using Node.js's built-in `https` module.

### Firebase (Dependency)

Firebase SDK is listed as a project dependency for potential future cloud sync features, though the current version operates fully offline.

---

## 8. Key Features with Code

### 8.1 AES-256-CBC Encryption & Decryption

All credentials are encrypted using AES-256-CBC before being written to disk. A random 16-byte IV is generated for every encryption operation, ensuring that the same plaintext always produces a different ciphertext.

```javascript
// src/renderer/services/cryptoService.js

const ALGO = 'aes-256-cbc';

function encrypt(plaintext, keyBuf) {
  const iv     = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGO, keyBuf, iv);
  let enc = cipher.update(plaintext, 'utf8', 'hex');
  enc += cipher.final('hex');
  return { iv: iv.toString('hex'), data: enc };
}

function decrypt(block, keyBuf) {
  const decipher = crypto.createDecipheriv(ALGO, keyBuf, Buffer.from(block.iv, 'hex'));
  let dec = decipher.update(block.data, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return dec;
}

function encryptObject(obj, keyBuf) {
  return encrypt(JSON.stringify(obj), keyBuf);
}

function decryptObject(block, keyBuf) {
  return JSON.parse(decrypt(block, keyBuf));
}
```

### 8.2 Master Password Key Derivation (PBKDF2)

The master password is never stored. Instead, PBKDF2 with 150,000 iterations and SHA-512 is used to derive a 256-bit key. An HMAC of a known string is stored as the verifier to check if the entered password is correct.

```javascript
// src/renderer/services/cryptoService.js

const PBKDF2_ITER = 150000;
const KEY_LEN     = 32;
const DIGEST      = 'sha512';

function deriveKey(password, saltHex, iters = PBKDF2_ITER, digest = DIGEST) {
  return crypto.pbkdf2Sync(
    password,
    Buffer.from(saltHex, 'hex'),
    iters, KEY_LEN, digest
  );
}

function generateHmac(keyBuf) {
  return crypto.createHmac('sha256', keyBuf)
    .update('SafeVaultVerifier')
    .digest('hex');
}
```

On vault creation, the salt and HMAC verifier are saved:

```javascript
// src/renderer/controllers/loginController.js

const saltHex = randomSalt();
const derived = deriveKey(enteredPass, saltHex);
saveMaster({
  salt: saltHex,
  verifier: generateHmac(derived),
  iterations: PBKDF2_ITER,
  digest: DIGEST
});
sessionStorage.setItem('vaultKey', derived.toString('hex'));
```

### 8.3 OTP-Based Password Recovery

When a user forgets their master password, a 6-digit OTP is sent to their registered phone. The vault key is stored encrypted with a key derived from the phone number, so it can be recovered after OTP verification.

**Saving recovery data:**

```javascript
// src/renderer/services/vaultService.js

function saveRecovery(phone, vaultKeyHex) {
  const phoneSalt   = randomSalt();
  const phoneKey    = derivePhoneKey(phone, phoneSalt);
  const encVaultKey = encrypt(vaultKeyHex, phoneKey);
  const metaSalt    = randomSalt();
  const metaKey     = require('crypto').scryptSync('safevault-meta', metaSalt, 32);
  const encPhone    = encrypt(phone, metaKey);
  fs.writeFileSync(recoveryFile, JSON.stringify(
    { phoneSalt, encryptedVaultKey: encVaultKey,
      encryptedPhone: encPhone, metaSalt }, null, 2
  ), 'utf-8');
}
```

**Sending OTP via 2Factor.in:**

```javascript
// src/main/services/otpService.js

function sendSMS(phone, otp) {
  return new Promise((resolve) => {
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
          if (json.Status === 'Success') resolve({ success: true });
          else resolve({ success: false, error: json.Details || raw });
        } catch { resolve({ success: false, error: raw }); }
      });
    });
    req.on('error', e => resolve({ success: false, error: e.message }));
    req.end();
  });
}
```

**OTP generation with expiry:**

```javascript
// src/main/services/otpService.js

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateOTP() {
  return String(Math.floor(100000 + crypto.randomInt(900000)));
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
  if (!entry) return { valid: false, reason: 'No OTP sent to this number.' };
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(phone);
    return { valid: false, reason: 'OTP has expired.' };
  }
  if (entry.code !== String(code).trim())
    return { valid: false, reason: 'Incorrect code. Try again.' };
  otpStore.delete(phone);
  return { valid: true };
}
```

### 8.4 Password Strength Checker

Real-time password strength analysis is shown as the user types, with a colored progress bar and improvement tips.

```javascript
// src/renderer/controllers/dashboardController.js

function checkStrength(password) {
  const tips = []; let score = 0;
  if (password.length >= 8)          { score++; }
  else { tips.push('Use at least 8 characters'); }
  if (password.length >= 12)         { score++; }
  else if (password.length >= 8) { tips.push('12+ chars is even better'); }
  if (/[A-Z]/.test(password))        { score++; }
  else { tips.push('Add uppercase letters (A-Z)'); }
  if (/[a-z]/.test(password))        { score++; }
  else { tips.push('Add lowercase letters (a-z)'); }
  if (/[0-9]/.test(password))        { score++; }
  else { tips.push('Add numbers (0-9)'); }
  if (/[^A-Za-z0-9]/.test(password)) { score++; }
  else { tips.push('Add symbols (!@#$%^&*)'); }
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
  const colors = ['', '#ff4444', '#ff8c00', '#ffd700', '#7ec8e3', '#00d8b0', '#00f0c9'];
  return {
    score, label: labels[score] || 'Very Weak',
    color: colors[score] || '#ff4444',
    tips, percent: Math.round((score / 6) * 100)
  };
}
```

### 8.5 Cryptographically Secure Password Generator

Generates a random 16-character password using `crypto.randomInt` to ensure uniform distribution across the character set.

```javascript
// src/renderer/services/cryptoService.js

function randomPassword(length = 16) {
  const chars =
    'abcdefghijklmnopqrstuvwxyz' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    '0123456789' +
    '!@#$%^&*()_+-=[]{}|;:,.<>?';
  let pwd = '';
  for (let i = 0; i < length; i++)
    pwd += chars[crypto.randomInt(chars.length)];
  return pwd;
}
```

### 8.6 Auto-Lock on Inactivity

The vault automatically locks after 6 seconds of user inactivity, clearing the session key from memory and redirecting to the login screen.

```javascript
// src/renderer/controllers/dashboardController.js

const INACTIVITY_MS = 6000;
let inactivityTimer = null;

function resetInactivityTimer() {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(() => {
    sessionStorage.removeItem('vaultKey');
    window.location.href = 'index.html';
  }, INACTIVITY_MS);
}

['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click']
  .forEach(evt => document.addEventListener(evt, resetInactivityTimer, { passive: true }));

resetInactivityTimer();
```

The window also locks when minimized, handled in the main process:

```javascript
// src/main/window.js

win.on('minimize', () => {
  win.webContents.executeJavaScript(`
    sessionStorage.removeItem('vaultKey');
    if (!window.location.href.includes('index.html'))
      window.location.href = 'index.html';
  `).catch(() => {});
});
```

### 8.7 Vault File I/O

All vault data is stored in the user's AppData directory. The vault key is derived from the master password and held only in `sessionStorage` during the session.

```javascript
// src/renderer/services/vaultService.js

const userDataPath  = ipcRenderer.sendSync('app:getUserDataPathSync');
const dataDir       = path.join(userDataPath, 'data');
const passwordsFile = path.join(dataDir, 'passwords.json');
const masterFile    = path.join(dataDir, 'master.json');
const recoveryFile  = path.join(dataDir, 'recovery.json');

function loadBlocks() {
  if (!fs.existsSync(passwordsFile)) return [];
  const raw = fs.readFileSync(passwordsFile, 'utf8').trim();
  if (!raw) return [];
  try { return JSON.parse(raw); } catch { return []; }
}

function saveBlocks(blocks) {
  fs.writeFileSync(passwordsFile, JSON.stringify(blocks, null, 2), 'utf8');
}
```

---

## 9. Testing

### Unit Testing

Unit testing was performed on each individual module to verify correct behavior in isolation.

**1. Crypto Module Tests**

- Key derivation: Verified that `deriveKey` with the same password and salt always produces the same key buffer.
- Encryption/Decryption: Verified that `decryptObject(encryptObject(obj, key), key)` returns the original object.
- HMAC verifier: Verified that `generateHmac` produces a consistent output for the same key.
- Random password: Verified that `randomPassword(16)` always returns a 16-character string containing characters from the defined set.

**2. OTP Module Tests**

- OTP generation: Verified that `generateOTP` always returns a 6-digit numeric string.
- OTP expiry: Verified that `verifyOTP` returns `{ valid: false, reason: 'OTP has expired.' }` after the 5-minute window.
- Incorrect code: Verified that `verifyOTP` returns `{ valid: false, reason: 'Incorrect code. Try again.' }` for a wrong code.
- Correct code: Verified that `verifyOTP` returns `{ valid: true }` for the correct code within the expiry window.

**3. Vault Service Tests**

- `masterExists()` returns `false` on a fresh install and `true` after `saveMaster()` is called.
- `loadBlocks()` returns an empty array when `passwords.json` does not exist.
- `saveBlocks` and `loadBlocks` round-trip: saving an array and loading it returns the same data.

**4. Login Controller Tests**

- Creating vault with a password shorter than 6 characters shows a warning and does not create the master file.
- Entering an incorrect master password shows an error and clears the input field.
- Entering the correct master password sets `sessionStorage.vaultKey` and redirects to the dashboard.

### Integration Testing

Integration testing verified that the modules work correctly together as a complete system.

- **Login → Dashboard flow:** After creating a master password and logging in, the dashboard loads and `getKeyBuffer()` returns a valid key.
- **Add → Encrypt → Save → Load → Decrypt flow:** Adding an account encrypts it, saves it to disk, and the rendered account list correctly decrypts and displays it.
- **OTP Recovery flow:** Registering a phone, triggering forgot password, sending OTP, verifying OTP, and resetting the master password — the vault remains accessible with the new password.
- **Auto-lock flow:** After the inactivity timeout, the session key is cleared and the user is redirected to the login screen. The vault cannot be accessed without re-entering the master password.
- **Delete → Restore flow:** Deleting an account moves it to the recycle bin. Restoring it re-encrypts and saves it back to the vault.

### Test Results Summary

| Test Case | Expected Result | Actual Result | Status |
|---|---|---|---|
| Create vault with weak password | Warning shown, vault not created | Warning shown, vault not created | PASS |
| Login with correct password | Redirected to dashboard | Redirected to dashboard | PASS |
| Login with wrong password | Error shown, input cleared | Error shown, input cleared | PASS |
| Add account and verify encryption | Block saved as encrypted JSON | Block saved as encrypted JSON | PASS |
| Reveal password without master verify | Password not shown | Password not shown | PASS |
| OTP sent to registered phone | SMS received within 10 seconds | SMS received | PASS |
| OTP verification with wrong code | Error message shown | Error message shown | PASS |
| OTP verification with expired code | Expiry error shown | Expiry error shown | PASS |
| Auto-lock after inactivity | Redirected to login | Redirected to login | PASS |
| Restore deleted account | Account re-appears in vault | Account re-appears in vault | PASS |
| Factory reset | All vault files deleted | All vault files deleted | PASS |

---

## 10. Snapshots of Project

**Splash Screen**
The application opens with an animated splash screen showing the SafeVault logo, a loading progress bar, and status messages as the secure environment initializes.

**Login / Create Vault Screen**
On first launch, the user is prompted to create a master password. On subsequent launches, the user enters their master password to unlock the vault. A "Forgot master password?" link is available for OTP recovery.

**Recovery Phone Setup**
After creating the vault, the user is prompted to register a recovery phone number with country code (e.g., +923001234567). This step can be skipped and configured later from Settings.

**Dashboard — Add Account**
The main dashboard shows a form to add new credentials (website, username, password). A real-time password strength bar and improvement tips are shown as the user types. A "Generate" button creates a strong random password.

**Dashboard — Saved Accounts**
All saved accounts are listed with the password hidden by default (shown as ••••••••). Each account has Show, Copy, Edit, and Delete buttons.

**Reveal Password (Master Verify Modal)**
Clicking "Show" or "Copy" on any account opens a modal requiring the user to re-enter their master password before the credential is revealed.

**Edit Account Modal**
Clicking "Edit" opens a modal pre-filled with the current credentials. The password strength bar updates in real time as the user edits the password.

**Forgot Password — OTP Flow**
Clicking "Forgot master password?" shows the masked recovery phone number and a "Send OTP" button. After the OTP is verified, the user can set a new master password.

**Settings Panel**
The Settings panel provides options to update the recovery phone number, view the About screen (version, developers, copyright), and perform a factory reset to erase all vault data.

**Restore Deleted Accounts**
The Restore panel shows all deleted accounts with options to restore them to the vault or permanently delete them.

---

## 11. Bibliography

**Technologies and Frameworks:**

- Electron.js Documentation — https://www.electronjs.org/docs
- Node.js `crypto` Module Documentation — https://nodejs.org/api/crypto.html
- Electron Builder Documentation — https://www.electron.build
- NSIS (Nullsoft Scriptable Install System) — https://nsis.sourceforge.io

**Security References:**

- NIST Special Publication 800-132 — Recommendation for Password-Based Key Derivation
- AES (Advanced Encryption Standard) — FIPS PUB 197
- HMAC — RFC 2104

**SMS API:**

- 2Factor.in SMS API Documentation — https://2factor.in/API/

**General References:**

- MDN Web Docs — https://developer.mozilla.org
- Wikipedia — https://www.wikipedia.org
- Stack Overflow — https://stackoverflow.com
