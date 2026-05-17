# ClauseGuard AI Architecture

## Overview
ClauseGuard AI is built with a decoupled architecture. The frontend is a React SPA powered by Vite, providing the rich, animated user interface. The backend is an Express Node.js application that acts as a secure proxy to the Gemini API and orchestrates the adversarial multi-agent pipeline.

## System Components

### 1. Frontend (React + Vite)
- **UI Components:** Built with Framer Motion for premium animations.
- **State Management:** React hooks and context.
- **Routing:** React Router DOM.
- **Authentication:** Firebase Auth (Google + Email).
- **Storage:** Google Cloud Firestore (for saving analysis results).

### 2. Backend (Node.js + Express)
- **API Endpoint:** \`/api/analyze\` accepts Base64 encoded documents.
- **Middleware:** \`cors\`, \`express.json(limit: 25mb)\`.
- **AI Orchestration:** \`agents/pipeline.js\` manages the three-step adversarial flow.
- **Security:** Hides \`GEMINI_API_KEY\` from the frontend, logs requests, and catches pipeline failures.

### 3. Database (Firebase Firestore)
- Stores user profiles and their analyzed contracts.
- The React app reads/writes to Firestore directly using client-side SDK, secured by Firestore Security Rules.

## Data Flow
1. User uploads a PDF to the React frontend.
2. Frontend converts the PDF to Base64 and POSTs it to \`/api/analyze\`.
3. Backend receives the request and initializes the Gemini 3.1 Flash model.
4. Backend runs Agent 1 (Extractor) -> Agent 2 (Devil's Advocate) -> Agent 3 (Verdict).
5. Backend returns strict JSON to the frontend.
6. Frontend parses JSON and displays the interactive Results Dashboard.
7. If the user is logged in, the frontend saves the JSON to Firestore.
