import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { User, UserRole } from '../models/User';
import mongoose from 'mongoose';

// @desc    Get all products (with advanced filtering, search, pagination)
// @route   GET /api/products
// @access  Public
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockProducts = [
        { _id: '201', title: 'iPhone 15 Pro Max', description: 'Titanium design with A17 Pro chip.', basePrice: 159900, discountPrice: 159900, images: ['https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=400&auto=format&fit=crop'], rating: 4.8 },
        { _id: '101', title: 'Sony WH-1000XM5', description: 'Industry leading noise canceling headphones.', basePrice: 34990, discountPrice: 29990, images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop'], rating: 4.9 },
        { _id: '202', title: 'Samsung Galaxy S24 Ultra', description: 'Galaxy AI is here.', basePrice: 134999, discountPrice: 129999, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop'], rating: 4.7 }
      ];
      let returnedProducts = mockProducts;
      if (req.query.keyword) {
        const kw = String(req.query.keyword).toLowerCase();
        returnedProducts = mockProducts.filter(p => 
          p.title.toLowerCase().includes(kw) || p.description.toLowerCase().includes(kw)
        );
      }
      res.status(200).json({ success: true, count: returnedProducts.length, pagination: {}, products: returnedProducts, message: 'Database disconnected - returning mock data' });
      return;
    }
    const { keyword, category, brand, minPrice, maxPrice, minRating, page, limit, sort } = req.query;

    const query: any = { isActive: true };

    // Search by keyword in title or description
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword as string, $options: 'i' } },
        { description: { $regex: keyword as string, $options: 'i' } }
      ];
    }

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (minRating) query.rating = { $gte: Number(minRating) };

    // Price range filtering
    if (minPrice || maxPrice) {
      query.basePrice = {};
      if (minPrice) query.basePrice.$gte = Number(minPrice);
      if (maxPrice) query.basePrice.$lte = Number(maxPrice);
    }

    // Pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Sorting
    let sortObj: any = { createdAt: -1 };
    if (sort === 'price_asc') sortObj = { basePrice: 1 };
    if (sort === 'price_desc') sortObj = { basePrice: -1 };
    if (sort === 'rating_desc') sortObj = { rating: -1 };
    if (sort === 'newest') sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { sold: -1 };

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name')
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum);

    const total = await Product.countDocuments(query);

    res.status(200).json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID or Slug
// @route   GET /api/products/:idOrSlug
// @access  Public
export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const idOrSlug = req.params.idOrSlug as string;
    const isMongoId = idOrSlug.match(/^[0-9a-fA-F]{24}$/);

    const query = isMongoId ? { _id: idOrSlug } : { slug: idOrSlug };
    const product = await Product.findOne(query)
      .populate('seller', 'name avatarUrl')
      .populate('category', 'name slug')
      .populate('brand', 'name');

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private (Seller/Admin)
export const createProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const newProduct = new Product({
      ...req.body,
      seller: (req as any).user.id
    });

    const createdProduct = await newProduct.save();
    res.status(201).json(createdProduct);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Seller/Admin)
export const updateProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Ensure the seller owns the product or user is Admin
    if (product.seller.toString() !== (req as any).user.id && (req as any).user.role !== UserRole.ADMIN && (req as any).user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ message: 'Not authorized to update this product' });
      return;
    }

    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedProduct);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Seller/Admin)
export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.seller.toString() !== (req as any).user.id && (req as any).user.role !== UserRole.ADMIN && (req as any).user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ message: 'Not authorized to delete this product' });
      return;
    }

    await Product.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Product removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Product Inventory (Stock & Variants)
// @route   PATCH /api/products/:id/inventory
// @access  Private (Seller/Admin)
export const updateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { stock, variants } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.seller.toString() !== (req as any).user.id && (req as any).user.role !== UserRole.ADMIN && (req as any).user.role !== UserRole.SUPER_ADMIN) {
      res.status(403).json({ message: 'Not authorized to update inventory' });
      return;
    }

    if (stock !== undefined) product.stock = stock;
    if (variants !== undefined) product.variants = variants;

    await product.save();
    res.status(200).json({ message: 'Inventory updated successfully', product });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get low stock products
// @route   GET /api/products/inventory/low-stock
// @access  Private (Seller/Admin)
export const getLowStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req as any).user.role;
    let query: any = {};
    
    if (userRole === UserRole.SELLER) {
      query.seller = (req as any).user._id;
    }

    // Find products where stock is less than or equal to lowStockThreshold
    query.$expr = { $lte: ['$stock', '$lowStockThreshold'] };

    const products = await Product.find(query).select('title stock lowStockThreshold warehouseLocation images variants');
    
    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bulk update inventory
// @route   PUT /api/products/inventory/bulk-update
// @access  Private (Seller/Admin)
export const bulkUpdateInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { updates } = req.body; // Array of { productId, stock }
    const userRole = (req as any).user.role;
    const userId = (req as any).user._id;

    if (!Array.isArray(updates)) {
      res.status(400).json({ success: false, message: 'Updates must be an array' });
      return;
    }

    const updatedProducts = [];

    for (const update of updates) {
      const product = await Product.findById(update.productId);
      if (product) {
        // Sellers can only update their own products
        if (userRole === UserRole.SELLER && product.seller.toString() !== userId.toString()) {
          continue;
        }
        product.stock = update.stock;
        await product.save();
        updatedProducts.push(product);
      }
    }

    res.status(200).json({ success: true, count: updatedProducts.length, message: 'Bulk update successful' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get personalized product suggestions
// @route   GET /api/products/suggestions
// @access  Private
export const getSuggestions = async (req: Request, res: Response) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      const mockSuggestions = [
        { _id: '201', title: 'iPhone 15 Pro Max', description: 'Titanium design with A17 Pro chip.', basePrice: 159900, discountPrice: 159900, images: ['https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=400&auto=format&fit=crop'], rating: 4.8 },
        { _id: '101', title: 'Sony WH-1000XM5', description: 'Industry leading noise canceling headphones.', basePrice: 34990, discountPrice: 29990, images: ['https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=400&auto=format&fit=crop'], rating: 4.9 },
        { _id: '202', title: 'Samsung Galaxy S24 Ultra', description: 'Galaxy AI is here.', basePrice: 134999, discountPrice: 129999, images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=400&auto=format&fit=crop'], rating: 4.7 }
      ];
      res.status(200).json({ success: true, count: mockSuggestions.length, data: mockSuggestions, message: 'Database disconnected - returning mock suggestions' });
      return;
    }

    const user = (req as any).user ? await User.findById((req as any).user.id).populate('viewedProducts') : null;

    const query: any = { isActive: true };
    const orConditions: any[] = [];

    const escapeRegex = (string: string) => {
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
          .filter((p: any) => p && p.category)
          .map((p: any) => p.category);
        
        if (categories.length > 0) {
          orConditions.push({ category: { $in: categories } });
        }
      }
    }

    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    // Fetch matching products
    let suggestions = await Product.find(query)
      .limit(8)
      .sort({ rating: -1, numReviews: -1 });

    // Fallback if no personalized suggestions found
    if (suggestions.length === 0) {
      suggestions = await Product.find({ isActive: true })
        .limit(8)
        .sort({ sold: -1, rating: -1 });
    }

    res.status(200).json({ success: true, count: suggestions.length, data: suggestions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
