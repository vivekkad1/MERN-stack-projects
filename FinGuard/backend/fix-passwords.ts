import mongoose from 'mongoose';
import { User } from './src/models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const users = await User.find({});
  let plaintextCount = 0;
  for (const u of users) {
    if (u.passwordHash && !u.passwordHash.startsWith('$2')) {
      console.log(`Found plaintext password for ${u.email}: ${u.passwordHash}`);
      plaintextCount++;
      // Fix it
      const salt = await bcrypt.genSalt(12);
      u.passwordHash = await bcrypt.hash(u.passwordHash, salt);
      await u.save();
      console.log(`Fixed password for ${u.email}`);
    }
  }
  
  if (plaintextCount === 0) {
      console.log('No plaintext passwords found.');
  }

  await mongoose.disconnect();
}

run().catch(console.error);
