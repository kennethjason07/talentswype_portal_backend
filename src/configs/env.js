import dotenv from 'dotenv';
dotenv.config();

const PAYPAL_BASE = process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';

export default {
    port: process.env.PORT || 4000,
    baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`,
    mongoUri: process.env.MONGO_URI,
    paypal: {
        clientId: process.env.PAYPAL_CLIENT_ID,
        clientSecret: process.env.PAYPAL_CLIENT_SECRET,
        baseUrl: PAYPAL_BASE,
        webhookId: process.env.PAYPAL_WEBHOOK_ID, // used for webhook verification
    },
};
