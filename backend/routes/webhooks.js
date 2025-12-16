import express from 'express';
import {
  handleRedBoxWebhook,
  handleSMSAWebhook,
  handleAramexWebhook
} from '../controllers/webhookController.js';
import {
  verifyRedBoxWebhook,
  verifySMSAWebhook,
  verifyAramexWebhook
} from '../middleware/webhookAuth.js';

const router = express.Router();

// Webhook endpoints with signature verification
router.post('/redbox', verifyRedBoxWebhook, handleRedBoxWebhook);
router.post('/smsa', verifySMSAWebhook, handleSMSAWebhook);
router.post('/aramex', verifyAramexWebhook, handleAramexWebhook);

export default router;