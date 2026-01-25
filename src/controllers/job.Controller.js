import jobModel from "../models/job.Model.js";
import jobApplicationModel from "../models/jobApplication.Model.js";

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
        const job = await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // HR can only delete their own jobs
        if (userType === "HR" && job.publishBy.toString() !== userId) {
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

        // Find the job
        const job = await jobModel.findById(jobId);
        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found",
            });
        }

        // HR can only view applicants for their own job posts
        if (userType === "HR" && job.publishBy.toString() !== userId) {
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
        res.status(500).json({
            success: false,
            message: error.message,
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
            .populate("job", "publishBy");

        if (!application) {
            return res.status(404).json({
                success: false,
                message: "Application not found",
            });
        }

        if (userType === "HR" && application.job.publishBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "HR can only manage applications for their own jobs",
            });
        }

        // If updating status
        if (status) {
            // Restrict valid statuses
            const validStatuses = ["shortlisted", "interview", "rejected", "hired"];
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
        res.status(500).json({
            success: false,
            message: error.message,
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
            .select("+isApproved +approvedBy")
            .sort({ createdAt: -1 })
            .populate("publishBy", "username email userType")
            .populate("approvedBy", "username email userType");

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

        const job = await jobModel.findOne({
            _id: jobId,
            publishStatus: "active",
        });

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Job not found or not active/approved",
            });
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
        const { jobId, resumeUrl, coverLetter } = req.body;

        if (!jobId || !resumeUrl) {
            return res.status(403).json({
                success: false,
                message: "Missing required fields",
            });
        }

        // Check if job exists
        const job = await jobModel.findById(jobId);
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
            resumeUrl,
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
