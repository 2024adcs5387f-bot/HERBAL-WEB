import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const Disease = sequelize.define('Disease', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  symptoms: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['name'] }
  ]
});

export default Disease;


