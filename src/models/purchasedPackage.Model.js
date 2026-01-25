import mongoose from "mongoose";

const PurchasedPackageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    package: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Package",
        required: true,
    },
    purchasedAt: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ["ACTIVE", "EXPIRED"],
        default: "ACTIVE",
    }
}, { timestamps: true });

export default mongoose.models.PurchasedPackages || mongoose.model("PurchasedPackage", PurchasedPackageSchema);
