import mongoose from "mongoose";

export const OtpSchema = new mongoose.Schema({
    email: {
        type: String,
    },
    phone: {
        type: Number,
    },
    otp: {
        type: String,
        required: true
    },
    otpExpires: {
        type: Date,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    purpose: {
        type: String,
        enum: ['NUMBER_LOGIN' , 'EMAIL_LOGIN', 'FORGOT_PASSWORD'],
        default: 'NUMBER_LOGIN'
    }
});

export default mongoose.model.Otps || mongoose.model('Otp', OtpSchema);