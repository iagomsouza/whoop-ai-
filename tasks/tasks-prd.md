## Relevant Files

- `data/synthetic_user_data.json` - To store the generated WHOOP-like data for Executive Alex.
- `src/lib/openai_client.ts` - For interacting with the OpenAI API.
- `src/components/ChatInterface.tsx` - Main React component for the chat UI.
- `src/app/page.tsx` - Main page for the Next.js application.
- `scripts/generate_synthetic_data.py` - Generates synthetic WHOOP data for Executive Alex persona.
- `prompts/system_prompt_whoop_coach.md` - System prompt for the OpenAI API to guide the AI wellness coach.
- `src/lib/openai_client.ts` - OpenAI API client setup and utility function for chat completions.
- `src/lib/message_preprocessor.ts` - User message preprocessing
- `src/lib/prompt_constructor.ts` - Dynamic system prompt construction
- `src/lib/response_processor.ts` - API response parsing and formatting
- `src/lib/conversation_manager.ts` - Chat history management
- `src/lib/conversation_state_manager.ts` - Conversation state management
- `src/lib/error_handler.ts` - Error handling and user-friendly messages
- `src/components/ChatInterface.tsx` - Main chat UI container component


### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [x] 1.0 Epic 1: Synthetic Data Generation
  - [x] 1.1 Define core metrics (HRV, RHR, Sleep, Recovery, Strain)
  - [x] 1.2 Set persona baselines for Executive Alex (e.g., typical HRV range, sleep patterns)
  - [x] 1.3 Establish realistic data ranges and correlations between metrics
  - [x] 1.4 Choose data generation method (e.g., Python script with libraries like pandas, numpy)
  - [x] 1.5 Generate correlated HRV and RHR data for 90 days
  - [x] 1.6 Generate correlated sleep data (duration, efficiency, stages) for 90 days
  - [x] 1.7 Add recovery scores based on strain/sleep relationship for 90 days
  - [x] 1.8 Include strain data reflecting a 4x/week workout pattern for 90 days
  - [x] 1.9 Incorporate work stress periods (e.g., lower HRV, shorter sleep) into synthetic data
  - [x] 1.10 Add travel days (e.g., disrupted sleep patterns) into synthetic data
  - [x] 1.11 Create seasonal variations and trends in the synthetic data
  - [x] 1.12 Build functions/utilities to query recent metrics from the generated data
  - [x] 1.13 Implement logic for baseline calculation based on historical data
  - [x] 1.14 Add data validation and cleaning steps for the synthetic data
  - [x] 1.15 Define JSON structure for the output data file
  - [x] 1.16 Write script to save generated data to `data/synthetic_user_data.json`
  - [x] 1.17 Ensure the JSON data is easily loadable by the application

- [x] 2.0 Epic 2: AI Core Logic
  - [x] 2.1 Draft initial system prompt for OpenAI API, incorporating WHOOP domain knowledge
  - [x] 2.2 Include Executive Alex persona details (baselines, goals) in the system prompt
  - [x] 2.3 Add behavior change coaching principles to the system prompt
  - [x] 2.4 Define strategy for injecting current user metrics into the prompt
  - [x] 2.5 Plan for integrating conversation history into prompt context
  - [x] 2.6 Design a templating mechanism for dynamic prompt construction
  - [x] 2.7 Test initial system prompt with sample queries and iterate for clarity and tone
  - [x] 2.8 Set up OpenAI API client configuration (e.g., in `src/lib/openai_client.ts`)
  - [x] 2.9 Configure API client with proper error handling mechanisms
  - [x] 2.10 Set appropriate model parameters (e.g., GPT-4, temperature, max tokens)
  - [x] 2.11 Implement retry logic for API calls to enhance reliability
  - [x] 2.12 Create user message preprocessing logic (e.g., cleaning, formatting)
  - [x] 2.13 Implement context injection into the system prompt before API call
  - [x] 2.14 Handle API response processing and formatting for display
  - [x] 2.15 Implement logic to maintain chat history for conversational context
  - [x] 2.16 Implement conversation state management (e.g., current topic, user mood)
  - [x] 2.17 Add functionality to reset conversation state
  - [x] 2.18 Implement graceful error handling for API failures (e.g., display user-friendly messages)
  - [x] 2.19 Provide informative error messages to the user during API issues
  - [x] 2.20 Implement basic fallback responses if AI cannot generate a meaningful answer

