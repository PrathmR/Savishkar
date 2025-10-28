# Team Event Registration Updates

## Overview
Updated team event registration to require only the team leader to have a Savishkar account, while other team members can be added without accounts.

## Key Changes

### 1. **Team Leader Requirements**
- ✅ Team leader MUST have a Savishkar account (login required)
- ✅ Team leader's information is auto-filled as Member 1
- ✅ Team leader cannot be removed from the team

### 2. **Other Team Members**
- ✅ Do NOT need Savishkar accounts
- ✅ Can be added by the team leader with just their details:
  - Name (required)
  - Email (required)
  - Phone (required)
  - College (optional)
- ✅ No phone verification required for team members
- ✅ No separate registration needed

### 3. **Email Notifications**
- ✅ Confirmation email sent ONLY to team leader
- ✅ Email includes complete team member details:
  - Team name
  - All team members with their contact information
  - Team leader clearly marked as "Team Leader - You"
  - Registration number and event details

### 4. **Registration Flow**

#### For Team Leader:
1. Login to Savishkar account
2. Navigate to team event
3. Click "Register Now"
4. Team modal opens with leader's info auto-filled as Member 1
5. Enter team name
6. Add other team members (without requiring their accounts)
7. Submit registration
8. Receive confirmation email with all team details

#### For Other Team Members:
- No action required
- Team leader adds their information
- They will be part of the team without needing a Savishkar account

### 5. **UI Updates**

**Team Registration Modal:**
- Header shows: "Only the team leader needs a Savishkar account. Other members don't need to register separately."
- Member 1 (Team Leader) is auto-filled and read-only
- Other members can be added/removed freely
- Clear visual distinction for team leader (green background)

### 6. **Backend Changes**

**Email Template (`server/routes/registrations.js`):**
```javascript
// Team members list included in email
${registration.teamMembers.map((member, idx) => `
  <div>
    <strong>${idx + 1}. ${member.name}</strong> ${idx === 0 ? '(Team Leader - You)' : ''}
    📧 ${member.email} | 📱 ${member.phone}
    ${member.college ? `🏫 ${member.college}` : ''}
  </div>
`).join('')}
```

**Key Points:**
- Email sent to `req.user.email` (team leader only)
- All team member details included in the email
- No separate emails to other team members

### 7. **Benefits**

1. **Simplified Registration**: Team members don't need to create accounts
2. **Faster Process**: Team leader can register entire team at once
3. **Single Point of Contact**: All communication goes to team leader
4. **No Phone Verification**: Streamlined process for team members
5. **Clear Responsibility**: Team leader manages the entire team

### 8. **Important Notes**

- ⚠️ Team leader is responsible for ensuring accurate team member information
- ⚠️ Only team leader receives confirmation email
- ⚠️ Team leader should share registration details with team members
- ⚠️ Payment (if applicable) is handled by team leader
- ⚠️ Team leader's Savishkar account is linked to the registration

## Files Modified

1. **Backend:**
   - `server/routes/registrations.js` - Enhanced email template with team member details

2. **Frontend:**
   - `client/src/pages/EventDetails.jsx` - Added informational note about account requirements

## Testing Checklist

- [ ] Team leader can login and register for team event
- [ ] Team leader's info auto-fills as Member 1
- [ ] Can add multiple team members without accounts
- [ ] Confirmation email sent only to team leader
- [ ] Email includes all team member details
- [ ] Team registration saves correctly in database
- [ ] Payment flow works for team registrations
- [ ] Team leader can view registration in dashboard
