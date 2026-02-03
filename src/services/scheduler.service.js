import cron from "node-cron";
import moment from "moment-timezone";
import userModel from "../models/user.Model.js";
import jobApplicationModel from "../models/jobApplication.Model.js";
import jobModel from "../models/job.Model.js";
import { sendEmail } from "./email/index.js";
import { firstApplicationPushTemplate, engagementTipsTemplate } from "./email/candidateTemplates.js";
import { jobPostingTipsTemplate, hiringBestPracticesTemplate } from "./email/hrTemplates.js";

/**
 * Initialize scheduled jobs
 */
export const initScheduledJobs = () => {
    console.log("⏰ Initializing scheduled jobs...");

    // Run every hour
    cron.schedule("0 * * * *", async () => {
        console.log("⏰ Running hourly email automation check...");
        
        // We only send automated emails if it's 10 AM IST
        // Get current time in IST
        const currentISTTime = moment().tz("Asia/Kolkata");
        const currentHour = currentISTTime.hour();

        console.log(`🕒 Current IST Hour: ${currentHour}`);

        if (currentHour === 10) {
            console.log("🚀 It's 10 AM IST - Running email automation sequences...");
            try {
                await checkDay3Trigger();
                await checkDay7Trigger(); // Updated from Day 6 to Day 7
                await checkHRDay3Trigger();
                await checkHRDay7Trigger();
            } catch (error) {
                console.error("❌ Error in scheduled email automation:", error);
            }
        } else {
            console.log("💤 Skipping email automation (runs only at 10 AM IST)");
        }
    });
};

/**
 * Log email to user history
 */
async function logEmailSent(user, emailType, emailNumber) {
    user.emailAutomationLog.push({
        emailType,
        emailNumber,
        sentAt: new Date()
    });
    await user.save();
    console.log(`✅ Logged ${emailType} email #${emailNumber} for user ${user.email}`);
}

/**
 * Check if user received specific email sequence
 */
function hasReceivedEmail(user, emailType, emailNumber) {
    return user.emailAutomationLog && user.emailAutomationLog.some(
        log => log.emailType === emailType && log.emailNumber === emailNumber
    );
}

/**
 * Base User Finder for Automation
 * Returns users who signed up before `days` ago AND haven't received email #`emailNumber`
 */
async function findEligibleUsers(userType, daysAgo, emailNumber, emailTypeLabel) {
    const cutoffDate = moment().subtract(daysAgo, 'days').toDate();
    
    // Find users created BEFORE the cutoff date
    // AND NOT unsubscribed
    // We filter "hasn't received email" in the loop or aggregation. 
    // Optimization: Depending on volume, we could do aggregation. For now, simple find + filter.
    
    // Using a simple window here: Users created between (Days+1) ago and Days ago?
    // OR just "Created before Days ago AND not received email"? 
    // The "Created before Days ago" approach is safer against downtime.
    // However, we don't want to spam old users. Let's add a lower bound of (Days + 2).
    
    const lowerBoundDate = moment().subtract(daysAgo + 3, 'days').toDate(); // Don't send to users older than Days+3
    
    const users = await userModel.find({
        createdAt: { $lte: cutoffDate, $gte: lowerBoundDate },
        userType: userType,
        emailUnsubscribed: { $ne: true }
    });

    // Filter those who haven't received this specific email
    return users.filter(user => !hasReceivedEmail(user, emailTypeLabel, emailNumber));
}

/**
 * Day 3 Trigger: First Application Push
 * Logic: User signs up -> >72 hours later -> Check if applied to jobs -> If 0, send email
 */
async function checkDay3Trigger() {
    try {
        // Find users older than 3 days who haven't received Seeker Email 2
        const users = await findEligibleUsers("USER", 3, 2, "seeker");
        console.log(`🔍 [Seeker Day 3] Found ${users.length} eligible users`);

        for (const user of users) {
             // Check if user has applied to any jobs
            const applicationCount = await jobApplicationModel.countDocuments({ applicant: user._id });

            if (applicationCount === 0) {
                console.log(`📧 Sending Day 3 email to ${user.email} (Applications: 0)`);
                
                const firstName = user.username ? user.username.split(" ")[0] : "Candidate";

                // Fetch 3 most recent active jobs
                const jobs = await jobModel.find({ publishStatus: 'active' })
                    .sort({ createdAt: -1 })
                    .limit(3)
                    .select('position company location');

                const { subject, text, html } = firstApplicationPushTemplate(firstName, jobs, user.unsubscribeToken);
                
                await sendEmail(user.email, subject, text, html);
                await logEmailSent(user, "seeker", 2);
            }
        }
    } catch (error) {
        console.error("❌ Error in Day 3 trigger:", error);
    }
}

