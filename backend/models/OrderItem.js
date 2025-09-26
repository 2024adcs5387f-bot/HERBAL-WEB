import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  sellerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: { min: 0 }
  },
  productSnapshot: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['orderId'] },
    { fields: ['productId'] },
    { fields: ['sellerId'] }
  ]
});

export default OrderItem;


