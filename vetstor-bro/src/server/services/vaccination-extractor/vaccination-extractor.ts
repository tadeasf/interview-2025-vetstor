/**
 * Main vaccination extractor - orchestrates the modular components
 */

import type { RawRecord, SectionsData, Vaccination } from "../../types";
import { PROCESSING_CONFIG, VACCINATION_PATTERN_SEEDS } from "./constants";
import type {
  ExtractionContext,
  ExtractionStats,
  LearnedPatternsData,
} from "./types";
import {
  extractRelevantText,
  normalizeVaccineName,
} from "./utils/normalization";
import {
  detectVaccinationContext,
  extractVaccineNamesAdvanced,
  learnFromData,
} from "./utils/pattern-learning";

export class VaccinationExtractor {
  private static context: ExtractionContext = {
    learnedPatterns: new Map(),
    vaccineNameFrequency: new Map(),
    contextPatterns: new Map(),
  };

  private static initialized = false;

  /**
   * Generate unique ID for vaccination record
   */
  private static generateId(animalId: number, visitId: number): string {
    return `${animalId}-${visitId}-${Date.now()}`;
  }

  /**
   * Initialize the extraction context by learning from all available data
   */
  static async initialize(allRecords?: RawRecord[]): Promise<void> {
    if (VaccinationExtractor.initialized) return;

    console.log("🔍 Initializing scalable vaccination extractor...");

    if (allRecords && allRecords.length > 0) {
      await learnFromData(allRecords, VaccinationExtractor.context);
    }

    VaccinationExtractor.initialized = true;
    console.log(
      `✅ Extractor initialized with ${VaccinationExtractor.context.learnedPatterns.size} learned patterns`,
    );
  }

  /**
   * Extract vaccination records using multiple data sources (billItems, sections, text)
   */
  static extractVaccinations(record: RawRecord): Vaccination[] {
    const vaccinations: Vaccination[] = [];

    // METHOD 1: Extract from billItems (newer format 2023-2025)
    const billItemVaccinations =
      VaccinationExtractor.extractFromBillItems(record);
    vaccinations.push(...billItemVaccinations);

    // METHOD 2: Extract from sections.terapie (older format 2004-2005)
    const terapieVaccinations = VaccinationExtractor.extractFromTerapie(record);
    vaccinations.push(...terapieVaccinations);

    // METHOD 3: Extract from report text (fallback method)
    if (vaccinations.length === 0) {
      const textVaccinations = VaccinationExtractor.extractFromText(record);
      vaccinations.push(...textVaccinations);
    }

    return vaccinations;
  }

  /**
   * Extract vaccinations from billItems (newer data format)
   */
  private static extractFromBillItems(record: RawRecord): Vaccination[] {
    const billItems = record.raw_record.billItems || [];
    const vaccinations: Vaccination[] = [];

    if (billItems.length === 0) return [];

    // Check if this is a vaccination visit - check both report and bill items
    const reportText = record.raw_record.report.toLowerCase();
    const hasVaccinationInReport = reportText.includes("vakcinac") || reportText.includes("název: vakcinace");
    const hasVaccinationInBillItems = billItems.some((item) =>
      (item as string).toLowerCase().includes("vakcinace"),
    );

    if (!hasVaccinationInReport && !hasVaccinationInBillItems) {
      return [];
    }

    // Enhanced vaccine product detection from bill items
    const vaccineItems = billItems.filter((item) => {
      const lowerItem = (item as string).toLowerCase();
      return (
        // Specific vaccine brands
        (lowerItem.includes("biocan") ||
          lowerItem.includes("nobivac") ||
          lowerItem.includes("canigen") ||
          lowerItem.includes("eurican") ||
          lowerItem.includes("tetradog") ||
          lowerItem.includes("biofel") ||
          lowerItem.includes("feligen") ||
          lowerItem.includes("versican") ||
          lowerItem.includes("purevax") ||
          lowerItem.includes("pestorin") ||
          // Vaccine types
          lowerItem.includes("dhppi") ||
          lowerItem.includes("dhpp") ||
          lowerItem.includes("crp") ||
          lowerItem.includes("pch") ||
          lowerItem.includes("tricat") ||
          lowerItem.includes("trio") ||
          lowerItem.includes("rabies") ||
          lowerItem.includes("l4") ||
          lowerItem.includes("mormyx") ||
          // Common patterns
          lowerItem.includes("dávka") ||
          lowerItem.includes("inj")) &&
        // Exclude non-vaccine items
        !lowerItem.includes("spotřební") &&
        !lowerItem.includes("materiál") &&
        !lowerItem.includes("klinické") &&
        !lowerItem.includes("vyšetření") &&
        !lowerItem.includes("generické") &&
        !lowerItem.includes("jídlo")
      );
    });

    vaccineItems.forEach((item, index) => {
      // Enhanced vaccine name cleaning
      let vaccineName = (item as string)
        .replace(/\s*\([^)]*\)\s*$/, "") // Remove product codes in parentheses
        .replace(/\s*\d+x?\d*\s*dávka.*$/i, "") // Remove dosage info
        .replace(/\s*\d+x?\d*ml.*$/i, "") // Remove volume info
        .replace(/\s*\d+x?\d*ds.*$/i, "") // Remove dose pack info
        .replace(/\s*inj\s*sic\s*$/i, "") // Remove 'inj sic'
        .replace(/\s*a\.u\.v\.\s*inj.*$/i, "") // Remove 'a.u.v. inj'
        .replace(/\s*lyofilizát.*$/i, "") // Remove 'lyofilizát a rozpouštědlo...'
        .replace(/\s*-\s*\d+\s*dávka.*$/i, "") // Remove '- 1 dávka'
        .replace(/\s*-\s*počet:.*$/i, "") // Remove '- počet: 1.00'
        .trim();

      // Further normalize common patterns
      vaccineName = vaccineName
        .replace(/dhppi\/l4r?/gi, "DHPPI/L4R")
        .replace(/dhppi\/l/gi, "DHPPI/L")
        .replace(/dhppi\+l4/gi, "DHPPI+L4")
        .replace(/novel\s+dhppi/gi, "Novel DHPPI")
        .replace(/tricat\s+trio/gi, "Tricat Trio")
        .replace(/plus\s+dhppi/gi, "Plus DHPPI");

      if (vaccineName.length > 3) {
        const context = `Název: ${reportText.includes("název:") ? reportText.match(/název:\s*([^\n]*)/i)?.[1] || "Vakcinace" : "Vakcinace"}\n\nVakcinační přípravky z faktury:\n${(billItems as string[]).join("\n")}\n\nZelný text zprávy:\n${record.raw_record.report}`;

        vaccinations.push({
          id:
            VaccinationExtractor.generateId(record.pet_id, record.visit_id) +
            `-bill-${index}`,
          animalId: record.pet_id,
          vaccineName: normalizeVaccineName(
            vaccineName,
            VaccinationExtractor.context,
          ),
          vaccinationDate: new Date(record.visit_date),
          sourceVisitId: record.visit_id,
          confidence: 0.95, // High confidence for bill items
          extractedText: context,
        });
      }
    });

