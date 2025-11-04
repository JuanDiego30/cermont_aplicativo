import mongoose from 'mongoose';
import { logger } from '../utils/logger';
export const connectDB = async () => {
    try {
        const options = {
            maxPoolSize: process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE) : 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4,
            autoIndex: process.env.NODE_ENV !== 'production',
            bufferCommands: false,
        };
        const mongoUri = (process.env.NODE_ENV === 'test'
            ? process.env.MONGO_TEST_URI || process.env.MONGODB_URI || process.env.MONGO_URI
            : process.env.MONGODB_URI || process.env.MONGO_URI) || 'mongodb://localhost:27017/cermont';
        if (!mongoUri) {
            throw new Error('MONGODB_URI o MONGO_URI requerida en env');
        }
        await mongoose.connect(mongoUri, options);
        const conn = mongoose.connection;
        logger.info(`✅ MongoDB Connected: ${conn.host || 'unknown'}`);
        logger.info(`📊 Database: ${conn.name || 'unknown'}`);
        mongoose.connection.on('error', (err) => {
            logger.error('❌ MongoDB connection error:', err);
        });
        mongoose.connection.on('disconnected', async () => {
            logger.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
        });
        mongoose.connection.on('reconnected', () => {
            logger.info('✅ MongoDB reconnected');
        });
        const gracefulShutdown = async (signal) => {
            logger.info(`Received ${signal}. Closing MongoDB connection...`);
            await mongoose.connection.close();
            logger.info('MongoDB connection closed through app termination');
            process.exit(0);
        };
        process.off('SIGINT', gracefulShutdown);
        process.off('SIGTERM', gracefulShutdown);
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
        return conn;
    }
    catch (error) {
        const err = error;
        logger.error('❌ Error connecting to MongoDB:', err.message);
        if (process.env.NODE_ENV === 'test') {
            throw err;
        }
        process.exit(1);
    }
};
export const closeDB = async () => {
    try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
    }
    catch (error) {
        const err = error;
        logger.error('Error closing MongoDB connection:', err);
    }
};
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
        dbName: mongoose.connection.name || 'unknown',
        host: mongoose.connection.host || 'unknown',
    };
};
//# sourceMappingURL=database.js.map