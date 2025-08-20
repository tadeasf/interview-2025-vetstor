/**
 * Types for vaccination extraction system
 */

export interface VaccinePattern {
  pattern: RegExp;
  confidence: number;
  category: string;
}

export interface ExtractionContext {
  learnedPatterns: Map<string, VaccinePattern>;
  vaccineNameFrequency: Map<string, number>;
  contextPatterns: Map<string, number>;
}

export interface VaccinationDetectionResult {
  isVaccination: boolean;
  confidence: number;
}

export interface FoundVaccine {
  name: string;
  confidence: number;
  context?: string;
}

export interface ExtractionStats {
  learnedPatterns: number;
  vaccineNames: number;
  contextPatterns: number;
  topVaccines: Array<{ name: string; frequency: number }>;
}

export interface LearnedPatternsData {
  vaccineNameFrequency: Record<string, number>;
  contextPatterns: Record<string, number>;
}

export interface ProcessingStats {
  totalRecords: number;
  totalVaccinations: number;
  processedAnimals: number;
}
