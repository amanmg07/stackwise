import { Peptide } from "../types";
import { supplements } from "./supplements";

const peptideData: Peptide[] = [
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
        doseRange: "0.25-0.5 mg",
        frequency: "1-2x daily",
        cycleDuration: "4-8 weeks on, 8-10 weeks off",
        timing: "Morning and evening, ~12 hours apart. Inject near the injury for best results, or in belly fat for whole-body effect.",
      },
      {
        purpose: "Gut healing",
        doseRange: "0.5 mg",
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
    routes: ["subcutaneous", "intramuscular", "topical"],
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
        doseRange: "0.75-1 mg daily, or 2-2.5 mg weekly",
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

        doseRange: "0.1 mg per injection",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks. Some do 5 days on, 2 off.",
        timing: "Empty stomach (food blunts GH release). Best times: morning, post-workout, before bed. Wait 20 min before eating.",
      },
    ],
    sideEffects: ["Flushing/warmth", "Headache", "Water retention", "Tingling/numbness (temporary)", "Mild tiredness"],
    stacksWith: ["ipamorelin", "bpc157", "tb500"],
    halfLife: "~30 minutes",
    storage: "Powder: freezer long-term, fridge short-term. Mixed: fridge, use within 30 days. Never freeze after mixing. Toss if cloudy.",
        notes: "Almost always used with Ipamorelin — together they release 2-3x more GH than either alone. Going above 0.1 mg doesn't help much but increases side effects. Preferred over the DAC version for natural GH pulsing.",
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
        doseRange: "0.1-0.2 mg per injection (when stacking with CJC-1295)",
        frequency: "2-3x daily",
        cycleDuration: "8-12 weeks, then take a break",
        timing: "Empty stomach. Morning, post-workout, before bed. Wait 20 min before eating.",
      },
      {
        purpose: "Better sleep + recovery",
        doseRange: "0.2-0.3 mg",
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
        doseRange: "0.1-0.3 mg",
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
    stacksWith: ["ghkcu", "dsip", "thymalin"],
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
        doseRange: "0.2-0.5 mg",
        frequency: "2-3x daily",
        cycleDuration: "2-4 weeks",
        timing: "Nasal spray: 2-3 drops per nostril. Or inject 0.25-0.5 mg. Can use anytime — it won't make you sleepy.",
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
        doseRange: "0.1-0.6 mg",
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
    routes: ["subcutaneous", "oral"],
    dosingProtocols: [
      {
        purpose: "Fat loss",
        doseRange: "0.3 mg",
        frequency: "1x daily",
        cycleDuration: "8-12 weeks",
        timing: "Morning on empty stomach, or before fasted cardio. Wait 20 min before eating.",
      },
    ],
    sideEffects: ["Injection site irritation", "Headache (uncommon)", "Mild nausea (rare)"],
    stacksWith: ["semaglutide", "cjc1295_nodac", "ipamorelin", "amino1mq"],
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
    routes: ["subcutaneous", "nasal"],
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
    stacksWith: ["melanotan2", "kisspeptin"],
    halfLife: "~2.7 hours",
    storage: "Mixed: fridge, use within 30 days.",
        notes: "FDA-approved as Vyleesi. Max 8 doses per month. Start with 1 mg to test your tolerance for nausea. Don't use if you have uncontrolled high blood pressure. Talk to a doctor first.",
  },
  {
    id: "tesamorelin",
    name: "Tesamorelin",
    abbreviation: "Tesa",
    categories: ["fat_loss", "muscle_gain", "anti_aging"],
    description:
      "An FDA-approved injectable that boosts your body's own growth hormone production. Burns stubborn belly fat — especially deep visceral fat — while supporting lean muscle growth through elevated GH levels.",
    mechanism:
      "Mimics the natural brain signal (GHRH) that tells your pituitary gland to release growth hormone. More GH means your body gets better at burning fat (especially around the midsection) and building lean muscle by increasing protein synthesis and nitrogen retention.",
    routes: ["subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Belly fat reduction",
        doseRange: "1.4-2 mg",
        frequency: "1x daily",
        cycleDuration: "Reassess at 6 months. Stop if no improvement.",
        timing: "Morning on empty stomach. Inject in belly area.",
      },
      {
        purpose: "Lean muscle growth",
        doseRange: "1-2 mg",
        frequency: "1x daily",
        cycleDuration: "8-12 weeks on, 4 weeks off",
        timing: "Before bed on empty stomach to amplify natural GH pulse during sleep. Pair with resistance training.",
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
        doseRange: "0.2-0.5 mg (injection) or 0.5 mg - 1 mg (oral)",
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
    stacksWith: ["ll37", "kpv", "bpc157", "thymalin"],
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
        doseRange: "0.05-0.1 mg",
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
        doseRange: "0.1-0.2 mg",
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
        doseRange: "0.1-0.3 mg",
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
        doseRange: "0.1-0.3 mg",
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
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "Fertility preservation during TRT",
        doseRange: "0.1-0.2 mg",
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

  {
    id: "igf1_lr3",
    name: "IGF-1 LR3",
    abbreviation: "IGF-1 LR3",
    categories: ["muscle_gain", "recovery", "fat_loss"],
    description:
      "A modified version of insulin-like growth factor 1 that lasts much longer in the body. One of the most powerful peptides for building lean muscle and accelerating recovery. Works downstream of growth hormone — GH tells your liver to make IGF-1, but this gives it to you directly.",
    mechanism:
      "Binds to IGF-1 receptors on muscle cells, activating the PI3K/Akt pathway which triggers muscle protein synthesis and blocks protein breakdown. The 'LR3' modification means it doesn't bind to IGF binding proteins, so it stays active 20-30x longer than natural IGF-1. Also shuttles nutrients into muscle cells and away from fat cells.",
    routes: ["subcutaneous", "intramuscular"],
    dosingProtocols: [
      {
        purpose: "Muscle growth / recovery",
        doseRange: "0.02-0.05 mg",
        frequency: "1x daily",
        cycleDuration: "4-6 weeks on, 4 weeks off",
        timing: "Post-workout on training days, morning on rest days. Can inject into specific muscle groups for localized growth. That's 20-50 mcg.",
      },
      {
        purpose: "Fat loss / body recomp",
        doseRange: "0.02-0.04 mg",
        frequency: "1x daily",
        cycleDuration: "4-6 weeks",
        timing: "Morning on empty stomach, or post-workout.",
      },
    ],
    sideEffects: ["Hypoglycemia (low blood sugar — eat carbs after dosing)", "Joint pain at high doses", "Gut growth at very high/prolonged doses", "Jaw/hand growth (only at abuse-level doses)", "Headaches"],
    stacksWith: ["cjc1295_nodac", "ipamorelin", "bpc157", "mk677"],
    halfLife: "20-30 hours (much longer than natural IGF-1's ~15 minutes)",
    storage: "Powder: freezer at -20°C. Mixed: fridge at 2-8°C, use within 30 days. Very fragile — don't shake.",
        notes: "Not FDA-approved. One of the most potent anabolic peptides available. The hypoglycemia risk is real — always have carbs nearby. Do NOT combine with insulin. Cycle for 4-6 weeks max to avoid desensitization. Banned by WADA.",
  },
  {
    id: "igf1_des",
    name: "IGF-1 DES",
    abbreviation: "DES(1-3) IGF-1",
    categories: ["muscle_gain", "recovery"],
    description:
      "A truncated version of IGF-1 that's 5-10x more potent than regular IGF-1 but only lasts about 30 minutes. Designed for targeted, localized muscle growth — inject directly into a lagging muscle group for site-specific effects.",
    mechanism:
      "Missing the first 3 amino acids of IGF-1, which means it doesn't bind to IGF binding proteins at all. This makes it extremely potent but very short-lived. Activates satellite cells in muscle tissue for hyperplasia (new muscle cell creation, not just bigger existing cells).",
    routes: ["intramuscular"],
    dosingProtocols: [
      {
        purpose: "Localized muscle growth",
        doseRange: "0.05-0.15 mg",
        frequency: "Pre-workout or post-workout",
        cycleDuration: "4 weeks on, 4 weeks off",
        timing: "Inject directly into target muscle 15-20 min before training, or immediately after. Bilateral injections for symmetry.",
      },
    ],
    sideEffects: ["Hypoglycemia (less systemic than LR3 but still possible)", "Localized swelling at injection site", "Pump/pain in injected muscle", "Short-term only — clears fast"],
    stacksWith: ["igf1_lr3", "cjc1295_nodac", "ipamorelin", "bpc157"],
    halfLife: "20-30 minutes (very short — works fast and clears fast)",
    storage: "Powder: freezer at -20°C. Mixed: fridge, use within 2-3 weeks. Extremely fragile.",
        notes: "Not FDA-approved. Think of DES as a 'spot treatment' and LR3 as 'whole body.' Some users alternate: DES pre-workout into target muscle, LR3 on rest days for systemic effects. Very potent — start low. Banned by WADA.",
  },
  {
    id: "melanotan2",
    name: "Melanotan II",
    abbreviation: "MT-II",
    categories: ["sexual_health", "fat_loss"],
    description:
      "Originally developed as a sunless tanning agent, Melanotan II turned out to also boost libido and reduce appetite. Works by activating melanocortin receptors throughout your body. One of the most popular peptides worldwide.",
    mechanism:
      "Activates MC1 receptors in skin (tanning), MC3/MC4 receptors in the brain (libido, appetite suppression, fat loss), and MC5 receptors (reduces inflammation). The tanning effect comes from stimulating melanocytes to produce more melanin without UV exposure.",
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "Tanning / skin darkening",
        doseRange: "0.25-0.5 mg",
        frequency: "1x daily during loading, then 1-2x weekly maintenance",
        cycleDuration: "Loading: 2-3 weeks daily. Maintenance: as needed",
        timing: "Evening preferred (nausea is common, sleep through it). Start at 0.1 mg to assess tolerance.",
      },
      {
        purpose: "Libido enhancement",
        doseRange: "0.5-1 mg",
        frequency: "As needed, 2-4 hours before activity",
        cycleDuration: "As needed",
        timing: "2-4 hours before desired effect. Can combine with loading protocol.",
      },
    ],
    sideEffects: ["Nausea (very common at first — fades with use)", "Facial flushing", "Spontaneous erections", "Darkening of moles and freckles", "Appetite suppression", "Fatigue", "New mole development"],
    stacksWith: ["pt141", "bpc157"],
    halfLife: "~1 hour in blood, but melanin effects last weeks",
    storage: "Powder: freezer, stable for years. Mixed: fridge at 2-8°C, use within 30 days.",
        notes: "Not FDA-approved. PT-141 (Bremelanotide) was derived from MT-II as a targeted libido drug without tanning — it IS FDA-approved. MT-II darkens ALL skin including moles, so get moles checked regularly. Start very low (0.1 mg) to assess nausea tolerance. Extremely popular in Europe and Australia.",
  },
  {
    id: "sermorelin",
    name: "Sermorelin",
    abbreviation: "GHRH(1-29)",
    categories: ["muscle_gain", "fat_loss", "anti_aging", "sleep"],
    description:
      "One of the most prescribed growth hormone peptides. A shortened version of your body's own GHRH that tells your pituitary to release GH naturally. Considered one of the safest GH boosters because it works with your body's feedback system — you can't overshoot.",
    mechanism:
      "Binds to GHRH receptors on your pituitary gland, triggering a natural growth hormone pulse. Unlike synthetic HGH, it preserves your body's negative feedback loop — your pituitary won't release more GH than it should. This makes it very safe for long-term use.",
    routes: ["subcutaneous", "nasal"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / general wellness",
        doseRange: "0.1-0.3 mg",
        frequency: "1x daily before bed",
        cycleDuration: "3-6 months, then reassess",
        timing: "Before bed on empty stomach. Your biggest natural GH pulse happens during deep sleep — Sermorelin amplifies it.",
      },
      {
        purpose: "Fat loss / body recomp",
        doseRange: "0.2-0.5 mg",
        frequency: "1x daily",
        cycleDuration: "3-6 months",
        timing: "Before bed. Can also do morning dose for daytime energy.",
      },
    ],
    sideEffects: ["Injection site irritation", "Headache", "Flushing", "Dizziness", "Drowsiness", "Generally very well tolerated"],
    stacksWith: ["ipamorelin", "cjc1295_nodac", "ghrp2", "mk677"],
    halfLife: "~10-20 minutes (short — but the GH pulse it triggers lasts hours)",
    storage: "Fridge at 2-8°C. Mixed: use within 14 days.",
        notes: "Was FDA-approved (as Geref) for GH deficiency testing but withdrawn for commercial reasons, not safety. One of the most commonly prescribed peptides by anti-aging clinics. Very safe profile because it can't override your pituitary's natural limits. Often the first GH peptide doctors prescribe.",
  },
  {
    id: "thymalin",
    name: "Thymalin",
    categories: ["immune", "anti_aging"],
    description:
      "A thymus gland extract peptide developed in Russia for immune system restoration. Works alongside Thymosin Alpha-1 to rebuild immune function, especially in aging or immunocompromised individuals. Also studied for anti-aging and cancer prevention.",
    mechanism:
      "Restores the balance between T-helper and T-suppressor cells, which naturally declines with age as the thymus shrinks. Normalizes immune function — boosts it when it's low, calms it when it's overactive. Also shown to influence telomere maintenance and reduce mortality in long-term studies.",
    routes: ["intramuscular"],
    dosingProtocols: [
      {
        purpose: "Immune restoration / anti-aging",
        doseRange: "10-20 mg",
        frequency: "1x daily",
        cycleDuration: "10 days on, then repeat 2-3x per year",
        timing: "Morning. Short course protocol — not continuous use.",
      },
    ],
    sideEffects: ["Very well tolerated", "Rare injection site soreness", "Possible mild flu-like symptoms as immune system activates"],
    stacksWith: ["thymosin_a1", "epithalon", "kpv"],
    halfLife: "Short (hours). Effects build over the 10-day course.",
    storage: "Fridge at 2-8°C.",
        notes: "Developed by Dr. Khavinson in Russia. In a landmark 15-year study, Thymalin + Epithalon reduced cardiovascular mortality by 50% in elderly patients. Used in Russian military and clinical medicine since the 1970s. Often paired with Epithalon in 10-day 'bioregulator' protocols.",
  },
  {
    id: "amino1mq",
    name: "5-Amino-1MQ",
    abbreviation: "5-A-1MQ",
    categories: ["fat_loss"],
    description:
      "A small molecule (technically not a peptide, but widely sold alongside them) that blocks an enzyme called NNMT which tells your fat cells to store more fat. By blocking NNMT, your fat cells shrink and your metabolism speeds up. One of the newest and most popular fat loss compounds.",
    mechanism:
      "Inhibits nicotinamide N-methyltransferase (NNMT), an enzyme that's overexpressed in fat tissue of obese individuals. When NNMT is blocked, fat cells lose their ability to store fat efficiently, NAD+ levels increase (boosting metabolism), and SAM levels normalize. Essentially reprograms fat cells to burn instead of store.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Fat loss / metabolic boost",
        doseRange: "50-150 mg",
        frequency: "1-2x daily",
        cycleDuration: "8-12 weeks",
        timing: "Morning with or without food. Some split dose AM/PM.",
      },
    ],
    sideEffects: ["Generally well tolerated", "Mild GI discomfort", "Headache (rare)", "Limited long-term human data"],
    stacksWith: ["aod9604", "tesamorelin", "semaglutide", "retatrutide"],
    halfLife: "~12 hours (oral bioavailability is good)",
    storage: "Room temperature, sealed container. Keep dry.",
        notes: "Oral dosing is a huge advantage — no injections. Research is still early but promising. In mouse studies, it reduced body weight by 7% in 11 days without diet changes. Works through a completely different mechanism than GLP-1 drugs, so they can be combined. Rapidly growing in popularity.",
  },
  {
    id: "pe2228",
    name: "PE-22-28",
    abbreviation: "PE-22-28",
    categories: ["anti_aging"],
    description:
      "A peptide fragment derived from pigment epithelium-derived factor (PEDF) that's gaining popularity for hair regrowth. Promotes hair follicle growth by extending the anagen (growth) phase and stimulating dermal papilla cells. One of the most promising non-hormonal hair loss treatments.",
    mechanism:
      "Activates dermal papilla cells (the base of hair follicles) to proliferate and extend the hair growth phase. Works through the Wnt/β-catenin signaling pathway — the same pathway that naturally controls hair cycling. Doesn't affect hormones like DHT, so no sexual side effects.",
    routes: ["topical", "subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Hair regrowth / hair loss prevention",
        doseRange: "0.1-0.5 mg topically or 0.1 mg subcutaneous",
        frequency: "1x daily (topical) or 3-5x weekly (injection)",
        cycleDuration: "3-6 months minimum to see results",
        timing: "Apply to scalp at night (topical). Inject into scalp near thinning areas (subcutaneous).",
      },
    ],
    sideEffects: ["Scalp irritation (topical)", "Injection site discomfort", "Limited human data — most evidence is preclinical", "No hormonal side effects"],
    stacksWith: ["ghkcu", "bpc157"],
    halfLife: "Short (topical effects are local and sustained)",
    storage: "Fridge at 2-8°C. Mixed solutions: use within 30 days.",
        notes: "Not FDA-approved. Early research is promising — showed significant hair density increase in mouse models. Non-hormonal mechanism is the key advantage over finasteride. Often combined with GHK-Cu for synergistic hair/skin effects. Topical application preferred for hair — avoids systemic exposure.",
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
        doseRange: "0.3 mL per injection (from 10mg vial reconstituted with 3 mL bac water = ~0.5 mg each peptide)",
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
        doseRange: "0.1-0.3 mg each peptide per injection (0.1-0.3 mL from 10mg vial with 3 mL bac water)",
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
        doseRange: "0.5-1 mg total daily (injectable) or 1-2 sprays per nostril (nasal)",
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
  {
    id: "oxytocin",
    name: "Oxytocin",
    categories: ["cognitive", "sexual_health"],
    description:
      "A neuropeptide hormone that modulates social bonding, trust, empathy, and anxiety reduction. Intranasal oxytocin has gained significant interest for its effects on social cognition, stress resilience, and intimacy. One of the most studied peptides for emotional wellbeing.",
    mechanism:
      "Binds to oxytocin receptors in the CNS, modulating GABA and serotonin systems. Reduces amygdala reactivity (lowering anxiety and fear responses), increases social reward signaling, and promotes pair bonding. Also has mild anti-inflammatory and analgesic properties.",
    routes: ["nasal"],
    dosingProtocols: [
      {
        purpose: "Anxiolytic / social cognition",
        doseRange: "20-24 IU",
        frequency: "1-2x daily",
        cycleDuration: "4-8 weeks with breaks",
        timing: "Intranasal spray, 30 min before social situations or morning.",
      },
      {
        purpose: "Intimacy / bonding",
        doseRange: "20-40 IU",
        frequency: "As needed",
        cycleDuration: "Situational use",
        timing: "30-60 min before desired effect.",
      },
    ],
    sideEffects: ["Nasal irritation", "Headache (rare)", "Emotional sensitivity", "Potential receptor downregulation with chronic use", "Contraindicated in pregnancy"],
    stacksWith: ["selank", "semax", "pt141"],
    halfLife: "3-5 minutes in plasma; CNS effects last 2-4 hours after nasal administration.",
    storage: "Refrigerate at 2-8°C. Reconstituted nasal solution stable for 4-6 weeks refrigerated. Protect from light.",
        notes: "Originally a hormone associated with childbirth and breastfeeding, oxytocin's role in social cognition makes it popular for anxiety, social confidence, and relationship enhancement. Nasal is the standard route for cognitive effects — bypasses the blood-brain barrier more effectively.",
  },
  {
    id: "cerebrolysin",
    name: "Cerebrolysin",
    abbreviation: "CBL",
    categories: ["cognitive", "recovery"],
    description:
      "A mixture of low-molecular-weight neuropeptides and amino acids derived from porcine brain tissue. One of the most studied nootropic peptide compounds with over 200 clinical trials, primarily used for cognitive enhancement, TBI recovery, and neurodegenerative conditions.",
    mechanism:
      "Exhibits neurotrophic activity similar to BDNF, CNTF, and NGF. Promotes neuronal sprouting, synaptic repair, dendritic branching, and neuroplasticity. Reduces amyloid-beta aggregation and supports mitochondrial function in neurons.",
    routes: ["nasal", "intramuscular"],
    dosingProtocols: [
      {
        purpose: "Cognitive enhancement / nootropic",
        doseRange: "1-2 mL per nostril",
        frequency: "1x daily",
        cycleDuration: "10-20 day cycles, 2-3x per year",
        timing: "Morning on empty stomach. Nasal spray formulation.",
      },
      {
        purpose: "TBI / neuro recovery",
        doseRange: "5-10 mL IM",
        frequency: "1x daily",
        cycleDuration: "20 days",
        timing: "Morning injection.",
      },
    ],
    sideEffects: ["Nasal irritation", "Headache", "Dizziness", "Mild agitation", "Rare fever", "Derived from porcine tissue — allergy concern"],
    stacksWith: ["semax", "selank", "dihexa", "pe2228"],
    halfLife: "Peptide fragments vary; effects build cumulatively over the treatment cycle.",
    storage: "Refrigerate at 2-8°C. Protect from light. Ampules: use immediately once opened.",
        notes: "Widely prescribed in Europe and Asia for stroke recovery, TBI, and Alzheimer's. Banned by some sports organizations. The nasal spray formulation is compounded and popular in the nootropic community. Effects are cumulative — expect results after 5-7 days of daily use.",
  },
  {
    id: "pinealon",
    name: "Pinealon",
    categories: ["sleep", "cognitive", "anti_aging"],
    description:
      "A Khavinson tripeptide bioregulator (Glu-Asp-Arg) that targets the pineal gland. Normalizes melatonin synthesis and circadian rhythm regulation with neuroprotective properties. Part of the Russian bioregulator peptide family developed for age-related sleep disruption.",
    mechanism:
      "Regulates gene expression in pinealocytes, normalizing melatonin production without introducing exogenous melatonin. Supports circadian rhythm calibration, has antioxidant effects on brain tissue, and promotes healthy sleep architecture through natural pathways.",
    routes: ["nasal", "oral"],
    dosingProtocols: [
      {
        purpose: "Sleep regulation",
        doseRange: "10 mg capsule or 10-20 µg nasal",
        frequency: "1x daily before bed",
        cycleDuration: "10-30 days, repeat 2-3x per year",
        timing: "30-60 min before bed.",
      },
      {
        purpose: "Neuroprotection / anti-aging",
        doseRange: "10 mg oral",
        frequency: "1x daily",
        cycleDuration: "30 days, 2-3x per year",
        timing: "Morning or evening.",
      },
    ],
    sideEffects: ["Mild drowsiness (expected)", "Very well tolerated overall", "Rare headache"],
    stacksWith: ["epithalon", "dsip", "cortagen", "selank"],
    halfLife: "Short peptide half-life, but epigenetic effects are cumulative and sustained.",
    storage: "Room temperature in sealed container, away from moisture.",
        notes: "Part of the Khavinson peptide bioregulator family developed in Russia. Unlike melatonin supplements, Pinealon works by normalizing your own melatonin production rather than introducing exogenous hormones. Best for people whose circadian rhythm is disrupted from shift work, travel, or aging.",
  },
  {
    id: "cortagen",
    name: "Cortagen",
    categories: ["cognitive", "anti_aging"],
    description:
      "A synthetic tetrapeptide bioregulator targeting cerebral cortex tissue. Promotes gene expression related to neuronal health and repair, supports cognitive function, and provides neuroprotection against age-related decline.",
    mechanism:
      "Activates gene expression in cerebral cortex neurons related to neuronal repair, synaptic plasticity, and neuroprotection. Part of the Khavinson peptide bioregulator system — short peptides that regulate tissue-specific gene activity without hormonal side effects.",
    routes: ["nasal", "subcutaneous"],
    dosingProtocols: [
      {
        purpose: "Cognitive enhancement",
        doseRange: "10-20 µg nasal or 10 mg capsule",
        frequency: "1x daily",
        cycleDuration: "10-30 days, 2-3x per year",
        timing: "Morning for cognitive focus.",
      },
      {
        purpose: "Neuroprotection",
        doseRange: "10 mg oral",
        frequency: "1x daily",
        cycleDuration: "30 days",
        timing: "Morning.",
      },
    ],
    sideEffects: ["Very well tolerated", "Rare mild headache", "Rare nasal irritation (nasal route)"],
    stacksWith: ["epithalon", "semax", "selank", "pinealon", "cerebrolysin"],
    halfLife: "Short (minutes as a peptide), but effects are epigenetic and cumulative.",
    storage: "Room temperature in sealed container.",
        notes: "Developed by Professor Vladimir Khavinson in Russia. Cortagen specifically targets the brain cortex, while other bioregulators target different organs. Best used in cycles 2-3 times per year for long-term cognitive maintenance. Often combined with Pinealon for a brain + sleep bioregulator stack.",
  },
  {
    id: "larazotide",
    name: "Larazotide",
    abbreviation: "AT-1001",
    categories: ["immune", "recovery"],
    description:
      "A tight junction regulator peptide that decreases intestinal permeability (leaky gut). The first drug specifically designed to restore the gut epithelial barrier. Originally developed for celiac disease, now widely used in the biohacking community for gut health optimization.",
    mechanism:
      "Acts on zonulin pathways to restore tight junction integrity in the intestinal epithelium. Prevents the opening of gaps between intestinal cells that cause increased permeability. Works locally in the gut with minimal systemic absorption.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Gut barrier restoration",
        doseRange: "0.5-1 mg",
        frequency: "3x daily before meals",
        cycleDuration: "8-12 weeks",
        timing: "15 minutes before meals on empty stomach.",
      },
    ],
    sideEffects: ["Generally well-tolerated", "Occasional headache", "Mild nausea", "Mild GI discomfort", "Very low systemic side effects (acts locally)"],
    stacksWith: ["bpc157", "kpv", "ll37", "thymosin_a1"],
    halfLife: "2-4 hours (acts locally in the gut).",
    storage: "Room temperature, cool dry place. Capsule form — no reconstitution needed.",
        notes: "Reached Phase 3 clinical trials for celiac disease (INN-202). Unlike BPC-157 which heals gut tissue, Larazotide specifically targets the tight junction mechanism that causes leaky gut. Can be combined with oral BPC-157 for comprehensive gut healing — BPC repairs tissue while Larazotide seals the barriers.",
  },
  {
    id: "argireline",
    name: "Argireline",
    abbreviation: "Acetyl Hexapeptide-3",
    categories: ["anti_aging"],
    description:
      "A hexapeptide that reduces wrinkle depth by inhibiting neurotransmitter release at the neuromuscular junction — often called 'topical Botox.' One of the most popular and clinically validated cosmetic peptides, found in thousands of skincare products worldwide.",
    mechanism:
      "Inhibits SNARE complex formation (specifically targeting SNAP-25), reducing neurotransmitter release at the neuromuscular junction. This decreases the intensity of muscle contractions that cause dynamic wrinkles (forehead lines, crow's feet, frown lines). Non-paralytic — reduces but doesn't eliminate muscle movement.",
    routes: ["topical"],
    dosingProtocols: [
      {
        purpose: "Wrinkle reduction",
        doseRange: "5-10% serum concentration",
        frequency: "2x daily",
        cycleDuration: "Ongoing daily use",
        timing: "Apply to clean skin on forehead, crow's feet, and frown lines. Morning and evening.",
      },
    ],
    sideEffects: ["Very well tolerated", "Rare mild skin irritation", "Rare contact dermatitis", "No systemic effects at topical concentrations"],
    stacksWith: ["ghkcu", "matrixyl", "pe2228"],
    halfLife: "Local topical activity — not systemically absorbed.",
    storage: "Room temperature, away from heat and direct sunlight. Stable in formulated products for 12+ months.",
        notes: "Studies show up to 30% wrinkle depth reduction after 28 days of consistent use. Works best on expression lines (dynamic wrinkles) rather than deep static wrinkles. Synergistic with GHK-Cu and Matrixyl — Argireline relaxes muscles while the others stimulate collagen. Available OTC in most skincare stores.",
  },
  {
    id: "matrixyl",
    name: "Matrixyl",
    abbreviation: "Palmitoyl Pentapeptide-4",
    categories: ["anti_aging"],
    description:
      "A lipopeptide that mimics collagen fragments to signal fibroblasts to produce more collagen, elastin, and hyaluronic acid. One of the most clinically proven anti-aging peptides with studies showing double the collagen production compared to retinol. Available as Matrixyl 3000 (enhanced formula).",
    mechanism:
      "Mimics matrikines — collagen breakdown fragments that signal the body to produce new collagen. Activates fibroblasts to synthesize collagen types I, III, and IV, fibronectin, and hyaluronic acid. Matrixyl 3000 adds palmitoyl tetrapeptide-7 which reduces IL-6 inflammation that accelerates aging.",
    routes: ["topical"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / collagen stimulation",
        doseRange: "2-8% serum concentration",
        frequency: "1-2x daily",
        cycleDuration: "Ongoing daily use, visible results after 8-12 weeks",
        timing: "Apply to clean skin. Layer under moisturizer.",
      },
    ],
    sideEffects: ["Very well tolerated", "Rare mild irritation", "Safe for sensitive skin"],
    stacksWith: ["ghkcu", "argireline", "pe2228", "epithalon"],
    halfLife: "Local topical activity — not systemically absorbed.",
    storage: "Room temperature, away from direct sunlight. Stable in formulation.",
        notes: "Procter & Gamble's clinical studies showed Matrixyl was nearly twice as effective as retinol for collagen production, with none of the irritation. Matrixyl 3000 is the enhanced version combining two peptides for anti-wrinkle + anti-inflammatory effects. Best combined with Argireline (muscle relaxation) and GHK-Cu (tissue remodeling) for a complete topical peptide stack.",
  },
];

export const peptides: Peptide[] = [...peptideData, ...supplements];
