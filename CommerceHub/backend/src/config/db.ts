import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI as string);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`MongoDB Connection Error: ${error.message}. Please ensure MongoDB is running locally.`);
    // Do not exit, allow Mongoose to retry or the server to return 500s instead of crashing
  }
};

export default connectDB;
