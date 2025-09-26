import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const Herb = sequelize.define('Herb', {
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
  scientificName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  medicinalUses: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  images: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  indexes: [
    { fields: ['name'] },
    { fields: ['scientificName'] }
  ]
});

export default Herb;


