import { sequelize } from '../config/database.js';
import User from './User.js';
import Product from './Product.js';
import Order from './Order.js';
import OrderItem from './OrderItem.js';
import Herb from './research/Herb.js';
import Disease from './research/Disease.js';
import ResearchPost from './research/ResearchPost.js';
import Comment from './research/Comment.js';

// Define associations
User.hasMany(Product, { 
  foreignKey: 'sellerId', 
  as: 'products' 
});
Product.belongsTo(User, { 
  foreignKey: 'sellerId', 
  as: 'seller' 
});

User.hasMany(Order, { 
  foreignKey: 'buyerId', 
  as: 'orders' 
});
Order.belongsTo(User, { 
  foreignKey: 'buyerId', 
  as: 'buyer' 
});

Order.hasMany(OrderItem, {
  foreignKey: 'orderId',
  as: 'orderItems'
});
OrderItem.belongsTo(Order, {
  foreignKey: 'orderId',
  as: 'order'
});

Product.hasMany(OrderItem, { 
  foreignKey: 'productId', 
  as: 'orderItems' 
});
OrderItem.belongsTo(Product, { 
  foreignKey: 'productId', 
  as: 'product' 
});

User.hasMany(OrderItem, { 
  foreignKey: 'sellerId', 
  as: 'soldItems' 
});
OrderItem.belongsTo(User, { 
  foreignKey: 'sellerId', 
  as: 'seller' 
});

// Research Hub associations
ResearchPost.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(ResearchPost, { foreignKey: 'authorId', as: 'researchPosts' });

ResearchPost.belongsTo(Herb, { foreignKey: 'relatedHerbId', as: 'herb' });
Herb.hasMany(ResearchPost, { foreignKey: 'relatedHerbId', as: 'researchPosts' });

ResearchPost.belongsTo(Disease, { foreignKey: 'relatedDiseaseId', as: 'disease' });
Disease.hasMany(ResearchPost, { foreignKey: 'relatedDiseaseId', as: 'researchPosts' });

Comment.belongsTo(User, { foreignKey: 'authorId', as: 'author' });
User.hasMany(Comment, { foreignKey: 'authorId', as: 'comments' });

Comment.belongsTo(ResearchPost, { foreignKey: 'postId', as: 'post' });
ResearchPost.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });

Comment.belongsTo(Comment, { foreignKey: 'parentId', as: 'parent' });
Comment.hasMany(Comment, { foreignKey: 'parentId', as: 'replies' });

export {
  sequelize,
  User,
  Product,
  Order,
  OrderItem,
  Herb,
  Disease,
  ResearchPost,
  Comment
};
