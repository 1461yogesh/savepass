# 🔧 SavePass Troubleshooting Checklist

Use this checklist to diagnose and fix common issues.

## 🚨 Before You Start

**Open Browser Console** (F12) to see error messages. This is essential for troubleshooting!

---

## ✅ Pre-Setup Checklist

Before trying to run SavePass, verify:

- [ ] Extracted all files from ZIP
- [ ] Have Supabase account created
- [ ] Have Google Cloud Console access
- [ ] Python or Node.js installed
- [ ] Text editor available

---

## 1️⃣ Configuration Issues

### Error: "Configuration Required" message

**Check:**
- [ ] Did you edit `js/config.js`?
- [ ] Did you replace `YOUR_SUPABASE_URL` with your actual URL?
- [ ] Did you replace `YOUR_SUPABASE_ANON_KEY` with your actual key?
- [ ] Are there any extra spaces or quotes?
- [ ] Did you save the file after editing?

**How to verify:**
1. Open `js/config.js`
2. Should look like:
   ```javascript
   url: 'https://abcdefghijk.supabase.co',  // NOT 'YOUR_SUPABASE_URL'
   anonKey: 'eyJhbGc...',  // NOT 'YOUR_SUPABASE_ANON_KEY'
   ```

**Fix:**
- Edit `js/config.js` properly
- Copy exact values from Supabase Dashboard → Settings → API
- No extra characters

---

## 2️⃣ Server Issues

### Error: "localhost refused to connect" or "ERR_CONNECTION_REFUSED"

**Check:**
- [ ] Is local server running?
- [ ] Is terminal/command prompt still open?
- [ ] Did you navigate to correct folder?
- [ ] Using port 8000?

**How to verify:**
1. Look at terminal - should show "Serving HTTP on..."
2. Terminal window should be open
3. Should NOT see any error messages

**Fix:**

**Restart server:**
```bash
# Stop: Press Ctrl+C in terminal
# Navigate to folder
cd C:\SavePass  # Your actual folder

# Start again
python -m http.server 8000
# OR
python3 -m http.server 8000
# OR
npx serve -p 8000
```

**Try different port:**
```bash
python -m http.server 3000
# Then visit http://localhost:3000
```

---

## 3️⃣ Supabase Setup Issues

### Error: "Failed to connect to database"

**Check:**
- [ ] Is Supabase project created?
- [ ] Is project active (not paused)?
- [ ] Did you copy correct URL and key?
- [ ] Is internet connection working?

**How to verify:**
1. Go to supabase.com/dashboard
2. Click on your project
3. Should see green "Active" status
4. Go to Settings → API
5. Verify URL and key match your config.js

**Fix:**
- Check Supabase project status
- Verify credentials are correct
- Check internet connection
- Try refreshing Supabase dashboard

---

### Error: "relation 'profiles' does not exist"

**Check:**
- [ ] Did you run the SQL schema?
- [ ] Did it complete successfully?
- [ ] Are all tables created?

**How to verify:**
1. Supabase Dashboard → SQL Editor
2. Should show "Success. No rows returned"
3. Table Editor should show: profiles, credentials, activity_logs

**Fix:**
1. Go to Supabase → SQL Editor
2. Clear the editor
3. Copy ALL content from `supabase-schema.sql`
4. Paste and click Run
5. Verify success message

---

## 4️⃣ Google OAuth Issues

### Error: "Unsupported provider: provider is not enabled"

**Check:**
- [ ] Is Google provider enabled in Supabase?
- [ ] Did you add Client ID and Secret?
- [ ] Did you click Save?

**How to verify:**
1. Supabase → Authentication → Providers
2. Google should show "Enabled" (green)
3. Client ID should be filled
4. Client Secret should be filled

**Fix:**
1. Go to Supabase → Authentication → Providers
2. Click on Google
3. Toggle to Enable
4. Add Client ID from Google Console
5. Add Client Secret from Google Console
6. Click Save

---

### Error: "redirect_uri_mismatch"

**Check:**
- [ ] Is redirect URI correct in Google Console?
- [ ] Does it match Supabase callback URL exactly?
- [ ] Any typos or extra characters?

**How to verify:**
1. Google Console → Credentials → Your OAuth Client
2. Authorized redirect URIs should include:
   ```
   https://YOUR-PROJECT.supabase.co/auth/v1/callback
   ```
3. YOUR-PROJECT must match your actual Supabase URL
4. Must end with `/auth/v1/callback`

**Fix:**
1. Go to Google Cloud Console
2. APIs & Services → Credentials
3. Click your OAuth 2.0 Client ID
4. Edit Authorized redirect URIs
5. Make sure it matches EXACTLY:
   ```
   https://your-project-ref.supabase.co/auth/v1/callback
   ```
6. Save

---

### Error: "Access blocked: This app's request is invalid"

**Check:**
- [ ] Is OAuth consent screen configured?
- [ ] Did you fill in required fields?

**Fix:**
1. Google Console → OAuth consent screen
2. Fill in app name
3. Add support email
4. Add developer email
5. Save

---

## 5️⃣ Login/Authentication Issues

### Can't see Google login popup

