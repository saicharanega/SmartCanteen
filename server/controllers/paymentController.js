const Razorpay = require('razorpay');
const crypto = require('crypto');

/**
 * POST /api/payment/create-order
 * Create a Razorpay payment order
 */
const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // In Rupees

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Amount is required and must be positive' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return res.status(400).json({ success: false, message: 'Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured in environment variables' });
    }

    // Call real Razorpay API SDK
    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: 'rcpt_canteen_' + Date.now()
    };

    const order = await instance.orders.create(options);
    res.status(200).json({
      success: true,
      keyId,
      order
    });
  } catch (error) {
    console.error('[Payment Gateway] Razorpay Order Creation failed:', error.message);
    res.status(500).json({
      success: false,
      message: 'Razorpay order creation failed',
      error: error.message
    });
  }
};

/**
 * POST /api/payment/verify
 * Verify Razorpay payment signature
 */
const verifyPayment = async (req, res) => {
  try {
    const { 
      razorpayOrderId, 
      razorpayPaymentId, 
      razorpaySignature 
    } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ success: false, message: 'All signature fields (razorpayOrderId, razorpayPaymentId, razorpaySignature) are required' });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return res.status(500).json({ success: false, message: 'Razorpay Secret Key is not configured' });
    }

    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(razorpayOrderId + '|' + razorpayPaymentId);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature === razorpaySignature) {
      res.status(200).json({
        success: true,
        message: 'Razorpay payment verified successfully.'
      });
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid signature authentication. Verification failed.'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal verification workflow failure',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment
};

