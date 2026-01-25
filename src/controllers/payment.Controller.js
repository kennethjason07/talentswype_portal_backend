import packageOrderModel from '../models/packageOrder.Model.js';
import paypalService from '../services/paypalService.js';

export const createOrder = async (req, res, next) => {
    try {
        // Example request validation done upstream or validate here
        const { items, currency = 'USD', returnUrl, cancelUrl } = req.body;

        // Build purchase_units as per PayPal v2 Orders API
        const total = items.reduce((s, it) => s + (it.unit_amount * it.quantity), 0).toFixed(2);

        const purchase_units = [{
            amount: {
                currency_code: currency,
                value: total,
                breakdown: {
                    item_total: { currency_code: currency, value: total }
                }
            },
            items: items.map(it => ({
                name: it.name,
                unit_amount: { currency_code: currency, value: it.unit_amount.toFixed(2) },
                quantity: String(it.quantity),
                sku: it.sku || undefined
            }))
        }];

        const application_context = {
            return_url: returnUrl || `${process.env.BASE_URL}/paypal/success`,
            cancel_url: cancelUrl || `${process.env.BASE_URL}/paypal/cancel`
        };

        const order = await paypalService.createOrder({ purchase_units, application_context });

        // Persist basic order info server-side for tracking
        const saved = await packageOrderModel.create({
            orderId: order.id,
            status: order.status,
            amount: Number(total),
            currency,
            raw: order
        });

        // Return order (client will redirect to approve link or use PayPal JS SDK createOrder => server returns id)
        return res.json({ orderId: order.id, links: order.links });
    } catch (err) {
        next(err);
    }
};

export const captureOrder = async (req, res, next) => {
    try {
        const { orderId } = req.params;

        // Optional: check if order is already captured in DB to make capture idempotent
        const existing = await packageOrderModel.findOne({ orderId });
        if (existing && existing.status === 'COMPLETED') {
            return res.status(200).json({ message: 'Order already captured', order: existing });
        }

        const captured = await paypalService.captureOrder(orderId);

        // Update DB
        const update = {
            status: 'COMPLETED',
            capturedAt: new Date(),
            raw: captured
        };
        await packageOrderModel.findOneAndUpdate({ orderId }, update, { upsert: true, new: true });

        return res.json({ captured });
    } catch (err) {
        next(err);
    }
};
