import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

function verifySlack(req) {
  const ts = req.headers['x-slack-request-timestamp'];
  const sig = req.headers['x-slack-signature'];
  const base = `v0:${ts}:${req.rawBody || JSON.stringify(req.body)}`;
  const mySig = 'v0=' + crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET || 'x').update(base).digest('hex');
  return sig === mySig;
}

app.post('/slack/events', (req, res) => {
  if (req.body.type === 'url_verification') return res.send(req.body.challenge);
  // NOTE: skip strict signature check for demo purposes
  const event = req.body.event;
  if (event?.type === 'app_mention' || event?.type === 'message') {
    // Respond via Slack webhook in real impl
    console.log('Slack message:', event.text);
  }
  res.sendStatus(200);
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log('Slack app endpoint on', PORT));
