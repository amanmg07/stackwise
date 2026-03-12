import { Peptide } from "../types";

export const peptides: Peptide[] = [
  {
    id: "bpc157",
    name: "BPC-157",
    abbreviation: "BPC",
    categories: ["recovery"],
    description:
      "Body Protection Compound-157 is a synthetic pentadecapeptide (15 amino acids) derived from a protein found in human gastric juice. Known for accelerating healing of muscles, tendons, ligaments, and the gut lining.",
    mechanism:
      "Promotes angiogenesis via VEGFR2 pathway activation. Stimulates nitric oxide synthesis through the Akt-eNOS axis. Activates ERK1/2 signaling for endothelial and muscle repair. Dose- and time-dependently upregulates growth hormone receptor expression in tendon fibroblasts, enhancing collagen synthesis. Reduces inflammatory markers and promotes transition from inflammation to tissue remodeling.",
    routes: ["subcutaneous", "intramuscular", "oral"],
    dosingProtocols: [
      {
        purpose: "General recovery / injury healing",
        doseRange: "250-500 mcg",
        frequency: "1-2x daily",
        cycleDuration: "4-8 weeks on, 8-10 weeks off",
        timing: "Morning and evening (~12 hours apart). Inject near injury site for localized effect or in abdominal fat for systemic effect.",
      },
      {
        purpose: "Gut healing (leaky gut, ulcers, GI inflammation)",
        doseRange: "500 mcg",
        frequency: "2x daily",
        cycleDuration: "4-6 weeks",
        timing: "On empty stomach. Oral/sublingual for gut-specific conditions, or subcutaneous in abdomen for systemic.",
      },
    ],
    sideEffects: ["Nausea (rare)", "Dizziness (rare)", "Injection site irritation (rare)"],
    stacksWith: ["tb500", "ghkcu"],
    halfLife: "< 30 minutes (plasma). Detectable in urine up to 4 days.",
    storage: "Lyophilized powder: -20°C long-term (2-3 year shelf life), 2-8°C short-term. Reconstituted: refrigerate 2-8°C, use within 28-30 days. Reconstitute with bacteriostatic water. Never freeze reconstituted solution.",
    notes: "One of the most well-studied healing peptides. Often combined with TB-500 for the 'Wolverine stack' — do NOT mix both in the same vial as they lose potency in solution. No toxic dose found in animal studies (6 mcg/kg to 20 mg/kg). Not FDA-approved. Banned by WADA.",
  },
  {
    id: "tb500",
    name: "TB-500",
    abbreviation: "TB-500",
    categories: ["recovery", "immune"],
    description:
      "Synthetic version of the active region of Thymosin Beta-4, a naturally occurring 43-amino-acid peptide found in nearly all human and animal cells. Promotes systemic tissue repair, reduces inflammation, and enhances cell migration.",
    mechanism:
      "Upregulates actin, a cell-building protein critical for cell structure, migration, and proliferation. Promotes angiogenesis via VEGF expression. Enhances mobility of repair cells (stem cells, keratinocytes, endothelial cells) to injury sites. Reduces inflammatory cytokines. Works systemically — can repair tissues distant from injection site.",
    routes: ["subcutaneous", "intramuscular"],
    dosingProtocols: [
      {
        purpose: "Injury recovery (loading phase)",
        doseRange: "2-2.5 mg",
        frequency: "2x per week",
        cycleDuration: "4-6 weeks loading",
        timing: "Any time of day. Subcutaneous injection — location doesn't need to be near injury since TB-500 works systemically.",
      },
      {
        purpose: "Maintenance phase",
        doseRange: "750-1000 mcg daily, or 2-2.5 mg 1x per week",
        frequency: "Daily or weekly",
        cycleDuration: "4-6 weeks after loading",
        timing: "Any time of day",
      },
    ],
    sideEffects: ["Injection site irritation/redness", "Temporary fatigue", "Lightheadedness/dizziness", "Mild headaches", "Temporary swelling at injection site"],
    stacksWith: ["bpc157", "ghkcu"],
    halfLife: "2-4 days",
    storage: "Lyophilized powder: 2-8°C short-term, -20°C long-term. Reconstituted: refrigerate 2-8°C, use within 28-30 days with bacteriostatic water. Never freeze reconstituted solution.",
    notes: "Commonly stacked with BPC-157 for synergistic healing — BPC handles localized repair while TB-500 works systemically. Theoretical cancer concern: promotes cell growth and angiogenesis, so avoid with active malignancies. Not FDA-approved. Banned by WADA. Originally studied in equine medicine.",
  },
  {
    id: "cjc1295_nodac",
    name: "CJC-1295 (no DAC)",
    abbreviation: "Mod GRF 1-29",
    categories: ["muscle_gain", "fat_loss", "anti_aging"],
    description:
      "Modified Growth Releasing Factor 1-29. A synthetic GHRH analog that stimulates pulsatile growth hormone release, closely mimicking natural GH secretion patterns.",
    mechanism:
      "Binds GHRH receptors on anterior pituitary somatotroph cells, stimulating synthesis and secretion of growth hormone in a pulsatile pattern. The resulting GH elevation stimulates IGF-1 production in the liver. Preserves the body's natural GH feedback loop.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "GH optimization / body recomp",
        doseRange: "100 mcg per injection (saturation dose based on ~1 mcg/kg)",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks, up to 16 weeks. Some protocols: 5 days on, 2 days off.",
        timing: "On empty stomach — fats and carbs blunt GH release. Morning, post-workout, and before bed. Wait 20 min before eating.",
      },
    ],
    sideEffects: ["Flushing/warmth", "Headache", "Water retention", "Tingling/numbness (transient)", "Mild lethargy"],
    stacksWith: ["ipamorelin", "bpc157", "tb500"],
    halfLife: "~30 minutes",
    storage: "Lyophilized: -20°C long-term, 2-8°C short-term. Reconstituted: refrigerate 2-8°C, use within 28-30 days with bacteriostatic water. Never freeze reconstituted. Discard if cloudy.",
    notes: "Almost always combined with Ipamorelin — GHRH + GHRP synergy produces 2-3x the GH release of either alone. Doses above 100 mcg do not significantly increase GH release but may increase side effects. Preferred over DAC version for more physiological GH pulsing.",
  },
  {
    id: "cjc1295_dac",
    name: "CJC-1295 (with DAC)",
    categories: ["muscle_gain", "fat_loss", "anti_aging"],
    description:
      "Long-acting GHRH analog with Drug Affinity Complex that binds to serum albumin, dramatically extending its half-life. Creates sustained GH elevation over days rather than pulses.",
    mechanism:
      "Same GHRH receptor activation as no-DAC version, but the DAC modification binds to serum albumin in the bloodstream. A single injection can increase plasma GH levels 2-10x for 6+ days and IGF-1 levels 1.5-3x for 9-11 days (Teichman et al. 2006, JCEM).",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Sustained GH elevation",
        doseRange: "1-2 mg per week",
        frequency: "1-2x per week (some split into two 0.5 mg doses)",
        cycleDuration: "8-12 weeks",
        timing: "Evening injection. Consistent schedule each week.",
      },
    ],
    sideEffects: ["Flushing", "Water retention", "Joint stiffness", "Tingling/numbness", "Mild headache", "Fatigue", "Possible blood sugar shifts"],
    stacksWith: ["bpc157", "tb500"],
    halfLife: "5.8-8.1 days (established in human clinical trials)",
    storage: "Lyophilized: 2-8°C short-term, -20°C long-term. Reconstituted: 2-8°C, use within 28-30 days with bacteriostatic water. Never freeze reconstituted.",
    notes: "Less popular than no-DAC version. Creates continuous GH elevation (like a 'GH drip') rather than natural pulses. More convenient (fewer injections) but carries greater risk of pituitary desensitization. Side effects last longer due to extended half-life and cannot be quickly reversed.",
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    categories: ["muscle_gain", "fat_loss", "sleep"],
    description:
      "A highly selective growth hormone secretagogue pentapeptide. Stimulates GH release without significantly affecting cortisol, ACTH, prolactin, or appetite — making it one of the cleanest GHRPs available.",
    mechanism:
      "Mimics ghrelin and binds to growth hormone secretagogue receptors (GHS-R) in the hypothalamus and pituitary. Also reduces somatostatin's inhibitory signal. Highly selective — stimulates GH release without raising cortisol, ACTH, prolactin, or aldosterone. Minimal appetite increase compared to GHRP-2 or GHRP-6.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "GH optimization / lean muscle",
        doseRange: "100-200 mcg per injection when stacking with CJC-1295",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks with breaks between cycles",
        timing: "On empty stomach. Morning, post-workout, and before bed. Wait 20 min before eating.",
      },
      {
        purpose: "Sleep improvement + recovery",
        doseRange: "200-300 mcg",
        frequency: "1x daily before bed",
        cycleDuration: "8-12 weeks",
        timing: "30 minutes before bed on empty stomach — aligns with natural nocturnal GH surge.",
      },
    ],
    sideEffects: ["Headache (most common, usually transient)", "Fatigue/lethargy", "Mild water retention", "Joint pain (uncommon)", "Dizziness (rare)"],
    stacksWith: ["cjc1295_nodac", "dsip", "bpc157", "tb500"],
    halfLife: "~2 hours",
    storage: "Lyophilized: stable 12-18 months at 2-8°C, -20°C to -80°C for long-term. Reconstituted: 2-8°C, use within 28-30 days with bacteriostatic water. Never freeze reconstituted.",
    notes: "The go-to GH secretagogue for beginners due to excellent safety profile. Gold-standard combo is with CJC-1295 (no DAC) — can inject both in the same syringe. Avoid stacking multiple GHRPs together (diminishing returns, amplified side effects).",
  },
  {
    id: "ghkcu",
    name: "GHK-Cu",
    abbreviation: "GHK-Cu",
    categories: ["anti_aging", "recovery"],
    description:
      "Naturally occurring copper tripeptide found in human plasma, saliva, and urine. Levels decline by more than 50% by age 60. Stimulates collagen/elastin production, promotes wound healing, and has anti-inflammatory and antioxidant properties.",
    mechanism:
      "Binds copper(II) ions and influences copper metabolism. Stimulates fibroblasts to produce collagen and elastin. Modulates matrix metalloproteinases (MMPs) and their tissue inhibitors (TIMPs). Helps clear damaged proteins. Influences broad gene expression related to wound healing, antioxidant activity, and anti-inflammatory cascades.",
    routes: ["subcutaneous", "topical"],
    dosingProtocols: [
      {
        purpose: "Systemic anti-aging / tissue repair",
        doseRange: "1-2 mg",
        frequency: "Daily, or 2-3x per week",
        cycleDuration: "30 days on, 14 days off (prevents receptor desensitization and manages copper input)",
        timing: "Morning or evening. Rotate injection sites.",
      },
      {
        purpose: "Skin rejuvenation (topical)",
        doseRange: "Apply cream/serum",
        frequency: "2x daily",
        cycleDuration: "8+ weeks for visible results",
        timing: "Morning and evening on clean skin",
      },
    ],
    sideEffects: ["Injection site swelling/tenderness/bruising (transient)", "Temporary dizziness, nausea, headache", "Topical: mild irritation, tingling, redness, dryness", "Copper toxicity risk at excessive doses (rare)"],
    stacksWith: ["bpc157", "tb500", "epithalon"],
    halfLife: "~30-60 minutes (plasma). Downstream effects (collagen synthesis, healing) continue for days.",
    storage: "Lyophilized powder: -20°C long-term (2-3 year potency). Reconstituted: 2-8°C, use within 30 days. Never freeze reconstituted. Protect from light.",
    notes: "One of the safest peptides with extensive research. Popular triple stack: GHK-Cu + BPC-157 + TB-500 for comprehensive healing. Space oral copper/zinc supplements 2 hours apart from injection. Topical forms widely available OTC in skincare.",
  },
  {
    id: "semaglutide",
    name: "Semaglutide",
    abbreviation: "Sema",
    categories: ["fat_loss"],
    description:
      "GLP-1 receptor agonist originally developed for type 2 diabetes, now widely used for weight management. Reduces appetite, slows gastric emptying, and improves insulin sensitivity. FDA-approved as Ozempic (diabetes) and Wegovy (weight loss).",
    mechanism:
      "Mimics GLP-1 hormone. Stimulates insulin secretion and lowers glucagon in a glucose-dependent manner. Delays gastric emptying in early postprandial phase. Interacts with GLP-1 receptors in hypothalamus to reduce hunger, food cravings, and enhance satiety. C18 fatty di-acid modification promotes albumin binding for extended duration. Amino acid substitutions shield from DPP-4 degradation.",
    routes: ["subcutaneous", "oral"],
    dosingProtocols: [
      {
        purpose: "Weight loss (Wegovy protocol)",
        doseRange: "0.25 mg → 0.5 mg → 1.0 mg → 1.7 mg → 2.4 mg (escalate every 4 weeks)",
        frequency: "1x per week (subcutaneous)",
        cycleDuration: "Ongoing (minimum 16 weeks to assess response)",
        timing: "Same day each week, any time of day. Inject in abdomen, thigh, or upper arm.",
      },
      {
        purpose: "Oral (Rybelsus)",
        doseRange: "3 mg → 7 mg → 14 mg (escalate monthly)",
        frequency: "1x daily",
        cycleDuration: "Ongoing",
        timing: "First thing in morning with ≤4 oz plain water. No food/drink for 30 min after.",
      },
    ],
    sideEffects: [
      "Nausea (up to 44%)",
      "Diarrhea (up to 30%)",
      "Vomiting (up to 24%)",
      "Constipation (up to 24%)",
      "Abdominal pain",
      "Pancreatitis (rare but serious)",
      "Gallbladder disease (2.6% vs 1.2% placebo)",
      "Acute kidney injury (secondary to dehydration from GI effects)",
      "Boxed warning: thyroid C-cell tumors in rodent studies",
    ],
    stacksWith: ["aod9604"],
    halfLife: "~7 days (165-184 hours). Steady state in 4-5 weeks.",
    storage: "Unopened: 2-8°C. After first use (pen): room temp (15-30°C) up to 56 days (Ozempic) or 28 days (Wegovy). Never freeze. Protect from light.",
    notes: "Do NOT stack with tirzepatide or other GLP-1 agonists — overlapping mechanisms with amplified GI side effects. Requires slow dose titration. Contraindicated with personal/family history of medullary thyroid carcinoma or MEN 2. B12 supplementation commonly recommended alongside.",
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    categories: ["fat_loss"],
    description:
      "First-in-class dual GIP/GLP-1 receptor agonist. More potent than semaglutide for weight loss in clinical trials (20-25% average body weight loss). FDA-approved as Mounjaro (diabetes) and Zepbound (weight loss).",
    mechanism:
      "A 39-amino-acid synthetic peptide conjugated to a C20 fatty diacid. Dual agonist at both GIP and GLP-1 receptors. GLP-1 receptor activation improves glucose-mediated insulin secretion and decreases glucagon. GIP receptor activation augments insulin sensitivity. The C20 fatty diacid promotes albumin binding for extended half-life.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Weight loss / metabolic health",
        doseRange: "2.5 mg → 5 mg → 7.5 mg → 10 mg → 12.5 mg → 15 mg (escalate every 4+ weeks)",
        frequency: "1x per week",
        cycleDuration: "Ongoing",
        timing: "Same day each week. Inject in abdomen, thigh, or upper arm. Rotate sites.",
      },
    ],
    sideEffects: [
      "Nausea (increases with dose)",
      "Diarrhea",
      "Vomiting",
      "Constipation",
      "Abdominal pain",
      "Dyspepsia",
      "Hypoglycemia",
      "Pancreatitis (rare)",
      "Gallbladder disease (rare)",
      "Boxed warning: thyroid C-cell tumors in rodent studies",
    ],
    stacksWith: [],
    halfLife: "~5 days (~120 hours). Steady state after ~4 weeks. Minimal drug remains after ~25 days post-discontinuation.",
    storage: "Unopened: 2-8°C. Room temp up to 30°C for max 21 days — do NOT return to refrigerator after. Never freeze. Discard if exposed to temps above 30°C.",
    notes: "Do NOT combine with semaglutide or other GLP-1 agonists. Contraindicated with MTC/MEN 2 history. Requires slow dose escalation to manage GI side effects. If inadequate response, switch — don't stack.",
  },
  {
    id: "dsip",
    name: "DSIP",
    abbreviation: "DSIP",
    categories: ["sleep"],
    description:
      "Delta Sleep-Inducing Peptide. A nonapeptide (9 amino acids) that normalizes sleep architecture and promotes deep, restorative delta-wave sleep without acting as a sedative.",
    mechanism:
      "Modulates the sleep-wake cycle via central nervous system interactions, particularly circadian rhythm regulation. May be mediated through NMDA receptors. Normalizes sleep architecture and promotes slow-wave (delta) sleep. Also modulates corticotropin levels and has stress-protective and antioxidant properties.",
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "Sleep optimization",
        doseRange: "100-300 mcg",
        frequency: "Daily or 3-5x per week",
        cycleDuration: "10-14 days on, then break. Or 2-4 weeks then reassess.",
        timing: "30-60 minutes before bed. Subcutaneous or intranasal.",
      },
    ],
    sideEffects: ["Transient headache (rare)", "Nausea/vertigo (rare)", "Fatigue on waking if over-dosed", "Injection site reactions (mild)"],
    stacksWith: ["ipamorelin", "bpc157", "epithalon"],
    halfLife: "~15 minutes (plasma). Effects persist through the night.",
    storage: "Lyophilized: -20°C, stable up to 24 months. Reconstituted: 2-8°C, use within 3-4 weeks. Never freeze reconstituted. Roll/swirl gently — do not shake.",
    notes: "Described as 'incredibly safe' (European Journal of Anaesthesiology, 2001) — no lethal dose ever found in animal studies. Works by normalizing sleep architecture, not sedation. Avoid stacking with sedating compounds, alcohol, or prescription sleep medications.",
  },
  {
    id: "epithalon",
    name: "Epithalon",
    abbreviation: "Epitalon",
    categories: ["anti_aging"],
    description:
      "Synthetic tetrapeptide (Ala-Glu-Asp-Gly) analog of epithalamin from the pineal gland. Activates telomerase enzyme to elongate telomeres, potentially slowing cellular aging. Also supports melatonin secretion.",
    mechanism:
      "Induces telomerase enzyme activity by reactivating the catalytic subunit (hTERT) of telomerase in somatic cells. Binds to specific DNA sequences via hydrophobic interactions and hydrogen bonds in the telomerase gene promoter region. Additionally supports melatonin secretion from the pineal gland and has documented antioxidant properties.",
    routes: ["subcutaneous", "intramuscular"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / telomere support",
        doseRange: "5-10 mg per day",
        frequency: "1x daily",
        cycleDuration: "10-20 consecutive days, repeated 1-2x per year",
        timing: "Evening injection (supports natural melatonin rhythm). Higher doses do not increase benefits.",
      },
    ],
    sideEffects: ["Injection site reactions (mild — redness, swelling)", "Occasional nausea/diarrhea", "Changes in sleep patterns", "Temporary fatigue", "Mild headaches"],
    stacksWith: ["ghkcu", "dsip"],
    halfLife: "Short (specific duration not well-characterized). Produces lasting genomic changes — telomerase activation persists well beyond plasma clearance.",
    storage: "Lyophilized: stable 3 years at -20°C, 2 years at 2-8°C. Reconstituted: 2-8°C, use within 2-4 weeks. Avoid freeze-thaw cycles.",
    notes: "Based on research by Professor Vladimir Khavinson. A long-term Russian study (6-8 years, 266 elderly subjects) reported no significant toxicity. Run in short periodic bursts, not continuously. Sometimes stacked with Thymalin for longevity protocols.",
  },
  {
    id: "selank",
    name: "Selank",
    categories: ["cognitive", "anti_aging"],
    description:
      "Synthetic heptapeptide (Thr-Lys-Pro-Arg-Pro-Gly-Pro) analog of the immunomodulatory peptide tuftsin. Approved in Russia as a prescription anxiolytic. Provides anxiety reduction and cognitive enhancement without sedation or dependence.",
    mechanism:
      "Allosteric modulation of GABA-A receptors (similar to benzodiazepines but without dependence/withdrawal). Influences monoamine neurotransmitter concentrations and serotonin metabolism. Inhibits enkephalinase enzymes, boosting endogenous opioid peptide (enkephalin) levels. Modulates IL-6 for immune function support.",
    routes: ["nasal", "subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Anxiety reduction / cognitive enhancement",
        doseRange: "200-500 mcg",
        frequency: "2-3x daily",
        cycleDuration: "2-4 weeks",
        timing: "Intranasal: 2-3 drops per nostril. Or subcutaneous 250-500 mcg. Can be used anytime — non-sedating.",
      },
    ],
    sideEffects: ["Nasal irritation (spray form)", "Fatigue (rare)", "Mild headache (rare)"],
    stacksWith: ["semax", "dsip", "bpc157"],
    halfLife: "~10 minutes (undetectable in blood quickly). Biological effects persist much longer than plasma presence.",
    storage: "Powder: 2-8°C short-term, -20°C long-term (stable 2+ years frozen). Protect from light and moisture.",
    notes: "Approved in Russia as prescription anxiolytic. Key advantage over benzodiazepines: no amnesia, no dependence, no tolerance, no withdrawal, no sedation at standard doses. Classic nootropic stack with Semax — space nasal doses 15-30 minutes apart.",
  },
  {
    id: "semax",
    name: "Semax",
    categories: ["cognitive"],
    description:
      "Synthetic heptapeptide (Met-Glu-His-Phe-Pro-Gly-Pro) analog of ACTH 4-10 fragment. Approved in Russia for cognitive disorders and stroke recovery. Enhances focus, memory, and mental clarity via BDNF/NGF upregulation.",
    mechanism:
      "Upregulates brain-derived neurotrophic factor (BDNF) and nerve growth factor (NGF), supporting neuronal survival, plasticity, and growth. May interact with melanocortin receptors (MC4, MC5). Inhibits enkephalinase enzymes. Modulates dopamine pathways. Does NOT stimulate cortisol release (unlike parent molecule ACTH).",
    routes: ["nasal", "subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Cognitive enhancement / focus",
        doseRange: "100-600 mcg",
        frequency: "1-3x daily",
        cycleDuration: "2-4 weeks on, 2 weeks off. Or 5-10 day courses during high cognitive demand.",
        timing: "Intranasal: 1-2 drops per nostril. Use earlier in the day — stimulating. Avoid evening dosing.",
      },
    ],
    sideEffects: ["Nasal irritation (spray form)", "Temporary blood pressure increase at higher doses", "Irritability/emotional sensitivity as effects wear off", "No dependence, tolerance, or withdrawal"],
    stacksWith: ["selank", "bpc157"],
    halfLife: "> 1 hour (serum). Effects persist 20-24 hours at doses of 0.015-0.050 mg/kg.",
    storage: "Powder: 2-8°C short-term, -20°C long-term (stable 2+ years frozen). Protect from light and moisture. Never freeze reconstituted.",
    notes: "Approved in Russia for cognitive disorders and stroke recovery. The N-Acetyl Semax Amidate (NASA) form is more potent and longer-lasting. Stimulating — avoid late-day use. Classic nootropic stack with Selank. Poor oral bioavailability — must be nasal or injected.",
  },
  {
    id: "aod9604",
    name: "AOD-9604",
    abbreviation: "AOD",
    categories: ["fat_loss"],
    description:
      "Anti-Obesity Drug fragment of human growth hormone (HGH amino acids 176-191). Mimics the fat-burning effects of GH without growth-promoting or diabetogenic effects. Has GRAS status in the US.",
    mechanism:
      "Stimulates lipolysis (fat breakdown) and inhibits lipogenesis (fat formation) by mimicking the fat-metabolizing region of growth hormone. Does not affect IGF-1 levels or blood sugar, making it safer than full GH for targeted fat loss.",
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
    stacksWith: ["semaglutide", "cjc1295_nodac", "ipamorelin"],
    halfLife: "~1 hour",
    storage: "Reconstituted: 2-8°C, use within 30 days. Lyophilized: room temp or refrigerated.",
    notes: "GRAS (Generally Recognized As Safe) status in the US. Does not cause the joint pain, insulin resistance, or organ growth associated with full GH. Limited clinical trial data — has not progressed through full regulatory approval as a therapeutic. Not FDA-approved.",
  },
  {
    id: "mk677",
    name: "MK-677",
    abbreviation: "Ibutamoren",
    categories: ["muscle_gain", "sleep"],
    description:
      "An oral (non-peptide) growth hormone secretagogue that mimics ghrelin to stimulate sustained GH and IGF-1 elevation. Popular due to oral dosing — no injections required.",
    mechanism:
      "Binds the ghrelin receptor (GHSR) in the hypothalamus and pituitary, triggering GH release. Provides sustained 24-hour GH elevation unlike injectable secretagogues. Also increases appetite via ghrelin pathway activation. Clinical studies used 25 mg orally per day (Nass et al., JCEM).",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Muscle gain / GH elevation",
        doseRange: "10-25 mg",
        frequency: "1x daily",
        cycleDuration: "8-12 weeks (some run longer with monitoring)",
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
    notes: "Not a peptide — it's a non-peptide GH secretagogue (oral small molecule). Never received FDA approval; sold as a research chemical. Monitor blood glucose on extended cycles. The appetite increase can be significant. Published clinical trial data exists (Nass et al., JCEM) using 25 mg/day.",
  },
  {
    id: "pt141",
    name: "PT-141",
    abbreviation: "Bremelanotide",
    categories: [],
    description:
      "Melanocortin receptor agonist FDA-approved as Vyleesi for hypoactive sexual desire disorder in premenopausal women. Works on desire/arousal pathways in the brain, unlike PDE5 inhibitors which affect blood flow.",
    mechanism:
      "Activates melanocortin receptors (MC3R and MC4R) in the central nervous system, directly stimulating sexual arousal pathways in the brain. Works on desire and arousal rather than blood flow mechanics.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Sexual function enhancement",
        doseRange: "1.75 mg (FDA-approved dose)",
        frequency: "As needed, max 1x per 24 hours, max 8 doses per month",
        cycleDuration: "As needed (not for daily use)",
        timing: "At least 45 minutes before anticipated activity. Subcutaneous injection in abdomen.",
      },
    ],
    sideEffects: [
      "Nausea (common — up to 40%)",
      "Flushing",
      "Headache",
      "Temporary skin darkening with repeated use",
      "Elevated blood pressure (transient)",
      "Injection site reactions",
    ],
    stacksWith: [],
    halfLife: "~2.7 hours",
    storage: "Refrigerate reconstituted (2-8°C). Use within 30 days.",
    notes: "FDA-approved as Vyleesi (1.75 mg auto-injector). Max 8 doses per month. Start lower (1 mg) if nausea is a concern. Contraindicated with uncontrolled hypertension. Prescribed by physicians — consult a healthcare provider.",
  },
];
