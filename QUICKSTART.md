# SavePass - Quick Start Guide

Get SavePass running in under 10 minutes! ⚡

## 📋 Prerequisites

Before you begin, make sure you have:
- A Supabase account ([sign up free](https://supabase.com))
- A Google Cloud Console account ([sign up free](https://console.cloud.google.com))
- A code editor (VS Code, Sublime, etc.)
- A way to serve files locally (Python, Node.js, or any static server)

## 🚀 Step-by-Step Setup

### Step 1: Clone or Download (2 minutes)

```bash
# Option A: Clone with Git
git clone https://github.com/yourusername/savepass.git
cd savepass

# Option B: Download ZIP
# Download from GitHub and extract
```

### Step 2: Supabase Setup (3 minutes)

#### 2.1 Create Project
1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - Name: `savepass`
   - Database Password: (save this!)
   - Region: (choose nearest)
4. Wait ~2 minutes for setup

#### 2.2 Run Database Schema
1. In Supabase Dashboard, go to **SQL Editor**
2. Open `supabase-schema.sql` from the SavePass files
3. Copy all contents
4. Paste into SQL Editor
5. Click **Run**
6. ✅ You should see "Success. No rows returned"

#### 2.3 Get API Credentials
1. Go to **Settings** → **API**
2. Copy these two values:
   - `Project URL`
   - `anon public` key

### Step 3: Google OAuth Setup (2 minutes)

#### 3.1 Create OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project (or select existing)
3. Go to **APIs & Services** → **Credentials**
4. Click **+ Create Credentials** → **OAuth 2.0 Client ID**
5. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: SavePass
   - Support email: your email
   - Developer email: your email
   - Save
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `SavePass`
   - Authorized redirect URIs: 
     - Click **+ Add URI**
     - Add: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
     - (Replace YOUR-PROJECT-REF with your actual Supabase project reference)
   - Click **Create**
7. Copy Client ID and Client Secret

#### 3.2 Configure in Supabase
1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Click on **Google**
3. Enable Google provider
4. Paste:
   - Client ID
   - Client Secret
5. Save

### Step 4: Configure Application (1 minute)

1. Open `js/config.js` in your editor
2. Update these values:

```javascript
const SUPABASE_CONFIG = {
  url: 'YOUR_SUPABASE_URL',  // From Step 2.3
  anonKey: 'YOUR_ANON_KEY'    // From Step 2.3
};
```

3. Save the file

### Step 5: Set Redirect URLs (1 minute)

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to:
   - For local testing: `http://localhost:8000`
   - For production: `https://yourdomain.com`
3. Add to **Redirect URLs**:
   - `http://localhost:8000/**`
   - (Add production URLs when you deploy)
4. Save

### Step 6: Run Locally (1 minute)

Choose your preferred method:

#### Option A: Python (easiest)
```bash
python -m http.server 8000
```

#### Option B: Node.js
```bash
npx serve -p 8000
```

#### Option C: PHP
```bash
php -S localhost:8000
```

#### Option D: VS Code Live Server
1. Install "Live Server" extension
2. Right-click `index.html`
3. Select "Open with Live Server"

### Step 7: Test It! (2 minutes)

1. Open browser to `http://localhost:8000`
2. Click **Get Started**
3. Click **Continue with Google**
4. Sign in with Google
5. Create your Master Passphrase (don't forget it!)
6. Add your first credential
7. Test search, filter, and copy features

✅ **Success!** You now have SavePass running locally.

## 🎉 What's Next?

### Explore Features
- Try the password generator
- Test auto-lock (wait 15 minutes or lock manually)
- Add different credential types
- Use favorites
- Test on mobile device

### Deploy to Production
See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment guides for:
- Netlify (recommended for beginners)
- Vercel
- GitHub Pages
- Self-hosted

### Customize
- Change colors in `css/style.css`
- Adjust session timeout in `js/config.js`
- Add your own logo/branding

## 🐛 Troubleshooting

### Issue: "redirect_uri_mismatch"
**Solution:** Make sure the redirect URI in Google Console exactly matches your Supabase callback URL.

### Issue: "Failed to fetch"
**Solution:** Check that:
1. Supabase URL and key are correct in `config.js`
2. You're running a local server (not opening file:// directly)
3. Supabase project is active

### Issue: "Cannot read properties of undefined"
**Solution:** 
1. Clear browser cache
2. Make sure Supabase client library is loading
3. Check browser console for specific errors

### Issue: Database errors
**Solution:**
1. Verify database schema was run successfully
2. Check that RLS policies are enabled
3. Look at Supabase logs for details

### Issue: Google OAuth not working
**Solution:**
1. Verify OAuth credentials are correct
2. Check authorized redirect URIs
3. Make sure OAuth consent screen is configured
4. Try in incognito mode (to rule out cached issues)

## 📚 Learn More

- **Full Documentation:** [README.md](README.md)
- **Security Details:** [SECURITY.md](SECURITY.md)
- **Deployment Guide:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **Database Schema:** [supabase-schema.sql](supabase-schema.sql)

## 🆘 Need Help?

1. Check the troubleshooting section above
2. Review error messages in browser console
3. Check Supabase dashboard for errors
4. Open an issue on GitHub

## 🎯 Quick Commands Reference

```bash
# Start local server (Python)
python -m http.server 8000

# Start local server (Node)
npx serve -p 8000

# Start local server (PHP)
php -S localhost:8000

# Open in browser
open http://localhost:8000
# or
start http://localhost:8000
# or
xdg-open http://localhost:8000
```

## ✅ Verification Checklist

- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] Google OAuth configured
- [ ] Config file updated
- [ ] Local server running
- [ ] Can sign in with Google
- [ ] Master passphrase created
- [ ] Can add/edit/delete credentials
- [ ] Search and filters work
- [ ] Password generator works
- [ ] Copy to clipboard works

---

**Congratulations!** 🎉 

You've successfully set up SavePass. Your credentials are now protected with zero-knowledge encryption!

Remember: **Your master passphrase is the only key to your vault. Keep it safe and never lose it!**
