import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  buyerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'User',
      key: 'id'
    }
  },
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded'),
    allowNull: false,
    defaultValue: 'pending'
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  stripeSessionId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  stripePaymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  taxAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  shippingAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: 'USD'
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  shippingAddress: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  billingAddress: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  shippingMethod: {
    type: DataTypes.STRING,
    allowNull: true
  },
  trackingNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estimatedDelivery: {
    type: DataTypes.DATE,
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  customerNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Timestamps
  paidAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  shippedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  cancelledAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: (order) => {
      // Generate order number
      if (!order.orderNumber) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substr(2, 4).toUpperCase();
        order.orderNumber = `HM-${timestamp}-${random}`;
      }
      
      // Calculate totals
      if (order.items && order.items.length > 0) {
        order.subtotal = order.items.reduce((sum, item) => {
          return sum + (item.price * item.quantity);
        }, 0);
        
        order.totalAmount = order.subtotal + order.taxAmount + order.shippingAmount - order.discountAmount;
      }
    },
    beforeUpdate: (order) => {
      // Update timestamps based on status changes
      if (order.changed('status')) {
        const now = new Date();
        
        switch (order.status) {
          case 'paid':
            order.paidAt = now;
            break;
          case 'shipped':
            order.shippedAt = now;
            break;
          case 'delivered':
            order.deliveredAt = now;
            break;
          case 'cancelled':
            order.cancelledAt = now;
            break;
        }
      }
      
      // Update payment status based on status
      if (order.changed('status')) {
        if (['paid', 'processing', 'shipped', 'delivered'].includes(order.status)) {
          order.paymentStatus = 'completed';
        } else if (order.status === 'cancelled') {
          order.paymentStatus = 'refunded';
        }
      }
    }
  },
  indexes: [
    { fields: ['buyerId'] },
    { fields: ['orderNumber'] },
    { fields: ['status'] },
    { fields: ['paymentStatus'] },
    { fields: ['stripeSessionId'] },
    { fields: ['createdAt'] }
  ]
});

export default Order;
