import { verifyFlowmingoSignature } from '../services/flowmingoSignature.service.js';
import { FlowmingoWebhookService } from '../services/flowmingoWebhook.service.js';
import logger from '../../../middleware/winston.logger.js';

export class FlowmingoWebhookController {
  static async handle(req, res, next) {
    try {
      const signature = req.headers['x-webhook-signature'];
      const secret = process.env.FLOWMINGO_WEBHOOK_SECRET;

      if (!secret) {
        return res.status(500).json({ success: false, message: 'Webhook secret not configured' });
      }

      const isValid = verifyFlowmingoSignature(req.body, signature, secret);
      if (!isValid) {
        logger.error('Flowmingo webhook rejected: invalid signature');
        return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
      }

      let eventBody;
      try {
        eventBody = JSON.parse(req.body.toString('utf8'));
      } catch (error) {
        logger.error(`Flowmingo webhook rejected: invalid JSON payload error=${error.message}`);
        return res.status(400).json({ success: false, message: 'Invalid JSON payload' });
      }

      await FlowmingoWebhookService.handleWebhookEvent(eventBody);

      return res.status(200).json({ success: true, message: 'Webhook processed' });
    } catch (error) {
      return next(error);
    }
  }
}
