import mongoose from "mongoose";
import dotenv from "dotenv";
import JobApplication from "./src/models/jobApplication.Model.js";
import User from "./src/models/user.Model.js";

dotenv.config();

const clearApplications = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB at", mongoUri);

        const email = "candidate@slanster.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("Candidate user not found.");
            process.exit(1);
        }

        const result = await JobApplication.deleteMany({ applicant: user._id });

        console.log("\n==================================");
        console.log("APPLICATIONS CLEARED");
        console.log("----------------------------------");
        console.log(`User:    ${email}`);
        console.log(`Deleted: ${result.deletedCount} applications`);
        console.log("==================================\n");

    } catch (error) {
        console.error("Error clearing applications:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

clearApplications();
