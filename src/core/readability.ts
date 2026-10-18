/**
 * Readability analysis for patient care instructions.
 * Evaluates text against the target ~Class 8 reading grade (Flesch-Kincaid ~7.0 - 8.5).
 */

export interface ReadabilityMetrics {
  fleschKincaidGradeLevel: number;
  readingEaseScore: number;
  targetGrade: string;
  isWithinTarget: boolean;
  notes: string;
  wordCount: number;
  sentenceCount: number;
  averageWordsPerSentence: number;
}

/**
 * Approximate syllable count for an English word
 */
function countSyllables(word: string): number {
  const clean = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return 0;
  if (clean.length <= 3) return 1;

  // Remove common trailing letters that don't add syllables
  const stripped = clean.replace(/(?:[^laeiouy]|ed|es|e)$/, '');
  const matches = stripped.match(/[aeiouy]{1,2}/g);
  return matches ? Math.max(1, matches.length) : 1;
}

/**
 * Calculates Flesch-Kincaid Grade Level and Reading Ease
 */
export function calculateReadability(text: string): ReadabilityMetrics {
  if (!text || text.trim().length === 0) {
    return {
      fleschKincaidGradeLevel: 8.0,
      readingEaseScore: 70,
      targetGrade: 'Class 8 (Ideal)',
      isWithinTarget: true,
      notes: 'No text provided.',
      wordCount: 0,
      sentenceCount: 0,
      averageWordsPerSentence: 0,
    };
  }

  // Split into sentences using punctuation (. ! ?)
  const sentences = text
    .split(/[.!?]+\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Split into words
  const words = text
    .split(/\s+/)
    .map(w => w.replace(/[^\w-]/g, ''))
    .filter(w => w.length > 0);
  const wordCount = Math.max(1, words.length);

  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }

  const wordsPerSentence = wordCount / sentenceCount;
  const syllablesPerWord = totalSyllables / wordCount;

  // Standard Flesch-Kincaid formula
  const rawGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const gradeLevel = Math.max(1, Math.min(16, parseFloat(rawGrade.toFixed(1))));

  // Flesch Reading Ease (0-100, higher is easier)
  const rawEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const readingEase = Math.max(0, Math.min(100, parseFloat(rawEase.toFixed(1))));

  // Target is Class 8 (~ Grade 6.5 to 8.5)
  const isWithinTarget = gradeLevel <= 8.5;

  let notes = '';
  if (gradeLevel <= 6.0) {
    notes = 'Elementary reading level (very easy to follow).';
  } else if (gradeLevel <= 8.5) {
    notes = 'Class 7-8 readability benchmark achieved: clear, short sentences.';
  } else {
    notes = 'Slightly above Class 8 readability. Consider shorter phrases.';
  }

  return {
    fleschKincaidGradeLevel: gradeLevel,
    readingEaseScore: readingEase,
    targetGrade: '~Class 8 Target',
    isWithinTarget,
    notes,
    wordCount,
    sentenceCount,
    averageWordsPerSentence: parseFloat(wordsPerSentence.toFixed(1)),
  };
}
