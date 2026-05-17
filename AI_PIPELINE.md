# Adversarial AI Pipeline

This document explains the internal reasoning engine of **ClauseGuard AI**. Our system is not a simple "prompt-and-print" chatbot wrapper. It is a structured, multi-step adversarial agent pipeline engineered to provide reliable, grounded, and actionable legal intelligence.

## 🧠 The Multi-Agent Philosophy

Standard AI summarization often glosses over critical nuances. Legal risk is usually buried in specific phrasing (e.g., "sole discretion," "indemnify," "notwithstanding"). 

To solve this, ClauseGuard uses an **Adversarial Multi-Agent approach**:
1. **The Extractor Agent:** Cleans and parses the user's uploaded document.
2. **The Adversary Agent:** Red-teams the document. It is specifically prompted to simulate a malicious entity attempting to exploit the contract against the user.
3. **The Validator Agent:** Checks the Adversary's findings, ensuring no hallucinated clauses made it into the final report.

## 🔄 The Pipeline Workflow

When a user submits a document, the backend executes the following sequential pipeline:

### 1. Input Validation & Sanitization
Before touching the AI, the backend verifies the payload size and type. The document text is treated purely as untrusted data to mitigate **Prompt Injection** attacks.

### 2. Context Structuring
The text is injected into the prompt clearly separated by delimiters (e.g., `<CONTRACT_TEXT>...</CONTRACT_TEXT>`). The system prompt strictly instructs the Gemini model *never* to execute instructions found within the document delimiters.

### 3. Adversarial Analysis (Gemini)
The core Gemini API is called with a highly specialized system prompt. 
It evaluates the text across multiple vectors:
- **Exploitative Clauses:** Unfair termination, hidden fees, forced arbitration.
- **Ambiguous Terms:** Vague language designed to provide legal loopholes.
- **Hidden Liabilities:** Uncapped indemnification or liability waivers.

### 4. Mandatory Grounding (Evidence Extraction)
The AI is strictly instructed to NEVER flag a risk without quoting the exact source text. If it cannot extract a verbatim quote, the risk is discarded. This dramatically reduces hallucinations.

### 5. Structured Output Enforcement (JSON)
The AI is forced to return a strictly typed JSON object matching our predefined schema. 

Example Schema Output:
```json
{
  "overallRiskScore": 75,
  "exploitativeClauses": [
    {
      "clause": "Termination at convenience...",
      "severity": "High",
      "explanation": "Allows the company to terminate your service without notice.",
      "recommendation": "Request a 30-day notice period."
    }
  ]
}
```

### 6. Client-Side Rendering
The raw JSON is sent back to the React frontend, where it is mapped into modular, interactive components (Risk Cards, Dials, Jargon Decoders). **We never dangerously render raw AI HTML.**

## 🎯 Prompt Engineering Strategy
Our prompts are stored securely in the Node.js backend. They are rigorously tested to ensure the AI prioritizes honesty over false confidence. If a document is too short or lacks risk, the AI is instructed to return an empty array rather than inventing issues.
