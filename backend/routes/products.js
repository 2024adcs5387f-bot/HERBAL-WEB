import express from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import { Product, User } from '../models/index.js';
import { supabaseAdmin, supabase } from '../config/supabase.js';
import { authenticate, authorize, optionalAuth, resolveUserAnyToken, requireSeller } from '../middleware/auth.js';
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
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;

    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .range(from, to);

    if (category) query = query.eq('category', category);
    if (isOrganic === 'true') query = query.eq('is_organic', true);
    if (minPrice) query = query.gte('price', Number(minPrice));
    if (maxPrice) query = query.lte('price', Number(maxPrice));
    if (search) {
      // Basic ilike search across name and description
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    // Sorting
    const supaOrderColumn = ['created_at', 'price', 'rating', 'purchase_count', 'view_count'].includes(String(sortBy))
      ? sortBy
      : 'created_at';
    query = query.order(supaOrderColumn, { ascending: String(sortOrder).toUpperCase() === 'ASC' });

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: {
        products: data || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((count || 0) / parseInt(limit)),
          totalItems: count || 0,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
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
    // Decode backend app JWT (same as research routes)
    const raw = req.header('Authorization');
    const token = raw?.startsWith('Bearer ') ? raw.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Missing token' });
    let decoded;
    try { decoded = jwt.verify(token, process.env.JWT_SECRET); }
    catch { return res.status(401).json({ success: false, message: 'Invalid token' }); }

    let userId = decoded.id;
    let role = decoded.userType;

    // Require seller/admin; optionally auto-promote to seller
    const autoPromote = String(process.env.AUTO_PROMOTE_TO_SELLER || 'false').toLowerCase() === 'true';
    const isAllowed = role === 'seller' || role === 'admin';
    if (!isAllowed) {
      if (autoPromote) {
        const { data: updated, error: upErr } = await supabaseAdmin
          .from('users')
          .update({ user_type: 'seller' })
          .eq('id', userId)
          .select('id, user_type')
          .single();
        if (upErr || !updated) {
          return res.status(403).json({ success: false, message: 'Access denied. Seller role required.' });
        }
        role = updated.user_type;
      } else {
        return res.status(403).json({ success: false, message: 'Access denied. Seller role required.' });
      }
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
    const toDate = (v) => {
      if (!v) return null;
      const d = new Date(v);
      if (isNaN(d.getTime())) return null;
      // Return YYYY-MM-DD for Postgres DATE columns
      return d.toISOString().slice(0, 10);
    };

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

    const baseSlug = (name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    const metaTitleVal = meta_title || name?.slice(0, 60) || null;
    const metaDescVal = meta_description || (description?.slice(0, 150) || null);

    // Ensure unique slug by checking existing records
    let slug = baseSlug || null;
    if (slug) {
      let candidate = slug;
      let suffix = 1;
      // Use head count query to check existence without returning rows
      // Limit attempts to a reasonable number
      for (let i = 0; i < 50; i++) {
        const { count, error: countErr } = await supabaseAdmin
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('slug', candidate);
        if (countErr) break; // On error, proceed with current candidate
        if (!count || count === 0) { slug = candidate; break; }
        suffix += 1;
        candidate = `${baseSlug}-${suffix}`;
      }
    }

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
    res.status(500).json({ success: false, message: 'Server error', error: process.env.NODE_ENV === 'development' ? (error?.message || String(error)) : undefined });
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
    const from = (parseInt(page) - 1) * parseInt(limit);
    const to = from + parseInt(limit) - 1;

    let query = supabaseAdmin
      .from('products')
      .select('*', { count: 'exact' })
      .eq('seller_id', req.params.sellerId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    res.json({
      success: true,
      data: {
        products: data || [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((count || 0) / parseInt(limit)),
          totalItems: count || 0,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get seller products error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
