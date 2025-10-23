# 💾 Rulebook URL in Database - Complete Guide

## 🎯 What Changed

The rulebook URL is now stored in the **database** instead of environment variables!

### Benefits:
- ✅ **No Environment Variables** - No need to set `RULEBOOK_URL` on Render
- ✅ **Easy Updates** - Update URL through admin panel or API
- ✅ **Automatic** - Upload script saves URL to database automatically
- ✅ **Flexible** - Change URL anytime without redeploying
- ✅ **Admin Control** - Admins can manage all settings in one place

---

## 🚀 Quick Setup (2 Minutes)

### Step 1: Upload Rulebook

```bash
cd server
npm run upload-rulebook
```

**The script will:**
1. Upload PDF to Cloudinary
2. **Automatically save URL to database** ✨
3. Show confirmation

**Output:**
```
✅ Upload Successful!

📊 Upload Details:
────────────────────────────────────────────────────────────
   URL: https://res.cloudinary.com/...
────────────────────────────────────────────────────────────

💾 Saving URL to database...
✅ Connected to database
✅ URL saved to database!
   Key: rulebook_url
   Value: https://res.cloudinary.com/...
✅ Database connection closed

✅ Rulebook is now stored on Cloudinary!
💾 URL saved in database

📋 What Happened:
   1. ✅ Uploaded to Cloudinary
   2. ✅ Saved URL to database (key: rulebook_url)
   3. ✅ Server will automatically fetch from database
```

### Step 2: Deploy to Render

```bash
git add .
git commit -m "Add database storage for rulebook URL"
git push
```

**That's it!** No environment variables needed.

### Step 3: Test

```bash
# Check info
curl https://your-app.onrender.com/api/rulebook/info

# Download
curl https://your-app.onrender.com/api/rulebook/download -o test.pdf
```

---

## 📊 How It Works

### Database Storage

**Settings Collection:**
```javascript
{
  key: "rulebook_url",
  value: "https://res.cloudinary.com/YOUR_CLOUD/raw/upload/v123/savishkar/documents/rulebook.pdf",
  description: "Cloudinary URL for the event rulebook PDF",
  category: "documents",
  isPublic: true,
  updatedBy: ObjectId("..."),
  createdAt: "2025-01-22T12:00:00.000Z",
  updatedAt: "2025-01-22T12:00:00.000Z"
}
```

### Flow Diagram

```
User requests rulebook
        ↓
/api/rulebook/download
        ↓
Fetch URL from database (key: "rulebook_url")
        ↓
   URL found? ────Yes──→ Redirect to Cloudinary URL
        ↓                (Fast CDN delivery)
       No
        ↓
   Serve from local file
   (Fallback)
```

### Advantages Over Environment Variables

| Feature | Environment Variable | Database |
|---------|---------------------|----------|
| Setup | Set on Render | Automatic |
| Update | Redeploy needed | Instant update |
| Admin Access | No | Yes (via API/panel) |
| Version Control | No | Yes (with timestamps) |
| Multiple Values | One per env | Unlimited settings |
| Audit Trail | No | Yes (updatedBy field) |

---

## 🔄 Updating the Rulebook

### Option 1: Re-upload (Recommended)

```bash
# 1. Replace file
cp /path/to/new/rulebook.pdf server/uploads/rulebook.pdf

# 2. Re-upload (automatically updates database)
cd server
npm run upload-rulebook

# 3. Done! New URL saved to database automatically
```

### Option 2: Update via API (Manual)

```bash
# Update the URL directly
curl -X PUT https://your-app.onrender.com/api/admin/settings/rulebook_url \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "value": "https://res.cloudinary.com/NEW_URL",
    "description": "Updated rulebook URL"
  }'
```

### Option 3: Update via Admin Panel (Future)

Once you build an admin panel, admins can update the URL through the UI.

---

## 🔧 Admin API Endpoints

### Get All Settings

```bash
GET /api/admin/settings
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "count": 1,
  "settings": [
    {
      "_id": "...",
      "key": "rulebook_url",
      "value": "https://res.cloudinary.com/...",
      "description": "Cloudinary URL for the event rulebook PDF",
      "category": "documents",
      "isPublic": true,
      "updatedBy": "...",
      "createdAt": "2025-01-22T12:00:00.000Z",
      "updatedAt": "2025-01-22T12:00:00.000Z"
    }
  ]
}
```

### Get Specific Setting

```bash
GET /api/admin/settings/rulebook_url
Authorization: Bearer {admin_token}
```

**Response:**
```json
{
  "success": true,
  "setting": {
    "key": "rulebook_url",
    "value": "https://res.cloudinary.com/...",
    "description": "Cloudinary URL for the event rulebook PDF",
    "category": "documents",
    "isPublic": true
  }
}
```

### Update Setting

```bash
PUT /api/admin/settings/rulebook_url
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "value": "https://res.cloudinary.com/NEW_URL",
  "description": "Updated rulebook URL",
  "category": "documents",
  "isPublic": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Setting updated successfully",
  "setting": { ... }
}
```

### Create Setting

```bash
POST /api/admin/settings
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "key": "new_setting",
  "value": "some_value",
  "description": "Description",
  "category": "general",
  "isPublic": false
}
```

### Delete Setting

```bash
DELETE /api/admin/settings/rulebook_url
Authorization: Bearer {admin_token}
```

---

## 🧪 Testing

