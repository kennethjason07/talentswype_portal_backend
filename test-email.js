import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

async function testEmail() {
    console.log("🚀 Starting Email Test Script...");
    console.log(`ENV Check: USER=${process.env.EMAIL_USER ? 'OK' : 'MISSING'} PASS=${process.env.EMAIL_PASS ? 'OK' : 'MISSING'}`);

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("❌ Credentials missing. Aborting.");
        return;
    }

    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        logger: true, // Log to console
        debug: true   // Include SMTP traffic in logs
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
