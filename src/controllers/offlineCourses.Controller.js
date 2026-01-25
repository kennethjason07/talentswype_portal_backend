import OfflineCoursesModel from "../models/OfflineCourses.Model.js";
import slugify from "slugify";

export const createOfflineCourse = async (req, res) => {
    try {
        const {
            courseID,
            title,
            slug,
            featured_image,
            featured_video,
            bannerImg,
            duration,
            enrollments,
            level,
            total_lessons,
            total_quiz,
            category,
            subcategory,
            base_price,
            discount_percentage,
            rating,
            credits,
            coursePeriod,
            isActive,
            courseStartDate,
            overview,
            whatWillILearn,
            curriculum,
            faqs,
        } = req.body;

        if (!title) {
            return res.status(400).json({ success: false, message: "Course title is required" });
        }

        // Generate slug if not provided
        const courseSlug = slug
            ? slug
            : slugify(title, { lower: true, strict: true });

        // Check if course with same slug already exists
        const existingCourse = await OfflineCoursesModel.findOne({ slug: courseSlug });
        if (existingCourse) {
            return res.status(400).json({ success: false, message: "Course with this title/slug already exists" });
        }

        const newCourse = new OfflineCoursesModel({
            courseID,
            title,
            slug: courseSlug,
            featured_image,
            featured_video,
            bannerImg,
            duration,
            enrollments,
            level,
            total_lessons,
            total_quiz,
            category,
            subcategory,
            base_price,
            discount_percentage,
            rating,
            credits,
            coursePeriod,
            isActive,
            courseStartDate,
            overview,
            whatWillILearn,
            curriculum,
            faqs,
            reviews: [], // Initially no reviews
        });

        await newCourse.save();

        res.status(201).json({
            success: true,
            message: "Offline course created successfully",
            course: newCourse,
        });
    } catch (error) {
        console.error("Error creating offline course:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getOfflineCourses = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            subcategory,
            level,
            coursePeriod,
            isActive,
            minRating,
            minPrice,
            maxPrice,
            sortBy, // rating | price | enrollments | newest
        } = req.query;

        // Build filters dynamically
        const filter = {};

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: "i" } },
                { overview: { $regex: search, $options: "i" } },
            ];
        }

        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;
        if (level) filter.level = level;
        if (coursePeriod) filter.coursePeriod = coursePeriod;
        if (isActive !== undefined) filter.isActive = isActive === "true";
        if (minRating) filter.rating = { $gte: Number(minRating) };

        if (minPrice || maxPrice) {
            filter.base_price = {};
            if (minPrice) filter.base_price.$gte = Number(minPrice);
            if (maxPrice) filter.base_price.$lte = Number(maxPrice);
        }

        // Sorting logic
        let sortOption = { createdAt: -1 }; // default newest first
        if (sortBy) {
            switch (sortBy) {
                case "rating":
                    sortOption = { rating: -1 };
                    break;
                case "price":
                    sortOption = { base_price: 1 }; // ascending
                    break;
                case "enrollments":
                    sortOption = { enrollments: -1 };
                    break;
                case "newest":
                    sortOption = { createdAt: -1 };
                    break;
                default:
                    sortOption = { createdAt: -1 };
            }
        }

        // Pagination
        const skip = (Number(page) - 1) * Number(limit);

        const courses = await OfflineCoursesModel.find(filter)
            .sort(sortOption)
            .skip(skip)
            .limit(Number(limit));

        const totalCourses = await OfflineCoursesModel.countDocuments(filter);

        res.status(200).json({
            total: totalCourses,
            page: Number(page),
            pages: Math.ceil(totalCourses / limit),
            count: courses.length,
            courses,
        });
    } catch (error) {
        console.error("Error fetching courses:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getOfflineCourseById = async (req, res) => {
    try {
        const { id } = req.params;
        const course = await OfflineCoursesModel.findById(id).populate('reviews.user', 'name email');
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, course });
    } catch (error) {
        console.error("Error fetching course by ID:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const updateOfflineCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        if (updateData.title) {
            updateData.slug = slugify(updateData.title, { lower: true, strict: true });
        }
        const updatedCourse = await OfflineCoursesModel.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, message: "Course updated successfully", course: updatedCourse });
    } catch (error) {
        console.error("Error updating course:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteOfflineCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await OfflineCoursesModel.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const addCourseReview = async (req, res) => {
    try {
        const { id } = req.params; // course ID
        const { rating, comment } = req.body;
        const userId = req.user.id; // assuming user ID is available in req.user
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
        }
        const course = await OfflineCoursesModel.findById(id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        // Check if user has already reviewed
        const existingReview = course.reviews.find(review => review.user.toString() === userId);
        if (existingReview) {

            return res.status(400).json({ success: false, message: "You have already reviewed this course" });
        }
        const newReview = {
            user: userId,
            rating,
            comment,
            date: new Date(),
        };
        course.reviews.push(newReview);
        // Recalculate average rating
        course.rating = course.reviews.reduce((acc, item) => item.rating + acc, 0) / course.reviews.length;
        await course.save();
        res.status(201).json({ success: true, message: "Review added successfully", review: newReview });
    } catch (error) {
        console.error("Error adding review:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await OfflineCoursesModel.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
}