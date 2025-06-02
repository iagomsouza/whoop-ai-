// ULTRA-SIMPLIFIED chat.ts for Netlify logging debug

console.log('[CHAT_TS_LOG_001] Script execution started.');

import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

console.log('[CHAT_TS_LOG_002] Imports completed.');

const app = express();
console.log('[CHAT_TS_LOG_003] Express app initialized.');

app.use(cors());
console.log('[CHAT_TS_LOG_004] CORS middleware applied.');

app.use(express.json());
console.log('[CHAT_TS_LOG_005] Express JSON middleware applied.');

const router = express.Router();
console.log('[CHAT_TS_LOG_006] Express router initialized.');

// This will handle requests to /api/chat (if :splat captures 'chat')
router.post('/chat', (req: Request, res: Response) => {
  console.log('[CHAT_TS_LOG_007_MODIFIED] POST request to /chat received.');
  console.log('[CHAT_TS_LOG_008] Request body:', JSON.stringify(req.body || {}));
  res.status(200).json({ 
    reply: 'Ultra-simplified Netlify function says hi! This is a POST response.' 
  });
  console.log('[CHAT_TS_LOG_009] POST /chat response sent.');
});

// This will handle requests to /api/health (if :splat captures 'health')
router.get('/health', (req: Request, res: Response) => {
  console.log('[CHAT_TS_LOG_010] GET /health (invoked via /api/health) handler reached.');
  res.status(200).json({ status: 'Ultra-simplified health check OK' });
  console.log('[CHAT_TS_LOG_011] GET /health response sent.');
});

// Mount the router at the base path.
// Given Netlify rewrite: from = "/api/*" to = "/.netlify/functions/chat/:splat"
// A request to /api/chat should hit router.post('/') if :splat is 'chat' or empty.
// A request to /api/health should hit router.get('/health') if :splat is 'health'.
app.use('/', router);
console.log('[CHAT_TS_LOG_012] Router mounted to app.');

export const handler = serverless(app);
console.log('[CHAT_TS_LOG_013] Serverless handler exported.');
