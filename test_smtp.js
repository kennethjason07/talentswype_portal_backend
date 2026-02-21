import nodemailer from "nodemailer";
import './src/configs/dotenv.js';

async function testEmailConnection() {
    const smtpHost = process.env.SMTP_HOST || "mail.talentswype.com";
    const smtpPort = parseInt(process.env.SMTP_PORT || "465");
    const isSecure = smtpPort === 465;

    console.log("-----------------------------------------");
    console.log("📧 EMAIL CONNECTION TEST");
    console.log("-----------------------------------------");
    console.log(`Host:    ${smtpHost}`);
    console.log(`Port:    ${smtpPort}`);
    console.log(`Secure:  ${isSecure}`);
    console.log(`User:    ${process.env.EMAIL_USER}`);
    console.log("-----------------------------------------");

    const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: isSecure,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        timeout: 10000 // 10 seconds timeout
    });

    try {
        console.log("🔄 Verifying transporter connection...");
        await transporter.verify();
        console.log("✅ SUCCESS: Transporter is ready to send emails!");
        
        // Try sending a test email to the configured user themselves
        console.log(`\n🔄 Attempting to send test email to ${process.env.EMAIL_USER}...`);
        const info = await transporter.sendMail({
            from: `"TalentSwype Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "TalentSwype SMTP Test",
            text: "This is a test email from your TalentSwype backend server. If you received this, your email configuration is working!",
            html: "<b>This is a test email</b> from your TalentSwype backend server. If you received this, your email configuration is working!"
        });
        console.log("✅ SUCCESS: Test email sent! Message ID:", info.messageId);

    } catch (error) {
        console.error("\n❌ ERROR: Email connection failed!");
        console.error("Code:", error.code);
        console.error("Command:", error.command);
        console.error("Response:", error.response);
        console.error("Message:", error.message);
        
        console.log("\n-----------------------------------------");
        console.log("💡 TROUBLESHOOTING TIPS:");
        if (smtpHost === "mail.talentswype.com") {
            console.log("1. If you are using Gmail/Google Workspace, you should set:");
            console.log("   SMTP_HOST=smtp.gmail.com");
            console.log("   SMTP_PORT=465");
        }
        console.log("2. Verify that your App Password is correct.");
        console.log("3. If you get 'Self-signed certificate' errors, you may need to add:");
        console.log("   tls: { rejectUnauthorized: false } to your transporter config.");
        console.log("-----------------------------------------");
    }
}

testEmailConnection();
