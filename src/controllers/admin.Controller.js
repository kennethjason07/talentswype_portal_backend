import userModel from "../models/user.Model.js";
import OfflineCoursesModel from "../models/OfflineCourses.Model.js";
import packageOrderModel from "../models/packageOrder.Model.js";

export const getAdminStats = async (req, res) => {
    try {
        // Enrolled Students (Total users with type USER)
        const enrolledStudents = await userModel.countDocuments({ userType: "USER" });

        // Total Courses
        const totalCoursesCount = await OfflineCoursesModel.countDocuments();
        const activeCoursesCount = await OfflineCoursesModel.countDocuments({ isActive: true });
        const inactiveCoursesCount = totalCoursesCount - activeCoursesCount;

        // Enrolled Courses (This might need a separate enrollment model, but for now we'll sum the enrollments count if it exists in the course model)
        const courses = await OfflineCoursesModel.find({}, "enrollments");
        const totalEnrollments = courses.reduce((acc, course) => acc + (course.enrollments || 0), 0);

        // Total Earnings (Sum of all package purchase amounts)
        const orders = await packageOrderModel.find({ status: "COMPLETED" }, "amount");
        const totalEarnings = orders.reduce((acc, order) => acc + (order.amount || 0), 0);

        // Admin Users
        const adminUsers = await userModel.countDocuments({ userType: "ADMIN" });

        // Universities (Total unique colleges)
        const uniqueColleges = await userModel.distinct("college");
        const universityCount = uniqueColleges.length;

        // Trainers (This role isn't explicitly in the enum, but if it was, we'd count it. For now, placeholders or HR)
        const trainerCount = await userModel.countDocuments({ userType: "HR" }); // Using HR as a proxy if Trainer role is missing

        res.status(200).json({
            success: true,
            stats: {
                enrolledStudents,
                totalEnrollments,
                totalCourses: totalCoursesCount,
                activeCourses: activeCoursesCount,
                inactiveCourses: inactiveCoursesCount,
                totalEarnings,
                adminUsers,
                universityCount,
                trainerCount
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
