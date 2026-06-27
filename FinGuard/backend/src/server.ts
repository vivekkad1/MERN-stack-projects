import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import authRoutes from './routes/authRoutes';
import transactionRoutes from './routes/transactionRoutes';
import fraudRoutes from './routes/fraudRoutes';
import analyticsRoutes from './routes/analyticsRoutes';
import budgetRoutes from './routes/budgetRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import aiRoutes from './routes/aiRoutes';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 5000;

// Socket.IO setup
export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
});

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);
  socket.on('join', (userId: string) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined room`);
  });
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/fraud', fraudRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/ai', aiRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Market data proxy (to avoid CORS issues)
app.get('/api/market/mock', (req, res) => {
  res.json({
    markets: [
      { symbol: 'SPY', name: 'S&P 500', price: 5423.45 + (Math.random() - 0.5) * 50, change: (Math.random() - 0.4) * 2, changePercent: (Math.random() - 0.4) * 0.8 },
      { symbol: 'QQQ', name: 'NASDAQ', price: 19234.56 + (Math.random() - 0.5) * 200, change: (Math.random() - 0.4) * 3, changePercent: (Math.random() - 0.4) * 1.2 },
      { symbol: 'BTC', name: 'Bitcoin', price: 67234.50 + (Math.random() - 0.5) * 2000, change: (Math.random() - 0.5) * 1000, changePercent: (Math.random() - 0.5) * 2.5 },
      { symbol: 'ETH', name: 'Ethereum', price: 3456.78 + (Math.random() - 0.5) * 200, change: (Math.random() - 0.5) * 80, changePercent: (Math.random() - 0.5) * 3 },
      { symbol: 'GLD', name: 'Gold', price: 2345.60 + (Math.random() - 0.5) * 30, change: (Math.random() - 0.3) * 15, changePercent: (Math.random() - 0.3) * 0.6 },
      { symbol: 'DXY', name: 'USD Index', price: 104.23 + (Math.random() - 0.5) * 1, change: (Math.random() - 0.5) * 0.4, changePercent: (Math.random() - 0.5) * 0.3 },
    ],
    updatedAt: new Date().toISOString(),
  });
});

// Exchange rates proxy
app.get('/api/currency/rates', async (req, res) => {
  try {
    const { base = 'USD' } = req.query;
    // Mock exchange rates (in production, use exchangerate-api.com)
    const rates: Record<string, number> = {
      EUR: 0.92, GBP: 0.79, JPY: 158.5, CAD: 1.37, AUD: 1.54,
      CHF: 0.90, CNY: 7.25, INR: 83.5, BRL: 5.12, MXN: 17.8,
      KRW: 1380, SGD: 1.35, HKD: 7.83, NOK: 10.65, SEK: 10.45,
    };
    res.json({ base, rates, updatedAt: new Date().toISOString() });
  } catch {
    res.status(500).json({ message: 'Failed to fetch rates' });
  }
});

// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finguard';
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 Socket.IO enabled`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
  });

export default app;