/**
 * Day 7 Trigger: Engagement & Tips (Renamed from Day 6)
 * Logic: 7 days after signup -> Send to all seekers
 */
async function checkDay7Trigger() {
    try {
        const users = await findEligibleUsers("USER", 7, 3, "seeker");
        console.log(`🔍 [Seeker Day 7] Found ${users.length} eligible users`);

        for (const user of users) {
            console.log(`📧 Sending Day 7 email to ${user.email}`);

            const firstName = user.username ? user.username.split(" ")[0] : "Candidate";
            
            // Get stats for the email
            const applicationsCount = await jobApplicationModel.countDocuments({ applicant: user._id });
            // Count new active jobs posted in the last 7 days
            const newMatchesCount = await jobModel.countDocuments({ 
                publishStatus: 'active',
                createdAt: { $gte: moment().subtract(7, 'days').toDate() }
            });

            const { subject, text, html } = engagementTipsTemplate(firstName, applicationsCount, newMatchesCount, user.unsubscribeToken);
            
            await sendEmail(user.email, subject, text, html);
            await logEmailSent(user, "seeker", 3);
        }
    } catch (error) {
        console.error("❌ Error in Day 7 trigger:", error);
    }
}

/**
 * HR Day 3 Trigger: Job Posting Tips & Screening Process
 */
async function checkHRDay3Trigger() {
    try {
        const users = await findEligibleUsers("HR", 3, 2, "hr"); // Email 2 for HR
        console.log(`🔍 [HR Day 3] Found ${users.length} eligible users`);

        for (const user of users) {
            const jobCount = await jobModel.countDocuments({ publishBy: user._id });
            const hasPostedJob = jobCount > 0;

            console.log(`📧 Sending HR Day 3 email to ${user.email} (Jobs Posted: ${jobCount})`);
            
            const firstName = user.username ? user.username.split(" ")[0] : "HR";
            const { subject, text, html } = jobPostingTipsTemplate(firstName, hasPostedJob, user.unsubscribeToken);
            
            await sendEmail(user.email, subject, text, html);
            await logEmailSent(user, "hr", 2);
        }
    } catch (error) {
        console.error("❌ Error in HR Day 3 trigger:", error);
    }
}

/**
 * HR Day 7 Trigger: Hiring Best Practices
 */
async function checkHRDay7Trigger() {
    try {
        const users = await findEligibleUsers("HR", 7, 3, "hr"); // Email 3 for HR
        console.log(`🔍 [HR Day 7] Found ${users.length} eligible users`);

        for (const user of users) {
             console.log(`📧 Sending HR Day 7 email to ${user.email}`);

            const firstName = user.username ? user.username.split(" ")[0] : "HR";
            
            // Get stats
            const jobsPosted = await jobModel.countDocuments({ publishBy: user._id });

            const jobs = await jobModel.find({ publishBy: user._id }).select('_id');
            const jobIds = jobs.map(job => job._id);

            const candidatesInReview = await jobApplicationModel.countDocuments({ 
                job: { $in: jobIds },
                status: { $in: ["applied", "shortlisted", "interview"] } 
            });

            const profilesShortlisted = await jobApplicationModel.countDocuments({ 
                job: { $in: jobIds },
                status: "shortlisted"
            });

            const hasActivity = jobsPosted > 0 || candidatesInReview > 0;
            const stats = { jobsPosted, candidatesInReview, profilesShortlisted };

            const { subject, text, html } = hiringBestPracticesTemplate(firstName, hasActivity, stats, user.unsubscribeToken);
            
            await sendEmail(user.email, subject, text, html);
            await logEmailSent(user, "hr", 3);
        }
    } catch (error) {
        console.error("❌ Error in HR Day 7 trigger:", error);
    }
}
