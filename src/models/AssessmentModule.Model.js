import mongoose from 'mongoose';

const AssessmentModuleSchema = new mongoose.Schema({
    module_id: { type: Number },
    moduleName: { type: String },
    timelimit: { type: Number, default: 60 },
    noOfQuestions: {
        type: Number,
        default: function () {
            return this.questions?.length || 0; // Default to questions length or 0
        }
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Qna',
        }
    ]
}, { timestamps: true });

export default mongoose.models.AssessmentModule || mongoose.model('AssessmentModule', AssessmentModuleSchema);
