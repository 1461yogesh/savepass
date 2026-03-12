# SavePass Security Documentation

This document provides a comprehensive overview of SavePass's security architecture, implementation details, and best practices.

## 🎯 Security Philosophy

SavePass is built on the principle of **Zero-Knowledge Architecture**. This means:

1. **We cannot read your passwords** - Your master passphrase never leaves your device
2. **We cannot decrypt your data** - Encryption keys exist only in your browser's memory
3. **We cannot recover your passphrase** - There is no "forgot password" for your master passphrase
4. **Your data is yours alone** - End-to-end encryption ensures complete privacy

## 🔐 Encryption Implementation

### Master Passphrase & Key Derivation

```
User Master Passphrase
         ↓
    [PBKDF2]
    - 100,000 iterations
    - SHA-256 hash
    - Salt: User email (deterministic)
         ↓
    AES-256 Key
    (stored in memory only)
```

**Key Derivation Function (PBKDF2):**
- **Iterations:** 100,000 (protects against brute-force attacks)
- **Hash Algorithm:** SHA-256
- **Salt:** Derived from user email using SHA-256, first 16 bytes
- **Output:** 256-bit encryption key

**Why PBKDF2?**
- Industry standard (NIST recommended)
- Resistant to GPU/ASIC attacks
- Configurable iteration count for future-proofing
- Wide browser support via Web Crypto API

### Encryption Process

```javascript
// Simplified encryption flow
const encrypt = async (plaintext) => {
  // 1. Generate random IV (Initialization Vector)
  const iv = crypto.getRandomValues(new Uint8Array(12));
  
  // 2. Encrypt with AES-GCM
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    masterKey,
    plaintext
  );
  
  // 3. Combine IV + encrypted data
  // IV is needed for decryption, safe to store unencrypted
  return base64(iv + encrypted);
};
```

**Encryption Algorithm: AES-256-GCM**
- **Mode:** GCM (Galois/Counter Mode)
- **Key Size:** 256 bits
- **IV Size:** 96 bits (12 bytes)
- **Authentication:** Built-in authentication tag

**Why AES-GCM?**
- **Authenticated encryption:** Prevents tampering
- **Parallel processing:** Fast encryption/decryption
- **NIST approved:** Standard for government use
- **Native browser support:** Web Crypto API

### Decryption Process

```javascript
const decrypt = async (encryptedData) => {
  // 1. Extract IV and encrypted data
  const data = base64Decode(encryptedData);
  const iv = data.slice(0, 12);
  const encrypted = data.slice(12);
  
  // 2. Decrypt with AES-GCM
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    masterKey,
    encrypted
  );
  
  // 3. Return plaintext
  return decrypted;
};
```

**Decryption Verification:**
- AES-GCM automatically verifies authentication tag
- Wrong key or tampered data throws error
- No partial decryption possible

## 🛡️ Security Features

### 1. Zero-Knowledge Architecture

**What is Zero-Knowledge?**
Zero-knowledge means the service provider has zero knowledge of the actual data being stored.

**Implementation:**
- Master passphrase never transmitted to server
- Encryption key derived locally in browser
- Only encrypted ciphertext stored in database
- Server cannot decrypt data even with database access

**Proof:**
```
Database content: "xJ8kLmN2..." (encrypted)
Server knows: ❌ Cannot decrypt
You know: ✅ Have master passphrase
```

### 2. Row Level Security (RLS)

Supabase RLS policies ensure data isolation:

```sql
-- Users can only see their own credentials
CREATE POLICY "Users can view their own credentials"
  ON credentials FOR SELECT
  USING (auth.uid() = user_id);
```

**Protection:**
- Prevents unauthorized access between users
- Enforced at database level
- Cannot be bypassed by API manipulation

### 3. Auto-Lock Mechanism

**Inactivity Detection:**
```javascript
// Monitors user activity
const activities = ['mousedown', 'keydown', 'scroll', 'touchstart'];

// Locks vault after 15 minutes of inactivity
setTimeout(() => lockVault(), 15 * 60 * 1000);
```

**Lock Behavior:**
- Clears encryption key from memory
- Prevents access to credentials
- Requires passphrase to unlock
- Session storage cleared

### 4. Clipboard Security

**Auto-Clear Implementation:**
```javascript
// Copy password
await navigator.clipboard.writeText(password);

// Clear after 30 seconds
setTimeout(() => {
  navigator.clipboard.writeText('');
}, 30000);
```

