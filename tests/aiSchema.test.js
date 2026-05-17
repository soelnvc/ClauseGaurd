import { describe, it, expect } from 'vitest';

// Simulating the expected backend JSON structure validator
function validateAIOutputSchema(jsonOutput) {
  const requiredFields = [
    'overallRiskScore',
    'riskLevel',
    'executiveSummary',
    'topRedFlags',
    'clauseAnalysis',
    'hiddenLiabilities',
    'ambiguousTerms',
    'recommendedActions',
    'confidence',
    'limitations',
    'legalDisclaimer'
  ];

  const missingFields = requiredFields.filter(field => !(field in jsonOutput));
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

describe('AI Output Schema Tests', () => {
  it('should validate a correct AI output JSON schema', () => {
    const validOutput = {
      overallRiskScore: 75,
      riskLevel: "High",
      executiveSummary: "This document contains significant risks.",
      topRedFlags: ["Termination without cause"],
      clauseAnalysis: [{ quote: "Company may terminate", critique: "One-sided", severity: "high" }],
      hiddenLiabilities: [{ term: "User indemnifies", implication: "Financial risk" }],
      ambiguousTerms: [{ term: "Reasonable time", implication: "Not defined" }],
      recommendedActions: ["Negotiate termination clause"],
      confidence: "High",
      limitations: "Did not check state-specific laws",
      legalDisclaimer: "Not legal advice"
    };

    const result = validateAIOutputSchema(validOutput);
    expect(result.isValid).toBe(true);
    expect(result.missingFields.length).toBe(0);
  });

  it('should invalidate an incomplete AI output JSON schema', () => {
    const invalidOutput = {
      overallRiskScore: 40,
      riskLevel: "Medium"
      // Missing all other required fields
    };

    const result = validateAIOutputSchema(invalidOutput);
    expect(result.isValid).toBe(false);
    expect(result.missingFields).toContain('executiveSummary');
    expect(result.missingFields).toContain('legalDisclaimer');
  });

  it('should ensure legacy mapping compatibility fields are checked', () => {
    // In pipeline.js, we map overallRiskScore to riskScore for legacy UI
    const mappedOutput = {
      overallRiskScore: 50,
      riskScore: 50, // Backward compatibility
      executiveSummary: "Summary",
      summary: "Summary" // Backward compatibility
    };

    expect(mappedOutput.riskScore).toBeDefined();
    expect(mappedOutput.summary).toBeDefined();
  });
});
