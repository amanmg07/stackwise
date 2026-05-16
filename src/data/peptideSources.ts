import { PeptideSource } from "../types";

// Why search URLs instead of deep product links:
// Hardcoded /products/<slug> links rot constantly — vendors reorganize
// their catalogs (Momentous discontinued its entire Huberman line, the
// Shopify stores reshuffle slugs) and every dead slug 404s in the app.
// A vendor search URL never 404s and self-heals when the catalog changes,
// so it lands the user on the product with one extra tap instead of a
// broken page. Each endpoint below is verified to return 200.
type Vendor = { name: string; search: (q: string) => string };

const q = (s: string) => encodeURIComponent(s);

const THORNE: Vendor = { name: "Thorne", search: (s) => `https://www.thorne.com/search?q=${q(s)}` };
const MOMENTOUS: Vendor = { name: "Momentous", search: (s) => `https://www.livemomentous.com/search?q=${q(s)}` };
const NUTRICOST: Vendor = { name: "Nutricost", search: (s) => `https://www.nutricost.com/search?q=${q(s)}` };
const NOW_FOODS: Vendor = { name: "NOW Foods", search: (s) => `https://www.nowfoods.com/search?text=${q(s)}` };
const NOOTROPICS_DEPOT: Vendor = { name: "Nootropics Depot", search: (s) => `https://nootropicsdepot.com/search?q=${q(s)}` };
const DOUBLE_WOOD: Vendor = { name: "Double Wood", search: (s) => `https://www.doublewoodsupplements.com/search?q=${q(s)}` };
const LIFE_EXTENSION: Vendor = { name: "Life Extension", search: (s) => `https://www.lifeextension.com/search?q=${q(s)}` };
const VITAL_PROTEINS: Vendor = { name: "Vital Proteins", search: (s) => `https://www.vitalproteins.com/search?q=${q(s)}` };
const SPORTS_RESEARCH: Vendor = { name: "Sports Research", search: (s) => `https://www.sportsresearch.com/?s=${q(s)}` };
const NORDIC_NATURALS: Vendor = { name: "Nordic Naturals", search: (s) => `https://www.nordicnaturals.com/search?q=${q(s)}` };
const PROHEALTH: Vendor = { name: "ProHealth Longevity", search: (s) => `https://www.prohealthlongevity.com/search?q=${q(s)}` };
const REAL_MUSHROOMS: Vendor = { name: "Real Mushrooms", search: (s) => `https://www.realmushrooms.com/search?q=${q(s)}` };
const AMAZON: Vendor = { name: "Amazon", search: (s) => `https://www.amazon.com/s?k=${q(s)}` };

const RESEARCH_VENDORS: PeptideSource[] = [
  { name: "Peptide Sciences", url: "https://www.peptidesciences.com" },
  { name: "Core Peptides", url: "https://www.corepeptides.com" },
  { name: "Biotech Peptides", url: "https://www.biotechpeptides.com" },
  { name: "Amino Asylum", url: "https://www.aminoasylum.com" },
  { name: "Neuro Labs", url: "https://neurolabsresearch.com" },
  { name: "Onyx Research", url: "https://www.onyxresearch.co" },
  { name: "Ascend Peptides", url: "https://www.ascendpeptides.com" },
];

const RX_ONLY: PeptideSource[] = [
  { name: "Prescription Only", url: "" },
];

const RX_PEPTIDES = ["semaglutide", "tirzepatide"];

// Each supplement maps to one search term plus the vendors that carry it.
// The same term is fed to every vendor's search; vendors that stock it
// surface it, the rest show no results (acceptable — never a 404).
type SupplementSpec = { term: string; vendors: Vendor[] };

