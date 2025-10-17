# Savishkar Techfest - Deployment Guide

This guide will help you deploy the Savishkar Techfest website to production with a proper domain.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Domain Configuration](#domain-configuration)
6. [Post-Deployment Checklist](#post-deployment-checklist)

---

## Prerequisites

### Required Services
- **Domain Name**: Purchase from providers like Namecheap, GoDaddy, or Cloudflare
- **Backend Hosting**: Choose one:
  - Railway.app (Recommended - Easy deployment)
  - Render.com (Free tier available)
  - DigitalOcean App Platform
  - AWS EC2 / Heroku
- **Frontend Hosting**: Choose one:
  - Vercel (Recommended - Free for personal projects)
  - Netlify
  - Cloudflare Pages
- **MongoDB**: MongoDB Atlas (Free tier available)
- **Email Service**: Gmail with App Password or SendGrid

---

## Environment Configuration

### Backend Environment Variables

1. Copy `.env.example` to `.env` in the `server` directory
2. Update the following variables for production:

```env
# Production Settings
PORT=5000
NODE_ENV=production

# MongoDB Atlas Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/savishkar_db?retryWrites=true&w=majority

# JWT Configuration (Generate a strong secret)
JWT_SECRET=your_very_strong_random_secret_key_here_min_32_chars
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-digit-app-password

# Payment Configuration
UPI_ID=yourname@upi
QR_CODE_URL=/images/payment-qr.png

# Razorpay (Optional)
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret

# IMPORTANT: Update with your actual domains
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com
```

### Frontend Environment Variables

1. Create `.env.production` in the `client` directory:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Backend Deployment

### Option 1: Railway.app (Recommended)

1. **Sign up** at [railway.app](https://railway.app)
2. **Create New Project** → Deploy from GitHub
3. **Connect Repository**: Link your GitHub repository
4. **Configure**:
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**: Copy all variables from `.env`
6. **Custom Domain**:
   - Go to Settings → Domains
   - Add custom domain: `api.yourdomain.com`
   - Update DNS records as instructed

### Option 2: Render.com

1. **Sign up** at [render.com](https://render.com)
2. **New Web Service** → Connect GitHub repository
3. **Configure**:
   - Name: `savishkar-api`
   - Root Directory: `server`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free or Starter
4. **Environment Variables**: Add all from `.env`
5. **Custom Domain**: Add `api.yourdomain.com` in Settings

### Option 3: DigitalOcean App Platform

1. **Create App** from GitHub repository
2. **Configure Component**:
   - Type: Web Service
   - Source Directory: `server`
   - Build Command: `npm install`
   - Run Command: `npm start`
3. **Environment Variables**: Add all variables
4. **Domain**: Configure custom domain in Settings

---

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**:
```bash
npm install -g vercel
```

2. **Deploy**:
```bash
cd client
vercel
```

3. **Configure**:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `client`

4. **Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL=https://api.yourdomain.com/api`

5. **Custom Domain**:
   - Go to Domains → Add Domain
   - Add `yourdomain.com` and `www.yourdomain.com`

### Option 2: Netlify

1. **Sign up** at [netlify.com](https://netlify.com)
2. **New Site from Git** → Connect repository
3. **Build Settings**:
   - Base directory: `client`
   - Build command: `npm run build`
   - Publish directory: `client/dist`
4. **Environment Variables**: Add `VITE_API_URL`
5. **Custom Domain**: Add in Domain Settings

---

## Domain Configuration

### DNS Records Setup

Configure these DNS records with your domain provider:

#### For Frontend (yourdomain.com)
```
Type: A or CNAME
Name: @
Value: [Vercel/Netlify IP or CNAME]

Type: CNAME
Name: www
Value: [Vercel/Netlify CNAME]
```

#### For Backend API (api.yourdomain.com)
```
Type: CNAME
Name: api
Value: [Railway/Render CNAME]
```

### SSL Certificate
- Both Vercel and Railway provide automatic SSL certificates
- Ensure HTTPS is enforced in production

---

## MongoDB Atlas Setup

1. **Create Cluster**:
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Create free cluster
   - Choose region closest to your users

2. **Database Access**:
   - Create database user with password
   - Save credentials securely

3. **Network Access**:
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
   - Or add specific IPs of your hosting provider

4. **Get Connection String**:
   - Click "Connect" → "Connect your application"
   - Copy connection string
   - Replace `<password>` with your password
   - Update `MONGODB_URI` in backend environment variables

---

## Email Configuration (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account → Security → 2-Step Verification
   - Scroll to "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Copy the 16-digit password
3. **Update Environment Variables**:
   ```env
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=xxxx xxxx xxxx xxxx (16-digit app password)
   ```

---

## Post-Deployment Checklist

### Backend Verification
- [ ] API is accessible at `https://api.yourdomain.com/api/health`
- [ ] CORS is configured for your frontend domain
- [ ] MongoDB connection is successful
- [ ] Email service is working (test forgot password)
- [ ] File uploads work (test avatar upload)
- [ ] Environment variables are set correctly
- [ ] SSL certificate is active

### Frontend Verification
- [ ] Website loads at `https://yourdomain.com`
- [ ] All pages are accessible
- [ ] API calls work correctly
- [ ] User registration and login work
- [ ] OTP emails are received
- [ ] Password reset works
- [ ] Profile picture upload works
- [ ] Event registration works
- [ ] Payment flow works
- [ ] Admin panel is accessible

### Security Checklist
- [ ] Change default JWT secret to a strong random string
- [ ] Enable HTTPS only (no HTTP)
- [ ] Set `NODE_ENV=production`
- [ ] Remove console.logs from production code
- [ ] Set secure CORS origins (not wildcard)
- [ ] Enable rate limiting
- [ ] Validate all user inputs
- [ ] Secure MongoDB with strong password
- [ ] Use environment variables for all secrets
- [ ] Enable MongoDB IP whitelist

### Performance Optimization
- [ ] Enable gzip compression
- [ ] Optimize images
- [ ] Enable CDN for static assets
- [ ] Set up caching headers
- [ ] Monitor API response times
- [ ] Set up error logging (e.g., Sentry)

---

## Updating Environment Variables After Deployment

### Update Backend (.env)
```env
# Production URLs
CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Update Frontend (.env.production)
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Update CORS in server.js
The application already handles this via `process.env.CLIENT_URL`, but verify:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
```

---

## Troubleshooting

### API Connection Issues
- Check `VITE_API_URL` in frontend environment variables
- Verify CORS settings in backend
- Check browser console for errors
- Verify API is accessible via curl/Postman

### Email Not Sending
- Verify Gmail App Password is correct
- Check email service logs in backend
- Test with a simple email first
- Ensure 2FA is enabled on Gmail

### Database Connection Failed
- Verify MongoDB connection string
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions
- Check network access settings

### File Upload Issues
- Verify `uploads` directory exists
- Check file size limits
- Ensure `SERVER_URL` is set correctly
- Check multer configuration

### CORS Errors
- Verify `CLIENT_URL` matches your frontend domain exactly
- Include protocol (https://)
- Don't include trailing slash
- Check browser console for specific CORS error

---

## Monitoring & Maintenance

### Recommended Tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry, LogRocket
- **Analytics**: Google Analytics, Plausible
- **Performance**: Lighthouse, WebPageTest

### Regular Maintenance
- Monitor server logs
- Check database size and performance
- Update dependencies regularly
- Backup database weekly
- Review security vulnerabilities
- Monitor API rate limits

---

## Support & Resources

- **MongoDB Atlas**: https://docs.atlas.mongodb.com/
- **Vercel Docs**: https://vercel.com/docs
- **Railway Docs**: https://docs.railway.app/
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html

---

## Quick Deploy Commands

### Build Frontend
```bash
cd client
npm install
npm run build
```

### Start Backend
```bash
cd server
npm install
npm start
```

### Create Admin User (After Deployment)
```bash
cd server
npm run create-admin
```

---

**Note**: Replace all placeholder values (yourdomain.com, API keys, passwords) with your actual production values before deploying.
