import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./src/models/job.Model.js";
import JobApplication from "./src/models/jobApplication.Model.js";

dotenv.config();

const clearData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || "mongodb://localhost:27017/slanster";
        await mongoose.connect(mongoUri);
        console.log("Connected to MongoDB.");

        console.log("Clearing all jobs...");
        const jobsResult = await Job.deleteMany({});
        console.log(`Deleted ${jobsResult.deletedCount} jobs.`);

        console.log("Clearing all job applications...");
        const appsResult = await JobApplication.deleteMany({});
        console.log(`Deleted ${appsResult.deletedCount} applications.`);

        console.log("Data cleared successfully. Logins (Users) are preserved.");

    } catch (error) {
        console.error("Error clearing data:", error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

clearData();
