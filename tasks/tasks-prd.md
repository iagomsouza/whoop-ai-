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
- `src/components/UserMessage.tsx` - Component to display user messages in the chat.
- `src/components/AIMessage.tsx` - Component to display AI/system messages in the chat.
- `src/components/MessageInput.tsx` - Component for message input field and send button.
- `src/components/QuickActionButtons.tsx` - Component for displaying quick action query buttons.

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

- [x] 3.0 Epic 3: User Interface Development
  - [x] 3.1 Create main chat container component (`src/components/ChatInterface.tsx`)
  - [x] 3.2 Build message display components for user and AI messages
  - [x] 3.3 Implement auto-scrolling for chat history
  - [x] 3.4 Add typing indicators and loading states during AI response generation
  - [x] 3.5 Create message input field component with a send button
  - [x] 3.6 Add quick action buttons for common queries (e.g., "Should I train today?")
  - [x] 3.7 Implement keyboard shortcuts (e.g., Enter to send message)
  - [x] 3.8 Ensure chat interface layout is optimized for mobile devices
  - [x] 3.9 Ensure UI elements are touch-friendly on mobile
  - [x] 3.10 Test responsive design on various screen sizes (phone, tablet, desktop)
  - [x] 3.11 Apply WHOOP-inspired color scheme (black/green/white) and styling
  - [x] 3.12 Use appropriate typography and spacing consistent with WHOOP branding
  - [x] 3.13 Add subtle animations and transitions for a polished feel
  - [x] 3.14 Create a user profile header component to display persona information
  - [x] 3.15 Display Executive Alex's current key metrics (HRV, Recovery, Sleep) in the UI
  - [x] 3.16 Add visual status indicators (e.g., color-coded icons) for key metrics
  - [x] 3.17 Build a quick metrics dashboard section displaying today's key numbers
  - [x] 3.18 Show trend indicators (e.g., ↑, ↓, →) for metrics compared to baseline/previous day
  - [x] 3.19 Add contextual color coding (red/yellow/green) to metrics display
  - [x] 3.20 Create conversation starter buttons/suggestions in the UI
  - [x] 3.21 Implement functionality for quick queries via starter buttons
  - [x] 3.22 Include contextual suggestions based on current metrics if possible

## Epic 4: Secure OpenAI API Proxy Implementation

### Relevant Files

- `server/index.ts` (or `server/server.js`) - Main file for the Node.js/Express backend proxy server.
- `server/routes/chatApi.ts` (or `server/routes/chatApi.js`) - Route handler for the `/api/chat` endpoint.
- `package.json` (root level) - To add backend dependencies (e.g., express, openai, express-rate-limit, dotenv).
- `src/components/ChatInterface.tsx` - To modify frontend API calls to point to the new proxy.
- `.env` (root level) - To store the `OPENAI_API_KEY` for the backend server (distinct from any VITE_ prefixed keys).
- `Procfile` or `vercel.json` (or similar) - For deployment configuration, if applicable.

### Notes

- The backend server should be a simple Node.js/Express application.
- The `OPENAI_API_KEY` for the backend must be stored securely as an environment variable on the server, not committed to Git.
- The frontend will no longer need direct access to any OpenAI API key.

### Tasks

- [x] 4.0 Setup Backend Proxy Server Environment
  - [x] 4.0.1 Create a `server` directory in the project root.
  - [x] 4.0.2 Initialize a new `package.json` within the `server` directory or add backend dependencies to the root `package.json`.
  - [x] 4.0.3 Install necessary backend dependencies: `express`, `openai` (for Node.js usage), `dotenv`, `cors`, `express-rate-limit`.
  - [x] 4.0.4 Create a basic Express server setup in `server/index.ts` (or `server.js`).
  - [x] 4.0.5 Configure the server to listen on a specific port (e.g., 3001 or as per deployment platform requirements).
  - [x] 4.0.6 Add a simple health check endpoint (e.g., `/health`) to verify the server is running.
  - [x] 4.0.7 Configure `cors` middleware to allow requests from your frontend's origin. (Currently permissive, allowing all origins for local development)

- [x] 4.1 Implement Core Proxy Logic
  - [x] 4.1.1 Create an API route for `/api/chat` (e.g., using Express Router).
  - [x] 4.1.2 The `/api/chat` endpoint should accept POST requests with a JSON body containing the user's message.
  - [x] 4.1.3 In the route handler, securely access the `OPENAI_API_KEY` from server-side environment variables (using `dotenv` for local development).
  - [x] 4.1.4 Initialize the OpenAI Node.js client within the route handler (or as a module-level instance if appropriate) using the server-side API key.
  - [x] 4.1.5 Construct the payload for the OpenAI Chat Completions API (messages array, model, etc.) based on the incoming request from the frontend.
  - [x] 4.1.6 Make the API call to OpenAI using the `openai.chat.completions.create()` method.
  - [x] 4.1.7 Handle the response from OpenAI: extract the assistant's message content.
  - [x] 4.1.8 Send the assistant's message back to the frontend as a JSON response.
  - [x] 4.1.9 Implement basic error handling for OpenAI API calls (e.g., log errors, return appropriate HTTP status codes).

