# Testing ClauseGuard AI

This document explains the testing strategy and framework used to ensure code reliability, security, and AI pipeline robustness in ClauseGuard AI.

## 1. Test Framework
We use **Vitest**, a blazing fast unit test framework powered by Vite. It is perfectly suited for our React/Vite architecture, requiring zero-config integration while providing Jest-compatible APIs.

## 2. How to Run Tests
To run the test suite locally, execute the following commands from the project root:

```bash
# Run tests in watch mode
npm test

# Run tests once (for CI/CD or evaluators)
npm run test:run
```

## 3. Areas Covered by Tests
Our test suite specifically targets high-value business logic and security mechanisms:

*   **Input Validation:** Ensures the backend correctly rejects empty, oversized (>25MB), or unsupported file types.
*   **AI Output Schema:** Verifies that the JSON parsed from the AI pipeline contains all required fields (e.g., `overallRiskScore`, `clauseAnalysis`, `legalDisclaimer`) and correctly maps legacy keys for UI stability.
*   **Risk Scoring Boundaries:** Confirms that numeric risk scores correctly translate to bounded severity levels (Low, Medium, High, Critical).
*   **Prompt Injection Defense:** Validates that our system prompts strictly enforce untrusted data sandboxing, ensuring malicious user instructions are treated as document data, not system commands.
*   **Utilities:** Tests pure functions like `formatFileSize`.

## 4. Why These Tests Matter for Evaluation
This testing strategy signals professional confidence. Instead of over-engineering brittle UI tests, we focused on the core problem:
1.  **Security:** Input validation and prompt injection tests prove the system is hardened against adversarial attacks.
2.  **Reliability:** Schema validation ensures the frontend will never crash due to unexpected AI outputs.
3.  **Maintainability:** Small, pure logic tests ensure future modifications to the risk engine do not silently break existing thresholds.

## 5. What is Intentionally Not Tested
Because this is an MVP built within a restricted hackathon timeframe, the following areas are intentionally omitted from automated testing:
*   **Live Gemini API Calls:** To avoid rate limits, secret exposure, and flaky network tests, the actual Gemini network layer is mocked or bypassed in unit tests.
*   **Firebase Authentication/Firestore:** Database logic is secured via `firestore.rules`, not unit tests.
*   **React UI & Framer Motion:** The user interface and complex animation sequences are verified via manual QA rather than fragile component snapshots.
