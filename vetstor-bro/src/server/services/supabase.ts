import { createClient } from "@supabase/supabase-js";
import { type RawRecord, RawRecordSchema } from "../types";

const supabaseUrl = "https://vmmbjfycdefakulnyzhl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZtbWJqZnljZGVmYWt1bG55emhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1OTQ3NDAsImV4cCI6MjA3MTE3MDc0MH0.GrkUW60Hm4vj68zazse1H1GIyg9A-hNx5CPYHpmM_nE";

export const supabase = createClient(supabaseUrl, supabaseKey);

export class SupabaseService {
  /**
   * Fetch all raw records from the database
   */
  static async getAllRawRecords(): Promise<RawRecord[]> {
    try {
      const { data, error } = await supabase.from("raw_records").select("*");

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Validate and parse the data
      const validatedRecords = data
        .map((record) => {
          try {
            return RawRecordSchema.parse(record);
          } catch (validationError) {
            console.warn(
              `Invalid record format for visit_id ${record.visit_id}:`,
              validationError,
            );
            return null;
          }
        })
        .filter((record): record is RawRecord => record !== null);

      return validatedRecords;
    } catch (error) {
      console.error("Error fetching raw records:", error);
      throw error;
    }
  }

  /**
   * Fetch raw records for specific animal IDs
   */
  static async getRawRecordsByAnimalIds(
    animalIds: number[],
  ): Promise<RawRecord[]> {
    try {
      const { data, error } = await supabase
        .from("raw_records")
        .select("*")
        .in("pet_id", animalIds);

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Validate and parse the data
      const validatedRecords = data
        .map((record) => {
          try {
            return RawRecordSchema.parse(record);
          } catch (validationError) {
            console.warn(
              `Invalid record format for visit_id ${record.visit_id}:`,
              validationError,
            );
            return null;
          }
        })
        .filter((record): record is RawRecord => record !== null);

      return validatedRecords;
    } catch (error) {
      console.error("Error fetching raw records by animal IDs:", error);
      throw error;
    }
  }

  /**
   * Fetch raw records for a specific animal
   */
  static async getRawRecordsByAnimalId(animalId: number): Promise<RawRecord[]> {
    try {
      const { data, error } = await supabase
        .from("raw_records")
        .select("*")
        .eq("pet_id", animalId)
        .order("visit_date", { ascending: true });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Validate and parse the data
      const validatedRecords = data
        .map((record) => {
          try {
            return RawRecordSchema.parse(record);
          } catch (validationError) {
            console.warn(
              `Invalid record format for visit_id ${record.visit_id}:`,
              validationError,
            );
            return null;
          }
        })
        .filter((record): record is RawRecord => record !== null);

      return validatedRecords;
    } catch (error) {
      console.error(
        `Error fetching raw records for animal ${animalId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get unique animal IDs from the database
   */
  static async getUniqueAnimalIds(): Promise<number[]> {
    try {
      const { data, error } = await supabase
        .from("raw_records")
        .select("pet_id")
        .order("pet_id", { ascending: true });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      if (!data) {
        return [];
      }

      // Extract unique animal IDs
      const uniqueIds = [...new Set(data.map((record) => record.pet_id))];
      return uniqueIds;
    } catch (error) {
      console.error("Error fetching unique animal IDs:", error);
      throw error;
    }
  }

  /**
   * Test connection to Supabase
   */
  static async testConnection(): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("raw_records")
        .select("visit_id")
        .limit(1);

      return !error;
    } catch (error) {
      console.error("Supabase connection test failed:", error);
      return false;
    }
  }
}
