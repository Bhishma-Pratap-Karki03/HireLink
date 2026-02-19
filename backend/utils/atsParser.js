const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const skillDictionary = require("./atsSkills");
const skillAliases = require("./atsSkillAliases");

const normalize = (value) => String(value || "").toLowerCase();

const normalizeText = (value) =>
  normalize(value)
    .replace(/[^a-z0-9+#.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const ensureString = (value) =>
  typeof value === "string" ? value : String(value || "");

const extractEmails = (text) => {
  const matches = ensureString(text).match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g,
  );
  return Array.from(new Set(matches || []));
};

const extractPhones = (text) => {
  const matches = ensureString(text).match(/(\+?\d[\d\s\-()]{7,}\d)/g);
  const cleaned = (matches || []).map((value) => value.trim());
  const filtered = cleaned.filter((value) => {
    const normalized = value.replace(/\s+/g, "");
    if (/^\d{4}[-–]\d{4}$/.test(normalized)) return false;
    if (/^\d{4}$/.test(normalized)) return false;
    if (/--/.test(value)) return false;
    return true;
  });
  return Array.from(new Set(filtered));
};

const extractExperienceYears = (text) => {
  const source = ensureString(text);
  const explicitMatches = source.match(/(\d+)\s*(years|year|yrs|yr)\b/gi);
  const explicitValues = (explicitMatches || [])
    .map((item) => parseInt(item, 10))
    .filter((num) => !Number.isNaN(num));

  if (explicitValues.length) {
    return Math.max(...explicitValues);
  }

  const yearMatches =
    source.match(/(19|20)\d{2}\s*[-–]\s*(present|current|(19|20)\d{2})/gi) ||
    [];
  const currentYear = new Date().getFullYear();
  const rangeValues = yearMatches.map((match) => {
    const parts = match.split(/[-–]/).map((part) => part.trim().toLowerCase());
    const start = parseInt(parts[0], 10);
    const endPart = parts[1] || "";
    const end = /present|current/.test(endPart)
      ? currentYear
      : parseInt(endPart, 10);
    if (Number.isNaN(start) || Number.isNaN(end)) return 0;
    return Math.max(0, end - start);
  });

  const maxRange = rangeValues.length ? Math.max(...rangeValues) : 0;
  return maxRange;
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizedAliasMap = new Map();
const variantsByCanonical = new Map();

skillAliases.forEach((entry) => {
  const canonical = normalizeText(entry.canonical);
  const variants = Array.from(
    new Set(
      [entry.canonical, ...(entry.variants || [])]
        .map((item) => normalizeText(item))
        .filter(Boolean),
    ),
  );

  if (!variants.length) return;

  variantsByCanonical.set(canonical, variants);
  variants.forEach((variant) => {
    normalizedAliasMap.set(variant, canonical);
  });
});

const hasTermInText = (normalizedText, term) => {
  if (!normalizedText || !term) return false;
  const regex = new RegExp(`(?:^|\\s)${escapeRegex(term)}(?:\\s|$)`);
  return regex.test(normalizedText);
};

const canonicalizeSkill = (skill) => {
  const normalized = normalizeText(skill);
  if (!normalized) return "";
  if (normalizedAliasMap.has(normalized))
    return normalizedAliasMap.get(normalized);
  return normalized;
};

const extractSkills = (text, dictionary = skillDictionary) => {
  const normalizedText = normalizeText(text);
  const matches = new Set();

  dictionary.forEach((skill) => {
    const canonical = canonicalizeSkill(skill);
    if (!canonical) return;
    const variants = variantsByCanonical.get(canonical) || [canonical];
    const matched = variants.some((variant) =>
      hasTermInText(normalizedText, variant),
    );
    if (matched) {
      matches.add(canonical);
    }
  });

  skillAliases.forEach((entry) => {
    const canonical = canonicalizeSkill(entry.canonical);
    const variants = variantsByCanonical.get(canonical) || [canonical];
    const matched = variants.some((variant) =>
      hasTermInText(normalizedText, variant),
    );
    if (matched) {
      matches.add(canonical);
    }
  });

  return Array.from(matches);
};

const educationLevels = [
  { label: "Doctorate", rank: 5, terms: ["phd", "doctorate", "dphil"] },
  {
    label: "Master",
    rank: 4,
    terms: ["master", "msc", "m.sc", "mba", "m.a", "m.s"],
  },
  {
    label: "Bachelor",
    rank: 3,
    terms: [
      "bachelor",
      "bsc",
      "b.sc",
      "be",
      "b.e",
      "ba",
      "b.a",
      "btech",
      "bsc(hons)",
      "bsc (hons)",
      "bsc. (hons)",
    ],
  },
  {
    label: "Associate",
    rank: 2,
    terms: ["associate", "diploma", "advanced diploma"],
  },
  {
    label: "High School",
    rank: 1,
    terms: ["high school", "secondary", "slc", "10+2", "plus two"],
  },
];

const extractEducationLevel = (text) => {
  const normalizedText = ` ${normalizeText(text)} `;
  let best = { label: "", rank: 0 };
  for (const level of educationLevels) {
    const hit = level.terms.some((term) =>
      normalizedText.includes(` ${normalizeText(term)} `),
    );
    if (hit && level.rank > best.rank) {
      best = { label: level.label, rank: level.rank };
    }
  }
  return best;
};

const parseResumeText = async (resumePath) => {
  const ext = path.extname(resumePath).toLowerCase();
  const buffer = fs.readFileSync(resumePath);
  if (ext === ".pdf") {
    const standardFontsPath = path.join(
      __dirname,
      "..",
      "node_modules",
      "pdfjs-dist",
      "standard_fonts",
    );
    const standardFontsUrl = `${pathToFileURL(standardFontsPath).href}/`;
    const parser = new PDFParse({
      data: new Uint8Array(buffer),
      standardFontDataUrl: standardFontsUrl,
    });
    await parser.load();
    const textResult = await parser.getText();
    if (textResult && typeof textResult.text === "string") {
      return textResult.text;
    }
    return textResult || "";
  }
  if (ext === ".docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return value || "";
  }
  return buffer.toString("utf8");
};

module.exports = {
  parseResumeText,
  extractEmails,
  extractPhones,
  extractExperienceYears,
  extractSkills,
  extractEducationLevel,
  canonicalizeSkill,
  normalizeText,
  normalize,
  ensureString,
};
