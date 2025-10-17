# Domain Setup Guide

This guide explains how to configure your application to work with a proper domain after deployment.

## Overview

Your application needs these domains:
- **Frontend**: `https://yourdomain.com` (Main website)
- **Backend API**: `https://api.yourdomain.com` (API server)

## Step-by-Step Configuration

### 1. Purchase Domain

Buy a domain from:
- Namecheap (Recommended)
- GoDaddy
- Cloudflare Registrar
- Google Domains

Example: `savishkar.tech`

---

### 2. Backend Deployment (Railway/Render)

#### Deploy Backend First
1. Push code to GitHub
2. Connect to Railway/Render
3. Deploy from `server` directory

#### Add Custom Domain
1. In Railway/Render dashboard, go to Settings → Domains
2. Add custom domain: `api.yourdomain.com`
3. You'll get a CNAME target (e.g., `xyz.railway.app`)

#### Environment Variables
Add these in hosting platform:
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/savishkar_db
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

CLIENT_URL=https://yourdomain.com
SERVER_URL=https://api.yourdomain.com

UPI_ID=yourname@upi
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=your_secret
```

---

### 3. Frontend Deployment (Vercel/Netlify)

#### Deploy Frontend
1. Connect GitHub repository to Vercel
2. Set root directory to `client`
3. Framework: Vite
4. Build command: `npm run build`
5. Output directory: `dist`

#### Add Custom Domain
1. In Vercel dashboard, go to Settings → Domains
2. Add domain: `yourdomain.com`
3. Also add: `www.yourdomain.com`

#### Environment Variables
Add in Vercel/Netlify:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

### 4. DNS Configuration

Go to your domain registrar's DNS settings and add these records:

#### For Frontend (yourdomain.com)
```
Type: A or CNAME
Name: @
Value: [Vercel IP or CNAME from Vercel]
TTL: 3600

Type: CNAME
Name: www
Value: cname.vercel-dns.com (or your Vercel CNAME)
TTL: 3600
```

#### For Backend API (api.yourdomain.com)
```
Type: CNAME
Name: api
Value: [Railway/Render CNAME]
TTL: 3600
```

Example DNS Records:
```
@ (root)          A       76.76.21.21 (Vercel IP)
www               CNAME   cname.vercel-dns.com
api               CNAME   savishkar-api.up.railway.app
```

---

### 5. Verify Configuration

#### Test Backend API
```bash
curl https://api.yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Savishkar API is running",
  "timestamp": "2025-10-05T..."
}
```

#### Test Frontend
1. Open `https://yourdomain.com` in browser
2. Check browser console for errors
3. Try signup/login to verify API connection

---

### 6. Update Application URLs

#### Backend (Already configured via environment variables)
The application uses `process.env.CLIENT_URL` and `process.env.SERVER_URL`:
- CORS configuration
- Email links (password reset, verification)
- File upload URLs

#### Frontend (Already configured via environment variables)
The application uses `import.meta.env.VITE_API_URL`:
- API calls
- Authentication
- File uploads

---

## Common DNS Configurations

### Namecheap
1. Go to Domain List → Manage
2. Advanced DNS tab
3. Add records as shown above

### Cloudflare
1. Go to DNS → Records
2. Add records
3. Set Proxy status to "Proxied" for DDoS protection

### GoDaddy
1. Go to DNS Management
2. Add records
3. Wait for propagation (up to 48 hours)

---

## SSL Certificates

### Automatic SSL (Recommended)
Both Vercel and Railway provide automatic SSL certificates:
- Vercel: Automatic via Let's Encrypt
- Railway: Automatic SSL for custom domains
- No configuration needed!

### Verify SSL
```bash
curl -I https://yourdomain.com
curl -I https://api.yourdomain.com
```

Look for: `HTTP/2 200` or `HTTP/1.1 200`

---

## Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
nslookup yourdomain.com
nslookup api.yourdomain.com

# Or use online tool
https://www.whatsmydns.net/
```

Wait 5-30 minutes for DNS propagation.

### CORS Errors
Verify `CLIENT_URL` in backend matches your frontend domain exactly:
```env
CLIENT_URL=https://yourdomain.com
# NOT: https://yourdomain.com/
# NOT: http://yourdomain.com
```

### API Not Accessible
1. Check backend deployment logs
2. Verify environment variables are set
3. Test API health endpoint
4. Check DNS CNAME is correct

### Email Links Wrong Domain
Update backend environment:
```env
CLIENT_URL=https://yourdomain.com
```

Email links use this for:
- Password reset: `${CLIENT_URL}/reset-password/${token}`
- Email verification redirects

### File Upload URLs Wrong
Update backend environment:
```env
SERVER_URL=https://api.yourdomain.com
```

File URLs use this:
```javascript
const avatarUrl = `${SERVER_URL}/uploads/avatars/${filename}`;
```

---

## Environment Variables Checklist

### Backend (.env)
- [ ] `NODE_ENV=production`
- [ ] `CLIENT_URL=https://yourdomain.com` (no trailing slash)
- [ ] `SERVER_URL=https://api.yourdomain.com` (no trailing slash)
- [ ] `MONGODB_URI=mongodb+srv://...`
- [ ] `JWT_SECRET=strong_random_string`
- [ ] `EMAIL_USER` and `EMAIL_PASS` configured
- [ ] Payment credentials added

### Frontend (.env.production)
- [ ] `VITE_API_URL=https://api.yourdomain.com/api` (with /api)

---

## Testing Checklist

After domain setup, test:
- [ ] Frontend loads at `https://yourdomain.com`
- [ ] API responds at `https://api.yourdomain.com/api/health`
- [ ] User signup works
- [ ] OTP email received with correct links
- [ ] Login works
- [ ] Password reset email has correct domain
- [ ] Profile picture upload works
- [ ] Event images load correctly
- [ ] Payment QR codes load correctly
- [ ] No CORS errors in browser console
- [ ] SSL certificate is valid (green padlock)

---

## Example Configuration

### For domain: `savishkar.tech`

#### DNS Records
```
@     A      76.76.21.21 (Vercel)
www   CNAME  cname.vercel-dns.com
api   CNAME  savishkar-api.up.railway.app
```

#### Backend .env
```env
CLIENT_URL=https://savishkar.tech
SERVER_URL=https://api.savishkar.tech
```

#### Frontend .env.production
```env
VITE_API_URL=https://api.savishkar.tech/api
```

#### URLs
- Website: https://savishkar.tech
- API: https://api.savishkar.tech/api
- Health: https://api.savishkar.tech/api/health

---

## Security Notes

### Force HTTPS
Both Vercel and Railway automatically redirect HTTP to HTTPS.

### Update CORS
The application is configured to use `CLIENT_URL` from environment:
```javascript
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
```

### Secure Cookies
For production, consider updating cookie settings:
```javascript
res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
});
```

---

## Need Help?

1. Check deployment logs in Railway/Vercel
2. Verify all environment variables
3. Test API endpoints with curl/Postman
4. Check browser console for errors
5. Verify DNS propagation
6. Ensure SSL certificates are active

---

**Remember**: After changing environment variables, redeploy your application!
