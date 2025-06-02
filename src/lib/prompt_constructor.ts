import * as fs from 'fs/promises';
import * as path from 'path';
import { ChatMessage } from './openai_client'; // Assuming ChatMessage is exported

// Define a simplified structure for what we expect from synthetic_user_data.json
interface WhoopPersona {
  name: string;
  age: number;
  gender: string;
  goals: string[];
  typical_day_stressors: string[];
  exercise_preferences: string[];
  dietary_habits: string;
  sleep_challenges: string[];
  whoop_usage_level: string;
}

interface WhoopDailyMetric {
  date: string;
  hrv_ms: number;
  rhr_bpm: number;
  recovery_score_percent: number;
  sleep_performance_percent: number;
  sleep_hours_total: number;
  sleep_hours_rem: number;
  sleep_hours_deep: number;
  sleep_hours_light: number;
  sleep_consistency_percent: number;
  strain_level: number;
  avg_heart_rate_bpm: number;
  max_heart_rate_bpm: number;
  calories_burned: number;
}

interface WhoopUserData {
  persona: WhoopPersona;
  daily_metrics: WhoopDailyMetric[];
}

// Resolve paths relative to the project root.
// Assuming this file (when compiled) will be in a 'dist/lib' like structure,
// and 'prompts' and 'data' are at the project root.
const PROJECT_ROOT = path.join(__dirname, '../../'); // Assuming compiled output in dist/lib or dist/src/lib, project root is two levels up
const BASE_SYSTEM_PROMPT_PATH = path.join(PROJECT_ROOT, 'prompts/system_prompt_whoop_coach.md');
const USER_DATA_PATH = path.join(PROJECT_ROOT, 'data/synthetic_user_data.json');


/**
 * Loads the base system prompt content from the markdown file.
 */
async function loadBaseSystemPrompt(): Promise<string> {
  try {
    return await fs.readFile(BASE_SYSTEM_PROMPT_PATH, 'utf-8');
  } catch (error) {
    console.error(`Error loading base system prompt from ${BASE_SYSTEM_PROMPT_PATH}:`, error);
    throw new Error('Failed to load base system prompt.');
  }
}

/**
 * Loads the synthetic user data from the JSON file.
 */
async function loadWhoopUserData(): Promise<WhoopUserData> {
  try {
    const userDataContent = await fs.readFile(USER_DATA_PATH, 'utf-8');
    const userData: WhoopUserData = JSON.parse(userDataContent);
    if (!userData.persona || !userData.daily_metrics || userData.daily_metrics.length === 0) {
        throw new Error('User data is missing persona or daily_metrics, or daily_metrics is empty.');
    }
    // Ensure metrics are sorted by date, latest first for easier processing
    userData.daily_metrics.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return userData;
  } catch (error) {
    console.error(`Error loading user data from ${USER_DATA_PATH}:`, error);
    throw new Error('Failed to load or parse user data.');
  }
}

function formatPersonaProfile(persona: WhoopPersona): string {
  return `Name: ${persona.name}
Age: ${persona.age}
Gender: ${persona.gender}
Goals: ${persona.goals.join(', ')}
Typical Day Stressors: ${persona.typical_day_stressors.join(', ')}
Exercise Preferences: ${persona.exercise_preferences.join(', ')}
Dietary Habits: ${persona.dietary_habits}
Sleep Challenges: ${persona.sleep_challenges.join(', ')}
WHOOP Usage Level: ${persona.whoop_usage_level}`;
}

function formatCurrentMetrics(metrics: WhoopDailyMetric): string {
  return `Date: ${metrics.date}
HRV: ${metrics.hrv_ms} ms
RHR: ${metrics.rhr_bpm} bpm
Recovery: ${metrics.recovery_score_percent}%
Sleep Performance: ${metrics.sleep_performance_percent}%
Total Sleep: ${metrics.sleep_hours_total.toFixed(1)} hrs (REM: ${metrics.sleep_hours_rem.toFixed(1)}h, Deep: ${metrics.sleep_hours_deep.toFixed(1)}h, Light: ${metrics.sleep_hours_light.toFixed(1)}h)
Sleep Consistency: ${metrics.sleep_consistency_percent}%
Strain: ${metrics.strain_level.toFixed(1)}
Avg HR during sleep: ${metrics.avg_heart_rate_bpm} bpm (Note: This might be overall avg_hr, clarify if specific to sleep)
Max HR: ${metrics.max_heart_rate_bpm} bpm
Calories Burned: ${metrics.calories_burned}`;
}

function formatRecentTrends(dailyMetrics: WhoopDailyMetric[], numDays: number = 3): string {
  if (dailyMetrics.length === 0) return "No recent data available.";
  
  // dailyMetrics is already sorted latest first. Take top N for recent.
  const recentMetricsForTrend = dailyMetrics.slice(0, numDays).reverse(); // reverse to show oldest of the N first
  
  let trendsString = `Last ${recentMetricsForTrend.length} days (Oldest to Newest - Recovery %, Sleep Perf. %, Strain):
`;
  recentMetricsForTrend.forEach(m => {
    trendsString += `- ${m.date}: Rec ${m.recovery_score_percent}%, Sleep ${m.sleep_performance_percent}%, Strain ${m.strain_level.toFixed(1)}\n`;
  });
  return trendsString.trim();
}

/**
 * Constructs the dynamic system prompt by injecting user data into the base prompt.
 */
function constructFinalPrompt(basePrompt: string, userData: WhoopUserData): string {
  const personaProfile = formatPersonaProfile(userData.persona);
  const currentMetrics = userData.daily_metrics.length > 0 
    ? formatCurrentMetrics(userData.daily_metrics[0]) // Latest is at index 0
    : "No current metrics available.";
  const recentTrends = formatRecentTrends(userData.daily_metrics, 3);

  let finalPrompt = basePrompt;
  finalPrompt = finalPrompt.replace(/{{persona_profile}}/g, personaProfile);
  finalPrompt = finalPrompt.replace(/{{current_metrics}}/g, currentMetrics);
  finalPrompt = finalPrompt.replace(/{{recent_trends}}/g, recentTrends);
  
  return finalPrompt;
}

/**
 * Main function to generate the complete system ChatMessage for the OpenAI API.
 */
export async function getSystemContextMessage(): Promise<ChatMessage> {
  try {
    const basePrompt = await loadBaseSystemPrompt();
    const userData = await loadWhoopUserData();
    
    const finalSystemPromptText = constructFinalPrompt(basePrompt, userData);
    
    return {
      role: "system",
      content: finalSystemPromptText,
    };
  } catch (error) {
    console.error("Error generating system context message:", error);
    // Fallback to base prompt if context generation fails, or rethrow
    // For now, let's try to return a base prompt with a warning in content
    // to ensure the app can still attempt a call, albeit with less context.
    // A more robust solution might involve specific error types.
    try {
        const basePrompt = await loadBaseSystemPrompt();
        return {
            role: "system",
            content: basePrompt + "\n\n[Warning: Could not load dynamic user context. Providing base guidance only.]"
        };
    } catch (basePromptError) {
         throw new Error('Failed to generate system context message and also failed to load base prompt as fallback.');
    }
  }
}
