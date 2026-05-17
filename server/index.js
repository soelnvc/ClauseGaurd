import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { runAdversarialPipeline } from './agents/pipeline.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Simple in-memory cache for identical file hashes
const analysisCache = new Map();

// Rate limiter for the analyze endpoint (max 5 requests per 15 mins per IP)
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many analysis requests from this IP, please try again after 15 minutes.' } }
});

// Increase payload limit for base64 documents, but match frontend limit of 25MB
app.use(express.json({ limit: '25mb' }));
app.use(cors());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    services: {
      ai: process.env.GEMINI_API_KEY ? 'configured' : 'missing_key',
      database: 'firestore',
    }
  });
});

app.post('/api/analyze', analyzeLimiter, async (req, res) => {
  try {
    const { base64Data, mimeType, fileName } = req.body;
    
    if (!base64Data) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'No document data provided.' } });
    }

    // Validate base64 payload size (reject anything over 25MB decoded)
    const estimatedBytes = (base64Data.length * 3) / 4;
    if (estimatedBytes > 25 * 1024 * 1024) {
      return res.status(413).json({ success: false, error: { code: 'PAYLOAD_TOO_LARGE', message: 'Document exceeds the 25MB size limit.' } });
    }

    const allowedMimeTypes = ['application/pdf', 'image/png', 'image/jpeg', 'text/plain'];
    if (mimeType && !allowedMimeTypes.includes(mimeType)) {
      return res.status(400).json({ success: false, error: { code: 'INVALID_MIME_TYPE', message: 'Unsupported file type.' } });
    }

    // Hash the input document
    const fileHash = crypto.createHash('sha256').update(base64Data).digest('hex');

    // Return cached result if available
    if (analysisCache.has(fileHash)) {
      console.log('Cache hit for document:', fileHash);
      return res.json({
        success: true,
        data: {
          ...analysisCache.get(fileHash),
          analyzedAt: new Date().toISOString(),
          fileName,
          cached: true
        }
      });
    }

    const result = await runAdversarialPipeline(base64Data, mimeType);
    
    // Store in cache
    analysisCache.set(fileHash, result);
    
    res.json({
      success: true,
      data: {
        ...result,
        analyzedAt: new Date().toISOString(),
        fileName
      }
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'AI_PROCESSING_FAILED',
        message: 'We could not complete the AI analysis. Please try again with clearer input or a smaller file.'
      }
    });
  }
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app build folder in production
app.use(express.static(path.join(__dirname, '../dist')));

// The catchall handler for React Routing support in production
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`ClauseGuard AI server running on port ${PORT}`);
});
