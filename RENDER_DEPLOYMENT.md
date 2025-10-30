# Render Deployment Guide

## 🚀 Quick Deploy

### Backend (Render)

1. **Go to Render Dashboard**
   - Visit: https://render.com/dashboard
   - Click **"New +"** → **"Web Service"**

2. **Connect Repository**
   - Connect: `Sujeet-Pawar/savishkar_With_Changes`
   - Branch: `main`

3. **Configure Service**
   ```
   Name: savishkar-backend
   Region: Singapore
   Branch: main
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

4. **Add Environment Variables**
   ```bash
   NODE_ENV=production
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=dpcypbj7a
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   GMAIL_USER=savishkarjcer@gmail.com
   GMAIL_APP_PASSWORD=your_gmail_app_password
   CLIENT_URL=https://your-frontend-url.vercel.app
   ```

5. **Deploy**
   - Click **"Create Web Service"**
   - Wait 5-10 minutes for deployment
   - Your backend URL: `https://savishkar-backend.onrender.com`

---

### Frontend (Vercel)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click **"Add New"** → **"Project"**

2. **Import Repository**
   - Select: `Sujeet-Pawar/savishkar_With_Changes`

3. **Configure Project**
   ```
   Framework Preset: Vite
   Root Directory: client
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable**
   ```bash
   VITE_API_URL=https://savishkar-backend.onrender.com/api
   ```

5. **Deploy**
   - Click **"Deploy"**
   - Your frontend URL: `https://your-project.vercel.app`

---

## 🔄 Update Backend with Frontend URL

After frontend is deployed:

1. Go to Render Dashboard → Your Service → Environment
2. Update `CLIENT_URL` to your Vercel frontend URL
3. Click **"Save Changes"**
4. Service will automatically redeploy

---

## ✅ Test Deployment

### Backend Health Check
```bash
curl https://savishkar-backend.onrender.com/api/test
```

Expected response:
```json
{
  "success": true,
  "message": "API is working!",
  "timestamp": "2025-10-30T12:00:00.000Z"
}
```

### Rulebook Check
```bash
curl https://savishkar-backend.onrender.com/api/rulebook/info
```

Expected response:
```json
{
  "success": true,
  "available": true,
  "storage": "cloudinary",
  "url": "https://res.cloudinary.com/..."
}
```

---

## 🔧 Local Development

### Start Both Services
```bash
npm run dev
```

This runs:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

### Environment Variables

**Server (.env)**
```bash
MONGODB_URI=your_local_or_atlas_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=dpcypbj7a
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GMAIL_USER=savishkarjcer@gmail.com
GMAIL_APP_PASSWORD=your_app_password
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

**Client (.env)**
```bash
VITE_API_URL=http://localhost:5000/api
```

---

## 📝 Important Notes

### Render Free Tier
- ✅ 750 hours/month free
- ✅ Automatic HTTPS
- ✅ No cold starts after first request
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ First request after spin-down takes ~30 seconds

### MongoDB Atlas
- Make sure IP whitelist includes: `0.0.0.0/0` (allow all)
- Or add Render's IP addresses

### Cloudinary
- Rulebook URL is stored in database
- Run `npm run upload-rulebook` if needed
- Or use the script: `node scripts/setRulebookUrl.js`

---

## 🐛 Troubleshooting

### Backend not starting
1. Check Render logs
2. Verify all environment variables are set
3. Check MongoDB connection string
4. Ensure `0.0.0.0/0` is whitelisted in MongoDB Atlas

### CORS errors
1. Update `CLIENT_URL` in Render environment variables
2. Redeploy the service
3. Clear browser cache

### Rulebook not loading
1. Check if URL is in database: `/api/rulebook/info`
2. Run: `cd server && node scripts/setRulebookUrl.js`
3. Verify Cloudinary credentials

### Email not sending
1. Check Gmail App Password is correct
2. Verify `GMAIL_USER` and `GMAIL_APP_PASSWORD` are set
3. Check Render logs for email errors

---

## 🔄 Redeployment

### Manual Deploy
1. Go to Render Dashboard
2. Click your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Automatic Deploy
- Render automatically deploys when you push to `main` branch
- No additional configuration needed

---

## 📊 Monitoring

### Render Dashboard
- View logs in real-time
- Monitor CPU and memory usage
- Check deployment history

### Health Endpoints
- `/api/test` - Basic health check
- `/api/rulebook/info` - Rulebook availability
- `/api/health` - Detailed system info (if needed)

---

## 🎉 Success Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on Vercel
- [ ] All environment variables set
- [ ] `CLIENT_URL` updated in backend
- [ ] `VITE_API_URL` set in frontend
- [ ] MongoDB Atlas IP whitelist configured
- [ ] Rulebook URL in database
- [ ] Test all API endpoints
- [ ] Test frontend-backend communication
- [ ] Test user registration and login
- [ ] Test file uploads (Cloudinary)
- [ ] Test email sending

---

## 📞 Support

If you encounter issues:
1. Check Render logs
2. Check browser console
3. Verify environment variables
4. Test API endpoints individually
5. Check MongoDB Atlas connection

---

**Deployment Date:** October 30, 2025
**Last Updated:** October 30, 2025
