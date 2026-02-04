import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function testEmail() {
    console.log("🚀 Starting Email Test Script (Standard SMTP)...");
    console.log(`ENV Check:`);
    console.log(`HOST=${process.env.SMTP_HOST || 'MISSING'}`);
    console.log(`PORT=${process.env.SMTP_PORT || 'MISSING'}`);
    console.log(`USER=${process.env.EMAIL_USER || 'MISSING'}`);
    console.log(`PASS=${process.env.EMAIL_PASS ? 'Set' : 'MISSING'}`);

    if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ SMTP credentials missing in .env. Need SMTP_HOST, SMTP_PORT, EMAIL_USER, EMAIL_PASS.");
        return;
    }

    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: parseInt(process.env.SMTP_PORT || "587") === 465, // true for 465, false for 587
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        logger: true,
        debug: true
    });

    const mailOptions = {
        from: `"Test Script" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER, // Send to yourself
        subject: "Test Email from Server SSH",
        text: "If you receive this, Nodemailer is working.",
    };

    try {
        console.log("📨 Sending...");
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ SUCCESS!");
        console.log("Message ID:", info.messageId);
        console.log("Response:", info.response);
    } catch (error) {
        console.error("❌ FAILED!");
        console.error(error);
    }
}

testEmail();
