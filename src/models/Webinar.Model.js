import mongoose from "mongoose";

const WebinarSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    startTime: {
        type: Date, // e.g., "3:00 PM"
        required: true,
    },
    endTime: {
        type: Date, // e.g., "4:30 PM"
        required: true,
    },
    thumbnail: {
        type: String, // URL to the thumbnail image
    },
    registeredUsers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User", // assuming you already have a User model
        },
    ],
    registrationCount: {
        type: Number,
        default: 0,
    },
    webinarLink: {
        type: String,
        required: true,
    },
}, { timestamps: true });

export default mongoose.models.Webinar || mongoose.model("Webinar", WebinarSchema);
