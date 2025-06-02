export type UserMood = 'neutral' | 'positive' | 'negative' | 'curious' | 'confused' | 'frustrated' | null;

export interface ConversationState {
  currentTopic: string | null;
  userMood: UserMood;
  // We can add other relevant state variables here later,
  // e.g., lastQuestionAskedByAI, userGoal, etc.
}

// Initialize with a default state
let currentConversationState: ConversationState = {
  currentTopic: null,
  userMood: 'neutral',
};

/**
 * Retrieves the current conversation state.
 * @returns The current ConversationState object.
 */
export function getConversationState(): ConversationState {
  return { ...currentConversationState }; // Return a copy
}

/**
 * Updates parts of the conversation state.
 * @param newState - An object with properties to update in the ConversationState.
 */
export function updateConversationState(newState: Partial<ConversationState>): void {
  currentConversationState = { ...currentConversationState, ...newState };
}

/**
 * Resets the conversation state to its default values.
 */
export function resetConversationState(): void {
  currentConversationState = {
    currentTopic: null,
    userMood: 'neutral',
  };
}

// Example of how these might be used (conceptual):
//
// After user input:
// const mood = detectUserMood(userInput); // Hypothetical function
// updateConversationState({ userMood: mood });
//
// Before generating AI response:
// const state = getConversationState();
// if (state.userMood === 'frustrated') {
//   // Adjust AI tone or offer help
// }
