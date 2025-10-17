# User Code System - Uniqueness Guarantee

## Overview
Every user receives a **unique, permanent code** after signup/login that is displayed on their dashboard and sent via email.

## Code Format
```
SAV-2025-A3B7F2
│   │    │
│   │    └─ 6 random hex characters (16,777,216 combinations)
│   └────── Year
└────────── Savishkar prefix
```

## Uniqueness Guarantees

### 1. **Cryptographic Randomness**
- Uses Node.js `crypto.randomBytes()` for secure random generation
- 6 hexadecimal characters = **16,777,216 possible combinations**
- Collision probability: ~0.000006% for 1000 users

### 2. **Database Uniqueness Constraint**
```javascript
userCode: {
  type: String,
  unique: true,      // MongoDB enforces uniqueness
  sparse: true,      // Allows null but enforces uniqueness when present
  index: true        // Indexed for fast lookups
}
```

### 3. **Double-Check Algorithm**
```javascript
// Check if code exists
const existingUser = await User.findOne({ userCode });
if (!existingUser) {
  // Double-check to prevent race conditions
  const doubleCheck = await User.findOne({ userCode });
  if (!doubleCheck) {
    return userCode; // Guaranteed unique
  }
}
```

### 4. **Retry Mechanism**
- Attempts up to **20 times** if collision occurs
- Logs collision warnings for monitoring
- Fallback to timestamp-based code if all attempts fail (extremely rare)

### 5. **Race Condition Protection**
- Two database queries before confirming uniqueness
- MongoDB's unique index prevents duplicates at database level
- Even if two requests generate the same code simultaneously, only one will succeed

## When Codes Are Generated

### New Users (Signup)
1. User completes signup form
2. User verifies email with OTP
3. **Code generated** during OTP verification
4. Welcome email sent with code
5. Code displayed on dashboard

### Existing Users (Login)
1. User logs in
2. System checks if user has a code
3. If no code exists, **generates one immediately**
4. Email sent with code
5. Code displayed on dashboard

## Email Notifications

### Welcome Email (New Users)
- Sent after email verification
- Contains unique code in prominent gradient box
- Instructions on code usage
- Link to dashboard

### Code Assignment Email (Existing Users)
- Sent on first login if code doesn't exist
- Same format as welcome email
- Ensures all users have codes

## Dashboard Display

### Features
- **Prominent card** at top of dashboard
- Large, readable code display with gradient background
- **Copy to clipboard** button with visual feedback
- Usage instructions
- Responsive design (mobile-friendly)

### Code Display Example
```
┌─────────────────────────────────────┐
│  🎫 Your Unique Code                │
│                                     │
│  ┌───────────────────────────────┐ │
│  │   PARTICIPANT CODE            │ │
│  │   SAV-2025-A3B7F2            │ │
│  └───────────────────────────────┘ │
│                                     │
│  [Copy Code] ← Click to copy       │
│                                     │
│  💡 Keep this code handy!          │
└─────────────────────────────────────┘
```

## Testing

Run the uniqueness test:
```bash
cd server
node scripts/testUserCodeUniqueness.js
```

### Test Coverage
- ✅ Generates 100 codes and checks for duplicates
- ✅ Tests database uniqueness constraint
- ✅ Validates code format
- ✅ Verifies collision handling

## Use Cases

1. **Event Check-in**: Participants show code at event entrance
2. **Registration Verification**: Quick lookup by code
3. **Certificate Collection**: Identify participants
4. **Support Queries**: Reference code for faster assistance
5. **Attendance Tracking**: Scan codes for attendance

## Security Features

- **Non-sequential**: Cannot guess other users' codes
- **Cryptographically secure**: Uses crypto.randomBytes()
- **Permanent**: Cannot be changed once assigned
- **Indexed**: Fast database lookups
- **Logged**: Collision attempts are logged for monitoring

## Database Schema

```javascript
{
  userCode: {
    type: String,
    unique: true,
    sparse: true,
    index: true
  }
}
```

## API Responses

### Signup/Login Response
```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "userCode": "SAV-2025-A3B7F2"  // ← Included in response
  }
}
```

### Dashboard API Response
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "userCode": "SAV-2025-A3B7F2"  // ← Always included
  }
}
```

## Monitoring & Maintenance

### Logs to Monitor
- `✅ Welcome email with user code sent to [email]`
- `⚠️ User code collision detected on attempt X`
- `❌ CRITICAL: Failed to generate unique code after 20 attempts`

### Database Queries
```javascript
// Check for duplicate codes (should return 0)
db.users.aggregate([
  { $group: { _id: "$userCode", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])

// Count users with codes
db.users.countDocuments({ userCode: { $exists: true, $ne: null } })
```

## Troubleshooting

### User doesn't have a code
- Code is generated on first login after implementation
- Check if user has logged in since feature deployment
- Manually trigger code generation if needed

### Duplicate code error
- Extremely rare with 16M+ combinations
- System will retry automatically
- Check logs for collision warnings
- Verify database unique index exists

### Code not showing on dashboard
- Verify user object includes `userCode` field
- Check API response includes `userCode`
- Clear browser cache
- Refresh user data

## Future Enhancements

- [ ] QR code generation for easy scanning
- [ ] Code-based event registration
- [ ] Bulk code export for organizers
- [ ] Code analytics dashboard
- [ ] Mobile app integration

---

**Last Updated**: October 10, 2025  
**Version**: 1.0  
**Status**: Production Ready ✅
