import express, { Request, Response } from 'express';
import OpenAI from 'openai';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import serverless from 'serverless-http';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
// For Netlify deployment, environment variables should be set in the Netlify UI.
// dotenv.config({ path: '../../.env' }); // This line is mainly for local testing if you use netlify dev

// Define WhoopDay interface for type safety with user data
interface WhoopDay {
  date: string;
  hrv: number;
  rhr: number;
  sleep_duration_hours: number;
  sleep_efficiency_percent: number;
  sleep_rem_hours: number;
  sleep_deep_hours: number;
  sleep_light_hours: number;
  strain_score: number;
  recovery_score_percent: number;
}

let systemPrompt = 'You are a helpful AI assistant. System prompt failed to load.'; // Default fallback
try {
  // Paths are relative to the function file's location after deployment
  const promptPath = path.join(__dirname, 'prompts/system_prompt_whoop_coach.md');
  systemPrompt = fs.readFileSync(promptPath, 'utf-8');
  console.log('System prompt loaded successfully from: ' + promptPath);
} catch (error) {
  console.error('Error loading system prompt from path: ' + path.join(__dirname, 'prompts/system_prompt_whoop_coach.md'), error);
  // Depending on requirements, you might want to throw error or prevent server start
}

let allUserData: WhoopDay[] = [];
try {
  const dataPath = path.join(__dirname, 'data/synthetic_user_data.json');
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  allUserData = JSON.parse(rawData);
  console.log(`User data loaded successfully from: ${dataPath}. ${allUserData.length} records found.`);
} catch (error) {
  console.error('Error loading user data from path: ' + path.join(__dirname, 'data/synthetic_user_data.json'), error);
  // Depending on requirements, you might want to throw error or use empty data
}

const app = express();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

let openai: OpenAI;

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log('OpenAI client initialized successfully for Netlify function.');
} else {
  console.error('OpenAI API key not found. Please set OPENAI_API_KEY in Netlify environment variables.');
}

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' },
  // Netlify uses the 'x-nf-client-connection-ip' header for the client's IP
  keyGenerator: (req: Request): string => { // Ensure a string is returned
    const ipHeader = req.headers['x-nf-client-connection-ip'];
    let clientIp: string | undefined;

    if (Array.isArray(ipHeader)) {
      clientIp = ipHeader[0];
    } else {
      clientIp = ipHeader;
    }
    // Provide a fallback key if IP is not found, to satisfy type and prevent errors.
    // For robust rate limiting, you might want to investigate further if IPs are often missing.
    return clientIp || req.ip || 'default-rate-limit-key';
  },
});

// The path for the function will be /.netlify/functions/chat
// The Express router will handle paths relative to this, e.g., if router handles /api/chat,
// the actual path hit would be /.netlify/functions/chat/api/chat.
// We'll simplify by having the function itself be the /api/chat endpoint.

const router = express.Router();

router.post('/chat', limiter, async (req: Request, res: Response) => {
  if (!openai) {
    return res.status(500).json({ error: 'Server configuration error: OpenAI client not initialized.' });
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Bad Request: No messages provided or messages is not an array.' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
      res.json({ reply: completion.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'Failed to get a valid response from OpenAI.' });
    }
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error.message);
    if (error.response) {
      res.status(error.response.status).json({ error: error.response.data || error.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred while processing your request.' });
    }
  }
});

router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Netlify function chat endpoint is healthy' });
});

// Mount the router. All routes defined in the router will be prefixed by how the function is invoked.
// If netlify.toml rewrites /api/* to /.netlify/functions/chat/*,
// then a request to /api/chat will hit router.post('/chat', ...)
// and /api/health will hit router.get('/health', ...)
app.use('/.netlify/functions/chat', router); 
// Or, if you want the paths in the router to be the absolute paths after the rewrite:
// app.use('/', router); // And then the rewrite in netlify.toml should be `to = "/.netlify/functions/chat/:splat"`
// Let's stick to the first approach for now, it's often clearer with serverless-http.
// Actually, serverless-http handles the base path. The router should define paths as they are intended to be called.
// The rewrite `from = "/api/*" to = "/.netlify/functions/chat/:splat" status = 200` means
// a call to `/api/chat` becomes a call to `/.netlify/functions/chat/chat` if the router has `/chat`.
// Let's simplify the router path and rely on the rewrite for the /api prefix.

// Simpler approach for router paths:
const simpleRouter = express.Router();
simpleRouter.post('/', limiter, async (req: Request, res: Response) => { // This will be /api/chat due to rewrite and function name
  if (!openai) {
    return res.status(500).json({ error: 'Server configuration error: OpenAI client not initialized.' });
  }

  const userChatMessages = req.body.messages; // Expects an array of message objects from client

  if (!userChatMessages || !Array.isArray(userChatMessages) || userChatMessages.length === 0) {
    return res.status(400).json({ error: 'Bad Request: No messages provided, or not in expected format.' });
  }

  // Extract the actual user question (content of the last message)
  const latestUserMessageContent = userChatMessages[userChatMessages.length - 1].content;

  // Prepare recent data (e.g., last 14 days)
  // Ensure allUserData is available; handle case where it might be empty if loading failed
  const recentData = allUserData.length > 0 ? allUserData.slice(-14) : []; 
  const formattedRecentData = recentData.map(day =>
    `Date: ${day.date}, HRV: ${day.hrv}, RHR: ${day.rhr}, Sleep: ${day.sleep_duration_hours.toFixed(1)}h (${day.sleep_efficiency_percent.toFixed(1)}% eff), Recovery: ${day.recovery_score_percent}%, Strain: ${day.strain_score.toFixed(1)}`
  ).join('\n');

  const messagesForAPI: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { 
      role: 'system', 
      content: systemPrompt 
    },
    {
      role: 'user',
      // Combine recent data with the latest user question
      content: `Here is my recent WHOOP data for the last ${recentData.length} days (if available):
${formattedRecentData || 'No recent data available.'}

My question is: ${latestUserMessageContent}`
    }
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Consider 'gpt-4' or other models if needed
      messages: messagesForAPI,
    });

    if (completion.choices && completion.choices.length > 0 && completion.choices[0].message) {
      res.json({ reply: completion.choices[0].message.content });
    } else {
      res.status(500).json({ error: 'Failed to get a valid response from OpenAI.' });
    }
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error.message, error.stack);
    if (error.response) {
      console.error('OpenAI API Error Response Status:', error.response.status);
      console.error('OpenAI API Error Response Data:', error.response.data);
      res.status(error.response.status).json({ error: error.response.data?.error?.message || error.response.data || error.message });
    } else {
      res.status(500).json({ error: 'An unexpected error occurred while processing your request to OpenAI.' });
    }
  }
});

simpleRouter.get('/health', (req: Request, res: Response) => { // This will be /api/health
  res.status(200).json({ status: 'Netlify function chat endpoint is healthy via simpleRouter' });
});

app.use('/', simpleRouter); // Mount the simple router at the base of the function's path

export const handler = serverless(app);
