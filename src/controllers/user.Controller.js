import crypto from "crypto";
import bcrypt from 'bcrypt';
import validator from 'validator';
import userModel from "../models/user.Model.js";
import { sendSMS } from "../services/twilio.service.js";
import otpModel from "../models/otp.Model.js";
import { verifyEmailOtp, verifyPhoneOtp } from "../services/otp.service.js";
import { forgotPasswordOtpTemplate, registerAutoPasswordTemplate, sendEmail, emailVerificationTemplate } from "../services/email/index.js";
import { welcomeEmailTemplate } from "../services/email/candidateTemplates.js";
import { welcomeHRTemplate } from "../services/email/hrTemplates.js";
import userProfileModel from "../models/userProfile.Model.js";
import packageModel from "../models/package.Model.js";
import purchasedPackageModel from "../models/purchasedPackage.Model.js";

export async function registerUser(req, res) {
    try {
        // Check if signup limit is reached
        const userCount = await userModel.countDocuments();
        if (userCount >= 60) {
            return res.status(403).json({
                success: false,
                message: "Signup limit reached. Maximum 60 users allowed.",
            });
        }

        const { username, email, mobileNumber, college, userType } = req.body;

        // Validate email
        if (!validator.isEmail(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        // Validate phone number (basic example, you can use more specific patterns)
        const phoneRegex = /^[0-9]{10}$/; // Assuming 10 digit phone numbers
        if (!phoneRegex.test(mobileNumber)) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number",
            });
        }

        // Validate required fields
        if (!username || !email || !mobileNumber || !college || !req.body.password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields",
            });
        }

        // Check if user already exists by email
        const existingNumber = await userModel.findOne({ mobileNumber });
        if (existingNumber) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this Mobile Number",
            });
        }

        // Check if user already exists by email
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email",
            });
        }

        // Hash the user-provided password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new user with generated password
        const user = new userModel({
            username,
            email,
            mobileNumber,
            college,
            password: hashedPassword,
            userType: userType || "USER",
        });


        // Generate verification token with 24-hour expiration
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const unsubscribeToken = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        user.emailVerificationToken = emailVerificationToken;
        user.unsubscribeToken = unsubscribeToken;
        user.emailVerificationTokenExpires = tokenExpires;

        // Send Verification Email
        const clientUrl = process.env.CLIENT_BASE_URL || "http://localhost:3000";
        const { subject, text, html } = emailVerificationTemplate(emailVerificationToken, username, clientUrl);
        await sendEmail(email, subject, text, html);

        // Send Welcome Email (Immediate) for Job Seekers
        if (user.userType === "USER") {
            const firstName = username ? username.split(" ")[0] : "Job Seeker";
            const welcomeEmail = welcomeEmailTemplate(firstName);
            await sendEmail(email, welcomeEmail.subject, welcomeEmail.text, welcomeEmail.html);
        } else if (user.userType === "HR") {
            // Send Welcome Email (Immediate) for HR
            const firstName = username ? username.split(" ")[0] : "HR Partner";
            const welcomeEmail = welcomeHRTemplate(firstName);
            await sendEmail(email, welcomeEmail.subject, welcomeEmail.text, welcomeEmail.html);
        }

        await user.save();

        /* 
        // Automatically assign the highest package to new users (Disabled for Free Access)
        try {
            // Find the highest-priced package
            const highestPackage = await packageModel.findOne().sort({ price: -1 }).limit(1);
            
            if (highestPackage) {
                // Create a purchased package record
                await purchasedPackageModel.create({
                    user: user._id,
                    package: highestPackage._id,
                    purchasedAt: new Date(),
                    status: "ACTIVE"
                });

                // Update user with active package
                user.activePackage = highestPackage._id;
                await user.save();

                console.log(`✅ Assigned highest package "${highestPackage.name}" to user ${user.email}`);
            } else {
                console.warn("⚠️ No packages found in database. User registered without a package.");
            }
        } catch (packageError) {
            console.error("Error assigning package to new user:", packageError);
            // Don't fail registration if package assignment fails
        }
        */

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                mobileNumber: user.mobileNumber,
                college: user.college,
            }
        });
    } catch (error) {
        console.error("Register User Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function loginUserWithEmailPassword(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(401).send({
                success: false,
                message: "Please provide email or password",
            });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(200).send({
                success: false,
                message: "Email is not registerd",
            });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: "Please verify your email address to login",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({
                success: false,
                message: "Invlid username or password",
            });
        }

        const token = user.generateAuthToken();

        return res.status(200).send({
            success: true,
            messgae: "login successfully",
            token,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error: " + error.message });
    }
}

