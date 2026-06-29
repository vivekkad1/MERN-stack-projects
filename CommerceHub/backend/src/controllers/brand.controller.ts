import { Request, Response } from 'express';
import { Brand } from '../models/Brand';

// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
export const getBrands = async (req: Request, res: Response): Promise<void> => {
  try {
    const brands = await Brand.find({});
    res.status(200).json(brands);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a brand
// @route   POST /api/brands
// @access  Private (Admin)
export const createBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = new Brand(req.body);
    const createdBrand = await brand.save();
    res.status(201).json(createdBrand);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private (Admin)
export const updateBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!brand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.status(200).json(brand);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private (Admin)
export const deleteBrand = async (req: Request, res: Response): Promise<void> => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      res.status(404).json({ message: 'Brand not found' });
      return;
    }
    res.status(200).json({ message: 'Brand removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
