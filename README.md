<div align="center">

<img src="assets/LogoDark.png" alt="SafeVault" width="100" style="border-radius:20px">

# SafeVault

**Fort Knox level password security — local, encrypted, yours.**

[![Version](https://img.shields.io/badge/version-3.0.0-00f0c9?style=flat-square)](https://github.com/0k1nx0/SafeVault/releases)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux-1f6feb?style=flat-square)](#download)
[![License](https://img.shields.io/badge/license-ISC-green?style=flat-square)](assets/license.txt)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron-20232a?style=flat-square&logo=electron)](https://electronjs.org)
[![AES-256](https://img.shields.io/badge/encryption-AES--256--CBC-red?style=flat-square)](#security)

> SafeVault is a free, open-source desktop password manager that keeps your credentials **100% offline** — no cloud, no servers, no subscriptions. Your vault lives on your device, encrypted with AES-256, protected by a master password you control.

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Download](#download)
- [Installation](#installation)
- [Security](#security)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Building](#building)
- [Team](#team)
- [License](#license)

---

## About

SafeVault was built by a team of developers who believe your passwords should never leave your device. Unlike cloud-based password managers, SafeVault stores everything locally in an AES-256 encrypted vault. There are no accounts to create, no servers to trust, and no subscription fees — ever.

The app is built on Electron, making it a native desktop experience on Windows and Linux. It features a clean, modern dark UI, a built-in password generator, OTP-based emergency recovery, and an auto-lock system that protects your vault when you step away.

**Why SafeVault?**

- **Zero cloud** — your data never leaves your machine
- **Zero cost** — free forever, no premium tier
- **Zero trust required** — open source, audit it yourself
- **Zero friction** — install and start in under a minute

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 AES-256-CBC Encryption | Every password is encrypted before being written to disk |
| 🔑 Master Password | Single master password protects your entire vault |
| 📱 OTP Recovery | Forgot your master password? Recover via SMS OTP |
| 🔒 Auto-Lock | Vault locks automatically after 60 seconds of inactivity |
| 💪 Password Strength | Real-time strength checker with improvement tips |
| 🎲 Password Generator | Generate strong random passwords instantly |
| 🔍 Instant Search | Find any credential in milliseconds |
| ♻️ Restore Deleted | Recover accidentally deleted accounts |
| 🖥️ Cross Platform | Windows and Linux native apps |
| 📦 Offline First | No internet connection required |

---

## Download

### Latest Release — v3.0.0

| Platform | Download | Size |
|----------|----------|------|
| 🪟 Windows 10/11 (x64) | `SafeVault-Setup-3.0.0.exe` | ~85 MB |
| 🐧 Linux — Debian/Ubuntu (.deb) | `SafeVault-Setup-3.0.0.deb` | ~90 MB |
| 🐧 Linux — Universal (.AppImage) | `SafeVault-Setup-3.0.0.AppImage` | ~90 MB |

> Download from the [**Releases**](https://github.com/0k1nx0/SafeVault/releases) page or from [**Actions → Artifacts**](https://github.com/0k1nx0/SafeVault/actions) for the latest build.

---

## Installation

### 🪟 Windows

1. Download `SafeVault-Setup-3.0.0.exe`
2. Double-click to run the installer
3. Follow the setup wizard (Next → Install)
4. SafeVault appears in your **Start Menu** and **Desktop**
5. Launch and create your vault

### 🐧 Linux — .deb (Ubuntu / Debian / Mint)

```bash
# Fix permissions
chmod +x SafeVault-Setup-3.0.0.deb

# Install
sudo dpkg -i SafeVault-Setup-3.0.0.deb

# Fix missing dependencies if needed
sudo apt-get install -f
```

SafeVault will appear in your **Applications menu**. Search "SafeVault" in the app drawer to launch.

**Uninstall:**
```bash
sudo dpkg -r safevault
# or
sudo apt remove safevault -y
```

### 🐧 Linux — .AppImage (Any distro)

```bash
# Install FUSE (required for AppImage)
sudo apt install libfuse2 -y

# Make executable
chmod +x SafeVault-Setup-3.0.0.AppImage

# Run
./SafeVault-Setup-3.0.0.AppImage --no-sandbox
```

---

## Security

SafeVault is designed with a zero-knowledge, offline-first security model.

| Layer | Implementation |
|-------|---------------|
| Encryption | AES-256-CBC |
| Key Derivation | PBKDF2 with 150,000 iterations |
| Hash | SHA-512 |
| Verification | HMAC-SHA256 |
| Storage | Local encrypted file (never transmitted) |
| Recovery | OTP via SMS (2Factor API) |
| Session | In-memory only, cleared on lock/exit |

**Your master password is never stored.** Only a derived HMAC verifier is saved, making it impossible to reverse-engineer your password from the stored data.

---

## Tech Stack

- **[Electron](https://electronjs.org)** — cross-platform desktop framework
- **[Node.js](https://nodejs.org)** — runtime
- **[Firebase](https://firebase.google.com)** — authentication support
- **[Twilio / 2Factor](https://2factor.in)** — SMS OTP delivery
- **[electron-builder](https://electron.build)** — packaging and distribution

---

## Local Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/0k1nx0/SafeVault.git
cd SafeVault

# Install dependencies
npm install

# Configure SMS OTP
cp sms-config.example.js sms-config.js
# Edit sms-config.js and add your 2Factor API key

# Start the app
npm start
```

---

## Building

### Windows

```powershell
npm run build
```

Output: `dist-installer/SafeVault-Setup-3.0.0.exe`

### Linux

Linux builds run via **GitHub Actions** automatically on every push to `main`.

To trigger manually:
1. Go to [Actions](https://github.com/0k1nx0/SafeVault/actions)
2. Click **Build Linux**
3. Click **Run workflow**
4. Download artifacts when complete

Workflow file: `.github/workflows/build-linux.yml`

---

## Release Notes

### v3.0.0 — April 2026

**New in this release:**
- ✅ Linux support — `.deb` and `.AppImage` builds
- ✅ Redesigned splash screen and login UI
- ✅ Improved password strength checker with tips
- ✅ Auto-lock after inactivity
- ✅ Restore deleted accounts feature
- ✅ Settings panel — recovery phone, about, factory reset
- ✅ OTP-based vault recovery via SMS
- ✅ Built-in random password generator
- ✅ Instant search across all vault entries
- ✅ AES-256 encryption with PBKDF2 key derivation

---

## Team

SafeVault is built and maintained by **Tangersoft**.

| Developer | GitHub |
|-----------|--------|
| Abdullah | [@0k1nx0](https://github.com/0k1nx0) |
| Swastika Guleria | [@guleriaswastika](https://github.com/guleriaswastika) |
| Karan Goyal | [@karangoyal09](https://github.com/karangoyal09) |

---

## License

ISC License — see [license.txt](assets/license.txt) for details.

Copyright © 2026 Tangersoft. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ by Tangersoft · <a href="https://github.com/0k1nx0/SafeVault">GitHub</a></sub>
</div>
