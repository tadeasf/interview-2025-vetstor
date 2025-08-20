/**
 * Tests for vaccine name normalization
 */

import type { ExtractionContext } from "../types";
import {
  capitalizeFirst,
  extractRelevantText,
  normalizeVaccineName,
} from "../utils/normalization";

describe("Normalization Utilities", () => {
  let mockContext: ExtractionContext;

  beforeEach(() => {
    mockContext = {
      learnedPatterns: new Map(),
      vaccineNameFrequency: new Map([
        ["nobivac trio", 10],
        ["biocan dhppi", 8],
        ["custom vaccine", 6],
      ]),
      contextPatterns: new Map(),
    };
  });

  describe("normalizeVaccineName", () => {
    test("should normalize basic vaccine types", () => {
      expect(normalizeVaccineName("tricat", mockContext)).toBe("Tricat");
      expect(normalizeVaccineName("rabies", mockContext)).toBe("Rabies");
      expect(normalizeVaccineName("dhppi", mockContext)).toBe("DHPPI");
    });

    test("should normalize compound vaccines", () => {
      expect(normalizeVaccineName("dhppi+l4", mockContext)).toBe("DHPPI+L4");
      expect(normalizeVaccineName("dhppi/l4", mockContext)).toBe("DHPPI+L4");
      expect(normalizeVaccineName("nobivac dhppi+l4", mockContext)).toBe(
        "Nobivac DHPPI+L4",
      );
    });

    test("should handle brand combinations", () => {
      expect(normalizeVaccineName("nobivac trio", mockContext)).toBe(
        "Nobivac Trio",
      );
      expect(normalizeVaccineName("biocan novel", mockContext)).toBe(
        "Biocan Novel",
      );
      expect(normalizeVaccineName("canigen ddppi", mockContext)).toBe(
        "Canigen DDPPI",
      );
    });

    test("should handle brand + type separation", () => {
      expect(normalizeVaccineName("nobivac dhppi", mockContext)).toBe(
        "Nobivac DHPPI",
      );
      expect(normalizeVaccineName("biocan l4", mockContext)).toBe(
        "Biocan Leptospira L4",
      );
    });

    test("should use learned patterns for high-frequency vaccines", () => {
      // Custom vaccine with high frequency should be used
      expect(normalizeVaccineName("custom vaccine", mockContext)).toBe(
        "Custom vaccine",
      );
    });

    test("should fallback to capitalization for unknown vaccines", () => {
      expect(normalizeVaccineName("unknown vaccine", mockContext)).toBe(
        "Unknown vaccine",
      );
      expect(normalizeVaccineName("test-123", mockContext)).toBe("Test-123");
    });
  });

  describe("capitalizeFirst", () => {
    test("should capitalize first letter", () => {
      expect(capitalizeFirst("test")).toBe("Test");
      expect(capitalizeFirst("nobivac")).toBe("Nobivac");
      expect(capitalizeFirst("TEST")).toBe("TEST");
    });

    test("should handle empty string", () => {
      expect(capitalizeFirst("")).toBe("");
    });

    test("should handle single character", () => {
      expect(capitalizeFirst("a")).toBe("A");
    });
  });

  describe("extractRelevantText", () => {
    const vaccinationTerms = ["vakcinac", "očkován", "vakcinov"];

    test("should extract sentence containing vaccination terms", () => {
      const text =
        "Pes je zdravý. Dnes byla provedena vakcinace nobivac trio. Kontrola za týden.";
      const result = extractRelevantText(text, vaccinationTerms);
      expect(result).toContain("vakcinace nobivac trio");
    });

    test("should handle multiple sentences with vaccination terms", () => {
      const text =
        "Vakcinace byla úspěšná. Pes dostal očkování proti vzteklině.";
      const result = extractRelevantText(text, vaccinationTerms);
      expect(result).toMatch(/(vakcinace|očkování)/i); // case insensitive
    });

    test("should fallback to text truncation when no vaccination terms found", () => {
      const text = `${"A".repeat(150)} bez vakcinace`;
      const result = extractRelevantText(text, vaccinationTerms);
      expect(result.length).toBeGreaterThan(100); // Should include the vaccination term found
      expect(result).toContain("vakcinace");
    });

    test("should handle short text without vaccination terms", () => {
      const text = "Krátký text";
      const result = extractRelevantText(text, vaccinationTerms);
      expect(result).toBe("Krátký text");
    });

    test("should handle text exactly 100 characters", () => {
      const text = "A".repeat(100);
      const result = extractRelevantText(text, vaccinationTerms);
      expect(result).toBe(text);
      expect(result).not.toContain("...");
    });
  });
});
