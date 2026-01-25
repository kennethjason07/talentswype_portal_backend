import mongoose from "mongoose";

export const QnaSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
    },
    options: {
        type: Object,
        required: true,
    },
    answer: {
        type: String,
        required: true,
    },
    maxMarks: {
        type: Number,
        default: 1
    },
    negativeMarks: {
        type: Number,
        default: 0
    },
});

export default mongoose.models.Qna || mongoose.model('Qna', QnaSchema);