import mongoose from "mongoose";
import dotenv from "dotenv";
// Import all related models to ensure schemas are registered
import Job from "./src/models/job.Model.js"; 
import User from "./src/models/user.Model.js";
import JobApplication from "./src/models/jobApplication.Model.js";

dotenv.config();

const checkApplications = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB.");

        const email = "candidate@slanster.com";
        const user = await User.findOne({ email });

        if (!user) {
            console.log("Candidate user not found.");
            process.exit(1);
        }

        const applications = await JobApplication.find({ applicant: user._id }).populate("job", "position company");

        console.log("\n==================================");
        console.log("APPLICATION STATUS CHECK");
        console.log("----------------------------------");
        console.log(`User: ${email}`);
        
        if (applications.length === 0) {
            console.log("Status: NO ACTIVE APPLICATIONS");
        } else {
            console.log(`Status: ${applications.length} APPLICATION(S) FOUND`);
            applications.forEach((app, index) => {
                console.log(`${index + 1}. Job: ${app.job?.position || "Unknown"} at ${app.job?.company || "Unknown"} (Status: ${app.status})`);
            });
        }
        console.log("==================================\n");

    } catch (error) {
        console.error("Error checking applications:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkApplications();
