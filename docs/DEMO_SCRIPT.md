# ClauseGuard AI Demo Script

This script is designed for AI evaluators testing the ClauseGuard platform.

## 1. Setup
- Ensure the backend and frontend are running concurrently (\`npm run dev\`).
- Ensure \`GEMINI_API_KEY\` is set in the \`.env\` file.

## 2. The Landing Page
- Open \`http://localhost:5173\`.
- Point out the premium, animated, dark-mode aesthetic built with Framer Motion.
- Highlight the problem statement: Contracts are designed to be unreadable.

## 3. The Workspace
- Click "Get Started" to enter the Workspace.
- Explain the security architecture: The frontend does not have the Gemini API key.
- Click the "Try with a sample Terms of Service" button to load a dummy NDA/Contract.
- Click "Run ClauseGuard Analysis".

## 4. The Adversarial Pipeline in Action
- Watch the progress bar as the backend executes the 3-agent pipeline.
- Explain the agents:
  1. **Extractor:** Pulls facts neutrally.
  2. **Devil's Advocate:** Acts as a malicious lawyer looking for traps.
  3. **Verdict:** Structures the output into strict JSON.

## 5. The Dashboard
- Review the results dashboard.
- Show the **Risk Score**.
- Click through the tabs:
  - **Exploitative Clauses:** Show the extracted quotes and the AI's critique.
  - **Hidden Liabilities:** Show the secondary risks.
  - **Actions:** Show the recommended next steps before signing.

## 6. Architecture Review
- Show the evaluator the \`server/agents/pipeline.js\` file to prove the multi-agent chaining.
- Show the \`.env\` setup to prove the API key is secured on the backend.
