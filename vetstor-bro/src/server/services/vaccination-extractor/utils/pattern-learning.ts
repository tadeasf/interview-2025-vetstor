/**
 * Pattern learning utilities for dynamic vaccine extraction
 */

import type { RawRecord } from "../../../types";
import {
  COMPOUND_VACCINE_PATTERNS,
  PHARMA_COMPANIES,
  PROCESSING_CONFIG,
  VACCINATION_PATTERN_SEEDS,
  VACCINE_TYPE_PATTERNS,
} from "../constants";
import type {
  ExtractionContext,
  FoundVaccine,
  VaccinationDetectionResult,
} from "../types";
import {
  calculateSimilarity,
  extractContextAroundMatch,
  fuzzyMatch,
} from "./fuzzy-matching";

/**
 * Learn patterns from existing data to improve extraction
 */
export async function learnFromData(
  records: RawRecord[],
  context: ExtractionContext,
): Promise<void> {
  console.log(`📚 Learning from ${records.length} records...`);

  const vaccinationTexts: string[] = [];

  // First pass: identify potential vaccination records using seed patterns
  records.forEach((record) => {
    const text = record.raw_record.report.toLowerCase();
    const hasVaccinationPattern = VACCINATION_PATTERN_SEEDS.some((seed) =>
      text.includes(seed),
    );

    if (hasVaccinationPattern) {
      vaccinationTexts.push(text);
    }
  });

  console.log(
    `📊 Found ${vaccinationTexts.length} potential vaccination records`,
  );

  // Extract and learn vaccine name patterns
  learnVaccineNamePatterns(vaccinationTexts, context);
  learnContextPatterns(vaccinationTexts, context);

  console.log(
    `🧠 Learned ${context.vaccineNameFrequency.size} unique vaccine patterns`,
  );
}

/**
 * Learn vaccine name patterns from vaccination texts
 */
function learnVaccineNamePatterns(
  texts: string[],
  context: ExtractionContext,
): void {
  texts.forEach((text) => {
    // Extract pharmaceutical company patterns
    PHARMA_COMPANIES.forEach((company) => {
      const companyPattern = new RegExp(
        `\\b${company}[\\s\\-]?([\\w\\+\\/]+)`,
        "gi",
      );
      const matches = text.match(companyPattern);
      if (matches) {
        matches.forEach((match) => {
          const cleanMatch = match.toLowerCase().trim();
          context.vaccineNameFrequency.set(
            cleanMatch,
            (context.vaccineNameFrequency.get(cleanMatch) || 0) + 1,
          );
        });
      }
    });

    // Extract vaccine type patterns
    VACCINE_TYPE_PATTERNS.forEach((pattern) => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach((match) => {
          const cleanMatch = match.toLowerCase().trim();
          context.vaccineNameFrequency.set(
            cleanMatch,
            (context.vaccineNameFrequency.get(cleanMatch) || 0) + 1,
          );
        });
      }
    });

    // Extract capitalized words near vaccination terms (likely vaccine names)
    VACCINATION_PATTERN_SEEDS.forEach((seed) => {
      const vaccinePattern = new RegExp(
        `${seed}[\\s\\w]*?([A-Z][\\w\\+\\-\\/]+)`,
        "gi",
      );
      const matches = text.match(vaccinePattern);
      if (matches) {
        matches.forEach((match) => {
          const vaccineMatch = match.match(/[A-Z][\w+\-/]+/);
          if (vaccineMatch) {
            const cleanMatch = vaccineMatch[0].toLowerCase();
            context.vaccineNameFrequency.set(
              cleanMatch,
              (context.vaccineNameFrequency.get(cleanMatch) || 0) + 1,
            );
          }
        });
      }
    });
  });
}

/**
 * Learn context patterns around vaccinations
 */
function learnContextPatterns(
  texts: string[],
  context: ExtractionContext,
): void {
  texts.forEach((text) => {
    // Learn common phrases that indicate vaccination
    const sentences = text.split(/[.!?;]/);
    sentences.forEach((sentence) => {
      if (VACCINATION_PATTERN_SEEDS.some((seed) => sentence.includes(seed))) {
        // Extract 3-4 word patterns around vaccination terms
        const words = sentence.trim().split(/\s+/);
        for (let i = 0; i < words.length - 2; i++) {
          const pattern = words.slice(i, i + 3).join(" ");
          if (pattern.length > 10 && pattern.length < 50) {
            context.contextPatterns.set(
              pattern,
              (context.contextPatterns.get(pattern) || 0) + 1,
            );
          }
        }
      }
    });
  });
}

/**
 * Detect vaccination context using learned patterns and fuzzy matching
 */
