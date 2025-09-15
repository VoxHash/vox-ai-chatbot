import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { pool } from './lib/db.js';
import { redis } from './lib/redis.js';
import authRouter from './routes/auth.js';
import chatRouter from './routes/chat.js';
import { registerChatSocket } from './sockets/chat.js';

const PORT = process.env.PORT || 4000;
const ALLOWED = (process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: ALLOWED.length ? ALLOWED : true, credentials: true }
});

// Middleware
app.use(helmet());
app.use(express.json({ limit: '1mb' }));
app.use(cors({ origin: (origin, cb) => cb(null, true), credentials: true }));
app.use(morgan('dev'));
app.set('trust proxy', 1);

// Rate limiter
const limiter = rateLimit({ windowMs: 60_000, max: 120 });
app.use(limiter);

// Health
app.get('/api/health', async (_req, res) => {
  try {
    const pg = await pool.query('SELECT 1 as ok');
    await redis.ping();
    res.json({ ok: true, pg: pg.rows[0].ok, redis: 'pong' });
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) });
  }
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/chat', chatRouter);

// Socket namespace
io.on('connection', (socket) => registerChatSocket(io, socket));

server.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
