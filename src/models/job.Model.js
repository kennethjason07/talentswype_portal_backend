import mongoose from "mongoose";

export const JobSchema = new mongoose.Schema({
    jobType: {
        type: String,
        enum: ["inhouse", "outSource"],
        default: "inhouse",
        required: [true, "Please specify jobType"],
    },
    position: {
        type: String,
        required: [true, "Please provide position"],
    },
    employment_type: {
        type: String,
        required: [true, "Please provide employment_type"],
    },
    key_skills: [{
        type: String,
        required: [true, "Please provide key_skills"],
    }],
    company: {
        type: String,
        required: [true, "Please provide company"],
    },
    role_category: {
        type: String,
        required: [true, "Please provide role_category"],
    },
    work_mode: {
        type: String,
        required: [true, "Please provide work_mode"],
    },
    location: {
        type: String,
        required: [true, "Please provide location"],
    },
    work_experience: {
        isFresher: {
            type: Boolean,
            required: [true, "Please provide isFresher"],
        },
        from: {
            type: Number,
            required: [true, "Please provide work_experience.from"],
        },
        to: {
            type: Number,
            required: [true, "Please provide work_experience.to"],
        },
    },
    annual_salary_range: {
        from: {
            type: Number,
            required: [true, "Please provide annual_salary_range.from"],
        },
        to: {
            type: Number,
            required: [true, "Please provide annual_salary_range.to"],
        },
    },
    company_industry: {
        type: String,
        required: [true, "Please provide company_industry"],
    },
    educational_qualification: [{
        type: String,
        required: [true, "Please provide educational_qualification"],
    }],
    interview_mode: {
        type: String,
        required: [true, "Please provide interview_mode"],
    },
    job_description: {
        type: String,
        required: [true, "Please provide job_description"],
    },

    // Used only if jobType = "outSource"
    job_url: {
        type: String,
        required: function () {
            return this.jobType === "outSource";
        },
    },

    about_company: {
        type: String,
        required: [true, "Please provide about_company"],
    },
    company_website_link: {
        type: String,
        required: [true, "Please provide company_website_link"],
    },
    company_address: {
        type: String,
        required: [true, "Please provide company_address"],
    },
    logoUrl: {
        type: String,
        required: [true, "Please provide logoUrl"],
    },
    publishStatus: {
        type: String,
        default: "active",
        enum: ["active", "closed"],
        required: [true, "Please provide publishStatus"],
    },
    publishDate: {
        type: Date,
        default: Date.now,
        required: [true, "Please provide publishDate"],
    },
    lastDate: {
        type: Date,
        default: function () {
            return new Date(+this.publishDate + 5 * 24 * 60 * 60 * 1000);
        },
        required: [true, "Please provide lastDate"],
    },
    isApproved: {
        type: Boolean,
        default: false,
        select: false
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        select: false
    },
    publishBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        select: false
    }
}, { timestamps: true });

export default mongoose.model.Jobs || mongoose.model('Job', JobSchema);