**Check:**
- [ ] Is popup blocked by browser?
- [ ] Any browser extensions blocking it?

**Fix:**
- Allow popups for localhost
- Try incognito/private mode
- Disable ad blockers temporarily
- Try different browser

---

### Stuck on "Signing in..."

**Check:**
- [ ] Check browser console for errors
- [ ] Is internet connection stable?

**Fix:**
- Refresh page
- Clear browser cache
- Try again

---

## 6️⃣ Dashboard/Vault Issues

### Can't unlock vault / "Incorrect passphrase"

**Check:**
- [ ] Are you entering correct passphrase?
- [ ] Caps Lock on?
- [ ] Extra spaces?

**Fix:**
- Try passphrase again carefully
- Check keyboard layout
- If truly forgotten: **data is unrecoverable** (zero-knowledge design)

---

### "Failed to decrypt" error

**Possible causes:**
- Wrong passphrase
- Data corruption
- Browser issue

**Fix:**
1. Try correct passphrase
2. Clear browser cache
3. If persistent, may need to reset vault (data loss)

---

### Credentials not loading

**Check:**
- [ ] Is vault unlocked?
- [ ] Any console errors?
- [ ] Are you signed in?

**Fix:**
1. Check browser console (F12)
2. Lock and unlock vault
3. Sign out and sign in again
4. Check Supabase Table Editor - are credentials there?

---

## 7️⃣ CSS/Styling Issues

### Page has no styling / looks plain

**Check:**
- [ ] Is `css/style.css` file present?
- [ ] Are file paths correct?
- [ ] Check browser console for 404 errors

**How to verify:**
1. Press F12 → Console
2. Look for errors like "Failed to load css/style.css"
3. Check Network tab for failed requests

**Fix:**
- Verify `css` folder exists
- Verify `style.css` is inside `css` folder
- Make sure you're running from a server (not file://)

---

## 8️⃣ File Path Issues

### JavaScript files not loading

**Check:**
- [ ] Are all .js files in `js` folder?
- [ ] Check browser console for 404 errors

**Files that should exist:**
```
js/config.js
js/supabase.js
js/auth.js
js/encryption.js
js/dashboard.js
js/dashboard-ui.js
```

**Fix:**
- Verify all files are present
- Re-extract from ZIP if missing
- Check file names match exactly (case-sensitive on Linux/Mac)

---

## 9️⃣ Browser Compatibility

### Features not working in your browser

**Supported browsers:**
- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

**Required features:**
- Web Crypto API
- localStorage
- ES6 JavaScript

**Check:**
- Update browser to latest version
- Try in a different browser
- Disable browser extensions

---

## 🔟 Network Issues

### Supabase requests failing

**Check:**
- [ ] Internet connection working?
- [ ] Firewall blocking requests?
- [ ] VPN interfering?

**Fix:**
- Check internet connection
- Disable firewall temporarily
- Disable VPN temporarily
- Try mobile hotspot

---

## 🎯 Quick Diagnostic

Run this checklist in order:

1. **Server running?**
   - Look at terminal - should show "Serving HTTP"
   - Visit http://localhost:8000
   - Should see landing page

2. **Config correct?**
   - Open browser console (F12)
   - Should NOT see "Configuration Error"
   - If you do, check `js/config.js`

3. **Supabase working?**
   - Should NOT see "Failed to connect"
   - Check Supabase dashboard - project active?

4. **Google OAuth setup?**
   - Can you click "Continue with Google"?
   - Does Google login popup appear?

5. **Database tables created?**
   - Supabase → Table Editor
   - Should see: profiles, credentials, activity_logs

---

## 🆘 Still Not Working?

### Collect Debug Information

1. **Open Browser Console** (F12)
2. **Go to Console tab**
3. **Copy all error messages**
4. **Check Network tab** for failed requests

### Common Error Patterns

**"404 Not Found"**
- File is missing or path is wrong
- Check file structure

**"CORS error"**
- Must use local server (not file://)
- Restart server

**"RLS policy violation"**
- Database permissions issue
- Re-run SQL schema

**"Invalid JWT"**
- Session expired
- Sign out and sign in again

---

## 📋 Environment Checklist

```
✅ Operating System: Windows/Mac/Linux
✅ Browser: Chrome/Firefox/Safari/Edge (version?)
✅ Python version: run `python --version`
✅ Node version (if using): run `node --version`
✅ Internet: Connected and stable
✅ Supabase: Project created and active
✅ Google OAuth: Configured in Google Console
✅ Files: All extracted from ZIP
```

---

## 🔄 Nuclear Option: Complete Reset

If nothing works, start fresh:

1. **Delete SavePass folder**
2. **Re-extract from ZIP**
3. **Delete Supabase project** (if needed)
4. **Create new Supabase project**
5. **Follow SETUP_GUIDE.md from beginning**

---

## 💡 Prevention Tips

**For future:**
- Keep setup guide handy
- Document your configuration
- Save your master passphrase securely
- Regular backups of credentials
- Test after each major change

---

**Still stuck?** Open browser console, read error messages carefully, and match them to issues above.

Most issues are configuration-related and can be fixed by following the setup guide carefully! 🔧
