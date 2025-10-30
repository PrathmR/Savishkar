# Database Management Scripts

This directory contains scripts for managing the Savishkar database. Each script can be run independently to clear specific collections.

## Available Scripts

### 1. Clear Entire Database (Except Admins)
```bash
npm run clear-db
```
**What it does:**
- Deletes all notifications
- Deletes all payments
- Deletes all registrations
- Deletes all events
- Deletes all non-admin users
- **Keeps admin users intact**

**Use case:** Complete database reset while preserving admin accounts

---

### 2. Clear Users
```bash
npm run clear-users
```
**What it does:**
- Deletes all non-admin users
- **Keeps admin users intact**
- Shows count of deleted users
- Displays remaining admin users

**Use case:** Remove all regular users while keeping admins

---

### 3. Clear Events
```bash
npm run clear-events
```
**What it does:**
- Deletes all events (Technical, Non-Technical, Workshops)
- Shows breakdown by category before deletion
- Lists all event names being deleted

**Use case:** Remove all events from the system

---

### 4. Clear Registrations
```bash
npm run clear-registrations
```
**What it does:**
- Deletes all event registrations
- Shows breakdown by payment status
- Shows count of team registrations

**Use case:** Remove all event registrations

---

### 5. Clear Payments
```bash
npm run clear-payments
```
**What it does:**
- Deletes all payment records
- Shows breakdown by status (completed, pending, failed)

**Use case:** Remove all payment records

---

### 6. Clear Notifications
```bash
npm run clear-notifications
```
**What it does:**
- Deletes all email notifications
- Shows breakdown by status (sent, failed)

**Use case:** Remove all notification logs

---

### 7. Clear Settings
```bash
npm run clear-settings
```
**What it does:**
- Deletes all application settings
- ⚠️ **Warning:** May require recreating default settings

**Use case:** Reset application settings (use with caution)

---

## Usage Examples

### From Server Directory
```bash
cd server
npm run clear-users
npm run clear-events
npm run clear-registrations
```

### From Root Directory
```bash
cd server && npm run clear-db
```

### Clear Multiple Collections
```bash
cd server
npm run clear-registrations
npm run clear-payments
npm run clear-notifications
```

---

## Script Features

### All scripts include:
- ✅ MongoDB connection handling
- ✅ Environment variable validation
- ✅ Detailed status reporting before deletion
- ✅ Count of deleted items
- ✅ Success/error messages
- ✅ Automatic process exit

### Safety Features:
- 🔒 Admin users are NEVER deleted (except in clear-db)
- 📊 Shows current status before deletion
- ✅ Confirms deletion count
- ⚠️ Clear warnings for destructive operations

---

## Important Notes

### ⚠️ Warning
These scripts perform **PERMANENT DELETIONS**. Data cannot be recovered after running these scripts.

### Best Practices
1. **Backup your database** before running any clear scripts
2. Run in **development environment** first
3. Verify the script output before confirming
4. Use specific scripts instead of `clear-db` when possible

### Recommended Order for Complete Reset
If you want to clear everything in the correct order:

```bash
cd server
npm run clear-notifications    # 1. Clear notifications first
npm run clear-payments         # 2. Clear payments
npm run clear-registrations    # 3. Clear registrations
npm run clear-events           # 4. Clear events
npm run clear-users            # 5. Clear users (keeps admins)
```

Or simply:
```bash
npm run clear-db  # Does all of the above in one command
```

---

## Script Output Examples

### Clear Users Output:
```
✅ MongoDB Connected

🗑️  Clearing Users Collection...

📊 Current Status:
   - Total Users: 150
   - Admin Users: 2
   - Regular Users: 148

✅ Deleted 148 non-admin users
✅ Kept 2 admin user(s)

👤 Remaining Admin Users:

1. Admin Name
   Email: admin@example.com
   Phone: 1234567890
   College: Example College

✅ Users collection cleared successfully!
```

### Clear Events Output:
```
✅ MongoDB Connected

🗑️  Clearing Events Collection...

📊 Current Status:
   - Total Events: 25
   - Technical: 15
   - Non-Technical: 8
   - Workshops: 2

📋 Events to be deleted:
   1. Code Sprint (Technical)
   2. Web Design (Technical)
   3. Dance Competition (Non-Technical)
   ...

✅ Deleted 25 events

✅ Events collection cleared successfully!
```

---

## Troubleshooting

### Error: "MONGODB_URI not found"
**Solution:** Ensure `.env` file exists in the `server` directory with `MONGO_URI` or `MONGODB_URI` variable.

### Error: "Cannot connect to MongoDB"
**Solution:** 
1. Check your MongoDB connection string
2. Ensure MongoDB server is running
3. Verify network connectivity

### Script hangs or doesn't exit
**Solution:** Press `Ctrl+C` to force exit, then check MongoDB connection.

---

## Development vs Production

### Development
- Safe to use all scripts
- Recommended for testing

### Production
- ⚠️ **USE WITH EXTREME CAUTION**
- Always backup before running
- Consider using database snapshots
- Test in staging environment first

---

## Migration Scripts

### 8. Migrate Department Names
```bash
node scripts/migrateDepartments.js
```
**What it does:**
- Updates old department names to new standardized names
- Maps: "Mechanical" → "Mech", "Computer Science" → "CSE", etc.
- Shows detailed migration report
- Fixes enum validation errors

**Use case:** After updating department enum values, run this to fix existing events

**Mapping:**
- `Mechanical` → `Mech`
- `Computer Science` / `Computer Science and Engineering` → `CSE`
- `Electronics` / `Electronics and Communication` → `ECE`
- `Artificial Intelligence and Machine Learning` / `AI/ML` → `AIML`
- `Civil Engineering` → `Civil`
- `Management` / `Business Administration` → `MBA`
- `Applied Sciences` → `Applied Science`
- `General` / `All` → `Common`

---

## Related Scripts

- `npm run create-admin` - Create a new admin user
- `npm run setup-cloudinary` - Setup Cloudinary configuration
- `npm run test-email` - Test email configuration

---

## Support

For issues or questions about these scripts, please contact the development team or refer to the main project documentation.
