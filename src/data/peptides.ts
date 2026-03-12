import { Peptide } from "../types";

export const peptides: Peptide[] = [
  {
    id: "bpc157",
    name: "BPC-157",
    abbreviation: "BPC",
    categories: ["recovery"],
    description:
      "Body Protection Compound-157 is a synthetic peptide derived from a protein found in gastric juice. Known for accelerating healing of muscles, tendons, ligaments, and the gut lining.",
    mechanism:
      "Promotes angiogenesis (new blood vessel formation), upregulates growth factor receptors, modulates nitric oxide synthesis, and protects the endothelium. Activates FAK-paxillin and JAK-2-STAT-3 signaling pathways to accelerate wound healing.",
    routes: ["subcutaneous", "intramuscular", "oral"],
    dosingProtocols: [
      {
        purpose: "General recovery / injury healing",
        doseRange: "250-500 mcg",
        frequency: "2x daily",
        cycleDuration: "4-8 weeks",
        timing: "Morning and evening, inject near injury site if possible",
      },
      {
        purpose: "Gut healing",
        doseRange: "500 mcg",
        frequency: "2x daily",
        cycleDuration: "4-6 weeks",
        timing: "On empty stomach, oral or subcutaneous in abdomen",
      },
    ],
    sideEffects: ["Nausea (rare)", "Dizziness (rare)", "Injection site irritation"],
    stacksWith: ["tb500", "ghkcu"],
    halfLife: "~4 hours",
    storage: "Refrigerate reconstituted vial (2-8°C). Use within 30 days. Store lyophilized powder at room temperature or refrigerated.",
    notes: "One of the most well-studied healing peptides. Often combined with TB-500 for the 'Wolverine stack.' Not FDA-approved for human use.",
  },
  {
    id: "tb500",
    name: "TB-500",
    abbreviation: "TB-500",
    categories: ["recovery", "immune"],
    description:
      "Thymosin Beta-4 fragment. Promotes cell migration, tissue repair, and reduces inflammation. Used for muscle, tendon, and ligament recovery.",
    mechanism:
      "Upregulates actin, a cell-building protein essential for cell migration and proliferation. Promotes angiogenesis, reduces pro-inflammatory cytokines, and supports stem cell maturation.",
    routes: ["subcutaneous", "intramuscular"],
    dosingProtocols: [
      {
        purpose: "Injury recovery (loading phase)",
        doseRange: "2-2.5 mg",
        frequency: "2x per week",
        cycleDuration: "4-6 weeks loading",
        timing: "Any time of day, subcutaneous injection",
      },
      {
        purpose: "Maintenance",
        doseRange: "2 mg",
        frequency: "1x per week",
        cycleDuration: "4-8 weeks after loading",
        timing: "Any time of day",
      },
    ],
    sideEffects: ["Headache", "Temporary lethargy", "Injection site redness", "Mild nausea"],
    stacksWith: ["bpc157"],
    halfLife: "4-6 hours",
    storage: "Refrigerate reconstituted vial (2-8°C). Use within 21 days.",
    notes: "Commonly stacked with BPC-157 for synergistic healing. Systemic action means injection site doesn't need to be near the injury.",
  },
  {
    id: "cjc1295_nodac",
    name: "CJC-1295 (no DAC)",
    abbreviation: "Mod GRF 1-29",
    categories: ["muscle_gain", "fat_loss", "anti_aging"],
    description:
      "Modified Growth Releasing Factor. A growth hormone releasing hormone (GHRH) analog that stimulates pulsatile GH release. The 'no DAC' version has a shorter duration for more natural GH pulses.",
    mechanism:
      "Binds GHRH receptors on pituitary somatotroph cells, stimulating synthesis and secretion of growth hormone in a pulsatile pattern. Preserves the body's natural GH feedback loop.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "GH optimization / body recomp",
        doseRange: "100 mcg",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks",
        timing: "Morning, post-workout, and before bed on empty stomach. Wait 20 min before eating.",
      },
    ],
    sideEffects: ["Flushing", "Headache", "Dizziness", "Water retention", "Tingling/numbness"],
    stacksWith: ["ipamorelin", "mk677"],
    halfLife: "~30 minutes",
    storage: "Refrigerate reconstituted (2-8°C). Use within 30 days.",
    notes: "Almost always combined with Ipamorelin for synergistic GH release. The no-DAC version is preferred for more physiological GH pulsing.",
  },
  {
    id: "cjc1295_dac",
    name: "CJC-1295 (with DAC)",
    categories: ["muscle_gain", "fat_loss", "anti_aging"],
    description:
      "Long-acting GHRH analog with Drug Affinity Complex that extends its half-life. Provides sustained GH elevation over days rather than pulses.",
    mechanism:
      "Same GHRH receptor activation as no-DAC version, but the DAC modification allows it to bind albumin in the bloodstream, dramatically extending its active duration and creating sustained GH elevation.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Sustained GH elevation",
        doseRange: "2 mg",
        frequency: "1x per week",
        cycleDuration: "8-12 weeks",
        timing: "Evening injection, any day of the week",
      },
    ],
    sideEffects: ["Water retention", "Joint stiffness", "Tingling", "Increased hunger", "Fatigue initially"],
    stacksWith: ["ipamorelin"],
    halfLife: "~8 days",
    storage: "Refrigerate reconstituted (2-8°C). Use within 30 days.",
    notes: "Less popular than no-DAC version because it creates a sustained GH 'bleed' rather than natural pulses. Some users prefer it for convenience (once weekly).",
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    categories: ["muscle_gain", "fat_loss", "sleep"],
    description:
      "A selective growth hormone secretagogue (GHS) that stimulates GH release without significantly affecting cortisol or prolactin. One of the cleanest GH-boosting peptides.",
    mechanism:
      "Selectively binds ghrelin/GHS receptors on pituitary cells to trigger GH release. Unlike GHRP-6 or GHRP-2, it doesn't significantly stimulate appetite, cortisol, or prolactin, making it very well-tolerated.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "GH optimization / lean muscle",
        doseRange: "200-300 mcg",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks",
        timing: "Morning, post-workout, and before bed. Inject on empty stomach, wait 20 min before eating.",
      },
      {
        purpose: "Sleep improvement + recovery",
        doseRange: "200-300 mcg",
        frequency: "1x daily (before bed)",
        cycleDuration: "8-12 weeks",
        timing: "30 minutes before bed on empty stomach",
      },
    ],
    sideEffects: ["Headache (transient)", "Mild water retention", "Drowsiness (desired at night)"],
    stacksWith: ["cjc1295_nodac", "mk677", "dsip"],
    halfLife: "~2 hours",
    storage: "Refrigerate reconstituted (2-8°C). Use within 30 days.",
    notes: "The go-to GH secretagogue for beginners due to its excellent safety profile. Best results when combined with CJC-1295 (no DAC).",
  },
  {
    id: "ghkcu",
    name: "GHK-Cu",
    abbreviation: "GHK-Cu",
    categories: ["anti_aging", "recovery"],
    description:
      "Copper peptide naturally found in human plasma. Declines with age. Promotes collagen synthesis, skin repair, wound healing, and has anti-inflammatory properties.",
    mechanism:
      "Activates tissue remodeling genes, stimulates collagen and glycosaminoglycan synthesis, attracts immune cells for wound repair, promotes angiogenesis, and has antioxidant effects via copper ion delivery.",
    routes: ["subcutaneous", "topical"],
    dosingProtocols: [
      {
        purpose: "Systemic anti-aging / tissue repair",
        doseRange: "1-2 mg",
        frequency: "1x daily",
        cycleDuration: "4-6 weeks",
        timing: "Morning or evening, subcutaneous injection",
      },
      {
        purpose: "Skin rejuvenation (topical)",
        doseRange: "Apply cream/serum",
        frequency: "2x daily",
        cycleDuration: "Ongoing",
        timing: "Morning and evening on clean skin",
      },
    ],
    sideEffects: ["Injection site irritation", "Skin discoloration at injection site (temporary)"],
    stacksWith: ["bpc157", "epithalon"],
    halfLife: "~4 hours",
    storage: "Refrigerate reconstituted (2-8°C). Protect from light.",
    notes: "One of the safest peptides with extensive research. Topical forms are widely available OTC in skincare products.",
  },
  {
    id: "semaglutide",
    name: "Semaglutide",
    abbreviation: "Sema",
    categories: ["fat_loss"],
    description:
      "GLP-1 receptor agonist originally developed for type 2 diabetes. Now widely used for weight management. Reduces appetite, slows gastric emptying, and improves insulin sensitivity.",
    mechanism:
      "Mimics GLP-1 hormone, binding receptors in the pancreas (insulin release), brain (appetite suppression via hypothalamic satiety centers), and gut (slowed gastric emptying). Creates a feeling of fullness and reduced food reward signaling.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Weight loss",
        doseRange: "0.25 mg → 0.5 mg → 1.0 mg → 1.7 mg → 2.4 mg (titrate monthly)",
        frequency: "1x per week",
        cycleDuration: "Ongoing (minimum 16 weeks to assess)",
        timing: "Same day each week, any time of day",
      },
    ],
    sideEffects: [
      "Nausea (common, usually subsides)",
      "Vomiting",
      "Diarrhea or constipation",
      "Decreased appetite (desired)",
      "Fatigue",
      "Gallbladder issues (rare)",
      "Pancreatitis (rare)",
    ],
    stacksWith: ["aod9604"],
    halfLife: "~7 days",
    storage: "Refrigerate (2-8°C). Do not freeze. Protect from light.",
    notes: "FDA-approved as Ozempic (diabetes) and Wegovy (weight loss). Requires slow dose titration to minimize GI side effects. Not a peptide in the traditional sense but commonly grouped with them.",
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    categories: ["fat_loss"],
    description:
      "Dual GIP/GLP-1 receptor agonist. More potent than semaglutide for weight loss in clinical trials. Also improves insulin sensitivity and metabolic health.",
    mechanism:
      "Activates both GIP and GLP-1 receptors, creating a dual incretin effect. GIP activation enhances fat metabolism and insulin sensitivity beyond what GLP-1 alone achieves. The combined action produces greater appetite suppression and metabolic improvement.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Weight loss",
        doseRange: "2.5 mg → 5 mg → 7.5 mg → 10 mg → 12.5 mg → 15 mg (titrate monthly)",
        frequency: "1x per week",
        cycleDuration: "Ongoing (minimum 16 weeks)",
        timing: "Same day each week, any time of day",
      },
    ],
    sideEffects: [
      "Nausea (common initially)",
      "Diarrhea",
      "Decreased appetite",
      "Injection site reactions",
      "Fatigue",
      "Gallbladder issues (rare)",
    ],
    stacksWith: [],
    halfLife: "~5 days",
    storage: "Refrigerate (2-8°C). Do not freeze.",
    notes: "FDA-approved as Mounjaro (diabetes) and Zepbound (weight loss). Clinical trials showed average 20-25% body weight loss. Requires slow dose escalation.",
  },
  {
    id: "dsip",
    name: "DSIP",
    abbreviation: "DSIP",
    categories: ["sleep"],
    description:
      "Delta Sleep-Inducing Peptide. A neuropeptide that promotes deep, restorative delta-wave sleep without causing next-day grogginess.",
    mechanism:
      "Modulates sleep architecture by enhancing delta (slow-wave) sleep stages. Acts on GABAergic and serotonergic systems. Also has stress-protective and pain-modulating properties. Normalizes disrupted sleep patterns rather than forcing sedation.",
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "Sleep improvement",
        doseRange: "100-300 mcg",
        frequency: "1x daily (before bed)",
        cycleDuration: "2-4 weeks, then reassess",
        timing: "30-60 minutes before bed, subcutaneous",
      },
    ],
    sideEffects: ["Mild headache", "Vivid dreams", "Grogginess if over-dosed"],
    stacksWith: ["ipamorelin", "bpc157"],
    halfLife: "~15 minutes (but effects last through the night)",
    storage: "Refrigerate reconstituted (2-8°C). Use within 14 days.",
    notes: "Works by normalizing sleep architecture, not by sedation. Users report more restorative sleep and better recovery. Particularly useful during intense training blocks.",
  },
  {
    id: "epithalon",
    name: "Epithalon",
    abbreviation: "Epitalon",
    categories: ["anti_aging"],
    description:
      "Synthetic version of Epithalamin, a polypeptide produced by the pineal gland. Activates telomerase to lengthen telomeres, potentially slowing cellular aging.",
    mechanism:
      "Stimulates telomerase production, the enzyme that adds protective telomere caps to chromosome ends. Telomere shortening is a key mechanism of cellular aging. Also regulates melatonin production and has antioxidant properties.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / telomere support",
        doseRange: "5-10 mg",
        frequency: "1x daily",
        cycleDuration: "10-20 day cycles, 2-3x per year",
        timing: "Evening injection (supports natural melatonin rhythm)",
      },
    ],
    sideEffects: ["Injection site irritation (mild)", "Improved sleep onset (desired)"],
    stacksWith: ["ghkcu"],
    halfLife: "2-4 hours",
    storage: "Refrigerate reconstituted (2-8°C). Store lyophilized at room temperature.",
    notes: "Based on research by Professor Vladimir Khavinson. Telomere-lengthening effects observed in cell culture studies. Typically run in short, periodic cycles rather than continuously.",
  },
  {
    id: "selank",
    name: "Selank",
    categories: ["cognitive", "anti_aging"],
    description:
      "Synthetic analog of the immunomodulatory peptide tuftsin. Developed in Russia for anxiety and cognitive enhancement. Provides anxiolytic effects without sedation.",
    mechanism:
      "Modulates GABA, serotonin, dopamine, and norepinephrine systems. Enhances BDNF (brain-derived neurotrophic factor) expression, supporting neuroplasticity and memory formation. Also has immunomodulatory effects via IL-6 regulation.",
    routes: ["nasal"],
    dosingProtocols: [
      {
        purpose: "Anxiety reduction / cognitive enhancement",
        doseRange: "250-500 mcg",
        frequency: "2-3x daily",
        cycleDuration: "2-4 weeks",
        timing: "Morning and afternoon, nasal spray. Avoid evening dosing.",
      },
    ],
    sideEffects: ["Nasal irritation", "Fatigue (rare)", "Headache (rare)"],
    stacksWith: ["semax"],
    halfLife: "2-3 minutes (but neurological effects persist for hours)",
    storage: "Refrigerate (2-8°C). Nasal spray solution stable for 30 days refrigerated.",
    notes: "Approved in Russia as a prescription anxiolytic. Often stacked with Semax for comprehensive cognitive enhancement. Non-addictive and doesn't cause withdrawal.",
  },
  {
    id: "semax",
    name: "Semax",
    categories: ["cognitive"],
    description:
      "Synthetic analog of ACTH (4-10) fragment. Developed in Russia for cognitive enhancement, neuroprotection, and stroke recovery. Improves focus, memory, and mental clarity.",
    mechanism:
      "Increases BDNF and NGF (nerve growth factor) expression, promoting neurogenesis and synaptic plasticity. Modulates dopaminergic and serotonergic systems. Enhances cerebral blood flow and has neuroprotective properties against oxidative stress.",
    routes: ["nasal"],
    dosingProtocols: [
      {
        purpose: "Cognitive enhancement / focus",
        doseRange: "200-600 mcg",
        frequency: "2-3x daily",
        cycleDuration: "2-4 weeks",
        timing: "Morning and early afternoon, nasal spray. Avoid evening (stimulating).",
      },
    ],
    sideEffects: ["Nasal irritation", "Mild headache", "Irritability at high doses"],
    stacksWith: ["selank"],
    halfLife: "2-3 minutes (neurological effects last hours)",
    storage: "Refrigerate (2-8°C). Nasal solution stable for 30 days.",
    notes: "Approved in Russia for cognitive disorders and stroke recovery. The N-Acetyl Semax Amidate (NASA) form is more potent and longer-lasting. Stimulating — avoid late-day use.",
  },
  {
    id: "aod9604",
    name: "AOD-9604",
    abbreviation: "AOD",
    categories: ["fat_loss"],
    description:
      "Anti-Obesity Drug fragment of human growth hormone (HGH 176-191). Mimics the fat-burning effects of GH without the growth-promoting or diabetogenic effects.",
    mechanism:
      "Stimulates lipolysis (fat breakdown) and inhibits lipogenesis (fat formation) by mimicking the fat-metabolizing region of growth hormone. Does not affect IGF-1 levels or blood sugar, making it safer than full GH for fat loss.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Fat loss",
        doseRange: "300 mcg",
        frequency: "1x daily",
        cycleDuration: "8-12 weeks",
        timing: "Morning on empty stomach, or before fasted cardio. Wait 20 min before eating.",
      },
    ],
    sideEffects: ["Injection site irritation", "Headache (uncommon)", "Mild nausea (rare)"],
    stacksWith: ["semaglutide"],
    halfLife: "~1 hour",
    storage: "Refrigerate reconstituted (2-8°C). Use within 30 days.",
    notes: "GRAS (Generally Recognized As Safe) status in the US for food use. Does not cause the joint pain, insulin resistance, or organ growth associated with full GH use.",
  },
  {
    id: "mk677",
    name: "MK-677",
    abbreviation: "Ibutamoren",
    categories: ["muscle_gain", "sleep"],
    description:
      "An oral growth hormone secretagogue (non-peptide). Mimics ghrelin to stimulate sustained GH and IGF-1 elevation. Popular because it's taken orally.",
    mechanism:
      "Binds the ghrelin receptor (GHSR) in the hypothalamus and pituitary, triggering GH release. Unlike injectable GH secretagogues, it provides sustained 24-hour GH elevation. Also increases appetite via ghrelin pathway activation.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Muscle gain / GH elevation",
        doseRange: "10-25 mg",
        frequency: "1x daily",
        cycleDuration: "8-12 weeks (some run longer)",
        timing: "Before bed to align GH pulse with natural sleep release. Take with small snack if nausea occurs.",
      },
    ],
    sideEffects: [
      "Increased appetite (significant)",
      "Water retention / bloating",
      "Lethargy initially",
      "Numbness/tingling in hands",
      "May increase fasting blood glucose",
    ],
    stacksWith: ["cjc1295_nodac", "ipamorelin"],
    halfLife: "4-6 hours (but GH elevation lasts ~24 hours)",
    storage: "Room temperature. Keep in cool, dry place away from light.",
    notes: "Technically not a peptide but a non-peptide GH secretagogue. Popular due to oral dosing. Monitor blood glucose if running extended cycles. The appetite increase can be significant.",
  },
  {
    id: "pt141",
    name: "PT-141",
    abbreviation: "Bremelanotide",
    categories: [],
    description:
      "Melanocortin receptor agonist used for sexual dysfunction. FDA-approved as Vyleesi for hypoactive sexual desire disorder in premenopausal women. Used off-label by both genders.",
    mechanism:
      "Activates melanocortin receptors (MC3R and MC4R) in the central nervous system, directly stimulating sexual arousal pathways in the brain. Unlike PDE5 inhibitors, it works on desire/arousal rather than blood flow mechanics.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Sexual function enhancement",
        doseRange: "1-2 mg",
        frequency: "As needed, max 1x per 24 hours",
        cycleDuration: "As needed (not for daily use)",
        timing: "45-60 minutes before anticipated activity. Subcutaneous injection in abdomen.",
      },
    ],
    sideEffects: [
      "Nausea (common, usually mild)",
      "Flushing",
      "Headache",
      "Temporary skin darkening with repeated use",
      "Elevated blood pressure (transient)",
    ],
    stacksWith: [],
    halfLife: "~2.7 hours",
    storage: "Refrigerate reconstituted (2-8°C). Use within 30 days.",
    notes: "FDA-approved as Vyleesi. Max 8 doses per month recommended. Nausea is common — start with lower dose (1 mg). Not to be used with uncontrolled hypertension.",
  },
];