const SUPPLEMENT_SPECS: Record<string, SupplementSpec> = {
  creatine_mono: { term: "creatine monohydrate", vendors: [THORNE, MOMENTOUS, NUTRICOST, AMAZON] },
  beta_alanine: { term: "beta alanine", vendors: [THORNE, NOW_FOODS, NUTRICOST, AMAZON] },
  citrulline: { term: "l-citrulline", vendors: [MOMENTOUS, NUTRICOST, NOW_FOODS, AMAZON] },
  glutamine: { term: "l-glutamine", vendors: [THORNE, NOW_FOODS, NUTRICOST, AMAZON] },
  hmb: { term: "hmb", vendors: [MOMENTOUS, NUTRICOST, NOW_FOODS, AMAZON] },
  taurine: { term: "taurine", vendors: [THORNE, NOW_FOODS, NUTRICOST, AMAZON] },
  betaine_tmg: { term: "betaine tmg", vendors: [THORNE, NOW_FOODS, NUTRICOST, AMAZON] },
  ashwagandha: { term: "ashwagandha ksm-66", vendors: [MOMENTOUS, NOOTROPICS_DEPOT, THORNE, AMAZON] },
  tongkat_ali: { term: "tongkat ali", vendors: [MOMENTOUS, NOOTROPICS_DEPOT, DOUBLE_WOOD, AMAZON] },
  fadogia: { term: "fadogia agrestis", vendors: [MOMENTOUS, NOOTROPICS_DEPOT, DOUBLE_WOOD, AMAZON] },
  dim: { term: "dim diindolylmethane", vendors: [THORNE, NOW_FOODS, NUTRICOST, AMAZON] },
  boron: { term: "boron", vendors: [NOW_FOODS, NUTRICOST, DOUBLE_WOOD, AMAZON] },
  zinc_magnesium: { term: "zinc magnesium", vendors: [THORNE, NOW_FOODS, MOMENTOUS, AMAZON] },
  dhea: { term: "dhea", vendors: [THORNE, NOW_FOODS, LIFE_EXTENSION, AMAZON] },
  fenugreek: { term: "fenugreek", vendors: [NOW_FOODS, NOOTROPICS_DEPOT, NUTRICOST, AMAZON] },
  lions_mane: { term: "lions mane mushroom", vendors: [NOOTROPICS_DEPOT, REAL_MUSHROOMS, DOUBLE_WOOD, AMAZON] },
  alpha_gpc: { term: "alpha gpc", vendors: [MOMENTOUS, NOOTROPICS_DEPOT, NOW_FOODS, AMAZON] },
  l_theanine: { term: "l-theanine", vendors: [THORNE, NOOTROPICS_DEPOT, NOW_FOODS, AMAZON] },
  rhodiola: { term: "rhodiola rosea", vendors: [NOOTROPICS_DEPOT, THORNE, NOW_FOODS, AMAZON] },
  bacopa: { term: "bacopa monnieri", vendors: [NOOTROPICS_DEPOT, NOW_FOODS, DOUBLE_WOOD, AMAZON] },
  phosphatidylserine: { term: "phosphatidylserine", vendors: [THORNE, NOW_FOODS, NOOTROPICS_DEPOT, AMAZON] },
  magnesium_glycinate: { term: "magnesium glycinate", vendors: [MOMENTOUS, THORNE, NOW_FOODS, AMAZON] },
  apigenin: { term: "apigenin", vendors: [MOMENTOUS, NOOTROPICS_DEPOT, DOUBLE_WOOD, AMAZON] },
  glycine_sleep: { term: "glycine", vendors: [THORNE, NOW_FOODS, NUTRICOST, AMAZON] },
  collagen: { term: "collagen peptides", vendors: [MOMENTOUS, VITAL_PROTEINS, SPORTS_RESEARCH, AMAZON] },
  vitamin_c: { term: "vitamin c", vendors: [THORNE, NOW_FOODS, LIFE_EXTENSION, AMAZON] },
  coq10: { term: "coq10 ubiquinol", vendors: [THORNE, NOW_FOODS, LIFE_EXTENSION, AMAZON] },
  nmn: { term: "nmn", vendors: [NOOTROPICS_DEPOT, DOUBLE_WOOD, PROHEALTH, AMAZON] },
  astaxanthin: { term: "astaxanthin", vendors: [NOW_FOODS, SPORTS_RESEARCH, AMAZON] },
  vitamin_d3k2: { term: "vitamin d3 k2", vendors: [MOMENTOUS, THORNE, NOW_FOODS, AMAZON] },
  omega3: { term: "omega 3 fish oil", vendors: [MOMENTOUS, THORNE, NORDIC_NATURALS, AMAZON] },
};

function specToSources(spec: SupplementSpec): PeptideSource[] {
  return spec.vendors.map((v) => ({ name: v.name, url: v.search(spec.term) }));
}

export function getSourcesForPeptide(peptideId: string): PeptideSource[] {
  if (RX_PEPTIDES.includes(peptideId)) return RX_ONLY;
  const spec = SUPPLEMENT_SPECS[peptideId];
  if (spec) return specToSources(spec);
  return RESEARCH_VENDORS;
}
