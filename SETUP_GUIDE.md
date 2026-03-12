# 🚀 SavePass - Complete Setup Guide (Bug-Free Version)

## ✅ What's Fixed in This Version

### Bugs & Issues Resolved:
1. ✅ **Path Issues** - All file paths now work correctly (relative paths)
2. ✅ **Configuration Validation** - Automatic checks for missing config
3. ✅ **Better Error Messages** - Clear instructions when something goes wrong
4. ✅ **OAuth Redirect Fixed** - Works with any folder structure
5. ✅ **Missing Supabase Library Detection** - Alerts if CDN fails
6. ✅ **Database Error Handling** - Better error messages for RLS issues
7. ✅ **Session Management** - Fixed auto-lock and redirect loops
8. ✅ **Encryption Edge Cases** - Better handling of empty/invalid data

### Security Improvements:
1. ✅ **Input Sanitization** - All user inputs are properly escaped
2. ✅ **XSS Prevention** - HTML escaping in all credential displays
3. ✅ **CSRF Protection** - Supabase handles this automatically
4. ✅ **Rate Limiting Awareness** - Better error messages
5. ✅ **Memory Leaks Fixed** - Proper cleanup on logout

---

## 📋 Prerequisites

Before starting, make sure you have:

- [ ] **A Supabase account** (free) - [Sign up here](https://supabase.com)
- [ ] **A Google account** (for OAuth)
- [ ] **Google Cloud Console access** - [Access here](https://console.cloud.google.com)
- [ ] **Python** OR **Node.js** installed on your computer
- [ ] **A web browser** (Chrome, Firefox, Edge recommended)
- [ ] **15-20 minutes** of setup time

---

## 🎯 Step-by-Step Setup (COMPLETE GUIDE)

### STEP 1: Extract SavePass Files (1 minute)

1. **Download** the `savepass-fixed.zip` file
2. **Extract** to a folder on your computer
   - Example: `C:\SavePass` (Windows)
   - Example: `/Users/YourName/SavePass` (Mac)
   - Example: `/home/yourname/SavePass` (Linux)

3. **Verify** you have these files:
   ```
   SavePass/
   ├── index.html
   ├── login.html
   ├── dashboard.html
   ├── css/
   │   └── style.css
   ├── js/
   │   ├── config.js
   │   ├── supabase.js
   │   ├── auth.js
   │   ├── encryption.js
   │   ├── dashboard.js
   │   └── dashboard-ui.js
   ├── supabase-schema.sql
   └── SETUP_GUIDE.md (this file)
   ```

---

### STEP 2: Create Supabase Project (5 minutes)

1. **Go to** [https://supabase.com](https://supabase.com)

2. **Sign in** or **Sign up** for free

3. **Click** "New Project"

4. **Fill in details:**
   - **Name**: `SavePass` (or any name you like)
   - **Database Password**: Create a STRONG password and **SAVE IT!**
     - Example: `MySecure#Pass2024!`
     - ⚠️ **IMPORTANT**: Write this down! You'll need it later.
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free (sufficient for personal use)

5. **Click** "Create new project"

6. **Wait** ~2 minutes for setup to complete
   - You'll see a progress indicator
   - Don't close the tab!

---

### STEP 3: Setup Database (3 minutes)

1. **In your Supabase project**, find the left sidebar

2. **Click** on "SQL Editor" (icon looks like `</>`)

3. **Open the file** `supabase-schema.sql` from SavePass folder
   - On Windows: Right-click → Open with → Notepad
   - On Mac: Right-click → Open With → TextEdit
   - Or use any code editor

4. **Copy ALL the contents** (Ctrl+A, then Ctrl+C)

5. **Go back to Supabase** SQL Editor

6. **Paste** the SQL code into the editor (Ctrl+V)

7. **Click** the "Run" button (or press Ctrl+Enter)

8. **Verify success:**
   - You should see: "Success. No rows returned"
   - If you see an error, make sure you copied ALL the code

9. **Verify tables were created:**
   - Click "Table Editor" in sidebar
   - You should see: `profiles`, `credentials`, `activity_logs`

---

### STEP 4: Get Supabase Credentials (2 minutes)

1. **In Supabase Dashboard**, click the **Settings** icon (gear) in sidebar

2. **Click** "API"

3. **Find and COPY these two values:**

   **A. Project URL**
   ```
   Example: https://abcdefghijk.supabase.co
   ```
   - Click the "Copy" button next to it
   - Paste it somewhere temporary (Notepad)

   **B. anon public key**
   ```
   Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   - Look for "anon" and "public" in the key name
   - Click "Copy" button
   - Paste it somewhere temporary

⚠️ **IMPORTANT**: Keep these values handy! You'll need them in Step 6.

---

### STEP 5: Setup Google OAuth (5 minutes)

1. **Go to** [Google Cloud Console](https://console.cloud.google.com)

2. **Sign in** with your Google account

3. **Create a project** (if you don't have one):
   - Click the project dropdown (top-left)
   - Click "New Project"
   - Name: "SavePass"
   - Click "Create"
   - Wait for it to be created
   - **Select** the project from the dropdown

4. **Enable OAuth Consent Screen:**
   - Click menu (☰) → "APIs & Services" → "OAuth consent screen"
   - Choose "External" user type
   - Click "Create"
   
   **Fill in the form:**
   - App name: `SavePass`
   - User support email: Your email
   - Developer contact: Your email
   - Click "Save and Continue"
   - Click "Save and Continue" again (skip scopes)
   - Click "Save and Continue" again (skip test users)
   - Click "Back to Dashboard"

5. **Create OAuth Credentials:**
   - Click menu (☰) → "APIs & Services" → "Credentials"
   - Click "+ CREATE CREDENTIALS"
   - Select "OAuth 2.0 Client ID"
   
   **Configure:**
   - Application type: "Web application"
   - Name: "SavePass"
   
   **Authorized redirect URIs:**
   - Click "+ ADD URI"
   - Enter: `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
     - **Replace** `YOUR-PROJECT-REF` with your actual Supabase URL
     - Example: If your Supabase URL is `https://abcdefghijk.supabase.co`
     - Then enter: `https://abcdefghijk.supabase.co/auth/v1/callback`
   
   - Click "CREATE"

6. **Copy credentials:**
   - A popup will show your Client ID and Client Secret
   - **Copy Client ID** - save it
   - **Copy Client Secret** - save it
   - Click "OK"

---

### STEP 6: Configure Google in Supabase (2 minutes)

1. **Go back to Supabase Dashboard**

2. **Click** "Authentication" in sidebar

3. **Click** "Providers"

4. **Find "Google"** in the list and click on it

5. **Enable it:**
   - Toggle "Enable Sign in with Google" to **ON**

6. **Paste credentials:**
   - **Client ID**: Paste your Google Client ID (from Step 5)
   - **Client Secret**: Paste your Google Client Secret (from Step 5)

7. **Click** "Save"

8. **Verify**: The Google provider should now show as "Enabled"

---

### STEP 7: Configure SavePass (2 minutes)

1. **Open** the SavePass folder you extracted

2. **Navigate to** `js` folder

3. **Open** `config.js` file with a text editor:
   - Right-click → Open with → Notepad (Windows)
   - Right-click → Open with → TextEdit (Mac)
   - Or use VS Code, Sublime, etc.

4. **Find these lines:**
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'YOUR_SUPABASE_URL',
     anonKey: 'YOUR_SUPABASE_ANON_KEY'
   };
   ```

5. **Replace with your actual values** (from Step 4):
   ```javascript
   const SUPABASE_CONFIG = {
     url: 'https://abcdefghijk.supabase.co',  // YOUR PROJECT URL
     anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'  // YOUR ANON KEY
   };
   ```

6. **Save** the file (Ctrl+S)

7. **Close** the text editor

---

### STEP 8: Configure Redirect URLs in Supabase (1 minute)

1. **In Supabase Dashboard**, go to "Authentication" → "URL Configuration"

2. **Set Site URL:**
   - For local testing: `http://localhost:8000`
   - Click "Save"

3. **Add Redirect URLs:**
   - Click "+ Add URL"
   - Enter: `http://localhost:8000/**`
   - Click "Save"
   
   **Optional** (for production later):
   - Add: `https://yourdomain.com/**`

---

### STEP 9: Start Local Server (2 minutes)

Now we need to run SavePass on a local web server.

#### Option A: Python (RECOMMENDED - Works on Windows/Mac/Linux)

1. **Open Command Prompt / Terminal:**
   - **Windows**: Press `Win + R`, type `cmd`, press Enter
   - **Mac**: Press `Cmd + Space`, type `terminal`, press Enter
   - **Linux**: Press `Ctrl + Alt + T`

2. **Navigate to SavePass folder:**
   ```bash
   cd C:\SavePass
   ```
   - **Replace** `C:\SavePass` with your actual folder path
   - **Mac/Linux**: `cd /Users/YourName/SavePass`

3. **Start the server:**
   ```bash
   python -m http.server 8000
   ```
   
   **OR** if that doesn't work:
   ```bash
   python3 -m http.server 8000
   ```

4. **You should see:**
   ```
   Serving HTTP on :: port 8000 (http://[::]:8000/) ...
   ```

5. **Keep this window open!** Don't close it while using SavePass.

#### Option B: Node.js (If you have Node installed)

1. **Open Terminal/Command Prompt**

2. **Navigate to SavePass folder**

3. **Run:**
   ```bash
   npx serve -p 8000
   ```

4. **Keep terminal open**

---

### STEP 10: Test SavePass! (3 minutes)

1. **Open your web browser**

2. **Go to:** `http://localhost:8000`

3. **You should see:**
   - The SavePass landing page
   - 🔐 logo
   - "Get Started" button

4. **Click** "Get Started"

5. **You should see:**
   - Login page
   - "Continue with Google" button

6. **Click** "Continue with Google"

7. **Sign in with Google:**
   - Choose your Google account
   - Click "Allow" to grant permissions

8. **You should be redirected to:**
   - Dashboard page
   - "Setup Master Passphrase" modal

9. **Create your Master Passphrase:**
   - Enter a STRONG passphrase (12+ characters)
   - Re-enter to confirm
   - Add a hint (optional but recommended)
   - Click "Create Vault"

10. **Success! 🎉**
    - You should see your empty dashboard
    - Click "+ Add Credential" to add your first password

---

## 🎉 You're Done!

SavePass is now fully configured and running!

---

## 🧪 Testing Checklist

Make sure everything works:

- [ ] Landing page loads with styling
- [ ] Can click "Get Started"
- [ ] Login page shows Google button
- [ ] Google OAuth login works
- [ ] Master passphrase setup appears
- [ ] Can create master passphrase
- [ ] Dashboard loads after setup
- [ ] Can add a credential
- [ ] Can view credential details
- [ ] Can copy password to clipboard
- [ ] Search works
- [ ] Filter by category works
- [ ] Can edit a credential
- [ ] Can delete a credential
- [ ] Lock vault button works
- [ ] Unlock vault with passphrase works
- [ ] Sign out works

---

## 🐛 Troubleshooting

### "Configuration Error" message
- Make sure you edited `js/config.js`
- Check that you replaced BOTH the URL and anonKey
- No extra spaces or quotes

### "localhost refused to connect"
- Make sure local server is running
- Check that you're using port 8000
- Try `127.0.0.1:8000` instead

### "Unsupported provider" error
- Google OAuth not enabled in Supabase
- Go to Supabase → Authentication → Providers
- Enable Google and add credentials

### "redirect_uri_mismatch"
- Check your Google Cloud Console redirect URI
- Must match: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
- Exact match required (no typos)

### "Failed to decrypt"
- Wrong master passphrase
- Try again with correct passphrase
- If truly forgotten, data cannot be recovered (zero-knowledge)

### Database errors
- Run the SQL schema again
- Check that RLS is enabled
- Verify tables were created

### Can't see Google login popup
- Popup might be blocked
- Check browser popup blocker
- Try different browser

### Still not working?
- Open browser console (F12)
- Look for error messages
- Check that all files are present
- Verify Supabase project is active

---

## 🚀 Next Steps

### Deploy to Production

When ready to go live:

1. **Choose a hosting provider:**
   - Netlify (recommended)
   - Vercel
   - GitHub Pages

2. **Update Supabase URLs:**
   - Add production domain to redirect URLs
   - Update Site URL to production domain

3. **See DEPLOYMENT.md** for detailed instructions

### Customize

- Change colors in `css/style.css`
- Modify timeouts in `js/config.js`
- Add your own branding
- Translate to your language

---

## 📞 Support

- **Documentation**: Check other .md files
- **Issues**: Review troubleshooting section above
- **Security**: See SECURITY.md for details

---

## ⚠️ IMPORTANT REMINDERS

1. **Your master passphrase is EVERYTHING**
   - Write it down and store safely
   - No recovery if forgotten
   - We cannot help you recover it (zero-knowledge)

2. **Keep Supabase credentials secret**
   - Don't commit to public GitHub
   - Don't share with others

3. **Use HTTPS in production**
   - Required for Web Crypto API
   - Required for secure cookies

4. **Regular backups**
   - Export your credentials periodically
   - Store encrypted backups safely

---

**Congratulations!** 🎊 You now have a fully functional, secure, zero-knowledge password manager!

Your passwords are encrypted with AES-256 and only YOU can decrypt them.

Enjoy using SavePass! 🔐
