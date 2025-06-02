## Product Requirements Document: Secure OpenAI API Proxy

**Version:** 1.0
**Date:** 2025-06-01

### 1. Introduction/Overview

This document outlines the requirements for implementing a backend proxy server to securely manage OpenAI API calls for the WHOOP AI Coach demo application. Currently, the application attempts to make OpenAI API calls directly from the client-side, which risks exposing the OpenAI API key. This is a significant security concern, especially as the demo application will be shared with friends for testing. The primary goal is to protect this sensitive API key by ensuring it never leaves a secure server environment.

### 2. Goals

*   **G1:** Prevent the OpenAI API key from being exposed in client-side (browser) code.
*   **G2:** Enable secure and functional communication between the WHOOP AI Coach frontend and the OpenAI Chat Completions API via a backend proxy.
*   **G3:** Implement a basic level of abuse mitigation for the proxy endpoint (e.g., rate limiting).
*   **G4:** Keep the solution simple, suitable for a demo application, and easy to deploy for sharing.

### 3. User Stories

*   **US1:** As a developer, I want to ensure my OpenAI API key is not exposed in the client-side code so that I can prevent unauthorized use and associated costs.
*   **US2:** As a demo user, I want to be able to interact with the AI chat feature seamlessly, without noticing the backend proxy, so that I can test the application's core functionality.
*   **US3:** As the demo owner, I want to share the application with friends for testing without worrying about my API key being compromised.
*   **US4:** As the demo owner, I want a simple way to protect the proxy endpoint from abuse to prevent excessive OpenAI credit consumption if the demo link is shared widely.

### 4. Functional Requirements

*   **FR1:** The system must provide a backend API endpoint (e.g., `/api/chat`) that accepts chat message payloads from the frontend application.
*   **FR2:** The backend proxy must securely store and access the OpenAI API key. The key shall be read from server-side environment variables (e.g., `OPENAI_API_KEY`).
*   **FR3:** Upon receiving a request from the frontend, the backend proxy must forward the user's message to the OpenAI Chat Completions API (e.g., `gpt-3.5-turbo` or a similar model), including any necessary system prompts.
*   **FR4:** The backend proxy must receive the response from the OpenAI API and forward it back to the frontend application in a structured format (e.g., JSON).
*   **FR5:** The frontend React application (`ChatInterface.tsx`) must be refactored to send chat requests to this new backend proxy endpoint instead of attempting direct client-side OpenAI API calls.
*   **FR6:** The backend proxy must implement basic IP-based rate limiting on the `/api/chat` endpoint to mitigate potential abuse (e.g., a reasonable number of requests per minute per IP).
*   **FR7:** The backend proxy must log critical errors encountered during its operation, such as failures in communicating with the OpenAI API or internal processing errors. Basic request logging (timestamp, status) for debugging purposes is also desirable.

### 5. Non-Goals (Out of Scope)

*   **NG1:** Support for OpenAI services other than Chat Completions (e.g., Embeddings, DALL-E) in this iteration.
*   **NG2:** Advanced data transformation or complex context injection by the proxy beyond a simple system prompt for the AI.
*   **NG3:** Full-fledged user authentication or authorization mechanisms (e.g., OAuth, social logins) for accessing the proxy endpoint in this initial demo version. Rate limiting will serve as the primary abuse mitigation.
*   **NG4:** Advanced API usage analytics or user-specific API key management.
*   **NG5:** Highly scalable, production-grade infrastructure for the proxy; focus will be on a simple, deployable solution for demo purposes.

### 6. Design Considerations (Optional)

*   **DC1:** The backend proxy should be lightweight and have minimal dependencies.
*   **DC2:** The API endpoint (`/api/chat`) should be designed following RESTful principles, accepting POST requests with a JSON payload and returning JSON responses.

### 7. Technical Considerations (Optional)

*   **TC1:** **Backend Technology:** Node.js with the Express.js framework.
*   **TC2:** **API Key Management:** The OpenAI API key will be stored as a server-side environment variable (e.g., `OPENAI_API_KEY`). This is separate from the `VITE_OPENAI_API_KEY` which should be removed from client-side usage for direct OpenAI calls.
*   **TC3:** **Deployment:** The backend proxy should be deployable in a simple manner that allows for a publicly shareable link for the demo (e.g., as serverless functions on platforms like Vercel or Netlify, or a simple PaaS solution).
*   **TC4:** **Rate Limiting:** Implement using a Node.js library such as `express-rate-limit` with an in-memory store, suitable for the demo's scale.
*   **TC5:** **Future Evolution:** While not in scope now, the proxy could be extended in the future to support other OpenAI services or more sophisticated authentication if the demo evolves.

### 8. Success Metrics

*   **SM1:** The OpenAI API key is no longer present or accessible in any client-side JavaScript code bundles.
*   **SM2:** The AI chat functionality in the WHOOP AI Coach demo remains fully operational, with responses successfully proxied through the backend.
*   **SM3:** The demo application can be shared with testers without exposing the OpenAI API key.
*   **SM4:** Basic rate limiting is active on the proxy endpoint, providing a layer of protection against simple abuse.

### 9. Open Questions

*   **OQ1:** What specific rate limits should be set initially (e.g., 10 requests per minute per IP)? (A sensible default can be chosen to start).
*   **OQ2:** What is the preferred detailed error message format to be returned to the frontend from the proxy in case of failures (e.g., OpenAI API errors, rate limit exceeded)?
