import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import hrRoutes from './routes/hr.routes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(helmet());
const rawClientUrls = process.env.CLIENT_URL || 'http://localhost:5173,https://student-hr.vercel.app';
const parsedOrigins = rawClientUrls.split(',').map((url) => url.trim().replace(/\/+$/, '')).filter(Boolean);

const defaultAllowedOrigins = [
  'https://student-hr.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

const allowedOrigins = new Set([...defaultAllowedOrigins, ...parsedOrigins]);

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. curl, Postman, server-to-server).
      if (!origin) return callback(null, true);
      // Clean origin trailing slash if present
      const cleanOrigin = origin.replace(/\/+$/, '');
      // Allow any localhost / 127.0.0.1 origin in development.
      const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin);
      if (isLocalhost || allowedOrigins.has(cleanOrigin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin '${origin}' is not allowed`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get('/', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'talentos-ai-api',
    message: 'TalentOS AI API Server Running',
    frontend: 'https://student-hr.vercel.app',
    health: '/health'
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'talentos-ai-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/hr', hrRoutes);
app.use(errorHandler);

export default app;
