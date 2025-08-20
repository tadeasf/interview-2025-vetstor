/**
 * Tests for fuzzy matching utilities
 */

import {
  calculateSimilarity,
  extractContextAroundMatch,
  fuzzyMatch,
} from "../utils/fuzzy-matching";

describe("Fuzzy Matching Utilities", () => {
  describe("calculateSimilarity", () => {
    test("should return 1 for identical strings", () => {
      expect(calculateSimilarity("vakcinace", "vakcinace")).toBe(1);
    });

    test("should return 0 for completely different strings", () => {
      expect(calculateSimilarity("vakcinace", "xyz")).toBeLessThan(0.3);
    });

    test("should handle typos well", () => {
      expect(calculateSimilarity("vakcinace", "vakcinac")).toBeGreaterThan(0.8);
      expect(calculateSimilarity("nobivac", "nobivac")).toBe(1);
      expect(calculateSimilarity("nobivac", "nobivak")).toBeGreaterThan(0.8);
    });

    test("should handle different lengths", () => {
      expect(calculateSimilarity("dhppi", "dhppil4")).toBeGreaterThan(0.6);
      expect(calculateSimilarity("trio", "tricat")).toBeGreaterThan(0.4);
    });

    test("should handle empty strings", () => {
      expect(calculateSimilarity("", "")).toBe(1);
      expect(calculateSimilarity("test", "")).toBe(0);
      expect(calculateSimilarity("", "test")).toBe(0);
    });
  });

  describe("fuzzyMatch", () => {
    test("should find exact matches", () => {
      const text = "pes dostal vakcinaci nobivac trio";
      expect(fuzzyMatch(text, "vakcinaci", 0.8)).toBe(true);
      expect(fuzzyMatch(text, "nobivac", 0.8)).toBe(true);
    });

    test("should find matches with typos", () => {
      const text = "pes dostal vakcnaci nobivak trio";
      expect(fuzzyMatch(text, "vakcinaci", 0.8)).toBe(true);
      expect(fuzzyMatch(text, "nobivac", 0.8)).toBe(true);
    });

    test("should not match unrelated words", () => {
      const text = "pes dostal jídlo a vodu";
      expect(fuzzyMatch(text, "vakcinace", 0.8)).toBe(false);
      expect(fuzzyMatch(text, "nobivac", 0.8)).toBe(false);
    });

    test("should respect threshold", () => {
      const text = "pes dostal xyz";
      expect(fuzzyMatch(text, "vakcinace", 0.9)).toBe(false);
      expect(fuzzyMatch(text, "vakcinace", 1.0)).toBe(false); // max threshold shouldn't match unrelated text
    });
  });

  describe("extractContextAroundMatch", () => {
    test("should extract context around match", () => {
      const text =
        "Dnes bylo psovi aplikováno vakcinace nobivac trio podle protokolu.";
      const context = extractContextAroundMatch(text, "vakcinace");
      expect(context).toContain("vakcinace");
      expect(context).toContain("aplikováno");
      expect(context).toContain("nobivac");
    });

    test("should handle match not found", () => {
      const text = "Pes dostal jídlo";
      const context = extractContextAroundMatch(text, "vakcinace");
      expect(context).toBe("");
    });

    test("should handle short text", () => {
      const text = "vakcinace";
      const context = extractContextAroundMatch(text, "vakcinace");
      expect(context).toBe("vakcinace");
    });

    test("should limit context length", () => {
      const longText = `${"A".repeat(100)}vakcinace${"B".repeat(100)}`;
      const context = extractContextAroundMatch(longText, "vakcinace");
      expect(context.length).toBeLessThan(80); // 30 chars before + match + 30 chars after
    });
  });
});
