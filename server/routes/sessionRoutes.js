import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getSession,
  extendSession,
  endSession,
  getSessionSummary,
} from '../controllers/sessionController.js';

const router = express.Router();

// Protected routes (user must be authenticated)
router.get('/current', protect, getSession);
router.post('/extend', protect, extendSession);
router.post('/end', protect, endSession);
router.get('/summary', protect, getSessionSummary);

export default router;
