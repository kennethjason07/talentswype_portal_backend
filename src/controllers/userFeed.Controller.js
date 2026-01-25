import userModel from "../models/user.Model.js";
import userFeedModel from "../models/userFeed.Model.js";

export const createFeedForUser = async (req, res) => {
    try {
        const { userId, heading, description, url } = req.body;

        if (!userId || !heading || !description) {
            return res.status(404).json({ success: false, message: "Missing fields" });
        }

        const user = await userModel.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: "User not found" });

        const feed = new userFeedModel({
            heading,
            description,
            url,
            user: userId,
        });

        await feed.save();
        res.status(201).json({ success: true, message: "Feed created successfully", feed });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating feed", error: error.message });
    }
};

export const createFeedForAllUsers = async (req, res) => {
    try {
        const { heading, description, url } = req.body;

        if (!heading || !description) {
            return res.status(404).json({ success: false, message: "Missing fields" });
        }

        const users = await userModel.find({}, "_id");

        const feeds = users.map((u) => ({
            heading,
            description,
            url,
            user: u._id,
        }));

        await userFeedModel.insertMany(feeds);
        res.status(201).json({ success: true, message: "Feed sent to all users", count: feeds.length });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error creating feeds", error: error.message });
    }
};

export const createFeedForSelectedUsers = async (req, res) => {
    try {
        const { heading, description, url, userIds } = req.body;

        if (!heading || !description) {
            return res.status(404).json({ success: false, message: "Missing fields" });
        }

        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ success: false, message: "userIds array is required" });
        }

        // Validate user IDs exist in DB
        const users = await userModel.find(
            { _id: { $in: userIds } },
            "_id"
        );

        if (users.length === 0) {
            return res.status(404).json({ success: false, message: "No valid users found" });
        }

        // Prepare feeds
        const feeds = users.map((u) => ({
            heading,
            description,
            url,
            user: u._id,
        }));

        await userFeedModel.insertMany(feeds);

        res.status(201).json({
            success: true,
            message: "Feed sent to selected users",
            count: feeds.length,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating feeds for selected users",
            error: error.message,
        });
    }
};


export const getMyFeeds = async (req, res) => {
    try {
        const feeds = await userFeedModel.find({ user: req.user.userId }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, message: 'User feeds found' ,feeds});
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching feeds", error: error.message });
    }
};

export const deleteFeed = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.user;

        // Find feed first
        const feed = await userFeedModel.findById(id);
        if (!feed) {
            return res.status(404).json({ success: false, message: "Feed not found" });
        }

        // Check ownership
        if (feed.user.toString() !== userId) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this feed" });
        }

        // Delete feed
        await feed.deleteOne();

        res.status(200).json({ success: true, message: "Feed deleted successfully" });
    } catch (error) {
        console.error("Error deleting feed:", error);
        res.status(500).json({ success: false, message: "Error deleting feed", error: error.message });
    }
};
