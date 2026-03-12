# 🚀 SavePass - Quick Start Reference

## ⚡ 5-Minute Version (After Setup)

Already configured? Here's how to run it:

```bash
# 1. Open terminal in SavePass folder
cd /path/to/SavePass

# 2. Start server
python -m http.server 8000

# 3. Open browser
http://localhost:8000

# Done! 🎉
```

---

## 📥 First Time Setup (20 minutes)

### 1. Supabase (5 min)
- Create project at supabase.com
- Run `supabase-schema.sql` in SQL Editor
- Copy URL + anon key from Settings → API

### 2. Google OAuth (5 min)
- Create OAuth in console.cloud.google.com
- Add redirect: `https://YOUR-PROJECT.supabase.co/auth/v1/callback`
- Copy Client ID + Secret
- Add to Supabase → Authentication → Providers → Google

### 3. Configure (2 min)
- Edit `js/config.js`
- Replace `YOUR_SUPABASE_URL` with your URL
- Replace `YOUR_SUPABASE_ANON_KEY` with your key
- Save

### 4. Run (1 min)
```bash
cd SavePass
python -m http.server 8000
```
Open: http://localhost:8000

**Full guide:** See `SETUP_GUIDE.md`

---

## 🐛 Common Issues

| Issue | Fix |
|-------|-----|
| "Configuration Required" | Edit `js/config.js` with real values |
| "localhost refused to connect" | Start server: `python -m http.server 8000` |
| "Unsupported provider" | Enable Google in Supabase → Authentication |
| "redirect_uri_mismatch" | Fix redirect URI in Google Console |
| No styling | Make sure server is running (not file://) |

**More help:** See `TROUBLESHOOTING.md`

---

## 📁 File Structure

```
SavePass/
├── SETUP_GUIDE.md ← Start here!
├── TROUBLESHOOTING.md ← If issues
├── index.html
├── login.html
├── dashboard.html
├── css/style.css
├── js/
│   ├── config.js ← Edit this!
│   ├── supabase.js
│   ├── auth.js
│   ├── encryption.js
│   ├── dashboard.js
│   └── dashboard-ui.js
└── supabase-schema.sql ← Run this!
```

---

## ✅ What's Fixed

- ✅ All file paths corrected
- ✅ Configuration validation added
- ✅ Better error messages
- ✅ OAuth redirect fixed
- ✅ Session management improved
- ✅ Input sanitization added
- ✅ Edge cases handled

---

## 🎯 Setup Checklist

- [ ] Extract ZIP
- [ ] Create Supabase project
- [ ] Run SQL schema
- [ ] Setup Google OAuth
- [ ] Configure Supabase provider
- [ ] Edit `js/config.js`
- [ ] Start local server
- [ ] Test in browser

---

## 🔑 Important

**Master Passphrase:**
- Cannot be recovered if forgotten
- Write it down somewhere safe
- This is by design (zero-knowledge)

**Supabase Credentials:**
- Keep secret
- Don't commit to public repos
- Don't share with others

---

## 📞 Help

- **Setup**: `SETUP_GUIDE.md`
- **Issues**: `TROUBLESHOOTING.md`
- **Security**: `SECURITY.md`
- **Deploy**: `DEPLOYMENT.md`

---

**Need detailed help?** Open `SETUP_GUIDE.md` for step-by-step instructions with screenshots!
