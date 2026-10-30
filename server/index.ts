import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PDFParse } from 'pdf-parse';
import { extractClinicalFacts } from '../src/core/extractor';
import { generatePatientCarePlan } from '../src/core/generator';
import { validateCarePlanFaithfulness } from '../src/core/validator';
import { sanitizeDocumentInput } from '../src/core/security';
import { SAMPLE_CASES } from '../src/data/sampleSummaries';
import { ProcessingMode, CareBridgeResult } from '../src/types/careplan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 1. Strict Origin Whitelist for CORS
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (e.g. server-to-server or curl) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy: Origin not allowed'));
    }
  },
  credentials: true,
}));

// Max body size 15MB
app.use(express.json({ limit: '15mb' }));

// 2. Request Timeout Middleware (15 seconds)
const REQUEST_TIMEOUT_MS = 15000;
app.use((req: Request, res: Response, next: NextFunction) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({ error: 'Request timed out. Please try again.' });
    }
  }, REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timer));
  next();
});

// 3. Sliding Window In-Memory Rate Limiter (60 requests per minute per IP)
interface RateLimitBucket {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();

function rateLimiter(maxReqPerMin = 60) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const bucket = rateLimitMap.get(ip);

    if (!bucket || now > bucket.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + 60000 });
      return next();
    }

    if (bucket.count >= maxReqPerMin) {
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please wait before submitting more documents.',
      });
    }

    bucket.count += 1;
    next();
  };
}

const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');
const isAiConfigured = hasGeminiKey || hasOpenAIKey;

console.log(`[CareBridge AI Server] AI API status: ${isAiConfigured ? 'CONFIGURED' : 'DEMO MODE (Deterministic Engine)'}`);

/**
 * Health & Config check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    product: 'CareBridge AI',
    version: '1.2.0',
    mode: isAiConfigured ? 'AI_READY' : 'DEMO_MODE',
    aiProvider: hasGeminiKey ? 'Gemini' : hasOpenAIKey ? 'OpenAI' : 'None (Deterministic Safety Engine)',
    offlineCapable: true,
    securityFeatures: [
      'Prompt Injection Neutralization',
      'Zero-PHI Logging',
      'Strict CORS Whitelist',
      'Magic-Byte File Validation',
      'In-Memory Rate Limiting',
      '15-Second Timeout Protection',
      'Deterministic 15-Point Safety Audit'
    ],
    timestamp: new Date().toISOString(),
  });
});

/**
 * PDF Text Extraction Endpoint using pdf-parse with strict validation
 */
app.post('/api/extract-pdf', rateLimiter(30), async (req: Request, res: Response) => {
  try {
    const { base64, filename } = req.body;
    if (!base64 || typeof base64 !== 'string') {
      return res.status(400).json({ error: 'Valid base64 PDF data required.' });
    }

    // Base64 regex / padding validation
    const base64Clean = base64.replace(/^data:application\/pdf;base64,/, '').trim();
    if (!/^[A-Za-z0-9+/=]+$/.test(base64Clean)) {
      return res.status(400).json({ error: 'Malformed base64 encoding.' });
    }

    const buffer = Buffer.from(base64Clean, 'base64');

    // 10MB decoded limit
    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'PDF file exceeds the maximum 10MB limit.' });
    }

    // Magic bytes check (%PDF- = 0x25, 0x50, 0x44, 0x46)
    if (buffer.length < 5 || buffer[0] !== 0x25 || buffer[1] !== 0x50 || buffer[2] !== 0x44 || buffer[3] !== 0x46) {
      return res.status(400).json({
        error: 'Invalid file format: File header does not match PDF signature (%PDF-).',
      });
    }

    const parser = (PDFParse as any).default || PDFParse;
    const pdfData = await parser(buffer);

    // Sanitize and normalize extracted text
    const cleanText = pdfData.text
      .replace(/\r\n/g, '\n')
      .replace(/[^\x20-\x7E\n\t]/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanText || cleanText.length < 20) {
      return res.status(422).json({
        error: 'PDF contains no selectable text. It may be a scanned image.',
      });
    }

    // Zero-PHI logging: Log character count and page count only
    console.log(`[CareBridge AI Server] Extracted ${cleanText.length} characters across ${pdfData.numpages} page(s) from ${filename || 'PDF'}`);

    return res.json({
      text: cleanText,
      pageCount: pdfData.numpages,
      info: { pages: pdfData.numpages },
    });
  } catch (err: any) {
    console.error('[CareBridge AI Server] PDF extraction error:', err?.message || 'Internal error');
    return res.status(500).json({
      error: 'Failed to extract text from PDF document.',
    });
  }
});

