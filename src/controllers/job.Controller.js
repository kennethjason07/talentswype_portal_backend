import mongoose from "mongoose";
import jobModel from "../models/job.Model.js";
import jobApplicationModel from "../models/jobApplication.Model.js";
import userModel from "../models/user.Model.js";
import { sendEmail } from "../services/email/index.js";
import { jobApplicationConfirmationTemplate } from "../services/email/candidateTemplates.js";
import { newApplicantNotificationTemplate } from "../services/email/hrTemplates.js";

// HR
export const getHRJobs = async (req, res) => {
    try {
        const { userId } = req.user;
        const jobs = await jobModel.find({ publishBy: userId }).select("+isApproved +approvedBy").sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const createJob = async (req, res) => {

    try {
        const { userId, userType } = req.user;
        const jobData = {
            ...req.body,
            publishBy: userId
        };

        if (userType === "USER") {
            return res.status(403).json({
                success: false,
                message: "User is not allowed to post jobs"
            })
        }
        // HR cannot set approval fields
        if (userType === "HR" && (req.body.isApproved || req.body.approvedBy)) {
            delete jobData.isApproved;
            delete jobData.approvedBy;
        }

        const job = new jobModel(jobData);
        await job.save();

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const updateJob = async (req, res) => {
    try {
        const { userId, userType } = req.user;
        const { jobId } = req.params;
        const updateData = { ...req.body };

        // Find the job
        const job = await jobModel.findById(jobId).select('publishBy');
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // HR can only update their own jobs
        if (userType === "HR" && job.publishBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "HR can only update their own jobs",
            });
        }

        // HR cannot set approval fields
        if (userType === "HR") {
            delete updateData.isApproved;
            delete updateData.approvedBy;
        }

        // Update job
        const updatedJob = await jobModel.findByIdAndUpdate(
            jobId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Job updated successfully",
            data: updatedJob,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const deleteJob = async (req, res) => {
    try {
        const { userId, userType } = req.user;
        const { jobId } = req.params;

        // Find the job
        const job = await jobModel.findById(jobId).select("+publishBy");
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // HR can only delete their own jobs
        if (userType === "HR" && job.publishBy?.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "HR can only delete their own jobs",
            });
        }

        // Admin can delete all jobs
        await jobModel.findByIdAndDelete(jobId);

        res.status(200).json({
            success: true,
            message: "Job deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getApplicantsForJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { userId, userType } = req.user;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID format",
            });
        }

        // Find the job
        const job = await jobModel.findById(jobId).select("+publishBy");
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // HR can only view applicants for their own job posts
        const jobOwnerId = job.publishBy ? job.publishBy.toString() : null;
        if (userType === "HR" && jobOwnerId !== userId) {
            return res.status(403).json({
                success: false,
                message: "HR can only view applicants for their own jobs",
            });
        }

        // Fetch applications
        const applications = await jobApplicationModel.find({ job: jobId })
            .populate("applicant", "username email mobileNumber college")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications,
        });
    } catch (error) {
        console.error("GET_APPLICANTS_FOR_JOB_ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching applicants: " + error.message,
            debug: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
};

export const manageApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { userId, userType } = req.user;
        const { status, note } = req.body;

        // Only HR/Admin can manage applications
        if (!["HR", "ADMIN"].includes(userType)) {
            return res.status(403).json({
                success: false,
                message: "Only HR or Admin can manage applications",
            });
        }

        // Find application
        const application = await jobApplicationModel
            .findById(applicationId)
            .populate({ path: "job", select: "+publishBy" });

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        const jobOwnerId = application.job?.publishBy ? application.job.publishBy.toString() : null;
        if (userType === "HR" && jobOwnerId !== userId) {
            return res.status(403).json({
                success: false,
                message: "HR can only manage applications for their own jobs",
            });
        }

        // If updating status
        if (status) {
            // Restrict valid statuses
            const validStatuses = ["shortlisted", "interview", "rejected", "hired", "applied"];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid status. Allowed: ${validStatuses.join(", ")}`,
                });
            }

            application.status = status;
        }

        // Push into status history (status update or just note)
        application.statusHistory.push({
            status: status || application.status,
            updatedBy: userId,
            note: note || (status ? `Status updated to ${status}` : "Note added"),
        });

        await application.save();

        res.status(200).json({
            success: true,
            message: status
                ? `Application status updated to '${status}'`
                : "Note added successfully",
            data: application,
        });
    } catch (error) {
        console.error("MANAGE_APPLICATION_ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error managing application: " + error.message,
            debug: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
};


// ADMIN
export const getAllJobsForAdmin = async (req, res) => {
    try {
        const { userType } = req.user;

        // Only Admin can access
        if (userType !== "ADMIN") {
            return res.status(403).json({
                success: false,
                message: "Only Admin can view all jobs",
            });
        }

        // Fetch all jobs
        const jobs = await jobModel
            .find()
            .select("+isApproved +approvedBy +publishBy")
            .sort({ createdAt: -1 })
            .populate({
                path: "publishBy",
                select: "username email userType mobileNumber"
            })
            .populate({
                path: "approvedBy",
                select: "username email userType mobileNumber"
            });

        res.status(200).json({
            success: true,
            count: jobs.length,
            data: jobs,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const approveJob = async (req, res) => {
    try {
        const { userId, userType } = req.user;
        if (userType !== "ADMIN") {
            return res.status(403).json({ success: false, message: "Only ADMIN can approve jobs" });
        }

        const job = await jobModel.findByIdAndUpdate(
            req.params.id,
            {
                isApproved: true,
                approvedBy: userId
            },
            { new: true }
        ).select("+isApproved +approvedBy");

        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }

        res.json({ success: true, data: job });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// USER
export const getJobs = async (req, res) => {
    try {
        const { location, role_category, skills, employment_type, work_mode, company } = req.query;

        // Base query: only active & approved jobs
        const query = {
            publishStatus: "active",
            isApproved: true,
        };

        // Apply filters if provided
        if (location) query.location = { $regex: location, $options: "i" };
        if (role_category) query.role_category = { $regex: role_category, $options: "i" };
        if (employment_type) query.employment_type = employment_type;
        if (work_mode) query.work_mode = work_mode;
        if (company) query.company = { $regex: company, $options: "i" };

        // Skills (array of strings, match any skill)
        if (skills) {
            const skillArray = Array.isArray(skills) ? skills : skills.split(",");
            query.key_skills = { $in: skillArray.map(s => s.trim()) };
        }

        const jobs = await jobModel.find(query).sort({ createdAt: -1 });

        // If user is logged in, check which jobs they applied to
        let jobsWithStatus = jobs.map(job => ({ ...job.toObject(), hasApplied: false }));

        if (req.user) {
            const userId = req.user.userId;
            const applications = await jobApplicationModel.find({ applicant: userId }).select("job");
            const appliedJobIds = new Set(applications.map(app => app.job.toString()));

            jobsWithStatus = jobs.map(job => ({
                ...job.toObject(),
                hasApplied: appliedJobIds.has(job._id.toString())
            }));
        }

        res.status(200).json({
            success: true,
            count: jobsWithStatus.length,
            data: jobsWithStatus,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getJobById = async (req, res) => {
    try {
        const { jobId } = req.params;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID format",
            });
        }

        const job = await jobModel.findById(jobId).select("+publishBy +isApproved");

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        const isOwner = req.user && job.publishBy && job.publishBy.toString() === req.user.userId;
        const isAdmin = req.user && req.user.userType === "ADMIN";

        // If not owner/admin, job must be active and approved
        if (!isOwner && !isAdmin) {
            if (job.publishStatus !== "active" || !job.isApproved) {
                return res.status(404).json({
                    success: false,
                    message: "Job not found or not active/approved",
                });
            }
        }

        // Check if user has applied
        let hasApplied = false;
        if (req.user) {
            const userId = req.user.userId;
            const application = await jobApplicationModel.findOne({
                job: jobId,
                applicant: userId,
            });
            if (application) hasApplied = true;
        }

        res.status(200).json({
            success: true,
            data: {
                ...job.toObject(),
                hasApplied
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const applyForJob = async (req, res) => {
    try {
        const { userId, userType } = req.user;
        const { jobId, resumeGcsPath, coverLetter } = req.body;

        if (!jobId || !resumeGcsPath) {
            return res.status(403).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Check if job exists
        const job = await jobModel.findById(jobId).select("+publishBy");
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // Only allow inhouse jobs
        if (job.jobType !== "inhouse") {
            return res.status(400).json({
                success: false,
                message: "You can only apply to inhouse jobs",
            });
        }

        // Prevent duplicate applications
        const existingApplication = await jobApplicationModel.findOne({
            job: jobId,
            applicant: userId,
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: "You have already applied for this job",
            });
        }

        // Create new application
        const application = new jobApplicationModel({
            job: jobId,
            applicant: userId,
            resumeGcsPath,
            coverLetter,
            status: "applied",
            statusHistory: [
                {
                    status: "applied",
                    updatedBy: userId, // first entry is the applicant
                    note: "Application submitted",
                },
            ],
        });

        await application.save();

        // Send Emails (Candidate Confirmation & HR Notification)
        try {
            const candidate = await userModel.findById(userId);
            
            // 1. Candidate Confirmation Email
            if (candidate && !candidate.emailUnsubscribed) {
                const { subject, text, html } = jobApplicationConfirmationTemplate(
                    candidate.username,
                    job.position || "Position",
                    job.company || "Company"
                );
                await sendEmail(candidate.email, subject, text, html);
                console.log(`✅ Application confirmation email sent to candidate: ${candidate.email}`);
            }

            // 2. HR Notification Email
            if (job.publishBy) {
                const hrUser = await userModel.findById(job.publishBy);
                if (hrUser && !hrUser.emailUnsubscribed) {
                    const { subject, text, html } = newApplicantNotificationTemplate(
                        hrUser.username,
                        candidate.username,
                        job.position || "Position"
                    );
                    await sendEmail(hrUser.email, subject, text, html);
                    console.log(`✅ New applicant notification sent to HR: ${hrUser.email}`);
                }
            }
        } catch (emailError) {
            console.error("❌ Error sending application emails:", emailError);
            // Don't fail the response if emails fail
        }

        res.status(201).json({
            success: true,
            message: "Application submitted successfully",
            data: application,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMyApplications = async (req, res) => {
    try {
        const { userId, userType } = req.user;

        const applications = await jobApplicationModel.find({ applicant: userId })
            .populate("job")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: applications.length,
            data: applications,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const withdrawApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { userId, userType } = req.user;

        // Find application
        const application = await jobApplicationModel.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        // Ensure logged-in user owns the application
        if (application.applicant.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to withdraw this application",
            });
        }

        // Only allow withdrawal if status = applied
        if (application.status !== "applied") {
            return res.status(400).json({
                success: false,
                message: `Application cannot be withdrawn as it is currently '${application.status}'`,
            });
        }

        // Delete application
        await jobApplicationModel.findByIdAndDelete(applicationId);

        res.status(200).json({
            success: true,
            message: "Application withdrawn successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

export const getMatchingCandidates = async (req, res) => {
    try {
        const { jobId } = req.params;
        const { userId, userType } = req.user;

        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid Job ID format",
            });
        }

        // Find the job
        const job = await jobModel.findById(jobId).select("+publishBy");
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // HR can only view matching candidates for their own job posts
        const jobOwnerId = job.publishBy ? job.publishBy.toString() : null;
        if (userType === "HR" && jobOwnerId !== userId) {
            return res.status(403).json({
                success: false,
                message: "HR can only view matching candidates for their own jobs",
            });
        }

        // 1. Get List of Applicants to Exclude
        const existingApplications = await jobApplicationModel.find({ job: jobId }).select("applicant");
        const applicantIds = existingApplications.map(app => app.applicant);

        // 2. Identify keyskills
        const skills = job.key_skills || [];
        if (skills.length === 0) {
            return res.status(200).json({
                success: true,
                count: 0,
                message: "No specific skills defined for this job to match candidates.",
                data: [],
            });
        }

        // 3. Find Users with matching skills in their UserProfile
        // We need to query UserProfile for skills match, then populate User details
        // Case-insensitive regex match for each skill
        const skillRegexes = skills.map(skill => new RegExp(skill, "i"));

        // Find profiles that have ANY of the skills
        // And ensure the user is NOT in applicantIds
        // Also ensure userType is strictly 'USER' (candidate) - filtering done via populate match or secondary query
         
        // Option: Aggregate or simple find on UserProfile
        // UserProfile has: user (ref), skills: [{ skill: String }]
        
        // We want profiles where skills.skill matches any of skillRegexes
        // AND user is not in applicantIds
        
        // However, UserProfile schema has `user` ref. We need to filter based on that `user` field ref too.
        
        // Let's use aggregation for better performance and filtering
        // We need to `lookup` the `User` collection to check userType='USER' and exclude applicants simultaneously if we want (or handle applicant exclusion by ID list).
        
        // Simplified approach: matches in UserProfile -> populate User -> filter
        
        const matchedProfiles = await mongoose.model("UserProfile").find({
            "skills.skill": { $in: skillRegexes },
            "user": { $nin: applicantIds }
        }).populate({
            path: "user",
            match: { userType: "USER" }, // Ensure it's a candidate
            select: "username email mobileNumber college"
        });

        // Filter out profiles where populate failed (e.g. user was not USER type or deleted)
        const candidates = matchedProfiles
            .filter(profile => profile.user)
            .map(profile => ({
                _id: profile.user._id, // Return User ID
                username: profile.user.username,
                email: profile.user.email,
                mobileNumber: profile.user.mobileNumber,
                college: profile.user.college,
                profileId: profile._id,
                skills: profile.skills, // Send all skills or just matched ones? Sending all helps context.
                // Highlight matched skills could be done on frontend
                matchedSkills: profile.skills
                   .filter(s => skillRegexes.some(r => r.test(s.skill)))
                   .map(s => s.skill)
            }));

        res.status(200).json({
            success: true,
            count: candidates.length,
            data: candidates
        });

    } catch (error) {
        console.error("GET_MATCHING_CANDIDATES_ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching matching candidates: " + error.message,
            debug: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
};
