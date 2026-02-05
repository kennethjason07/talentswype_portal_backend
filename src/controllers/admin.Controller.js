import userModel from "../models/user.Model.js";
import OfflineCoursesModel from "../models/OfflineCourses.Model.js";
import packageOrderModel from "../models/packageOrder.Model.js";
import userProfileModel from "../models/userProfile.Model.js";

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

export const getCandidates = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        let query = { userType: "USER" };

        if (search) {
            const regex = new RegExp(search, "i");

            // 1. Find matching User IDs (Name, Email, Mobile)
            // leveraging indexes on User collection
            const userDocs = await userModel.find({
                userType: "USER",
                $or: [
                    { username: regex },
                    { email: regex },
                    { mobileNumber: regex }
                ]
            }).select("_id").lean();

            const userIdsFromName = userDocs.map(d => d._id);

            // 2. Find matching Profile IDs (Skills)
            // leveraging indexes on UserProfile collection
            const profileDocs = await userProfileModel.find({
                "skills.skill": regex
            }).select("user").lean();

            const userIdsFromSkills = profileDocs.map(d => d.user);

            // 3. Combine unique IDs
            // We use map to string to ensure uniqueness in Set, then convert back/use as is
            const combinedIds = [...userIdsFromName, ...userIdsFromSkills];
            
            // If we have search results, filter by these IDs
            if (combinedIds.length > 0) {
                query._id = { $in: combinedIds };
            } else {
                // Search term provided but no matches found -> return empty
                return res.status(200).json({
                    success: true,
                    candidates: [],
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: 0,
                        totalCandidates: 0,
                        limit: limitNum
                    }
                });
            }
        }

        // Get total count based on the query (either all USERs or filtered list)
        const totalCount = await userModel.countDocuments(query);

        // Fetch paginated data using Aggregation for efficient Lookup
        // We only lookup Profile for the relevant page of Users
        const candidatesData = await userModel.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limitNum },
            {
                $lookup: {
                    from: "userprofiles", // Collection name (lowercase plural)
                    localField: "_id",
                    foreignField: "user",
                    as: "profile"
                }
            },
            {
                $unwind: {
                    path: "$profile",
                    preserveNullAndEmptyArrays: true
                }
            },
            // Lookup most recent job application
            {
                $lookup: {
                    from: "jobapplications",
                    let: { userId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$applicant", "$$userId"] } } },
                        { $sort: { appliedAt: -1 } },
                        { $limit: 1 },
                        {
                            $lookup: {
                                from: "jobs",
                                localField: "job",
                                foreignField: "_id",
                                as: "jobDetails"
                            }
                        },
                        {
                            $unwind: {
                                path: "$jobDetails",
                                preserveNullAndEmptyArrays: true
                            }
                        },
                        { $project: { "jobDetails.position": 1, "jobDetails.company": 1 } }
                    ],
                    as: "recentApplication"
                }
            },
            {
                $unwind: {
                    path: "$recentApplication",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    username: 1,
                    email: 1,
                    mobileNumber: 1,
                    college: 1,
                    createdAt: 1,
                    "profile.position": 1,
                    "profile.city": 1,
                    "profile.state": 1,
                    "profile.skills": 1,
                    "profile.profileCompletion": 1,
                    "recentApplication.jobDetails.position": 1,
                    "recentApplication.jobDetails.company": 1
                }
            }
        ]);

        // Transform results for frontend
        const candidates = candidatesData.map(user => ({
            _id: user._id,
            username: user.username,
            email: user.email,
            mobileNumber: user.mobileNumber,
            college: user.college,
            createdAt: user.createdAt,
            position: user.profile?.position || "Not specified",
            city: user.profile?.city || "Not specified",
            state: user.profile?.state || "Not specified",
            skills: user.profile?.skills || [],
            profileCompletion: user.profile?.profileCompletion || 0,
            recentlyAppliedFor: user.recentApplication?.jobDetails?.position 
                ? `${user.recentApplication.jobDetails.position}` 
                : "Not applied yet"
        }));

        res.status(200).json({
            success: true,
            candidates,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limitNum),
                totalCandidates: totalCount,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error("Error fetching candidates:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getCandidateHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        import("../models/jobApplication.Model.js").then(async (module) => {
             const JobApplication = module.default;
             
             const applications = await JobApplication.find({ applicant: userId })
                .populate({
                    path: 'job',
                    select: 'position company jobType location annual_salary_range'
                })
                .sort({ appliedAt: -1 });

             res.status(200).json({
                 success: true,
                 applications
             });
        });
    } catch (error) {
        console.error("Error fetching candidate history:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getHRs = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        let query = { userType: "HR" };

        if (search) {
            const regex = new RegExp(search, "i");
            query.$or = [
                { username: regex },
                { email: regex },
                { mobileNumber: regex },
                { college: regex }
            ];
        }

        const totalCount = await userModel.countDocuments(query);
        const hrs = await userModel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .select("-password");

        res.status(200).json({
            success: true,
            hrs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalCount / limitNum),
                totalHRs: totalCount,
                limit: limitNum
            }
        });

    } catch (error) {
        console.error("Error fetching HRs:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