**Protection:**
- Reduces risk of clipboard hijacking
- Prevents accidental pastes
- Configurable timeout

### 5. Password Generator

**Implementation:**
```javascript
const generatePassword = (length) => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  
  return Array.from(array)
    .map(x => charset[x % charset.length])
    .join('');
};
```

**Features:**
- Cryptographically secure random (Web Crypto API)
- Customizable character sets
- Configurable length
- Meets complexity requirements

### 6. Password Strength Checker

**Criteria:**
- Length (8+, 12+, 16+ characters)
- Uppercase letters
- Lowercase letters
- Numbers
- Special characters

**Scoring:**
```javascript
let score = 0;
if (length >= 8)  score += 20;
if (length >= 12) score += 20;
if (length >= 16) score += 10;
if (/[a-z]/.test(pwd)) score += 10;
if (/[A-Z]/.test(pwd)) score += 10;
if (/[0-9]/.test(pwd)) score += 10;
if (/[^a-zA-Z0-9]/.test(pwd)) score += 20;

// Weak: 0-49, Medium: 50-79, Strong: 80+
```

## 🔒 Authentication Security

### Google OAuth

**Why Google OAuth?**
- No password storage required
- Multi-factor authentication (if user enabled)
- Reduced attack surface
- Professional implementation

**Security Benefits:**
- Google handles credential storage
- HTTPS required
- OAuth 2.0 standard
- Refresh tokens managed by Supabase

**Flow:**
```
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. User authorizes app
4. Google redirects back with auth code
5. Supabase exchanges code for session
6. Session stored securely
```

### Session Management

**Implementation:**
- JWT tokens for authentication
- HttpOnly cookies (not accessible via JavaScript)
- Secure flag (HTTPS only)
- Short-lived access tokens
- Refresh token rotation

**Security Measures:**
- Tokens validated on every request
- Expired tokens rejected
- Logout clears all tokens
- Cross-site protection enabled

## 🚨 Threat Model & Mitigations

### 1. Brute Force Attacks

**Threat:** Attacker tries many passphrases

**Mitigation:**
- High PBKDF2 iteration count (100,000)
- Account lockout (Supabase feature)
- Rate limiting on auth endpoints
- Strong passphrase requirements

**Time to crack 12-character passphrase:**
- With GPU: ~centuries
- With ASIC: ~decades
- With quantum computer: ~years (theoretical)

### 2. Man-in-the-Middle (MITM)

**Threat:** Attacker intercepts communication

**Mitigation:**
- HTTPS required everywhere
- HSTS headers
- Certificate pinning (future enhancement)
- Secure cookie flags

### 3. XSS (Cross-Site Scripting)

**Threat:** Malicious script injection

**Mitigation:**
- Content Security Policy (CSP) headers
- Input sanitization
- HTML escaping
- No `eval()` or `innerHTML` with user data

### 4. CSRF (Cross-Site Request Forgery)

**Threat:** Unauthorized actions

**Mitigation:**
- Supabase CSRF protection
- SameSite cookie attribute
- Origin checking
- Token-based authentication

### 5. SQL Injection

**Threat:** Malicious database queries

**Mitigation:**
- Supabase uses parameterized queries
- Row Level Security
- Input validation
- Principle of least privilege

### 6. Database Breach

**Threat:** Attacker gains database access

**Impact:**
- ✅ Passwords remain encrypted
- ✅ Cannot decrypt without master passphrase
- ✅ Each user's key is unique
- ❌ Encrypted data is exposed (but useless without keys)

**Mitigation:**
- Zero-knowledge architecture
- Strong encryption
- Regular security audits
- Incident response plan

### 7. Malicious Browser Extensions

**Threat:** Extension steals data

**Mitigation:**
- Limited scope (only in-memory storage)
- No persistent key storage
- Auto-lock on inactivity
- User awareness education

### 8. Keyloggers

**Threat:** Master passphrase captured

**Mitigation:**
- Virtual keyboard (future enhancement)
- Hardware security keys (future enhancement)
- User device security responsibility
- Anti-keylogger software recommendation

## 🔍 Security Best Practices

### For Users

1. **Master Passphrase**
   - Use 16+ characters
   - Include uppercase, lowercase, numbers, symbols
   - Use a passphrase (multiple words) for memorability
   - Example: `Correct-Horse-Battery-Staple-2024!`
   - Never share it
   - Write it down and store physically secure

