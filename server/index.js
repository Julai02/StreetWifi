import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

// Import routes
import authRoutes from './routes/authRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import portalRoutes from './routes/portalRoutes.js';

// Import cron jobs
import { initializeCronJobs } from './utils/cronJobs.js';

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/streetwifi';

// Middleware
const clientOrigin = process.env.CLIENT_ORIGIN || process.env.VITE_CLIENT_URL || 'http://localhost:5173';
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (e.g., curl, server-to-server)
      if (!origin) return callback(null, true);
      // allow specific client origin in production
      if (process.env.NODE_ENV === 'production') {
        return origin === clientOrigin ? callback(null, true) : callback(new Error('Not allowed by CORS'));
      }
      // allow any origin in development
      return callback(null, true);
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (enable with LOG_REQUESTS=true)
if (process.env.LOG_REQUESTS === 'true' && process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'StreetWifi server is running',
    timestamp: new Date(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/portal', portalRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to StreetWifi API - Developed by HolyTech Ltd',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      payments: '/api/payments',
      sessions: '/api/sessions',
      admin: '/api/admin',
      portal: '/api/portal',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

// Database connection and server startup
const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✓ MongoDB connected successfully');

    // Initialize cron jobs
    initializeCronJobs();

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ StreetWifi Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('✗ Server startup error:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
