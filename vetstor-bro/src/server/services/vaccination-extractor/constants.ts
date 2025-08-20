/**
 * Constants and patterns for vaccination extraction
 */

// Base vaccination terms - these are just seed patterns
export const VACCINATION_PATTERN_SEEDS = [
  "vakcinac",
  "očkován",
  "vakcinov",
  "imunizac",
  "inject",
  "aplikac",
];

// Known pharmaceutical companies for vaccine name detection
export const PHARMA_COMPANIES = [
  "nobivac",
  "biocan",
  "canigen",
  "feligen",
  "biofel",
  "versican",
  "purevax",
  "pestorin",
  "eurican",
  "tetradog",
  "merial",
  "virbac",
  "pfizer",
  "msd",
  "bioveta", // Czech manufacturer
  "biomune", // Additional brand
  "galaxy", // Vaccine series
  "fel-o-vax", // Feline vaccines
  "duramune", // Canine vaccines
  "recombitek", // Combination vaccines
  "vanguard", // Protection series
  "spectra", // Broad spectrum
];

// Common vaccine type patterns
export const VACCINE_TYPE_PATTERNS = [
  /\b(dhpp?i?[+/]?l?4?r?)\b/gi, // Extended to include R (rabies)
  /\b(rabies|vzteklina|lyssa)\b/gi, // Added lyssa
  /\b(trio|tricat|tetracat)\b/gi, // Added tetracat
  /\b(puppy|štěňátka|junior)\b/gi, // Added junior
  /\b(parvo|distemper|parvovir)\b/gi, // Added parvovir
  /\b(hepatitis|adenovir|cav)\b/gi, // Added CAV
  /\b(parainfluenza|pi)\b/gi, // Added PI abbreviation
  /\b(leptospira|l4|lepto)\b/gi, // Added lepto
  /\b(bordetella|kennel\s*cough|bb)\b/gi, // Added BB abbreviation
  /\b(calici|fvr|fcv)\b/gi, // Feline vaccines
  /\b(panleuko|felv|fiv)\b/gi, // More feline vaccines
  /\b(corona|cpv)\b/gi, // Corona and CPV
  /\b(bivalent|multivalent)\b/gi, // Vaccine types
];

// Enhanced normalization map with brand + type combinations
export const VACCINE_NORMALIZATION_MAP: Record<string, string> = {
  // Basic vaccine types
  tricat: "Tricat",
  trio: "Trio",
  dhppi: "DHPPI",
  dhpp: "DHPP",
  dhppil4: "DHPPI+L4",
  "dhppi+l4": "DHPPI+L4",
  "dhppi/l4": "DHPPI+L4",
  "dhppi/l4r": "DHPPI+L4R",
  rabies: "Rabies",
  vzteklina: "Vzteklina (Rabies)",
  puppy: "Puppy",
  štěňátka: "Štěňátka (Puppy)",
  l4: "Leptospira L4",
  ddppi: "DDPPI",
  crp: "CRP",
  pch: "PCH",
  mormyx: "Mormyx",

  // Brand combinations - Nobivac
  "nobivac trio": "Nobivac Trio",
  "nobivac tricat trio": "Nobivac Tricat Trio",
  "nobivac dhppi": "Nobivac DHPPI",
  "nobivac dhpp": "Nobivac DHPP",
  "nobivac dhppi+l4": "Nobivac DHPPI+L4",
  "nobivac dhppil4": "Nobivac DHPPI+L4",
  "nobivac l4": "Nobivac L4",
  "nobivac rabies": "Nobivac Rabies",
  "nobivac rl": "Nobivac RL",
  "nobivac dp plus": "Nobivac DP Plus",

  // Brand combinations - Biocan
  "biocan novel": "Biocan Novel",
  "biocan novel dhppi": "Biocan Novel DHPPI",
  "biocan novel dhppi/l4": "Biocan Novel DHPPI/L4",
  "biocan novel dhppi/l4r": "Biocan Novel DHPPI/L4R",
  "biocan novel pi/l4": "Biocan Novel Pi/L4",
  "biocan dhppi": "Biocan DHPPI",
  "biocan dhppi/l4": "Biocan DHPPI/L4",
  "biocan l": "Biocan L",
  "biocan t": "Biocan T",

  // Brand combinations - Canigen
  "canigen ddppi": "Canigen DDPPI",
  "canigen ddppi/l": "Canigen DDPPI/L",
  "canigen dhppi": "Canigen DHPPI",
  "canigen dhppi/l": "Canigen DHPPI/L",

  // Brand combinations - Feligen & Biofel
  "feligen crp": "Feligen CRP",
  "biofel pch": "Biofel PCH",

  // Brand combinations - Others
  "versican plus dhppi": "Versican Plus DHPPI",
  "versican plus dhppi/l4": "Versican Plus DHPPI/L4",
  "versican plus dhppi/l4r": "Versican Plus DHPPI/L4R",
  "purevax rcpch felv": "Purevax RCPCh FeLV",
  "pestorin mormyx": "Pestorin Mormyx",

  // Additional vaccine types
  tetracat: "Tetracat",
  lyssa: "Lyssa (Rabies)",
  lepto: "Leptospira",
  pi: "Parainfluenza",
  cav: "Canine Adenovirus",
  bb: "Bordetella",
  fcv: "Feline Calicivirus",
  fvr: "Feline Viral Rhinotracheitis",
  felv: "Feline Leukemia",
  fiv: "Feline Immunodeficiency",
  panleuko: "Panleukopenia",
  cpv: "Canine Parvovirus",

  // New brand combinations
  "bioveta dhppi": "Bioveta DHPPI",
  "galaxy dhpp": "Galaxy DHPP",
  "duramune dhpp": "Duramune DHPP",
  "vanguard plus": "Vanguard Plus",
  "recombitek c4": "Recombitek C4",
};

// Brand patterns for compound names
export const BRAND_PATTERNS = [
  { brand: "nobivac", display: "Nobivac" },
  { brand: "biocan", display: "Biocan" },
  { brand: "canigen", display: "Canigen" },
  { brand: "feligen", display: "Feligen" },
  { brand: "merial", display: "Merial" },
  { brand: "virbac", display: "Virbac" },
];

// Compound vaccine patterns with confidence scores
export const COMPOUND_VACCINE_PATTERNS = [
  { pattern: /nobivac[\s-]+(trio|dhpp?i?[+/]?l?4?)/gi, confidence: 0.9 },
  { pattern: /biocan[\s-]+(novel|dhpp?i?[+/]?l?4?)/gi, confidence: 0.9 },
  { pattern: /canigen[\s-]+(ddpp?i?[+/]?l?4?)/gi, confidence: 0.9 },
  { pattern: /feligen[\s-]+(crp?)/gi, confidence: 0.85 },
  { pattern: /(dhpp?i?[+/]?l?4?)/gi, confidence: 0.8 },
  { pattern: /(rabies|vzteklina)/gi, confidence: 0.9 },
];

// Processing configuration
export const PROCESSING_CONFIG = {
  CHUNK_SIZE: 100,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  MIN_PATTERN_FREQUENCY: 2,
  MIN_CONTEXT_FREQUENCY: 3,
  HIGH_FREQUENCY_THRESHOLD: 5,
  FUZZY_MATCH_THRESHOLD: 0.8,
  FUZZY_VACCINE_THRESHOLD: 0.85,
  SIMILARITY_THRESHOLD: 0.8,
  CONFIDENCE_CAP: 0.95,
};
