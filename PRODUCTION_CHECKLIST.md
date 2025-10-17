# Production Deployment Checklist

## Pre-Deployment

### 1. Environment Variables Setup
- [ ] Create production `.env` file in `server/` directory
- [ ] Set `NODE_ENV=production`
- [ ] Update `CLIENT_URL` to your production domain (e.g., `https://yourdomain.com`)
- [ ] Update `SERVER_URL` to your API domain (e.g., `https://api.yourdomain.com`)
- [ ] Set strong `JWT_SECRET` (minimum 32 characters)
- [ ] Configure MongoDB Atlas connection string
- [ ] Set up Gmail App Password for email service
- [ ] Configure payment gateway credentials (UPI/Razorpay)

### 2. Frontend Configuration
- [ ] Create `.env.production` in `client/` directory
- [ ] Set `VITE_API_URL=https://api.yourdomain.com/api`
- [ ] Test build locally: `cd client && npm run build`
- [ ] Verify `dist` folder is created successfully

### 3. Backend Configuration
- [ ] Verify all routes are working locally
- [ ] Test email sending functionality
- [ ] Test file upload functionality
- [ ] Verify MongoDB connection
- [ ] Test payment integration
- [ ] Create admin user: `cd server && npm run create-admin`

## Deployment Steps

### Backend Deployment (Railway/Render)
- [ ] Push code to GitHub repository
- [ ] Connect repository to hosting platform
- [ ] Set root directory to `server`
- [ ] Configure build command: `npm install`
- [ ] Configure start command: `npm start`
- [ ] Add all environment variables from `.env`
- [ ] Deploy and verify deployment success
- [ ] Test API health endpoint: `https://api.yourdomain.com/api/health`

### Frontend Deployment (Vercel/Netlify)
- [ ] Connect repository to Vercel/Netlify
- [ ] Set root directory to `client`
- [ ] Configure build command: `npm run build`
- [ ] Configure output directory: `dist`
- [ ] Add environment variable: `VITE_API_URL`
- [ ] Deploy and verify deployment success
- [ ] Test website loads: `https://yourdomain.com`

### Domain Configuration
- [ ] Add custom domain to backend hosting (api.yourdomain.com)
- [ ] Add custom domain to frontend hosting (yourdomain.com)
- [ ] Configure DNS records:
  - A/CNAME record for @ → Frontend
  - CNAME record for www → Frontend
  - CNAME record for api → Backend
- [ ] Wait for DNS propagation (5-30 minutes)
- [ ] Verify SSL certificates are active

## Post-Deployment Testing

### Authentication Flow
- [ ] User signup works
- [ ] OTP email is received
- [ ] Email verification works
- [ ] User login works
- [ ] Password reset email is received
- [ ] Password reset works
- [ ] User session persists after refresh

### User Features
- [ ] Profile picture upload works
- [ ] Profile picture displays correctly
- [ ] Dashboard loads with user data
- [ ] Event listing works
- [ ] Event registration works
- [ ] Payment QR code displays
- [ ] Payment screenshot upload works
- [ ] Registration history shows correctly

### Admin Features
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Create event works
- [ ] Edit event works
- [ ] Delete event works
- [ ] View registrations works
- [ ] Update payment status works
- [ ] Export registrations works
- [ ] User management works

### Email Functionality
- [ ] Signup OTP email received
- [ ] Email verification email received
- [ ] Password reset email received
- [ ] Registration confirmation email received
- [ ] Payment confirmation email received

### File Uploads
- [ ] Profile picture upload works
- [ ] Event image upload works
- [ ] Payment screenshot upload works
- [ ] Uploaded files are accessible via URL
- [ ] File size limits are enforced

### Security
- [ ] HTTPS is enforced (no HTTP access)
- [ ] CORS is configured correctly
- [ ] Rate limiting is active
- [ ] Input validation works
- [ ] XSS protection is active
- [ ] SQL injection protection is active
- [ ] JWT tokens expire correctly
- [ ] Passwords are hashed

### Performance
- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Images are optimized
- [ ] No console errors in browser
- [ ] No console warnings in browser

## Monitoring Setup

### Error Tracking
- [ ] Set up Sentry or similar error tracking
- [ ] Test error reporting
- [ ] Configure email alerts for critical errors

### Uptime Monitoring
- [ ] Set up UptimeRobot or similar
- [ ] Monitor frontend: `https://yourdomain.com`
- [ ] Monitor backend: `https://api.yourdomain.com/api/health`
- [ ] Configure downtime alerts

### Analytics
- [ ] Set up Google Analytics or Plausible
- [ ] Verify tracking code is working
- [ ] Set up conversion goals

## Backup & Recovery

### Database Backup
- [ ] Enable automated backups in MongoDB Atlas
- [ ] Test manual backup creation
- [ ] Test database restore process
- [ ] Document backup schedule

### Code Backup
- [ ] Ensure code is pushed to GitHub
- [ ] Tag production release: `git tag v1.0.0`
- [ ] Document deployment process
- [ ] Keep `.env.example` files updated

## Documentation

- [ ] Update README.md with production URLs
- [ ] Document admin credentials (store securely)
- [ ] Document API endpoints
- [ ] Create user guide for admins
- [ ] Document troubleshooting steps

## Final Verification

### URLs to Test
```
Frontend: https://yourdomain.com
API: https://api.yourdomain.com/api/health
Admin: https://yourdomain.com/admin
```

### Test User Accounts
- [ ] Create test user account
- [ ] Test full user journey
- [ ] Create test admin account
- [ ] Test full admin journey

### Load Testing
- [ ] Test with multiple concurrent users
- [ ] Verify database performance
- [ ] Check API rate limits
- [ ] Monitor server resources

## Maintenance Plan

### Daily
- [ ] Check error logs
- [ ] Monitor uptime status
- [ ] Review user registrations

### Weekly
- [ ] Review analytics
- [ ] Check database size
- [ ] Review security logs
- [ ] Test backup restoration

### Monthly
- [ ] Update dependencies
- [ ] Review and optimize performance
- [ ] Check SSL certificate expiry
- [ ] Review user feedback

## Emergency Contacts

```
Domain Registrar: _______________
Frontend Hosting: _______________
Backend Hosting: _______________
Database: MongoDB Atlas
Email Service: Gmail
Payment Gateway: _______________
```

## Rollback Plan

If deployment fails:
1. Revert to previous version on hosting platform
2. Restore database from backup if needed
3. Update DNS if domain changes were made
4. Notify users of maintenance window

---

**Deployment Date**: _______________
**Deployed By**: _______________
**Version**: v1.0.0
**Status**: ⬜ In Progress | ⬜ Completed | ⬜ Issues Found
