/**
 * Database Configuration
 * @description MongoDB connection with Mongoose
 */

import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

/**
 * Connect to MongoDB
 */
export const connectDB = async () => {
  try {
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Use IPv4
    };

  // Support both MONGODB_URI and MONGO_URI environment variable names
  // Use test database when in test environment
  const mongoUri = process.env.NODE_ENV === 'test' 
    ? process.env.MONGO_TEST_URI || process.env.MONGODB_URI || process.env.MONGO_URI
    : process.env.MONGODB_URI || process.env.MONGO_URI;
  const conn = await mongoose.connect(mongoUri, options);

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    logger.info(`📊 Database: ${conn.connection.name}`);

    // Event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('✅ MongoDB reconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    logger.error('❌ Error connecting to MongoDB:', error.message);
    // In test environment, throw instead of exiting so Jest can handle the failure
    if (process.env.NODE_ENV === 'test') {
      throw error;
    }

    process.exit(1);
  }
};

/**
 * Close database connection
 */
export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error) {
    logger.error('Error closing MongoDB connection:', error);
  }
};

/**
 * Check database connection health
 */
export const checkDBHealth = () => {
  const state = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  return {
    status: states[state] || 'unknown',
    isConnected: state === 1,
  };
};
