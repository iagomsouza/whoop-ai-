export interface ParsedWhoopCoachResponse {
  tldr: string | null;
  whyItMatters: string | null;
  nextBestAction: string | null;
  deeperDive: string | null;
  closingCta: string | null; // e.g., "Ready for more?"
  raw: string; // Always include the original raw response
}

/**
 * Parses the raw string response from the WHOOP Coach AI based on expected section headers.
 *
 * @param rawResponse The raw string response from the OpenAI API.
 * @returns A ParsedWhoopCoachResponse object.
 */
export function parseWhoopCoachResponse(rawResponse: string | null): ParsedWhoopCoachResponse {
  if (!rawResponse || rawResponse.trim() === '') {
    console.warn('AI response content is empty. Using fallback response.');
    return {
      tldr: "I'm sorry, I didn't receive a clear response from the AI. Could you please try asking again?",
      whyItMatters: '',
      nextBestAction: '',
      deeperDive: '',
      closingCta: "If the problem persists, there might be a temporary issue.",
      raw: '', // Raw content is empty
    };
  }

  const response: ParsedWhoopCoachResponse = {
    tldr: null,
    whyItMatters: null,
    nextBestAction: null,
    deeperDive: null,
    closingCta: null,
    raw: rawResponse || "",
  };

  if (!rawResponse) {
    console.warn("Raw response is null or empty, cannot parse.");
    return response;
  }

  // Normalize line endings and split into lines for easier processing
  const lines = rawResponse.replace(/\r\n/g, '\n').split('\n');
  let currentSection: keyof Omit<ParsedWhoopCoachResponse, 'raw' | 'closingCta'> | null = null;
  let contentBuffer: string[] = [];

  const sections: { [key: string]: keyof Omit<ParsedWhoopCoachResponse, 'raw' | 'closingCta'> } = {
    "**TL;DR:**": "tldr",
    "**Why it matters:**": "whyItMatters",
    "**Next best action:**": "nextBestAction",
    "**Optional deeper dive:**": "deeperDive",
  };

  for (const line of lines) {
    const trimmedLine = line.trim();
    let isHeader = false;

    for (const header in sections) {
      if (trimmedLine.startsWith(header)) {
        // Save previous section's content
        if (currentSection && contentBuffer.length > 0) {
          response[currentSection] = contentBuffer.join('\n').trim();
        }
        // Start new section
        currentSection = sections[header];
        contentBuffer = [trimmedLine.substring(header.length).trim()]; // Add content after header
        isHeader = true;
        break;
      }
    }

    if (!isHeader && currentSection) {
      if (trimmedLine.startsWith("*Ready for more?*") || trimmedLine.startsWith("Ready for more?")) {
         // Save current section before processing CTA
        if (currentSection && contentBuffer.length > 0) {
          response[currentSection] = contentBuffer.join('\n').trim();
        }
        response.closingCta = trimmedLine;
        currentSection = null; // Stop accumulating for main sections
        contentBuffer = [];
      } else if (trimmedLine) { // Only add non-empty lines to buffer
        contentBuffer.push(trimmedLine);
      }
    } else if (!isHeader && !currentSection && trimmedLine.startsWith("*Ready for more?*")) {
        // Case where CTA appears without a preceding recognized section (e.g. very short response)
        response.closingCta = trimmedLine;
    }
  }

  // Save content of the last section
  if (currentSection && contentBuffer.length > 0) {
    response[currentSection] = contentBuffer.join('\n').trim();
  }
  
  // Fallback if specific sections aren't found but there's content
  if (!response.tldr && !response.whyItMatters && !response.nextBestAction && !response.deeperDive && !response.closingCta && response.raw) {
      // If no sections were parsed, but there's raw content,
      // it might be a general message or an error message from the AI.
      // We could assign it to a default field or handle as needed.
      // For now, it's just in 'raw'.
      console.warn("Could not parse specific sections from the AI response. It will be available in 'raw'.");
  }

  return response;
}

/*
// Example Usage:
const sampleResponse = `
**TL;DR:** Your recovery is low today due to poor sleep.

**Why it matters:** Low recovery means your body isn't primed for high strain. Pushing too hard could hinder progress.

**Next best action:** Focus on a lighter activity day and prioritize an earlier bedtime tonight.

**Optional deeper dive:** Sleep consistency is key. Try to go to bed and wake up within a 30-minute window, even on weekends, to stabilize your circadian rhythm.

*Ready for more?*
`;

const parsed = parseWhoopCoachResponse(sampleResponse);
console.log(parsed);
*/