- [ ] 3.0 Epic 3: User Interface Development
  - [x] 3.1 Create main chat container component (`src/components/ChatInterface.tsx`)
  - [ ] 3.2 Build message display components for user and AI messages
  - [ ] 3.3 Implement auto-scrolling for chat history
  - [ ] 3.4 Add typing indicators and loading states during AI response generation
  - [ ] 3.5 Create message input field component with a send button
  - [ ] 3.6 Add quick action buttons for common queries (e.g., "Should I train today?")
  - [ ] 3.7 Implement keyboard shortcuts (e.g., Enter to send message)
  - [ ] 3.8 Ensure chat interface layout is optimized for mobile devices
  - [ ] 3.9 Ensure UI elements are touch-friendly on mobile
  - [ ] 3.10 Test responsive design on various screen sizes (phone, tablet, desktop)
  - [ ] 3.11 Apply WHOOP-inspired color scheme (black/green/white) and styling
  - [ ] 3.12 Use appropriate typography and spacing consistent with WHOOP branding
  - [ ] 3.13 Add subtle animations and transitions for a polished feel
  - [ ] 3.14 Create a user profile header component to display persona information
  - [ ] 3.15 Display Executive Alex's current key metrics (HRV, Recovery, Sleep) in the UI
  - [ ] 3.16 Add visual status indicators (e.g., color-coded icons) for key metrics
  - [ ] 3.17 Build a quick metrics dashboard section displaying today's key numbers
  - [ ] 3.18 Show trend indicators (e.g., ↑, ↓, →) for metrics compared to baseline/previous day
  - [ ] 3.19 Add contextual color coding (red/yellow/green) to metrics display
  - [ ] 3.20 Create conversation starter buttons/suggestions in the UI
  - [ ] 3.21 Implement functionality for quick queries via starter buttons
  - [ ] 3.22 Include contextual suggestions based on current metrics if possible

- [ ] 4.0 Epic 4: Testing & Deployment
  - [ ] 4.1 Test core conversation flows: workout readiness query
  - [ ] 4.2 Test core conversation flows: symptom analysis query
  - [ ] 4.3 Test core conversation flows: sleep optimization query
  - [ ] 4.4 Test follow-up questions and conversation continuity
  - [ ] 4.5 Validate AI response quality, relevance, and adherence to persona
  - [ ] 4.6 Test application on major desktop browsers (Chrome, Firefox, Safari)
  - [ ] 4.7 Verify mobile functionality on iOS (Safari) and Android (Chrome)
  - [ ] 4.8 Check responsive design breakpoints and UI consistency across devices
  - [ ] 4.9 Verify API response times are acceptable
  - [ ] 4.10 Test error handling scenarios (API errors, network issues)
  - [ ] 4.11 Check deployment stability and resource usage on Vercel
  - [ ] 4.12 Conduct final code review for quality, organization, and best practices
  - [ ] 4.13 Add inline documentation and comments where necessary
  - [ ] 4.14 Clean up unused imports, dead code, and console logs
  - [ ] 4.15 Push final changes to GitHub repository
  - [ ] 4.16 Verify automatic deployment to Vercel is successful
  - [ ] 4.17 Test all functionalities in the production environment
  - [ ] 4.18 Write project `README.md` with demo instructions and setup guide
  - [ ] 4.19 Document key features, technical decisions, and architecture
  - [ ] 4.20 Prepare talking points for a demo presentation of the project

