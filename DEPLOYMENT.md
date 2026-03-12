# SavePass Deployment Guide

This guide will walk you through deploying SavePass to production.

## 🎯 Pre-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema deployed
- [ ] Google OAuth configured
- [ ] Config file updated with production credentials
- [ ] Code tested locally
- [ ] SSL/HTTPS ready

## 🚀 Deployment Options

### Option 1: Netlify (Recommended for Beginners)

**Pros:**
- Free tier available
- Automatic SSL
- Easy continuous deployment
- Great CDN

**Steps:**

1. **Prepare Your Repository**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-repo-url
git push -u origin main
```

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub account
   - Select your SavePass repository
   - Configure build settings:
     - Build command: (leave empty)
     - Publish directory: `/`
   - Click "Deploy site"

3. **Configure Custom Domain (Optional)**
   - Go to Site settings → Domain management
   - Add custom domain
   - Update DNS records as instructed

4. **Update Supabase URLs**
   - Go to your Supabase project
   - Navigate to Authentication → URL Configuration
   - Set Site URL to your Netlify URL
   - Add redirect URL: `https://your-site.netlify.app/**`

### Option 2: Vercel

**Pros:**
- Excellent performance
- Free tier available
- Great for Next.js projects (future-ready)
- Edge functions support

**Steps:**

1. **Install Vercel CLI** (optional)
```bash
npm install -g vercel
```

2. **Deploy via Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Connect GitHub
   - Select SavePass repository
   - Configure:
     - Framework Preset: Other
     - Root Directory: ./
   - Click "Deploy"

3. **Or Deploy via CLI**
```bash
cd savepass
vercel
# Follow prompts
```

4. **Update Supabase**
   - Update Site URL in Supabase
   - Add Vercel domain to allowed redirect URLs

### Option 3: GitHub Pages

**Pros:**
- Free
- Simple
- Good for static sites

**Cons:**
- Only supports one site per repository
- Requires public repository (free tier)

**Steps:**

1. **Enable GitHub Pages**
   - Go to repository Settings
   - Navigate to Pages
   - Select source: main branch / root
   - Save

2. **Update Config**
```javascript
// js/config.js
const SUPABASE_CONFIG = {
  url: 'https://your-project.supabase.co',
  anonKey: 'your-anon-key'
};
```

3. **Access Your Site**
   - URL will be: `https://username.github.io/savepass/`
   - Update Supabase redirect URLs accordingly

### Option 4: Self-Hosted (VPS/Cloud)

**Best for:** Full control, custom configurations

