import mongoose from "mongoose";

export const OfflineCoursesSchema = new mongoose.Schema({
    courseID: { type: String },
    title: { type: String, required: true },
    slug: { type: String, required: true },
    featured_image: { type: String },
    featured_video: { type: String },
    bannerImg: { type: String },
    duration: { type: Number, default: 0 },
    enrollments: { type: Number },
    level: {
        type: String,
        enum: ['Beginner' , 'Intermediate', 'Advanced'],
        default: "Beginner"
    },
    total_lessons: { type: Number },
    total_quiz: { type: Number },
    category: { type: String },
    subcategory: { type: String },
    base_price: { type: Number },
    discount_percentage: { type: Number },
    rating: { type: Number },
    credits: { type: Number },
    coursePeriod: {
        type: String,
        enum: ['30–90 Days', '6 Months']
    },
    isActive: { type: Boolean, default: true },
    courseStartDate: { type: Date, default: Date.now() },
    overview: { type: String },
    whatWillILearn: [
        {
            type: String
        }
    ],
    curriculum: [
        {
            module_name: { type: String },
            module_time: { type: Number },
            lessons: [
                {
                    lesson_name: { type: String },
                    duration: { type: String },
                    video: { type: String },
                },
            ],
        }
    ],
    faqs: [{
        question: { type: String },
        answer: { type: String }
    }],
    reviews: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true,
            },
            review: { type: String },
            reating: { type: Number },
            userName: { type: String },
            userProfileImg: { type: String }
        }
    ],
});

export default mongoose.model.OfflineCourses || mongoose.model('OfflineCourses', OfflineCoursesSchema);