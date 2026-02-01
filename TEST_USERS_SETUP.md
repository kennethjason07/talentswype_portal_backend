# ✅ Test User Setup - Complete!

## 🎉 What Was Created

Created **2 utility scripts** to help you test the email automation system with users at different signup stages.

---

## 📁 Scripts Created

### 1. **`scripts/create-test-users.js`**

Creates 9 test users with different signup dates:

| User Type   | Count | Purpose                                         |
| ----------- | ----- | ----------------------------------------------- |
| Job Seekers | 5     | Test seeker email sequence                      |
| HR Users    | 3     | Test HR email sequence                          |
| Edge Cases  | 2     | Test filtering (unsubscribed, already received) |

**Total: 9 test users**

### 2. **`scripts/cleanup-test-users.js`**

Removes all test users from database (safe cleanup).

### 3. **`scripts/README.md`**

Complete testing guide with workflow and troubleshooting.

---

## 🚀 Quick Start

### **Create Test Users:**

```bash
cd backendslanster
node scripts/create-test-users.js
```

**Output:**

```
✅ Created: Test Seeker Today
   📧 Email: seeker.today@test.talentswype.com
   📅 Signup Date: 2026-01-31 (0 days ago)
   👤 Type: USER
   📝 Should receive welcome email immediately

✅ Created: Test Seeker Day3
   📧 Email: seeker.day3@test.talentswype.com
   📅 Signup Date: 2026-01-28 (3 days ago)
   👤 Type: USER
   📝 Should receive Day 3 email (First Application Push)

... (7 more users)

📊 Summary:
   ✅ Created: 9
   📧 Total: 9
```

---

## 🧪 Test Users Created

### **Job Seekers:**

1. `seeker.today@test.talentswype.com` - Just signed up (welcome email)
2. `seeker.day3@test.talentswype.com` - 3 days ago (Day 3 email)
3. `seeker.day7@test.talentswype.com` - 7 days ago (Day 7 email)
4. `seeker.old@test.talentswype.com` - 14 days ago (no emails)
5. `seeker.unsubscribed@test.talentswype.com` - 3 days ago, unsubscribed (no emails)

### **HR Users:**

6. `hr.today@test.talentswype.com` - Just signed up (HR welcome email)
7. `hr.day3@test.talentswype.com` - 3 days ago (HR Day 3 email)
8. `hr.day7@test.talentswype.com` - 7 days ago (HR Day 7 email)

### **Edge Cases:**

9. `seeker.received@test.talentswype.com` - Already received Day 3 email (no duplicate)

**All passwords:** `Test@123`

---

## ✅ Testing Checklist

### **Immediate Tests (Right After Creating Users):**

- [ ] Check inbox for `seeker.today@test.talentswype.com` → Welcome email
- [ ] Check inbox for `hr.today@test.talentswype.com` → HR welcome email
- [ ] Verify emails have UTM tracking in links
- [ ] Verify unsubscribe links work

### **Scheduler Tests (Wait for 10 AM IST or trigger manually):**

- [ ] `seeker.day3@test.talentswype.com` receives Day 3 email
- [ ] `seeker.day7@test.talentswype.com` receives Day 7 email
- [ ] `hr.day3@test.talentswype.com` receives HR Day 3 email
- [ ] `hr.day7@test.talentswype.com` receives HR Day 7 email

### **Filtering Tests (Should NOT receive emails):**

- [ ] `seeker.unsubscribed@test.talentswype.com` - No emails (unsubscribed)
- [ ] `seeker.received@test.talentswype.com` - No Day 3 email (already sent)
- [ ] `seeker.old@test.talentswype.com` - No emails (too old)

### **Database Tests:**

- [ ] Check `emailAutomationLog` is populated after sending
- [ ] Check `emailUnsubscribed` flag works
- [ ] Verify `createdAt` dates are correct

---

## 🔧 How to Test

### **Option 1: Wait for Scheduler (Production-like)**

```bash
# Start server
npm run dev

# Wait for 10:00 AM IST
# Scheduler will automatically send emails
```

### **Option 2: Trigger Immediately (Development)**

Temporarily modify `src/services/scheduler.service.js`:

```javascript
// Change from:
cron.schedule('0 10 * * *', async () => { ... }, { timezone: 'Asia/Kolkata' });

// To (runs every minute):
cron.schedule('* * * * *', async () => { ... }, { timezone: 'Asia/Kolkata' });
```

Then restart server and emails will be sent within 1 minute.

---

## 🧹 Clean Up

When done testing:

```bash
node scripts/cleanup-test-users.js
```

**Output:**

```
🧹 Cleaning up test users...
✅ Deleted 9 test users
```

---

## 📊 Expected Results

### **Welcome Emails (Immediate):**

- ✅ `seeker.today@test.talentswype.com` → Seeker welcome email
- ✅ `hr.today@test.talentswype.com` → HR welcome email

### **Day 3 Emails (at 10 AM IST):**

- ✅ `seeker.day3@test.talentswype.com` → First Application Push
- ✅ `hr.day3@test.talentswype.com` → Job Posting Tips

### **Day 7 Emails (at 10 AM IST):**

- ✅ `seeker.day7@test.talentswype.com` → Engagement & Tips
- ✅ `hr.day7@test.talentswype.com` → Hiring Best Practices

### **No Emails:**

- ❌ `seeker.old@test.talentswype.com` (too old)
- ❌ `seeker.unsubscribed@test.talentswype.com` (unsubscribed)
- ❌ `seeker.received@test.talentswype.com` (already received)

---

## 🐛 Troubleshooting

### **No emails received?**

1. Check `.env` file has correct SMTP settings
2. Check server logs for errors
3. Verify scheduler is running (look for cron messages in logs)
4. Check spam folder

### **Emails sent to wrong users?**

1. Verify `createdAt` dates: `db.users.find({}, {email: 1, createdAt: 1})`
2. Check `emailAutomationLog` is being updated
3. Verify filtering logic in scheduler

### **Duplicate emails?**

1. Ensure only one server instance is running
2. Check `logEmailSent` function is called
3. Verify `hasReceivedEmail` function works

---

## 📚 Documentation

Full testing guide: **`scripts/README.md`**

Includes:

- Complete testing workflow
- Monitoring instructions
- Troubleshooting guide
- MongoDB queries

---

**Status**: ✅ Ready to Test  
**Next Step**: Run `node scripts/create-test-users.js`
