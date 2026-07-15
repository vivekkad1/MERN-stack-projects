"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSuggestions = exports.bulkUpdateInventory = exports.getLowStock = exports.updateInventory = exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const Product_1 = require("../models/Product");
const User_1 = require("../models/User");
const mongoose_1 = __importDefault(require("mongoose"));
// @desc    Get all products (with advanced filtering, search, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            const mockProducts = [
                { _id: '201', title: 'iPhone 15 Pro Max', description: 'Titanium design with A17 Pro chip.', basePrice: 159900, discountPrice: 159900, images: ['https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=400&auto=format&fit=crop'], rating: 4.8 },
                { _id: '101', title: 'Sony WH-1000XM5', description: 'Industry leading noise canceling headphones.', basePrice: 34990, discountPrice: 29990, images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop'], rating: 4.9 },
                { _id: '202', title: 'Samsung Galaxy S24 Ultra', description: 'Galaxy AI is here.', basePrice: 134999, discountPrice: 129999, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop'], rating: 4.7 }
            ];
            let returnedProducts = mockProducts;
            if (req.query.keyword) {
                const kw = String(req.query.keyword).toLowerCase();
                returnedProducts = mockProducts.filter(p => p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw));
            }
            res.status(200).json({ success: true, count: returnedProducts.length, pagination: {}, products: returnedProducts, message: 'Database disconnected - returning mock data' });
            return;
        }
        const { keyword, category, brand, minPrice, maxPrice, minRating, page, limit, sort } = req.query;
        const query = { isActive: true };
        // Search by keyword in title or description
        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }
        if (category)
            query.category = category;
        if (brand)
            query.brand = brand;
        if (minRating)
            query.rating = { $gte: Number(minRating) };
        // Price range filtering
        if (minPrice || maxPrice) {
            query.basePrice = {};
            if (minPrice)
                query.basePrice.$gte = Number(minPrice);
            if (maxPrice)
                query.basePrice.$lte = Number(maxPrice);
        }
        // Pagination
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 12;
        const skip = (pageNum - 1) * limitNum;
        // Sorting
        let sortObj = { createdAt: -1 };
        if (sort === 'price_asc')
            sortObj = { basePrice: 1 };
        if (sort === 'price_desc')
            sortObj = { basePrice: -1 };
        if (sort === 'rating_desc')
            sortObj = { rating: -1 };
        if (sort === 'newest')
            sortObj = { createdAt: -1 };
        if (sort === 'popular')
            sortObj = { sold: -1 };
        const products = await Product_1.Product.find(query)
            .populate('category', 'name slug')
            .populate('brand', 'name')
            .sort(sortObj)
            .skip(skip)
            .limit(limitNum);
        const total = await Product_1.Product.countDocuments(query);
        res.status(200).json({
            products,
            page: pageNum,
            pages: Math.ceil(total / limitNum),
            total
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProducts = getProducts;
// @desc    Get single product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
const getProductById = async (req, res) => {
    try {
        const idOrSlug = req.params.idOrSlug;
        const isMongoId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);
        const query = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };
        const product = await Product_1.Product.findOne(query)
            .populate('seller', 'name avatarUrl')
            .populate('category', 'name slug')
            .populate('brand', 'name');
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        res.status(200).json(product);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getProductById = getProductById;
// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
const createProduct = async (req, res) => {
    try {
        const newProduct = new Product_1.Product({
            ...req.body,
            seller: req.user.id
        });
        const createdProduct = await newProduct.save();
        res.status(201).json(createdProduct);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.createProduct = createProduct;
// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
const updateProduct = async (req, res) => {
    try {
        const product = await Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        // Ensure the seller owns the product or user is Admin
        if (product.seller.toString() !== req.user.id && req.user.role !== User_1.UserRole.ADMIN && req.user.role !== User_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ message: 'Not authorized to update this product' });
            return;
        }
        const updatedProduct = await Product_1.Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedProduct);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateProduct = updateProduct;
// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
const deleteProduct = async (req, res) => {
    try {
        const product = await Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        if (product.seller.toString() !== req.user.id && req.user.role !== User_1.UserRole.ADMIN && req.user.role !== User_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ message: 'Not authorized to delete this product' });
            return;
        }
        await Product_1.Product.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Product removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteProduct = deleteProduct;
// @desc    Update Product Inventory (Stock & Variants)
// @route   PATCH /api/products/:id/inventory
// @access  Private (Seller/Admin)
const updateInventory = async (req, res) => {
    try {
        const { stock, variants } = req.body;
        const product = await Product_1.Product.findById(req.params.id);
        if (!product) {
            res.status(404).json({ message: 'Product not found' });
            return;
        }
        if (product.seller.toString() !== req.user.id && req.user.role !== User_1.UserRole.ADMIN && req.user.role !== User_1.UserRole.SUPER_ADMIN) {
            res.status(403).json({ message: 'Not authorized to update inventory' });
            return;
        }
        if (stock !== undefined)
            product.stock = stock;
        if (variants !== undefined)
            product.variants = variants;
        await product.save();
        res.status(200).json({ message: 'Inventory updated successfully', product });
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
};
exports.updateInventory = updateInventory;
// @desc    Get low stock products
// @route   GET /api/products/inventory/low-stock
// @access  Private (Seller/Admin)
const getLowStock = async (req, res) => {
    try {
        const userRole = req.user.role;
        let query = {};
        if (userRole === User_1.UserRole.SELLER) {
            query.seller = req.user._id;
        }
        // Find products where stock is less than or equal to lowStockThreshold
        query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };
        const products = await Product_1.Product.find(query).select('title stock lowStockThreshold warehouseLocation images variants');
        res.status(200).json({ success: true, count: products.length, data: products });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getLowStock = getLowStock;
// @desc    Bulk update inventory
// @route   PUT /api/products/inventory/bulk-update
// @access  Private (Seller/Admin)
const bulkUpdateInventory = async (req, res) => {
    try {
        const { updates } = req.body; // Array of { productId, stock }
        const userRole = req.user.role;
        const userId = req.user._id;
        if (!Array.isArray(updates)) {
            res.status(400).json({ success: false, message: 'Updates must be an array' });
            return;
        }
        const updatedProducts = [];
        for (const update of updates) {
            const product = await Product_1.Product.findById(update.productId);
            if (product) {
                // Sellers can only update their own products
                if (userRole === User_1.UserRole.SELLER && product.seller.toString() !== userId.toString()) {
                    continue;
                }
                product.stock = update.stock;
                await product.save();
                updatedProducts.push(product);
            }
        }
        res.status(200).json({ success: true, count: updatedProducts.length, message: 'Bulk update successful' });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.bulkUpdateInventory = bulkUpdateInventory;
// @desc    Get personalized product suggestions
// @route   GET /api/products/suggestions
// @access  Private
const getSuggestions = async (req, res) => {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            const mockSuggestions = [
                { _id: '201', title: 'iPhone 15 Pro Max', description: 'Titanium design with A17 Pro chip.', basePrice: 159900, discountPrice: 159900, images: ['https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=400&auto=format&fit=crop'], rating: 4.8 },
                { _id: '101', title: 'Sony WH-1000XM5', description: 'Industry leading noise canceling headphones.', basePrice: 34990, discountPrice: 29990, images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop'], rating: 4.9 },
                { _id: '202', title: 'Samsung Galaxy S24 Ultra', description: 'Galaxy AI is here.', basePrice: 134999, discountPrice: 129999, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop'], rating: 4.7 }
            ];
            res.status(200).json({ success: true, count: mockSuggestions.length, data: mockSuggestions, message: 'Database disconnected - returning mock suggestions' });
            return;
        }
        const user = req.user ? await User_1.User.findById(req.user.id).populate('viewedProducts') : null;
        const query = { isActive: true };
        const orConditions = [];
        const escapeRegex = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };
        if (user) {
            // 1. Match Search History
            if (user.searchHistory && user.searchHistory.length > 0) {
                // Create a regex for each search term, escaping special characters
                const searchRegexes = user.searchHistory.map(term => new RegExp(escapeRegex(term), 'i'));
                orConditions.push({ title: { $in: searchRegexes } });
                orConditions.push({ description: { $in: searchRegexes } });
            }
            // 2. Match Categories of Viewed Products
            if (user.viewedProducts && user.viewedProducts.length > 0) {
                const categories = user.viewedProducts
                    .filter((p) => p && p.category)
                    .map((p) => p.category);
                if (categories.length > 0) {
                    orConditions.push({ category: { $in: categories } });
                }
            }
        }
        if (orConditions.length > 0) {
            query.$or = orConditions;
        }
        // Fetch matching products
        let suggestions = await Product_1.Product.find(query)
            .limit(8)
            .sort({ rating: -1, numReviews: -1 });
        // Fallback if no personalized suggestions found
        if (suggestions.length === 0) {
            suggestions = await Product_1.Product.find({ isActive: true })
                .limit(8)
                .sort({ sold: -1, rating: -1 });
        }
        res.status(200).json({ success: true, count: suggestions.length, data: suggestions });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getSuggestions = getSuggestions;
