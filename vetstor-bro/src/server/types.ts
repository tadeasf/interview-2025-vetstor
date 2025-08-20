import { z } from "zod";

// Raw data types from Supabase
export const RawRecordSchema = z.object({
  user_id: z.number(),
  visit_id: z.number(),
  pet_id: z.number(),
  visit_date: z.string(),
  raw_record: z.object({
    report: z.string(),
    sections: z.record(z.string(), z.string()).nullable().optional(),
    billItems: z.array(z.string()).optional(),
  }),
});

export type RawRecord = z.infer<typeof RawRecordSchema>;

// Processed vaccination data types
export const VaccinationSchema = z.object({
  id: z.string(),
  animalId: z.number(),
  vaccineName: z.string(),
  vaccinationDate: z.date(),
  sourceVisitId: z.number(),
  confidence: z.number().min(0).max(1),
  extractedText: z.string(),
});

export type Vaccination = z.infer<typeof VaccinationSchema>;

// API response types
export const AnimalWithLatestVaccinationSchema = z.object({
  animalId: z.number(),
  latestVaccinationDate: z.date().nullable(),
  latestVaccineName: z.string().nullable(),
  totalVaccinations: z.number(),
});

export type AnimalWithLatestVaccination = z.infer<
  typeof AnimalWithLatestVaccinationSchema
>;

export const AnimalVaccinationHistorySchema = z.object({
  animalId: z.number(),
  vaccinations: z.array(VaccinationSchema),
});

export type AnimalVaccinationHistory = z.infer<
  typeof AnimalVaccinationHistorySchema
>;

// Client-side types (after JSON serialization - dates become strings)
export type VaccinationClient = Omit<Vaccination, "vaccinationDate"> & {
  vaccinationDate: string;
};

export type AnimalWithLatestVaccinationClient = Omit<
  AnimalWithLatestVaccination,
  "latestVaccinationDate"
> & {
  latestVaccinationDate: string | null;
};

export type AnimalVaccinationHistoryClient = Omit<
  AnimalVaccinationHistory,
  "vaccinations"
> & {
  vaccinations: VaccinationClient[];
};

// Additional helper types for sections data
export interface SectionsData {
  anamneza?: string;
  terapie?: string;
  [key: string]: string | undefined;
}
