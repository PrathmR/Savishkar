# Multiple QR Code Auto-Switching Feature

## Overview
This feature allows admins to add multiple QR codes for each event that automatically switch after reaching a specified payment limit (default: 40 payments per QR code). This helps distribute payment load across multiple accounts.

## Key Features

### 1. **Multiple QR Code Management**
- Add unlimited QR codes per event
- Each QR code has its own:
  - QR code image
  - UPI ID
  - Account name
  - Maximum usage limit (default: 40 payments)
  - Active/Inactive status
  - Usage counter

### 2. **Automatic Switching**
- System automatically switches to the next QR code when current one reaches its limit
- For team events, each team registration counts as **1 payment** (not per team member)
- Tracks which QR code is currently active
- Shows usage statistics (e.g., "35/40 payments used")

### 3. **Payment Tracking**
- Each payment records which QR code was used
- Excel exports include QR code information
- Format: `Account Name (UPI ID) [QR 1]`

### 4. **Backward Compatibility**
- Legacy single QR code system still works
- Events without multiple QR codes use the old payment system
- Seamless migration path

## Database Schema Changes

### Event Model (`server/models/Event.js`)
```javascript
qrCodes: [{
  qrCodeUrl: String,        // URL to QR code image
  upiId: String,            // UPI ID for this QR
  accountName: String,      // Account holder name
  usageCount: Number,       // Current usage count (default: 0)
  maxUsage: Number,         // Max payments before switching (default: 40)
  isActive: Boolean,        // Whether this QR is active
  createdAt: Date
}],
currentQRIndex: Number      // Index of currently active QR code
```

### Payment Model (`server/models/Payment.js`)
```javascript
qrCodeUsed: {
  upiId: String,            // UPI ID that was used
  accountName: String,      // Account name that was used
  qrIndex: Number           // Index of QR code used
}
```

## API Endpoints

### Get Active QR Code
```
GET /api/events/:id/active-qr
```
Returns the currently active QR code for an event.

## Admin Dashboard Usage

### Adding Multiple QR Codes

1. **Navigate to Edit Event**
   - Go to Admin Dashboard → Events
   - Click "Edit" on any event

2. **Add QR Codes**
   - Scroll to "Multiple QR Codes (Auto-Switching)" section
   - Click "Add QR Code" button
   - Upload QR code image
   - Enter UPI ID and Account Name
   - Set maximum usage (default: 40)
   - Mark as Active

3. **Manage QR Codes**
   - View current usage: "35/40 payments"
   - See which QR is currently active (green "Active" badge)
   - See which QRs are full (red "Full" badge)
   - Remove QR codes with the X button
   - Toggle active/inactive status

### Excel Export

When you download registrations as Excel:
- New column: **"QR Code Used"**
- Shows: `Account Name (UPI ID) [QR 1]`
- Example: `Savishkar Account (savishkar@paytm) [QR 2]`
- Shows "N/A" if no QR tracking available

## How It Works

### Payment Flow

1. **User Registers for Event**
   - System fetches the currently active QR code
   - Displays QR code on payment page

2. **User Submits Payment Proof**
   - System records which QR code was used
   - Stores: UPI ID, Account Name, QR Index

3. **Admin Approves Payment**
   - System increments usage count for that QR code
   - If usage reaches limit (e.g., 40), automatically switches to next active QR
   - Logs: `✅ Switched to QR code 2 for event [Event Name]`

4. **Team Events**
   - Each team registration counts as **1 payment**
   - Doesn't matter if team has 2, 3, or 4 members
   - One team = one increment to QR usage counter

### Automatic Switching Logic

```javascript
// When payment is approved:
1. Increment current QR usage count
2. Check if usage >= maxUsage
3. If yes, find next active QR code
4. Switch to that QR code
5. If no more QR codes, keep using current one
```

## Important Notes

### Team Event Counting
- **Team registration = 1 payment** (regardless of team size)
- This is handled automatically by the system
- Each registration (whether individual or team) increments the counter by 1

### QR Code Order
- QR codes are used in the order they appear
- First QR code added is used first
- When it reaches limit, switches to second, then third, etc.

### Inactive QR Codes
- Inactive QR codes are skipped during auto-switching
- Useful for temporarily disabling a payment account
- Can be reactivated anytime

### Legacy Support
- Old events with single QR code continue to work
- No migration needed
- New multi-QR system is optional

## Files Modified

### Backend
1. `server/models/Event.js` - Added qrCodes array and methods
2. `server/models/Payment.js` - Added qrCodeUsed tracking
3. `server/routes/events.js` - Added active-qr endpoint
4. `server/routes/payments.js` - Added QR tracking and auto-switching
5. `server/routes/registrations.js` - Updated Excel export

### Frontend
1. `client/src/pages/admin/EditEvent.jsx` - Added multi-QR UI
2. `client/src/pages/Payment.jsx` - Uses active QR code (already working)

## Testing Checklist

- [ ] Add multiple QR codes to an event
- [ ] Upload QR code images
- [ ] Set different max usage limits
- [ ] Register for event and check which QR is shown
- [ ] Submit payment proof
- [ ] Approve payment and verify usage count increments
- [ ] Verify auto-switching when limit is reached
- [ ] Test with team events (verify counts as 1)
- [ ] Download Excel and check QR code column
- [ ] Test with legacy events (single QR code)
- [ ] Toggle QR active/inactive status
- [ ] Remove QR codes

## Future Enhancements

1. **QR Code Analytics Dashboard**
   - Show usage statistics per QR code
   - Revenue per QR code
   - Most used QR codes

2. **Smart Load Balancing**
   - Distribute payments evenly across all QR codes
   - Not just sequential switching

3. **QR Code Scheduling**
   - Set specific date ranges for each QR code
   - Auto-activate/deactivate based on schedule

4. **Notification System**
   - Alert admin when QR code is about to reach limit
   - Email notification when QR switches

## Support

For issues or questions:
1. Check console logs for QR switching messages
2. Verify QR codes are marked as active
3. Check usage counts in admin dashboard
4. Review Excel export for QR tracking data
