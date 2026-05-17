# ClauseGuard AI Pipeline

## Overview
ClauseGuard AI uses an **Adversarial Multi-Agent Pipeline** powered by Gemini 3.1 Flash. Instead of a single generic prompt, the system chains three specialized agents to simulate a contract review process between a malicious actor and a consumer rights defender.

## The Multi-Agent Flow

1. **Clause Extractor Agent**
   - **Goal:** Neutral extraction of material obligations, terms, conditions, and liabilities.
   - **Grounding Rule:** Must use ONLY the provided document context. Cannot invent clauses.
   - **Input:** Raw document text (PDF/Text).

2. **Devil’s Advocate (Adversarial) Agent**
   - **Goal:** Act as a malicious corporate lawyer.
   - **Task:** Review the extracted terms and find every ambiguity, hidden liability, and exploitative loophole. How can this contract be used to screw over the user?
   - **Output:** A brutal critique of the contract's risks.

3. **Final Verdict & Formatting Agent**
   - **Goal:** Act as a consumer rights defender.
   - **Task:** Take the adversarial critique and structure it into a strict, user-friendly JSON schema.
   - **Output:** Extracts direct quotes as evidence, assigns a risk score (0-100), and provides actionable recommended steps.

## Security & Implementation
- **Server-Side Execution:** The pipeline runs entirely on a Node.js/Express backend (or Cloud Run in production).
- **No Prompt Injection:** System instructions are isolated from the untrusted user document.
- **Strict JSON:** The final agent enforces a strict JSON schema that the React frontend consumes to build the UI dashboard.
