/**
 * Converts a File object into the inlineData format.
 */
function fileToGenerativePart(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result.split(',')[1];
      resolve({
        base64Data,
        mimeType: file.type || "application/pdf"
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * The main AI analysis function hitting our secure backend.
 * @param {File} file - The uploaded contract document (PDF/Image)
 * @param {function} onProgress - Callback for UI loading stages
 * @returns {Promise<object>} The fully parsed JSON matching the UI schema
 */
export async function analyzePolicy(file, onProgress) {
  let intervalId;
  try {
    onProgress?.(10, 'Initializing AI engine...');
    
    // Convert PDF/File to Base64
    onProgress?.(20, 'Securely uploading document...');
    const filePart = await fileToGenerativePart(file);

    const agentStages = [
      { p: 30, m: 'Clause Extractor Agent: Parsing document...' },
      { p: 40, m: 'Risk Detector Agent: Scanning for red flags...' },
      { p: 50, m: 'Ambiguity Finder Agent: Highlighting vague terms...' },
      { p: 60, m: 'Hidden Liability Agent: Finding buried costs...' },
      { p: 70, m: 'User Rights Defender Agent: Assessing fairness...' },
      { p: 80, m: 'Devil’s Advocate Agent: Stress-testing loopholes...' },
      { p: 90, m: 'Final Verdict Agent: Compiling report...' }
    ];

    let currentStage = 0;
    intervalId = setInterval(() => {
      if (currentStage < agentStages.length) {
        onProgress?.(agentStages[currentStage].p, agentStages[currentStage].m);
        currentStage++;
      } else {
        clearInterval(intervalId);
      }
    }, 2000); // cycle through agents every 2 seconds
    
    // In production, this would point to a Cloud Run or Vercel Serverless function.
    // For local dev, it points to the Express backend.
    const API_URL = import.meta.env.VITE_API_URL || 
      (import.meta.env.PROD ? '/api/analyze' : 'http://localhost:3001/api/analyze');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...filePart,
        fileName: file.name
      })
    });

    clearInterval(intervalId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Failed to analyze document.');
    }

    const result = await response.json();
    
    if (!result.success) {
       throw new Error(result.error?.message || 'Analysis failed.');
    }
    
    onProgress?.(100, 'Finalizing report...');
    
    return {
      ...result.data,
      fileSize: file.size,
    };
    
  } catch (err) {
    clearInterval(intervalId);
    console.error("Analysis Error Detail:", err);
    throw err;
  }
}

/**
 * Helper strictly for UI format.
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
