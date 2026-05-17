import { describe, it, expect } from 'vitest';

// Simulating the backend payload validation logic
function validatePayload(base64Data, mimeType) {
  if (!base64Data || base64Data.trim() === '') {
    return { valid: false, error: 'No document data provided.' };
  }
  
  if (base64Data.length < 10) {
    return { valid: false, error: 'Document is too short to be valid.' };
  }

  // Validate base64 payload size (reject anything over 25MB decoded)
  const estimatedBytes = (base64Data.length * 3) / 4;
  if (estimatedBytes > 25 * 1024 * 1024) {
    return { valid: false, error: 'Document exceeds the 25MB size limit.' };
  }

  const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
  if (mimeType && !allowedMimeTypes.includes(mimeType)) {
    return { valid: false, error: 'Unsupported file type.' };
  }

  return { valid: true };
}

describe('Input Validation Tests', () => {
  it('should reject empty input', () => {
    const result = validatePayload('', 'text/plain');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('No document data provided.');
  });

  it('should reject very short input', () => {
    const result = validatePayload('aB3', 'text/plain');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Document is too short to be valid.');
  });

  it('should reject oversized input', () => {
    // Simulate a > 25MB base64 string
    // 26MB = 26 * 1024 * 1024 bytes. Base64 length = bytes * 4 / 3.
    const massiveLength = Math.ceil((26 * 1024 * 1024 * 4) / 3);
    const massiveString = 'A'.repeat(massiveLength);
    const result = validatePayload(massiveString, 'application/pdf');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Document exceeds the 25MB size limit.');
  });

  it('should reject unsupported mime types', () => {
    const result = validatePayload('ValidBase64StringDataHere', 'application/json');
    expect(result.valid).toBe(false);
    expect(result.error).toBe('Unsupported file type.');
  });

  it('should accept valid payload', () => {
    const result = validatePayload('ValidBase64StringDataHereThatIsLongEnough', 'application/pdf');
    expect(result.valid).toBe(true);
  });
});
