/**
 * Script to create test users with different signup dates
 * This helps test the email automation scheduler
 * 
 * Usage: node scripts/create-test-users.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import moment from 'moment-timezone';

// Load environment variables
dotenv.config();

// Import User model
import userModel from '../src/models/user.Model.js';

// MongoDB connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Test users configuration
const testUsers = [
    // JOB SEEKERS
    {
        username: 'Test Seeker Today',
        email: 'seeker.today@test.talentswype.com',
        password: 'Test@123',
        userType: 'USER',
        daysAgo: 0, // Just signed up today
        description: 'Should receive welcome email immediately'
    },
    {
        username: 'Test Seeker Day3',
        email: 'seeker.day3@test.talentswype.com',
        password: 'Test@123',
        userType: 'USER',
        daysAgo: 3, // Signed up 3 days ago
        description: 'Should receive Day 3 email (First Application Push)'
    },
    {
        username: 'Test Seeker Day7',
        email: 'seeker.day7@test.talentswype.com',
        password: 'Test@123',
        userType: 'USER',
        daysAgo: 7, // Signed up 7 days ago
        description: 'Should receive Day 7 email (Engagement & Tips)'
    },
    {
        username: 'Test Seeker Old',
        email: 'seeker.old@test.talentswype.com',
        password: 'Test@123',
        userType: 'USER',
        daysAgo: 14, // Signed up 14 days ago
        description: 'Should NOT receive any automated emails (too old)'
    },
    
    // HR USERS
    {
        username: 'Test HR Today',
        email: 'hr.today@test.talentswype.com',
        password: 'Test@123',
        userType: 'HR',
        daysAgo: 0, // Just signed up today
        description: 'Should receive HR welcome email immediately'
    },
    {
        username: 'Test HR Day3',
        email: 'hr.day3@test.talentswype.com',
        password: 'Test@123',
        userType: 'HR',
        daysAgo: 3, // Signed up 3 days ago
        description: 'Should receive HR Day 3 email (Job Posting Tips)'
    },
    {
        username: 'Test HR Day7',
        email: 'hr.day7@test.talentswype.com',
        password: 'Test@123',
        userType: 'HR',
        daysAgo: 7, // Signed up 7 days ago
        description: 'Should receive HR Day 7 email (Hiring Best Practices)'
    },
    
    // EDGE CASES
    {
        username: 'Test Seeker Unsubscribed',
        email: 'seeker.unsubscribed@test.talentswype.com',
        password: 'Test@123',
        userType: 'USER',
        daysAgo: 3,
        emailUnsubscribed: true,
        description: 'Should NOT receive emails (unsubscribed)'
    },
    {
        username: 'Test Seeker Already Received',
        email: 'seeker.received@test.talentswype.com',
        password: 'Test@123',
        userType: 'USER',
        daysAgo: 3,
        emailAutomationLog: [
            { emailType: 'seeker', emailNumber: 2, sentAt: new Date() }
        ],
        description: 'Should NOT receive Day 3 email (already received)'
    }
];

// Create test users
const createTestUsers = async () => {
    console.log('\n🚀 Starting test user creation...\n');
    
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const userData of testUsers) {
        try {
            // Check if user already exists
            const existingUser = await userModel.findOne({ email: userData.email });
            
            if (existingUser) {
                console.log(`⏭️  Skipped: ${userData.email} (already exists)`);
                skipped++;
                continue;
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Calculate signup date (createdAt)
            const createdAt = moment().subtract(userData.daysAgo, 'days').toDate();

            // Generate tokens
            const emailVerificationToken = crypto.randomBytes(32).toString('hex');
            const unsubscribeToken = crypto.randomBytes(32).toString('hex');

            // Create user
            const newUser = new userModel({
                username: userData.username,
                email: userData.email,
                password: hashedPassword,
                mobileNumber: '9999999999', // Test mobile number
                college: 'Test College',
                userType: userData.userType,
                isEmailVerified: true, // Auto-verify for testing
                emailVerificationToken,
                unsubscribeToken,
                emailUnsubscribed: userData.emailUnsubscribed || false,
                emailAutomationLog: userData.emailAutomationLog || [],
                createdAt: createdAt,
                updatedAt: createdAt
            });

            await newUser.save();

            console.log(`✅ Created: ${userData.username}`);
            console.log(`   📧 Email: ${userData.email}`);
            console.log(`   📅 Signup Date: ${moment(createdAt).format('YYYY-MM-DD HH:mm:ss')} (${userData.daysAgo} days ago)`);
            console.log(`   👤 Type: ${userData.userType}`);
            console.log(`   📝 ${userData.description}`);
            console.log('');

            created++;

        } catch (error) {
            console.error(`❌ Error creating ${userData.email}:`, error.message);
            errors++;
        }
    }

    console.log('\n📊 Summary:');
    console.log(`   ✅ Created: ${created}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📧 Total: ${testUsers.length}`);
};

// Display test user credentials
const displayCredentials = () => {
    console.log('\n🔑 Test User Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('All passwords: Test@123\n');
    
    console.log('📌 JOB SEEKERS:');
    testUsers.filter(u => u.userType === 'USER').forEach(user => {
        console.log(`   • ${user.email} (${user.daysAgo} days ago)`);
    });
    
    console.log('\n📌 HR USERS:');
    testUsers.filter(u => u.userType === 'HR').forEach(user => {
        console.log(`   • ${user.email} (${user.daysAgo} days ago)`);
    });
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// Display testing instructions
const displayInstructions = () => {
    console.log('📋 Testing Instructions:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n1️⃣  Check Welcome Emails:');
    console.log('   • seeker.today@test.talentswype.com should have received welcome email');
    console.log('   • hr.today@test.talentswype.com should have received HR welcome email');
    
    console.log('\n2️⃣  Trigger Scheduler (manually or wait for cron):');
    console.log('   • Day 3 users should receive their emails at 10 AM IST');
    console.log('   • Day 7 users should receive their emails at 10 AM IST');
    
    console.log('\n3️⃣  Verify Email Filtering:');
    console.log('   • seeker.unsubscribed@test.talentswype.com should NOT receive emails');
    console.log('   • seeker.received@test.talentswype.com should NOT receive Day 3 email again');
    console.log('   • seeker.old@test.talentswype.com should NOT receive any emails (too old)');
    
    console.log('\n4️⃣  Check Email Content:');
    console.log('   • All links should have UTM tracking parameters');
    console.log('   • Unsubscribe links should include the token');
    console.log('   • Personalization (first name) should work');
    
    console.log('\n5️⃣  Test Unsubscribe Flow:');
    console.log('   • Click unsubscribe link in any email');
    console.log('   • Verify user is marked as unsubscribed in database');
    console.log('   • Verify no more emails are sent to that user');
    
    console.log('\n6️⃣  Monitor Logs:');
    console.log('   • Check server logs for email sending confirmations');
    console.log('   • Look for "✅ Email sent" messages');
    console.log('   • Verify scheduler runs at 10:00 AM IST');
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

// Cleanup function (optional)
const cleanupTestUsers = async () => {
    console.log('\n🧹 Cleaning up existing test users...');
    const testEmails = testUsers.map(u => u.email);
    const result = await userModel.deleteMany({ email: { $in: testEmails } });
    console.log(`   Deleted ${result.deletedCount} test users\n`);
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        
        // Optional: Uncomment to clean up before creating
        // await cleanupTestUsers();
        
        await createTestUsers();
        displayCredentials();
        displayInstructions();
        
        console.log('✅ Test user creation complete!\n');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
};

// Run the script
main();
