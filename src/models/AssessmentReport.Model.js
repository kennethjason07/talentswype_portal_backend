import mongoose from "mongoose";

export const AssessmentReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    assessment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Assessment',
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    remarks: {
        type: String,
        default: 'Assessment in progress'
    },
    isAssessmentCompleted: {
        type: Boolean,
        default: false
    },
    isAssessmentSuspended: {
        type: Boolean,
        default: false
    },
    assessmentSubmissionTime: {
        type: Number,
        default: 0
    },
    lastIndex: {
        type: Number,
        default: 0
    },
    assessmentScreenshots: [{
        type: String,
    }],
    proctoringViolations: {
        mic: { type: Number, default: 0 },
        invisiblecam: { type: Number, default: 0 },
        webcam: { type: Number, default: 0 },
        TabSwitch: { type: Number, default: 0 },
        multiplePersonInFrame: { type: Number, default: 0 },
        PhoneinFrame: { type: Number, default: 0 },
        ControlKeyPressed: { type: Number, default: 0 },
    },
    generatedModules: [
        {
            module: {
                moduleInfo: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "AssessmentModule",
                },
                generatedQustionSet: [
                    {
                        question: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'Qna'
                        },
                        isSubmitted: { type: Boolean, default: false },
                        isVisited: { type: Boolean, default: false },
                        markForReview: { type: Boolean, default: false },
                        submittedAnswer: { type: String }
                    }
                ]
            }
        }
    ],
}, { timestamps: true });

export default mongoose.model.AssessmentReports || mongoose.model('AssessmentReport', AssessmentReportSchema);