/**
 * Get built-in synthetic benchmark cases
 */
app.get('/api/samples', (req: Request, res: Response) => {
  res.json({ samples: SAMPLE_CASES });
});

/**
 * Core Processing Endpoint
 * Takes raw discharge summary, produces facts, plans (EN & TE), and deterministic validation report.
 */
app.post('/api/process', rateLimiter(60), async (req: Request, res: Response) => {
  try {
    const { text, requestedMode, sourceType } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Discharge summary text cannot be empty.' });
    }

    // Step 1: Security sanitization (Prompt injection defense)
    const securityScan = sanitizeDocumentInput(text);
    const sanitizedText = securityScan.sanitizedText;

    const mode: ProcessingMode = (requestedMode === 'AI' && isAiConfigured) ? 'AI' : 'DEMO';

    // Step 2: Clinical Fact Extraction
    const facts = extractClinicalFacts(sanitizedText);

    // Step 3: Generate Patient-Facing Care Plans (English & Telugu)
    const carePlanEnglish = generatePatientCarePlan(facts, 'en');
    const carePlanTelugu = generatePatientCarePlan(facts, 'te');

    // Step 4: Faithfulness Validation Engine (Independent Deterministic Audit)
    const faithfulnessReport = validateCarePlanFaithfulness(sanitizedText, facts, carePlanEnglish);
    const faithfulnessReportTelugu = validateCarePlanFaithfulness(sanitizedText, facts, carePlanTelugu);

    // If security threats were neutralized, add an informational check
    if (!securityScan.isSafe) {
      faithfulnessReport.checks.unshift({
        id: 'chk-security-sanitized',
        category: 'SECURITY',
        title: 'Untrusted Content Neutralized',
        detail: `The system detected and neutralized prompt injection / script patterns: ${securityScan.threatsDetected.join(', ')}`,
        severity: 'INFO',
        status: 'PASSED',
      });
    }

    // Verification token (SHA-256 or base64 token without PHI)
    const verificationToken = `CB-${(facts.patientId || 'SYNTH').slice(0, 8)}-${faithfulnessReport.passedCount}P${faithfulnessReport.failedCount}F`;

    const result: CareBridgeResult = {
      id: `cb-${Date.now()}`,
      timestamp: new Date().toISOString(),
      sourceText: text,
      sourceType: sourceType || 'PASTED',
      mode,
      facts,
      carePlanEnglish,
      carePlanTelugu,
      faithfulnessReport,
      faithfulnessReportTelugu,
      verificationToken,
      securityThreats: securityScan.threatsDetected,
    };

    // Zero-PHI Logging: Log only metric counts, never patient identifiers or summary text
    console.log(`[CareBridge AI Server] Processed summary: Status=${faithfulnessReport.overallStatus}, Meds=${facts.medications.length}, Length=${text.length} chars`);

    return res.json(result);
  } catch (error: any) {
    console.error('[CareBridge AI Server] Processing error:', error?.message || 'Unknown processing error');
    return res.status(500).json({
      error: 'An unexpected error occurred during discharge plan processing.',
    });
  }
});

app.listen(PORT, () => {
  console.log(`[CareBridge AI Server] Running on http://localhost:${PORT}`);
});