    return vaccinations;
  }

  /**
   * Extract vaccinations from sections.terapie (older data format)
   */
  private static extractFromTerapie(record: RawRecord): Vaccination[] {
    const sections = record.raw_record.sections as SectionsData | null;
    const vaccinations: Vaccination[] = [];

    if (!sections?.terapie || !sections?.anamneza) return [];

    const anamneza = sections.anamneza.toLowerCase();
    const terapie = sections.terapie.toLowerCase();

    // Check if this is a vaccination record
    if (!anamneza.includes("očkov")) return [];

    // Extract vaccine names from terapie
    const vaccineKeywords = [
      "eurican",
      "nobivac",
      "biocan",
      "tetradog",
      "canigen",
      "dhppi",
      "cestal",
      "drontal",
    ];

    const foundVaccines = vaccineKeywords.filter((keyword) =>
      terapie.includes(keyword),
    );

    if (foundVaccines.length > 0) {
      foundVaccines.forEach((vaccine, index) => {
        const context = `Anamnéza: ${sections.anamneza}\nTerapie: ${sections.terapie}`;

        vaccinations.push({
          id:
            VaccinationExtractor.generateId(record.pet_id, record.visit_id) +
            `-terapie-${index}`,
          animalId: record.pet_id,
          vaccineName: normalizeVaccineName(
            vaccine,
            VaccinationExtractor.context,
          ),
          vaccinationDate: new Date(record.visit_date),
          sourceVisitId: record.visit_id,
          confidence: 0.8,
          extractedText: context,
        });
      });
    }

    return vaccinations;
  }

  /**
   * Extract vaccinations from report text (fallback method)
   */
  private static extractFromText(record: RawRecord): Vaccination[] {
    const vaccinations: Vaccination[] = [];
    const reportText = record.raw_record.report;
    const lowerText = reportText.toLowerCase();

    // Multi-stage detection approach
    const detectionResults = detectVaccinationContext(
      lowerText,
      VaccinationExtractor.context,
    );

    if (!detectionResults.isVaccination) {
      return vaccinations;
    }

    // Extract vaccine names using learned patterns and fuzzy matching
    const foundVaccines = extractVaccineNamesAdvanced(
      lowerText,
      VaccinationExtractor.context,
    );

    if (foundVaccines.length === 0) {
      // Create generic vaccination record with high confidence if context is strong
      const vaccination: Vaccination = {
        id: VaccinationExtractor.generateId(record.pet_id, record.visit_id),
        animalId: record.pet_id,
        vaccineName: "Nespecifikovaná vakcinace",
        vaccinationDate: new Date(record.visit_date),
        sourceVisitId: record.visit_id,
        confidence: detectionResults.confidence * 0.5, // Lower confidence for fallback
        extractedText: extractRelevantText(
          reportText,
          VACCINATION_PATTERN_SEEDS,
        ),
      };
      vaccinations.push(vaccination);
    } else {
      // Create vaccination records for each identified vaccine
      foundVaccines.forEach((vaccineInfo, index) => {
        const vaccination: Vaccination = {
          id:
            VaccinationExtractor.generateId(record.pet_id, record.visit_id) +
            `-text-${index}`,
          animalId: record.pet_id,
          vaccineName: normalizeVaccineName(
            vaccineInfo.name,
            VaccinationExtractor.context,
          ),
          vaccinationDate: new Date(record.visit_date),
          sourceVisitId: record.visit_id,
          confidence: Math.min(
            detectionResults.confidence + vaccineInfo.confidence,
            1.0,
          ),
          extractedText:
            vaccineInfo.context ||
            extractRelevantText(reportText, VACCINATION_PATTERN_SEEDS),
        };
        vaccinations.push(vaccination);
      });
    }

    return vaccinations;
  }

  /**
   * Batch process multiple records with learning
   */
  static async extractVaccinationsBatch(
    records: RawRecord[],
  ): Promise<Vaccination[]> {
    // Initialize with learning if not already done
    if (!VaccinationExtractor.initialized) {
      await VaccinationExtractor.initialize(records);
    }

    console.log(
      `🔄 Processing ${records.length} records for vaccination extraction...`,
    );

    const allVaccinations: Vaccination[] = [];
    let processedCount = 0;
    let vaccinationRecords = 0;

    // Process in chunks to avoid memory issues with large datasets
    for (let i = 0; i < records.length; i += PROCESSING_CONFIG.CHUNK_SIZE) {
      const chunk = records.slice(i, i + PROCESSING_CONFIG.CHUNK_SIZE);

      chunk.forEach((record) => {
        try {
          const vaccinations = VaccinationExtractor.extractVaccinations(record);
          if (vaccinations.length > 0) {
            allVaccinations.push(...vaccinations);
            vaccinationRecords++;
          }
          processedCount++;
        } catch (error) {
          console.error(
            `❌ Error processing record ${record.visit_id}:`,
            error,
          );
        }
      });

      // Show progress for large datasets
      if (
        records.length > 500 &&
        i % (PROCESSING_CONFIG.CHUNK_SIZE * 5) === 0
      ) {
        console.log(
          `📊 Progress: ${processedCount}/${records.length} records processed`,
        );
      }
    }

    console.log(
      `✅ Extraction complete: Found ${allVaccinations.length} vaccinations in ${vaccinationRecords} records`,
    );

    // Continuous learning: update patterns based on successful extractions
    VaccinationExtractor.updateLearningFromExtractions(allVaccinations);

    return allVaccinations;
  }

  /**
   * Update learning patterns based on successful extractions
   */
  private static updateLearningFromExtractions(
    extractions: Vaccination[],
  ): void {
    extractions.forEach((vaccination) => {
      // Increase frequency count for successfully extracted vaccine names
      const currentFreq =
        VaccinationExtractor.context.vaccineNameFrequency.get(
          vaccination.vaccineName.toLowerCase(),
        ) || 0;
      VaccinationExtractor.context.vaccineNameFrequency.set(
        vaccination.vaccineName.toLowerCase(),
        currentFreq + 1,
      );

      // Learn from extraction context
      if (vaccination.extractedText) {
        const words = vaccination.extractedText.toLowerCase().split(/\s+/);
        for (let i = 0; i < words.length - 2; i++) {
          const pattern = words.slice(i, i + 3).join(" ");
          if (pattern.length > 8 && pattern.length < 40) {
            const currentPatternFreq =
              VaccinationExtractor.context.contextPatterns.get(pattern) || 0;
            VaccinationExtractor.context.contextPatterns.set(
              pattern,
              currentPatternFreq + 1,
            );
          }
        }
      }
    });
  }

  /**
   * Get extraction statistics for monitoring
   */
  static getExtractionStats(): ExtractionStats {
    const topVaccines = Array.from(
      VaccinationExtractor.context.vaccineNameFrequency.entries(),
    )
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, frequency]) => ({ name, frequency }));

    return {
      learnedPatterns: VaccinationExtractor.context.learnedPatterns.size,
      vaccineNames: VaccinationExtractor.context.vaccineNameFrequency.size,
      contextPatterns: VaccinationExtractor.context.contextPatterns.size,
      topVaccines,
    };
  }

  /**
   * Export learned patterns for persistence
   */
  static exportLearnedPatterns(): LearnedPatternsData {
    return {
      vaccineNameFrequency: Object.fromEntries(
        VaccinationExtractor.context.vaccineNameFrequency,
      ),
      contextPatterns: Object.fromEntries(
        VaccinationExtractor.context.contextPatterns,
      ),
    };
  }

  /**
   * Import learned patterns from persistence
   */
  static importLearnedPatterns(data: LearnedPatternsData): void {
    VaccinationExtractor.context.vaccineNameFrequency = new Map(
      Object.entries(data.vaccineNameFrequency),
    );
    VaccinationExtractor.context.contextPatterns = new Map(
      Object.entries(data.contextPatterns),
    );
    VaccinationExtractor.initialized = true;
    console.log("📥 Imported learned patterns from persistence");
  }
}
