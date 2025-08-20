/**
 * Vaccination service - Handles vaccination data processing and caching
 */

import type {
  AnimalVaccinationHistory,
  AnimalWithLatestVaccination,
  Vaccination,
} from "../types";
import { SupabaseService } from "./supabase";
import { VaccinationExtractor } from "./vaccination-extractor";

interface CacheStats {
  totalAnimals: number;
  totalVaccinations: number;
  cacheSize: number;
  lastProcessed?: Date;
}

interface ProcessingResult {
  totalRecords: number;
  totalVaccinations: number;
  processedAnimals: number;
  processingTime: number;
}

export class VaccinationService {
  private static vaccinationCache = new Map<number, Vaccination[]>();
  private static lastProcessedTime?: Date;
  private static initialized = false;

  /**
   * Get all animals with their latest vaccination information
   */
  static async getAnimalsWithLatestVaccination(): Promise<
    AnimalWithLatestVaccination[]
  > {
    if (!VaccinationService.initialized) {
      await VaccinationService.initialize();
    }

    const animals: AnimalWithLatestVaccination[] = [];

    // Get ALL unique animal IDs from raw records, not just those with vaccinations
    const rawRecords = await SupabaseService.getAllRawRecords();
    const allAnimalIds = [
      ...new Set(rawRecords.map((record) => record.pet_id)),
    ].sort((a, b) => a - b);

    allAnimalIds.forEach((animalId) => {
      const allVaccinations =
        VaccinationService.vaccinationCache.get(animalId) || [];

      // With unreliable text extraction removed, all vaccinations should be high-confidence
      // Keep filter as safety measure for any future low-confidence sources
      const highConfidenceVaccinations = allVaccinations.filter(
        (v) => v.confidence >= 0.7,
      );

      const sortedVaccinations = highConfidenceVaccinations.sort(
        (a, b) =>
          new Date(b.vaccinationDate).getTime() -
          new Date(a.vaccinationDate).getTime(),
      );

      const latest = sortedVaccinations[0];

      animals.push({
        animalId,
        latestVaccinationDate: latest ? latest.vaccinationDate : null,
        latestVaccineName: latest ? latest.vaccineName : null,
        totalVaccinations: highConfidenceVaccinations.length,
      });
    });

    return animals; // Already sorted by animalId when we created allAnimalIds
  }

  /**
   * Get vaccination history for a specific animal
   */
  static async getAnimalVaccinationHistory(
    animalId: number,
  ): Promise<AnimalVaccinationHistory> {
    if (!VaccinationService.initialized) {
      await VaccinationService.initialize();
    }

    const allVaccinations =
      VaccinationService.vaccinationCache.get(animalId) || [];

    // Sort by date (newest first) and then by confidence (highest first)
    const sortedVaccinations = allVaccinations.sort((a, b) => {
      const dateComparison =
        new Date(b.vaccinationDate).getTime() -
        new Date(a.vaccinationDate).getTime();
      if (dateComparison !== 0) return dateComparison;
      return b.confidence - a.confidence;
    });

    return {
      animalId,
      vaccinations: sortedVaccinations,
    };
  }

  /**
   * Get vaccinations for a specific animal (internal helper)
   */
  static getVaccinationsForAnimal(animalId: number): Vaccination[] {
    return VaccinationService.vaccinationCache.get(animalId) || [];
  }

  /**
   * Process all records from the database
   */
  static async processAllRecords(): Promise<ProcessingResult> {
    const startTime = Date.now();

    console.log("🔄 Starting vaccination data processing...");

    // Get all raw records
    const rawRecords = await SupabaseService.getAllRawRecords();
    console.log(`📊 Retrieved ${rawRecords.length} raw records from database`);

    // Process with vaccination extractor
    const vaccinations =
      await VaccinationExtractor.extractVaccinationsBatch(rawRecords);

    // Clear and rebuild cache
    VaccinationService.vaccinationCache.clear();

    // Group by animal ID
    vaccinations.forEach((vaccination) => {
      const existing =
        VaccinationService.vaccinationCache.get(vaccination.animalId) || [];
      existing.push(vaccination);
      VaccinationService.vaccinationCache.set(vaccination.animalId, existing);
    });

    VaccinationService.lastProcessedTime = new Date();
    VaccinationService.initialized = true;

    const processingTime = Date.now() - startTime;
    const processedAnimals = VaccinationService.vaccinationCache.size;

    console.log(`✅ Processing complete in ${processingTime}ms`);
    console.log(
      `📈 Found ${vaccinations.length} vaccinations for ${processedAnimals} animals`,
    );

    return {
      totalRecords: rawRecords.length,
      totalVaccinations: vaccinations.length,
      processedAnimals,
      processingTime,
    };
  }

  /**
   * Initialize the service by processing data if not already done
   */
  private static async initialize(): Promise<void> {
    if (VaccinationService.initialized) return;

    console.log("🚀 Initializing VaccinationService...");
    await VaccinationService.processAllRecords();
  }

  /**
   * Clear the vaccination cache
   */
  static clearCache(): void {
    VaccinationService.vaccinationCache.clear();
    VaccinationService.lastProcessedTime = undefined;
    VaccinationService.initialized = false;
    console.log("🗑️ Vaccination cache cleared");
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): CacheStats {
    const totalVaccinations = Array.from(
      VaccinationService.vaccinationCache.values(),
    ).reduce((sum, vaccinations) => sum + vaccinations.length, 0);

    return {
      totalAnimals: VaccinationService.vaccinationCache.size,
      totalVaccinations,
      cacheSize: VaccinationService.vaccinationCache.size,
      lastProcessed: VaccinationService.lastProcessedTime,
    };
  }
}
