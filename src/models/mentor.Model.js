import mongoose from "mongoose";

const mentorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    designation: {
        type: String, // e.g. CTO, Sr Manager, Professor, Product Manager
        required: true,
    },
    company: {
        type: String, // e.g. IT Company, Big4, Artificial Intelligence, E-commerce
        required: true,
    },
    experience: {
        type: String, // e.g. "10+ Yrs Of Experience"
        required: true,
    },
    description: {
        type: String, // About the mentor (overview text in card)
        required: true,
    },
    imageUrl: {
        type: String, // For storing mentor image
    },
    perHoursRate: {
        type: Number, // e.g. 500 (per hour rate in INR)
        required: true,
        default: 0,
    },
    skills: {
        type: [String], // e.g. ["Java", "Node.js", "Python"]
        default: []
    },
});

export const MentorModel = mongoose.model("Mentor", mentorSchema);
