import mongoose from "mongoose";

const PackageCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    logoUrl: {
        type: String
    }
}, { timestamps: true });

// Virtual field to link packages
PackageCategorySchema.virtual("packages", {
    ref: "Package",
    localField: "_id",
    foreignField: "category",
});

// Ensure virtuals are included in JSON
PackageCategorySchema.set("toObject", { virtuals: true });
PackageCategorySchema.set("toJSON", { virtuals: true });

export default mongoose.models.PackageCategorys || mongoose.model("PackageCategory", PackageCategorySchema);
