"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.getCategories = void 0;
const Category_1 = require("../models/Category");
// @desc    Get all categories (with hierarchy)
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const categories = await Category_1.Category.find({});
        // Convert flat list to hierarchical tree
        const categoryMap = {};
        categories.forEach(cat => {
            categoryMap[cat.id] = { ...cat.toObject(), children: [] };
        });
        const tree = [];
        categories.forEach(cat => {
            if (cat.parent) {
                if (categoryMap[cat.parent.toString()]) {
                    categoryMap[cat.parent.toString()].children.push(categoryMap[cat.id]);
                }
            }
            else {
                tree.push(categoryMap[cat.id]);
            }
        });
        res.status(200).json(tree);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCategories = getCategories;
// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res) => {
    try {
        const category = new Category_1.Category(req.body);
        const createdCategory = await category.save();
        res.status(201).json(createdCategory);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createCategory = createCategory;
// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
    try {
        const category = await Category_1.Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        res.status(200).json(category);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateCategory = updateCategory;
// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
    try {
        const category = await Category_1.Category.findById(req.params.id);
        if (!category) {
            res.status(404).json({ message: 'Category not found' });
            return;
        }
        // Check if it has children
        const children = await Category_1.Category.find({ parent: req.params.id });
        if (children.length > 0) {
            res.status(400).json({ message: 'Cannot delete a category that has subcategories' });
            return;
        }
        await Category_1.Category.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Category removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteCategory = deleteCategory;
