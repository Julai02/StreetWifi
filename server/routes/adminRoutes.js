import express from 'express';
import { protect, isAdmin } from '../middleware/auth.js';
import {
  adminLogin,
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  getAllPayments,
  getActiveSessions,
  deactivateUser,
  reactivateUser,
  getAllRouters,
  createRouter,
  updateRouter,
  deleteRouter,
  getRouterDetails,
} from '../controllers/adminController.js';

const router = express.Router();

// Public admin login
router.post('/login', adminLogin);

// Protected admin routes
router.get('/dashboard', protect, isAdmin, getDashboardStats);
router.get('/users', protect, isAdmin, getAllUsers);
router.get('/users/:userId', protect, isAdmin, getUserDetails);
router.post('/users/:userId/deactivate', protect, isAdmin, deactivateUser);
router.post('/users/:userId/reactivate', protect, isAdmin, reactivateUser);

router.get('/payments', protect, isAdmin, getAllPayments);
router.get('/sessions', protect, isAdmin, getActiveSessions);

// Router management routes
router.get('/routers', protect, isAdmin, getAllRouters);
router.post('/routers', protect, isAdmin, createRouter);
router.get('/routers/:routerId', protect, isAdmin, getRouterDetails);
router.put('/routers/:routerId', protect, isAdmin, updateRouter);
router.delete('/routers/:routerId', protect, isAdmin, deleteRouter);

export default router;
