# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 3.0.0   | ✅ Active  |
| < 3.0.0 | ❌ No longer supported |

## Reporting a Vulnerability

If you discover a security vulnerability in SafeVault, please **do not** open a public GitHub issue.

Instead, report it privately:

- **Email:** tangersofwefwefft.in@gmail.com
- **Subject:** `[SECURITY] SafeVault Vulnerability Report`

We aim to respond within **48 hours** and will work with you to resolve the issue before any public disclosure.

## Security Model

SafeVault is designed with a zero-knowledge, offline-first architecture:

- AES-256-GCM encryption at rest
- PBKDF2 key derivation with 600,000 iterations
- No network requests — fully air-gapped capable
- Master password is never stored
- Open source — audit the code yourself

See the [Security section in README](../README.md#security) for full details.
