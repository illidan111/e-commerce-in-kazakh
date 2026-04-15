import express from 'express';
const router = express.Router();
import {
  createSellerListing,
  getMyListings,
  updateSellerListing,
  deleteSellerListing,
  getAllSellerListings,
  approveListing,
  markAsSold,
} from '../controllers/sellerController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Seller routes (authenticated users)
router.post('/products', protect, createSellerListing);
router.get('/my-products', protect, getMyListings);
router.put('/products/:id', protect, updateSellerListing);
router.delete('/products/:id', protect, deleteSellerListing);
router.put('/products/:id/sold', protect, markAsSold);

// Admin routes
router.get('/all', protect, admin, getAllSellerListings);
router.put('/admin/products/:id/approve', protect, admin, approveListing);

export default router;
