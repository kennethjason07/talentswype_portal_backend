import axios from 'axios';
import qs from 'qs';
import env from '../../configs/env.js';

/**
 * Minimal PayPal REST v2 client using client_credentials flow.
 * Caches token until expires_in.
 */
class PayPalService {
    constructor() {
        this.clientId = env.paypal.clientId;
        this.clientSecret = env.paypal.clientSecret;
        this.baseUrl = env.paypal.baseUrl;
        this._token = null;
        this._tokenExpiry = 0;
    }

    async getAccessToken() {
        const now = Date.now();
        if (this._token && now < this._tokenExpiry - 5000) return this._token;

        const tokenUrl = `${this.baseUrl}/v1/oauth2/token`;
        const payload = qs.stringify({ grant_type: 'client_credentials' });

        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

        try {
            const r = await axios.post(tokenUrl, payload, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${auth}`,
                },
            });
            this._token = r.data.access_token;
            this._tokenExpiry = now + (r.data.expires_in * 1000);
            return this._token;
        } catch (err) {
            console.log('Error fetching PayPal token', err?.response?.data || err.message);
            throw err;
        }
    }

    async createOrder({ intent = 'CAPTURE', purchase_units = [], application_context = {} }) {
        const accessToken = await this.getAccessToken();
        const url = `${this.baseUrl}/v2/checkout/orders`;

        const r = await axios.post(url, { intent, purchase_units, application_context }, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return r.data;
    }

    async captureOrder(orderId) {
        const accessToken = await this.getAccessToken();
        const url = `${this.baseUrl}/v2/checkout/orders/${orderId}/capture`;
        const r = await axios.post(url, {}, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });
        return r.data;
    }

    /**
     * Verify webhook signature using PayPal API v1/notifications/verify-webhook-signature
     * docs: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
     */
    async verifyWebhookSignature({ transmissionId, timestamp, webhookEventBody, certUrl, authAlgo, transmissionSig, webhookId }) {
        const accessToken = await this.getAccessToken();
        const url = `${this.baseUrl}/v1/notifications/verify-webhook-signature`;
        const payload = {
            transmission_id: transmissionId,
            transmission_time: timestamp,
            cert_url: certUrl,
            auth_algo: authAlgo,
            transmission_sig: transmissionSig,
            webhook_id: webhookId || env.paypal.webhookId,
            webhook_event: webhookEventBody,
        };

        const r = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        return r.data && r.data.verification_status === 'SUCCESS';
    }
}

export default new PayPalService();
