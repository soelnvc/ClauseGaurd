# System Architecture

**ClauseGuard AI** utilizes a decoupled, modern architecture designed for scalability, security, and extremely rapid UI rendering.

## 🏗️ High-Level Architecture

The system consists of three main pillars:
1. **The Client (Frontend):** React + Vite SPA.
2. **The Intelligence Layer (Backend):** Node.js Express server orchestrating AI pipelines.
3. **The Data & Auth Layer (Google Firebase):** User state and document storage.

---

### 1. Frontend: React 18 + Vite
The frontend is built to be blisteringly fast and highly interactive.
- **State Management:** Handled via custom React Contexts (`AuthContext`, `ToastContext`) to avoid prop-drilling without the boilerplate of Redux.
- **Routing:** React Router DOM manages the SPA navigation (`/`, `/workspace`, `/dashboard`, `/policies`, `/compare`).
- **Animations:** Framer Motion handles fluid, premium transitions and layout shifts, enhancing the perceived performance of the AI processing state.
- **Styling:** Vanilla CSS following BEM methodology for scoping, leveraging CSS variables (`--bg-main`, `--text-primary`) for instantaneous dark/light mode scaling.

### 2. Backend: Node.js + Express
The Node.js server acts as a secure proxy and orchestration layer.
- **Isolation:** It completely abstracts the Gemini API key from the client.
- **Processing:** Exposes a clean REST API (`POST /api/analyze`).
- **Scalability:** Completely stateless. It receives text, processes it through the multi-agent AI pipeline, and returns JSON. This allows the backend to be horizontally scaled on services like Google Cloud Run with zero architectural changes.

### 3. Core AI: Google Gemini (3.1 Pro/Flash)
We utilize the Gemini API for our adversarial reasoning pipeline.
- The backend constructs specialized system prompts, formats the user's document, and requests a strict JSON schema.
- **Self-Correction:** The AI is instructed to validate its own extracted quotes before finalizing the JSON payload.

### 4. Database & Auth: Google Firebase
- **Authentication:** Firebase Auth handles user registration and session management natively.
- **Firestore:** NoSQL document database used to store users' parsed contract portfolios. Data is structured logically: `users/{userId}/policies/{policyId}`.

---

## 📈 Scalability Decisions

- **Stateless Backend:** Because the Express server retains no local session memory, it can be instantly deployed to serverless architectures (Vercel, Cloud Run, AWS Lambda) and scaled infinitely.
- **Decoupled Architecture:** If the AI pipeline becomes computationally heavy, the Node.js API can be moved to an asynchronous worker queue (e.g., BullMQ) without affecting the React frontend.
- **Client-Side Compute:** All UI rendering, data sorting, filtering, and animation is offloaded to the client's browser, significantly reducing server costs.

## 📂 Data Flow

1. User uploads a contract PDF in the React Frontend.
2. React parses the text locally (reducing backend payload size).
3. React sends `POST /api/analyze` with the raw text to the Node.js Backend.
4. Backend validates the payload and injects it into the Adversarial System Prompt.
5. Backend calls Gemini API.
6. Gemini analyzes, extracts evidence, and returns structured JSON.
7. Backend sanitizes the JSON and returns it to React.
8. React seamlessly animates the data into the Dashboard View.
9. React optionally saves the JSON to Firebase Firestore for future retrieval.
