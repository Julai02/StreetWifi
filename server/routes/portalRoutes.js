import express from 'express';
import {
  initiatePayment,
  paymentCallback,
  checkPaymentStatus,
  verifyDeviceAccess,
  extendSession,
  getPaymentHistory,
} from '../controllers/paymentController.js';

const router = express.Router();

// Portal Routes - No authentication required

// Initiate payment for device
router.post('/payment/initiate', initiatePayment);

// Payment callback from PayHero (webhook - no auth needed)
router.post('/payment/callback', paymentCallback);

// Check payment status
router.get('/payment/status/:paymentId', checkPaymentStatus);

// Verify device access (captive portal check)
router.post('/verify-access', verifyDeviceAccess);

// Extend session (buy more hours)
router.post('/extend-session', extendSession);

// Get payment history for device
router.get('/payment-history', getPaymentHistory);

export default router;
