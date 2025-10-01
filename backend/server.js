// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import productRoutes from './routes/products.js';
import orderRoutes from './routes/orders.js';
import aiRoutes from './routes/ai.js';
import paymentRoutes from './routes/payments.js';
import researchRoutes from './routes/research.js';
import uploadRoutes from './routes/uploads.js';
import knowledgeRoutes from './routes/knowledge.js';
import proxyRoutes from './routes/proxy.js';
import sessionRoutes from './routes/session.js';
import plantDataRoutes from './routes/plantData.js';

// Import error handler
import { errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDist = path.resolve(__dirname, '../dist');

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
// Configure CORS origins
const defaultDevOrigins = ['http://localhost:3000', 'http://localhost:5173'];
const envOrigins = (process.env.FRONTEND_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
const allowedOrigins = envOrigins.length > 0
  ? envOrigins
  : (process.env.NODE_ENV === 'production' ? [] : defaultDevOrigins);

app.use(cors({
  origin: allowedOrigins.length ? allowedOrigins : false,
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);

// Disable ETag for API responses and enforce no-cache to avoid 304 with empty body
// This prevents browsers/proxies from serving 304 Not Modified for JSON APIs
app.set('etag', false);
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Special handling for Stripe webhook (raw body)
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// Regular middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Herbal Marketplace API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/proxy', proxyRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/plant-data', plantDataRoutes);

// Ensure no /api/* path ever falls through to SPA index.html
// Any unmatched /api/* should return JSON 404 instead of HTML
app.all('/api/*', (req, res, next) => {
  // If a previous route wrote headers, skip
  if (res.headersSent) return next();
  return res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// ------------------------------
// Static frontend (Render single URL / production)
// ------------------------------
// Serve React build if it exists (harmless locally if not built)
app.use(express.static(clientDist));

// SPA fallback: send index.html for non-API routes
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  try {
    return res.sendFile(path.join(clientDist, 'index.html'));
  } catch {
    return next();
  }
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Error handling
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 API Health: http://localhost:${PORT}/api/health`);
  console.log(`🌿 Environment: ${process.env.NODE_ENV}`);
});

// Optional: handle unhandled rejections / exceptions
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
