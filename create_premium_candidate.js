import mongoose from "mongoose";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import User from "./src/models/user.Model.js";
import Package from "./src/models/package.Model.js";
import PackageCategory from "./src/models/packageCategory.Model.js";
import PurchasedPackage from "./src/models/purchasedPackage.Model.js";

dotenv.config();

const main = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB.");

        const email = "candidate@slanster.com";
        const password = "password123";
        const hashedPassword = await bcrypt.hash(password, 10);

        // 1. Create or Update User
        let user = await User.findOne({ email });
        if (user) {
            user.password = hashedPassword;
            user.userType = "USER";
            await user.save();
            console.log("Updated existing candidate user.");
        } else {
            user = await User.create({
                username: "Premium Candidate",
                email: email,
                password: hashedPassword,
                mobileNumber: "1234567890",
                college: "Slanster Academy",
                userType: "USER"
            });
            console.log("Created new candidate user.");
        }

        // 2. Ensure Category and Package Exist
        let category = await PackageCategory.findOne({ name: "Premium Plans" });
        if (!category) {
            category = await PackageCategory.create({ name: "Premium Plans" });
        }

        let pkg = await Package.findOne({ name: "Platinum Elite" });
        if (!pkg) {
            pkg = await Package.create({
                name: "Platinum Elite",
                description: "The ultimate package for professionals.",
                price: 9999,
                features: ["Unlimited Access", "Priority Support", "All Courses", "Mentorship"],
                isRecommended: true,
                category: category._id
            });
            console.log("Created Platinum Elite package.");
        }

        // 3. Assign Package
        await PurchasedPackage.updateMany(
            { user: user._id, status: "ACTIVE" },
            { $set: { status: "EXPIRED", expiresAt: new Date() } }
        );

        await PurchasedPackage.create({
            user: user._id,
            package: pkg._id,
            purchasedAt: new Date(),
            status: "ACTIVE"
        });

        user.activePackage = pkg._id;
        await user.save();

        console.log("\n==================================");
        console.log("PREMIUM CANDIDATE READY");
        console.log("----------------------------------");
        console.log(`Email:    ${email}`);
        console.log(`Password: ${password}`);
        console.log(`Package:  ${pkg.name}`);
        console.log("==================================\n");

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

main();
