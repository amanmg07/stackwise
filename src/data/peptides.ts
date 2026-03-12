import { Peptide } from "../types";

export const peptides: Peptide[] = [
  {
    id: "bpc157",
    name: "BPC-157",
    abbreviation: "BPC",
    categories: ["recovery"],
    description:
      "A healing peptide made from a protein in your stomach. Speeds up recovery of muscles, tendons, ligaments, and gut lining. One of the most popular peptides for injury repair.",
    mechanism:
      "Grows new blood vessels to injured areas, boosts growth hormone receptors in tendons for better collagen production, and reduces inflammation. Helps your body shift from the 'damaged' phase to the 'rebuilding' phase faster.",
    routes: ["subcutaneous", "intramuscular", "oral"],
    dosingProtocols: [
      {
        purpose: "Injury healing",
        doseRange: "250-500 mcg",
        frequency: "1-2x daily",
        cycleDuration: "4-8 weeks on, 8-10 weeks off",
        timing: "Morning and evening, ~12 hours apart. Inject near the injury for best results, or in belly fat for whole-body effect.",
      },
      {
        purpose: "Gut healing",
        doseRange: "500 mcg",
        frequency: "2x daily",
        cycleDuration: "4-6 weeks",
        timing: "Empty stomach. Take orally for gut issues, or inject in abdomen.",
      },
    ],
    sideEffects: ["Nausea (rare)", "Dizziness (rare)", "Injection site irritation (rare)"],
    stacksWith: ["tb500", "ghkcu"],
    halfLife: "Under 30 minutes in blood. Detectable in urine up to 4 days.",
    storage: "Powder: freezer for long-term (2-3 years), fridge for short-term. Mixed: keep in fridge, use within 30 days. Mix with bacteriostatic water. Never freeze after mixing.",
    notes: "Often paired with TB-500 ('Wolverine stack') — but don't mix them in the same vial, they lose strength. No toxic dose found in animal studies. Not FDA-approved. Banned by WADA.",
  },
  {
    id: "tb500",
    name: "TB-500",
    abbreviation: "TB-500",
    categories: ["recovery", "immune"],
    description:
      "A healing peptide based on Thymosin Beta-4, a protein your body naturally makes. Works throughout your entire body to repair tissue, reduce inflammation, and speed recovery. Great for injuries that are slow to heal.",
    mechanism:
      "Boosts a protein called actin that helps cells move and rebuild. Sends repair cells (including stem cells) to injury sites faster. Reduces inflammation. Unlike BPC-157, it works body-wide — doesn't matter where you inject it.",
    routes: ["subcutaneous", "intramuscular"],
    dosingProtocols: [
      {
        purpose: "Loading phase (first 4-6 weeks)",
        doseRange: "2-2.5 mg",
        frequency: "2x per week",
        cycleDuration: "4-6 weeks",
        timing: "Any time of day. Injection location doesn't need to be near the injury.",
      },
      {
        purpose: "Maintenance phase",
        doseRange: "750-1000 mcg daily, or 2-2.5 mg weekly",
        frequency: "Daily or weekly",
        cycleDuration: "4-6 weeks after loading",
        timing: "Any time of day",
      },
    ],
    sideEffects: ["Injection site redness", "Temporary tiredness", "Lightheadedness", "Mild headaches", "Temporary swelling at injection site"],
    stacksWith: ["bpc157", "ghkcu"],
    halfLife: "2-4 days (stays active much longer than BPC-157)",
    storage: "Powder: fridge short-term, freezer long-term. Mixed: keep in fridge, use within 30 days with bacteriostatic water. Never freeze after mixing.",
    notes: "Best paired with BPC-157 — BPC targets the injury locally while TB-500 heals body-wide. Caution: because it promotes cell growth, avoid if you have active cancer. Not FDA-approved. Banned by WADA.",
  },
  {
    id: "cjc1295_nodac",
    name: "CJC-1295 (no DAC)",
    abbreviation: "Mod GRF 1-29",
    categories: ["muscle_gain", "fat_loss", "anti_aging"],
    description:
      "A growth hormone booster that triggers your body's natural GH pulses. The 'no DAC' version gives you short, natural-feeling GH spikes — the way your body is meant to release it.",
    mechanism:
      "Tells your pituitary gland to release growth hormone in natural pulses. This raises IGF-1 levels, which helps build muscle, burn fat, and recover faster. Keeps your body's natural GH rhythm intact.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "GH boost / body recomp",
        doseRange: "100 mcg per injection",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks. Some do 5 days on, 2 off.",
        timing: "Empty stomach (food blunts GH release). Best times: morning, post-workout, before bed. Wait 20 min before eating.",
      },
    ],
    sideEffects: ["Flushing/warmth", "Headache", "Water retention", "Tingling/numbness (temporary)", "Mild tiredness"],
    stacksWith: ["ipamorelin", "bpc157", "tb500"],
    halfLife: "~30 minutes",
    storage: "Powder: freezer long-term, fridge short-term. Mixed: fridge, use within 30 days. Never freeze after mixing. Toss if cloudy.",
    notes: "Almost always used with Ipamorelin — together they release 2-3x more GH than either alone. Going above 100 mcg doesn't help much but increases side effects. Preferred over the DAC version for natural GH pulsing.",
  },
  {
    id: "cjc1295_dac",
    name: "CJC-1295 (with DAC)",
    categories: ["muscle_gain", "fat_loss", "anti_aging"],
    description:
      "The long-acting version of CJC-1295. One injection keeps GH elevated for days instead of hours. More convenient but less natural than the no-DAC version.",
    mechanism:
      "Same GH-releasing action as the no-DAC version, but attaches to a protein in your blood (albumin) so it stays active much longer. One shot can raise GH levels for 6+ days and IGF-1 for 9-11 days.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Sustained GH elevation",
        doseRange: "1-2 mg per week",
        frequency: "1-2x per week",
        cycleDuration: "8-12 weeks",
        timing: "Evening injection. Same schedule each week.",
      },
    ],
    sideEffects: ["Flushing", "Water retention", "Joint stiffness", "Tingling/numbness", "Mild headache", "Tiredness", "Possible blood sugar changes"],
    stacksWith: ["bpc157", "tb500"],
    halfLife: "5.8-8.1 days (confirmed in human studies)",
    storage: "Powder: fridge short-term, freezer long-term. Mixed: fridge, use within 30 days. Never freeze after mixing.",
    notes: "Less popular than the no-DAC version. Keeps GH constantly elevated instead of natural pulses — more convenient (fewer shots) but higher risk of your pituitary becoming less responsive over time. Side effects last longer since you can't 'turn it off.'",
  },
  {
    id: "ipamorelin",
    name: "Ipamorelin",
    categories: ["muscle_gain", "fat_loss", "sleep"],
    description:
      "One of the cleanest GH-boosting peptides available. Triggers growth hormone release without messing with your cortisol, appetite, or other hormones. Great for beginners.",
    mechanism:
      "Mimics ghrelin (the hunger hormone) to tell your pituitary to release GH, but it's very selective — it only triggers GH, not cortisol, appetite, or prolactin. This makes it much cleaner than similar peptides like GHRP-6.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "GH boost / lean muscle",
        doseRange: "100-200 mcg per injection (when stacking with CJC-1295)",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks, then take a break",
        timing: "Empty stomach. Morning, post-workout, before bed. Wait 20 min before eating.",
      },
      {
        purpose: "Better sleep + recovery",
        doseRange: "200-300 mcg",
        frequency: "1x daily before bed",
        cycleDuration: "8-12 weeks",
        timing: "30 min before bed on empty stomach. Matches your body's natural nighttime GH spike.",
      },
    ],
    sideEffects: ["Headache (most common, goes away)", "Tiredness", "Mild water retention", "Joint pain (uncommon)", "Dizziness (rare)"],
    stacksWith: ["cjc1295_nodac", "dsip", "bpc157", "tb500"],
    halfLife: "~2 hours",
    storage: "Powder: fridge 12-18 months, freezer for longer. Mixed: fridge, use within 30 days. Never freeze after mixing.",
    notes: "The #1 GH peptide for beginners. Best combo is with CJC-1295 (no DAC) — you can mix them in the same syringe. Don't stack multiple GH peptides together (diminishing returns, more side effects).",
  },
  {
    id: "ghkcu",
    name: "GHK-Cu",
    abbreviation: "GHK-Cu",
    categories: ["anti_aging", "recovery"],
    description:
      "A copper peptide your body naturally makes, but levels drop by half after age 60. Boosts collagen, helps wounds heal faster, and fights signs of aging. Available as injections or skin creams.",
    mechanism:
      "Delivers copper to your cells, which triggers them to produce more collagen and elastin. Clears out damaged proteins and turns on genes for healing, antioxidant protection, and reducing inflammation.",
    routes: ["subcutaneous", "topical"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / tissue repair (injection)",
        doseRange: "1-2 mg",
        frequency: "Daily, or 2-3x per week",
        cycleDuration: "30 days on, 14 days off",
        timing: "Morning or evening. Rotate injection sites.",
      },
      {
        purpose: "Skin rejuvenation (cream/serum)",
        doseRange: "Apply topically",
        frequency: "2x daily",
        cycleDuration: "8+ weeks for visible results",
        timing: "Morning and evening on clean skin",
      },
    ],
    sideEffects: ["Injection site swelling/bruising (temporary)", "Temporary dizziness, nausea, headache", "Topical: mild irritation, tingling, redness", "Copper buildup at high doses (rare)"],
    stacksWith: ["bpc157", "tb500", "epithalon"],
    halfLife: "30-60 minutes in blood, but the healing effects last days.",
    storage: "Powder: freezer for long-term (2-3 years). Mixed: fridge, use within 30 days. Never freeze after mixing. Keep away from light.",
    notes: "One of the safest peptides. Popular triple stack: GHK-Cu + BPC-157 + TB-500 for full-body healing. If you take copper or zinc supplements, space them 2 hours from injection. Topical versions available over-the-counter in skincare products.",
  },
  {
    id: "semaglutide",
    name: "Semaglutide",
    abbreviation: "Sema",
    categories: ["fat_loss"],
    description:
      "The active ingredient in Ozempic and Wegovy. Crushes appetite, slows digestion, and improves blood sugar control. FDA-approved for both diabetes and weight loss. Taken once weekly.",
    mechanism:
      "Mimics a gut hormone called GLP-1 that tells your brain you're full. Slows down how fast food leaves your stomach so you stay satisfied longer. Also helps your body manage blood sugar better.",
    routes: ["subcutaneous", "oral"],
    dosingProtocols: [
      {
        purpose: "Weight loss (weekly injection)",
        doseRange: "Start 0.25 mg, increase monthly: 0.5 → 1.0 → 1.7 → 2.4 mg",
        frequency: "1x per week",
        cycleDuration: "Ongoing (give it at least 16 weeks)",
        timing: "Same day each week, any time. Inject in belly, thigh, or upper arm.",
      },
      {
        purpose: "Oral (Rybelsus)",
        doseRange: "Start 3 mg, then 7 mg, then 14 mg (monthly increases)",
        frequency: "1x daily",
        cycleDuration: "Ongoing",
        timing: "First thing in the morning with a small sip of water. Don't eat or drink for 30 min after.",
      },
    ],
    sideEffects: [
      "Nausea (very common, especially early on)",
      "Diarrhea",
      "Vomiting",
      "Constipation",
      "Stomach pain",
      "Pancreatitis (rare but serious)",
      "Gallbladder problems (uncommon)",
      "Kidney issues from dehydration (rare)",
    ],
    stacksWith: ["aod9604"],
    halfLife: "~7 days. Takes 4-5 weeks to reach full levels in your body.",
    storage: "Unopened: fridge. After first use: room temp or fridge, up to 56 days (Ozempic) or 28 days (Wegovy). Never freeze.",
    notes: "Do NOT take with tirzepatide or other GLP-1 drugs — same mechanism, double the side effects. Start low and increase slowly to minimize nausea. Not safe if you or your family have thyroid cancer history. B12 supplements recommended.",
  },
  {
    id: "tirzepatide",
    name: "Tirzepatide",
    categories: ["fat_loss"],
    description:
      "The active ingredient in Mounjaro and Zepbound. Even stronger than semaglutide for weight loss (20-25% body weight in trials). Works on two hunger pathways instead of one. Taken once weekly.",
    mechanism:
      "Hits two targets at once: GIP and GLP-1 receptors. GLP-1 kills your appetite and slows digestion. GIP improves how your body handles sugar and fat. The double action is why it outperforms semaglutide in studies.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Weight loss",
        doseRange: "Start 2.5 mg, increase monthly: 5 → 7.5 → 10 → 12.5 → 15 mg",
        frequency: "1x per week",
        cycleDuration: "Ongoing",
        timing: "Same day each week. Inject in belly, thigh, or upper arm. Rotate sites.",
      },
    ],
    sideEffects: [
      "Nausea (gets worse at higher doses)",
      "Diarrhea",
      "Vomiting",
      "Constipation",
      "Stomach pain",
      "Low blood sugar",
      "Pancreatitis (rare)",
      "Gallbladder problems (rare)",
    ],
    stacksWith: [],
    halfLife: "~5 days. Full levels after ~4 weeks of weekly dosing.",
    storage: "Unopened: fridge. Room temp up to 30°C for max 21 days — don't put it back in the fridge after. Never freeze.",
    notes: "Do NOT combine with semaglutide or other GLP-1 drugs. Increase dose slowly to avoid bad nausea. Not safe with thyroid cancer history. If it's not working well enough, switch to a different drug — don't add another one on top.",
  },
  {
    id: "dsip",
    name: "DSIP",
    abbreviation: "DSIP",
    categories: ["sleep"],
    description:
      "Delta Sleep-Inducing Peptide. Helps you get deeper, more restful sleep without knocking you out like a sleeping pill. Fixes your sleep patterns instead of forcing sedation.",
    mechanism:
      "Works with your brain's sleep-wake system to increase deep (delta wave) sleep — the most restorative stage. Also helps manage stress hormones and has antioxidant effects. Doesn't sedate you; it normalizes your natural sleep rhythm.",
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "Better sleep",
        doseRange: "100-300 mcg",
        frequency: "Daily or 3-5x per week",
        cycleDuration: "10-14 days, then take a break. Or 2-4 weeks and reassess.",
        timing: "30-60 minutes before bed. Inject or use nasal spray.",
      },
    ],
    sideEffects: ["Headache (rare)", "Nausea (rare)", "Grogginess if you take too much", "Mild injection site irritation"],
    stacksWith: ["ipamorelin", "bpc157", "epithalon"],
    halfLife: "~15 minutes in blood, but the sleep effects last all night.",
    storage: "Powder: freezer, stable up to 2 years. Mixed: fridge, use within 3-4 weeks. Never freeze after mixing. Swirl gently — don't shake.",
    notes: "Considered very safe — no lethal dose has ever been found in animal studies. Don't mix with sleeping pills, alcohol, or other sedating substances.",
  },
  {
    id: "epithalon",
    name: "Epithalon",
    abbreviation: "Epitalon",
    categories: ["anti_aging"],
    description:
      "An anti-aging peptide that activates telomerase — the enzyme that protects your DNA from aging. Also supports melatonin production for better sleep. Used in short bursts 1-2 times per year.",
    mechanism:
      "Turns on telomerase, the enzyme that rebuilds the protective caps (telomeres) on the ends of your DNA. As we age, these caps shrink and cells stop working well. Epithalon helps maintain them. Also boosts melatonin from the pineal gland.",
    routes: ["subcutaneous", "intramuscular"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / telomere support",
        doseRange: "5-10 mg per day",
        frequency: "1x daily",
        cycleDuration: "10-20 days in a row, repeat 1-2x per year",
        timing: "Evening injection (supports your natural melatonin rhythm). Taking more doesn't help more.",
      },
    ],
    sideEffects: ["Mild injection site redness/swelling", "Occasional nausea", "Sleep pattern changes", "Temporary tiredness", "Mild headaches"],
    stacksWith: ["ghkcu", "dsip"],
    halfLife: "Short, but the effects on your DNA last much longer than the peptide stays in your blood.",
    storage: "Powder: freezer 3 years, fridge 2 years. Mixed: fridge, use within 2-4 weeks. Don't freeze and thaw repeatedly.",
    notes: "Run in short bursts, not continuously. A Russian study followed 266 elderly people for 6-8 years on Epithalon with no significant side effects. Often combined with GHK-Cu for a full anti-aging protocol.",
  },
  {
    id: "selank",
    name: "Selank",
    categories: ["cognitive", "anti_aging"],
    description:
      "A Russian-developed anxiety and brain peptide. Reduces stress and anxiety like a benzo (Xanax) but without the addiction, drowsiness, or withdrawal. Also sharpens thinking.",
    mechanism:
      "Works on your brain's GABA system (like benzos do) but without causing dependence. Also boosts serotonin and natural feel-good chemicals called enkephalins. Supports immune function too.",
    routes: ["nasal", "subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Anxiety relief / sharper thinking",
        doseRange: "200-500 mcg",
        frequency: "2-3x daily",
        cycleDuration: "2-4 weeks",
        timing: "Nasal spray: 2-3 drops per nostril. Or inject 250-500 mcg. Can use anytime — it won't make you sleepy.",
      },
    ],
    sideEffects: ["Nasal irritation (spray)", "Tiredness (rare)", "Mild headache (rare)"],
    stacksWith: ["semax", "dsip", "bpc157"],
    halfLife: "~10 minutes in blood, but brain effects last much longer.",
    storage: "Powder: fridge short-term, freezer long-term (2+ years). Keep away from light and moisture.",
    notes: "Approved as a prescription drug in Russia. Big advantage over benzos: no amnesia, no addiction, no tolerance, no withdrawal, no drowsiness. Pairs perfectly with Semax — Selank calms, Semax focuses. Space nasal doses 15-30 minutes apart.",
  },
  {
    id: "semax",
    name: "Semax",
    categories: ["cognitive"],
    description:
      "A Russian-developed brain peptide for focus, memory, and mental clarity. Boosts brain growth factors (BDNF and NGF) that help neurons grow and form new connections. Stimulating — like a clean, jitter-free cognitive boost.",
    mechanism:
      "Increases BDNF and NGF — proteins that help your brain cells survive, grow, and form new connections. Boosts dopamine for better focus and motivation. Does NOT raise cortisol (your stress hormone), even though it's based on a stress hormone fragment.",
    routes: ["nasal", "subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Focus / cognitive boost",
        doseRange: "100-600 mcg",
        frequency: "1-3x daily",
        cycleDuration: "2-4 weeks on, 2 weeks off. Or 5-10 day bursts when you need it.",
        timing: "Nasal spray: 1-2 drops per nostril. Use in the morning/afternoon — it's stimulating. Avoid evening use.",
      },
    ],
    sideEffects: ["Nasal irritation (spray)", "Slight blood pressure increase at high doses", "Irritability when wearing off", "No addiction or withdrawal"],
    stacksWith: ["selank", "bpc157"],
    halfLife: "Over 1 hour in blood. Effects last 20-24 hours.",
    storage: "Powder: fridge short-term, freezer long-term (2+ years). Keep away from light and moisture. Don't freeze after mixing.",
    notes: "Approved in Russia for brain disorders and stroke recovery. The NASA form (N-Acetyl Semax Amidate) is stronger and longer-lasting. Classic combo: Semax for focus + Selank for calm. Can't be taken orally — must be nasal or injected.",
  },
  {
    id: "aod9604",
    name: "AOD-9604",
    abbreviation: "AOD",
    categories: ["fat_loss"],
    description:
      "A fragment of growth hormone that only does the fat-burning part. Burns fat and blocks new fat creation without the downsides of full GH (no joint pain, no blood sugar issues, no organ growth).",
    mechanism:
      "Mimics the specific part of growth hormone responsible for breaking down fat and stopping new fat from forming. Doesn't raise IGF-1 or affect blood sugar, so it's much safer than taking actual growth hormone for fat loss.",
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
    storage: "Mixed: fridge, use within 30 days. Powder: room temp or fridge.",
    notes: "Has GRAS (Generally Recognized As Safe) status in the US. Much safer than full growth hormone for fat loss — no joint pain, insulin resistance, or organ growth. Not FDA-approved as a drug. Limited clinical trial data.",
  },
  {
    id: "mk677",
    name: "MK-677",
    abbreviation: "Ibutamoren",
    categories: ["muscle_gain", "sleep"],
    description:
      "An oral GH booster — no injections needed. Raises growth hormone and IGF-1 levels for a full 24 hours from one pill. Popular for muscle gain and better sleep, but it will make you hungry.",
    mechanism:
      "Mimics ghrelin (hunger hormone) to tell your brain to release growth hormone. Unlike injectable GH peptides that give short spikes, MK-677 keeps GH elevated all day. The catch: it also strongly increases appetite.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Muscle gain / GH boost",
        doseRange: "10-25 mg",
        frequency: "1x daily",
        cycleDuration: "8-12 weeks (longer with blood work monitoring)",
        timing: "Before bed — matches your natural nighttime GH release. Take with a small snack if it makes you nauseous.",
      },
    ],
    sideEffects: [
      "Increased appetite (can be intense)",
      "Water retention / bloating",
      "Tiredness at first",
      "Numbness/tingling in hands",
      "May raise fasting blood sugar",
    ],
    stacksWith: ["cjc1295_nodac", "ipamorelin"],
    halfLife: "4-6 hours, but GH stays elevated ~24 hours.",
    storage: "Room temperature. Keep cool, dry, and away from light.",
    notes: "Technically not a peptide — it's a pill. Never FDA-approved; sold as a research compound. Watch your blood sugar on longer cycles. The hunger increase can be significant — plan for it.",
  },
  {
    id: "pt141",
    name: "PT-141",
    abbreviation: "Bremelanotide",
    categories: [],
    description:
      "FDA-approved (as Vyleesi) for low sexual desire. Unlike Viagra which works on blood flow, PT-141 works in your brain to boost actual desire and arousal. Used as-needed, not daily.",
    mechanism:
      "Activates receptors in your brain that control sexual desire and arousal. Works on the wanting, not just the mechanics — which is why it's different from drugs like Viagra or Cialis.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Sexual desire / arousal",
        doseRange: "1.75 mg (FDA-approved dose). Start at 1 mg if nausea is a concern.",
        frequency: "As needed. Max once per day, max 8 times per month.",
        cycleDuration: "As needed (not for daily use)",
        timing: "At least 45 minutes before. Inject in the belly.",
      },
    ],
    sideEffects: [
      "Nausea (common — up to 40%)",
      "Flushing (warm/red skin)",
      "Headache",
      "Skin darkening with repeated use",
      "Temporary blood pressure increase",
    ],
    stacksWith: [],
    halfLife: "~2.7 hours",
    storage: "Mixed: fridge, use within 30 days.",
    notes: "FDA-approved as Vyleesi. Max 8 doses per month. Start with 1 mg to test your tolerance for nausea. Don't use if you have uncontrolled high blood pressure. Talk to a doctor first.",
  },
];
