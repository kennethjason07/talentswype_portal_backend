import mongoose from "mongoose";

export const UserProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    profile: { type: String },
    degree: { type: String },
    stream: { type: String },
    semester: { type: Number },
    yearofpass: { type: Number },
    percentage: { type: Number },
    position: { type: String },
    address: { type: String },
    city: { type: String },
    state: { type: String },
    bio: { type: String },
    trainingInternships: [{
        companyName: { type: String },
        postName: { type: String },
        location: { type: String },
        duration: {
            from: { type: String },
            to: { type: String },
        }
    }],
    projects: [{
        projectName: { type: String },
        projectRole: { type: String },
        projectDescription: { type: String }
    }],
    certifications: [{
        certificateName: { type: String },
        certifiedBy: { type: String },
    }],
    skills: [{
        skill: { type: String },
        skill_level: { type: Number, min: 0, max: 10 }
    }],
    profileLinks: {
        hackerRank: { type: String },
        github: { type: String },
        linkedIn: { type: String },
        codeChef: { type: String },
        leetCode: { type: String },
        geekForGeeks: { type: String },
    },
    profileCompletion: { type: Number, min: 0, max: 100 },
    isProfileComplete: { type: Boolean, default: false },
}, { timestamps: true });

UserProfileSchema.methods.calculateProfileCompletion = function () {
    let filledCount = 0;
    let totalCount = 0;

    // Flat fields
    const fieldsToCheck = [
        "profile", "degree", "stream", "semester", "yearofpass",
        "percentage", "position", "address", "city", "state", "bio"
    ];

    fieldsToCheck.forEach(field => {
        totalCount++;
        if (this[field] !== undefined && this[field] !== null && this[field] !== "") {
            filledCount++;
        }
    });

    // Training & Internships
    if (this.trainingInternships?.length > 0) {
        const tiFields = ["companyName", "postName", "location", "duration.from", "duration.to"];
        tiFields.forEach(() => totalCount++);
        const internship = this.trainingInternships[0]; // check first entry
        tiFields.forEach(field => {
            const val = field.includes(".")
                ? internship?.[field.split(".")[0]]?.[field.split(".")[1]]
                : internship?.[field];
            if (val) filledCount++;
        });
    }

    // Projects
    if (this.projects?.length > 0) {
        const pjFields = ["projectName", "projectRole", "projectDescription"];
        pjFields.forEach(() => totalCount++);
        const project = this.projects[0];
        pjFields.forEach(field => {
            if (project?.[field]) filledCount++;
        });
    }

    // Certifications
    if (this.certifications?.length > 0) {
        const certFields = ["certificateName", "certifiedBy"];
        certFields.forEach(() => totalCount++);
        const cert = this.certifications[0];
        certFields.forEach(field => {
            if (cert?.[field]) filledCount++;
        });
    }

    // Skills
    if (this.skills?.length > 0) {
        const skillFields = ["skill", "skill_level"];
        skillFields.forEach(() => totalCount++);
        const skill = this.skills[0];
        skillFields.forEach(field => {
            if (skill?.[field] !== undefined && skill?.[field] !== null && skill?.[field] !== "") {
                filledCount++;
            }
        });
    }

    // Profile Links
    const linkFields = ["hackerRank", "github", "linkedIn", "codeChef", "leetCode", "geekForGeeks"];
    linkFields.forEach(field => {
        totalCount++;
        if (this.profileLinks?.[field]) filledCount++;
    });

    // Final Percentage
    const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;
    return percentage;
};

UserProfileSchema.pre("save", function (next) {
    const percentage = this.calculateProfileCompletion();
    this.profileCompletion = percentage;
    this.isProfileComplete = percentage === 100;
    next();
});

export default mongoose.models.UserProfile || mongoose.model("UserProfile", UserProfileSchema);
