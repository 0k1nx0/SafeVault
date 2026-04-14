## 🔐 SafeVault v3.0.0

> Fort Knox level password security — local, encrypted, yours.

SafeVault is a free, open-source desktop password manager that keeps your credentials **100% offline**. No cloud. No servers. No subscriptions. Your vault lives on your device, encrypted with AES-256, protected by a master password only you know.

---

## ✨ What's New in v3.0.0

- 🐧 **Linux support** — `.deb` (Ubuntu/Debian) and `.AppImage` (any distro)
- 🔐 AES-256-CBC encryption with PBKDF2 key derivation (150,000 iterations)
- 📱 OTP-based vault recovery via SMS
- 💪 Real-time password strength checker with improvement tips
- 🎲 Built-in random password generator
- 🔒 Auto-lock after inactivity
- ♻️ Restore accidentally deleted accounts
- ⚙️ Settings panel — recovery phone, about, factory reset
- 🔍 Instant search across all vault entries

---

## 📥 Download

| Platform | File | Notes |
|----------|------|-------|
| 🪟 Windows 10/11 | `SafeVault-Setup-3.0.0.exe` | Run the installer |
| 🐧 Ubuntu/Debian | `SafeVault-Linux.zip` → `.deb` | Install with dpkg |
| 🐧 Any Linux | `SafeVault-Linux.zip` → `.AppImage` | No install needed |

---

## 🪟 Windows Installation

1. Download `SafeVault-Setup-3.0.0.exe`
2. Double-click and follow the setup wizard
3. Launch from Start Menu or Desktop shortcut

---

## 🐧 Linux Installation

**Using .deb (Ubuntu / Debian / Mint):**

```bash
chmod +x SafeVault-Setup-3.0.0.deb
sudo dpkg -i SafeVault-Setup-3.0.0.deb
sudo apt-get install -f
```

**Using .AppImage (any distro):**

```bash
sudo apt install libfuse2 -y
chmod +x SafeVault-Setup-3.0.0.AppImage
./SafeVault-Setup-3.0.0.AppImage --no-sandbox
```

---

## 🔒 Security

| Layer | Implementation |
|-------|---------------|
| Encryption | AES-256-CBC |
| Key Derivation | PBKDF2 — 150,000 iterations |
| Hash | SHA-512 |
| Verification | HMAC-SHA256 |
| Recovery | OTP via SMS |

> Your master password is **never stored**. Only a derived HMAC verifier is saved — making it impossible to reverse-engineer your password from stored data.

---

## 🛠️ Tech Stack

- **Electron** — cross-platform desktop framework
- **Node.js** — runtime
- **Firebase** — authentication support
- **2Factor / Twilio** — SMS OTP delivery

---

## 👥 Team

Built with ❤️ by **Tangersoft**

| Developer | GitHub |
|-----------|--------|
| Abdullah | [@0k1nx0](https://github.com/0k1nx0) |
| Swastika Guleria | [@guleriaswastika](https://github.com/guleriaswastika) |
| Karan Goyal | [@karangoyal09](https://github.com/karangoyal09) |

---

*© 2026 Tangersoft. All rights reserved.*
