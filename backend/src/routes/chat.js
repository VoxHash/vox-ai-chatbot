import express from 'express';
import { z } from 'zod';
import { pool } from '../lib/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { completeChat } from '../ai/openai.js';

const router = express.Router();
const msgSchema = z.object({
  conversationId: z.number().optional(),
  message: z.string().min(1).max(5000),
});

router.get('/conversations', requireAuth, async (req, res) => {
  const q = await pool.query('SELECT id, title, created_at FROM conversations WHERE user_id=$1 ORDER BY id DESC', [req.user.sub]);
  res.json(q.rows);
});

router.post('/message', requireAuth, async (req, res) => {
  try {
    const { conversationId, message } = msgSchema.parse(req.body);
    let convId = conversationId;
    if (!convId) {
      const c = await pool.query('INSERT INTO conversations (user_id, title) VALUES ($1,$2) RETURNING id', [req.user.sub, message.slice(0, 40)]);
      convId = c.rows[0].id;
    }
    await pool.query('INSERT INTO messages (conversation_id, sender, content) VALUES ($1,$2,$3)', [convId, 'user', message]);
    const historyQ = await pool.query('SELECT sender, content FROM messages WHERE conversation_id=$1 ORDER BY id ASC', [convId]);
    const messages = [{ role: 'system', content: 'You are a helpful assistant.' }, ...historyQ.rows.map(r => ({ role: r.sender === 'user' ? 'user' : 'assistant', content: r.content }))];
    const reply = await completeChat(messages);
    await pool.query('INSERT INTO messages (conversation_id, sender, content) VALUES ($1,$2,$3)', [convId, 'assistant', reply]);
    res.json({ conversationId: convId, reply });
  } catch (e) {
    res.status(400).json({ error: e.errors?.[0]?.message || String(e) });
  }
});

router.get('/admin/metrics', requireAuth, requireAdmin, async (_req, res) => {
  const stats = await pool.query(`
    SELECT
      (SELECT COUNT(*) FROM users) as users,
      (SELECT COUNT(*) FROM conversations) as conversations,
      (SELECT COUNT(*) FROM messages) as messages
  `);
  res.json(stats.rows[0]);
});

export default router;
