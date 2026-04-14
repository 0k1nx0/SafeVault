## 🔐 SafeVault v3.0.0 — Fort Knox Level Password Security

> Free, open-source, and 100% offline. Your passwords stay on your device — always.

🌐 **Website:** [safevault.ct.ws](https://safevault.ct.ws)

---

## ✨ What's New

- 🍎 **macOS support** — Universal `.dmg` for Intel & Apple Silicon
- 🐧 **Linux support** — `.deb` (Ubuntu/Debian) and `.AppImage` (any distro)
- 🔐 **AES-256-GCM encryption** with PBKDF2 key derivation (600,000 iterations)
- 📱 **OTP-based vault recovery** via SMS — never get locked out
- 💪 **Real-time password strength checker** with improvement tips
- 🎲 **Built-in password generator** — custom length, symbols, and complexity
- 🔒 **Auto-lock** after inactivity
- ♻️ **Restore deleted accounts** — recover accidentally removed entries
- ⚙️ **Settings panel** — recovery phone, about, factory reset
- 🔍 **Instant fuzzy search** across all vault entries
- 🎨 **Redesigned UI** — new splash screen and login experience

---

## 📥 Download

| Platform | File | Size | Arch |
|----------|------|------|------|
| 🪟 Windows 10/11 | `SafeVault-Setup-3.0.0.exe` | ~85 MB | x64 |
| 🍎 macOS 11+ | `SafeVault-Setup-3.0.0.dmg` | ~92 MB | Universal |
| 🐧 Linux (.deb) | `SafeVault-Setup-3.0.0.deb` | ~90 MB | x64 |
| 🐧 Linux (.AppImage) | `SafeVault-Setup-3.0.0.AppImage` | ~78 MB | x64 |

> All versions are **free and open source**. No account required. No telemetry.

---

## 🛠️ Installation

### 🪟 Windows
1. Download `SafeVault-Setup-3.0.0.exe`
2. Double-click and follow the setup wizard
3. Launch from **Start Menu** or **Desktop** shortcut

### 🍎 macOS
1. Download `SafeVault-Setup-3.0.0.dmg`
2. Open the `.dmg` and drag **SafeVault** to **Applications**
3. Launch from Applications or Spotlight

> First launch: **System Settings → Privacy & Security → Open Anyway**

### 🐧 Linux — `.deb` (Ubuntu / Debian / Mint)

```bash
chmod +x SafeVault-Setup-3.0.0.deb
sudo dpkg -i SafeVault-Setup-3.0.0.deb
sudo apt-get install -f
```

### 🐧 Linux — `.AppImage` (any distro)

```bash
sudo apt install libfuse2 -y
chmod +x SafeVault-Setup-3.0.0.AppImage
./SafeVault-Setup-3.0.0.AppImage --no-sandbox
```

---

## 🔒 Security

| Layer | Implementation |
|-------|----------------|
| Encryption | AES-256-GCM |
| Key Derivation | PBKDF2 — 600,000 iterations |
| Hash | SHA-512 |
| Verification | HMAC-SHA256 |
| Network | Zero requests — fully air-gapped capable |
| Recovery | OTP via SMS |

> Your master password is **never stored**. Only a derived HMAC verifier is saved — impossible to reverse-engineer from stored data.

---

## 👥 Team

Built with ❤️ by **[Tangersoft](https://safevault.ct.ws)**

| Developer | GitHub |
|-----------|--------|
| Abdullah | [@0k1nx0](https://github.com/0k1nx0) |
| Swastika Guleria | [@guleriaswastika](https://github.com/guleriaswastika) |
| Karan Goyal | [@karangoyal09](https://github.com/karangoyal09) |

---

*© 2026 Tangersoft · [safevault.ct.ws](https://safevault.ct.ws) · [GitHub](https://github.com/0k1nx0/SafeVault)*
