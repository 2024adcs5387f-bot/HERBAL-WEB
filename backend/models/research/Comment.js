import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  postId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  parentId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  indexes: [
    { fields: ['postId'] },
    { fields: ['authorId'] },
    { fields: ['parentId'] }
  ]
});

export default Comment;


