import express from 'express';
import { Order, OrderItem, Product, User } from '../models/index.js';
import { authenticate, authorize, resolveUserAnyToken } from '../middleware/auth.js';
import { validateOrder } from '../utils/validation.js';

const router = express.Router();

const ORDER_ACTIVE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped'];

const mapOrderResponse = (order) => {
  const subtotal = Number(order.subtotal ?? order.subTotal ?? 0);
  const taxAmount = Number(order.taxAmount ?? order.tax ?? 0);
  const shippingAmount = Number(order.shippingAmount ?? order.shipping ?? 0);
  const discountAmount = Number(order.discountAmount ?? order.discount ?? 0);
  const totalAmount = Number(order.totalAmount ?? order.total ?? subtotal + taxAmount + shippingAmount - discountAmount);

  const items = (order.orderItems || []).map((item) => {
    const snapshotName = item.productSnapshot?.name;
    const productName = snapshotName || item.product?.name || 'Product';
    const snapshotImages = item.productSnapshot?.images;
    const productImages = item.product?.images;
    const firstImage = Array.isArray(snapshotImages) && snapshotImages.length
      ? snapshotImages[0]
      : Array.isArray(productImages) && productImages.length
        ? productImages[0]
        : (typeof productImages === 'string' ? productImages : null);

    return {
      id: item.id,
      productId: item.productId,
      sellerId: item.sellerId,
      name: productName,
      quantity: Number(item.quantity ?? 0),
      price: Number(item.price ?? 0),
      total: Number(item.total ?? 0),
      image: firstImage,
    };
  });

  const itemsCount = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    subtotal,
    taxAmount,
    shippingAmount,
    discountAmount,
    totalAmount,
    paymentMethod: order.paymentMethod,
    shippingAddress: order.shippingAddress,
    billingAddress: order.billingAddress,
    trackingNumber: order.trackingNumber,
    estimatedDelivery: order.estimatedDelivery,
    items,
    itemsCount,
  };
};

// @route   GET /api/orders/buyer/dashboard
// @desc    Get buyer dashboard summary + orders
// @access  Private (Supabase/App JWT)
router.get('/buyer/dashboard', resolveUserAnyToken, async (req, res) => {
  try {
    const buyerId = req.authUser?.id || req.user?.id;
    if (!buyerId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const orders = await Order.findAll({
      where: { buyerId },
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'images']
        }]
      }],
      order: [['createdAt', 'DESC']]
    });

    const mappedOrders = orders.map(mapOrderResponse);

    const stats = mappedOrders.reduce((acc, order) => {
      acc.totalOrders += 1;
      if (ORDER_ACTIVE_STATUSES.includes(String(order.status || '').toLowerCase())) {
        acc.activeOrders += 1;
      }
      acc.totalSpent += order.totalAmount || 0;
      acc.itemsPurchased += order.itemsCount || 0;
      return acc;
    }, {
      totalOrders: 0,
      activeOrders: 0,
      totalSpent: 0,
      itemsPurchased: 0
    });

    const recentOrders = mappedOrders.slice(0, 5);

    res.json({
      success: true,
      data: {
        stats,
        orders: mappedOrders,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Buyer dashboard orders error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private (Buyers only)
router.post('/', authenticate, async (req, res) => {
  try {
    const { error } = validateOrder(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message
      });
    }

    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

    // Validate products and calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      
      if (!product || !product.isActive) {
        return res.status(400).json({
          success: false,
          message: `Product ${item.productId} not found or inactive`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        sellerId: product.sellerId,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
        productSnapshot: {
          name: product.name,
          description: product.shortDescription || product.description,
          images: product.images,
          sku: product.sku
        }
      });
    }

    // Calculate totals (you can add tax and shipping logic here)
    const tax = subtotal * 0.08; // 8% tax
    const shipping = subtotal > 50 ? 0 : 9.99; // Free shipping over $50
    const total = subtotal + tax + shipping;

    // Create order
    const order = await Order.create({
      buyerId: req.user.id,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    // Create order items
    for (const item of orderItems) {
      await OrderItem.create({
        orderId: order.id,
        ...item
      });

      // Update product stock
      await Product.decrement('stock', {
        by: item.quantity,
        where: { id: item.productId }
      });
    }

    // Fetch complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'images']
        }]
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order: completeOrder }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { buyerId: req.user.id };
    if (status) {
      whereClause.status = status;
    }

    const orders = await Order.findAndCountAll({
      where: whereClause,
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'images']
        }]
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        orders: orders.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(orders.count / limit),
          totalItems: orders.count,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const order = await Order.findOne({
      where: { id: req.params.id },
      include: [{
        model: OrderItem,
        as: 'orderItems',
        include: [{
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'images', 'slug']
        }, {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'businessName']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check access (buyer or seller)
    const isOwner = order.buyerId === req.user.id;
    const isSeller = (order.orderItems || []).some(item => item.sellerId === req.user.id);

    if (!isOwner && !isSeller) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private (Sellers only)
router.put('/:id/status', authenticate, authorize('seller'), async (req, res) => {
  try {
    const { status, trackingNumber } = req.body;
    
    const validStatuses = ['confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if seller has items in this order
    const orderItem = await OrderItem.findOne({
      where: {
        orderId: order.id,
        sellerId: req.user.id
      }
    });

    if (!orderItem) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = { status };
    if (status === 'shipped' && trackingNumber) {
      updateData.trackingNumber = trackingNumber;
      updateData.shippedAt = new Date();
    }
    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    await order.update(updateData);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

export default router;