2. **Device Security**
   - Use updated OS and browser
   - Install anti-malware software
   - Lock computer when away
   - Use full disk encryption
   - Enable firewall

3. **Network Security**
   - Use trusted networks
   - Avoid public Wi-Fi without VPN
   - Enable HTTPS everywhere extension
   - Verify SSL certificate

4. **Operational Security**
   - Don't use SavePass on shared computers
   - Clear browser cache on public devices
   - Lock vault when not in use
   - Regular password changes
   - Enable 2FA on Google account

### For Developers

1. **Code Security**
   - Never log sensitive data
   - Use secure random generators
   - Validate all inputs
   - Sanitize all outputs
   - Regular dependency updates

2. **Deployment Security**
   - Always use HTTPS
   - Set security headers
   - Configure CSP
   - Enable HSTS
   - Monitor for vulnerabilities

3. **Database Security**
   - Enable RLS
   - Regular backups
   - Audit logs
   - Principle of least privilege
   - Monitor suspicious activity

4. **API Security**
   - Rate limiting
   - Input validation
   - Output encoding
   - Error handling (no sensitive info in errors)
   - CORS configuration

## 📊 Security Audit Checklist

### Code Review
- [ ] No hardcoded secrets
- [ ] No console.log with sensitive data
- [ ] Proper error handling
- [ ] Input validation everywhere
- [ ] Output encoding everywhere

### Encryption
- [ ] Strong algorithms (AES-256)
- [ ] Proper key derivation (PBKDF2)
- [ ] Unique IVs
- [ ] Authenticated encryption (GCM)
- [ ] Secure random generation

### Authentication
- [ ] OAuth properly implemented
- [ ] Session management secure
- [ ] Token validation
- [ ] Logout clears everything
- [ ] Auto-lock working

### Database
- [ ] RLS enabled and tested
- [ ] Proper foreign keys
- [ ] Indexes on queried columns
- [ ] Backup strategy in place
- [ ] Activity logging

### Frontend
- [ ] CSP headers configured
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Secure cookies
- [ ] HTTPS only

### Infrastructure
- [ ] SSL certificate valid
- [ ] HSTS enabled
- [ ] Security headers present
- [ ] Rate limiting configured
- [ ] Monitoring enabled

## 🆘 Incident Response

### Data Breach Response Plan

1. **Detection**
   - Monitor activity logs
   - Alert on suspicious patterns
   - Regular security audits

2. **Containment**
   - Identify breach scope
   - Isolate affected systems
   - Preserve evidence

3. **Notification**
   - Notify affected users
   - Provide guidance
   - Coordinate with authorities if needed

4. **Recovery**
   - Patch vulnerabilities
   - Reset compromised accounts
   - Restore from backups if needed

5. **Post-Incident**
   - Analyze root cause
   - Update security measures
   - Document lessons learned

### User Account Compromise

**Signs:**
- Unexpected login locations
- Unknown credential changes
- Unusual activity patterns

**Response:**
1. User should immediately change Google password
2. Review activity logs
3. Rotate all stored credentials
4. Report to support

## 📈 Future Security Enhancements

### Short Term
- [ ] Biometric authentication (WebAuthn)
- [ ] Hardware security key support (YubiKey)
- [ ] Encrypted data export
- [ ] Password health checker
- [ ] Breach monitoring

### Long Term
- [ ] End-to-end encrypted sharing
- [ ] Multi-device sync with E2EE
- [ ] Zero-knowledge proof of possession
- [ ] Post-quantum cryptography
- [ ] Formal security audit

## 📚 References

### Standards & Specifications
- [NIST SP 800-63B](https://pages.nist.gov/800-63-3/sp800-63b.html) - Digital Identity Guidelines
- [OWASP Top 10](https://owasp.org/www-project-top-ten/) - Web Application Security
- [Web Crypto API](https://www.w3.org/TR/WebCryptoAPI/) - W3C Specification

### Cryptography
- [AES-GCM](https://nvlpubs.nist.gov/nistpubs/Legacy/SP/nistspecialpublication800-38d.pdf) - NIST Recommendation
- [PBKDF2](https://tools.ietf.org/html/rfc2898) - RFC 2898
- [Password Hashing Competition](https://password-hashing.net/)

### Best Practices
- [Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Cryptographic Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html)

---

**Remember:** Security is a continuous process, not a destination. Stay informed, stay updated, and always prioritize user privacy.
