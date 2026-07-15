"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBrand = exports.updateBrand = exports.createBrand = exports.getBrands = void 0;
const Brand_1 = require("../models/Brand");
// @desc    Get all brands
// @route   GET /api/brands
// @access  Public
const getBrands = async (req, res) => {
    try {
        const brands = await Brand_1.Brand.find({});
        res.status(200).json(brands);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getBrands = getBrands;
// @desc    Create a brand
// @route   POST /api/brands
// @access  Private (Admin)
const createBrand = async (req, res) => {
    try {
        const brand = new Brand_1.Brand(req.body);
        const createdBrand = await brand.save();
        res.status(201).json(createdBrand);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createBrand = createBrand;
// @desc    Update a brand
// @route   PUT /api/brands/:id
// @access  Private (Admin)
const updateBrand = async (req, res) => {
    try {
        const brand = await Brand_1.Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!brand) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.status(200).json(brand);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateBrand = updateBrand;
// @desc    Delete a brand
// @route   DELETE /api/brands/:id
// @access  Private (Admin)
const deleteBrand = async (req, res) => {
    try {
        const brand = await Brand_1.Brand.findByIdAndDelete(req.params.id);
        if (!brand) {
            res.status(404).json({ message: 'Brand not found' });
            return;
        }
        res.status(200).json({ message: 'Brand removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteBrand = deleteBrand;
