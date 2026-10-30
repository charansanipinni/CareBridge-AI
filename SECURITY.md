# CareBridge AI — Security Policy & Engineering Controls

**Product**: CareBridge AI  
**Team**: AVENGERS  
**Event**: Talent AP Mega Hackathon 2026 (Healthcare Track H2)  
**Standard**: Healthcare Prototype Security Architecture

---

## 1. Security Architecture Overview

CareBridge AI bridges the gap between complex hospital discharge summaries and patient understanding without altering clinical meaning. Because healthcare software processes potentially sensitive health information, security controls have been designed into the core pipeline.

---

## 2. Implemented Security Controls

### A. Input Sanitization & Prompt-Injection Defense (`src/core/security.ts`)
- **Untrusted Content Treatment**: All uploaded discharge documents (PDF, TXT, MD, pasted text) are treated as untrusted user input.
- **Prompt Override Neutralization**: Regex-based scanners detect and disarm system override patterns (e.g., `SYSTEM OVERRIDE: ignore previous instructions`, `developer mode`, `jailbreak`).
- **Script & HTML Stripping**: Disarms embedded `<script>`, `<iframe>`, and event-handler injection attempts before clinical fact extraction.

### B. Safe In-Memory Processing & Zero-PHI Logging
- **Ephemeral Processing**: Documents are analyzed in-memory during active sessions. 
- **Zero Document Logging**: The backend server logs only high-level status metrics (character counts, check counts, error codes). Full patient discharge summaries and medical notes are never written to log files.
- **Session Isolation**: Client session state is stored in browser memory only and can be deleted instantly via "Clear Session Plans".

### C. Server-Side Credential Isolation
- **No Client-Side Secrets**: External AI API keys (`GEMINI_API_KEY`, `OPENAI_API_KEY`) reside exclusively in server-side environment variables.
- **Vite Client Bundle Safety**: Zero API keys or internal secrets are bundled into client-side JavaScript.
- **Autonomous Fallback**: If external API credentials are unset or unreachable, the system executes deterministically in **Offline Demo Mode** without network exposure.

### D. Document Validation & Ingestion Limits
- **File Type Restrictions**: Allowed extensions strictly enforced (`.pdf`, `.txt`, `.md`).
- **File Size Caps**: 10 MB maximum upload limit prevents denial-of-service (DoS) memory exhaustion.
- **Safe PDF Parsing**: Uses `pdf-parse` with memory-buffer isolation and ASCII/printable stream normalization.

### E. Independent Deterministic Validation
- **Model Non-Certifying Principle**: An AI model is never allowed to certify its own output. 
- **Deterministic Assertions**: 12+ independent mathematical and string checks verify medication names, doses, units, frequencies, durations, and follow-up dates against raw source text.

---

## 3. Known Security Gaps for Production Healthcare Deployment

Prior to deploying CareBridge AI within live hospital networks (e.g. Epic, Cerner, Meditech EHRs), the following controls must be implemented:

1. **Enterprise Identity & Access Management (IAM)**:
   - Integration with hospital Single Sign-On (SAML 2.0 / OAuth2 / OIDC).
   - Role-Based Access Control (RBAC) separating Patient, Caregiver, Nurse, and Attending Physician permissions.
2. **End-to-End Encryption at Rest & in Transit**:
   - Compulsory TLS 1.3 in transit with HSTS preload.
   - AES-256 encryption at rest for any future persisted database storage.
3. **Audit Trails & Access Logging**:
   - HIPAA-compliant tamper-evident audit logs recording user access, timestamps, and document generation without exposing raw PHI in plaintext logs.
4. **Business Associate Agreements (BAA)**:
   - Executing formal BAAs with cloud hosting providers (e.g., AWS Healthcare, GCP Healthcare, Azure Health).

---

## 4. Vulnerability Reporting

If you discover a security vulnerability in CareBridge AI, please report it privately to the engineering team. Do not open public GitHub issues for security vulnerabilities.
