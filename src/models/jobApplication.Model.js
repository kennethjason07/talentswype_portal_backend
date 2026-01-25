import mongoose from "mongoose";

export const JobApplicationSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: [true, "Job reference is required"],
    },
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "Applicant reference is required"],
    },
    resumeUrl: {
        type: String,
        // required: [true, "Resume URL is required"],
    },
    coverLetter: {
        type: String,
        default: ""
    },
    status: {
        type: String,
        enum: ["applied", "shortlisted", "interview", "selected", "rejected"],
        default: "applied"
    },
    appliedAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },

    // Audit trail: who changed status
    statusHistory: [
        {
            status: {
                type: String,
                enum: ["applied", "shortlisted", "interview", "selected", "rejected"],
            },
            updatedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User", // HR/Admin who updated
            },
            updatedAt: {
                type: Date,
                default: Date.now
            },
            note: {
                type: String, // optional comment (e.g., "Good skills, shortlisted for round 2")
            }
        }
    ]
}, { timestamps: true });

// Prevent duplicate applications (same user applying multiple times for same job)
JobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

export default mongoose.models.JobApplication || mongoose.model("JobApplication", JobApplicationSchema);
