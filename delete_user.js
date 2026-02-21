import mongoose from "mongoose";
import './src/configs/dotenv.js';
import userModel from "./src/models/user.Model.js";
import userProfileModel from "./src/models/userProfile.Model.js";

async function deleteSpecificUser(identifier) {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error("❌ MONGO_URI not found in .env file");
            process.exit(1);
        }

        console.log("Connecting to database...");
        await mongoose.connect(mongoUri);
        console.log("✅ Database connected successfully\n");

        // Search by email first, then mobile number
        const user = await userModel.findOne({ 
            $or: [
                { email: identifier },
                { mobileNumber: identifier }
            ]
        });

        if (!user) {
            console.log(`❌ No user found with identifier: "${identifier}"`);
            await mongoose.disconnect();
            return;
        }

        console.log("-----------------------------------------");
        console.log("👤 USER FOUND");
        console.log("-----------------------------------------");
        console.log(`ID:       ${user._id}`);
        console.log(`Username: ${user.username}`);
        console.log(`Email:    ${user.email}`);
        console.log(`Mobile:   ${user.mobileNumber}`);
        console.log(`Verified: ${user.isEmailVerified}`);
        console.log("-----------------------------------------");

        // Delete associated profile
        const profileResult = await userProfileModel.deleteOne({ user: user._id });
        if (profileResult.deletedCount > 0) {
            console.log("🗑️ Deleted associated user profile.");
        }

        // Delete the user
        await userModel.deleteOne({ _id: user._id });
        console.log("🗑️ Deleted user account successfully.");

        console.log("\n✅ Done!");

        await mongoose.disconnect();
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

const target = process.argv[2];

if (!target) {
    console.log("❌ Please provide an email or mobile number.");
    console.log("\nUsage:\n  node delete_user.js user@example.com\n  OR\n  node delete_user.js 9876543210\n");
    process.exit(0);
}

deleteSpecificUser(target);