- [x] 4.2 Integrate Basic Security Measures
  - [x] 4.2.1 Ensure `OPENAI_API_KEY` is loaded via `dotenv` for local development and is configured as a proper environment variable for deployment.
  - [x] 4.2.2 Add `.env` file (containing `OPENAI_API_KEY`) to the root `.gitignore` file if not already present (to prevent committing the key). (Verified as complete)
  - [x] 4.2.3 Implement IP-based rate limiting on the `/api/chat` endpoint using `express-rate-limit`.
  - [x] 4.2.4 Configure a sensible rate limit (e.g., 100 requests per 15 minutes per IP) suitable for demo purposes.
  - [x] 4.2.5 Ensure rate limit exceeded responses are user-friendly or handled gracefully by the frontend. (Server returns JSON error)

- [x] 4.3 Refactor Frontend Application
  - [x] 4.3.1 Modify `src/components/ChatInterface.tsx`'s `handleSendMessage` (or `fetchOpenAIResponse` if abstracted).
  - [x] 4.3.2 Change the API call target from the direct OpenAI API to the new backend proxy endpoint (e.g., `fetch('/api/chat', ...)`).
  - [x] 4.3.3 Ensure the frontend sends the user's message in the expected JSON format to the proxy.
  - [x] 4.3.4 Ensure the frontend correctly processes the JSON response from the proxy.
  - [x] 4.3.5 Remove any direct usage of `VITE_OPENAI_API_KEY` for OpenAI calls from client-side code.
  - [x] 4.3.6 Remove the `dangerouslyAllowBrowser: true` option and potentially the direct `openai` client instantiation from `src/lib/openai_client.ts` if it's no longer used for client-side calls. (The file might still be used for type definitions).
  - [x] 4.3.7 Test error handling for proxy API failures on the frontend (e.g., display user-friendly messages).

- [ ] 4.4 Basic Deployment and Testing
  - [x] 4.4.1 Ensure both frontend and backend have necessary start scripts in package.json (e.g., `npm run dev` for frontend, `npm run server:dev` for backend). (Verified)
  - [x] 4.4.2 Perform end-to-end testing: Start both frontend and backend servers. Send messages through the UI and verify responses are proxied correctly. (User to verify)
  - [x] 4.4.3 Document how to run the application locally (both frontend and backend) in the README.
  - [x] 4.4.4 Configure build scripts for the backend (e.g., `npm run server:build`) and frontend (e.g., `npm run build`).
  - [x] 4.4.5 Ensure the `OPENAI_API_KEY` environment variable is correctly set in the chosen deployment environment for the backend. (Noted for deployment)
  - [ ] 4.4.6 Deploy the frontend (e.g., static site from `dist` folder) and backend (e.g., Node.js server from `dist-server` folder).
  - [ ] 4.4.7 Conduct end-to-end testing on the deployed application.
  - [x] 4.4.8 Test rate limiting by sending multiple requests quickly (on deployed or local setup).
  - [x] 4.4.9 Verify error handling for both API errors and rate limit errors (on deployed or local setup).
  - [ ] 4.4.10 Ensure the application is shareable via a public URL (after deployment).

- [ ] 5.0 Epic 5: Testing & Deployment
  - [ ] 5.1 Test core conversation flows: workout readiness query
  - [ ] 5.2 Test core conversation flows: symptom analysis query
  - [ ] 5.3 Test core conversation flows: sleep optimization query
  - [ ] 5.4 Test follow-up questions and conversation continuity
  - [ ] 5.5 Validate AI response quality, relevance, and adherence to persona
  - [ ] 5.6 Test application on major desktop browsers (Chrome, Firefox, Safari)
  - [ ] 5.7 Verify mobile functionality on iOS (Safari) and Android (Chrome)
  - [ ] 5.8 Check responsive design breakpoints and UI consistency across devices
  - [ ] 5.9 Verify API response times are acceptable
  - [ ] 5.10 Test error handling scenarios (API errors, network issues)
  - [ ] 5.11 Check deployment stability and resource usage on Vercel
  - [ ] 5.12 Conduct final code review for quality, organization, and best practices
  - [ ] 5.13 Add inline documentation and comments where necessary
  - [ ] 5.14 Clean up unused imports, dead code, and console logs
  - [ ] 5.15 Push final changes to GitHub repository
  - [ ] 5.16 Verify automatic deployment to Vercel is successful
  - [ ] 5.17 Test all functionalities in the production environment
  - [ ] 5.18 Write project `README.md` with demo instructions and setup guide
  - [ ] 5.19 Document key features, technical decisions, and architecture
  - [ ] 5.20 Prepare talking points for a demo presentation of the project


