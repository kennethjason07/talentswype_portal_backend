// services/smsService.js
import twilio from "twilio";
import dotenv from "dotenv";
dotenv.config();

// Load from env variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

/**
 * Send SMS using Twilio
 * @param {string} to - Recipient phone number (with country code, e.g. +91XXXXXXXXXX)
 * @param {string} message - Message content
 * @returns {Promise<object>} - Twilio response
 */
export const sendSMS = async (to, message) => {
    try {
        const formattedNumber = `+91${to}`;
        
        const response = await client.messages.create({
            body: message,
            from: twilioPhone,
            to: formattedNumber,
        });

        console.log("✅ SMS sent successfully:", message);
        return response;
    } catch (error) {
        console.error("❌ Failed to send SMS:", error.message);
        throw error;
    }
};
