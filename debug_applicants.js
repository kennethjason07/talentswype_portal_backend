import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./src/models/job.Model.js";
import User from "./src/models/user.Model.js";
import JobApplication from "./src/models/jobApplication.Model.js";

dotenv.config();

const checkApplicants = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB.");

        const query = { position: { $regex: "jk", $options: "i" } };
        // Explicitly select hidden fields
        const jobs = await Job.find(query);

        if (jobs.length === 0) {
            console.log("No 'jk' jobs found.");
            return;
        }

        const jobId = jobs[0]._id;
        console.log(`Checking applicants for Job ID: ${jobId}`);

        const applications = await JobApplication.find({ job: jobId });
        
        console.log(`Found ${applications.length} applications.`);
        
        if (applications.length > 0) {
            const firstApp = applications[0];
            console.log("First Application Details:");
            console.log(JSON.stringify(firstApp, null, 2));
            
            // Check if population works
            const populatedApp = await JobApplication.findById(firstApp._id).populate("applicant");
            console.log("\nPopulated Applicant:");
            console.log(populatedApp.applicant ? "Found" : "NOT FOUND (This is likely the issue)");
            if (populatedApp.applicant) {
                 console.log("Applicant ID:", populatedApp.applicant._id);
                 console.log("Applicant Name:", populatedApp.applicant.username);
            } else {
                 console.log("Applicant ID stored in Application:", firstApp.applicant);
                 const userCheck = await User.findById(firstApp.applicant);
                 console.log("Direct User Check:", userCheck ? "User exists" : "User DOES NOT exist");
            }
        }

    } catch (error) {
        console.error("Error checking applicants:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkApplicants();
