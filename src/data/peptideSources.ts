import { PeptideSource } from "../types";

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

// Supplement-specific vendors
const SUPPLEMENT_SOURCES: Record<string, PeptideSource[]> = {
  creatine_mono: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/creatine" },
    { name: "Momentous", url: "https://www.livemomentous.com/products/creatine" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-creatine-monohydrate" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=creatine+monohydrate+powder" },
  ],
  beta_alanine: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/beta-alanine-sr" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/beta-alanine-powder" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-beta-alanine-powder" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=beta+alanine+supplement" },
  ],
  citrulline: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/citrulline" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-l-citrulline-powder" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/l-citrulline-powder" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=l-citrulline+powder" },
  ],
  glutamine: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/l-glutamine" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/l-glutamine-powder" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-l-glutamine-powder" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=l-glutamine+powder" },
  ],
  hmb: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/hmb" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-hmb-powder" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/hmb-500-mg-veg-capsules" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=hmb+supplement+capsules" },
  ],
  taurine: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/taurine" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/taurine-1000-mg-veg-capsules" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-taurine-powder" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=taurine+supplement" },
  ],
  betaine_tmg: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/betaine-hcl-pepsin" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/tmg-betaine-1000-mg-tablets" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-betaine-anhydrous-trimethylglycine-powder" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=betaine+tmg+supplement" },
  ],
  ashwagandha: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-ashwagandha" },
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/ksm-66-ashwagandha-extract-300mg-capsules/" },
    { name: "Thorne", url: "https://www.thorne.com/products/dp/memoractiv" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=ksm-66+ashwagandha" },
  ],
  tongkat_ali: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-tongkat-ali" },
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/tongkat-ali-extract-capsules/" },
    { name: "Double Wood", url: "https://www.doublewoodsupplements.com/products/tongkat-ali" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=tongkat+ali+extract" },
  ],
  fadogia: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-fadogia-agrestis" },
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/fadogia-agrestis-extract-capsules/" },
    { name: "Double Wood", url: "https://www.doublewoodsupplements.com/products/fadogia-agrestis" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=fadogia+agrestis+supplement" },
  ],
  dim: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/dim-advantage" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/dim-200-veg-capsules" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-dim-diindolylmethane-300mg" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=dim+supplement+200mg" },
  ],
  boron: [
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/boron-3-mg-veg-capsules" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-boron-capsules" },
    { name: "Double Wood", url: "https://www.doublewoodsupplements.com/products/boron" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=boron+supplement" },
  ],
  zinc_magnesium: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/zincpicolinate15mg" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/zma-sports-recovery-capsules" },
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-sleep-pack" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=zma+supplement" },
  ],
  dhea: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/dhea-25mg" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/dhea-25-mg-veg-capsules" },
    { name: "Life Extension", url: "https://www.lifeextension.com/vitamins-supplements/item02368/dhea" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=dhea+25mg+supplement" },
  ],
  fenugreek: [
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/fenugreek-500-mg-veg-capsules" },
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/fenugreek-extract-capsules/" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-fenugreek-seed" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=fenugreek+extract+supplement" },
  ],
  lions_mane: [
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/lions-mane-mushroom-capsules-8-1-extract/" },
    { name: "Real Mushrooms", url: "https://www.realmushrooms.com/products/organic-lions-mane-extract-capsules/" },
    { name: "Double Wood", url: "https://www.doublewoodsupplements.com/products/lions-mane-mushroom" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=lions+mane+mushroom+extract" },
  ],
  alpha_gpc: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-alpha-gpc" },
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/alpha-gpc-capsules/" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/alpha-gpc-300-mg-veg-capsules" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=alpha+gpc+600mg" },
  ],
  l_theanine: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/theanine" },
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/l-theanine-200mg-capsules/" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/l-theanine-200-mg-veg-capsules" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=l-theanine+200mg" },
  ],
  rhodiola: [
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/rhodiola-rosea-capsules/" },
    { name: "Thorne", url: "https://www.thorne.com/products/dp/memoractiv" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/rhodiola-500-mg-veg-capsules" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=rhodiola+rosea+extract" },
  ],
  bacopa: [
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/bacopa-monnieri-capsules/" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/bacopa-extract-450-mg-veg-capsules" },
    { name: "Double Wood", url: "https://www.doublewoodsupplements.com/products/bacopa-monnieri" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=bacopa+monnieri+extract" },
  ],
  phosphatidylserine: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/memoractiv" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/phosphatidyl-serine-100-mg-veg-capsules" },
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/phosphatidylserine-capsules/" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=phosphatidylserine+100mg" },
  ],
  magnesium_glycinate: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-magnesium-threonate" },
    { name: "Thorne", url: "https://www.thorne.com/products/dp/magnesium-bisglycinate" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/magnesium-glycinate-tablets" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=magnesium+glycinate+supplement" },
  ],
  apigenin: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-apigenin" },
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/apigenin-capsules/" },
    { name: "Double Wood", url: "https://www.doublewoodsupplements.com/products/apigenin" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=apigenin+50mg+supplement" },
  ],
  glycine_sleep: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/glycine" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/glycine-1000-mg-veg-capsules" },
    { name: "Nutricost", url: "https://www.nutricost.com/products/nutricost-glycine-powder" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=glycine+powder+supplement" },
  ],
  collagen: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/collagen-peptides" },
    { name: "Vital Proteins", url: "https://www.vitalproteins.com/products/collagen-peptides" },
    { name: "Sports Research", url: "https://www.sportsresearch.com/products/collagen-peptides" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=collagen+peptides+powder" },
  ],
  vitamin_c: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/vitamin-c-with-flavonoids" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/c-1000-tablets" },
    { name: "Life Extension", url: "https://www.lifeextension.com/vitamins-supplements/item00927/vitamin-c-and-bio-quercetin-phytosome" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=vitamin+c+1000mg" },
  ],
  coq10: [
    { name: "Thorne", url: "https://www.thorne.com/products/dp/coq10" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/coq10-100-mg-softgels" },
    { name: "Life Extension", url: "https://www.lifeextension.com/vitamins-supplements/item01426/super-ubiquinol-coq10-with-enhanced-mitochondrial-support" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=coq10+ubiquinol+supplement" },
  ],
  nmn: [
    { name: "Nootropics Depot", url: "https://nootropicsdepot.com/nmn-nicotinamide-mononucleotide-capsules/" },
    { name: "Double Wood", url: "https://www.doublewoodsupplements.com/products/nmn" },
    { name: "ProHealth Longevity", url: "https://www.prohealthlongevity.com/collections/nmn" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=nmn+supplement+500mg" },
  ],
  astaxanthin: [
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/astaxanthin-4-mg-softgels" },
    { name: "Sports Research", url: "https://www.sportsresearch.com/products/astaxanthin" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=astaxanthin+supplement" },
  ],
  vitamin_d3k2: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-vitamin-d3-k2" },
    { name: "Thorne", url: "https://www.thorne.com/products/dp/vitamin-d-k2-liquid" },
    { name: "NOW Foods", url: "https://www.nowfoods.com/products/supplements/vitamin-d-3-k-2-1000-iu-45-mcg-veg-capsules" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=vitamin+d3+k2+supplement" },
  ],
  omega3: [
    { name: "Momentous", url: "https://www.livemomentous.com/products/huberman-omega-3" },
    { name: "Thorne", url: "https://www.thorne.com/products/dp/super-epa" },
    { name: "Nordic Naturals", url: "https://www.nordicnaturals.com/products/ultimate-omega" },
    { name: "Amazon", url: "https://www.amazon.com/s?k=omega+3+fish+oil+supplement" },
  ],
};

const DEFAULT_SUPPLEMENT_VENDORS: PeptideSource[] = [
  { name: "Thorne", url: "https://www.thorne.com" },
  { name: "NOW Foods", url: "https://www.nowfoods.com" },
  { name: "Nootropics Depot", url: "https://nootropicsdepot.com" },
];

export function getSourcesForPeptide(peptideId: string): PeptideSource[] {
  if (RX_PEPTIDES.includes(peptideId)) return RX_ONLY;
  if (SUPPLEMENT_SOURCES[peptideId]) return SUPPLEMENT_SOURCES[peptideId];
  return RESEARCH_VENDORS;
}
