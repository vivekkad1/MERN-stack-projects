import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';
import { User, UserRole } from '../models/User';
import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Brand } from '../models/Brand';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/commercehub';

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await Brand.deleteMany({});

    // Create Admin User
    console.log('Creating Admin user...');
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@commercehub.com',
      password: 'password123',
      role: UserRole.SUPER_ADMIN,
      isEmailVerified: true,
    });

    // Create Sellers
    console.log('Creating Sellers...');
    const sellers = [];
    for (let i = 0; i < 5; i++) {
      const seller = await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        role: UserRole.SELLER,
        isEmailVerified: true,
      });
      sellers.push(seller);
    }

    // Create Customers
    console.log('Creating Customers...');
    for (let i = 0; i < 20; i++) {
      await User.create({
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: 'password123',
        role: UserRole.CUSTOMER,
        isEmailVerified: true,
      });
    }

    // Create Brands
    console.log('Creating Brands...');
    const brands = [];
    for (let i = 0; i < 5; i++) {
      const brand = await Brand.create({
        name: faker.company.name(),
        slug: faker.helpers.slugify(faker.company.name()).toLowerCase(),
        description: faker.company.catchPhrase(),
        logoUrl: faker.image.urlLoremFlickr({ category: 'business' }),
      });
      brands.push(brand);
    }

    // Create Categories
    console.log('Creating Categories...');
    const categories = [];
    const categoryNames = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books'];
    for (const name of categoryNames) {
      const category = await Category.create({
        name,
        slug: faker.helpers.slugify(name).toLowerCase(),
        description: faker.lorem.sentence(),
        imageUrl: faker.image.urlLoremFlickr({ category: 'abstract' }),
      });
      categories.push(category);
    }

    // Create Products
    console.log('Creating Products...');
    for (let i = 0; i < 50; i++) {
      const seller = faker.helpers.arrayElement(sellers);
      const category = faker.helpers.arrayElement(categories);
      const brand = faker.helpers.arrayElement(brands);
      const title = faker.commerce.productName();

      await Product.create({
        title,
        slug: faker.helpers.slugify(title).toLowerCase() + '-' + faker.string.alphanumeric(5),
        description: faker.commerce.productDescription(),
        seller: seller._id,
        category: category._id,
        brand: brand._id,
        basePrice: parseFloat(faker.commerce.price({ min: 10, max: 1000 })),
        images: [
          faker.image.urlLoremFlickr({ category: 'product' }),
          faker.image.urlLoremFlickr({ category: 'product' })
        ],
        stock: faker.number.int({ min: 0, max: 200 }),
        sold: faker.number.int({ min: 0, max: 50 }),
        rating: faker.number.float({ min: 1, max: 5, fractionDigits: 1 }),
        numReviews: faker.number.int({ min: 0, max: 100 }),
        isActive: true,
      });
    }

    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
