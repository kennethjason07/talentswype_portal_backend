import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./src/models/job.Model.js";

dotenv.config();

const checkJobStatus = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB.");

        const query = { position: { $regex: "jk", $options: "i" } };
        // Explicitly select hidden fields
        const jobs = await Job.find(query).select("+isApproved +approvedBy");

        console.log("\n==================================");
        console.log("JOB APPROVAL STATUS CHECK");
        console.log("----------------------------------");
        
        if (jobs.length === 0) {
            console.log("Status: NO JOBS FOUND matching 'jk'");
        } else {
            console.log(`Status: ${jobs.length} JOB(S) FOUND matching 'jk'`);
            jobs.forEach((job, index) => {
                console.log(`${index + 1}. ID: ${job._id}`);
                console.log(`   Position: ${job.position}`);
                console.log(`   Company: ${job.company}`);
                console.log(`   isApproved: ${job.isApproved}`);
                console.log(`   publishStatus: ${job.publishStatus}`);
                console.log("----------------------------------");
            });
        }
        console.log("==================================\n");

    } catch (error) {
        console.error("Error checking jobs:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

checkJobStatus();
