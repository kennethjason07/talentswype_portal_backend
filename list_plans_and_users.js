import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import User from "./src/models/user.Model.js";
import Package from "./src/models/package.Model.js";
import PackagePurchase from "./src/models/purchasedPackage.Model.js";

dotenv.config();

const listPlansAndFeatures = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
        await mongoose.connect(mongoUri);
        
        let output = "";
        
        // Get all users
        const users = await User.find({}).select("username email userType activePackage");
        
        // Get all packages
        const packages = await Package.find({});
        
        // Get all package purchases
        const purchases = await PackagePurchase.find({}).populate("package user");

        output += "=".repeat(80) + "\n";
        output += "ALL AVAILABLE PLANS\n";
        output += "=".repeat(80) + "\n";
        
        packages.forEach((pkg, index) => {
            output += `\n${index + 1}. ${pkg.name.toUpperCase()}\n`;
            output += `   Price: ₹${pkg.price}\n`;
            output += `   Description: ${pkg.description || 'N/A'}\n`;
            output += `   Features:\n`;
            if (pkg.features && pkg.features.length > 0) {
                pkg.features.forEach((feature, i) => {
                    output += `      ${i + 1}. ${feature}\n`;
                });
            } else {
                output += `      No features listed\n`;
            }
        });

        output += "\n" + "=".repeat(80) + "\n";
        output += "USER LOGINS AND THEIR ACTIVE PLANS\n";
        output += "=".repeat(80) + "\n";

        for (const user of users) {
            output += `\n${user.username} (${user.email}) - ${user.userType}\n`;
            
            if (user.activePackage) {
                const activePurchase = purchases.find(p => 
                    p.user._id.toString() === user._id.toString() && 
                    p.package._id.toString() === user.activePackage.toString() &&
                    p.status === "active"
                );
                
                if (activePurchase) {
                    output += `   Active Plan: ${activePurchase.package.name}\n`;
                    output += `   Expires: ${activePurchase.expiryDate.toLocaleDateString()}\n`;
                    output += `   Features:\n`;
                    if (activePurchase.package.features && activePurchase.package.features.length > 0) {
                        activePurchase.package.features.forEach((feature, i) => {
                            output += `      ${i + 1}. ${feature}\n`;
                        });
                    } else {
                        output += `      No features listed\n`;
                    }
                } else {
                    output += `   Active Package ID: ${user.activePackage} (No active purchase found)\n`;
                }
            } else {
                output += `   Active Plan: None\n`;
            }
        }

        output += "\n" + "=".repeat(80) + "\n";

        // Write to file
        fs.writeFileSync("plans_and_users_list.txt", output);
        console.log("Report generated successfully!");
        console.log("Output saved to: plans_and_users_list.txt");
        console.log("\n" + output);

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

listPlansAndFeatures();
