# UTR Uniqueness Implementation

## Overview
This document describes the implementation of UTR (Unique Transaction Reference) number uniqueness constraint in the payment system.

## Changes Made

### 1. Database Schema Changes (`server/models/Payment.js`)
- Added `unique: true` constraint to the `utrNumber` field
- Added `sparse: true` to allow null values while ensuring uniqueness for non-null values
- This ensures that each UTR number can only be used once in the database

```javascript
utrNumber: {
  type: String,
  trim: true,
  unique: true,
  sparse: true // Allows null values but ensures uniqueness for non-null values
}
```

### 2. Backend Validation (`server/routes/payments.js`)

#### Offline Payment Submission (`POST /api/payments/offline`)
- Added pre-save validation to check if UTR already exists
- Returns a 400 error with a clear message if duplicate UTR is detected
- Added MongoDB duplicate key error handling (error code 11000)

#### Payment Verification (`POST /api/payments/verify`)
- Added validation to check for duplicate UTR (excluding the current payment)
- Prevents users from updating a payment with an already-used UTR
- Added duplicate key error handling

### 3. Frontend Updates (`client/src/pages/Payment.jsx`)
- Updated the UTR input field help text to inform users that each UTR must be unique
- Existing error handling already displays backend error messages to users

### 4. Database Migration Script (`server/scripts/addUTRUniqueIndex.js`)
- Created a migration script to add the unique index to existing databases
- Checks for existing duplicate UTR numbers before creating the index
- Provides guidance on resolving duplicates if found

## How It Works

1. **User Submits Payment:**
   - User enters UTR number and uploads payment screenshot
   - Frontend validates the format (12 digits)

2. **Backend Validation:**
   - Backend checks if the UTR number already exists in the database
   - If duplicate is found, returns error: "This UTR number has already been used"
   - If unique, proceeds to save the payment

3. **Database Constraint:**
   - MongoDB enforces uniqueness at the database level
   - Even if validation is bypassed, the database will reject duplicate UTR numbers
   - The `sparse` index allows multiple null values (for payments without UTR)

## Running the Migration

For existing databases, run the migration script to add the unique index:

```bash
cd server
node scripts/addUTRUniqueIndex.js
```

The script will:
1. Check for duplicate UTR numbers in the database
2. Report any duplicates found
3. Create the unique index if no duplicates exist
4. Provide instructions for resolving duplicates if found

## Error Messages

### User-Facing Error
When a user tries to use a duplicate UTR:
```
"This UTR number has already been used. Please verify your UTR number or contact support if you believe this is an error."
```

### Technical Details
- HTTP Status: 400 Bad Request
- MongoDB Error Code: 11000 (Duplicate Key Error)

## Benefits

1. **Data Integrity:** Prevents duplicate payments with the same UTR
2. **Fraud Prevention:** Makes it harder to submit the same payment proof multiple times
3. **Database Level Enforcement:** Ensures uniqueness even if application-level checks fail
4. **User-Friendly:** Clear error messages guide users to resolve issues

## Testing

To test the implementation:

1. Submit a payment with a UTR number (e.g., "123456789012")
2. Try to submit another payment with the same UTR
3. Verify that the second submission is rejected with an appropriate error message

## Notes

- The `sparse: true` option ensures that payments without UTR numbers (e.g., Razorpay payments) are not affected
- Multiple null UTR values are allowed
- Only non-null UTR values must be unique
