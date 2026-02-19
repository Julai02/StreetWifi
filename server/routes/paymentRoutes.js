import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  initiatePayment,
  paymentCallback,
  checkPaymentStatus,
  getPaymentHistory,
} from '../controllers/paymentController.js';

const router = express.Router();

// Protected routes (user must be authenticated)
router.post('/initiate', protect, initiatePayment);
router.get('/history', protect, getPaymentHistory);
router.get('/:paymentId/status', protect, checkPaymentStatus);

// Callback from PayHero (webhook - no auth required but should verify signature)
router.post('/callback', paymentCallback);

export default router;
