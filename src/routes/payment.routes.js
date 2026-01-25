import express from 'express';
import { createOrder, captureOrder } from '../controllers/paymentController.js';
const router = express.Router();

router.post('/orders', createOrder);            // create order (server)
router.post('/orders/:orderId/capture', captureOrder); // capture order (server-side)

export default router;
