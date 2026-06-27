import mongoose from 'mongoose';
import { User } from './src/models/User';
import dotenv from 'dotenv';

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to DB');

    // Delete all users to start fresh
    const result = await User.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} users from the database.`);
    
    console.log('Database is now clean! You can now create a new account.');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await mongoose.disconnect();
  }
}

run();
