// Zero-Knowledge Encryption Module
// All encryption/decryption happens CLIENT-SIDE ONLY
// Master key NEVER leaves the browser, NEVER stored anywhere

class EncryptionManager {
  constructor() {
    this.masterKey = null; // Kept in memory only
    this.isUnlocked = false;
  }

  // ============================================
  // KEY DERIVATION
  // ============================================

  /**
   * Derive encryption key from master passphrase using PBKDF2
   * @param {string} passphrase - Master passphrase
   * @param {Uint8Array} salt - Salt for key derivation
   * @returns {Promise<CryptoKey>}
   */
  async deriveKey(passphrase, salt) {
    const enc = new TextEncoder();
    const passphraseKey = await crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: ENCRYPTION_CONFIG.iterations,
        hash: 'SHA-256'
      },
      passphraseKey,
      { name: 'AES-GCM', length: ENCRYPTION_CONFIG.keyLength },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random salt
   * @returns {Uint8Array}
   */
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.saltLength));
  }

  /**
   * Generate random IV (Initialization Vector)
   * @returns {Uint8Array}
   */
  generateIV() {
    return crypto.getRandomValues(new Uint8Array(ENCRYPTION_CONFIG.ivLength));
  }

  // ============================================
  // VAULT UNLOCK/LOCK
  // ============================================

  /**
   * Unlock vault with master passphrase
   * @param {string} passphrase - Master passphrase
   * @param {string} userEmail - User's email (used as salt component)
   * @returns {Promise<boolean>}
   */
  async unlockVault(passphrase, userEmail) {
    try {
      // Use user email as part of salt for deterministic key derivation
      const salt = await this.createUserSalt(userEmail);
      
      // Derive master key
      this.masterKey = await this.deriveKey(passphrase, salt);
      this.isUnlocked = true;

      // Store unlock time
      sessionStorage.setItem('vaultUnlockedAt', Date.now().toString());

      console.log('🔓 Vault unlocked');
      return true;
    } catch (error) {
      console.error('Failed to unlock vault:', error);
      return false;
    }
  }

  /**
   * Lock vault and clear master key from memory
   */
  lockVault() {
    // Clear master key
    this.masterKey = null;
    this.isUnlocked = false;

    // Clear session storage
    sessionStorage.removeItem('vaultUnlockedAt');

    console.log('🔒 Vault locked');
  }

  /**
   * Create deterministic salt from user email
   * @param {string} email - User email
   * @returns {Promise<Uint8Array>}
   */
  async createUserSalt(email) {
    const enc = new TextEncoder();
    const emailBuffer = enc.encode(email);
    const hashBuffer = await crypto.subtle.digest('SHA-256', emailBuffer);
    return new Uint8Array(hashBuffer.slice(0, ENCRYPTION_CONFIG.saltLength));
  }

  // ============================================
  // ENCRYPTION/DECRYPTION
  // ============================================

  /**
   * Encrypt data
   * @param {string} plaintext - Data to encrypt
   * @returns {Promise<string>} Base64-encoded encrypted data with IV
   */
  async encrypt(plaintext) {
    if (!this.isUnlocked || !this.masterKey) {
      throw new Error('Vault is locked. Please unlock first.');
    }

    try {
      const enc = new TextEncoder();
      const data = enc.encode(plaintext);
      const iv = this.generateIV();

      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.masterKey,
        data
      );

      // Combine IV + encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv, 0);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      // Return as base64
      return this.arrayBufferToBase64(combined);
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data
   * @param {string} encryptedData - Base64-encoded encrypted data with IV
   * @returns {Promise<string>} Decrypted plaintext
   */
  async decrypt(encryptedData) {
    if (!this.isUnlocked || !this.masterKey) {
      throw new Error('Vault is locked. Please unlock first.');
    }

    try {
      // Decode from base64
      const combined = this.base64ToArrayBuffer(encryptedData);

      // Extract IV and encrypted data
      const iv = combined.slice(0, ENCRYPTION_CONFIG.ivLength);
      const data = combined.slice(ENCRYPTION_CONFIG.ivLength);

      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv
        },
        this.masterKey,
        data
      );

      const dec = new TextDecoder();
      return dec.decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data. Wrong passphrase or corrupted data.');
    }
  }

  // ============================================
  // PASSWORD UTILITIES
  // ============================================

  /**
   * Generate secure random password
   * @param {number} length - Password length
   * @param {object} options - Character set options
   * @returns {string}
   */
  generatePassword(length = 16, options = {}) {
    const {
      uppercase = true,
      lowercase = true,
      numbers = true,
      symbols = true
    } = options;

    let charset = '';
    if (uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (numbers) charset += '0123456789';
    if (symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset.length === 0) {
      charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    }

    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }

  /**
   * Calculate password strength
   * @param {string} password
   * @returns {object} Strength score and feedback
   */
  calculatePasswordStrength(password) {
    let score = 0;
    const feedback = [];

    // Length
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 20;
    if (password.length >= 16) score += 10;

    // Character variety
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^a-zA-Z0-9]/.test(password)) score += 20;

    // Determine strength level
    let strength = 'weak';
    if (score >= 80) strength = 'strong';
    else if (score >= 50) strength = 'medium';

    // Generate feedback
    if (password.length < 12) feedback.push('Use at least 12 characters');
    if (!/[a-z]/.test(password)) feedback.push('Add lowercase letters');
    if (!/[A-Z]/.test(password)) feedback.push('Add uppercase letters');
    if (!/[0-9]/.test(password)) feedback.push('Add numbers');
    if (!/[^a-zA-Z0-9]/.test(password)) feedback.push('Add symbols');

    return {
      score: Math.min(score, 100),
      strength,
      feedback
    };
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Check if vault is currently unlocked
   * @returns {boolean}
   */
  isVaultUnlocked() {
    return this.isUnlocked && this.masterKey !== null;
  }

  /**
   * Verify master passphrase by attempting to decrypt a test value
   * @param {string} passphrase
   * @param {string} userEmail
   * @param {string} testEncryptedData
   * @returns {Promise<boolean>}
   */
  async verifyPassphrase(passphrase, userEmail, testEncryptedData) {
    try {
      const salt = await this.createUserSalt(userEmail);
      const testKey = await this.deriveKey(passphrase, salt);
      
      // Try to decrypt test data
      const combined = this.base64ToArrayBuffer(testEncryptedData);
      const iv = combined.slice(0, ENCRYPTION_CONFIG.ivLength);
      const data = combined.slice(ENCRYPTION_CONFIG.ivLength);

      await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        testKey,
        data
      );

      return true;
    } catch {
      return false;
    }
  }
}

// Global instance
const encryption = new EncryptionManager();
