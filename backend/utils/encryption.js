const CryptoJS = require('crypto-js');

// Shared symmetric key — must match frontend
const SHARED_SECRET = 'ultra-secure-static-key-123';

exports.encryptMessage = (text) => {
  return CryptoJS.AES.encrypt(text, SHARED_SECRET).toString();
};

exports.decryptMessage = (cipher) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipher, SHARED_SECRET);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return '[Unable to decrypt]';
  }
};
