import { Request, Response } from 'express';
import { Address } from '../models/Address';

// @desc    Get user addresses
// @route   GET /api/addresses
// @access  Private
export const getMyAddresses = async (req: Request, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find({ user: (req as any).user?.id });
    res.status(200).json(addresses);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    
    // If it's the first address, make it default
    const count = await Address.countDocuments({ user: userId });
    const isDefault = req.body.isDefault || count === 0;

    if (isDefault) {
      // Remove default from other addresses
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const address = await Address.create({
      ...req.body,
      user: userId,
      isDefault
    });

    res.status(201).json(address);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const addressId = req.params.id;

    const address = await Address.findById(addressId);

    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    if (address.user.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to update this address' });
      return;
    }

    if (req.body.isDefault) {
      await Address.updateMany({ user: userId }, { isDefault: false });
    }

    const updatedAddress = await Address.findByIdAndUpdate(
      addressId,
      { ...req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedAddress);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete address
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    const addressId = req.params.id;

    const address = await Address.findById(addressId);

    if (!address) {
      res.status(404).json({ message: 'Address not found' });
      return;
    }

    if (address.user.toString() !== userId) {
      res.status(403).json({ message: 'Not authorized to delete this address' });
      return;
    }

    await Address.findByIdAndDelete(addressId);

    res.status(200).json({ message: 'Address removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
