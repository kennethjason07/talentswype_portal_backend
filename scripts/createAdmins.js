import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from parent directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Import User Model
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "username is required"],
    },
    email: {
        type: String,
        required: [true, "email is required"],
    },
    mobileNumber: {
        type: String,
        required: [true, "mobileNumber is required"],
    },
    college: {
        type: String,
        required: [true, "college is required"],
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
    userType: {
        type: String,
        enum: ["ADMIN", "USER", "HR"],
        default: "USER"
    },
    activePackage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
        default: null,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken: {
        type: String,
        default: null,
    },
    emailVerificationTokenExpires: {
        type: Date,
        default: null,
    },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Admin accounts to create
const adminAccounts = [
    {
        username: "Admin One",
        email: "admin1@talentswype.com",
        password: "X9@pL7!QeT2#",
        mobileNumber: "9999999991",
        college: "TalentSwype Admin",
    },
    {
        username: "Admin Two",
        email: "admin2@talentswype.com",
        password: "mR4$Zk8^A!Wc",
        mobileNumber: "9999999992",
        college: "TalentSwype Admin",
    },
    {
        username: "Admin Three",
        email: "admin3@talentswype.com",
        password: "7B!f@2YQ#LxP",
        mobileNumber: "9999999993",
        college: "TalentSwype Admin",
    }
];

async function createAdmins() {
    try {
        console.log('🔌 Connecting to MongoDB...');
        console.log('📍 MongoDB URI:', process.env.MONGO_URI || 'Not found in .env');
        
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log('✅ Connected to MongoDB successfully!\n');

        for (const admin of adminAccounts) {
            console.log(`\n📝 Processing: ${admin.email}`);

            // Check if admin already exists
            const existingUser = await User.findOne({ email: admin.email });
            
            if (existingUser) {
                console.log(`⚠️  Admin already exists: ${admin.email}`);
                console.log(`   User Type: ${existingUser.userType}`);
                console.log(`   Email Verified: ${existingUser.isEmailVerified}`);
                
                // Update to ADMIN if not already
                if (existingUser.userType !== 'ADMIN') {
                    existingUser.userType = 'ADMIN';
                    existingUser.isEmailVerified = true;
                    await existingUser.save();
                    console.log(`   ✅ Updated to ADMIN type`);
                }
                continue;
            }

            // Hash password
            console.log(`   🔐 Hashing password...`);
            const hashedPassword = await bcrypt.hash(admin.password, 10);

            // Create new admin user
            const newAdmin = new User({
                username: admin.username,
                email: admin.email,
                mobileNumber: admin.mobileNumber,
                college: admin.college,
                password: hashedPassword,
                userType: 'ADMIN',
                isEmailVerified: true, // Auto-verify admin emails
                emailVerificationToken: null,
                emailVerificationTokenExpires: null,
            });

            await newAdmin.save();
            console.log(`   ✅ Admin created successfully!`);
            console.log(`   📧 Email: ${admin.email}`);
            console.log(`   👤 Username: ${admin.username}`);
            console.log(`   🔑 Password: ${admin.password}`);
        }

        console.log('\n\n🎉 All admin accounts processed successfully!\n');
        console.log('📋 Summary:');
        console.log('─────────────────────────────────────────────────────');
        
        for (const admin of adminAccounts) {
            const user = await User.findOne({ email: admin.email });
            console.log(`\n✅ ${admin.email}`);
            console.log(`   Username: ${user.username}`);
            console.log(`   Password: ${admin.password}`);
            console.log(`   User Type: ${user.userType}`);
            console.log(`   Email Verified: ${user.isEmailVerified}`);
            console.log(`   Created: ${user.createdAt}`);
        }
        
        console.log('\n─────────────────────────────────────────────────────');
        console.log('\n🔐 Login URLs:');
        console.log('   Development: http://localhost:3000/auth');
        console.log('   Production:  https://portal.talentswype.com/auth');
        console.log('\n');

    } catch (error) {
        console.error('\n❌ Error creating admin accounts:', error);
        console.error('\nError details:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Database connection closed.');
        process.exit(0);
    }
}

// Run the script
console.log('\n╔════════════════════════════════════════════════════╗');
console.log('║     TalentSwype Admin Account Creation Script     ║');
console.log('╚════════════════════════════════════════════════════╝\n');

createAdmins();
