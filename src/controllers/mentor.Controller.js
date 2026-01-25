import { MentorModel } from "../models/mentor.Model.js";

export const createMentor = async (req, res) => {
    try {
        const { name, designation, company, experience, description, imageUrl, perHoursRate, skills } = req.body;

        // Validate required fields
        if (!name || !designation || !company || !experience || !description) {
            return res.status(400).json({ success: false, message: "All required fields must be provided." });
        }

        const newMentor = new MentorModel({
            name,
            designation,
            company,
            experience,
            description,
            imageUrl,
            perHoursRate,
            skills,
        });

        await newMentor.save();

        res.status(201).json({
            success: true,
            message: "Mentor created successfully",
            mentor: newMentor,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating mentor",
            error: error.message,
        });
    }
};

// ✅ Get All Mentors with Filters, Search, Pagination & Sorting
export const getAllMentors = async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            designation,
            company,
            skills,
            minRate,
            maxRate,
            search,
            sortBy = "createdAt",
            sortOrder = "desc",
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);

        // Build filter object
        const filter = {};

        if (designation) filter.designation = { $regex: designation, $options: "i" };
        if (company) filter.company = { $regex: company, $options: "i" };
        if (skills) filter.skills = { $in: skills.split(",") }; // multiple skills comma-separated
        if (minRate || maxRate) {
            filter.perHoursRate = {};
            if (minRate) filter.perHoursRate.$gte = parseInt(minRate);
            if (maxRate) filter.perHoursRate.$lte = parseInt(maxRate);
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { designation: { $regex: search, $options: "i" } },
                { company: { $regex: search, $options: "i" } },
            ];
        }

        // Sorting
        const sort = {};
        sort[sortBy] = sortOrder === "asc" ? 1 : -1;

        // Fetch data with pagination
        const mentors = await MentorModel.find(filter)
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await MentorModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            limit,
            mentors,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching mentors",
            error: error.message,
        });
    }
};

export const getMentorById = async (req, res) => {
    try {
        const { id } = req.params;
        const mentor = await MentorModel.findById(id);

        if (!mentor) return res.status(404).json({ success: false, message: "Mentor not found" });

        res.status(200).json({ success: true, message: "Mentor fetched successfully", mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching mentor", error: error.message });
    }
};

export const updateMentor = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedMentor = await MentorModel.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true,
        });

        if (!updatedMentor) return res.status(404).json({ success: false, message: "Mentor not found" });

        res.status(200).json({
            success: true,
            message: "Mentor updated successfully",
            mentor: updatedMentor,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error updating mentor", error: error.message });
    }
};

export const deleteMentor = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedMentor = await MentorModel.findByIdAndDelete(id);

        if (!deletedMentor) return res.status(404).json({ success: false, message: "Mentor not found" });

        res.status(200).json({ success: true, message: "Mentor deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Error deleting mentor", error: error.message });
    }
};
