import packageModel from "../models/package.Model.js";
import packageCategoryModel from "../models/packageCategory.Model.js";
import purchasedPackageModel from "../models/purchasedPackage.Model.js";
import userModel from "../models/user.Model.js";

export const createCategory = async (req, res) => {
    try {
        const { name, logoUrl } = req.body;

        // 1. Check if category already exists
        const existingCategory = await packageCategoryModel.findOne({ name });
        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "Category with this name already exists",
            });
        }

        // 2. Create new category
        const newCategory = await packageCategoryModel.create({ name, logoUrl });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            category: newCategory,
        });
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const getAllCategories = async (req, res) => {
    try {
        const categories = await packageCategoryModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;

        const category = await packageCategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        const packages = await packageModel.find({ category: id });

        res.status(200).json({
            success: true,
            category,
            packages,
        });
    } catch (error) {
        console.error("Error fetching category:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, logoUrl } = req.body;

        const updatedCategory = await packageCategoryModel.findByIdAndUpdate(
            id,
            { name, logoUrl },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: updatedCategory,
        });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Check if category exists
        const category = await packageCategoryModel.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        // 2. Delete all packages in this category
        await packageModel.deleteMany({ category: id });

        // 3. Delete the category itself
        await category.deleteOne();

        res.status(200).json({
            success: true,
            message: "Category and all its packages deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const createPackage = async (req, res) => {
    try {
        const { name, description, price, features, isRecommended, category } = req.body;

        // 1. Check if category exists
        const categoryExists = await packageCategoryModel.findById(category);
        if (!categoryExists) {
            return res.status(404).json({ message: "Category not found" });
        }

        // 2. Create new package
        const newPackage = await packageModel.create({
            name,
            description,
            price,
            features,
            isRecommended,
            category
        });

        res.status(201).json({
            success: true,
            message: "Package created successfully",
            package: newPackage
        });
    } catch (error) {
        console.error("Error creating package:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getAllPackages = async (req, res) => {
    try {
        const packages = await packageModel
            .find()
            .populate("category", "name logoUrl")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            packages,
        });
    } catch (error) {
        console.error("Error fetching packages:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const getPackageById = async (req, res) => {
    try {
        const { id } = req.params;
        const packageData = await packageModel
            .findById(id)
            .populate("category", "name logoUrl");

        if (!packageData) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }

        res.status(200).json({ success: true, package: packageData });
    } catch (error) {
        console.error("Error fetching package:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const updatePackage = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, features, isRecommended, category } = req.body;

        // Ensure category exists if updating category
        if (category) {
            const categoryExists = await packageCategoryModel.findById(category);
            if (!categoryExists) {
                return res.status(404).json({ success: false, message: "Category not found" });
            }
        }

        const updatedPackage = await packageModel.findByIdAndUpdate(
            id,
            { name, description, price, features, isRecommended, category },
            { new: true, runValidators: true }
        );

        if (!updatedPackage) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }

        res.status(200).json({
            success: true,
            message: "Package updated successfully",
            package: updatedPackage,
        });
    } catch (error) {
        console.error("Error updating package:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedPackage = await packageModel.findByIdAndDelete(id);

        if (!deletedPackage) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }

        res.status(200).json({
            success: true,
            message: "Package deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting package:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getCategoriesWithPackages = async (req, res) => {
    try {
        const categories = await packageCategoryModel.find()
            .populate({
                path: "packages", // virtual field, we’ll define in the schema
                select: "name description price features isRecommended createdAt updatedAt",
            })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: categories.length,
            categories,
        });
    } catch (error) {
        console.error("Error fetching categories with packages:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const purchasePackage = async (req, res) => {
    try {
        const { packageId } = req.body;
        const userId = req.user.userId; // from auth middleware

        // 1. Validate package
        const pkg = await packageModel.findById(packageId);
        if (!pkg) {
            return res.status(404).json({ success: false, message: "Package not found" });
        }

        // 2. Find user
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // 3. Mark previous active package as expired (if exists)
        if (user.activePackage) {
            await purchasedPackageModel.findOneAndUpdate(
                { user: user._id, package: user.activePackage, status: "ACTIVE" },
                { status: "EXPIRED", expiresAt: new Date() }
            );
        }

        // 4. Create new purchase record
        const newPurchase = await purchasedPackageModel.create({
            user: user._id,
            package: packageId,
            purchasedAt: new Date(),
            status: "ACTIVE"
        });

        // 5. Update user with active package
        user.activePackage = packageId;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Package purchased successfully",
            purchase: newPurchase,
        });
    } catch (error) {
        console.error("Error purchasing package:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};

export const getActivePackage = async (req, res) => {
    try {
        const userId = req.user.userId;

        const activePackage = await purchasedPackageModel.findOne({
            user: userId,
            status: "ACTIVE"
        }).populate("package"); // populate package details if needed

        if (!activePackage) {
            return res.status(404).json({ success: false, message: "No active package found" });
        }

        res.status(200).json({
            success: true,
            activePackage,
        });
    } catch (error) {
        console.error("Error fetching active package:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};

export const getPurchaseHistory = async (req, res) => {
    try {
        const userId = req.user.userId;

        const history = await purchasedPackageModel.find({ user: userId })
            .populate("package", "name price")
            .sort({ purchasedAt: -1 });

        res.status(200).json({
            success: true,
            history,
        });
    } catch (error) {
        console.error("Error fetching purchase history:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};
