import CryptoJS from 'crypto-js';

// IMPORTANT: This key must match the one in the backend exactly.
const SHARED_SECRET = 'ultra-secure-static-key-123';

export function encryptMessage(message) {
  return CryptoJS.AES.encrypt(message, SHARED_SECRET).toString();
}

export function decryptMessage(encrypted) {
  try {
    const bytes = CryptoJS.AES.decrypt(encrypted, SHARED_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '[Unable to decrypt]';
  }
}
