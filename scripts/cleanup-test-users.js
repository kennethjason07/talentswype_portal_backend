/**
 * Script to clean up test users
 * 
 * Usage: node scripts/cleanup-test-users.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

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

// Clean up test users
const cleanupTestUsers = async () => {
    console.log('\n🧹 Cleaning up test users...\n');
    
    try {
        // Delete all users with test email domain
        const result = await userModel.deleteMany({ 
            email: { $regex: /@test\.talentswype\.com$/i } 
        });
        
        console.log(`✅ Deleted ${result.deletedCount} test users`);
        
        if (result.deletedCount > 0) {
            console.log('\n📋 Deleted users with emails matching: *@test.talentswype.com');
        } else {
            console.log('\n📋 No test users found to delete');
        }
        
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        throw error;
    }
};

// Main execution
const main = async () => {
    try {
        await connectDB();
        await cleanupTestUsers();
        
        console.log('\n✅ Cleanup complete!\n');
        process.exit(0);
        
    } catch (error) {
        console.error('❌ Script failed:', error);
        process.exit(1);
    }
};

// Run the script
main();
