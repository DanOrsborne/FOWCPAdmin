require('dotenv').config();
const crypto = require('crypto');

// Use a 32-byte key and 16-byte IV for AES-256-CBC
const algorithm = 'aes-256-cbc';
const secretKey = crypto.scryptSync(process.env.CRYPTO_SECRET, 'salt', 32);
const iv = crypto.randomBytes(16);        // Store this with encrypted data

async function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-ecb', secretKey, null); // no IV
    cipher.setAutoPadding(true);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return encrypted;
}

async function decrypt(encrypted) {
    const decipher = crypto.createDecipheriv('aes-256-ecb', secretKey, null);
    decipher.setAutoPadding(true);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
}

module.exports = { encrypt, decrypt };

