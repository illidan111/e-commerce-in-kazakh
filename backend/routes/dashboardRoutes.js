import express from 'express';
import {
  getDashboardStats,
  getMonthlySales,
  getRecentOrders,
  getTopProducts,
} from '../controllers/dashboardController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/stats').get(protect, admin, getDashboardStats);
router.route('/monthly-sales').get(protect, admin, getMonthlySales);
router.route('/recent-orders').get(protect, admin, getRecentOrders);
router.route('/top-products').get(protect, admin, getTopProducts);

export default router;
