/**
 * Readability analysis for patient care instructions.
 * Evaluates text against the target ~Class 8 reading grade.
 * Uses Flesch-Kincaid for English, and an Indic Prose Clarity Index for Telugu.
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
  metricType: 'Flesch-Kincaid (English)' | 'Indic Prose Clarity Index (Telugu)';
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
 * Calculates language-appropriate readability score
 */
export function calculateReadability(text: string, language: 'en' | 'te' = 'en'): ReadabilityMetrics {
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
      metricType: language === 'te' ? 'Indic Prose Clarity Index (Telugu)' : 'Flesch-Kincaid (English)',
    };
  }

  // Split into sentences using punctuation (. ! ? and Telugu full stop / newline)
  const sentences = text
    .split(/[.!?।\r\n]+\s*/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  const sentenceCount = Math.max(1, sentences.length);

  // Split into words
  const words = text
    .split(/\s+/)
    .map(w => w.replace(/[^\w\u0C00-\u0C7F-]/g, ''))
    .filter(w => w.length > 0);
  const wordCount = Math.max(1, words.length);
  const wordsPerSentence = wordCount / sentenceCount;

  if (language === 'te') {
    // Specific Telugu Prose Clarity Index based on average sentence length and compound word length
    // Telugu is an agglutinative Dravidian language; short sentences (5-9 words) are key to Class 8 readability.
    const averageCharsPerWord = words.reduce((acc, w) => acc + w.length, 0) / wordCount;
    // Ideal range for Telugu patient instructions: 5-10 words/sentence, 4-7 characters/word
    const indicGrade = Math.max(5, Math.min(12, parseFloat((0.5 * wordsPerSentence + 0.4 * averageCharsPerWord).toFixed(1))));
    const isWithinTarget = indicGrade <= 8.5;

    let notes = '';
    if (wordsPerSentence <= 8) {
      notes = 'స్పష్టమైన సరళ వచన శైలి: వాక్యాలు చిన్నవిగా మరియు రోగులకు సులభంగా అర్థమయ్యేలా ఉన్నాయి.';
    } else {
      notes = 'వాక్యాలు సాధారణ సంభాషణ శైలిలో ఉన్నాయి.';
    }

    return {
      fleschKincaidGradeLevel: indicGrade,
      readingEaseScore: Math.round(100 - (indicGrade * 6)),
      targetGrade: '~Class 8 Telugu Target',
      isWithinTarget,
      notes,
      wordCount,
      sentenceCount,
      averageWordsPerSentence: parseFloat(wordsPerSentence.toFixed(1)),
      metricType: 'Indic Prose Clarity Index (Telugu)',
    };
  }

  // English Flesch-Kincaid formula
  let totalSyllables = 0;
  for (const word of words) {
    totalSyllables += countSyllables(word);
  }

  const syllablesPerWord = totalSyllables / wordCount;
  const rawGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;
  const gradeLevel = Math.max(1, Math.min(16, parseFloat(rawGrade.toFixed(1))));
  const rawEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;
  const readingEase = Math.max(0, Math.min(100, parseFloat(rawEase.toFixed(1))));

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
    metricType: 'Flesch-Kincaid (English)',
  };
}
