import mongoose from "mongoose";
import './src/configs/dotenv.js';
import userModel from "./src/models/user.Model.js";

async function checkMembership() {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) {
            console.error("❌ MONGO_URI not found in .env file");
            process.exit(1);
        }

        console.log(`Connecting to database...`);
        await mongoose.connect(mongoUri);
        console.log("✅ Database connected successfully\n");

        const totalUsers = await userModel.countDocuments();
        const verifiedUsers = await userModel.countDocuments({ isEmailVerified: true });
        const unverifiedUsers = await userModel.countDocuments({ isEmailVerified: false });
        
        const hrUsers = await userModel.countDocuments({ userType: "HR" });
        const regularUsers = await userModel.countDocuments({ userType: "USER" });
        const adminUsers = await userModel.countDocuments({ userType: "ADMIN" });

        const signupLimit = 60; // Hardcoded limit found in user.Controller.js

        console.log("-----------------------------------------");
        console.log("📊 MEMBERSHIP SIGNUP STATISTICS");
        console.log("-----------------------------------------");
        console.log(`Total Signups:      ${totalUsers}`);
        console.log(`Signup Limit:       ${signupLimit}`);
        console.log(`Remaining Slots:    ${Math.max(0, signupLimit - totalUsers)}`);
        console.log("-----------------------------------------");
        console.log(`Verified Users:     ${verifiedUsers}`);
        console.log(`Unverified Users:   ${unverifiedUsers}`);
        console.log("-----------------------------------------");
        console.log("BY USER TYPE:");
        console.log(`- Candidates (USER): ${regularUsers}`);
        console.log(`- Employers (HR):   ${hrUsers}`);
        console.log(`- Admins (ADMIN):    ${adminUsers}`);
        console.log("-----------------------------------------");

        if (totalUsers >= signupLimit) {
            console.log("🛑 ALERT: SIGNUP LIMIT REACHED!");
            console.log("New users will not be able to register until the limit is increased.");
        } else {
            console.log("✅ Signups are still open.");
        }

        await mongoose.disconnect();
        console.log("\nDisconnected from database.");
    } catch (error) {
        console.error("❌ Error:", error.message);
        process.exit(1);
    }
}

checkMembership();
