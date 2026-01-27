# Admin Account Creation Script

## 📋 Overview

This script creates 3 admin accounts directly in the MongoDB database with pre-verified emails and ADMIN privileges.

## 👥 Admin Accounts

| Email                  | Password       | Username    |
| ---------------------- | -------------- | ----------- |
| admin1@talentswype.com | `X9@pL7!QeT2#` | Admin One   |
| admin2@talentswype.com | `mR4$Zk8^A!Wc` | Admin Two   |
| admin3@talentswype.com | `7B!f@2YQ#LxP` | Admin Three |

## 🚀 How to Run

### On Local Machine (Development)

```bash
# Navigate to backend directory
cd c:\Users\kened\Desktop\slanster-frontend\backendslanster

# Make sure .env file has MONGO_URI configured
# MONGO_URI=mongodb://localhost:27017/slanster

# Run the script
node scripts/createAdmins.js
```

### On GCP Server (Production)

```bash
# SSH into your GCP server
gcloud compute ssh YOUR_INSTANCE_NAME --zone YOUR_ZONE

# Navigate to backend directory
cd /path/to/backendslanster

# Make sure .env file has production MONGO_URI
# MONGO_URI=mongodb://your-production-db-uri

# Run the script
node scripts/createAdmins.js
```

## ✅ What the Script Does

1. **Connects to MongoDB** using the `MONGO_URI` from `.env`
2. **Checks for existing admins** - Won't create duplicates
3. **Hashes passwords** using bcrypt (same as registration)
4. **Creates admin users** with:
   - `userType: "ADMIN"`
   - `isEmailVerified: true` (auto-verified)
   - No email verification token needed
5. **Updates existing users** to ADMIN if they already exist
6. **Displays summary** of all created/updated accounts

## 📊 Expected Output

```
╔════════════════════════════════════════════════════╗
║     TalentSwype Admin Account Creation Script     ║
╚════════════════════════════════════════════════════╝

🔌 Connecting to MongoDB...
📍 MongoDB URI: mongodb://localhost:27017/slanster
✅ Connected to MongoDB successfully!

📝 Processing: admin1@talentswype.com
   🔐 Hashing password...
   ✅ Admin created successfully!
   📧 Email: admin1@talentswype.com
   👤 Username: Admin One
   🔑 Password: X9@pL7!QeT2#

📝 Processing: admin2@talentswype.com
   🔐 Hashing password...
   ✅ Admin created successfully!
   📧 Email: admin2@talentswype.com
   👤 Username: Admin Two
   🔑 Password: mR4$Zk8^A!Wc

📝 Processing: admin3@talentswype.com
   🔐 Hashing password...
   ✅ Admin created successfully!
   📧 Email: admin3@talentswype.com
   👤 Username: Admin Three
   🔑 Password: 7B!f@2YQ#LxP

🎉 All admin accounts processed successfully!

📋 Summary:
─────────────────────────────────────────────────────

✅ admin1@talentswype.com
   Username: Admin One
   Password: X9@pL7!QeT2#
   User Type: ADMIN
   Email Verified: true
   Created: 2026-01-27T13:21:04.123Z

✅ admin2@talentswype.com
   Username: Admin Two
   Password: mR4$Zk8^A!Wc
   User Type: ADMIN
   Email Verified: true
   Created: 2026-01-27T13:21:04.456Z

✅ admin3@talentswype.com
   Username: Admin Three
   Password: 7B!f@2YQ#LxP
   User Type: ADMIN
   Email Verified: true
   Created: 2026-01-27T13:21:04.789Z

─────────────────────────────────────────────────────

🔐 Login URLs:
   Development: http://localhost:3000/auth
   Production:  https://portal.talentswype.com/auth

🔌 Database connection closed.
```

## 🔍 Verify Admins Were Created

### Using MongoDB Compass or Shell

```javascript
// Connect to your database
use slanster

// Find all admin users
db.users.find({ userType: "ADMIN" }).pretty()

// Should show 3 admin accounts
```

### Using the API

```bash
# Login with admin credentials
POST https://api.talentswype.com/api/v1/loginUserWithEmailPassword
{
  "email": "admin1@talentswype.com",
  "password": "X9@pL7!QeT2#"
}

# Should return a token
```

## 🛡️ Security Features

1. ✅ **Passwords are hashed** using bcrypt (10 salt rounds)
2. ✅ **Email pre-verified** - No verification email needed
3. ✅ **ADMIN user type** - Full admin privileges
4. ✅ **Duplicate prevention** - Won't create if email already exists
5. ✅ **Secure passwords** - Complex passwords with special characters

## ⚠️ Important Notes

### 1. Environment Variables

Make sure your `.env` file has the correct `MONGO_URI`:

**Development:**

```env
MONGO_URI=mongodb://localhost:27017/slanster
```

**Production:**

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/slanster
```

### 2. Run Only Once

This script is designed to be run once to create the admin accounts. Running it multiple times is safe (it won't create duplicates), but unnecessary.

### 3. Password Security

⚠️ **IMPORTANT**: These passwords are stored in the script for initial setup. After first login, each admin should:

1. Login with the provided credentials
2. Change their password immediately
3. Use a password manager for the new password

### 4. Production Deployment

When deploying to production:

- Run this script on the production server
- Or run locally with production database connection
- Verify admins can login at https://portal.talentswype.com/auth

## 🔧 Troubleshooting

### Error: "Cannot find module 'mongoose'"

```bash
# Install dependencies
npm install
```

### Error: "MONGO_URI not found"

```bash
# Check your .env file
cat .env | grep MONGO_URI

# Make sure it's set correctly
```

### Error: "Connection refused"

```bash
# Check if MongoDB is running
# For local MongoDB:
sudo systemctl status mongod

# For MongoDB Atlas:
# Check your connection string and whitelist your IP
```

### Admins not showing as ADMIN type

```bash
# Run the script again - it will update existing users
node scripts/createAdmins.js
```

## 📝 Customization

### Add More Admins

Edit `scripts/createAdmins.js` and add to the `adminAccounts` array:

```javascript
const adminAccounts = [
  // ... existing admins
  {
    username: "Admin Four",
    email: "admin4@talentswype.com",
    password: "YourSecurePassword123!",
    mobileNumber: "9999999994",
    college: "TalentSwype Admin",
  },
];
```

### Change Admin Details

Modify the existing entries in the `adminAccounts` array.

## 🎯 Next Steps

After running the script:

1. ✅ Verify admins can login
2. ✅ Test admin dashboard access
3. ✅ Have each admin change their password
4. ✅ Set up 2FA if available
5. ✅ Document admin credentials securely (password manager)

## 📞 Support

If you encounter issues:

1. Check MongoDB connection
2. Verify .env file configuration
3. Check server logs: `pm2 logs backend`
4. Verify database permissions
5. Check if users collection exists

## 🔐 Credentials Summary

**Save these credentials securely!**

```
Admin 1:
Email: admin1@talentswype.com
Password: X9@pL7!QeT2#

Admin 2:
Email: admin2@talentswype.com
Password: mR4$Zk8^A!Wc

Admin 3:
Email: admin3@talentswype.com
Password: 7B!f@2YQ#LxP

Login URL: https://portal.talentswype.com/auth
```

⚠️ **Remember to change these passwords after first login!**
