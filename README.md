<p align="center">
  <img src="assets/logo.png" alt="SafeVault Logo" width="180">
</p>

<p align="center">
  Secure desktop password manager with encrypted local storage and OTP-based recovery.
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-3.0.0-0aa38f">
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows-1f6feb">
  <img alt="Built with" src="https://img.shields.io/badge/built%20with-Electron-20232a">
</p>

## Overview

SafeVault is a desktop password manager built with Electron for users who want a local-first vault instead of storing sensitive credentials in the cloud. Passwords are encrypted before storage, protected by a master password, and can be recovered using OTP verification through a registered recovery number.

## Download

- Windows installer: `SafeVault-Setup-3.0.0.exe`
- Recommended distribution: upload the installer to the repository's **Releases** section on GitHub so users can download it directly

## Key Features

- Master password protected vault
- AES-256-CBC encrypted local storage
- PBKDF2-based key derivation with HMAC verification
- OTP-based password recovery
- Password strength checker
- Built-in random password generator
- Auto-lock on inactivity
- Restore flow for deleted accounts
- Native Windows installer packaging

## Screens

- Splash screen with branded loading sequence
- Secure login and vault creation flow
- Dashboard for adding, editing, deleting, restoring, and searching accounts
- Settings panel for recovery phone update, app info, and vault reset

## Tech Stack

- Electron
- Node.js
- JavaScript
- Firebase
- Twilio / SMS OTP integration flow

## Team

- [Swastika Guleria](https://github.com/guleriaswastika)
- [Karan Goyal](https://github.com/karangoyal09)
- [0k1nx0](https://github.com/0k1nx0)

## Local Setup

1. Install dependencies:

```powershell
npm install
```

2. Configure SMS OTP:

```powershell
Copy-Item sms-config.example.js sms-config.js
```

Then open `sms-config.js` and add your 2Factor API key.

3. Start the app:

```powershell
npm start
```

## Build

```powershell
npm run build
```

## Notes

- `sms-config.js` is intentionally ignored to keep API credentials out of GitHub
- For the most professional download experience, publish `SafeVault-Setup-3.0.0.exe` as a GitHub Release asset instead of committing the `.exe` into the repository
