import OpenAI, { APIError } from 'openai';

// Ensure the API key is available as an environment variable
const apiKey = process.env.OPENAI_API_KEY;

// Initialize OpenAI client instance
const openai = new OpenAI({
  apiKey: apiKey,
});

// Log a warning if the API key is not set when the module is loaded.
if (!apiKey && process.env.NODE_ENV !== 'test') {
  console.warn(
    'OPENAI_API_KEY is not set. OpenAI API calls will not be possible. ' +
    'Ensure the key is configured in your environment variables.'
  );
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatCompletionParams {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// Helper function for sleep
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Sends a series of messages to the OpenAI Chat Completions API with retry logic.
 * @param params Object containing messages and optional model parameters.
 * @param maxRetries Maximum number of retry attempts.
 * @param initialDelayMs Initial delay in milliseconds for retries.
 * @returns The assistant's response message content as a string, or null if no content is returned.
 * @throws Error if the API key is not configured or if the API call itself fails after all retries.
 */
export async function getChatCompletion(
  {
    messages,
    model = "gpt-3.5-turbo",
    temperature = 0.7,
    max_tokens = 500,
  }: ChatCompletionParams,
  maxRetries: number = 3,
  initialDelayMs: number = 1000
): Promise<string | null> {
  if (!apiKey) {
    const errorMessage = "OpenAI API key is not configured. Cannot make API calls.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  let attempts = 0;
  let currentDelayMs = initialDelayMs;

  while (attempts <= maxRetries) {
    try {
      const completion = await openai.chat.completions.create({
        messages: messages,
        model: model,
        temperature: temperature,
        max_tokens: max_tokens,
      });

      const messageContent = completion.choices?.[0]?.message?.content;
      if (messageContent) {
        return messageContent; // Successful completion
      }
      
      // Successful API call but no content, not typically a case for retry unless specific.
      console.warn(`OpenAI API call succeeded (Attempt ${attempts + 1}) but returned no message content.`, completion);
      return null; 
    } catch (error) {
      attempts++;
      const isApiError = error instanceof APIError;

      console.error(
        `Error getting chat completion from OpenAI (Attempt ${attempts}/${maxRetries + 1}). Status: ${isApiError ? (error as APIError).status : 'N/A'}`,
        error
      );

      if (attempts > maxRetries) {
        console.error("Max retries reached. Giving up.");
        throw error; // Re-throw the last error
      }

      // Decide if retryable
      let isApiErrorRetryableByStatus = false;
      if (isApiError) {
        const status = (error as APIError).status;
        if (typeof status === 'number' && (status === 429 || (status >= 500 && status < 600))) {
          isApiErrorRetryableByStatus = true;
        }
      }
      
      if (isApiErrorRetryableByStatus || (!isApiError && attempts <= maxRetries)) { // Retry on specific API errors or generic errors if retries left
        const jitter = Math.random() * 500; // Add jitter up to 0.5s
        const delayWithJitter = currentDelayMs + jitter;
        
        console.log(`Retrying in ${delayWithJitter.toFixed(0)}ms...`);
        await sleep(delayWithJitter);
        currentDelayMs *= 2; // Exponential backoff
        // The loop will continue to the next attempt
      } else {
        // Don't retry on other client errors (4xx, except 429) or if not an APIError and deemed not retryable
        throw error;
      }
    }
  }
  // This part should ideally not be reached if maxRetries >= 0,
  // as the loop should either return, throw from within, or throw after exceeding attempts.
  // Adding a final throw to satisfy TypeScript's concerns about all paths returning.
  const finalErrorMessage = "Failed to get chat completion after multiple retries; loop exited unexpectedly.";
  console.error(finalErrorMessage);
  throw new Error(finalErrorMessage);
}
