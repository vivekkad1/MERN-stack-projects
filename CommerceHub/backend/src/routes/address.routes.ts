import express from 'express';
import { protect } from '../middleware/auth.middleware';
import { getMyAddresses, addAddress, updateAddress, deleteAddress } from '../controllers/address.controller';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyAddresses)
  .post(addAddress);

router.route('/:id')
  .put(updateAddress)
  .delete(deleteAddress);

export default router;
