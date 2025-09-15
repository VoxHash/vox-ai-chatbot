import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { pool } from '../lib/db.js';

const router = express.Router();
const registerSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const loginSchema = registerSchema;

function signTokens(user) {
  const access = jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  const refresh = jwt.sign({ sub: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '30d' });
  return { access, refresh };
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = registerSchema.parse(req.body);
    const hash = await bcrypt.hash(password, 10);
    const q = await pool.query('INSERT INTO users (email, password_hash) VALUES ($1,$2) RETURNING id, email, role', [email, hash]);
    const user = q.rows[0];
    const tokens = signTokens(user);
    res.json({ user, tokens });
  } catch (e) {
    if (String(e).includes('violates unique')) return res.status(409).json({ error: 'Email already registered' });
    res.status(400).json({ error: e.errors?.[0]?.message || String(e) });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const q = await pool.query('SELECT id, email, role, password_hash FROM users WHERE email=$1', [email]);
    const u = q.rows[0];
    if (!u) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, u.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const tokens = signTokens(u);
    res.json({ user: { id: u.id, email: u.email, role: u.role }, tokens });
  } catch (e) {
    res.status(400).json({ error: e.errors?.[0]?.message || String(e) });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refresh } = req.body;
    const decoded = jwt.verify(refresh, process.env.JWT_REFRESH_SECRET);
    const q = await pool.query('SELECT id, email, role FROM users WHERE id=$1', [decoded.sub]);
    const user = q.rows[0];
    if (!user) return res.status(401).json({ error: 'User not found' });
    const tokens = signTokens(user);
    res.json({ tokens });
  } catch (e) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

export default router;
