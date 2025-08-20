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

    // Get unique animal IDs from cache
    const animalIds = Array.from(VaccinationService.vaccinationCache.keys());

    animalIds.forEach((animalId) => {
      const vaccinations =
        VaccinationService.vaccinationCache.get(animalId) || [];
      const sortedVaccinations = vaccinations.sort(
        (a, b) =>
          new Date(b.vaccinationDate).getTime() -
          new Date(a.vaccinationDate).getTime(),
      );

      const latest = sortedVaccinations[0];

      animals.push({
        animalId,
        latestVaccinationDate: latest ? latest.vaccinationDate : null,
        latestVaccineName: latest ? latest.vaccineName : null,
        totalVaccinations: vaccinations.length,
      });
    });

    return animals.sort((a, b) => a.animalId - b.animalId);
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

    const vaccinations =
      VaccinationService.vaccinationCache.get(animalId) || [];
    const sortedVaccinations = vaccinations.sort(
      (a, b) =>
        new Date(b.vaccinationDate).getTime() -
        new Date(a.vaccinationDate).getTime(),
    );

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
