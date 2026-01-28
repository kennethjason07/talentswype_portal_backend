import mongoose from "mongoose";
import dotenv from "dotenv";
import Job from "./src/models/job.Model.js";

dotenv.config();

/* ------------------ Companies to Match ------------------ */

const indianCompanies = [
    "CloudVibe Solutions",
    "NextGen Labs",
    "EduSpark Technologies",
    "FinRoot Systems",
    "GreenByte Innovations",
    "HealthSync Solutions",
    "CodeNest Software",
    "RetailIQ Tech",
    "FleetStack Logistics",
    "PayWave Digital",
    "AgroLink Systems",
    "BuildSoft Technologies",
    "InnovaWare Labs",
    "BrightEdge Solutions"
];

/* ------------------ Cities to Match ------------------ */

const indianCities = [
    "Bangalore", "Pune", "Mumbai", "Hyderabad", "Chennai",
    "Gurgaon", "Noida", "Kolkata", "Ahmedabad", "Jaipur",
    "Indore", "Coimbatore", "Kochi", "Trivandrum", "Nagpur"
];

/* ------------------ Main Revert Function ------------------ */

const revertJobs = async () => {
    try {
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error("MONGO_URI not found in env");

        await mongoose.connect(mongoUri);
        console.log("✅ MongoDB connected");

        // Find jobs that match the generated criteria
        const jobsToDelete = await Job.find({
            company: { $in: indianCompanies },
            location: { $in: indianCities },
            jobType: "inhouse"
        });

        console.log(`\n📊 Found ${jobsToDelete.length} jobs matching the generated criteria:\n`);

        if (jobsToDelete.length === 0) {
            console.log("ℹ️  No jobs found to delete. They may have already been removed.");
            return;
        }

        // Show summary before deletion
        const summary = {};
        jobsToDelete.forEach(job => {
            const company = job.company;
            summary[company] = (summary[company] || 0) + 1;
        });

        console.log("Jobs by company:");
        Object.entries(summary).forEach(([company, count]) => {
            console.log(`  - ${company}: ${count} jobs`);
        });

        console.log("\n⚠️  Deleting these jobs in 3 seconds...");
        console.log("Press Ctrl+C to cancel\n");

        // Wait 3 seconds before deletion
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Delete the jobs
        const result = await Job.deleteMany({
            company: { $in: indianCompanies },
            location: { $in: indianCities },
            jobType: "inhouse"
        });

        console.log(`\n✅ Successfully deleted ${result.deletedCount} jobs`);
        console.log("\nDeleted jobs breakdown:");
        Object.entries(summary).forEach(([company, count]) => {
            console.log(`  ✓ ${company}: ${count} jobs removed`);
        });

    } catch (error) {
        console.error("❌ Job revert failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("\n🔌 MongoDB disconnected");
        process.exit();
    }
};

revertJobs();
