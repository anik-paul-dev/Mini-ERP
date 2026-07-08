import express, { Express, Request, Response } from 'express';
import http from 'http';
import cors, { CorsOptions } from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { connectCloudinary } from './config/cloudinary';
import { connectRedis } from './config/redis';
import { initSocket } from './config/socket';
import { generalLimiter } from './middleware/rateLimiter';
import errorHandler from './middleware/errorHandler';
import ApiError from './utils/ApiError';

// Routes
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import roleRoutes from './modules/role/role.routes';
import productRoutes from './modules/product/product.routes';
import customerRoutes from './modules/customer/customer.routes';
import saleRoutes from './modules/sale/sale.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import chatRoutes from './modules/chat/chat.routes';
import activityRoutes from './modules/activity/activity.routes';

// Load env vars
dotenv.config();

const app: Express = express();

const normalizeOrigin = (origin: string): string => {
  try {
    return new URL(origin).origin;
  } catch {
    return origin.replace(/\/+$/, '');
  }
};

const allowedOrigins = [
  'http://localhost:5173',
  'https://mini-erp-khaki-six.vercel.app',
  ...(process.env.CLIENT_URL || '').split(','),
]
  .map((origin) => origin.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
      callback(null, true);
      return;
    }

    callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

// Connect to databases & external services
connectDB();
connectCloudinary();
connectRedis();

// Middleware
app.use(helmet()); // Security HTTP headers
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(generalLimiter); // Apply general rate limiting

// Mount routes
const API_PREFIX = '/api/v1';

app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/roles`, roleRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/customers`, customerRoutes);
app.use(`${API_PREFIX}/sales`, saleRoutes);
app.use(`${API_PREFIX}/dashboard`, dashboardRoutes);
app.use(`${API_PREFIX}/chat`, chatRoutes);
app.use(`${API_PREFIX}/activities`, activityRoutes);

// Health checks
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, status: 'ok', service: 'mini-erp-server' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, status: 'ok', timestamp: new Date() });
});

// 404 handler
app.use((_req: Request, _res: Response, next) => {
  next(ApiError.notFound('Resource not found'));
});

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (!process.env.VERCEL) {
  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

export default app;