import feedbackModel from "../models/Feedback.Model.js";

export const submitFeedback = async (req, res) => {
    try {
        const { rating, category, comment } = req.body;
        const { userId } = req.user;

        if (!rating || !comment) {
            return res.status(400).json({ success: false, message: "Rating and comment are required" });
        }

        const feedback = new feedbackModel({
            user: userId,
            rating,
            category,
            comment
        });

        await feedback.save();

        res.status(201).json({
            success: true,
            message: "Feedback submitted successfully. Thank you!",
            data: feedback
        });
    } catch (error) {
        console.error("SUBMIT_FEEDBACK_ERROR:", error);
        res.status(500).json({ success: false, message: "Error submitting feedback", error: error.message });
    }
};

export const getAllFeedback = async (req, res) => {
    try {
        const feedback = await feedbackModel.find().populate("user", "username email").sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: feedback.length, data: feedback });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching feedback", error: error.message });
    }
};
