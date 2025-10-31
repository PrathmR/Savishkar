# Cloudinary & Rulebook Fixes

## Issues Fixed

### 1. Cloudinary Images Not Loading Properly
**Problem:** Images from Cloudinary were not displaying correctly, possibly due to HTTP/HTTPS protocol issues.

**Solution:**
- Updated `client/src/utils/imageUtils.js` to ensure all Cloudinary URLs use HTTPS
- Added proper URL validation and protocol conversion
- Maintained backward compatibility with local storage paths

### 2. Rulebook PDF Not Showing in Modal
**Problem:** The rulebook PDF viewer was not displaying the PDF properly from Cloudinary.

**Solutions Implemented:**
- Enhanced PDF proxy function in `server/routes/rulebook.js` with:
  - Forced HTTPS for Cloudinary URLs
  - Better error handling and fallback to local storage
  - Improved CORS headers for cross-origin requests
  - Added timeout handling (30 seconds)
  - Better status code checking
  - Enhanced logging for debugging

- Added CORS preflight handling (OPTIONS requests)
- Improved iframe error handling in the frontend
- Added fallback UI for PDF loading failures

## Files Modified

### Backend
1. **`server/routes/rulebook.js`**
   - Enhanced `proxyCloudinaryPDF` function
   - Added CORS preflight handler
   - Improved error handling with fallback
   - Added request timeout
   - Better logging

### Frontend
2. **`client/src/utils/imageUtils.js`**
   - Added HTTPS enforcement for Cloudinary URLs
   - Improved URL validation

3. **`client/src/pages/Home.jsx`**
   - Added error handling for PDF iframe
   - Added fallback UI for PDF loading failures

### Diagnostic Tools
4. **`server/scripts/checkCloudinaryImages.js`** (NEW)
   - Script to check Cloudinary configuration
   - Lists all events and their image types
   - Shows rulebook status
   - Provides summary statistics

## How to Use

### Check Cloudinary Status
Run this command to diagnose image and rulebook issues:
```bash
cd server
npm run check-cloudinary
```

This will show:
- Cloudinary configuration status
- List of all events with their image types (Cloudinary/Local/None)
- Rulebook URL and type
- Summary statistics

### Import Events from CSV
If you need to import events:
```bash
cd server
npm run import-events
```

## Testing Checklist

- [ ] Cloudinary images load on Events page
- [ ] Event images display in admin dashboard
- [ ] Rulebook modal opens and displays PDF
- [ ] Rulebook download button works
- [ ] PDF displays properly in iframe
- [ ] Fallback works if PDF fails to load
- [ ] CORS errors are resolved
- [ ] HTTPS is enforced for Cloudinary URLs

## Environment Variables Required

Make sure these are set in your `.env` file:
```env
USE_CLOUDINARY=true
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Troubleshooting

### If images still don't load:
1. Run `npm run check-cloudinary` to verify configuration
2. Check browser console for CORS errors
3. Verify Cloudinary URLs are using HTTPS
4. Check if `USE_CLOUDINARY=true` in `.env`

### If rulebook doesn't display:
1. Check if rulebook URL is stored in database
2. Verify the URL is accessible
3. Check browser console for errors
4. Try downloading instead of viewing
5. Check server logs for proxy errors

### If you need to upload rulebook to Cloudinary:
```bash
cd server
npm run upload-rulebook
```

## Additional Notes

- All Cloudinary URLs are now forced to use HTTPS for security
- PDF proxy has a 30-second timeout
- Fallback to local storage if Cloudinary fails
- CORS headers properly configured for cross-origin requests
- Better error messages and logging for debugging
