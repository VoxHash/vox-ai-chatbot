import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  console.log('TELEGRAM_BOT_TOKEN not set. Exiting.');
  process.exit(0);
}
const app = express(); app.use(express.json());
const api = `https://api.telegram.org/bot${token}`;

app.post('/webhook', async (req, res) => {
  const msg = req.body?.message;
  const chatId = msg?.chat?.id;
  const text = msg?.text || '';
  if (chatId) {
    await fetch(`${api}/sendMessage`, { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ chat_id: chatId, text: `Echo: ${text}` }) });
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => console.log('Telegram bot webhook on', PORT));
