import OpenAI, { APIError } from 'openai';

export enum WhoopCoachErrorType {
  API_KEY_MISSING = 'API_KEY_MISSING',
  API_CONNECTION_FAILED = 'API_CONNECTION_FAILED',
  API_RATE_LIMIT = 'API_RATE_LIMIT',
  API_AUTHENTICATION_ERROR = 'API_AUTHENTICATION_ERROR',
  API_SERVER_ERROR = 'API_SERVER_ERROR',
  API_BAD_REQUEST = 'API_BAD_REQUEST',
  PROMPT_LOAD_ERROR = 'PROMPT_LOAD_ERROR',
  USER_DATA_LOAD_ERROR = 'USER_DATA_LOAD_ERROR',
  CONTEXT_GENERATION_ERROR = 'CONTEXT_GENERATION_ERROR',
  RESPONSE_PARSING_ERROR = 'RESPONSE_PARSING_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface UserFriendlyError {
  type: WhoopCoachErrorType;
  message: string; 
  details?: string; 
}

function categorizeError(error: any): WhoopCoachErrorType {
  if (error instanceof APIError) {
    if (error.status === 401 || error.status === 403) return WhoopCoachErrorType.API_AUTHENTICATION_ERROR;
    if (error.status === 429) return WhoopCoachErrorType.API_RATE_LIMIT;
    if (error.status === 400) return WhoopCoachErrorType.API_BAD_REQUEST;
    if (error.status >= 500 && error.status < 600) return WhoopCoachErrorType.API_SERVER_ERROR;
  }
  if (typeof error?.message === 'string') {
    if (error.message.includes('OpenAI API key is not configured')) return WhoopCoachErrorType.API_KEY_MISSING;
    if (error.message.includes('Failed to load base system prompt')) return WhoopCoachErrorType.PROMPT_LOAD_ERROR;
    if (error.message.includes('Failed to load or parse user data')) return WhoopCoachErrorType.USER_DATA_LOAD_ERROR;
    if (error.message.includes('User data is missing persona or daily_metrics')) return WhoopCoachErrorType.USER_DATA_LOAD_ERROR;
    if (error.message.includes('context message')) return WhoopCoachErrorType.CONTEXT_GENERATION_ERROR;
    if (error.message.toLowerCase().includes('fetch') || error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('failed to get chat completion')) return WhoopCoachErrorType.API_CONNECTION_FAILED;
  }
  return WhoopCoachErrorType.UNKNOWN_ERROR;
}

export function handleGenericError(error: any): UserFriendlyError {
  const errorType = categorizeError(error);
  let userMessage = "I'm having a little trouble connecting right now. Please try again in a moment.";
  const details = error instanceof Error ? error.message : String(error);

  switch (errorType) {
    case WhoopCoachErrorType.API_KEY_MISSING:
      userMessage = "There's an issue with the application configuration. Please contact support.";
      break;
    case WhoopCoachErrorType.API_AUTHENTICATION_ERROR:
      userMessage = "Could not authenticate with the AI service. Please check configuration or contact support.";
      break;
    case WhoopCoachErrorType.API_RATE_LIMIT:
      userMessage = "I'm experiencing high demand. Please try again in a few minutes.";
      break;
    case WhoopCoachErrorType.API_SERVER_ERROR:
      userMessage = "The AI service is temporarily unavailable. Please try again later.";
      break;
    case WhoopCoachErrorType.API_BAD_REQUEST:
      userMessage = "There was an issue with the request to the AI service. If this persists, contact support.";
      break;
    case WhoopCoachErrorType.PROMPT_LOAD_ERROR:
    case WhoopCoachErrorType.USER_DATA_LOAD_ERROR:
    case WhoopCoachErrorType.CONTEXT_GENERATION_ERROR:
      userMessage = "I'm having trouble accessing necessary information. Please try again or contact support.";
      break;
    case WhoopCoachErrorType.RESPONSE_PARSING_ERROR:
        userMessage = "I received a response, but I'm having trouble understanding it. Could you try rephrasing?";
        break;
    case WhoopCoachErrorType.UNKNOWN_ERROR:
      userMessage = "An unexpected issue occurred. Please try again. If it continues, contact support.";
      break;
  }

  console.error(`[WhoopCoach Error] Type: ${errorType}, Details: ${details}`, error);

  return {
    type: errorType,
    message: userMessage,
    details: details, 
  };
}