export async function sendLoginOtp(req, res) {
    try {
        const { phone } = req.body;

        // Validate phone
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({
                success: false,
                message: "Invalid mobile number (must be 10 digits)",
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ mobileNumber: phone });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this mobile number",
            });
        }

        // Generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999).toString();

        // Expiry: 10 minutes
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

        // Remove any old OTP for this user
        await otpModel.deleteMany({ phone, purpose: "NUMBER_LOGIN" });

        // Save new OTP
        const otpDoc = new otpModel({
            phone,
            otp,
            otpExpires,
            purpose: "NUMBER_LOGIN",
        });

        await otpDoc.save();

        // Send OTP via SMS
        await sendSMS(phone, `Your login OTP is: ${otp}. It expires in 5 minutes.`);

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully",
        });
    } catch (error) {
        console.error("Send Login OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function verifyLoginOtp(req, res) {
    try {
        const { phone, otp } = req.body;

        // Validate input
        if (!phone || !otp) {
            return res.status(400).json({
                success: false,
                message: "Phone number and OTP are required",
            });
        }

        // Find OTP document
        const otpRecord = await otpModel.findOne({ phone, purpose: "NUMBER_LOGIN" });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP not found or already used",
            });
        }

        // Check expiry
        if (otpRecord.otpExpires < new Date()) {
            await otpModel.deleteOne({ _id: otpRecord._id }); // remove expired otp
            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        // Check OTP match
        if (otpRecord.otp !== otp) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // OTP is valid → get user
        const user = await userModel.findOne({ mobileNumber: phone });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Delete OTP after successful verification (one-time use)
        await otpModel.deleteOne({ _id: otpRecord._id });

        const token = user.generateAuthToken();

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
                mobileNumber: user.mobileNumber,
                college: user.college,
                token,
            }
        });
    } catch (error) {
        console.error("Verify Login OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function sendForgotPasswordOtp(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if user exists
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email",
            });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins expiry

        // Remove old OTPs for email reset
        await otpModel.deleteMany({ email, purpose: "FORGOT_PASSWORD" });

        const otpDoc = new otpModel({
            email,
            otp,
            otpExpires,
            purpose: "FORGOT_PASSWORD",
        });

        await otpDoc.save();

        // Send Email
        const { subject, text, html } = await forgotPasswordOtpTemplate(otp);
        await sendEmail(email, subject, text, html);

        return res.status(200).json({
            success: true,
            message: "OTP sent to email for password reset",
        });
    } catch (error) {
        console.error("Send Forgot Password Email OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function verifyForgotPasswordOtp(req, res) {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const result = await verifyEmailOtp(email, otp, "FORGOT_PASSWORD");
        if (!result.success) {
            return res.status(400).json(result);
        }

        // OTP is valid → get user
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const token = user.generateAuthToken();

        return res.status(200).json({ result, token });
    } catch (error) {
        console.error("Verify Forgot Password OTP Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export async function resetPassword(req, res) {
    try {
        const { userId } = req.user;
        const { newPassword } = req.body;

        if (!newPassword) {
            return res.status(400).json({
                success: false,
                message: "New password are required",
            });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const result = await userModel.updateOne(
            { _id: userId },
            { $set: { password: hashedPassword } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found or password not updated",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
}

export const updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.user; // assuming user is added by auth middleware
        const updates = req.body;

        // Find profile
        let profile = await userProfileModel.findOne({ user: userId });

        if (!profile) {
            // ✅ Create new profile if not exists
            profile = new userProfileModel({
                user: userId,
                ...updates
            });
        } else {
            // ✅ Update fields (shallow merge for objects, replace arrays)
            Object.keys(updates).forEach(key => {
                if (Array.isArray(updates[key])) {
                    // Replace arrays like projects, skills, certifications
                    profile[key] = updates[key];
                } else if (typeof updates[key] === "object" && updates[key] !== null) {
                    // Merge nested objects like profileLinks
                    profile[key] = { ...profile[key], ...updates[key] };
                } else {
                    // Simple field update
                    profile[key] = updates[key];
                }
            });
        }

        // Save triggers pre("save") → profileCompletion update
        await profile.save();

        res.status(200).json({
            success: true,
            message: profile.isNew ? "Profile created successfully" : "Profile updated successfully",
            profile
        });
    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getUser = async (req, res) => {
    try {
        const { userId } = req.user;

        const user = await userModel.findById(userId)
            .select("-password")
            .populate("activePackage");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: "Invalid token" });
        }

        const user = await userModel.findOne({ emailVerificationToken: token });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired verification token" });
        }

        // Check if token has expired
        if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < new Date()) {
            return res.status(400).json({ 
                success: false, 
                message: "Verification link has expired. Please request a new one.",
                expired: true
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = null; // Clear token after usage
        user.emailVerificationTokenExpires = null; // Clear expiration
        await user.save();

        res.status(200).json({ success: true, message: "Email verified successfully! You can now login." });
    } catch (error) {
        console.error("Email Verification Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ success: false, message: "Email is required" });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: "No account found with this email" });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: "Email is already verified" });
        }

        // Generate new verification token
        const emailVerificationToken = crypto.randomBytes(32).toString("hex");
        const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationTokenExpires = tokenExpires;
        await user.save();

        // Send new verification email
        const clientUrl = process.env.CLIENT_BASE_URL || "http://localhost:3000";
        const { subject, text, html } = emailVerificationTemplate(emailVerificationToken, user.username, clientUrl);
        await sendEmail(email, subject, text, html);

        res.status(200).json({ success: true, message: "Verification email sent successfully" });
    } catch (error) {
        console.error("Resend Verification Email Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const unsubscribeUser = async (req, res) => {
    try {
        // Find user by userId from auth token (if logged in) OR find by query param?
        // Usually unsubscribe links work without login.
        // We'll trust the userId is passed or use a token.
        // But for MVP, let's assume we might receive a simple query/body.
        // Better: Unsubscribe via token like verification.
        
        // For now, let's assume the user calls this endpoint while logged in OR we implement a token based unsubscribe later.
        // But the guide says: portal.talentswype.com/unsubscribe?token=unsubscribe_token
        // So we need to look up by token.
        
        // UNTIL we implement a dedicated unsubscribe token on signup, we can't easily do this securely without login.
        // BUT wait, I just added `unsubscribeToken` field in the Model! I should generate it on signup.
        
        const { token } = req.body; 

        if (!token) {
             return res.status(400).json({ success: false, message: "Token is required" });
        }

        const user = await userModel.findOne({ unsubscribeToken: token });
        if (!user) {
             return res.status(400).json({ success: false, message: "Invalid token" });
        }

        user.emailUnsubscribed = true;
        await user.save();

        res.status(200).json({ success: true, message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("Unsubscribe Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