### Test Upload Script

```bash
cd server
npm run upload-rulebook
```

**Check output for:**
- ✅ Upload successful
- ✅ Connected to database
- ✅ URL saved to database

### Test API Endpoints

**Check if URL is in database:**
```bash
curl http://localhost:5000/api/rulebook/info
```

**Should show:**
```json
{
  "storage": "cloudinary",
  "url": "https://res.cloudinary.com/...",
  "message": "Rulebook hosted on Cloudinary CDN"
}
```

**Download rulebook:**
```bash
curl http://localhost:5000/api/rulebook/download -o test.pdf
```

### Test Admin API

**Get settings (requires admin token):**
```bash
# Login as admin first
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'

# Use token from response
curl http://localhost:5000/api/admin/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚨 Troubleshooting

### Issue 1: "Could not save to database"

**Symptoms:**
```
⚠️  Could not save to database: ...
💡 You can manually add it via admin panel or API
```

**Causes:**
- Database connection failed
- MONGO_URI not set
- Network issues

**Solutions:**

1. **Check MONGO_URI:**
```bash
# In server/.env
cat .env | grep MONGO_URI
```

2. **Test database connection:**
```bash
cd server
npm run dev
# Check logs for "MongoDB Connected"
```

3. **Manually add via API:**
```bash
curl -X POST http://localhost:5000/api/admin/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "rulebook_url",
    "value": "https://res.cloudinary.com/YOUR_URL",
    "description": "Cloudinary URL for rulebook",
    "category": "documents",
    "isPublic": true
  }'
```

### Issue 2: Rulebook Still Serving from Local

**Symptoms:**
- `/api/rulebook/info` shows `"storage": "local"`
- Upload was successful

**Solutions:**

1. **Check if URL is in database:**
```bash
# Via API
curl http://localhost:5000/api/admin/settings/rulebook_url \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

2. **Check database directly:**
```javascript
// In MongoDB shell or Compass
db.settings.findOne({ key: "rulebook_url" })
```

3. **Restart server:**
```bash
# Server might be caching
npm run dev
```

### Issue 3: "Setting not found"

**Symptoms:**
```
GET /api/admin/settings/rulebook_url
{
  "success": false,
  "message": "Setting not found"
}
```

**Solutions:**

1. **Run upload script again:**
```bash
npm run upload-rulebook
```

2. **Or create manually:**
```bash
curl -X POST http://localhost:5000/api/admin/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "rulebook_url",
    "value": "YOUR_CLOUDINARY_URL",
    "category": "documents",
    "isPublic": true
  }'
```

---

## 📋 Migration from Environment Variable

If you previously used `RULEBOOK_URL` environment variable:

### Step 1: Get Current URL

```bash
# On Render
Check Environment tab for RULEBOOK_URL value
```

### Step 2: Add to Database

```bash
# Via upload script (if you have the PDF)
npm run upload-rulebook

# Or via API
curl -X POST https://your-app.onrender.com/api/admin/settings \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "key": "rulebook_url",
    "value": "YOUR_EXISTING_CLOUDINARY_URL",
    "category": "documents",
    "isPublic": true
  }'
```

### Step 3: Remove Environment Variable (Optional)

1. Go to Render Dashboard → Environment
2. Remove `RULEBOOK_URL` variable
3. Save changes
4. Redeploy

**Note:** The system will work with both database and environment variable. Database takes priority.

---

## 🎯 Best Practices

### 1. Use Upload Script

Always use `npm run upload-rulebook` to upload. It automatically:
- Uploads to Cloudinary
- Saves URL to database
- Shows confirmation

### 2. Keep Local Backup

Keep `server/uploads/rulebook.pdf` as fallback:
- Works if database is down
- Useful for local development
- Emergency backup

### 3. Version Control

The Settings model tracks:
- `updatedBy` - Who updated it
- `updatedAt` - When it was updated
- `createdAt` - When it was created

### 4. Public Access

Set `isPublic: true` for rulebook_url so it can be accessed without authentication (if needed in future).

### 5. Regular Backups

Backup your settings collection:
```bash
mongodump --uri="YOUR_MONGO_URI" --collection=settings
```

---

## ✅ Deployment Checklist

### Initial Setup:
- [ ] Run `npm run upload-rulebook`
- [ ] Verify "URL saved to database" message
- [ ] Test `/api/rulebook/info` endpoint
- [ ] Commit and push code changes
- [ ] Deploy to Render
- [ ] Test on production

### For Updates:
- [ ] Replace `server/uploads/rulebook.pdf`
- [ ] Run `npm run upload-rulebook`
- [ ] Verify new URL in database
- [ ] Test download
- [ ] No deployment needed!

---

## 🎉 Summary

**What You Have Now:**
1. ✅ Rulebook URL stored in database
2. ✅ Automatic upload → database save
3. ✅ Admin API to manage settings
4. ✅ No environment variables needed
5. ✅ Easy updates without redeployment

**To Use:**
```bash
# Upload rulebook
npm run upload-rulebook

# Deploy
git push

# Update rulebook (anytime)
npm run upload-rulebook
# Done! No redeploy needed
```

**Admin Features:**
- View all settings
- Update rulebook URL
- Track who changed what
- Manage other settings

---

**Time to Setup:** 2 minutes  
**Environment Variables:** None needed  
**Flexibility:** Update anytime  
**Recommended:** ✅ Yes, best approach!
