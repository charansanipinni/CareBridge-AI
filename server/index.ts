import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { extractClinicalFacts } from '../src/core/extractor';
import { generatePatientCarePlan } from '../src/core/generator';
import { validateCarePlanFaithfulness } from '../src/core/validator';
import { SAMPLE_CASES } from '../src/data/sampleSummaries';
import { ProcessingMode, CareBridgeResult } from '../src/types/careplan';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here');
const hasOpenAIKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here');
const isAiConfigured = hasGeminiKey || hasOpenAIKey;

console.log(`[CareBridge AI Server] AI API status: ${isAiConfigured ? 'CONFIGURED' : 'DEMO MODE (Deterministic)'}`);

/**
 * Health & Config check
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    product: 'CareBridge AI',
    version: '1.0.0',
    mode: isAiConfigured ? 'AI_READY' : 'DEMO_MODE',
    aiProvider: hasGeminiKey ? 'Gemini' : hasOpenAIKey ? 'OpenAI' : 'None (Deterministic Demo Engine)',
    timestamp: new Date().toISOString(),
  });
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
app.post('/api/process', async (req: Request, res: Response) => {
  try {
    const { text, requestedMode, sourceType } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Discharge summary text cannot be empty.' });
    }

    const mode: ProcessingMode = (requestedMode === 'AI' && isAiConfigured) ? 'AI' : 'DEMO';

    // 1. Extract Clinical Facts
    const facts = extractClinicalFacts(text);

    // 2. Generate Patient-Facing Care Plans (English & Telugu)
    const carePlanEnglish = generatePatientCarePlan(facts, 'en');
    const carePlanTelugu = generatePatientCarePlan(facts, 'te');

    // 3. Faithfulness Validation Engine (Deterministic Audit)
    const faithfulnessReport = validateCarePlanFaithfulness(text, facts, carePlanEnglish);
    const faithfulnessReportTelugu = validateCarePlanFaithfulness(text, facts, carePlanTelugu);

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
    };

    return res.json(result);
  } catch (error: any) {
    console.error('[CareBridge AI Server] Processing error:', error);
    return res.status(500).json({
      error: 'An unexpected error occurred during discharge plan processing.',
      details: error?.message || String(error),
    });
  }
});

app.listen(PORT, () => {
  console.log(`[CareBridge AI Server] Running on http://localhost:${PORT}`);
});
