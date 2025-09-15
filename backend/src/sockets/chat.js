import { completeChat } from '../ai/openai.js';
import { pool } from '../lib/db.js';

export function registerChatSocket(io, socket) {
  socket.on('join', ({ conversationId }) => {
    if (conversationId) socket.join(`conv:${conversationId}`);
  });

  socket.on('chat:send', async (payload, ack) => {
    try {
      const { conversationId, message, userId } = payload;
      if (!userId) return ack?.({ error: 'userId required' });
      let convId = conversationId;
      if (!convId) {
        const c = await pool.query('INSERT INTO conversations (user_id, title) VALUES ($1,$2) RETURNING id', [userId, message?.slice(0,40)||'Conversation']);
        convId = c.rows[0].id;
      }
      await pool.query('INSERT INTO messages (conversation_id, sender, content) VALUES ($1,$2,$3)', [convId, 'user', message]);
      io.to(socket.id).emit('chat:typing', { conversationId: convId, typing: true });

      const historyQ = await pool.query('SELECT sender, content FROM messages WHERE conversation_id=$1 ORDER BY id ASC', [convId]);
      const messages = [{ role: 'system', content: 'You are a helpful assistant.' }, ...historyQ.rows.map(r => ({ role: r.sender === 'user' ? 'user' : 'assistant', content: r.content }))];
      const reply = await completeChat(messages);
      await pool.query('INSERT INTO messages (conversation_id, sender, content) VALUES ($1,$2,$3)', [convId, 'assistant', reply]);

      io.to(`conv:${convId}`).emit('chat:message', { conversationId: convId, sender: 'assistant', content: reply });
      ack?.({ conversationId: convId, reply });
    } catch (e) {
      ack?.({ error: String(e) });
    } finally {
      io.to(socket.id).emit('chat:typing', { typing: false });
    }
  });
}
