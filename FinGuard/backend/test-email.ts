import mongoose from 'mongoose';
import { User } from './src/models/User';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected to DB');

  const email = 'MyTest@EXAMPLE.com';
  const password = 'Password123!';

  // 1. Delete if exists
  await User.deleteOne({ email: email.toLowerCase() });

  // 2. Create user with uppercase email
  const user = await User.create({
    name: 'Test Uppercase',
    email: email, // uppercase
    passwordHash: password,
  });

  console.log('Created user with email:', user.email);

  // 3. Find with EXACT uppercase email
  const foundExact = await User.findOne({ email: email });
  console.log('Found with exact:', !!foundExact);

  // 4. Find with lowercase email
  const foundLower = await User.findOne({ email: email.toLowerCase() });
  console.log('Found with lower:', !!foundLower);

  await mongoose.disconnect();
}

run().catch(console.error);
