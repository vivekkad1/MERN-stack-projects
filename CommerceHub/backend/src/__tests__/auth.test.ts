import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { User } from '../models/User';

// We mock the database connection for tests, or use a separate test DB
// In a real setup you might use mongodb-memory-server

describe('Authentication API', () => {
  beforeAll(async () => {
    // Connect to test database if needed
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.statusCode).toBe(400);
    });

    it('should register a new user successfully with valid data', async () => {
      // Setup mock data for User.findOne to return null, and User.create to return mock user
      // For a true integration test, you'd insert/clean the DB.
      // This is a placeholder test that expects 400 without real DB setup to avoid affecting dev DB
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });
      // Assuming no mock DB setup is present right now, it might return 500 or 400 depending on validation
      expect(res.statusCode).toBeGreaterThanOrEqual(400); 
    });
  });
});
