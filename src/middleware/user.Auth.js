import jwt from 'jsonwebtoken';
import 'dotenv/config'
import UserModel from "../models/user.Model.js";

export default async function UserAuth(req, res, next) {
    try {
        // access authorize header to validate request
        const token = req.headers.authorization.split(' ')[1];

        const decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

        // res.json(decodedToken)
        let { userId } = decodedToken
        let user = await UserModel.findById(userId);
        if (user) {
            req.user = decodedToken;
            next();
        } else {
            throw new Error("Invalid user or token");
        }
    } catch (error) {
        return res.status(401).json({ error: "Authentication Failed!" })
    }
}

export const allowRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({ success: false, message: "You are not allowed to perform this action" });
        }
        next();
    };
};

export const verifyActivePackage = async (req, res, next) => {
    try {
        const userId = req.user?.userId; // from auth middleware after JWT verification

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized. Please log in first.",
            });
        }

        // Fetch user
        const user = await UserModel.findById(userId).populate("activePackage");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        if (!user.activePackage) {
            return res.status(403).json({
                success: false,
                message: "Access denied. No active package found.",
            });
        }

        // Attach active package to request (for further usage if needed)
        req.activePackage = user.activePackage;

        next();
    } catch (error) {
        console.error("Error verifying active package:", error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message,
        });
    }
};
