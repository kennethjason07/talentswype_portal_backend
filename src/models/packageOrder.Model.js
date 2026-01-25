import mongoose from 'mongoose';

const PackageOrderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    }, // PayPal order id
    status: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        required: true
    },
    metadata: {
        type: Object
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    capturedAt: {
        type: Date
    },
    raw: {
        type: Object
    },
});

export default mongoose.models.PackageOrders || mongoose.model("PackageOrder", PackageOrderSchema);
