<p align="center">
  <img src="assets/logoDark.png" alt="SafeVault Logo" width="180">
</p>

<p align="center">
  Secure desktop password manager with encrypted local storage and OTP-based recovery.
</p>

<p align="center">
  <img alt="Version" src="https://img.shields.io/badge/version-3.0.0-0aa38f">
  <img alt="Platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20Linux-1f6feb">
  <img alt="Built with" src="https://img.shields.io/badge/built%20with-Electron-20232a">
</p>

## Overview

SafeVault is a desktop password manager built with Electron for users who want a local-first vault instead of storing sensitive credentials in the cloud. Passwords are encrypted before storage, protected by a master password, and can be recovered using OTP verification through a registered recovery number.

## Download

| Platform | File | Notes |
|----------|------|-------|
| Windows  | `SafeVault-Setup-3.0.0.exe` | Run the installer |
| Linux (Debian/Ubuntu) | `SafeVault-Setup-3.0.0.deb` | Install with dpkg |
| Linux (Any distro) | `SafeVault-Setup-3.0.0.AppImage` | No install needed |

Download the latest builds from the repository's **Releases** section or **Actions → Artifacts**.

---

## Installation

### Windows

1. Download `SafeVault-Setup-3.0.0.exe`
2. Double-click to run the installer
3. Follow the setup wizard
4. SafeVault will appear in your Start Menu and Desktop

### Linux — .deb (Ubuntu / Debian / Mint)

```bash
# Fix permissions first
chmod +x SafeVault-Setup-3.0.0.deb

# Install
sudo dpkg -i SafeVault-Setup-3.0.0.deb

# Fix any missing dependencies
sudo apt-get install -f
```

SafeVault will appear in your Applications menu. Search "SafeVault" in the app drawer to launch it.

**To uninstall:**
```bash
sudo dpkg -r safevault
# or
sudo apt remove safevault -y
```

### Linux — .AppImage (Any distro)

```bash
# Make executable
chmod +x SafeVault-Setup-3.0.0.AppImage

# Run (requires FUSE)
./SafeVault-Setup-3.0.0.AppImage --no-sandbox

# Install FUSE if needed
sudo apt install libfuse2 -y
```

---

## Key Features

- Master password protected vault
- AES-256-CBC encrypted local storage
- PBKDF2-based key derivation with HMAC verification
- OTP-based password recovery
- Password strength checker
- Built-in random password generator
- Auto-lock on inactivity
- Restore flow for deleted accounts
- Native installer for Windows and Linux

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

```bash
npm install
```

2. Configure SMS OTP:

```bash
cp sms-config.example.js sms-config.js
```

Then open `sms-config.js` and add your 2Factor API key.

3. Start the app:

```bash
npm start
```

## Build

**Windows:**
```powershell
npm run build
```

**Linux (via GitHub Actions):**

Push to `main` branch — the workflow at `.github/workflows/build-linux.yml` automatically builds `.AppImage` and `.deb` files. Download from the Actions → Artifacts section.

## Notes

- `sms-config.js` is intentionally ignored to keep API credentials out of GitHub
- For the most professional download experience, publish installer files through GitHub Releases instead of committing binaries into the repository
