# SavePass - Zero-Knowledge Password Manager

A production-ready, secure password manager built with zero-knowledge architecture. Your credentials are encrypted client-side using AES-256 encryption, ensuring that even the platform cannot access your data.

![SavePass](https://img.shields.io/badge/Security-Zero--Knowledge-00d4ff)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production--Ready-success)

## 🔐 Features

### Security First
- **Zero-Knowledge Architecture**: Your master passphrase never leaves your device
- **AES-256 Encryption**: Military-grade encryption for all credentials
- **Client-Side Encryption**: All encryption/decryption happens in your browser
- **Auto-Lock**: Vault automatically locks after 15 minutes of inactivity
- **Clipboard Auto-Clear**: Copied passwords are cleared after 30 seconds

### User Experience
- **Google OAuth**: Seamless authentication with Google accounts
- **Multiple Credential Types**: Websites, apps, Wi-Fi, API keys, banking, secure notes
- **Search & Filter**: Quickly find credentials by category or search query
- **Password Generator**: Create strong, unique passwords
- **Favorites**: Mark frequently used credentials
- **Responsive Design**: Works on desktop, tablet, and mobile

### Technical Excellence
- **Row Level Security**: Supabase RLS ensures data isolation
- **Activity Logging**: Track credential access and modifications
- **Modern UI**: Security-focused design with smooth animations
- **Real-time Sync**: Access your vault from any device
- **Session Management**: Secure session handling with automatic timeout

## 🚀 Quick Start

### Prerequisites
- Node.js (for local development server) or any static file server
- Supabase account (free tier works great)
- Google Cloud Console account (for OAuth)

### 1. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to finish setting up

#### Run Database Schema
1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the contents of `supabase-schema.sql`
3. Paste and run the SQL script

#### Enable Google OAuth
1. Go to Authentication → Providers in Supabase
2. Enable Google provider
3. Note down the redirect URL (you'll need this for Google Console)

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select an existing one
3. Navigate to APIs & Services → Credentials
4. Create OAuth 2.0 Client ID:
   - Application type: Web application
   - Authorized redirect URIs: Add your Supabase redirect URL
     - Example: `https://your-project.supabase.co/auth/v1/callback`
5. Copy the Client ID and Client Secret
6. Add these to your Supabase Google provider settings

### 3. Configure the Application

Edit `js/config.js` and add your Supabase credentials:

```javascript
const SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key-here'
};
```

You can find these in Supabase Dashboard → Settings → API

### 4. Deploy

#### Option A: Netlify (Recommended)
1. Push code to GitHub
2. Connect repository to Netlify
3. Deploy with default settings
4. Add your domain in Supabase → Authentication → URL Configuration

#### Option B: Vercel
1. Push code to GitHub
2. Import project in Vercel
3. Deploy
4. Update Supabase authentication URLs

#### Option C: Local Development
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

**Important**: Update Supabase Site URL to your deployment URL:
- Go to Authentication → URL Configuration
- Set Site URL to your production/local URL

## 📁 Project Structure

```
savepass/
├── index.html              # Landing page
├── login.html              # Google OAuth login
├── dashboard.html          # Main dashboard
├── css/
│   └── style.css          # Complete styling
├── js/
│   ├── config.js          # Configuration
│   ├── supabase.js        # Supabase client & operations
│   ├── encryption.js      # Zero-knowledge encryption
│   ├── auth.js            # Authentication management
│   ├── dashboard.js       # Dashboard controller
│   └── dashboard-ui.js    # UI & modal management
├── supabase-schema.sql    # Database schema & RLS policies
└── README.md              # This file
```

## 🔒 Security Architecture

### Encryption Flow

```
User creates Master Passphrase
         ↓
Derive encryption key using PBKDF2 (100,000 iterations)
         ↓
Generate AES-256 key
         ↓
Store key in memory ONLY (never persisted)
         ↓
Encrypt credentials client-side
         ↓
Store encrypted data in Supabase
```

### Key Security Features

1. **Master Passphrase**
   - Never stored anywhere
   - Never transmitted to server
   - Used only to derive encryption key
   - Key exists only in browser memory

2. **Encryption Process**
   - Algorithm: AES-256-GCM
   - Key derivation: PBKDF2 with 100,000 iterations
   - Unique IV (Initialization Vector) for each encryption
   - Salt derived from user email for deterministic key generation

3. **Data Storage**
   - Only encrypted data stored in database
   - Row Level Security prevents unauthorized access
   - Even database admins cannot read your passwords

4. **Session Security**
   - Auto-lock after 15 minutes of inactivity
   - Manual lock available
   - Session cleared on browser close
   - Clipboard auto-cleared after 30 seconds

## 📊 Database Schema

### Tables

**profiles**
- User profile information
- Master passphrase hint (optional)
- Vault lock status

**credentials**
- Encrypted credentials storage
- Category, title, username
- Encrypted password (AES-256)
- URLs and notes

**activity_logs**
- User activity tracking
- Credential access logs
- Security audit trail

### Row Level Security

All tables have RLS enabled with policies:
- Users can only access their own data
- Foreign key constraints ensure data integrity
- No public access allowed

## 🛠️ Development

### Local Testing

1. Install dependencies (optional):
```bash
npm install -g serve
```

2. Start development server:
```bash
serve
```

3. Open `http://localhost:3000`

### Testing Checklist

- [ ] Google OAuth login works
- [ ] Master passphrase setup
- [ ] Vault unlock/lock
- [ ] Create credential
- [ ] Edit credential
- [ ] Delete credential
- [ ] Search functionality
- [ ] Category filters
- [ ] Password visibility toggle
- [ ] Copy to clipboard
- [ ] Auto-lock on inactivity
- [ ] Password generator
- [ ] Favorites

## 🎨 Customization

### Color Scheme

Edit CSS variables in `css/style.css`:

```css
:root {
  --primary: #0a0e27;
  --accent: #00d4ff;
  --success: #00ff88;
  --warning: #ffb800;
  --danger: #ff4757;
}
```

### Session Timeout

Edit `js/config.js`:

```javascript
const SESSION_CONFIG = {
  inactivityTimeout: 15 * 60 * 1000, // 15 minutes
  clipboardClearTimeout: 30 * 1000,   // 30 seconds
};
```

### Encryption Strength

Edit `js/config.js`:

```javascript
const ENCRYPTION_CONFIG = {
  iterations: 100000,  // PBKDF2 iterations
  keyLength: 256,      // AES key length
};
```

## 🚨 Important Security Notes

### For Users

1. **Never share your master passphrase** with anyone
2. **Choose a strong master passphrase** - use 12+ characters with mixed case, numbers, and symbols
3. **Write down your master passphrase** and store it in a safe place - there's no recovery if forgotten
4. **Use the optional hint carefully** - don't make it too obvious
5. **Lock your vault** when stepping away from your device
6. **Don't use SavePass on public/shared computers** unless you can ensure the browser is cleared

### For Developers

1. **Never log the master passphrase** or encryption keys
2. **Never store the master passphrase** anywhere (localStorage, sessionStorage, cookies, database)
3. **Always use HTTPS** in production
4. **Keep Supabase keys secure** - use environment variables in production
5. **Regularly audit activity logs** for suspicious behavior
6. **Keep dependencies updated** for security patches

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially security features)
5. Submit a pull request

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the bug
- Steps to reproduce
- Expected vs actual behavior
- Browser and OS information

## 💡 Feature Requests

Have an idea? Open an issue with:
- Feature description
- Use case
- Mockups (if applicable)

## 📞 Support

- Documentation: This README
- Issues: GitHub Issues
- Security: Report vulnerabilities privately to project maintainer

## ⚠️ Disclaimer

This software is provided "as is" without warranty. While we've implemented industry-standard security practices, you are responsible for:
- Choosing a strong master passphrase
- Keeping your master passphrase secure
- Regular backups of your data
- Understanding the zero-knowledge model

## 🎯 Roadmap

- [ ] Two-factor authentication
- [ ] Biometric unlock (WebAuthn)
- [ ] Encrypted export/import
- [ ] Password health checker
- [ ] Breach monitoring
- [ ] Browser extension
- [ ] Mobile apps (iOS/Android)
- [ ] Team/family sharing (with separate encryption)

## 🏆 Credits

Built with:
- [Supabase](https://supabase.com) - Backend & Authentication
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API) - Encryption
- Modern web standards - HTML5, CSS3, Vanilla JavaScript

---

**Made with 🔐 for security-conscious users**

Remember: The best password manager is one that even the developers can't access your data. That's SavePass.
