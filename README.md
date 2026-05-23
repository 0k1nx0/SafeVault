<div align="center">

<img src="assets/icon.ico" alt="SafeVault Logo" width="110" style="border-radius:20px">

# SafeVault

**Fort Knox level password security — local, encrypted, yours.**

[![Version](https://img.shields.io/badge/version-3.0.0-00f0c9?style=flat-square)](https://github.com/0k1nx0/SafeVault/releases/tag/v3.0.0)
[![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-1f6feb?style=flat-square)](#download)
[![License](https://img.shields.io/badge/license-ISC-brightgreen?style=flat-square)](assets/license.txt)
[![Built with Electron](https://img.shields.io/badge/built%20with-Electron-20232a?style=flat-square&logo=electron&logoColor=white)](https://electronjs.org)
[![AES-256](https://img.shields.io/badge/encryption-AES--256--GCM-red?style=flat-square)](#security)
[![Website](https://img.shields.io/badge/website-safevault.ct.ws-00f0c9?style=flat-square)](https://safevault.ct.ws)

> SafeVault is a **free, open-source** desktop password manager that keeps your credentials **100% offline** — no cloud, no servers, no subscriptions. Your vault lives on your device, encrypted with AES-256-GCM, protected by a master password only you control.

[🌐 Website](https://amtoz.in) · [📥 Download](#download) · [🔒 Security](#security) · [👥 Team](#team)

</div>

---

## Table of Contents

- [About](#about)
- [Features](#features)
- [Download](#download)
- [Installation](#installation)
- [Security](#security)
- [Tech Stack](#tech-stack)
- [Local Development](#local-development)
- [Building](#building)
- [Team](#team)
- [License](#license)

---

## About

SafeVault was built by a team of developers who believe your passwords should never leave your device. Unlike cloud-based password managers, SafeVault stores everything locally in an AES-256 encrypted vault. There are no accounts to create, no servers to trust, and no subscription fees — ever.

Built on Electron, SafeVault delivers a native desktop experience on Windows, macOS, and Linux. It features a clean modern dark UI, a built-in password generator, OTP-based emergency recovery, and an auto-lock system that protects your vault when you step away.

**Why SafeVault?**

- **Zero cloud** — your data never leaves your machine
- **Zero cost** — free forever, no premium tier
- **Zero trust required** — open source, audit it yourself
- **Zero friction** — install and start in under a minute

---

## Features

| Feature | Description |
|---------|-------------|
| 🔐 AES-256-GCM Encryption | Military-grade encryption protects every password. Unreadable without your master key. |
| 🔑 Master Password | Single master password protects your entire vault |
| 📱 OTP Recovery | Forgot your master password? Recover via SMS OTP — never get locked out |
| 🔒 Auto-Lock | Vault locks automatically after 60 seconds of inactivity |
| 💪 Password Strength | Real-time strength checker with improvement tips |
| 🎲 Password Generator | Generate strong, unique passwords with custom length, symbols, and complexity |
| 🔍 Instant Search | Fuzzy search — find any credential in milliseconds |
| ♻️ Restore Deleted | Recover accidentally deleted accounts |
| 🖥️ Cross Platform | Windows, macOS, and Linux native apps |
| 📦 Offline First | No internet connection required — ever |

---

## Download

### Latest Release — v3.0.0

| Platform | File | Size | Arch |
|----------|------|------|------|
| 🪟 Windows 10/11 | `SafeVault-Setup-3.0.0.exe` | ~85 MB | x64 |
| 🍎 macOS 11+ | `SafeVault-Setup-3.0.0.dmg` | ~92 MB | Universal |
| 🐧 Linux (.deb) | `SafeVault-Setup-3.0.0.deb` | ~90 MB | x64 |
| 🐧 Linux (.AppImage) | `SafeVault-Setup-3.0.0.AppImage` | ~78 MB | x64 |

**[→ Download from Releases](https://github.com/0k1nx0/SafeVault/releases/tag/v3.0.0)**  
**[→ Download from Website](https://amtoz.in)**

> All versions are free and open source. No account required. No telemetry.

---

## Installation

### 🪟 Windows

1. Download `SafeVault-Setup-3.0.0.exe`
2. Double-click to run the installer
3. Follow the setup wizard
4. SafeVault appears in your **Start Menu** and **Desktop**

### 🍎 macOS

1. Download `SafeVault-Setup-3.0.0.dmg`
2. Open the `.dmg` file
3. Drag **SafeVault** to your **Applications** folder
4. Launch from Applications or Spotlight

> First launch: if macOS blocks the app, go to **System Settings → Privacy & Security** and click **Open Anyway**.

### 🐧 Linux — .deb (Ubuntu / Debian / Mint)

```bash
chmod +x SafeVault-Setup-3.0.0.deb
sudo dpkg -i SafeVault-Setup-3.0.0.deb
sudo apt-get install -f
```

Search "SafeVault" in your app drawer to launch.

**Uninstall:**
```bash
sudo apt remove safevault -y
```

### 🐧 Linux — .AppImage (Any distro)

```bash
sudo apt install libfuse2 -y
chmod +x SafeVault-Setup-3.0.0.AppImage
./SafeVault-Setup-3.0.0.AppImage --no-sandbox
```

---

## Security

SafeVault is designed with a zero-knowledge, offline-first security model.

| Layer | Implementation |
|-------|---------------|
| Encryption | AES-256-GCM |
| Key Derivation | PBKDF2 with 600,000 iterations |
| Hash | SHA-512 |
| Verification | HMAC-SHA256 |
| Storage | Local encrypted file — never transmitted |
| Recovery | OTP via SMS (2Factor API) |
| Session | In-memory only, cleared on lock/exit |
| Network | Zero network requests — fully air-gapped capable |

**Your master password is never stored.** Only a derived HMAC verifier is saved, making it impossible to reverse-engineer your password from stored data.

> Open source — [audit the code yourself](https://github.com/0k1nx0/SafeVault).

---

## Tech Stack

- **[Electron](https://electronjs.org)** — cross-platform desktop framework
- **[Node.js](https://nodejs.org)** — runtime
- **[Firebase](https://firebase.google.com)** — authentication support
- **[2Factor](https://2factor.in)** — SMS OTP delivery
- **[Electron Forge](https://www.electronforge.io)** — packaging and distribution

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

### 🪟 Windows

```powershell
npm run make
```

Output: `out/make/squirrel.windows/x64/SafeVault-Setup-3.0.0.exe`

### 🍎 macOS (must run on a Mac)

```bash
# Generate .icns icon first
mkdir icon.iconset
sips -z 512 512 assets/icon.png --out icon.iconset/icon_512x512.png
iconutil -c icns icon.iconset -o assets/icon.icns
rm -rf icon.iconset

# Install dmg maker
npm install --save-dev @electron-forge/maker-dmg

# Build
npm run make -- --platform darwin
```

Output: `out/make/SafeVault-Setup-3.0.0.dmg`

### 🐧 Linux (via GitHub Actions)

Linux builds run automatically on every push to `main`.

To trigger manually:
1. Go to [Actions](https://github.com/0k1nx0/SafeVault/actions)
2. Click **Build Linux** → **Run workflow**
3. Download artifacts when complete

Or build locally on Linux:
```bash
npm run make -- --platform linux
```

---

## Project Structure

```
SafeVault/
├── assets/               # Icons, images, installer assets
├── docs/                 # Release notes and project docs
├── scripts/              # Build helper scripts
├── src/
│   ├── main/             # Electron main process
│   │   ├── controllers/  # IPC handlers (app, OTP)
│   │   ├── routes/       # IPC route definitions
│   │   ├── services/     # OTP service
│   │   └── window.js     # Window creation & management
│   └── renderer/         # Frontend (UI)
│       ├── controllers/  # Dashboard & login logic
│       ├── services/     # Crypto, OTP, vault services
│       └── views/        # HTML pages & scripts
├── main.js               # App entry point
├── preload.js            # Context bridge
├── forge.config.js       # Electron Forge build config
└── package.json
```

---

## Team

SafeVault is built and maintained by **[Tangersoft](https://amtoz.in)**.

| Developer | Role | GitHub |
|-----------|------|--------|
| Abdullah | Lead Developer | [@0k1nx0](https://github.com/0k1nx0) |
| Swastika Guleria | Developer | [@guleriaswastika](https://github.com/guleriaswastika) |
| Karan Goyal | Developer | [@karangoyal09](https://github.com/karangoyal09) |

---

## License

ISC License — see [license.txt](assets/license.txt) for details.

Copyright © 2026 Tangersoft. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://amtoz.in">Tangersoft</a> · <a href="https://github.com/0k1nx0/SafeVault">GitHub</a> · <a href="https://amtoz.in">safevault.ct.ws</a></sub>
</div>
