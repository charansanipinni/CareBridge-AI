/**
 * CareBridge AI - Input Security & Prompt Injection Defense
 * Treats uploaded clinical documents as untrusted content.
 * Disarms prompt injection, script execution attempts, and unauthorized overrides.
 */

export interface SecurityScanResult {
  isSafe: boolean;
  sanitizedText: string;
  threatsDetected: string[];
}

const INJECTION_PATTERNS = [
  /(?:ignore|disregard|forget)\s+(?:all\s+)?(?:previous|prior|above)\s+(?:instructions|prompts|rules)/i,
  /system\s+override[:\s]/i,
  /you\s+are\s+now\s+in\s+developer\s+mode/i,
  /jailbreak/i,
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>[\s\S]*?<\/iframe>/gi,
  /javascript:/gi,
  /onload\s*=/gi,
  /onerror\s*=/gi,
];

/**
 * Sanitizes input text and neutralizes prompt injection payloads
 */
export function sanitizeDocumentInput(rawInput: string): SecurityScanResult {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isSafe: true,
      sanitizedText: '',
      threatsDetected: [],
    };
  }

  const threatsDetected: string[] = [];
  let sanitized = rawInput;

  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      threatsDetected.push(`Potential prompt override or script injection pattern detected: ${pattern.source}`);
      // Neutralize the injection pattern
      sanitized = sanitized.replace(pattern, '[BLOCKED_INJECTION_ATTEMPT]');
    }
  }

  // Strip dangerous HTML tags
  sanitized = sanitized
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .trim();

  return {
    isSafe: threatsDetected.length === 0,
    sanitizedText: sanitized,
    threatsDetected,
  };
}
