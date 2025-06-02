# whoop-ai-
Repository for Stanford Gen AI for Product Managers BUS25 Course

This project is a React-based chat interface that interacts with an AI, with a backend proxy to securely handle OpenAI API requests.

## Prerequisites

- Node.js (v18 or later recommended)
- npm or yarn
- An OpenAI API key

## Setup

1.  **Clone the repository:**
    ```bash
    git clone <repository-url> # Replace <repository-url> with the actual URL
    cd whoop-ai-
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables:**
    Create a `.env` file in the root of the project directory (`whoop-ai-`) and add your OpenAI API key:
    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```
    Ensure this `.env` file is listed in your `.gitignore` file to prevent committing your API key.

## Running Locally

To run the application locally, you need to start both the backend proxy server and the frontend development server.

1.  **Start the Backend Server:**
    Open a terminal window, navigate to the project root (`whoop-ai-`), and run:
    ```bash
    npm run server:dev
    ```
    This will start the Express backend server, typically on `http://localhost:3001`. You should see a log message indicating the server is running.

2.  **Start the Frontend Development Server:**
    Open a second terminal window, navigate to the project root (`whoop-ai-`), and run:
    ```bash
    npm run dev
    ```
    This will start the Vite development server for the React frontend, typically on `http://localhost:5173` (Vite will indicate the exact address).

3.  **Access the Application:**
    Open your web browser and navigate to the address provided by the Vite server (e.g., `http://localhost:5173`). You should now be able to interact with the WHOOP AI Coach.
