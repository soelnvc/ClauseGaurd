import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  EXTRACTOR_PROMPT, 
  RISK_DETECTOR_PROMPT, 
  AMBIGUITY_FINDER_PROMPT, 
  HIDDEN_LIABILITY_PROMPT, 
  USER_RIGHTS_PROMPT, 
  DEVILS_ADVOCATE_PROMPT, 
  VERDICT_PROMPT,
  VALIDATOR_PROMPT
} from '../prompts/index.js';
import dotenv from 'dotenv';

dotenv.config();

export async function runAdversarialPipeline(base64Data, mimeType) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the backend environment');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = "gemini-3.1-flash-lite-preview";

  const filePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType || "application/pdf"
    }
  };

  const model = genAI.getGenerativeModel({ model: modelName });

  // Phase 1: Agent 1 (Clause Extractor)
  const extractorResult = await model.generateContent([
    EXTRACTOR_PROMPT,
    filePart
  ]);
  const extractedTerms = extractorResult.response.text();
  const context = `\n\n--- BEGIN UNTRUSTED DOCUMENT CONTEXT ---\n${extractedTerms}\n--- END UNTRUSTED DOCUMENT CONTEXT ---`;

  // Phase 2: Agents 2-6 (Parallel Execution)
  const agentPromises = [
    model.generateContent([RISK_DETECTOR_PROMPT, filePart, context]),
    model.generateContent([AMBIGUITY_FINDER_PROMPT, filePart, context]),
    model.generateContent([HIDDEN_LIABILITY_PROMPT, filePart, context]),
    model.generateContent([USER_RIGHTS_PROMPT, filePart, context]),
    model.generateContent([DEVILS_ADVOCATE_PROMPT, filePart, context])
  ];

  const results = await Promise.all(agentPromises);
  const [riskRes, ambiguityRes, hiddenRes, rightsRes, devilRes] = results;

  const synthesisContext = `
    \n\n--- Agent 2: Risk Detector ---\n${riskRes.response.text()}
    \n\n--- Agent 3: Ambiguity Finder ---\n${ambiguityRes.response.text()}
    \n\n--- Agent 4: Hidden Liability ---\n${hiddenRes.response.text()}
    \n\n--- Agent 5: User Rights Defender ---\n${rightsRes.response.text()}
    \n\n--- Agent 6: Devil's Advocate ---\n${devilRes.response.text()}
  `;

  // Phase 3: Agent 7 (Final Verdict)
  const jsonModel = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    }
  });

  const verdictResult = await jsonModel.generateContent([
    VERDICT_PROMPT,
    synthesisContext
  ]);
  
  const rawVerdictText = verdictResult.response.text();

  // Phase 4: Agent 8 (The Validator) - AI Self-Validation Pass
  const validationContext = `
    \n\n--- Original Extracted Context ---\n${extractedTerms}
    \n\n--- Proposed Final Verdict JSON ---\n${rawVerdictText}
  `;

  const validatedResult = await jsonModel.generateContent([
    VALIDATOR_PROMPT,
    validationContext
  ]);

  const finalResponseText = validatedResult.response.text();
  const json = JSON.parse(finalResponseText);
  
  // Backward compatibility for legacy UI pages (Dashboard, Profile, Compare)
  json.riskScore = json.overallRiskScore;
  json.coverageScore = Math.max(0, 100 - json.overallRiskScore);
  json.summary = json.executiveSummary;
  
  // Map clauseAnalysis quote/critique/severity fields back to legacy objects
  const mappedClauses = (json.clauseAnalysis || []).map(c => ({
    clauseText: c.quote || "Exploitative Clause",
    explanation: c.critique || "Questionable term detected.",
    severity: (c.severity || "warning").toLowerCase(),
    redFlag: c.severity === 'critical' || c.severity === 'high',
    recommendedText: c.proposedAlternative || "Review and negotiate this clause."
  }));
  
  json.exploitativeClauses = mappedClauses;
  
  json.riskFlags = (json.clauseAnalysis || []).map(c => ({
    flag: c.quote || "Exploitative Clause",
    detail: c.critique || "High risk or ambiguous terminology.",
    level: c.severity === 'critical' || c.severity === 'high' ? 'critical' : c.severity === 'medium' ? 'warning' : 'info'
  }));

  json.exclusions = (json.clauseAnalysis || []).map(c => ({
    title: c.quote ? (c.quote.substring(0, 45) + "...") : "High Risk Clause",
    detail: c.critique || "Questionable term detected.",
    severity: c.severity === 'critical' || c.severity === 'high' ? 'high' : c.severity === 'medium' ? 'medium' : 'low'
  }));

  json.coverageItems = [
    { category: "Liability Limits", status: json.overallRiskScore > 75 ? "not_covered" : "covered" },
    { category: "Termination Rights", status: json.overallRiskScore > 50 ? "partial" : "covered" },
    { category: "IP Ownership", status: json.overallRiskScore > 65 ? "partial" : "covered" },
    { category: "Indemnification", status: json.overallRiskScore > 80 ? "not_covered" : "covered" }
  ];

  json.contractOverview = { 
    name: "Contract Analysis", 
    parties: "Vault Record", 
    effectiveDate: new Date().toLocaleDateString('en-GB'), 
    governingLaw: "standard",
    type: json.overallRiskScore > 75 ? "High Risk Contract" : "Standard Agreement",
    sumInsured: "-",
    premium: "-",
    provider: "ClauseGuard Vault"
  };
  json.policyOverview = json.contractOverview;
  
  return json;
}
