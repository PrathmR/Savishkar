# Event Import Guide

## Overview
This guide explains how to import events from the CSV file `Savishkar detail final submission form (Responses).csv` into the website database.

## Files Involved
- **CSV File**: `D:\code3\Savishkar detail final submission form (Responses).csv`
- **API Endpoint**: `/api/admin/import-events-csv` in `server/routes/admin.js`
- **Import Tool**: `import-events.html` (web-based tool)
- **Scripts**: 
  - `server/scripts/importEventsFromCSV.js` (Node.js script)
  - `server/scripts/seedEventsFromCSV.js` (Alternative script)

## Method 1: Using the Web-Based Tool (Recommended)

### Steps:
1. **Start the server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Login as admin** in your browser:
   - Go to `http://localhost:5173` (or your client URL)
   - Login with admin credentials
   - Open browser DevTools (F12)
   - Go to Console and type: `localStorage.getItem('token')`
   - Copy the token value (without quotes)

3. **Open the import tool**:
   - Open `D:\code3\import-events.html` in your browser
   - Or navigate to it via file:/// protocol

4. **Import events**:
   - Paste your admin token in the "Admin Token" field
   - Verify the API URL is correct (default: `http://localhost:5000/api/admin/import-events-csv`)
   - Click "Import Events"
   - Wait for the import to complete

5. **Review results**:
   - The tool will show:
     - Total events parsed
     - Successfully imported count
     - Error count (if any)
     - Events breakdown by department

## Method 2: Using Node.js Script

### Steps:
1. **Ensure MongoDB is running** and `.env` file is configured

2. **Run the import script**:
   ```bash
   cd server
   npm run import-events
   ```
   
   Or directly:
   ```bash
   node scripts/importEventsFromCSV.js
   ```

3. **Check the console output** for import results

## Method 3: Using API Directly (Postman/cURL)

### Using Postman:
1. Create a new POST request
2. URL: `http://localhost:5000/api/admin/import-events-csv`
3. Headers:
   - `Authorization`: `Bearer YOUR_ADMIN_TOKEN`
   - `Content-Type`: `application/json`
4. Send the request
5. Review the JSON response

### Using cURL:
```bash
curl -X POST http://localhost:5000/api/admin/import-events-csv \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

## Data Mapping

The CSV columns are mapped to the Event model as follows:

| CSV Column | Event Field | Processing |
|------------|-------------|------------|
| Event name | name | Direct mapping |
| Short description | shortDescription | Direct mapping |
| Full description | description | Direct mapping |
| Event Category | category | Normalized to: Technical, Non-Technical, Cultural |
| Event department | department | Normalized to: AIML, CSE, ECE, Mech, Civil, MBA, Common |
| Event date | date | Parsed from MM/DD/YYYY format |
| Event start time | time | Direct mapping |
| Venue | venue | Direct mapping |
| Registration fee | registrationFee | Extracted number |
| Maximum team slots | maxParticipants | Extracted number |
| Team size | teamSize.min, teamSize.max | Parsed from text |
| Prizes | prizes.first, prizes.second, prizes.third | Extracted amounts |
| Event Coordinators Name | coordinators[].name | Split by comma/& |
| Event Coordinators contact number | coordinators[].phone | Split by comma/& |
| Event Coordinators E-mail | coordinators[].email | Split by comma/& |

## Default Values

- **Rules**: Empty array (can be added later)
- **Eligibility**: ["Open to all students"]
- **isActive**: true
- **status**: "upcoming"
- **onlineRegistrationOpen**: true
- **Images**: Category-based placeholder images from Unsplash

## Department Mapping

| CSV Value | Database Value |
|-----------|----------------|
| AIML | AIML |
| CSE | CSE |
| ECE | ECE |
| MECH/Mechanical | Mech |
| CIVIL | Civil |
| MBA | MBA |
| COMMON | Common |

## Category Mapping

| CSV Value | Database Value |
|-----------|----------------|
| Technical | Technical |
| Non - technical / Non-Technical | Non-Technical |
| Cultural | Cultural |

## Duplicate Handling

- Events with the same name are considered duplicates
- The import uses `findOneAndUpdate` with `upsert: true`
- This means:
  - If an event with the same name exists, it will be **updated**
  - If it doesn't exist, it will be **created**
- The last occurrence in the CSV file takes precedence

## Expected Results

Based on the CSV file, you should see approximately:
- **40+ unique events** imported
- Events distributed across departments:
  - CSE: ~10 events
  - ECE: ~8 events
  - Mech: ~8 events
  - AIML: ~4 events
  - MBA: ~2 events
  - Common: ~10 events (Cultural events)

## Troubleshooting

### Issue: "CSV file not found"
**Solution**: Verify the CSV file exists at `D:\code3\Savishkar detail final submission form (Responses).csv`

### Issue: "Unauthorized" or "Invalid token"
**Solution**: 
- Ensure you're logged in as admin
- Get a fresh token from localStorage
- Token expires after some time, login again if needed

### Issue: Some events failed to import
**Solution**:
- Check the error messages in the response
- Common issues:
  - Duplicate event names
  - Invalid date formats
  - Missing required fields
- Fix the CSV data and re-import

### Issue: Events imported but not showing on website
**Solution**:
- Check if `isActive` is set to true
- Verify the event date is in the future
- Clear browser cache and refresh
- Check the events API: `http://localhost:5000/api/events`

## Verification

After import, verify the events:

1. **Check database**:
   ```bash
   cd server
   node scripts/checkEvents.js
   ```

2. **Check via API**:
   - GET `http://localhost:5000/api/events`
   - Should return all imported events

3. **Check on website**:
   - Navigate to the events page
   - Filter by department to see department-specific events

## Notes

- The import is **idempotent** - you can run it multiple times safely
- Existing events will be updated with new data from CSV
- The import preserves event IDs, so registrations won't be affected
- Images are placeholder URLs - you can update them later via the admin panel
- Coordinators are automatically parsed from the CSV format

## Next Steps

After importing events:
1. Review each event in the admin panel
2. Add/update event images if needed
3. Add detailed rules and eligibility criteria
4. Set up payment QR codes for events
5. Configure registration deadlines
6. Test event registration flow

## Support

If you encounter issues:
1. Check server logs for detailed error messages
2. Verify MongoDB connection
3. Ensure all environment variables are set
4. Check the CSV file format matches expected structure
