import { sendEmail } from "../services/email";

export async function sendEmailController(req, res) {
    try {
        const { to, subject, text, html } = req.body;

        // validation
        if (!to || !subject || !text) {
            return res.status(400).json({
                success: false,
                message: "to, subject and text fields are required",
            });
        }

        // send email
        const result = await sendEmail(to, subject, text, html);

        if (!result.success) {
            return res.status(500).json({
                success: false,
                message: "Failed to send email",
                error: result.error,
            });
        }

        res.status(200).json({
            success: true,
            message: "Email sent successfully",
            messageId: result.messageId,
        });
    } catch (error) {
        console.error("❌ Email Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
}