export function detectVaccinationContext(
  text: string,
  context: ExtractionContext,
): VaccinationDetectionResult {
  let confidence = 0;
  let vaccinationIndicators = 0;

  // Check seed patterns with negative context filtering
  VACCINATION_PATTERN_SEEDS.forEach((seed) => {
    if (text.includes(seed)) {
      // Check for negative indicators around the vaccination term
      const negativeTerms = [
        "žádné",
        "žádná",
        "bez",
        "nebyla",
        "nebyl",
        "nebyly",
        "ne ",
        "not",
        "no ",
      ];
      const seedIndex = text.indexOf(seed);
      const contextBefore = text.substring(
        Math.max(0, seedIndex - 20),
        seedIndex,
      );
      const contextAfter = text.substring(
        seedIndex,
        Math.min(text.length, seedIndex + seed.length + 20),
      );

      const hasNegativeContext = negativeTerms.some(
        (neg) => contextBefore.includes(neg) || contextAfter.includes(neg),
      );

      if (!hasNegativeContext) {
        vaccinationIndicators++;
        confidence += 0.3;
      }
    }
  });

  // Check learned context patterns
  for (const [pattern, frequency] of context.contextPatterns.entries()) {
    if (
      frequency >= PROCESSING_CONFIG.MIN_CONTEXT_FREQUENCY &&
      text.includes(pattern)
    ) {
      vaccinationIndicators++;
      confidence += 0.2;
    }
  }

  // Fuzzy matching for common vaccination terms with typos
  const fuzzyTerms = ["vakcinace", "očkování", "imunizace", "injection"];
  fuzzyTerms.forEach((term) => {
    if (fuzzyMatch(text, term, PROCESSING_CONFIG.FUZZY_MATCH_THRESHOLD)) {
      vaccinationIndicators++;
      confidence += 0.25;
    }
  });

  return {
    isVaccination: vaccinationIndicators > 0,
    confidence: Math.min(confidence, PROCESSING_CONFIG.CONFIDENCE_CAP),
  };
}

/**
 * Advanced vaccine name extraction using learned patterns and fuzzy matching
 */
export function extractVaccineNamesAdvanced(
  text: string,
  context: ExtractionContext,
): FoundVaccine[] {
  const foundVaccines: FoundVaccine[] = [];

  // Extract using learned patterns with frequency analysis
  for (const [
    vaccineName,
    frequency,
  ] of context.vaccineNameFrequency.entries()) {
    if (frequency >= PROCESSING_CONFIG.MIN_PATTERN_FREQUENCY) {
      const exactMatch = text.includes(vaccineName);
      const fuzzyMatchResult = fuzzyMatch(
        text,
        vaccineName,
        PROCESSING_CONFIG.FUZZY_VACCINE_THRESHOLD,
      );

      if (exactMatch || fuzzyMatchResult) {
        const confidence = exactMatch ? 0.9 : 0.7;
        const normalizedConfidence = Math.min(
          confidence * (frequency / 10),
          PROCESSING_CONFIG.CONFIDENCE_CAP,
        );

        foundVaccines.push({
          name: vaccineName,
          confidence: normalizedConfidence,
          context: extractContextAroundMatch(text, vaccineName),
        });
      }
    }
  }

  // Extract using regex patterns for compound vaccines
  COMPOUND_VACCINE_PATTERNS.forEach(({ pattern, confidence }) => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach((match) => {
        const cleanMatch = match.toLowerCase().trim();
        if (!foundVaccines.some((v) => v.name === cleanMatch)) {
          foundVaccines.push({
            name: cleanMatch,
            confidence,
            context: extractContextAroundMatch(text, match),
          });
        }
      });
    }
  });

  // Remove duplicates and sort by confidence
  const uniqueVaccines = removeDuplicateVaccines(foundVaccines);
  return uniqueVaccines.sort((a, b) => b.confidence - a.confidence);
}

/**
 * Remove duplicate vaccines based on similarity
 */
function removeDuplicateVaccines(vaccines: FoundVaccine[]): FoundVaccine[] {
  const unique: FoundVaccine[] = [];

  vaccines.forEach((vaccine) => {
    const isDuplicate = unique.some(
      (existing) =>
        calculateSimilarity(existing.name, vaccine.name) >
        PROCESSING_CONFIG.SIMILARITY_THRESHOLD,
    );

    if (!isDuplicate) {
      unique.push(vaccine);
    } else {
      // Update existing with higher confidence
      const existingIndex = unique.findIndex(
        (existing) =>
          calculateSimilarity(existing.name, vaccine.name) >
          PROCESSING_CONFIG.SIMILARITY_THRESHOLD,
      );
      if (
        existingIndex !== -1 &&
        vaccine.confidence > unique[existingIndex].confidence
      ) {
        unique[existingIndex] = vaccine;
      }
    }
  });

  return unique;
}
