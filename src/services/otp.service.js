import otpModel from "../models/otp.Model.js";

/**
 * Verifies OTP for a given phone number and purpose.
 * @param {string} phone - Phone number (10 digits).
 * @param {string} otp - OTP entered by the user.
 * @param {string} purpose - Purpose of the OTP ("NUMBER_LOGIN", "FORGOT_PASSWORD", "EMAIL_LOGIN").
 * @returns {Object} result - { success: boolean, message: string, otpRecord?: Object }
 */
export async function verifyPhoneOtp(phone, otp, purpose) {
    try {
        // Validate inputs
        if (!phone || !otp || !purpose) {
            return { success: false, message: "Missing required fields" };
        }

        // Find OTP record
        const otpRecord = await otpModel.findOne({ phone, purpose });

        if (!otpRecord) {
            return { success: false, message: "OTP not found or already used" };
        }

        // Check expiry
        if (otpRecord.otpExpires < new Date()) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return { success: false, message: "OTP has expired" };
        }

        // Check match
        if (otpRecord.otp !== otp) {
            return { success: false, message: "Invalid OTP" };
        }

        // If valid → delete OTP (one-time use)
        await otpModel.deleteOne({ _id: otpRecord._id });

        return { success: true, message: "OTP verified successfully" };

    } catch (error) {
        console.error("Error verifying OTP:", error);
        return { success: false, message: "Internal server error" };
    }
}

export async function verifyEmailOtp(email, otp, purpose) {
    try {
        // Validate inputs
        if (!email || !otp || !purpose) {
            return { success: false, message: "Missing required fields" };
        }

        // Find OTP record
        const otpRecord = await otpModel.findOne({ email, purpose });

        if (!otpRecord) {
            return { success: false, message: "OTP not found or already used" };
        }

        // Check expiry
        if (otpRecord.otpExpires < new Date()) {
            await otpModel.deleteOne({ _id: otpRecord._id });
            return { success: false, message: "OTP has expired" };
        }

        // Check match
        if (otpRecord.otp !== otp) {
            return { success: false, message: "Invalid OTP" };
        }

        // If valid → delete OTP (one-time use)
        await otpModel.deleteOne({ _id: otpRecord._id });

        return { success: true, message: "OTP verified successfully" };

    } catch (error) {
        console.error("Error verifying Email OTP:", error);
        return { success: false, message: "Internal server error" };
    }
}
