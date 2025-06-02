// ULTRA-SIMPLIFIED chat.ts for Netlify logging debug

console.log('[CHAT_TS_LOG_001] Script execution started.');

import express, { Request, Response } from 'express';
import serverlessHttp from 'serverless-http';
import cors from 'cors';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

console.log('[CHAT_FN] Netlify Function chat.ts starting...');

const app = express();

// Setup OpenAI Client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// CORS and JSON middleware
app.use(cors());
app.use(express.json());

// Function to load system prompt
function loadSystemPrompt(): string {
  try {
    const promptPath = path.join(__dirname, 'prompts', 'system_prompt_whoop_coach.md');
    console.log(`[CHAT_FN] Attempting to load system prompt from: ${promptPath}`);
    const prompt = fs.readFileSync(promptPath, 'utf-8');
    console.log('[CHAT_FN] System prompt loaded successfully.');
    return prompt;
  } catch (error) {
    console.error('[CHAT_FN] Error loading system prompt:', error);
    return 'You are a helpful AI assistant.'; // Fallback prompt
  }
}

// Function to load and format user data (last 14 days)
interface WhoopMetric {
  date: string; // YYYY-MM-DD
  hrv_ms: number;
  recovery_score_percent: number;
  resting_heart_rate_bpm: number;
  sleep_performance_percent: number;
  sleep_duration_hours: number;
}

function loadAndFormatUserData(): string {
  try {
    const dataPath = path.join(__dirname, 'data', 'synthetic_user_data.json');
    console.log(`[CHAT_FN] Attempting to load user data from: ${dataPath}`);
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData = JSON.parse(rawData) as WhoopMetric[];
    console.log('[CHAT_FN] User data loaded and parsed successfully.');

    // Sort by date descending to easily get the last 14 entries
    const sortedData = jsonData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const recentData = sortedData.slice(0, 14);

    let formattedString = 'Last 14 days of WHOOP data:\n';
    recentData.forEach(day => {
      formattedString += `Date: ${day.date}, HRV: ${day.hrv_ms}ms, Recovery: ${day.recovery_score_percent}%, RHR: ${day.resting_heart_rate_bpm}bpm, Sleep Perf: ${day.sleep_performance_percent}%, Sleep Dur: ${day.sleep_duration_hours}h\n`;
    });
    console.log('[CHAT_FN] User data formatted.');
    return formattedString;
  } catch (error) {
    console.error('[CHAT_FN] Error loading or formatting user data:', error);
    return 'No user data available.'; // Fallback data string
  }
}

const router = express.Router();

router.post('/api/chat', async (req: Request, res: Response) => {
  console.log('[CHAT_FN] POST /api/chat received.');
  const userMessageText = req.body.message;

  if (!userMessageText) {
    console.log('[CHAT_FN] No message provided by user.');
    return res.status(400).json({ error: 'No message provided' });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error('[CHAT_FN] OpenAI API key not configured.');
    return res.status(500).json({ error: 'OpenAI API key not configured on server.' });
  }

  try {
    const systemPrompt = loadSystemPrompt();
    const formattedUserData = loadAndFormatUserData();

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context: Here is my recent WHOOP data to help you personalize your response:\n${formattedUserData}` },
      { role: 'user', content: userMessageText },
    ];

    console.log('[CHAT_FN] Sending request to OpenAI...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messages,
    });

    const aiText = completion.choices[0]?.message?.content;
    if (!aiText) {
      console.error('[CHAT_FN] No text in OpenAI completion choice.');
      throw new Error('No text in OpenAI completion choice.');
    }
    console.log('[CHAT_FN] Successfully received response from OpenAI.');
    res.json({ reply: aiText });
    console.log('[CHAT_FN] Sent AI reply to client.');

  } catch (error: any) {
    console.error('[CHAT_FN] Error processing OpenAI request:', error.message);
    if (error.response) {
      console.error('[CHAT_FN] OpenAI API Error Response Data:', error.response.data);
      console.error('[CHAT_FN] OpenAI API Error Response Status:', error.response.status);
    }
    res.status(500).json({ error: 'Failed to get response from AI', details: error.message });
  }
});

router.get('/api/health', (req: Request, res: Response) => {
  console.log('[CHAT_FN] GET /api/health received.');
  res.status(200).json({ 
    status: 'OK',
    message: 'WHOOP AI Coach API is healthy.',
    timestamp: new Date().toISOString(),
    openAIKeyConfigured: !!process.env.OPENAI_API_KEY 
  });
  console.log('[CHAT_FN] Responded to GET /api/health.');
});

app.use('/', router); // Mount the router at the root to handle /api/chat and /api/health

export const handler = serverlessHttp(app);
console.log('[CHAT_FN] Netlify Function chat.ts initialized and handler exported.');
