import { describe, it, expect } from 'vitest';

// Simulate risk mapping logic used by the UI or backend mappings
function determineRiskLevel(score) {
  if (score < 0 || score > 100) return 'Invalid';
  if (score <= 30) return 'Low';
  if (score <= 60) return 'Medium';
  if (score <= 80) return 'High';
  return 'Critical';
}

function normalizeScore(score) {
  return Math.max(0, Math.min(100, score));
}

describe('Risk Scoring Tests', () => {
  it('should map scores correctly to risk levels', () => {
    expect(determineRiskLevel(15)).toBe('Low');
    expect(determineRiskLevel(30)).toBe('Low');
    expect(determineRiskLevel(31)).toBe('Medium');
    expect(determineRiskLevel(50)).toBe('Medium');
    expect(determineRiskLevel(60)).toBe('Medium');
    expect(determineRiskLevel(61)).toBe('High');
    expect(determineRiskLevel(75)).toBe('High');
    expect(determineRiskLevel(80)).toBe('High');
    expect(determineRiskLevel(81)).toBe('Critical');
    expect(determineRiskLevel(100)).toBe('Critical');
  });

  it('should normalize out-of-bounds scores to 0-100', () => {
    expect(normalizeScore(-10)).toBe(0);
    expect(normalizeScore(150)).toBe(100);
    expect(normalizeScore(85)).toBe(85);
  });
});
