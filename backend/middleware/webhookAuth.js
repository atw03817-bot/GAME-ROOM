import crypto from 'crypto';

// التحقق من صحة webhook RedBox
export const verifyRedBoxWebhook = (req, res, next) => {
  try {
    const signature = req.headers['x-redbox-signature'];
    const payload = JSON.stringify(req.body);
    
    // في الإنتاج، يجب استخدام secret key من RedBox
    const webhookSecret = process.env.REDBOX_WEBHOOK_SECRET || 'default-secret';
    
    if (!signature) {
      console.log('⚠️  No signature provided for RedBox webhook');
      // في وضع التطوير، نسمح بالمرور بدون توقيع
      if (process.env.NODE_ENV === 'development') {
        return next();
      }
      return res.status(401).json({ error: 'No signature provided' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    const providedSignature = signature.replace('sha256=', '');

    if (expectedSignature !== providedSignature) {
      console.log('❌ Invalid webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    console.log('✅ Webhook signature verified');
    next();
  } catch (error) {
    console.error('❌ Webhook verification error:', error);
    res.status(500).json({ error: 'Webhook verification failed' });
  }
};

// التحقق من صحة webhook SMSA
export const verifySMSAWebhook = (req, res, next) => {
  // TODO: Implement SMSA webhook verification
  console.log('📦 SMSA webhook - verification not implemented yet');
  next();
};

// التحقق من صحة webhook Aramex
export const verifyAramexWebhook = (req, res, next) => {
  // TODO: Implement Aramex webhook verification
  console.log('📦 Aramex webhook - verification not implemented yet');
  next();
};