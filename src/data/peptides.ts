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
    categories: ["sexual_health"],
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
  {
    id: "tesamorelin",
    name: "Tesamorelin",
    abbreviation: "Tesa",
    categories: ["fat_loss", "anti_aging"],
    description:
      "An FDA-approved injectable that boosts your body's own growth hormone production. Mainly used to burn stubborn belly fat — especially the deep visceral fat around your organs.",
    mechanism:
      "Mimics the natural brain signal (GHRH) that tells your pituitary gland to release growth hormone. More GH means your body gets better at burning fat, especially around the midsection.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Belly fat reduction",
        doseRange: "1.4-2 mg",
        frequency: "1x daily",
        cycleDuration: "Reassess at 6 months. Stop if no improvement.",
        timing: "Morning on empty stomach. Inject in belly area.",
      },
    ],
    sideEffects: ["Injection site redness/itching (~25%)", "Joint pain", "Swelling in hands/feet", "Muscle pain", "Numbness/tingling"],
    stacksWith: ["ipamorelin", "cjc1295_nodac", "ghrp2"],
    halfLife: "~26-38 minutes",
    storage: "Fridge. Use immediately after mixing.",
    notes: "FDA-approved for HIV-related belly fat buildup (as Egrifta). Off-label use for general fat loss is common but not FDA-sanctioned. Don't use if you have active cancer or pituitary issues.",
  },
  {
    id: "retatrutide",
    name: "Retatrutide",
    abbreviation: "Reta",
    categories: ["fat_loss"],
    description:
      "The first 'triple agonist' weight loss drug — hits three different hunger/metabolism receptors at once. In trials, people lost up to 24% body weight in 48 weeks. More weight loss than any other medication tested.",
    mechanism:
      "Activates three receptors at once: GLP-1 (kills appetite and slows digestion), GIP (improves sugar and fat handling), and glucagon (burns stored fat and sugar). The triple hit is why it outperforms semaglutide and tirzepatide.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Weight loss",
        doseRange: "Start at 2 mg, increase up to 12 mg",
        frequency: "1x per week",
        cycleDuration: "Ongoing (48 weeks in trials)",
        timing: "Any time of day, with or without food.",
      },
    ],
    sideEffects: ["Nausea", "Diarrhea", "Vomiting", "Constipation", "Decreased appetite"],
    stacksWith: [],
    halfLife: "~6 days (supports once-weekly dosing)",
    storage: "Fridge at 2-8°C.",
    notes: "NOT yet FDA-approved — still in Phase 3 trials (Eli Lilly's TRIUMPH program). Any product sold as retatrutide right now is a research chemical. Expected to be a blockbuster if approved.",
  },
  {
    id: "kpv",
    name: "KPV",
    categories: ["immune", "recovery"],
    description:
      "A tiny 3-amino-acid peptide with powerful anti-inflammatory effects. Especially popular for gut health issues and inflammation. Part of the popular 'KLOW' blend along with BPC-157, TB-500, and GHK-Cu.",
    mechanism:
      "Blocks NF-kB — the master switch for inflammation in your body. Gets into gut cells through a special transporter (PepT1), which is why it works so well for gut inflammation specifically.",
    routes: ["subcutaneous", "oral", "topical"],
    dosingProtocols: [
      {
        purpose: "Gut inflammation / general anti-inflammatory",
        doseRange: "200-500 mcg (injection) or 500 mcg - 1 mg (oral)",
        frequency: "1x daily",
        cycleDuration: "4-8 weeks",
        timing: "Empty stomach. Morning or evening.",
      },
      {
        purpose: "Skin inflammation (topical)",
        doseRange: "Applied to affected area",
        frequency: "1-2x daily",
        cycleDuration: "As needed",
        timing: "On clean skin.",
      },
    ],
    sideEffects: ["Very well tolerated", "Mild injection site irritation", "Rare mild fatigue"],
    stacksWith: ["bpc157", "tb500", "ghkcu", "ll37"],
    halfLife: "Short (exact human data not established)",
    storage: "Fridge at 2-8°C. Use mixed solution within a few weeks.",
    notes: "Part of the KLOW blend (KPV + BPC-157 + TB-500 + GHK-Cu). The GLOW blend is the same minus KPV. One of the rare peptides that works well orally because of how it's absorbed in the gut. Not FDA-approved.",
  },
  {
    id: "thymosin_a1",
    name: "Thymosin Alpha-1",
    abbreviation: "TA1",
    categories: ["immune", "anti_aging"],
    description:
      "An immune-boosting peptide from the thymus gland (the organ that trains your immune cells). Approved in 35+ countries for hepatitis and immune support. One of the most studied peptides with an excellent safety record.",
    mechanism:
      "Wakes up your immune system's 'scout' cells (dendritic cells) which then train your T-cells to fight infections and abnormal cells better. Think of it as giving your immune system a training upgrade.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Immune support",
        doseRange: "1-1.6 mg",
        frequency: "2-3x per week",
        cycleDuration: "4-12 weeks",
        timing: "Any time of day. Keep a consistent schedule.",
      },
      {
        purpose: "Acute immune support (getting sick)",
        doseRange: "1.6 mg",
        frequency: "Daily for short bursts",
        cycleDuration: "1-2 weeks",
        timing: "Morning.",
      },
    ],
    sideEffects: ["Very well tolerated", "Occasional injection site irritation", "No significant side effects across 11,000+ study subjects"],
    stacksWith: ["ll37", "kpv", "bpc157"],
    halfLife: "~2 hours",
    storage: "Fridge at 2-8°C. Use mixed solution promptly.",
    notes: "Approved as Zadaxin in 35+ countries (not the US). Studied in 30+ clinical trials with 11,000+ people. One of the safest peptides known. Was studied as a COVID-19 treatment.",
  },
  {
    id: "motsc",
    name: "MOTS-c",
    categories: ["anti_aging", "fat_loss", "recovery"],
    description:
      "A peptide your mitochondria (cell power plants) naturally make. Acts like an exercise signal — improves how your body handles sugar and fat, similar to working out. Levels drop as you age.",
    mechanism:
      "Activates AMPK — the same energy sensor that gets turned on when you exercise or take metformin. Tells your cells to burn more fat and sugar. Basically tricks your cells into thinking you just worked out.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Metabolic optimization / anti-aging",
        doseRange: "5-10 mg",
        frequency: "3-5x per week",
        cycleDuration: "8 weeks on, 4 weeks off",
        timing: "Morning (to mimic natural exercise signaling).",
      },
    ],
    sideEffects: ["Limited human data", "Injection site irritation", "Appears well-tolerated in animal studies"],
    stacksWith: ["humanin", "ss31"],
    halfLife: "Not well-established in humans",
    storage: "Fridge at 2-8°C. Protect from light.",
    notes: "Not FDA-approved. Mostly studied in animals and cell cultures — very early for human use. One of the most promising longevity peptides but still research-stage. Natural levels decline with age.",
  },
  {
    id: "ss31",
    name: "SS-31",
    abbreviation: "Elamipretide",
    categories: ["anti_aging", "recovery", "cognitive"],
    description:
      "A peptide that targets and protects your mitochondria from the inside. Recently FDA-approved (2025) for a rare genetic condition. Keeps your cellular power plants running clean and efficiently.",
    mechanism:
      "Binds to cardiolipin — a special fat molecule inside your mitochondria that's essential for energy production. When cardiolipin gets damaged (which happens with aging), your cells make less energy. SS-31 protects it.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / mitochondrial support",
        doseRange: "5-40 mg",
        frequency: "Daily",
        cycleDuration: "Variable — consult a practitioner",
        timing: "Morning. Rotate injection sites.",
      },
    ],
    sideEffects: ["Injection site reactions (most common)", "Mild blood pressure drop at higher doses", "Generally well tolerated"],
    stacksWith: ["motsc", "humanin"],
    halfLife: "Short — cleared by kidneys within 48 hours",
    storage: "Fridge at 2-8°C.",
    notes: "FDA-approved for Barth syndrome as Forzinity (2025) — the first mitochondria-targeted peptide to get FDA approval. Cleared entirely by kidneys (no liver processing). Dose adjustment needed if you have kidney issues.",
  },
  {
    id: "kisspeptin",
    name: "Kisspeptin",
    abbreviation: "KP",
    categories: ["hormone"],
    description:
      "The master switch for your reproductive hormone system. Tells your brain to start producing the hormones needed for fertility and sexual function. Being researched as a gentler way to stimulate reproductive hormones.",
    mechanism:
      "Triggers your brain to release GnRH, which then signals your pituitary to release LH and FSH — the hormones that drive testosterone, estrogen, and fertility. It sits at the very top of the hormone chain.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Hormone stimulation / fertility (research)",
        doseRange: "Varies widely by study protocol",
        frequency: "Single or repeated doses",
        cycleDuration: "Per clinical protocol",
        timing: "Timed with clinical monitoring.",
      },
    ],
    sideEffects: ["Generally well tolerated", "No significant side effects in clinical trials"],
    stacksWith: ["gonadorelin", "pt141"],
    halfLife: "~28 minutes",
    storage: "Fridge at 2-8°C.",
    notes: "Not FDA-approved. Research-stage only. Very short half-life is a big limitation — longer-acting versions are in development. Very promising for IVF as a safer alternative to hCG trigger shots.",
  },
  {
    id: "dihexa",
    name: "Dihexa",
    categories: ["cognitive"],
    description:
      "A research compound designed for brain function and memory. In animal studies, it was millions of times more potent than BDNF at growing new brain connections. One of the most discussed cognitive peptides in biohacking.",
    mechanism:
      "Activates the HGF/c-Met system in your brain, which promotes new connections between neurons. Think of it as fertilizer for your brain's wiring — helps neurons form new connections and strengthens existing ones.",
    routes: ["oral", "subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "Cognitive enhancement",
        doseRange: "10-20 mg oral, or 5-10 mg subcutaneous/nasal",
        frequency: "1x daily",
        cycleDuration: "2-4 weeks on, 2-4 weeks off",
        timing: "Morning.",
      },
    ],
    sideEffects: ["Very limited human data", "Headache (anecdotal)", "Mild anxiety (anecdotal)", "Vivid dreams", "Long-term safety unknown"],
    stacksWith: ["semax", "selank"],
    halfLife: "Not established in humans",
    storage: "Room temperature or fridge. Protect from light.",
    notes: "NO human clinical trials have ever been done. All data is from animal studies. One of the riskier peptides to try because the pathway it activates (HGF/c-Met) is also involved in cancer growth. Use extreme caution.",
  },
  {
    id: "foxo4dri",
    name: "FOXO4-DRI",
    categories: ["anti_aging"],
    description:
      "A senolytic peptide — meaning it selectively kills 'zombie cells' that build up as you age and cause chronic inflammation. In animal studies, it restored fur, kidney function, and fitness in old mice.",
    mechanism:
      "In old 'zombie cells,' a protein called FOXO4 keeps them alive when they should die. FOXO4-DRI breaks that bond, freeing the cell to self-destruct. Only works on zombie cells — healthy cells aren't affected.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Senolytic therapy (research)",
        doseRange: "No established human dose (animal dose: 5 mg/kg)",
        frequency: "Varies — some protocols use 3x/week",
        cycleDuration: "Short courses (2-4 weeks)",
        timing: "Any time.",
      },
    ],
    sideEffects: ["Very limited data", "Mild diarrhea in animal studies", "Long-term safety unknown"],
    stacksWith: ["humanin", "epithalon"],
    halfLife: "Extended (designed to resist breakdown in the body)",
    storage: "Fridge at 2-8°C. Protect from light. Very expensive.",
    notes: "NO human clinical trials. All data is from animals. Extremely expensive — one of the costliest research peptides. Scientifically exciting concept but years away from any real clinical use.",
  },
  {
    id: "humanin",
    name: "Humanin",
    abbreviation: "HN",
    categories: ["anti_aging", "cognitive", "recovery"],
    description:
      "A peptide your mitochondria naturally make to protect cells from dying. Originally discovered for protecting brain cells from Alzheimer's damage. Also supports heart health and insulin sensitivity. Levels drop with age.",
    mechanism:
      "Blocks cell death, reduces inflammation, and helps cells handle stress better. Works both inside cells and through receptors on cell surfaces. Naked mole-rats (which live 10x longer than mice) keep stable humanin levels their whole lives.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / neuroprotection",
        doseRange: "0.5-4 mg (using HNG analog)",
        frequency: "Daily to 3x per week",
        cycleDuration: "4-8 weeks",
        timing: "Any time of day.",
      },
    ],
    sideEffects: ["Very limited human data", "Animal studies show good tolerability", "No significant side effects reported"],
    stacksWith: ["motsc", "ss31", "foxo4dri"],
    halfLife: "Short for native humanin. The S14G analog (HNG) is 1000x more potent.",
    storage: "Fridge at 2-8°C.",
    notes: "Not FDA-approved. Research-stage only. The more potent analog HNG (S14G-Humanin) is typically what's available. Part of the 'mitochondrial triad' with MOTS-c and SS-31.",
  },
  {
    id: "ll37",
    name: "LL-37",
    abbreviation: "Cathelicidin",
    categories: ["immune", "recovery"],
    description:
      "The only cathelicidin antimicrobial peptide your body naturally makes. Like a Swiss Army knife for your immune system — kills bacteria, viruses, and fungi directly while also directing your immune cells.",
    mechanism:
      "Has a positive charge that's attracted to bacteria membranes, poking holes in them and killing them. Also activates your immune cells, helps them eat bacteria, and controls inflammation. Your body makes more of it when you take vitamin D.",
    routes: ["subcutaneous", "topical", "nasal"],
    dosingProtocols: [
      {
        purpose: "Immune support",
        doseRange: "50-100 mcg",
        frequency: "Daily or 3-5x per week",
        cycleDuration: "2-4 weeks",
        timing: "Any time. Morning preferred.",
      },
      {
        purpose: "Wound healing (topical)",
        doseRange: "Applied to wound",
        frequency: "1-2x daily",
        cycleDuration: "As needed",
        timing: "On clean wound.",
      },
    ],
    sideEffects: ["Injection site irritation", "Can be toxic to your own cells at very high doses", "Theoretical concern for autoimmune activation"],
    stacksWith: ["thymosin_a1", "kpv", "bpc157"],
    halfLife: "Short (breaks down quickly in the body)",
    storage: "Fridge at 2-8°C. Protect from light.",
    notes: "Not FDA-approved for injection. Fun fact: vitamin D supplementation increases your body's own LL-37 production — that's one reason vitamin D helps immune function. Main challenge for clinical use is that it breaks down quickly.",
  },
  {
    id: "hexarelin",
    name: "Hexarelin",
    abbreviation: "Hex",
    categories: ["muscle_gain", "recovery", "fat_loss"],
    description:
      "One of the strongest growth hormone releasing peptides. Causes a big, fast GH spike and has unique heart-protective benefits other GH peptides don't have. Downside: your body gets used to it faster.",
    mechanism:
      "Binds to ghrelin receptors in your pituitary gland, triggering a powerful growth hormone pulse. Also has direct heart-protective effects that work independently of GH release.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "GH release / recovery",
        doseRange: "100-200 mcg",
        frequency: "1-3x daily",
        cycleDuration: "4-8 weeks (stops working as well after that)",
        timing: "Empty stomach. Before bed and/or upon waking.",
      },
    ],
    sideEffects: ["Increased appetite (less than GHRP-6)", "Mild cortisol and prolactin increase", "Water retention", "Numbness/tingling", "Desensitization within 4-16 weeks"],
    stacksWith: ["cjc1295_nodac", "cjc1295_dac", "ghrp2", "tesamorelin"],
    halfLife: "~70-120 minutes. GH peaks at ~30 minutes.",
    storage: "Fridge at 2-8°C. Use mixed solution within 2-4 weeks.",
    notes: "Not FDA-approved. Most potent GHRP for peak GH release, but desensitizes faster than Ipamorelin or GHRP-2. The cortisol/prolactin increase makes it less 'clean' than Ipamorelin. Consider rotating with other GH peptides.",
  },
  {
    id: "ghrp6",
    name: "GHRP-6",
    abbreviation: "GHRP-6",
    categories: ["muscle_gain", "recovery", "fat_loss", "sleep"],
    description:
      "One of the original growth hormone peptides. Strong GH release but famous for making you extremely hungry. Great if you're trying to bulk up and eat more, not great if you're cutting.",
    mechanism:
      "Binds to ghrelin receptors in your brain, triggering growth hormone release. Also strongly stimulates ghrelin signaling — which is why the hunger increase is so intense. Works through a different pathway than CJC-1295, so they stack well.",
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "GH release / muscle gain",
        doseRange: "100-300 mcg",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks, then break",
        timing: "Empty stomach — fasting 30+ min before and after. Food blunts the GH response.",
      },
    ],
    sideEffects: ["Very strong hunger increase", "Water retention", "Cortisol elevation", "Prolactin elevation", "Numbness/tingling", "Blood sugar effects"],
    stacksWith: ["cjc1295_nodac", "cjc1295_dac", "hexarelin", "ghrp2"],
    halfLife: "~2.5 hours. GH peaks at ~15-30 minutes.",
    storage: "Fridge at 2-8°C. Use mixed solution within 2-4 weeks.",
    notes: "Not FDA-approved. The appetite boost is the main feature/drawback depending on your goal. Popular during bulking phases. Must take on empty stomach or it won't work well.",
  },
  {
    id: "ghrp2",
    name: "GHRP-2",
    abbreviation: "Pralmorelin",
    categories: ["muscle_gain", "recovery", "fat_loss", "sleep"],
    description:
      "Considered the strongest GHRP for total GH output. A good middle ground between GHRP-6 (too hungry) and Ipamorelin (very clean but weaker). Moderate appetite increase with robust GH pulses.",
    mechanism:
      "Binds to ghrelin receptors to trigger GH release from your pituitary. Produces the highest total GH output of any GHRP. More potent than Ipamorelin, cleaner than GHRP-6.",
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "GH release / body composition",
        doseRange: "100-300 mcg",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks, then 4-week break",
        timing: "Empty stomach. Before bed is ideal. Wait 20 min before eating.",
      },
    ],
    sideEffects: ["Moderate appetite increase", "Cortisol elevation", "Prolactin elevation", "Water retention", "Drowsiness", "Numbness/tingling"],
    stacksWith: ["cjc1295_nodac", "cjc1295_dac", "hexarelin", "tesamorelin"],
    halfLife: "~33 minutes. GH peaks at ~15-30 minutes.",
    storage: "Fridge at 2-8°C. Use mixed solution within 2-4 weeks.",
    notes: "Approved in Japan (as Pralmorelin) for testing GH deficiency. Highest total GH output of all GHRPs. Cortisol/prolactin increase is moderate — more than Ipamorelin but manageable. Cycling recommended to avoid desensitization.",
  },
  {
    id: "gonadorelin",
    name: "Gonadorelin",
    abbreviation: "GnRH",
    categories: ["hormone"],
    description:
      "A synthetic copy of the GnRH hormone your brain naturally makes. Tells your pituitary to release LH and FSH — the hormones that drive testosterone and fertility. Popular in TRT protocols to keep natural hormone production alive.",
    mechanism:
      "Identical to your body's own GnRH. When injected in pulses, it keeps your LH and FSH signaling active. This is why men on testosterone use it — it preserves testicular function and fertility while on TRT.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Fertility preservation during TRT",
        doseRange: "100-200 mcg",
        frequency: "2-3x per week",
        cycleDuration: "Ongoing with TRT",
        timing: "Any consistent time of day.",
      },
    ],
    sideEffects: ["Generally well tolerated", "Rare: headache, flushing, nausea", "In women: ovarian hyperstimulation risk"],
    stacksWith: ["kisspeptin", "pt141"],
    halfLife: "~2-4 minutes (very short)",
    storage: "Fridge at 2-8°C.",
    notes: "FDA-approved for pituitary function testing (as Factrel). Very short half-life — pulsed delivery is key. If given continuously instead of pulsed, it actually SUPPRESSES hormones (that's how Lupron works for prostate cancer). Increasingly used as an HCG alternative in TRT since HCG supply issues.",
  },

  // ── Pre-Mixed Blends (sold as single vials) ──

  {
    id: "glow_blend",
    name: "GLOW Blend",
    categories: ["recovery", "anti_aging"],
    isBlend: true,
    description:
      "A popular pre-mixed 3-peptide blend for healing, skin rejuvenation, and anti-aging. Sold as a single vial — no need to buy each peptide separately. The go-to blend for recovery and that 'glow' effect.",
    mechanism:
      "BPC-157 repairs tissue and grows new blood vessels. TB-500 sends repair cells body-wide and reduces inflammation. GHK-Cu boosts collagen, elastin, and skin health. Together they cover healing from the inside out.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Recovery + skin rejuvenation",
        doseRange: "0.3-0.5 mL per injection (from 70mg vial reconstituted with 3 mL bac water)",
        frequency: "1x daily, 5 days on / 2 days off",
        cycleDuration: "8-12 weeks, then 4-week break",
        timing: "Morning or evening. Rotate injection sites.",
      },
    ],
    sideEffects: ["Mild injection site reactions", "Temporary fatigue", "Occasional headache or nausea", "Avoid if copper allergy"],
    stacksWith: ["kpv", "epithalon", "dsip"],
    halfLife: "Varies by component — effects build over days to weeks.",
    storage: "Powder: freezer. Mixed: fridge at 2-8°C, use within 28 days. Protect from light.",
    notes: "Contains: BPC-157 (5-10mg) + TB-500 (10mg) + GHK-Cu (50mg). The KLOW blend is this plus KPV. Sold by Peptide Sciences, Polaris, and many others. Pre-mixed means you don't have to worry about mixing ratios yourself.",
  },
  {
    id: "klow_blend",
    name: "KLOW Blend",
    categories: ["recovery", "anti_aging", "immune"],
    isBlend: true,
    description:
      "The upgraded version of GLOW — adds KPV (a powerful anti-inflammatory) to the healing trio. Best for people dealing with gut issues, inflammation, or autoimmune concerns on top of wanting recovery and skin benefits.",
    mechanism:
      "Everything GLOW does (BPC-157 repairs, TB-500 heals body-wide, GHK-Cu rebuilds collagen) plus KPV shuts down the NF-kB inflammation pathway. The KPV is especially effective for gut inflammation because of how it's absorbed.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Recovery + anti-inflammation + gut healing",
        doseRange: "0.3-0.5 mL per injection (from 80mg vial reconstituted with 3 mL bac water)",
        frequency: "1x daily, 5 days on / 2 days off",
        cycleDuration: "8-12 weeks, then 4-week break",
        timing: "Morning or evening. Rotate injection sites.",
      },
    ],
    sideEffects: ["Mild injection site reactions", "Temporary fatigue", "Occasional headache, nausea, or lightheadedness"],
    stacksWith: ["epithalon", "dsip", "thymosin_a1"],
    halfLife: "Varies by component — effects build over days to weeks.",
    storage: "Powder: freezer at -20°C. Mixed: fridge at 2-8°C, use within 28 days. Protect from light.",
    notes: "Contains: BPC-157 (10mg) + TB-500 (10mg) + GHK-Cu (50mg) + KPV (10mg). The 'K' in KLOW is for KPV. If you don't have gut/inflammation issues, GLOW is enough. If you do, upgrade to KLOW.",
  },
  {
    id: "wolverine_blend",
    name: "Wolverine Stack (BPC-157 + TB-500)",
    categories: ["recovery"],
    isBlend: true,
    description:
      "The classic healing duo sold as a single pre-mixed vial. BPC-157 heals locally, TB-500 heals body-wide. Named 'Wolverine' because of how fast it helps injuries recover. The most popular peptide blend.",
    mechanism:
      "BPC-157 grows new blood vessels near the injury and boosts collagen. TB-500 sends repair cells throughout your body and reduces inflammation. Together they cover both local and systemic healing.",
    routes: ["subcutaneous", "intramuscular"],
    dosingProtocols: [
      {
        purpose: "Injury healing / recovery",
        doseRange: "0.3 mL per injection (from 10mg vial reconstituted with 3 mL bac water = ~500 mcg each peptide)",
        frequency: "1x daily",
        cycleDuration: "6-8 weeks",
        timing: "Inject near the injury site for best results. Morning or evening.",
      },
    ],
    sideEffects: ["Mild injection site irritation", "Occasional nausea (rare)", "Headache (rare)"],
    stacksWith: ["ghkcu", "kpv", "ipamorelin"],
    halfLife: "BPC-157: <30 min. TB-500: 2-4 days. Mixed effects last days.",
    storage: "Powder: freezer. Mixed: fridge at 2-8°C, use within 28 days.",
    notes: "Contains: BPC-157 (5mg) + TB-500 (5mg) in 10mg vials, or 10mg + 10mg in 20mg vials. The single most popular peptide combo for injuries. Pre-mixed saves you from buying two separate vials.",
  },
  {
    id: "cjc_ipa_blend",
    name: "CJC/Ipa Blend",
    categories: ["muscle_gain", "fat_loss", "sleep"],
    isBlend: true,
    description:
      "The gold standard GH combo sold as a single pre-mixed vial. CJC-1295 and Ipamorelin work through different pathways to release 2-3x more growth hormone together than either alone. Cleanest GH stack available.",
    mechanism:
      "CJC-1295 (GHRH analog) tells your pituitary to release GH. Ipamorelin (ghrelin mimetic) pulls the same lever from a different angle. Together they amplify your natural GH pulses without raising cortisol or appetite.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "GH boost / lean muscle / fat loss / better sleep",
        doseRange: "100-300 mcg each peptide per injection (0.1-0.3 mL from 10mg vial with 3 mL bac water)",
        frequency: "1x daily before bed, 5 days on / 2 days off",
        cycleDuration: "12 weeks, then 4-week break",
        timing: "Empty stomach, 30 min before bed. Don't eat for 20 min after.",
      },
    ],
    sideEffects: ["Mild injection site irritation", "Water retention", "Tingling/numbness (temporary)", "Occasional headache"],
    stacksWith: ["bpc157", "aod9604", "tesamorelin"],
    halfLife: "CJC: ~30 min. Ipamorelin: ~2 hours. GH elevation lasts hours.",
    storage: "Powder: freezer at -20°C. Mixed: fridge at 2-8°C. Avoid freeze-thaw.",
    notes: "Contains: CJC-1295 no DAC (5mg) + Ipamorelin (5mg). The most popular GH peptide combo. You can mix them in the same syringe. Take on empty stomach or it won't work as well. Considered the cleanest GH stack (no cortisol/hunger spikes).",
  },
  {
    id: "fat_burner_blend",
    name: "Fat Burner Blend",
    categories: ["fat_loss"],
    isBlend: true,
    description:
      "A triple-action fat loss blend. AOD-9604 burns fat directly, MOTS-c boosts your metabolism like exercise, and Tesamorelin targets stubborn belly fat through growth hormone. Attacks fat from three different angles.",
    mechanism:
      "AOD-9604 mimics the fat-burning part of growth hormone without side effects. MOTS-c activates AMPK (your exercise sensor) to burn more calories. Tesamorelin boosts real GH to specifically target visceral belly fat.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Fat loss / metabolic boost",
        doseRange: "Per vendor dosing (typically 0.2-0.5 mL per injection)",
        frequency: "1x daily",
        cycleDuration: "8-12 weeks",
        timing: "Morning on empty stomach, ideally before cardio.",
      },
    ],
    sideEffects: ["Injection site reactions", "Possible nausea", "Headache", "Water retention"],
    stacksWith: ["semaglutide", "cjc_ipa_blend"],
    halfLife: "Varies by component.",
    storage: "Fridge at 2-8°C after mixing.",
    notes: "Contains: AOD-9604 + MOTS-c + Tesamorelin. Sold by RegenMD, Elite Health HRT, and others. Doses vary by vendor so follow their specific protocol. Do NOT combine with semaglutide/tirzepatide without medical supervision.",
  },
  {
    id: "cognitive_blend",
    name: "Cognitive Blend (Semax + Selank)",
    categories: ["cognitive"],
    isBlend: true,
    description:
      "The brain-boosting duo in one vial. Semax sharpens focus, memory, and motivation. Selank kills anxiety without drowsiness. Together they give you a calm, clear, focused mind — no needles needed if you use the nasal version.",
    mechanism:
      "Semax boosts BDNF and dopamine for focus and memory. Selank works on GABA and serotonin for calm and mood. They complement each other perfectly — Semax energizes while Selank prevents overstimulation.",
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "Focus + calm + mental clarity",
        doseRange: "500-1000 mcg total daily (injectable) or 1-2 sprays per nostril (nasal)",
        frequency: "1-2x daily",
        cycleDuration: "2-4 weeks on, 2 weeks off",
        timing: "Morning/afternoon for Semax (stimulating). Selank anytime. Space nasal doses 15-30 min apart.",
      },
    ],
    sideEffects: ["Mild nasal irritation (spray)", "Occasional headache", "No sedation or dependency"],
    stacksWith: ["dsip", "bpc157", "dihexa"],
    halfLife: "Short for both — effects last much longer than blood levels.",
    storage: "Fridge at 2-8°C.",
    notes: "Contains: Semax + Selank. Both are approved drugs in Russia. No addiction, tolerance, or withdrawal. Nasal version means no needles. The go-to nootropic peptide combo.",
  },
  {
    id: "sleep_blend",
    name: "Sleep Blend",
    categories: ["sleep", "recovery"],
    isBlend: true,
    description:
      "A pre-mixed sleep and overnight recovery blend. DSIP gives you deeper sleep, CJC-1295 boosts your natural nighttime GH spike, and BPC-157 repairs tissue while you rest. Take before bed and wake up recovered.",
    mechanism:
      "DSIP increases deep delta-wave sleep. CJC-1295 amplifies your body's natural nighttime growth hormone pulse for better recovery. BPC-157 heals tissue and reduces inflammation while you sleep.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Better sleep + overnight recovery",
        doseRange: "0.2-0.5 mL per injection (per vendor dosing)",
        frequency: "1x nightly, 5 days on / 2 days off",
        cycleDuration: "4-8 weeks",
        timing: "30-60 minutes before bed on empty stomach.",
      },
    ],
    sideEffects: ["Vivid dreams", "Possible morning grogginess", "Mild injection site irritation", "Fluid retention"],
    stacksWith: ["ipamorelin", "selank", "mk677"],
    halfLife: "Varies by component.",
    storage: "Fridge at 2-8°C after mixing.",
    notes: "Contains: DSIP + CJC-1295 + BPC-157. Sold by RegenMD, Elite Health HRT, Bio Access Labs. Don't mix with sleeping pills or alcohol. Great during hard training blocks or stressful periods.",
  },
  {
    id: "triple_gh_blend",
    name: "Triple GH Blend",
    categories: ["muscle_gain", "fat_loss"],
    isBlend: true,
    description:
      "The most powerful GH-boosting blend available. Three growth hormone secretagogues in one vial — Tesamorelin, CJC-1295, and Ipamorelin. For serious users who want maximum GH output and fat loss.",
    mechanism:
      "Tesamorelin is the strongest GHRH analog (FDA-approved for belly fat). CJC-1295 extends the GH-releasing signal. Ipamorelin pulls from the ghrelin side for synergy. Three pathways working together for massive GH release.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Maximum GH release / body recomposition",
        doseRange: "0.2-0.5 mL per injection (from 12mg vial reconstituted with 3 mL bac water)",
        frequency: "1x daily before bed",
        cycleDuration: "8-12 weeks, then break",
        timing: "Empty stomach, 30 min before bed.",
      },
    ],
    sideEffects: ["Water retention", "Joint pain", "Tingling/numbness", "Possible increased heart rate", "Injection site reactions"],
    stacksWith: ["bpc157", "aod9604"],
    halfLife: "Varies — Tesamorelin ~30 min, CJC ~30 min, Ipamorelin ~2 hours.",
    storage: "Powder: freezer at -20°C. Mixed: fridge at 2-8°C. Avoid freeze-thaw.",
    notes: "Contains: Tesamorelin (6mg) + CJC-1295 no DAC (3mg) + Ipamorelin (3mg). Sold by Peptide Sciences, Liberty Peptides, LIVV Natural. Not for beginners — start with CJC/Ipa blend first.",
  },
];
