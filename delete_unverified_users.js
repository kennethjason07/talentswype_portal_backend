import mongoose from "mongoose";
import './src/configs/dotenv.js';
import userModel from "./src/models/user.Model.js";
import userProfileModel from "./src/models/userProfile.Model.js";

async function deleteUnverifiedUsers() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error("❌ MONGO_URI not found in .env file");
            process.exit(1);
        }

        console.log("Connecting to database...");
        await mongoose.connect(mongoUri);
        console.log("✅ Database connected successfully\n");

        // 1. Find all unverified users
        const unverifiedUsers = await userModel.find({ isEmailVerified: false });
        const unverifiedCount = unverifiedUsers.length;

        if (unverifiedCount === 0) {
            console.log("✨ No unverified accounts found to delete.");
            await mongoose.disconnect();
            return;
        }

        console.log(`🔍 Found ${unverifiedCount} unverified accounts.`);
        const userIds = unverifiedUsers.map(user => user._id);

        // 2. Delete associated profiles (just in case they exist)
        const profileDeleteResult = await userProfileModel.deleteMany({ user: { $in: userIds } });
        console.log(`🗑️ Deleted ${profileDeleteResult.deletedCount} associated user profiles.`);

        // 3. Delete the users
        const userDeleteResult = await userModel.deleteMany({ _id: { $in: userIds } });
        console.log(`🗑️ Deleted ${userDeleteResult.deletedCount} unverified user accounts.`);

        console.log("\n-----------------------------------------");
        console.log("✅ SUCCESS: Cleanup complete!");
        console.log("These users can now sign up again from scratch.");
        console.log("-----------------------------------------");

        await mongoose.disconnect();
        console.log("Disconnected from database.");
    } catch (error) {
        console.error("❌ Error during cleanup:", error.message);
        process.exit(1);
    }
}

// Security Check: Ask for a specific flag to prevent accidental deletion
if (process.argv.includes("--confirm")) {
    deleteUnverifiedUsers();
} else {
    console.log("⚠️ WARNING: This script will PERMANENTLY DELETE all unverified accounts.");
    console.log("To proceed, run the command with the --confirm flag:");
    console.log("\n  node delete_unverified_users.js --confirm\n");
    process.exit(0);
}
