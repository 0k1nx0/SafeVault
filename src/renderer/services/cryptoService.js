// src/renderer/services/cryptoService.js
// All cryptographic operations: key derivation, AES-256-CBC encrypt/decrypt

const crypto = require('crypto');

const PBKDF2_ITER = 150000;
const KEY_LEN     = 32;
const DIGEST      = 'sha512';
const SALT_BYTES  = 16;
const ALGO        = 'aes-256-cbc';

function deriveKey(password, saltHex, iters = PBKDF2_ITER, digest = DIGEST) {
  return crypto.pbkdf2Sync(password, Buffer.from(saltHex, 'hex'), iters, KEY_LEN, digest);
}

function derivePhoneKey(phone, saltHex) {
  return crypto.pbkdf2Sync(phone.trim(), Buffer.from(saltHex, 'hex'), 100000, KEY_LEN, 'sha256');
}

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

function generateHmac(keyBuf) {
  return crypto.createHmac('sha256', keyBuf).update('SafeVaultVerifier').digest('hex');
}

function randomSalt() {
  return crypto.randomBytes(SALT_BYTES).toString('hex');
}

function randomPassword(length = 16) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let pwd = '';
  for (let i = 0; i < length; i++) pwd += chars[crypto.randomInt(chars.length)];
  return pwd;
}

module.exports = {
  PBKDF2_ITER, KEY_LEN, DIGEST, SALT_BYTES,
  deriveKey, derivePhoneKey,
  encrypt, decrypt,
  encryptObject, decryptObject,
  generateHmac, randomSalt, randomPassword
};
