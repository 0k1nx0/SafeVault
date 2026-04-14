const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');
const fs   = require('fs');

// Only include code signing if the certificate file actually exists
const certFile = 'C:\\Users\\kings\\OneDrive\\Desktop\\SafeVaultCert.pfx';
const signingConfig = fs.existsSync(certFile)
  ? { certificateFile: certFile, certificatePassword: process.env.CERT_PASSWORD }
  : {};

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'assets/icon',
    appCopyright: 'Copyright © 2026 Tangersoft',
    appVersion: '3.0.0',
    win32metadata: {
      CompanyName:     'Tangersoft',
      FileDescription: 'SafeVault - Secure Password Manager',
      ProductName:     'SafeVault',
      InternalName:    'SafeVault',
    },
  },

  rebuildConfig: {},

  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        name:       'SafeVault',
        title:      'SafeVault',
        setupExe:   'SafeVaultSetup.exe',
        setupIcon:  'assets/icon.ico',

        // Professional loading animation during install
        loadingGif: 'assets/install-loading.gif',

        // Desktop & Start Menu shortcuts created automatically by electron-squirrel-startup
        // shortcutLocations: ['Desktop', 'StartMenu'] — handled by Squirrel itself

        // Installer description shown in Windows Add/Remove Programs
        description: 'Secure password manager with OTP recovery',

        // Authors shown in installer
        authors: 'Tangersoft',

        ...signingConfig,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'SafeVault',
        icon: path.resolve(__dirname, 'assets/icon.icns'),
        overwrite: true,
      },
    },
    {
      name: 'electron-forge-maker-appimage',
      config: {
        options: {
          icon: path.resolve(__dirname, 'assets/icon.png'),
        },
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Tangersoft',
          homepage: 'https://safevault.app',
          description: 'Secure password manager with AES-256 encryption and OTP recovery',
          icon: path.resolve(__dirname, 'assets/icon.png'),
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          maintainer: 'Tangersoft',
          homepage: 'https://safevault.app',
          description: 'Secure password manager with AES-256 encryption and OTP recovery',
          icon: path.resolve(__dirname, 'assets/icon.png'),
        },
      },
    },
  ],

  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]:                          false,
      [FuseV1Options.EnableCookieEncryption]:             true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]:      false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]:                true,
    }),
  ],
};
