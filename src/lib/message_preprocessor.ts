import { ChatMessage } from './openai_client'; // Assuming ChatMessage is exported from openai_client

/**
 * Preprocesses a raw user input string for use with the OpenAI API.
 * - Trims leading and trailing whitespace.
 * - Formats the input into a ChatMessage object with role "user".
 *
 * @param userInput The raw string input from the user.
 * @returns A ChatMessage object ready to be sent to the API, or null if input is empty after trimming.
 */
export function preprocessUserMessage(userInput: string): ChatMessage | null {
  const trimmedInput = userInput.trim();

  if (!trimmedInput) {
    console.warn("User input was empty after trimming.");
    return null; // Or handle as an error, depending on desired behavior
  }

  return {
    role: "user",
    content: trimmedInput,
  };
}

/**
 * Example of how to extend preprocessing, e.g., with length checks or sanitization.
 * This is not currently used but serves as a placeholder for future enhancements.
 */
/*
export function preprocessUserMessageAdvanced(
  userInput: string,
  maxLength: number = 2000 // Example max length
): ChatMessage | null {
  const trimmedInput = userInput.trim();

  if (!trimmedInput) {
    console.warn("User input was empty after trimming.");
    return null;
  }

  if (trimmedInput.length > maxLength) {
    console.warn(`User input exceeds maximum length of ${maxLength} characters. Truncating.`);
    // Basic truncation, could be more sophisticated (e.g., word boundary)
    const truncatedInput = trimmedInput.substring(0, maxLength); 
    return {
      role: "user",
      content: truncatedInput,
    };
  }

  // Add any sanitization logic here if needed
  // const sanitizedInput = DOMPurify.sanitize(trimmedInput); // Example if running in browser context

  return {
    role: "user",
    content: trimmedInput, // or sanitizedInput
  };
}
*/
