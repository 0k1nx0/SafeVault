# GitHub Discussions — Copy & Paste Content

---

## POST 1

**Category:** Q&A
**Title:** How to install SafeVault on Linux?

**Body:**
SafeVault supports two Linux formats:

**AppImage (any distro):**
```bash
sudo apt install libfuse2 -y
chmod +x SafeVault-Setup-3.0.0.AppImage
./SafeVault-Setup-3.0.0.AppImage --no-sandbox
```

**.deb (Ubuntu / Debian / Mint):**
```bash
sudo dpkg -i SafeVault-Setup-3.0.0.deb
sudo apt-get install -f
```

Download from: https://github.com/0k1nx0/SafeVault/releases/tag/v3.0.0

---

## POST 2

**Category:** Q&A
**Title:** What happens if I forget my master password?

**Body:**
SafeVault has an OTP recovery system built in.

Before you forget your password, go to **Settings → Recovery Phone** and add your phone number.

If you ever get locked out:
1. Click "Forgot Password" on the login screen
2. SafeVault sends a one-time code to your phone via SMS
3. Enter the code to verify your identity
4. Reset your master password

Your vault data is preserved throughout the recovery process.

---

## POST 3

**Category:** General
**Title:** SafeVault vs Bitwarden — what's the difference?

**Body:**
Both are password managers but with very different approaches:

| | SafeVault | Bitwarden |
|--|-----------|-----------|
| Storage | 100% local | Cloud-based |
| Account required | No | Yes |
| Internet required | No | Yes |
| Price | Free forever | Free + paid tiers |
| Open source | Yes | Yes |
| Platforms | Windows, macOS, Linux | All + mobile + browser |

SafeVault is for people who want **zero cloud** — your vault never leaves your device. Bitwarden syncs across devices via their servers.

---

## POST 4

**Category:** Announcements
**Title:** SafeVault v3.0.0 — Now Available

**Body:**
SafeVault v3.0.0 is out with full cross-platform support.

**What's new:**
- 🍎 macOS support — Universal .dmg for Intel & Apple Silicon
- 🐧 Linux support — .deb and .AppImage
- 🔐 AES-256-GCM encryption with PBKDF2 (600,000 iterations)
- 📱 OTP-based vault recovery via SMS
- 🎲 Password generator, auto-lock, instant search
- 🎨 Redesigned UI — new splash screen and login experience

**Download:** https://github.com/0k1nx0/SafeVault/releases/tag/v3.0.0
**Website:** https://safevault.ct.ws
