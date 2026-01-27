import nodemailer from "nodemailer";

// Create transporter (using Gmail as example)
const transporter = nodemailer.createTransport({
    service: "gmail", // you can also use "smtp.mailtrap.io" for testing
    auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // app password or email password
    },
});

/**
 * Send email
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} text - Plain text body
 * @param {string} [html] - HTML body
 */
export async function sendEmail(to, subject, text, html = null) {
    try {
        const mailOptions = {
            from: `"TalentSwype" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent: ", info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error("❌ Error sending email:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate email template for login OTP
 * @param {string} otp - The one-time password
 * @param {string} username - The user's name
 * @returns {{ subject: string, text: string, html: string }}
 */
export function loginOtpTemplate(otp) {
    const subject = "Your Login OTP Code";

    const text = `Your OTP code is: ${otp}\nThis code will expire in 5 minutes.\n\nIf you didn't request this, please ignore.`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Login Verification</h2>
            <p>Your OTP code is:</p>
            <div style="font-size: 24px; font-weight: bold; color: #2c3e50; background: #f4f4f4; padding: 10px; text-align: center; border-radius: 8px; letter-spacing: 3px;">
                ${otp}
            </div>
            <p style="margin-top: 20px;">This code will expire in <b>5 minutes</b>.</p>
            <p>If you didn’t request this, please ignore this email.</p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} TalentSwype. All rights reserved.</p>
        </div>
    `;

    return { subject, text, html };
}

export function forgotPasswordOtpTemplate(otp) {
    const subject = "Your Password Reset OTP Code";

    const text = `We received a request to reset your password.\n\nYour OTP code is: ${otp}\nThis code will expire in 5 minutes.\n\nIf you didn’t request this, please ignore.`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">🔑 Password Reset Request</h2>
            <p>We received a request to reset your password.</p>
            <p>Your OTP code is:</p>
            <div style="font-size: 24px; font-weight: bold; color: #c0392b; background: #f9ecec; padding: 10px; text-align: center; border-radius: 8px; letter-spacing: 3px;">
                ${otp}
            </div>
            <p style="margin-top: 20px;">This code will expire in <b>5 minutes</b>.</p>
            <p>If you didn’t request this, you can safely ignore this email.</p>
            <hr style="margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} TalentSwype. All rights reserved.</p>
        </div>
    `;

    return { subject, text, html };
}

/**
 * Template for sending auto-generated password after registration
 * @param {string} password - Auto-generated password
 * @param {string} username - User's name (optional)
 * @returns {{ subject: string, text: string, html: string }}
 */
export function registerAutoPasswordTemplate(password, username = "User") {
    const subject = "Welcome to TalentSwype 🎉 - Your Account Details";

    const text = `Hello ${username},

Welcome to TalentSwype! We're excited to have you on board.

Here are your login details:
Password: ${password}

For security, please change your password after logging in.

Thank you for joining us!
- The MyApp Team`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">🎉 Welcome to MyApp</h2>
            <p>Hello <b>${username}</b>,</p>
            <p>We’re excited to have you on board! Here are your login details:</p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f4f4f4; border-radius: 8px;">
                <p style="margin: 5px 0; font-size: 16px;"><b>Password:</b> 
                    <span style="font-family: monospace; font-size: 18px; background: #fff; padding: 4px 8px; border: 1px dashed #ccc; border-radius: 5px;">
                        ${password}
                    </span>
                </p>
            </div>
            
            <p style="margin-top: 20px;">🔒 For security, please change your password immediately after logging in.</p>
            
            <p>Thank you for joining us!<br/>- The <b>MyApp Team</b></p>
            
            <hr style="margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} MyApp. All rights reserved.</p>
        </div>
    `;

    return { subject, text, html };
}

/**
 * Template for email verification
 * @param {string} token - Verification token
 * @param {string} username - User's name
 * @param {string} baseUrl - Base URL of the client application
 * @returns {{ subject: string, text: string, html: string }}
 */
export function emailVerificationTemplate(token, username, baseUrl) {
    const subject = "Verify your email address - TalentSwype";
    const verificationLink = `${baseUrl}/verify-email?token=${token}`;
    
    const text = `Hello ${username},\n\nThank you for registering with TalentSwype!\n\nPlease verify your email address by clicking the following link:\n${verificationLink}\n\nThis link will expire in 24 hours.\n\nIf you didn't create an account, please ignore this email.`;
    
    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Welcome to TalentSwype! 👋</h2>
            <p>Hello <b>${username}</b>,</p>
            <p>Thank you for registering! To complete your registration and access all features, please verify your email address.</p>
            
            <div style="margin: 30px 0; text-align: center;">
                <a href="${verificationLink}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">Verify Email Address</a>
            </div>
            
            <p style="color: #666; font-size: 14px;">Or copy and paste this link in your browser:</p>
            <p style="color: #007bff; font-size: 12px; word-break: break-all; background: #f4f4f4; padding: 10px; border-radius: 5px;">${verificationLink}</p>
            
            <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">⏰ <b>Important:</b> This verification link will expire in <b>24 hours</b>.</p>
            </div>
            
            <p style="margin-top: 20px; color: #666; font-size: 14px;">If you didn't create an account with TalentSwype, you can safely ignore this email.</p>
            
            <hr style="margin: 20px 0;" />
            <p style="font-size: 12px; color: #777;">© ${new Date().getFullYear()} TalentSwype. All rights reserved.</p>
        </div>
    `;

    return { subject, text, html };
}
