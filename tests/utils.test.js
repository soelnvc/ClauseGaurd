import { describe, it, expect } from 'vitest';
import { formatFileSize } from '../src/services/aiService.js';

describe('Utility Tests: formatFileSize', () => {
  it('should correctly format bytes to B', () => {
    expect(formatFileSize(0)).toBe('0 B');
    expect(formatFileSize(500)).toBe('500 B');
  });

  it('should correctly format bytes to KB', () => {
    expect(formatFileSize(1024)).toBe('1 KB');
    expect(formatFileSize(1536)).toBe('1.5 KB');
  });

  it('should correctly format bytes to MB', () => {
    expect(formatFileSize(1048576)).toBe('1 MB');
    expect(formatFileSize(2621440)).toBe('2.5 MB'); // 2.5 * 1024 * 1024
  });
});
