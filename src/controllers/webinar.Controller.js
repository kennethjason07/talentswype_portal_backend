import WebinarModel from "../models/Webinar.Model.js";


export const createWebinar = async (req, res) => {
    try {
        const { title, description, startTime, endTime, thumbnail, webinarLink } = req.body;

        if (!title || !startTime || !endTime || !webinarLink) {
            return res.status(400).json({
                success: false,
                message: "Please provide title, startTime, endTime, and webinarLink",
            });
        }

        const webinar = new WebinarModel({
            title,
            description,
            startTime,
            endTime,
            thumbnail,
            webinarLink,
        });

        await webinar.save();

        res.status(201).json({
            success: true,
            message: "Webinar created successfully",
            webinar,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating webinar",
            error: error.message,
        });
    }
};

export const getAllWebinars = async (req, res) => {
    try {
        const webinars = await WebinarModel.find()
            .sort({ startTime: -1 }) // Latest first
            .populate("registeredUsers", "name email"); // populate only name + email

        res.status(200).json({
            success: true,
            count: webinars.length,
            webinars,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching webinars",
            error: error.message,
        });
    }
};

export const getWebinarById = async (req, res) => {
    try {
        if (!req.params.id) {
            return res.status(400).json({
                success: false,
                message: "Webinar ID is required",
            });
        }
        const webinar = await WebinarModel.findById(req.params.id).populate("registeredUsers", "name email");

        if (!webinar) {
            return res.status(404).json({
                success: false,
                message: "Webinar not found",
            });
        }

        res.status(200).json({
            success: true,
            webinar,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching webinar",
            error: error.message,
        });
    }
};

export const updateWebinar = async (req, res) => {
    try {
        const { title, description, startTime, endTime, thumbnail, webinarLink } = req.body;

        const webinar = await WebinarModel.findById(req.params.id);
        if (!webinar) {
            return res.status(404).json({
                success: false,
                message: "Webinar not found",
            });
        }

        // Update only provided fields
        if (title) webinar.title = title;
        if (description) webinar.description = description;
        if (startTime) webinar.startTime = startTime;
        if (endTime) webinar.endTime = endTime;
        if (thumbnail) webinar.thumbnail = thumbnail;
        if (webinarLink) webinar.webinarLink = webinarLink;

        await webinar.save();

        res.status(200).json({
            success: true,
            message: "Webinar updated successfully",
            webinar,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating webinar",
            error: error.message,
        });
    }
};

export const deleteWebinar = async (req, res) => {
    try {
        const webinar = await WebinarModel.findByIdAndDelete(req.params.id);

        if (!webinar) {
            return res.status(404).json({
                success: false,
                message: "Webinar not found",
            });
        }

        res.status(200).json({
            success: true,
            message: "Webinar deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting webinar",
            error: error.message,
        });
    }
};

export const registerUserForWebinar = async (req, res) => {
    try {
        const { webinarId } = req.params;
        const { userId } = req.user;

        const webinar = await WebinarModel.findById(webinarId);
        if (!webinar) {
            return res.status(404).json({
                success: false,
                message: "Webinar not found",
            });
        }

        // Prevent duplicate registration
        if (webinar.registeredUsers.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: "User already registered for this webinar",
            });
        }

        webinar.registeredUsers.push(userId);
        webinar.registrationCount = webinar.registeredUsers.length;

        await webinar.save();

        res.status(200).json({
            success: true,
            message: "User registered successfully",
            webinar,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error registering user",
            error: error.message,
        });
    }
};

export const getWebinars = async (req, res) => {
    try {
        const { userId } = req.user;

        let webinars = await WebinarModel.find()
            .sort({ startTime: -1 })
            .populate("registeredUsers", "name email");

        // Transform response: hide webinarLink unless user is registered
        webinars = webinars.map((webinar) => {
            const isRegistered = webinar.registeredUsers.some(
                (user) => user._id.toString() === userId
            );

            return {
                _id: webinar._id,
                title: webinar.title,
                description: webinar.description,
                startTime: webinar.startTime,
                endTime: webinar.endTime,
                thumbnail: webinar.thumbnail,
                registrationCount: webinar.registrationCount,
                registeredUsers: webinar.registeredUsers,
                webinarLink: isRegistered ? webinar.webinarLink : null, // only show if registered
                createdAt: webinar.createdAt,
                updatedAt: webinar.updatedAt,
            };
        });

        res.status(200).json({
            success: true,
            count: webinars.length,
            webinars,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching webinars",
            error: error.message,
        });
    }
};
