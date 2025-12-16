import express from 'express';
import {
  getAddresses,
  getAddress,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/addressController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

// @route   GET /api/addresses
router.get('/', getAddresses);

// @route   GET /api/addresses/:id
router.get('/:id', getAddress);

// @route   POST /api/addresses
router.post('/', createAddress);

// @route   PUT /api/addresses/:id
router.put('/:id', updateAddress);

// @route   DELETE /api/addresses/:id
router.delete('/:id', deleteAddress);

// @route   PUT /api/addresses/:id/default
router.put('/:id/default', setDefaultAddress);

export default router;
