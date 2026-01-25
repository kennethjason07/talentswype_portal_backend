import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./src/models/user.Model.js";
import Package from "./src/models/package.Model.js";
import PackageCategory from "./src/models/packageCategory.Model.js";
import PurchasedPackage from "./src/models/purchasedPackage.Model.js";

dotenv.config();

const assignPlanToOthers = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB at", mongoUri);

        const targetEmails = ["hr@slanster.com", "user@slanster.com"];
        
        // 1. Ensure Category Exists
        let category = await PackageCategory.findOne({ name: "Premium Plans" });
        if (!category) {
            category = await PackageCategory.create({
                name: "Premium Plans",
                logoUrl: "https://cdn-icons-png.flaticon.com/512/2583/2583116.png"
            });
        }

        // 2. Ensure Highest Package Exists
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
        }

        console.log(`Using Package: ${pkg.name} ($${pkg.price})`);

        for (const email of targetEmails) {
            const user = await User.findOne({ email });

            if (!user) {
                console.error(`User ${email} not found! Skipping...`);
                continue;
            }

            // 3. Mark previous active package as expired
            if (user.activePackage) {
                await PurchasedPackage.updateMany(
                    { user: user._id, status: "ACTIVE" },
                    { $set: { status: "EXPIRED", expiresAt: new Date() } }
                );
            }

            // 4. Assign New Package
            const purchase = await PurchasedPackage.create({
                user: user._id,
                package: pkg._id,
                purchasedAt: new Date(),
                status: "ACTIVE"
            });

            // 5. Update User
            user.activePackage = pkg._id;
            await user.save();

            console.log(`Plan assigned successfully to: ${email}`);
        }

        console.log("\n==================================");
        console.log("ALL USERS UPDATED SUCCESSFULLY");
        console.log("==================================\n");

    } catch (error) {
        console.error("Error assigning plan:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

assignPlanToOthers();
