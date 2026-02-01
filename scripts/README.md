# 🧪 Testing Scripts

This directory contains utility scripts for testing the email automation system.

---

## 📁 Available Scripts

### 1. **`create-test-users.js`**

Creates test users with different signup dates to test email automation.

**Usage:**

```bash
node scripts/create-test-users.js
```

**What it does:**

- Creates 9 test users (5 seekers + 4 HR)
- Sets different signup dates (today, 3 days ago, 7 days ago, 14 days ago)
- Includes edge cases (unsubscribed, already received emails)
- Auto-verifies emails for easy testing

**Test Users Created:**

| Email                                      | Type   | Days Ago | Expected Behavior             |
| ------------------------------------------ | ------ | -------- | ----------------------------- |
| `seeker.today@test.talentswype.com`        | Seeker | 0        | Welcome email immediately     |
| `seeker.day3@test.talentswype.com`         | Seeker | 3        | Day 3 email at 10 AM IST      |
| `seeker.day7@test.talentswype.com`         | Seeker | 7        | Day 7 email at 10 AM IST      |
| `seeker.old@test.talentswype.com`          | Seeker | 14       | No emails (too old)           |
| `hr.today@test.talentswype.com`            | HR     | 0        | HR welcome email immediately  |
| `hr.day3@test.talentswype.com`             | HR     | 3        | HR Day 3 email at 10 AM IST   |
| `hr.day7@test.talentswype.com`             | HR     | 7        | HR Day 7 email at 10 AM IST   |
| `seeker.unsubscribed@test.talentswype.com` | Seeker | 3        | No emails (unsubscribed)      |
| `seeker.received@test.talentswype.com`     | Seeker | 3        | No Day 3 email (already sent) |

**All passwords:** `Test@123`

---

### 2. **`cleanup-test-users.js`**

Removes all test users from the database.

**Usage:**

```bash
node scripts/cleanup-test-users.js
```

**What it does:**

- Deletes all users with `@test.talentswype.com` email domain
- Safe to run multiple times
- Shows count of deleted users

---

## 🧪 Testing Workflow

### **Step 1: Create Test Users**

```bash
node scripts/create-test-users.js
```

### **Step 2: Verify Welcome Emails**

Check your email inbox for:

- `seeker.today@test.talentswype.com` → Should receive seeker welcome email
- `hr.today@test.talentswype.com` → Should receive HR welcome email

### **Step 3: Wait for Scheduler or Trigger Manually**

The scheduler runs every hour at 10 AM IST. To test immediately:

**Option A: Wait for next 10 AM IST**

- Scheduler will automatically send Day 3 and Day 7 emails

**Option B: Manually trigger (for development)**

```javascript
// In your code, temporarily change the cron schedule to run every minute
// scheduler.service.js
cron.schedule('* * * * *', async () => { ... }); // Every minute instead of daily
```

### **Step 4: Verify Emails Sent**

Check that these users received emails:

- ✅ `seeker.day3@test.talentswype.com` → Day 3 email
- ✅ `seeker.day7@test.talentswype.com` → Day 7 email
- ✅ `hr.day3@test.talentswype.com` → HR Day 3 email
- ✅ `hr.day7@test.talentswype.com` → HR Day 7 email

### **Step 5: Verify Filtering Works**

Check that these users did NOT receive emails:

- ❌ `seeker.unsubscribed@test.talentswype.com` (unsubscribed)
- ❌ `seeker.received@test.talentswype.com` (already received)
- ❌ `seeker.old@test.talentswype.com` (too old)

### **Step 6: Test Unsubscribe**

1. Open any email
2. Click "unsubscribe here" link
3. Verify redirect to `/unsubscribe?token=XXX`
4. Check database: `emailUnsubscribed` should be `true`
5. Verify no more emails are sent to that user

### **Step 7: Verify UTM Tracking**

1. Click any link in the emails
2. Check URL contains UTM parameters:
   ```
   ?utm_source=email&utm_medium=automation&utm_campaign=seeker_day3&utm_content=browse_jobs_cta
   ```
3. Check Google Analytics for the session

### **Step 8: Clean Up**

```bash
node scripts/cleanup-test-users.js
```

---

## 📊 Monitoring Test Results

### **Check Server Logs**

Look for these messages:

```
✅ Email sent to seeker.day3@test.talentswype.com
📧 Sending Day 3 email to seeker.day3@test.talentswype.com (Applications: 0)
🔍 [Seeker Day 3] Found 1 eligible users
```

### **Check Database**

```javascript
// MongoDB query to check email logs
db.users
  .find({
    email: "seeker.day3@test.talentswype.com",
  })
  .pretty();

// Should show:
{
  emailAutomationLog: [
    {
      emailType: "seeker",
      emailNumber: 2,
      sentAt: ISODate("2026-01-31T04:30:00.000Z"),
    },
  ];
}
```

---

## 🐛 Troubleshooting

### **Issue: No emails received**

**Check:**

1. Is the server running? `npm run dev`
2. Are email credentials configured? Check `.env`
3. Is the scheduler running? Check logs for cron messages
4. Is it 10 AM IST? Scheduler only runs at that time

**Solution:**

- Temporarily change cron schedule to `* * * * *` (every minute)
- Check SMTP settings in `.env`
- Verify `sendEmail` function is working

---

## 🚀 Quick Commands

```bash
# Create test users
node scripts/create-test-users.js

# Clean up test users
node scripts/cleanup-test-users.js

# Check test users in MongoDB
mongosh
use your_database_name
db.users.find({ email: /@test\.talentswype\.com/ }).pretty()

# Count test users
db.users.countDocuments({ email: /@test\.talentswype\.com/ })
```

---

**Last Updated**: January 31, 2026  
**Status**: ✅ Ready for Testing
