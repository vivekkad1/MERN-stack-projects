import mongoose from 'mongoose';
import { User } from './src/models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const email = 'testuser123@example.com';
  const password = 'Password123';

  // 1. Delete if exists
  await User.deleteOne({ email });

  // 2. Create user
  const user = await User.create({
    name: 'Test User',
    email: email,
    passwordHash: password,
  });

  console.log('User created. Password hash in memory:', user.passwordHash);

  // 3. Fetch user
  const fetchedUser = await User.findOne({ email });
  console.log('Fetched user password hash:', fetchedUser?.passwordHash);

  // 4. Compare
  if (fetchedUser) {
    const isMatch = await fetchedUser.comparePassword(password);
    console.log('Password match:', isMatch);
    
    const isMatchRaw = await bcrypt.compare(password, fetchedUser.passwordHash as string);
    console.log('Raw bcrypt compare:', isMatchRaw);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
