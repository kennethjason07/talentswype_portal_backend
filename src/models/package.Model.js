import mongoose from "mongoose";

const PackageSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    price: {
        type: Number,
        required: true
    },
    features: [
        {
            type: String
        }
    ],
    isRecommended: {
        type: Boolean,
        default: false
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "PackageCategory",
        required: true,
    }
}, { timestamps: true });

export default mongoose.models.Packages || mongoose.model("Package", PackageSchema);
