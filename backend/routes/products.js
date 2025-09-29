import express from 'express';
import { Op } from 'sequelize';
import { Product, User } from '../models/index.js';
import { supabaseAdmin, supabase } from '../config/supabase.js';
import jwt from 'jsonwebtoken';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { validateProduct } from '../utils/validation.js';

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      isOrganic,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { isActive: true };

    // Apply filters
    if (category) {
      whereClause.category = category;
    }

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
        { botanicalName: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    if (isOrganic === 'true') {
      whereClause.isOrganic = true;
    }

    const products = await Product.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'businessName', 'rating']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]]
    });
    res.json({
      success: true,
      data: {
        products: products.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(products.count / limit),
          totalItems: products.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({
      where: { id: req.params.id, isActive: true },
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'businessName', 'rating', 'totalReviews']
      }]
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    await product.increment('viewCount');

    res.json({
      success: true,
      data: { product }
    });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products
// @desc    Create new product
// @access  Private (Sellers only)
router.post('/', authenticate, authorize('seller'), async (req, res) => {
  try {
    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const productData = {
      ...req.body,
      sellerId: req.user.id
    };

    const product = await Product.create(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/products/supabase
// @desc    Create new product in Supabase (images already uploaded to R2)
// @access  Private (Sellers only)
router.post('/supabase', async (req, res) => {
  try {
    // Resolve user from either app JWT or Supabase access token
    const authHeader = req.header('Authorization') || '';
    const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    let userId = null;
    let userType = null;

    if (bearer) {
      // Try app JWT first
      try {
        const decoded = jwt.verify(bearer, process.env.JWT_SECRET);
        userId = decoded.id;
        userType = decoded.userType;
      } catch (_) {
        // Fallback: treat as Supabase access token
        const { data, error } = await supabaseAdmin.auth.getUser(bearer);
        if (error || !data?.user) {
          return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        userId = data.user.id;
        // Find user in our users table
        let { data: dbUser, error: dbErr } = await supabase
          .from('users')
          .select('id, user_type')
          .eq('id', userId)
          .single();
        if (dbErr && dbErr.code !== 'PGRST116') {
          // Unexpected error code
          return res.status(500).json({ success: false, message: 'User lookup failed' });
        }
        if (!dbUser) {
          // Auto-provision minimal user as seller (server-side trusted path)
          const { data: inserted, error: insErr } = await supabaseAdmin
            .from('users')
            .insert({ id: userId, user_type: 'seller' })
            .select('id, user_type')
            .single();
          if (insErr || !inserted) {
            return res.status(500).json({ success: false, message: 'Failed to auto-provision user' });
          }
          dbUser = inserted;
        }
        userType = dbUser.user_type;
      }
    }

    if (!userId || userType !== 'seller') {
      return res.status(403).json({ success: false, message: 'Access denied. Seller role required.' });
    }
    const {
      name,
      description,
      short_description,
      price,
      compare_at_price,
      category,
      subcategory,
      tags = [],
      images = [],
      stock = 0,
      sku,
      weight,
      dimensions,
      is_organic = false,
      is_featured = false,
      botanical_name,
      origin,
      harvest_date,
      expiry_date,
      medicinal_uses = [],
      contraindications = [],
      dosage,
      preparation,
      meta_title,
      meta_description
    } = req.body || {};

    if (!name || !description || price === undefined || !category) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    // Coercions
    const toBool = (v, def=false) => {
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string') return v.toLowerCase() === 'true';
      return def;
    };
    const toNum = (v) => (v === null || v === undefined || v === '' ? null : Number(v));
    const toJson = (v) => {
      if (v === null || v === undefined || v === '') return [];
      if (Array.isArray(v)) return v;
      try { const p = JSON.parse(v); return Array.isArray(p) || typeof p==='object' ? p : []; } catch { return []; }
    };
    const toDate = (v) => (v ? new Date(v).toISOString() : null);

    const priceNum = toNum(price);
    const compareNum = toNum(compare_at_price);
    const stockNum = toNum(stock) ?? 0;
    const weightNum = toNum(weight);
    const imagesArr = toJson(images);
    const tagsArr = toJson(tags);
    const medicinalArr = toJson(medicinal_uses);
    const contraArr = toJson(contraindications);
    const dimsObj = typeof dimensions === 'object' ? dimensions : (dimensions ? toJson(dimensions) : null);
    const isOrganicBool = toBool(is_organic);
    const isFeaturedBool = toBool(is_featured);
    const harvestIso = toDate(harvest_date);
    const expiryIso = toDate(expiry_date);

    const slug = (name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const metaTitleVal = meta_title || name?.slice(0, 60) || null;
    const metaDescVal = meta_description || (description?.slice(0, 150) || null);

    const row = {
      name,
      description,
      short_description,
      price: priceNum,
      compare_at_price: compareNum,
      category,
      subcategory,
      tags: tagsArr,
      images: imagesArr,
      stock: stockNum,
      sku,
      weight: weightNum,
      dimensions: dimsObj,
      is_organic: isOrganicBool,
      is_featured: isFeaturedBool,
      botanical_name,
      origin,
      harvest_date: harvestIso,
      expiry_date: expiryIso,
      medicinal_uses: medicinalArr,
      contraindications: contraArr,
      dosage,
      preparation,
      slug,
      meta_title: metaTitleVal,
      meta_description: metaDescVal,
      seller_id: userId
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .insert(row)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.status(201).json({ success: true, message: 'Product created successfully', data: { product: data } });

  } catch (error) {
    console.error('Create product (Supabase) error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Product owner only)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { error } = validateProduct(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    await product.update(req.body);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private (Product owner only)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.sellerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await product.update({ isActive: false });

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/products/seller/:sellerId
// @desc    Get products by seller
// @access  Public
router.get('/seller/:sellerId', async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const offset = (page - 1) * limit;

    const products = await Product.findAndCountAll({
      where: {
        sellerId: req.params.sellerId,
        isActive: true
      },
      include: [{
        model: User,
        as: 'seller',
        attributes: ['id', 'name', 'businessName', 'rating']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        products: products.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(products.count / limit),
          totalItems: products.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
