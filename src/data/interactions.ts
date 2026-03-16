export interface PeptideInteraction {
  peptideIds: [string, string];
  severity: "warning" | "caution" | "info";
  title: string;
  detail: string;
}

export const interactions: PeptideInteraction[] = [
  // GH secretagogue stacking warnings
  {
    peptideIds: ["cjc1295_nodac", "cjc1295_dac"],
    severity: "warning",
    title: "Redundant GHRH analogs",
    detail: "Both are GHRH analogs competing for the same receptor. Using both provides no additional benefit and may desensitize GHRH receptors. Pick one — no-DAC for natural pulsing, DAC for convenience.",
  },
  {
    peptideIds: ["mk677", "ghrp6"],
    severity: "caution",
    title: "Dual ghrelin mimetics",
    detail: "Both stimulate ghrelin receptors. Stacking may cause excessive hunger, water retention, and blood sugar elevation. If combining, start with low doses and monitor blood glucose.",
  },
  {
    peptideIds: ["mk677", "ghrp2"],
    severity: "caution",
    title: "Dual ghrelin mimetics",
    detail: "Both act on ghrelin receptors. Combining can amplify hunger, water retention, and cortisol/prolactin side effects. Use reduced doses if stacking.",
  },
  {
    peptideIds: ["mk677", "hexarelin"],
    severity: "caution",
    title: "Overlapping GH secretagogues",
    detail: "Both strongly stimulate GH release through ghrelin pathways. Combined use may raise cortisol and prolactin. Monitor labs if stacking.",
  },
  {
    peptideIds: ["ghrp6", "ghrp2"],
    severity: "warning",
    title: "Same class — pick one",
    detail: "GHRP-6 and GHRP-2 are both growth hormone releasing peptides acting on the same receptor. No benefit to using both. GHRP-2 is more potent with less hunger; GHRP-6 boosts appetite more.",
  },
  {
    peptideIds: ["ghrp6", "hexarelin"],
    severity: "caution",
    title: "Overlapping GHRP class",
    detail: "Both are GHRPs. Hexarelin is the strongest but desensitizes fastest. Combining may worsen cortisol/prolactin spikes.",
  },
  {
    peptideIds: ["ghrp2", "hexarelin"],
    severity: "caution",
    title: "Overlapping GHRP class",
    detail: "Both target the ghrelin receptor. Hexarelin is more potent but desensitizes quickly. If stacking, keep doses minimal.",
  },
  // GLP-1 agonist stacking
  {
    peptideIds: ["semaglutide", "tirzepatide"],
    severity: "warning",
    title: "Do not combine GLP-1 agonists",
    detail: "Both are GLP-1 receptor agonists. Combining dramatically increases nausea, vomiting, and hypoglycemia risk. Choose one based on your goals — tirzepatide also hits GIP receptors.",
  },
  {
    peptideIds: ["semaglutide", "retatrutide"],
    severity: "warning",
    title: "Overlapping GLP-1 activity",
    detail: "Retatrutide is a triple agonist (GLP-1/GIP/glucagon). Adding semaglutide doubles GLP-1 stimulation with no added benefit and higher side effect risk.",
  },
  {
    peptideIds: ["tirzepatide", "retatrutide"],
    severity: "warning",
    title: "Overlapping GLP-1/GIP activity",
    detail: "Both hit GLP-1 and GIP receptors. Stacking offers no benefit and significantly increases GI side effects and hypoglycemia risk.",
  },
  // Appetite effects
  {
    peptideIds: ["semaglutide", "mk677"],
    severity: "caution",
    title: "Opposing appetite effects",
    detail: "Semaglutide suppresses appetite while MK-677 increases it. They may partially cancel each other out. MK-677 can also raise blood sugar, counteracting semaglutide's glucose benefits.",
  },
  {
    peptideIds: ["tirzepatide", "mk677"],
    severity: "caution",
    title: "Opposing appetite effects",
    detail: "Tirzepatide suppresses appetite; MK-677 stimulates it. The hunger increase from MK-677 may undermine weight loss goals.",
  },
  {
    peptideIds: ["semaglutide", "ghrp6"],
    severity: "caution",
    title: "Opposing appetite effects",
    detail: "Semaglutide crushes appetite while GHRP-6 is known for causing intense hunger. They work against each other.",
  },
  // Cognitive peptides
  {
    peptideIds: ["selank", "semax"],
    severity: "info",
    title: "Complementary nootropic stack",
    detail: "Selank (anxiolytic) and Semax (stimulating) work well together. Selank calms while Semax sharpens focus. A popular and well-tolerated cognitive combo.",
  },
  {
    peptideIds: ["selank", "dsip"],
    severity: "caution",
    title: "Sedation stacking",
    detail: "Both have calming/sedating effects. Using together during the day may cause excessive drowsiness. Fine if using DSIP at night and Selank during the day.",
  },
  // Recovery synergies
  {
    peptideIds: ["bpc157", "tb500"],
    severity: "info",
    title: "Wolverine stack — great synergy",
    detail: "The classic healing combo. BPC-157 works locally at the injury site while TB-500 heals systemically. Together they cover both targeted and whole-body repair. Don't mix in the same vial.",
  },
  {
    peptideIds: ["bpc157", "ghkcu"],
    severity: "info",
    title: "Tissue repair + collagen boost",
    detail: "BPC-157 accelerates healing while GHK-Cu stimulates collagen synthesis and remodeling. Complementary mechanisms for faster, higher-quality tissue repair.",
  },
  {
    peptideIds: ["tb500", "ghkcu"],
    severity: "info",
    title: "Systemic repair + skin/tissue remodeling",
    detail: "TB-500 handles deep tissue and systemic healing. GHK-Cu adds collagen/elastin support and anti-inflammatory benefits. Good combo for overall recovery.",
  },
  // Synergistic GH stacks
  {
    peptideIds: ["cjc1295_nodac", "ipamorelin"],
    severity: "info",
    title: "Gold standard GH stack",
    detail: "CJC-1295 (GHRH analog) and Ipamorelin (GHRP) work on different receptors to amplify GH release 2-3x more than either alone. The most popular and clean GH combo.",
  },
  {
    peptideIds: ["cjc1295_dac", "ipamorelin"],
    severity: "info",
    title: "Convenient GH combo",
    detail: "DAC version provides sustained GHRH stimulation while Ipamorelin adds clean GH pulses. Less frequent dosing than the no-DAC version.",
  },
  // Sexual health
  {
    peptideIds: ["pt141", "kisspeptin"],
    severity: "caution",
    title: "Dual sexual function peptides",
    detail: "Both affect sexual function through different pathways. PT-141 acts centrally on melanocortin receptors; Kisspeptin stimulates GnRH. Combining may cause flushing and nausea. Start one at a time.",
  },
  // Hormone axis
  {
    peptideIds: ["gonadorelin", "kisspeptin"],
    severity: "info",
    title: "HPG axis support stack",
    detail: "Kisspeptin stimulates GnRH release, and Gonadorelin is a GnRH analog. Both support the HPG axis but through slightly different mechanisms. Can be complementary for hormonal optimization.",
  },
  // Anti-aging
  {
    peptideIds: ["epithalon", "foxo4dri"],
    severity: "info",
    title: "Telomere + senescent cell combo",
    detail: "Epithalon supports telomere maintenance while FOXO4-DRI targets senescent (zombie) cells. Different anti-aging mechanisms that complement each other.",
  },
  // Fat loss
  {
    peptideIds: ["aod9604", "tesamorelin"],
    severity: "info",
    title: "Dual fat loss approach",
    detail: "AOD-9604 mimics the fat-burning fragment of GH while Tesamorelin stimulates natural GH release targeting visceral fat. Different mechanisms for enhanced fat loss.",
  },
  {
    peptideIds: ["aod9604", "semaglutide"],
    severity: "info",
    title: "Fat loss + appetite control",
    detail: "AOD-9604 targets fat metabolism directly while Semaglutide reduces appetite. Complementary approach to weight management.",
  },
];

export function getInteractions(peptideIds: string[]): PeptideInteraction[] {
  if (peptideIds.length < 2) return [];
  const idSet = new Set(peptideIds);
  return interactions.filter(
    (i) => idSet.has(i.peptideIds[0]) && idSet.has(i.peptideIds[1])
  );
}
