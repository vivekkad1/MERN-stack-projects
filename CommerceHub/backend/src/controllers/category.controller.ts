import { Request, Response } from 'express';
import { Category } from '../models/Category';

// @desc    Get all categories (with hierarchy)
// @route   GET /api/categories
// @access  Public
export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find({});
    
    // Convert flat list to hierarchical tree
    const categoryMap: any = {};
    categories.forEach(cat => {
      categoryMap[cat.id] = { ...cat.toObject(), children: [] };
    });

    const tree: any[] = [];
    categories.forEach(cat => {
      if (cat.parent) {
        if (categoryMap[cat.parent.toString()]) {
          categoryMap[cat.parent.toString()].children.push(categoryMap[cat.id]);
        }
      } else {
        tree.push(categoryMap[cat.id]);
      }
    });

    res.status(200).json(tree);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin)
export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = new Category(req.body);
    const createdCategory = await category.save();
    res.status(201).json(createdCategory);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.status(200).json(category);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    
    // Check if it has children
    const children = await Category.find({ parent: req.params.id });
    if (children.length > 0) {
      res.status(400).json({ message: 'Cannot delete a category that has subcategories' });
      return;
    }

    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Category removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
