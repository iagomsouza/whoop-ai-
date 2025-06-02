import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import OpenAI from 'openai';
import rateLimit from 'express-rate-limit';

// Load environment variables from .env file
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;
let openai: OpenAI | null = null;

if (apiKey) {
  openai = new OpenAI({
    apiKey: apiKey,
  });
  console.log('OpenAI client initialized successfully.');
} else {
  console.error('OpenAI API key is missing. OpenAI client NOT initialized. Make sure OPENAI_API_KEY is set in the .env file.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Rate Limiting Configuration
const chatApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is healthy' });
});

// Chat API endpoint - apply rate limiting
app.post('/api/chat', chatApiLimiter, async (req: Request, res: Response) => {
  const userMessage = req.body.message;

  if (!openai) {
    console.error('OpenAI client is not initialized. API key might be missing or an error occurred during startup.');
    return res.status(500).json({ error: 'Server configuration error: OpenAI client not initialized.' });
  }

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required in the request body.' });
  }

  try {
    console.log(`Sending message to OpenAI: "${userMessage}"`);
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Or your preferred model
      messages: [{ role: 'user', content: userMessage }],
      // You can add other parameters like temperature, max_tokens, etc.
    });

    const assistantResponse = completion.choices[0]?.message?.content;

    if (assistantResponse) {
      console.log(`Received response from OpenAI: "${assistantResponse}"`);
      res.status(200).json({ reply: assistantResponse });
    } else {
      console.error('OpenAI response did not contain expected content.');
      res.status(500).json({ error: 'Failed to get a valid response from OpenAI.' });
    }
  } catch (error: any) {
    console.error('Error calling OpenAI API:', error.message);
    if (error.response) {
      console.error('OpenAI API Error Response Data:', error.response.data);
      console.error('OpenAI API Error Response Status:', error.response.status);
    }
    res.status(500).json({ error: 'Failed to communicate with OpenAI API.', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default app; // Export for potential testing or programmatic use
