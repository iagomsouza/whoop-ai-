// ULTRA-SIMPLIFIED chat.ts for Netlify logging debug

console.log('[CHAT_TS_LOG_001] Script execution started.');

import express, { Request, Response } from 'express';
import serverless from 'serverless-http';
import cors from 'cors';

console.log('[CHAT_TS_LOG_002] Imports completed.');

const app = express();

// Middleware to log incoming request path details
app.use((req, res, next) => {
  console.log(`[CHAT_TS_LOG_REQ_DETAILS] Path: ${req.path}, OriginalURL: ${req.originalUrl}, BaseURL: ${req.baseUrl}, Method: ${req.method}`);
  next();
});
console.log('[CHAT_TS_LOG_003] Express app initialized.');

app.use(cors());
console.log('[CHAT_TS_LOG_004] CORS middleware applied.');

app.use(express.json());
console.log('[CHAT_TS_LOG_005] Express JSON middleware applied.');

const router = express.Router();
console.log('[CHAT_TS_LOG_006] Express router initialized.');

// This will handle requests to /api/chat (if :splat captures 'chat')
router.post('/*', (req: Request, res: Response) => { // Catch any POST under the router's mount point
  console.log(`[CHAT_TS_LOG_007_DEBUG] POST request to general path '${req.path}' received (original splat was expected to be 'chat').`);
  console.log('[CHAT_TS_LOG_008] Request body:', JSON.stringify(req.body || {}));
  res.status(200).json({ 
    reply: `Ultra-simplified Netlify function says hi! POST to '${req.path}' handled.`,
    actualPath: req.path,
    originalUrl: req.originalUrl,
    baseUrl: req.baseUrl,
    bodyReceived: req.body 
  });
  console.log(`[CHAT_TS_LOG_009_DEBUG] Responding to POST ${req.path}`);
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
