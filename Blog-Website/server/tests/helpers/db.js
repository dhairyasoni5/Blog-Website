import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './.env.test' });

const connectDB = async () => {
  // Only connect if we're not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.TEST_DATABASE_URI);
    console.log('Test database connected');
  }
  return mongoose.connection;
};

const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
    console.log('Test database disconnected');
  }
};

const clearDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

export { connectDB, disconnectDB, clearDB };
