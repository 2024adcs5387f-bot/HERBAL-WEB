import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const ResearchPost = sequelize.define('ResearchPost', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  abstract: {
    type: DataTypes.STRING(1000),
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  references: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  relatedHerbId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  relatedDiseaseId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('draft', 'published', 'under_review'),
    defaultValue: 'published'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  indexes: [
    { fields: ['authorId'] },
    { fields: ['relatedHerbId'] },
    { fields: ['relatedDiseaseId'] },
    { fields: ['status'] },
    { fields: ['isVerified'] }
  ]
});

export default ResearchPost;