**Requirements:**
- VPS or cloud server (DigitalOcean, AWS, Azure, etc.)
- Nginx or Apache
- SSL certificate (Let's Encrypt)

**Steps:**

1. **Set up Server**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

2. **Configure Nginx**
```nginx
# /etc/nginx/sites-available/savepass

server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/savepass;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' https://cdn.jsdelivr.net https://*.supabase.co; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;" always;
}
```

3. **Deploy Files**
```bash
# Create directory
sudo mkdir -p /var/www/savepass

# Upload files via SCP or Git
git clone your-repo.git /var/www/savepass

# Set permissions
sudo chown -R www-data:www-data /var/www/savepass
```

4. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/savepass /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

5. **Setup SSL**
```bash
sudo certbot --nginx -d yourdomain.com
```

6. **Auto-renewal**
```bash
sudo certbot renew --dry-run
```

## 🔐 Production Security Checklist

### 1. Environment Variables

**Never commit sensitive data!** Use environment variables for:
- Supabase URL
- Supabase Anon Key
- API keys

For static sites, these will be in the config file, so ensure:
- Repository is private, OR
- Use build-time environment variables

**Netlify/Vercel:**
```bash
# Add via dashboard:
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
```

### 2. Supabase Security

- [ ] Enable RLS on all tables
- [ ] Test RLS policies thoroughly
- [ ] Enable email confirmations (if desired)
- [ ] Configure password requirements
- [ ] Set up rate limiting
- [ ] Enable CAPTCHA for auth (optional)

### 3. Headers & CSP

Add security headers (Netlify example):

Create `netlify.toml`:
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "SAMEORIGIN"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "no-referrer-when-downgrade"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
```

### 4. HTTPS Enforcement

Ensure all traffic uses HTTPS:
- Enable HTTPS redirect in hosting platform
- Update all URLs to use HTTPS
- Test mixed content warnings

## 📊 Post-Deployment

### 1. Testing

Test all features in production:
```
✓ Google OAuth login
✓ Master passphrase setup
✓ Vault unlock/lock
✓ Create/edit/delete credentials
✓ Search and filters
✓ Password generator
✓ Copy to clipboard
✓ Auto-lock functionality
✓ Mobile responsiveness
```

### 2. Monitoring

Set up monitoring for:
- Application errors
- Authentication failures
- Database queries
- Performance metrics

**Supabase Dashboard provides:**
- Authentication logs
- Database queries
- API usage
- Error tracking

### 3. Analytics (Optional)

Add privacy-friendly analytics:
- [Plausible](https://plausible.io)
- [Fathom](https://usefathom.com)
- [Simple Analytics](https://simpleanalytics.com)

**Never use Google Analytics** for a password manager - privacy is paramount.

### 4. Backup Strategy

**Automated Supabase Backups:**
- Free tier: Daily automatic backups (7 days retention)
- Pro tier: Point-in-time recovery

**User Data Export:**
Consider implementing an encrypted export feature for users.

## 🔄 Continuous Deployment

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
        with:
          args: deploy --prod
```

## 🐛 Troubleshooting

### Common Issues

**1. OAuth Redirect Issues**
```
Error: redirect_uri mismatch
```
Solution: Ensure Supabase redirect URLs match exactly, including trailing slashes.

**2. CORS Errors**
```
Access-Control-Allow-Origin error
```
Solution: Check Supabase CORS settings and site URL configuration.

**3. Encryption Failures**
```
Failed to decrypt
```
Solution: Ensure Web Crypto API is available (requires HTTPS in production).

**4. 404 Errors on Refresh**
```
Cannot GET /dashboard.html
```
Solution: Configure redirects in hosting platform.

For Netlify, create `_redirects`:
```
/*  /index.html  200
```

**5. Mixed Content Warnings**
```
Mixed content blocked
```
Solution: Ensure all resources (CSS, JS, fonts) use HTTPS.

## 📈 Performance Optimization

### 1. Enable Compression

**Netlify/Vercel:** Automatic

**Self-hosted Nginx:**
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
```

### 2. Caching

Configure cache headers:
```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. CDN

Use a CDN for:
- Supabase client library
- Fonts (Google Fonts)
- Icons (if using external)

## 🎯 Scaling Considerations

### Database
- Monitor Supabase usage
- Upgrade plan if needed
- Optimize queries
- Index frequently queried columns

### Storage
- Implement data cleanup for inactive users
- Archive old activity logs
- Monitor storage usage

### Authentication
- Monitor auth requests
- Implement rate limiting
- Consider implementing CAPTCHA for signup

## ✅ Final Checklist

Before going live:

- [ ] All features tested in production
- [ ] SSL/HTTPS enabled
- [ ] Security headers configured
- [ ] Google OAuth working
- [ ] Database backups verified
- [ ] Error monitoring setup
- [ ] Performance tested
- [ ] Mobile testing complete
- [ ] Documentation updated
- [ ] Terms of service added (if required)
- [ ] Privacy policy added (if required)

## 🆘 Support

If you encounter issues:
1. Check Supabase dashboard for errors
2. Review browser console for client-side errors
3. Check network tab for failed requests
4. Review this deployment guide
5. Open an issue on GitHub

---

**Congratulations!** 🎉 Your SavePass instance is now live and securing passwords with zero-knowledge encryption.
