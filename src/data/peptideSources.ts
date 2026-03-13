import { PeptideSource } from "../types";

const RESEARCH_VENDORS: PeptideSource[] = [
  { name: "Peptide Sciences", url: "https://www.peptidesciences.com" },
  { name: "Core Peptides", url: "https://www.corepeptides.com" },
  { name: "Biotech Peptides", url: "https://www.biotechpeptides.com" },
  { name: "Amino Asylum", url: "https://www.aminoasylum.com" },
  { name: "Neuro Labs", url: "https://www.neurolabs.co" },
  { name: "Onyx Research", url: "https://www.onyxresearch.co" },
  { name: "Ascend Peptides", url: "https://www.ascendpeptides.com" },
];

const RX_ONLY: PeptideSource[] = [
  { name: "Prescription Only", url: "" },
];

const RX_PEPTIDES = ["semaglutide", "tirzepatide"];

export function getSourcesForPeptide(peptideId: string): PeptideSource[] {
  return RX_PEPTIDES.includes(peptideId) ? RX_ONLY : RESEARCH_VENDORS;
}
