import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    category: {
        type: String,
        enum: ["General", "Jobs", "Profile", "Courses", "Bug", "Suggestion"],
        default: "General"
    },
    comment: {
        type: String,
        required: true,
        trim: true
    },
}, { timestamps: true });

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
