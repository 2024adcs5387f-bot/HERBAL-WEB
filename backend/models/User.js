import { DataTypes } from 'sequelize';
import bcrypt from 'bcryptjs';
import { sequelize } from '../config/database.js';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 100]
    }
  },
  userType: {
    type: DataTypes.ENUM('buyer', 'seller', 'herbalist', 'researcher', 'admin'),
    allowNull: false,
    defaultValue: 'buyer'
  },
  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  // Seller specific fields
  businessName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  businessLicense: {
    type: DataTypes.STRING,
    allowNull: true
  },
  sellerVerificationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: true
  },
  // Herbalist specific fields
  credentials: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  specializations: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  herbalistVerificationStatus: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: true
  },
  // Profile fields
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    defaultValue: 0.00
  },
  totalReviews: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  lastLoginAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
    allowNull: true
  },
  resetPasswordExpires: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  },
  indexes: [
    { fields: ['email'] },
    { fields: ['userType'] },
    { fields: ['isVerified'] },
    { fields: ['isActive'] }
  ]
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

User.prototype.toJSON = function() {
  const values = { ...this.get() };
  delete values.password;
  delete values.resetPasswordToken;
  delete values.resetPasswordExpires;
  return values;
};

export default User;
