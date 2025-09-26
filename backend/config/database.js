// ./config/database.js
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

// Database configuration for Supabase hosted Postgres
const config = {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false, // enable logs in dev
  pool: {
    max: 10,      // max connections
    min: 0,
    acquire: 30000, // max time to acquire connection
    idle: 10000     // max idle time
  },
  define: {
    timestamps: true,       // automatically add createdAt/updatedAt
    underscored: true,      // use snake_case column names
    freezeTableName: true   // disable automatic pluralization
  },
  dialectOptions: {
    ssl: {
      require: true,              // Supabase requires SSL
      rejectUnauthorized: false   // allow self-signed certs
    }
  }
};

// Use DATABASE_URL or SUPABASE_DB_URL
const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;

// Create Sequelize instance
export const sequelize = new Sequelize(connectionString, config);

// Optional: Test database connection
export const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    return false;
  }
};

// Gracefully close Sequelize connection
export const closeConnection = async () => {
  try {
    await sequelize.close();
    console.log('🔒 Database connection closed.');
  } catch (err) {
    console.error('❌ Error closing database connection:', err.message);
  }
};

export default sequelize;
