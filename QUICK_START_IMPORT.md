# Quick Start: Import Events from CSV

## 🚀 Fastest Way to Import Events

### Option 1: Web Tool (Easiest)

1. **Start your server**:
   ```bash
   cd D:\code3\server
   npm run dev
   ```

2. **Get your admin token**:
   - Open your website in browser
   - Login as admin
   - Press F12 (DevTools)
   - In Console, type: `localStorage.getItem('token')`
   - Copy the token (without quotes)

3. **Open the import tool**:
   - Double-click: `D:\code3\import-events.html`

4. **Import**:
   - Paste your token
   - Click "Import Events"
   - Done! ✅

### Option 2: API Call (Postman/Thunder Client)

```
POST http://localhost:5000/api/admin/import-events-csv
Headers:
  Authorization: Bearer YOUR_ADMIN_TOKEN
  Content-Type: application/json
```

### Option 3: Command Line

```bash
cd D:\code3\server
npm run import-events
```

## 📊 What Gets Imported

From `Savishkar detail final submission form (Responses).csv`:
- ✅ ~40+ unique events
- ✅ Organized by departments (CSE, ECE, Mech, AIML, MBA, Common)
- ✅ Categories (Technical, Non-Technical, Cultural)
- ✅ Event details (date, time, venue, fees, prizes)
- ✅ Coordinator information
- ✅ Team size and participant limits

## 🎯 Expected Result

```json
{
  "success": true,
  "message": "Successfully imported 40 events",
  "stats": {
    "totalParsed": 40,
    "successCount": 40,
    "errorCount": 0,
    "byDepartment": {
      "AIML": 4,
      "CSE": 10,
      "Common": 10,
      "ECE": 8,
      "MBA": 2,
      "Mech": 8
    }
  }
}
```

## ✅ Verify Import

Check events in browser:
```
http://localhost:5000/api/events
```

Or run:
```bash
cd server
node scripts/checkEvents.js
```

## 📝 Notes

- Safe to run multiple times (updates existing events)
- Duplicates are automatically handled
- Events are organized by department
- Ready for registration immediately after import

## 🆘 Need Help?

See full documentation: `EVENT_IMPORT_GUIDE.md`
