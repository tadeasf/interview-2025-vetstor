import { z } from "zod";
import { SupabaseService } from "../services/supabase";
import { VaccinationService } from "../services/vaccination-service";
import { publicProcedure, router } from "../trpc";

export const appRouter = router({
  // Health check endpoint
  health: publicProcedure.query(async () => {
    const isConnected = await SupabaseService.testConnection();
    const cacheStats = VaccinationService.getCacheStats();

    return {
      status: "ok",
      timestamp: new Date(),
      supabaseConnected: isConnected,
      cache: cacheStats,
    };
  }),

  // Get all animals with their latest vaccination date
  getAnimalsWithLatestVaccination: publicProcedure.query(async () => {
    return await VaccinationService.getAnimalsWithLatestVaccination();
  }),

  // Get vaccination history for a specific animal
  getAnimalVaccinationHistory: publicProcedure
    .input(
      z.object({
        animalId: z.number().int().positive(),
      }),
    )
    .query(async ({ input }) => {
      return await VaccinationService.getAnimalVaccinationHistory(
        input.animalId,
      );
    }),

  // Process all records (for admin/development use)
  processAllRecords: publicProcedure.mutation(async () => {
    return await VaccinationService.processAllRecords();
  }),

  // Clear cache (for admin/development use)
  clearCache: publicProcedure.mutation(() => {
    VaccinationService.clearCache();
    return { success: true, message: "Cache cleared successfully" };
  }),

  // Get cache statistics
  getCacheStats: publicProcedure.query(() => {
    return VaccinationService.getCacheStats();
  }),
});

// Export type definition of API
export type AppRouter = typeof appRouter;
