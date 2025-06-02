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

// Interface for WHOOP daily metrics
interface WhoopMetric {
  date: string; // YYYY-MM-DD
  hrv_ms: number;
  recovery_score_percent: number;
  resting_heart_rate_bpm: number;
  sleep_performance_percent: number;
  sleep_duration_hours: number;
}

// Interface for Persona Profile
interface PersonaProfile {
  userName: string;
  goals: string[];
  baselines: Record<string, any>; // Simplified for brevity
  lifestyle_cues: string[];
}

// Function to load current day's metrics
function loadCurrentMetrics(): WhoopMetric | null {
  try {
    const dataPath = path.join(__dirname, 'data', 'synthetic_user_data.json');
    console.log(`[CHAT_FN] Attempting to load user data for current metrics from: ${dataPath}`);
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData = JSON.parse(rawData) as WhoopMetric[];
    // Sort by date descending to get the latest entry
    const sortedData = jsonData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    if (sortedData.length > 0) {
      console.log('[CHAT_FN] Current metrics loaded successfully.');
      return sortedData[0];
    }
    console.warn('[CHAT_FN] No user data found for current metrics.');
    return null;
  } catch (error) {
    console.error('[CHAT_FN] Error loading current metrics:', error);
    return null;
  }
}

// Function to load recent trends (last 14 days summary string)
function loadRecentTrends(): string {
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
    console.log('[CHAT_FN] Recent trends data formatted.');
    return formattedString;
  } catch (error) {
    console.error('[CHAT_FN] Error loading or formatting recent trends:', error);
    return 'No recent trends data available.'; // Fallback data string
  }
}

const router = express.Router();

// Function to load persona profile
function loadPersonaProfile(): PersonaProfile | null {
  try {
    const profilePath = path.join(__dirname, 'data', 'persona_profile.json');
    console.log(`[CHAT_FN] Attempting to load persona profile from: ${profilePath}`);
    const rawData = fs.readFileSync(profilePath, 'utf-8');
    const profileData = JSON.parse(rawData) as PersonaProfile;
    console.log('[CHAT_FN] Persona profile loaded successfully.');
    return profileData;
  } catch (error) {
    console.error('[CHAT_FN] Error loading persona profile:', error);
    return null;
  }
}

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
    const systemPromptContent = loadSystemPrompt();
    const currentMetrics = loadCurrentMetrics();
    const recentTrends = loadRecentTrends();
    const personaProfile = loadPersonaProfile();
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-CA', { // 'en-CA' locale often gives YYYY-MM-DD format
      timeZone: 'America/Los_Angeles',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const currentDate = formatter.format(now); // This will be YYYY-MM-DD for 'America/Los_Angeles' in 'en-CA' locale

    let contextForAI = `Today's Date: ${currentDate}\n\n`;

    contextForAI += "## Current Metrics (Today's Snapshot):\n";
    contextForAI += currentMetrics ? JSON.stringify(currentMetrics, null, 2) : "No current metrics available.\n";
    contextForAI += "\n\n## Recent Trends (Summary of last 14 days):\n";
    contextForAI += recentTrends;
    contextForAI += "\n\n## My Persona Profile (Goals, Baselines, Lifestyle):\n";
    contextForAI += personaProfile ? JSON.stringify(personaProfile, null, 2) : "No persona profile available.\n";

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPromptContent },
      { 
        role: 'user', 
        content: `Here is the information to help you personalize your response as my WHOOP Coach. Please use this data to inform your insights, referring to the sections (Current Metrics, Recent Trends, Persona Profile) as needed:\n\n${contextForAI}`
      },
      { role: 'user', content: userMessageText }, // The actual user question
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
