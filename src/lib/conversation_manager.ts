import { ChatMessage } from './openai_client';

// Maximum number of messages to keep in history.
// This is a simple way to limit context size. More sophisticated methods might consider token count.
const MAX_HISTORY_LENGTH = 20; // e.g., 10 pairs of user/assistant messages

let conversationHistory: ChatMessage[] = [];

/**
 * Initializes or resets the conversation history.
 * Optionally, a system prompt can be the first message.
 * @param systemPromptMessage - An optional initial system message.
 */
export function initializeConversation(systemPromptMessage?: ChatMessage): void {
  conversationHistory = systemPromptMessage ? [systemPromptMessage] : [];
}

/**
 * Adds a message to the conversation history.
 * Manages history length to avoid excessive context.
 * @param message - The ChatMessage to add.
 */
export function addMessageToHistory(message: ChatMessage): void {
  conversationHistory.push(message);

  // Trim history if it exceeds max length
  // We keep the system prompt (if any, at index 0) and the most recent messages.
  if (conversationHistory.length > MAX_HISTORY_LENGTH) {
    const systemPrompt = conversationHistory[0]?.role === 'system' ? [conversationHistory[0]] : [];
    const recentMessages = conversationHistory.slice(-(MAX_HISTORY_LENGTH - systemPrompt.length));
    conversationHistory = [...systemPrompt, ...recentMessages];
  }
}

/**
 * Retrieves the current conversation history.
 * @returns An array of ChatMessage objects.
 */
export function getConversationHistory(): ChatMessage[] {
  return [...conversationHistory]; // Return a copy to prevent direct modification
}

/**
 * Clears all messages from the conversation history.
 * Consider if initializeConversation should be used instead for consistency.
 */
export function clearConversationHistory(): void {
  conversationHistory = [];
}

/**
 * Gets the last N messages, ensuring the system prompt is included if present.
 * Useful for preparing context for the API call.
 * @param count - The number of recent messages to retrieve, plus system prompt.
 */
export function getRecentMessagesWithSystemPrompt(count: number = 10): ChatMessage[] {
    const history = getConversationHistory();
    if (history.length <= count) {
        return history;
    }
    const systemPrompt = history[0]?.role === 'system' ? [history[0]] : [];
    const recentMessages = history.slice(-(count - systemPrompt.length));
    return [...systemPrompt, ...recentMessages];
}
