/**
 * Vaccine name normalization utilities
 */

import { BRAND_PATTERNS, VACCINE_NORMALIZATION_MAP } from "../constants";
import type { ExtractionContext } from "../types";
import { calculateSimilarity } from "./fuzzy-matching";

/**
 * Advanced vaccine name normalization with learned patterns
 */
export function normalizeVaccineName(
  name: string,
  context: ExtractionContext,
): string {
  const lowerName = name.toLowerCase().trim();

  // Check exact matches first
  if (VACCINE_NORMALIZATION_MAP[lowerName]) {
    return VACCINE_NORMALIZATION_MAP[lowerName];
  }

  // Handle compound names with brand + type
  for (const { brand, display } of BRAND_PATTERNS) {
    if (lowerName.includes(brand)) {
      const typesPart = lowerName.replace(brand, "").trim();
      const normalizedType =
        VACCINE_NORMALIZATION_MAP[typesPart] || capitalizeFirst(typesPart);
      return `${display} ${normalizedType}`.trim();
    }
  }

  // Use frequency data to normalize high-confidence learned patterns
  const highFrequencyPattern = Array.from(
    context.vaccineNameFrequency.entries(),
  ).find(
    ([pattern, freq]) =>
      freq >= 5 && calculateSimilarity(pattern, lowerName) > 0.9,
  );

  if (highFrequencyPattern) {
    return capitalizeFirst(highFrequencyPattern[0]);
  }

  // Fallback to basic capitalization
  return capitalizeFirst(name);
}

/**
 * Utility function to capitalize first letter
 */
export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Extract relevant text snippet for context
 */
export function extractRelevantText(
  text: string,
  vaccinationTerms: string[],
): string {
  // Find the most relevant sentence containing vaccination information
  const sentences = text.split(/[.!?]/);
  const vaccinationSentence = sentences.find((sentence) =>
    vaccinationTerms.some((term: string) =>
      sentence.toLowerCase().includes(term),
    ),
  );

  if (vaccinationSentence) {
    return vaccinationSentence.trim();
  }

  // If no specific sentence found, return first 100 characters
  return text.substring(0, 100) + (text.length > 100 ? "..." : "");
}
