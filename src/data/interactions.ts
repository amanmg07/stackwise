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
  // IGF-1 interactions
  {
    peptideIds: ["igf1_lr3", "igf1_des"],
    severity: "caution",
    title: "Dual IGF-1 variants",
    detail: "Both are IGF-1 analogs. LR3 is systemic and long-acting; DES is localized and short. Some advanced users alternate them, but combining increases hypoglycemia risk. Monitor blood sugar closely.",
  },
  {
    peptideIds: ["igf1_lr3", "mk677"],
    severity: "caution",
    title: "IGF-1 + GH secretagogue",
    detail: "MK-677 raises GH which raises natural IGF-1. Adding exogenous IGF-1 LR3 on top may push IGF-1 levels too high. Monitor IGF-1 labs if combining.",
  },
  {
    peptideIds: ["igf1_lr3", "semaglutide"],
    severity: "caution",
    title: "Blood sugar concerns",
    detail: "IGF-1 LR3 can cause hypoglycemia. Semaglutide also lowers blood sugar. Combined use increases hypoglycemia risk — monitor glucose carefully.",
  },
  // Melanotan II interactions
  {
    peptideIds: ["melanotan2", "pt141"],
    severity: "caution",
    title: "Overlapping melanocortin activity",
    detail: "PT-141 was derived from Melanotan II. Both activate MC3/MC4 receptors for libido. Using together may cause excessive nausea and flushing. Pick one for sexual function.",
  },
  // Sermorelin interactions
  {
    peptideIds: ["sermorelin", "cjc1295_nodac"],
    severity: "warning",
    title: "Redundant GHRH analogs",
    detail: "Both are GHRH analogs competing for the same receptor. Using both provides no benefit. CJC-1295 is more potent; Sermorelin is gentler and better for beginners.",
  },
  {
    peptideIds: ["sermorelin", "cjc1295_dac"],
    severity: "warning",
    title: "Redundant GHRH analogs",
    detail: "Both target GHRH receptors. Pick one — Sermorelin for natural pulsing, CJC-1295 DAC for convenience and longer action.",
  },
  {
    peptideIds: ["sermorelin", "ipamorelin"],
    severity: "info",
    title: "Classic GH stack",
    detail: "Sermorelin (GHRH) and Ipamorelin (GHRP) work through different receptors for synergistic GH release. A clean, well-tolerated combo commonly prescribed by clinics.",
  },
  // 5-Amino-1MQ interactions
  {
    peptideIds: ["amino1mq", "aod9604"],
    severity: "info",
    title: "Complementary fat loss",
    detail: "5-Amino-1MQ blocks fat storage via NNMT inhibition while AOD-9604 directly stimulates fat breakdown. Different mechanisms for enhanced fat loss.",
  },
  {
    peptideIds: ["amino1mq", "semaglutide"],
    severity: "info",
    title: "Metabolic + appetite approach",
    detail: "5-Amino-1MQ boosts fat metabolism while Semaglutide reduces appetite. Works through completely different pathways — complementary combination.",
  },
  // Thymalin interactions
  {
    peptideIds: ["thymalin", "thymosin_a1"],
    severity: "info",
    title: "Thymus peptide synergy",
    detail: "Both support immune function through the thymus. Thymalin restores T-cell balance; Thymosin Alpha-1 activates specific immune cells. Well-established combination in clinical research.",
  },
  {
    peptideIds: ["thymalin", "epithalon"],
    severity: "info",
    title: "Khavinson bioregulator protocol",
    detail: "The classic Russian longevity combo. Thymalin restores immune function while Epithalon supports telomeres. In long-term studies, this combination reduced mortality by 50%.",
  },

  // ── Supplement interactions ──

  // Supplement-supplement
  {
    peptideIds: ["ashwagandha", "rhodiola"],
    severity: "caution",
    title: "Both are adaptogens",
    detail: "Ashwagandha and rhodiola are both adaptogens. While safe to combine, they can have opposing effects — ashwagandha is calming while rhodiola is stimulating. Monitor how you feel and adjust timing (rhodiola AM, ashwagandha PM).",
  },
  {
    peptideIds: ["ashwagandha", "l_theanine"],
    severity: "info",
    title: "Calm & focus synergy",
    detail: "Ashwagandha lowers cortisol while L-theanine promotes alpha brain waves. Great combo for reducing anxiety without drowsiness.",
  },
  {
    peptideIds: ["magnesium_glycinate", "zinc_magnesium"],
    severity: "caution",
    title: "Overlapping magnesium",
    detail: "ZMA already contains magnesium. Adding extra magnesium glycinate may exceed recommended daily intake and cause digestive issues. Use one or the other, not both.",
  },
  {
    peptideIds: ["alpha_gpc", "bacopa"],
    severity: "info",
    title: "Cholinergic + memory synergy",
    detail: "Alpha-GPC provides choline for acetylcholine production while bacopa enhances memory consolidation. Complementary mechanisms for cognitive enhancement.",
  },
  {
    peptideIds: ["creatine_mono", "beta_alanine"],
    severity: "info",
    title: "Proven performance stack",
    detail: "The most well-researched supplement combo for athletic performance. Creatine boosts power output, beta-alanine buffers acid for endurance. No interaction concerns.",
  },
  {
    peptideIds: ["vitamin_c", "collagen"],
    severity: "info",
    title: "Essential pairing",
    detail: "Vitamin C is required for collagen synthesis. Taking them together maximizes collagen production for skin, joints, and connective tissue. Always pair these.",
  },
  {
    peptideIds: ["omega3", "coq10"],
    severity: "info",
    title: "Heart & energy synergy",
    detail: "Omega-3 supports cardiovascular function while CoQ10 powers mitochondrial energy production. Both are fat-soluble — take together with a meal for better absorption.",
  },
  {
    peptideIds: ["tongkat_ali", "ashwagandha"],
    severity: "info",
    title: "Testosterone support stack",
    detail: "Tongkat ali increases free testosterone while ashwagandha reduces cortisol (which suppresses testosterone). Complementary mechanisms for hormonal balance.",
  },
  {
    peptideIds: ["tongkat_ali", "fadogia"],
    severity: "caution",
    title: "Both raise testosterone",
    detail: "Both stimulate testosterone through different mechanisms (tongkat via SHBG reduction, fadogia via LH signaling). Combined use may amplify effects — start with one, add the other at lower doses. Monitor for signs of excess androgens.",
  },
  {
    peptideIds: ["dhea", "dim"],
    severity: "info",
    title: "Hormone balance pairing",
    detail: "DHEA provides the raw hormonal precursor. DIM supports healthy estrogen metabolism, preventing DHEA from converting to excess estrogen. Good combination for hormonal balance.",
  },
  {
    peptideIds: ["lions_mane", "alpha_gpc"],
    severity: "info",
    title: "Neurotropic stack",
    detail: "Lion's mane stimulates nerve growth factor (NGF) for long-term brain health. Alpha-GPC provides choline for immediate cognitive function. Excellent daily nootropic pairing.",
  },
  {
    peptideIds: ["nmn", "coq10"],
    severity: "info",
    title: "Mitochondrial longevity stack",
    detail: "NMN boosts NAD+ for cellular repair while CoQ10 supports the electron transport chain. Both target mitochondrial health through complementary pathways.",
  },
  {
    peptideIds: ["magnesium_glycinate", "apigenin"],
    severity: "info",
    title: "Sleep support synergy",
    detail: "Magnesium promotes muscle relaxation and GABA activity. Apigenin binds benzodiazepine receptors for calming effects. The Huberman-recommended sleep stack.",
  },

  // Supplement-peptide interactions
  {
    peptideIds: ["ashwagandha", "dsip"],
    severity: "info",
    title: "Comprehensive sleep support",
    detail: "Ashwagandha reduces cortisol and anxiety while DSIP promotes delta-wave deep sleep. Together they address both the mental and physiological barriers to quality sleep.",
  },
  {
    peptideIds: ["creatine_mono", "cjc1295_nodac"],
    severity: "info",
    title: "Muscle growth synergy",
    detail: "Creatine provides immediate energy for training while CJC-1295 boosts GH for recovery and lean mass. A strong combination for body composition goals.",
  },
  {
    peptideIds: ["collagen", "ghkcu"],
    severity: "info",
    title: "Skin repair powerhouse",
    detail: "GHK-Cu signals your body to produce new collagen while collagen supplements provide the raw amino acid building blocks. The complete skin rejuvenation approach.",
  },
  {
    peptideIds: ["glutamine", "bpc157"],
    severity: "info",
    title: "Gut healing synergy",
    detail: "BPC-157 heals gut lining through angiogenesis and anti-inflammatory action. Glutamine is the primary fuel source for intestinal cells. Excellent combination for gut repair.",
  },
  {
    peptideIds: ["omega3", "bpc157"],
    severity: "info",
    title: "Anti-inflammatory synergy",
    detail: "BPC-157 provides targeted anti-inflammatory peptide action. Omega-3 reduces systemic inflammation via EPA/DHA pathways. Complementary for recovery and healing.",
  },
  {
    peptideIds: ["lions_mane", "semax"],
    severity: "info",
    title: "Neurotropic powerhouse",
    detail: "Lion's mane promotes NGF for long-term nerve health. Semax boosts BDNF for immediate cognitive enhancement. Both support neuroplasticity through different growth factors.",
  },
  {
    peptideIds: ["ashwagandha", "selank"],
    severity: "info",
    title: "Anxiolytic combination",
    detail: "Ashwagandha reduces cortisol naturally. Selank modulates GABA and serotonin. Together they provide comprehensive anxiety relief through complementary mechanisms.",
  },
  {
    peptideIds: ["tongkat_ali", "gonadorelin"],
    severity: "info",
    title: "Hormonal axis support",
    detail: "Gonadorelin stimulates LH/FSH from the pituitary. Tongkat ali reduces SHBG to increase free testosterone. Synergistic support for the full HPG axis.",
  },
  {
    peptideIds: ["vitamin_c", "thymosin_a1"],
    severity: "info",
    title: "Immune defense stack",
    detail: "Thymosin Alpha-1 trains immune cells while vitamin C supports immune cell function and acts as an antioxidant. Strong combination during illness or immune stress.",
  },
];

export function getInteractions(peptideIds: string[]): PeptideInteraction[] {
  if (peptideIds.length < 2) return [];
  const idSet = new Set(peptideIds);
  return interactions.filter(
    (i) => idSet.has(i.peptideIds[0]) && idSet.has(i.peptideIds[1])
  );
}
