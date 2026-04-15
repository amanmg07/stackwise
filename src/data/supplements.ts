import { Peptide } from "../types";

export const supplements: Peptide[] = [
  // ===================== PERFORMANCE & RECOVERY =====================
  {
    id: "creatine_mono",
    name: "Creatine Monohydrate",
    abbreviation: "Creatine",
    compoundType: "supplement",
    categories: ["muscle_gain", "cognitive", "recovery"],
    description:
      "The most researched sports supplement in history. Increases muscle strength, power output, and cell hydration. Also supports brain function and may improve short-term memory.",
    mechanism:
      "Replenishes ATP (your cells' energy currency) by donating a phosphate group to ADP during high-intensity effort. Draws water into muscle cells, increasing cell volume which triggers protein synthesis. In the brain, supports energy-demanding cognitive tasks.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Daily maintenance",
        doseRange: "3-5 g",
        frequency: "Once daily",
        cycleDuration: "Ongoing — no cycling needed",
        timing: "Any time of day. Take with a meal or post-workout shake for best absorption. Mix in water or juice.",
      },
      {
        purpose: "Loading phase (optional)",
        doseRange: "20 g (split into 4x 5 g)",
        frequency: "4x daily for 5-7 days",
        cycleDuration: "5-7 days, then switch to maintenance",
        timing: "Spread doses throughout the day with meals. Loading saturates stores faster but isn't required.",
      },
    ],
    sideEffects: ["Water retention (first 1-2 weeks)", "Bloating at high doses", "Stomach cramps if not enough water"],
    stacksWith: ["beta_alanine", "citrulline", "hmb"],
    halfLife: "~3 hours in blood. Muscle stores deplete over 4-6 weeks without supplementation.",
    storage: "Room temperature in a dry place. Powder is very stable — lasts years. Avoid moisture.",
    notes: "Creatine monohydrate is the gold standard — no need for fancy forms (HCL, ethyl ester, etc.). Stay well hydrated. Safe for long-term use. One of the few supplements with overwhelming scientific support for muscle and strength gains.",
  },
  {
    id: "beta_alanine",
    name: "Beta-Alanine",
    compoundType: "supplement",
    categories: ["muscle_gain", "recovery"],
    description:
      "An amino acid that buffers acid in your muscles during high-intensity exercise. Delays the 'burn' and lets you push out more reps. Best for efforts lasting 1-4 minutes.",
    mechanism:
      "Combines with histidine in muscle to form carnosine, which buffers hydrogen ions (acid) produced during intense exercise. Higher carnosine = more reps before fatigue. Takes 2-4 weeks of daily use to saturate muscle stores.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Performance",
        doseRange: "3.2-6.4 g",
        frequency: "Daily (split into 2 doses to reduce tingling)",
        cycleDuration: "Ongoing — benefits build over 4+ weeks",
        timing: "Split morning and pre-workout. Take with a meal. The tingling (paresthesia) is harmless — smaller doses reduce it.",
      },
    ],
    sideEffects: ["Skin tingling/paresthesia (harmless, dose-dependent)", "Mild flushing"],
    stacksWith: ["creatine_mono", "citrulline"],
    halfLife: "~25 minutes in blood, but carnosine stores in muscle persist for weeks.",
    storage: "Room temperature, dry place. Very stable powder.",
    notes: "The tingling sensation is not dangerous — it's beta-alanine activating sensory neurons in the skin. If you dislike it, use sustained-release tablets or split into smaller doses. Most effective for high-rep training and endurance intervals.",
  },
  {
    id: "citrulline",
    name: "L-Citrulline",
    abbreviation: "Citrulline",
    compoundType: "supplement",
    categories: ["muscle_gain", "recovery"],
    description:
      "An amino acid that boosts nitric oxide production, increasing blood flow to muscles. Enhances pumps, endurance, and recovery. More effective than supplementing arginine directly.",
    mechanism:
      "Converted to arginine in the kidneys, which is then converted to nitric oxide (NO). NO relaxes blood vessels, improving blood flow and nutrient delivery to working muscles. Also helps clear ammonia, reducing fatigue.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Performance / pumps",
        doseRange: "6-8 g (pure L-citrulline) or 8-10 g (citrulline malate 2:1)",
        frequency: "Once daily, pre-workout",
        cycleDuration: "Ongoing",
        timing: "30-60 minutes before training on an empty stomach for best absorption.",
      },
    ],
    sideEffects: ["Mild stomach discomfort at high doses (rare)", "Slight drop in blood pressure"],
    stacksWith: ["creatine_mono", "beta_alanine"],
    halfLife: "~1 hour. Arginine levels peak ~1-2 hours after ingestion.",
    storage: "Room temperature, dry place.",
    notes: "L-citrulline is better absorbed than L-arginine for boosting NO. Citrulline malate (2:1 ratio) adds malic acid for extra ATP production. One of the best pre-workout ingredients for pumps and endurance.",
  },
  {
    id: "glutamine",
    name: "L-Glutamine",
    abbreviation: "Glutamine",
    compoundType: "supplement",
    categories: ["recovery", "immune"],
    description:
      "The most abundant amino acid in your body. Supports gut lining integrity, immune function, and muscle recovery after intense training. Especially useful during heavy training blocks or calorie deficits.",
    mechanism:
      "Primary fuel source for intestinal cells and immune cells (lymphocytes). During intense exercise or stress, glutamine is depleted faster than the body can produce it. Supplementing prevents this deficit, supporting gut barrier function and immune response.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Recovery & immune support",
        doseRange: "5-10 g",
        frequency: "1-2x daily",
        cycleDuration: "Ongoing, especially during hard training",
        timing: "Post-workout and/or before bed. Can be mixed into shakes.",
      },
    ],
    sideEffects: ["Generally very well tolerated", "Bloating at very high doses (20g+)"],
    stacksWith: ["creatine_mono", "collagen"],
    halfLife: "~1 hour in blood.",
    storage: "Room temperature, dry place. Stable powder.",
    notes: "Most beneficial when your body is under stress — hard training, dieting, illness, or travel. If you eat enough protein (1g/lb), you may already get sufficient glutamine from food. Most impactful for gut health and immune recovery.",
  },
  {
    id: "hmb",
    name: "HMB",
    abbreviation: "HMB",
    compoundType: "supplement",
    categories: ["muscle_gain", "recovery"],
    description:
      "A metabolite of leucine that prevents muscle breakdown. Most effective during calorie deficits, new training programs, or recovery from injury. Helps preserve lean mass.",
    mechanism:
      "Reduces muscle protein breakdown by inhibiting the ubiquitin-proteasome pathway (the system that tags damaged proteins for destruction). Also stimulates muscle protein synthesis through mTOR, though less powerfully than leucine itself.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Muscle preservation",
        doseRange: "3 g",
        frequency: "Daily (split into 3x 1 g or single dose)",
        cycleDuration: "Ongoing, especially during cuts",
        timing: "Split with meals or take 1 g pre-workout + 2 g with meals. HMB free acid form works faster than calcium HMB.",
      },
    ],
    sideEffects: ["Generally very well tolerated", "Mild GI discomfort (rare)"],
    stacksWith: ["creatine_mono", "beta_alanine"],
    halfLife: "~2.5 hours.",
    storage: "Room temperature, dry place.",
    notes: "Most research supports HMB for untrained individuals starting a program, or trained individuals in a caloric deficit. If you're in a bulk with sufficient protein, the benefits are minimal. The free acid form (HMB-FA) absorbs faster than calcium HMB.",
  },
  {
    id: "taurine",
    name: "Taurine",
    compoundType: "supplement",
    categories: ["recovery", "cognitive"],
    description:
      "An amino acid concentrated in the brain, heart, and muscles. Supports hydration, electrolyte balance, and antioxidant defense. May improve exercise performance and reduce oxidative stress.",
    mechanism:
      "Acts as an osmolyte (regulates cell hydration), antioxidant, and neuromodulator. Stabilizes cell membranes, supports calcium signaling in muscles, and has calming effects on the nervous system without causing drowsiness.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "General health & performance",
        doseRange: "1-3 g",
        frequency: "Once daily",
        cycleDuration: "Ongoing",
        timing: "Pre-workout or with a meal. Can also be taken before bed for its calming effects.",
      },
    ],
    sideEffects: ["Very well tolerated", "Mild drowsiness at high doses"],
    stacksWith: ["creatine_mono", "magnesium_glycinate"],
    halfLife: "~1-2 hours in blood, but tissue stores persist.",
    storage: "Room temperature, dry place.",
    notes: "Despite being in energy drinks, taurine is actually calming — the 'energy' in those drinks comes from caffeine and sugar. Taurine declines with age, making supplementation more valuable as you get older. Recent research links it to longevity.",
  },
  {
    id: "betaine_tmg",
    name: "Betaine (TMG)",
    abbreviation: "TMG",
    compoundType: "supplement",
    categories: ["muscle_gain", "recovery"],
    description:
      "A naturally occurring compound found in beets. Supports muscle power, endurance, and body composition. Also acts as a methyl donor for homocysteine metabolism.",
    mechanism:
      "Donates methyl groups to convert homocysteine to methionine, supporting methylation and cardiovascular health. As an osmolyte, it protects cells from dehydration stress. May increase creatine synthesis and growth hormone output.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Performance & body composition",
        doseRange: "2.5-6 g",
        frequency: "Daily (split into 2 doses)",
        cycleDuration: "Ongoing",
        timing: "Pre-workout and with a meal. Take with food to reduce any GI discomfort.",
      },
    ],
    sideEffects: ["Fishy body odor at high doses", "Nausea or GI upset", "Diarrhea (high doses)"],
    stacksWith: ["creatine_mono", "citrulline"],
    halfLife: "~6 hours.",
    storage: "Room temperature, dry place.",
    notes: "The fishy smell side effect is dose-dependent and not everyone gets it. Betaine and creatine work through complementary pathways — stacking them may be more effective than either alone. Also known as trimethylglycine (TMG).",
  },

  // ===================== HORMONAL SUPPORT =====================
  {
    id: "ashwagandha",
    name: "Ashwagandha (KSM-66)",
    abbreviation: "Ashwagandha",
    compoundType: "supplement",
    categories: ["hormone", "recovery", "cognitive"],
    description:
      "An adaptogenic herb used for centuries in Ayurvedic medicine. Reduces cortisol, supports testosterone, improves stress resilience, and enhances sleep quality. KSM-66 is the most studied extract.",
    mechanism:
      "Modulates the HPA axis (hypothalamic-pituitary-adrenal) to reduce cortisol production under stress. Supports GABA pathways for calming effects. May increase luteinizing hormone (LH) and testosterone by reducing cortisol's suppressive effect on the HPG axis.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Stress & cortisol reduction",
        doseRange: "300-600 mg (KSM-66 extract)",
        frequency: "Once daily",
        cycleDuration: "8-12 weeks on, 2-4 weeks off",
        timing: "With breakfast or dinner. Some people prefer evening for sleep benefits. Take with food.",
      },
      {
        purpose: "Testosterone support",
        doseRange: "600 mg (KSM-66)",
        frequency: "Once daily",
        cycleDuration: "8-12 weeks on, 4 weeks off",
        timing: "Morning with food. Effects on testosterone typically show after 8+ weeks of consistent use.",
      },
    ],
    sideEffects: ["Drowsiness", "Stomach upset", "Thyroid hormone changes (avoid with hyperthyroidism)", "May increase testosterone"],
    stacksWith: ["tongkat_ali", "magnesium_glycinate", "zinc_magnesium"],
    halfLife: "~6-12 hours depending on extract type.",
    storage: "Room temperature, cool dry place. Keep sealed.",
    notes: "KSM-66 is the gold standard extract — full-spectrum root extract with the most clinical research. Avoid Sensoril if you want daytime energy (it's more sedating). Cycle off every 2-3 months. Not recommended for people with thyroid conditions without medical guidance.",
  },
  {
    id: "tongkat_ali",
    name: "Tongkat Ali",
    abbreviation: "Tongkat Ali",
    compoundType: "supplement",
    categories: ["hormone", "muscle_gain"],
    description:
      "A Southeast Asian herb (Eurycoma longifolia) used for testosterone support, libido, and athletic performance. One of the most effective natural testosterone boosters with solid clinical evidence.",
    mechanism:
      "Stimulates the release of free testosterone by reducing SHBG (sex hormone-binding globulin) levels. May also stimulate Leydig cells to produce more testosterone and reduce cortisol. Contains quassinoids and eurycomanone as active compounds.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Testosterone & performance",
        doseRange: "200-400 mg (standardized 2% eurycomanone)",
        frequency: "Once daily",
        cycleDuration: "8-12 weeks on, 2-4 weeks off",
        timing: "Morning with food. Look for standardized extracts (100:1 or 200:1 concentration).",
      },
    ],
    sideEffects: ["Restlessness", "Insomnia (if taken late)", "Increased aggression (rare)", "Mild GI upset"],
    stacksWith: ["ashwagandha", "fadogia", "boron"],
    halfLife: "~9-12 hours.",
    storage: "Room temperature, dry place. Keep away from humidity.",
    notes: "Quality matters a lot — cheap Tongkat Ali is often underdosed or contaminated with heavy metals. Look for brands that test for eurycomanone content and heavy metals. Pairs well with Fadogia Agrestis for a testosterone-focused stack. Take in the morning to avoid sleep disruption.",
  },
  {
    id: "fadogia",
    name: "Fadogia Agrestis",
    abbreviation: "Fadogia",
    compoundType: "supplement",
    categories: ["hormone", "muscle_gain"],
    description:
      "A Nigerian shrub extract gaining popularity for testosterone support. Works through a different mechanism than Tongkat Ali, making them complementary. Research is still emerging.",
    mechanism:
      "Believed to directly stimulate the Leydig cells in the testes to produce more testosterone. May also increase luteinizing hormone (LH). The active compounds (saponins and alkaloids) mimic signaling molecules that trigger testosterone production.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Testosterone support",
        doseRange: "300-600 mg",
        frequency: "Once daily",
        cycleDuration: "6-8 weeks on, 4 weeks off",
        timing: "Morning with food. Cycling is important — don't run continuously.",
      },
    ],
    sideEffects: ["Limited human safety data", "Potential testicular toxicity at very high doses (animal studies)", "Insomnia"],
    stacksWith: ["tongkat_ali", "boron"],
    halfLife: "Not well established in humans.",
    storage: "Room temperature, dry place.",
    notes: "Exercise caution — Fadogia has less human research than Tongkat Ali or Ashwagandha. Animal studies used much higher doses. Cycle strictly (no more than 8 weeks on) and get blood work done. Often stacked with Tongkat Ali for synergistic testosterone effects.",
  },
  {
    id: "dim",
    name: "DIM (Diindolylmethane)",
    abbreviation: "DIM",
    compoundType: "supplement",
    categories: ["hormone"],
    description:
      "A compound derived from cruciferous vegetables (broccoli, cauliflower). Helps balance estrogen metabolism by shifting it toward less potent forms. Used by both men and women for hormonal balance.",
    mechanism:
      "Promotes the conversion of estrogen into 2-hydroxyestrone (a weaker, protective form) rather than 16-alpha-hydroxyestrone (a more potent form). Supports healthy estrogen-to-testosterone ratios in men. In women, supports balanced estrogen metabolism.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Estrogen balance",
        doseRange: "100-200 mg",
        frequency: "Once daily",
        cycleDuration: "Ongoing or 8-12 week cycles",
        timing: "With a fat-containing meal for absorption. DIM is fat-soluble.",
      },
    ],
    sideEffects: ["Darkened urine (harmless)", "GI upset", "Headache", "Hormonal shifts if overdosed"],
    stacksWith: ["tongkat_ali", "ashwagandha", "zinc_magnesium"],
    halfLife: "~2-6 hours.",
    storage: "Room temperature, dry place. Keep sealed.",
    notes: "Start at 100 mg and assess. Men often use DIM to manage estrogen when running testosterone-boosting supplements. Women may use it for PMS or menopause support. Don't exceed 200 mg/day without blood work. Dark urine is a known harmless side effect.",
  },
  {
    id: "boron",
    name: "Boron",
    compoundType: "supplement",
    categories: ["hormone", "recovery"],
    description:
      "A trace mineral that supports free testosterone levels, bone health, and reduces inflammation. Often overlooked but one of the most cost-effective hormone support supplements.",
    mechanism:
      "Reduces SHBG (sex hormone-binding globulin), freeing up more testosterone. Also reduces inflammatory markers (CRP, TNF-alpha), supports vitamin D metabolism, and improves magnesium absorption. Supports bone mineral density.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Hormone & joint support",
        doseRange: "6-10 mg",
        frequency: "Once daily",
        cycleDuration: "Ongoing",
        timing: "With any meal. Can be taken any time of day.",
      },
    ],
    sideEffects: ["GI discomfort at high doses", "Very safe at recommended doses"],
    stacksWith: ["tongkat_ali", "ashwagandha", "vitamin_d3k2"],
    halfLife: "~21 hours.",
    storage: "Room temperature, dry place.",
    notes: "One of the cheapest and most underrated supplements for hormonal support. Studies show it can increase free testosterone within one week. Most people are deficient since modern diets are low in boron. Very safe — the tolerable upper limit is 20 mg/day.",
  },
  {
    id: "zinc_magnesium",
    name: "ZMA (Zinc + Magnesium + B6)",
    abbreviation: "ZMA",
    compoundType: "supplement",
    categories: ["hormone", "sleep", "recovery"],
    description:
      "A combination of zinc, magnesium, and vitamin B6 that supports testosterone production, sleep quality, and muscle recovery. Addresses two of the most common mineral deficiencies in athletes.",
    mechanism:
      "Zinc is required for testosterone synthesis and immune function — deficiency directly lowers testosterone. Magnesium supports 300+ enzymatic reactions including muscle relaxation and sleep. B6 enhances absorption and supports neurotransmitter production.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Hormone & recovery support",
        doseRange: "30 mg zinc, 450 mg magnesium, 10 mg B6",
        frequency: "Once daily",
        cycleDuration: "Ongoing",
        timing: "30-60 minutes before bed on an empty stomach. Don't take with calcium or dairy (blocks zinc absorption).",
      },
    ],
    sideEffects: ["Nausea on empty stomach", "Vivid dreams (from B6)", "GI upset", "Metallic taste (too much zinc)"],
    stacksWith: ["ashwagandha", "tongkat_ali", "vitamin_d3k2"],
    halfLife: "Zinc: ~3 hours. Magnesium: ~6-8 hours.",
    storage: "Room temperature, dry place.",
    notes: "Most beneficial if you're deficient in zinc or magnesium (common in athletes who sweat a lot). If you already get enough from diet, the testosterone-boosting effects will be minimal. Don't exceed 40 mg/day zinc long-term to avoid copper depletion.",
  },
  {
    id: "dhea",
    name: "DHEA",
    compoundType: "supplement",
    categories: ["hormone", "anti_aging"],
    description:
      "A hormone naturally produced by your adrenal glands that serves as a precursor to both testosterone and estrogen. Levels peak in your 20s and decline with age. Often used for anti-aging and hormonal balance.",
    mechanism:
      "DHEA is converted into androgens and estrogens downstream. It supports immune function, bone density, mood, and body composition. As the most abundant circulating steroid hormone, declining levels with age are associated with many age-related changes.",
    routes: ["oral", "topical"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / hormone support",
        doseRange: "25-50 mg (men), 10-25 mg (women)",
        frequency: "Once daily",
        cycleDuration: "3-6 months, then reassess with blood work",
        timing: "Morning with food. Start low and titrate based on blood levels.",
      },
    ],
    sideEffects: ["Acne", "Oily skin", "Hair loss (in those predisposed)", "Mood changes", "Hormonal imbalance if overdosed"],
    stacksWith: ["ashwagandha", "vitamin_d3k2"],
    halfLife: "~8-12 hours.",
    storage: "Room temperature, dry place. Keep away from heat.",
    notes: "DHEA is a real hormone — not just a supplement. Get blood work (DHEA-S levels) before and during supplementation. Women should use lower doses and monitor for androgenic side effects. Banned by most sports organizations. Over-the-counter in the US but prescription in many other countries.",
  },
  {
    id: "fenugreek",
    name: "Fenugreek",
    compoundType: "supplement",
    categories: ["hormone", "muscle_gain"],
    description:
      "An herb used in traditional medicine with solid research supporting its testosterone and libido benefits. Contains furostanolic saponins that inhibit enzymes converting testosterone to estrogen.",
    mechanism:
      "Inhibits aromatase (the enzyme that converts testosterone to estrogen) and 5-alpha reductase (which converts testosterone to DHT). This keeps more free testosterone available. Also supports insulin sensitivity and may reduce blood sugar.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Testosterone & libido",
        doseRange: "500-600 mg (standardized extract, e.g., Testofen)",
        frequency: "Once daily",
        cycleDuration: "8-12 weeks on, 4 weeks off",
        timing: "With a meal, any time of day.",
      },
    ],
    sideEffects: ["Maple syrup-smelling sweat/urine", "GI upset", "Bloating", "May lower blood sugar"],
    stacksWith: ["ashwagandha", "tongkat_ali", "zinc_magnesium"],
    halfLife: "~2-3 hours for active compounds.",
    storage: "Room temperature, dry place.",
    notes: "The maple syrup smell is from sotolon, a compound in fenugreek — it's harmless but noticeable. Look for standardized extracts (Testofen, Furosap) rather than raw fenugreek powder. Diabetics should monitor blood sugar as fenugreek can lower it.",
  },

  // ===================== COGNITIVE / NOOTROPICS =====================
  {
    id: "lions_mane",
    name: "Lion's Mane",
    compoundType: "supplement",
    categories: ["cognitive"],
    description:
      "A medicinal mushroom that stimulates nerve growth factor (NGF) production in the brain. Supports memory, focus, and may help with neuroregeneration. One of the few natural nootropics with strong mechanistic evidence.",
    mechanism:
      "Contains hericenones and erinacines that cross the blood-brain barrier and stimulate NGF synthesis. NGF supports the growth, maintenance, and survival of neurons. May also promote myelination (the insulation around nerve fibers) for faster signal transmission.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Cognitive enhancement",
        doseRange: "500-1000 mg (extract, 30%+ polysaccharides)",
        frequency: "1-2x daily",
        cycleDuration: "Ongoing — benefits build over weeks",
        timing: "Morning or split morning/afternoon. Can be taken with or without food. Effects are cumulative — expect 2-4 weeks before noticeable changes.",
      },
    ],
    sideEffects: ["Mild GI upset (rare)", "Skin itchiness (rare, from increased NGF)"],
    stacksWith: ["alpha_gpc", "rhodiola"],
    halfLife: "Active compounds peak ~1 hour. NGF stimulation effects are cumulative.",
    storage: "Room temperature, dry place. Dual-extract (water + alcohol) products have better shelf stability.",
    notes: "Look for dual-extracted products that contain both hericenones (alcohol-soluble) and erinacines (water-soluble). Fruiting body extracts are preferred over mycelium-on-grain. Effects are gradual — give it at least 4 weeks.",
  },
  {
    id: "alpha_gpc",
    name: "Alpha-GPC",
    compoundType: "supplement",
    categories: ["cognitive", "muscle_gain"],
    description:
      "A highly bioavailable choline source that crosses the blood-brain barrier. Supports memory, focus, and may boost growth hormone and power output. Used as both a nootropic and a sports supplement.",
    mechanism:
      "Provides choline for acetylcholine synthesis — the neurotransmitter responsible for memory, learning, and muscle contraction. Also supports cell membrane integrity via phosphatidylcholine. May stimulate growth hormone release when taken pre-exercise.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Cognitive support",
        doseRange: "300-600 mg",
        frequency: "1-2x daily",
        cycleDuration: "Ongoing",
        timing: "Morning and early afternoon. Avoid late evening as it may increase alertness. Take with food.",
      },
      {
        purpose: "Pre-workout (GH boost)",
        doseRange: "600 mg",
        frequency: "Pre-workout",
        cycleDuration: "Ongoing",
        timing: "30-60 minutes before training.",
      },
    ],
    sideEffects: ["Headache", "GI upset", "Fishy body odor (choline)", "Insomnia if taken late"],
    stacksWith: ["lions_mane", "rhodiola", "creatine_mono"],
    halfLife: "~4-6 hours.",
    storage: "Room temperature. Alpha-GPC is hygroscopic — keep tightly sealed to prevent clumping.",
    notes: "Alpha-GPC delivers more choline to the brain than other forms (CDP-choline, choline bitartrate). The 50% Alpha-GPC powder is standard — 600 mg provides 300 mg actual choline. If you get headaches, you may be getting too much choline.",
  },
  {
    id: "l_theanine",
    name: "L-Theanine",
    compoundType: "supplement",
    categories: ["cognitive", "sleep"],
    description:
      "An amino acid found in green tea that promotes calm focus without drowsiness. Pairs perfectly with caffeine for smooth, jitter-free energy. Also supports sleep quality when taken before bed.",
    mechanism:
      "Increases alpha brain wave activity (the 'relaxed focus' state). Boosts GABA, serotonin, and dopamine levels. When paired with caffeine, it smooths out the stimulant effects — more focus, less anxiety and jitters.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Focus (with caffeine)",
        doseRange: "100-200 mg (with 100 mg caffeine)",
        frequency: "1-2x daily",
        cycleDuration: "Ongoing",
        timing: "Morning or pre-work. The classic ratio is 2:1 theanine to caffeine.",
      },
      {
        purpose: "Sleep / relaxation",
        doseRange: "200-400 mg",
        frequency: "Once before bed",
        cycleDuration: "Ongoing",
        timing: "30-60 minutes before bed. Can be combined with magnesium glycinate.",
      },
    ],
    sideEffects: ["Very rare — one of the safest supplements", "Mild drowsiness at high doses"],
    stacksWith: ["lions_mane", "magnesium_glycinate", "alpha_gpc"],
    halfLife: "~2.5-4 hours.",
    storage: "Room temperature, dry place.",
    notes: "One of the safest and most reliable nootropics. The caffeine + L-theanine stack is the most popular nootropic combination for good reason. No tolerance buildup, no withdrawal. Works immediately — no loading period needed.",
  },
  {
    id: "rhodiola",
    name: "Rhodiola Rosea",
    abbreviation: "Rhodiola",
    compoundType: "supplement",
    categories: ["cognitive", "recovery"],
    description:
      "An adaptogenic herb that reduces fatigue, improves mental performance under stress, and supports endurance. Used by Russian athletes and military for decades.",
    mechanism:
      "Modulates cortisol and stress hormones via the HPA axis. Enhances serotonin and dopamine activity by inhibiting MAO enzymes. Contains rosavins and salidroside which support mitochondrial energy production and reduce perceived exertion.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Anti-fatigue & mental performance",
        doseRange: "200-600 mg (standardized to 3% rosavins, 1% salidroside)",
        frequency: "Once daily",
        cycleDuration: "8-12 weeks on, 2-4 weeks off",
        timing: "Morning on an empty stomach. Avoid evening — it can be stimulating. Effects often noticed within the first week.",
      },
    ],
    sideEffects: ["Dizziness", "Dry mouth", "Restlessness", "Insomnia (if taken late)"],
    stacksWith: ["ashwagandha", "lions_mane", "alpha_gpc"],
    halfLife: "~4-6 hours for salidroside.",
    storage: "Room temperature, dry place.",
    notes: "Rhodiola and Ashwagandha are complementary adaptogens — Rhodiola is more stimulating (morning), Ashwagandha is more calming (evening). Look for extracts standardized to 3% rosavins and 1% salidroside. SHR-5 extract has the most research.",
  },
  {
    id: "bacopa",
    name: "Bacopa Monnieri",
    abbreviation: "Bacopa",
    compoundType: "supplement",
    categories: ["cognitive"],
    description:
      "An Ayurvedic herb with strong evidence for memory enhancement and learning. Unlike stimulant nootropics, Bacopa works gradually over weeks to improve memory consolidation and recall.",
    mechanism:
      "Contains bacosides that enhance synaptic communication by increasing dendritic branching and improving signal transmission between neurons. Also has antioxidant effects in the hippocampus (memory center). Modulates serotonin, dopamine, and acetylcholine.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Memory & learning",
        doseRange: "300-600 mg (standardized to 50% bacosides)",
        frequency: "Once daily",
        cycleDuration: "12+ weeks for full effects",
        timing: "With a fat-containing meal (bacosides are fat-soluble). Morning or afternoon. Be patient — full benefits appear after 8-12 weeks.",
      },
    ],
    sideEffects: ["GI upset (common, take with food)", "Fatigue/drowsiness", "Dry mouth", "Reduced motivation (some people)"],
    stacksWith: ["lions_mane", "alpha_gpc", "rhodiola"],
    halfLife: "~2-4 hours for bacosides.",
    storage: "Room temperature, dry place.",
    notes: "Bacopa requires patience — it's not an instant focus pill. Think of it as training your brain's memory systems over months. GI side effects are common but manageable by taking with food. Some people feel slightly sedated — try taking it in the evening if this happens.",
  },
  {
    id: "phosphatidylserine",
    name: "Phosphatidylserine",
    abbreviation: "PS",
    compoundType: "supplement",
    categories: ["cognitive", "recovery"],
    description:
      "A phospholipid that makes up a key component of brain cell membranes. Supports memory, focus, and may reduce cortisol after exercise. Particularly useful for age-related cognitive decline.",
    mechanism:
      "Maintains cell membrane fluidity and receptor function in neurons. Supports neurotransmitter release (especially acetylcholine and dopamine). Blunts cortisol response to exercise stress, which may improve recovery and reduce overtraining risk.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Cognitive support & cortisol management",
        doseRange: "100-300 mg",
        frequency: "Once daily",
        cycleDuration: "Ongoing",
        timing: "With a meal. For cortisol blunting, take post-workout.",
      },
    ],
    sideEffects: ["Mild GI upset (rare)", "Insomnia at high doses"],
    stacksWith: ["lions_mane", "alpha_gpc", "omega3"],
    halfLife: "Incorporated into cell membranes — effects are cumulative.",
    storage: "Room temperature, away from light. Softgels preferred for stability.",
    notes: "Originally derived from bovine brain (no longer used). Modern PS is from soy or sunflower lecithin — equally effective and much safer. Most research uses 100 mg 3x/day, but 200-300 mg once daily works too. FDA allows a qualified health claim for PS and cognitive function.",
  },

  // ===================== SLEEP & RECOVERY =====================
  {
    id: "magnesium_glycinate",
    name: "Magnesium Glycinate",
    abbreviation: "Mag Glycinate",
    compoundType: "supplement",
    categories: ["sleep", "recovery"],
    description:
      "The most bioavailable and gut-friendly form of magnesium. Supports sleep quality, muscle relaxation, and stress reduction. Glycinate form is bound to glycine, an amino acid that also promotes sleep.",
    mechanism:
      "Magnesium activates the parasympathetic nervous system (rest-and-digest mode). Regulates GABA receptors for calming effects. Relaxes muscles by blocking excess calcium at the neuromuscular junction. Glycine itself promotes sleep by lowering core body temperature.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Sleep & recovery",
        doseRange: "200-400 mg elemental magnesium",
        frequency: "Once daily",
        cycleDuration: "Ongoing",
        timing: "30-60 minutes before bed. Take with or without food — glycinate is gentle on the stomach.",
      },
    ],
    sideEffects: ["Drowsiness (desired at bedtime)", "Loose stools at very high doses (rare with glycinate)", "Low blood pressure"],
    stacksWith: ["l_theanine", "apigenin", "zinc_magnesium", "ashwagandha"],
    halfLife: "~6-8 hours. Body stores replenish over weeks.",
    storage: "Room temperature, dry place.",
    notes: "Glycinate is the preferred form for sleep and relaxation — it doesn't cause the laxative effect of citrate or oxide. ~50% of people are magnesium deficient due to modern diets and soil depletion. If you only take one supplement for sleep, make it this one.",
  },
  {
    id: "apigenin",
    name: "Apigenin",
    compoundType: "supplement",
    categories: ["sleep", "anti_aging"],
    description:
      "A flavonoid found in chamomile that promotes sleep and has anti-anxiety effects. Also shows promising anti-cancer and anti-inflammatory properties in research. A key component of Andrew Huberman's sleep stack.",
    mechanism:
      "Binds to GABA-A receptors as a positive allosteric modulator — enhancing GABA's calming effect without the sedation or dependence of benzodiazepines. Also inhibits CD38, an enzyme that breaks down NAD+, potentially supporting cellular energy and longevity.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Sleep",
        doseRange: "50 mg",
        frequency: "Once before bed",
        cycleDuration: "Ongoing",
        timing: "30-60 minutes before bed. Can combine with magnesium glycinate and L-theanine for a comprehensive sleep stack.",
      },
    ],
    sideEffects: ["Very well tolerated", "Mild sedation (desired)", "May affect estrogen metabolism at very high doses"],
    stacksWith: ["magnesium_glycinate", "l_theanine"],
    halfLife: "~12 hours.",
    storage: "Room temperature, dry place. Keep away from light.",
    notes: "The Huberman sleep stack is: 50 mg apigenin + 300-400 mg magnesium threonate/glycinate + 100-200 mg L-theanine. Apigenin's CD38 inhibition makes it interesting for longevity — it helps preserve NAD+ levels. Very safe with no known dependency issues.",
  },
  {
    id: "glycine_sleep",
    name: "Glycine",
    compoundType: "supplement",
    categories: ["sleep", "recovery"],
    description:
      "A simple amino acid that improves sleep quality by lowering core body temperature. Also supports collagen production and acts as an inhibitory neurotransmitter. Cheap and effective.",
    mechanism:
      "Acts on NMDA receptors in the suprachiasmatic nucleus (your body's clock) to lower core body temperature — a key trigger for sleep onset. Also serves as an inhibitory neurotransmitter in the brainstem and spinal cord. Provides raw material for collagen synthesis.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Sleep quality",
        doseRange: "3 g",
        frequency: "Once before bed",
        cycleDuration: "Ongoing",
        timing: "30-60 minutes before bed. Dissolves easily in water — has a slightly sweet taste.",
      },
    ],
    sideEffects: ["Very safe", "Mild nausea at high doses", "Soft stools (rare)"],
    stacksWith: ["magnesium_glycinate", "l_theanine", "collagen"],
    halfLife: "~30 minutes in blood, but thermoregulatory effects last longer.",
    storage: "Room temperature, dry place. Very stable.",
    notes: "One of the simplest and cheapest sleep supplements. Studies show 3 g before bed improves subjective sleep quality and reduces next-day fatigue. The temperature-lowering mechanism is the same reason a cool bedroom helps you sleep. Tastes slightly sweet — easy to take in water.",
  },

  // ===================== SKIN & ANTI-AGING =====================
  {
    id: "collagen",
    name: "Collagen Peptides",
    abbreviation: "Collagen",
    compoundType: "supplement",
    categories: ["anti_aging", "recovery"],
    description:
      "Hydrolyzed collagen protein that supports skin elasticity, joint health, and connective tissue repair. Types I and III are best for skin; Type II for joints. The most abundant protein in your body.",
    mechanism:
      "Provides bioactive peptides (especially hydroxyproline-proline) that stimulate fibroblasts to produce new collagen. Also triggers hyaluronic acid production in skin. After digestion, collagen peptides accumulate in skin and cartilage tissue.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Skin & joint health",
        doseRange: "10-15 g",
        frequency: "Once daily",
        cycleDuration: "Ongoing — benefits peak at 8-12 weeks",
        timing: "Any time. Mix into coffee, smoothies, or water. Take with vitamin C (50-100 mg) to support collagen synthesis. Best on an empty stomach or between meals.",
      },
    ],
    sideEffects: ["Mild bloating", "Feeling of fullness", "Allergic reaction if sensitive to source (bovine, marine, etc.)"],
    stacksWith: ["vitamin_c", "hyaluronic_acid", "glycine_sleep"],
    halfLife: "Peptides absorbed within 1-2 hours. Tissue effects are cumulative.",
    storage: "Room temperature, dry place. Powder is very stable.",
    notes: "Marine collagen has the highest bioavailability. Bovine is most common and more affordable. Taking with vitamin C significantly improves collagen synthesis. Benefits are real but take 8-12 weeks to notice. Collagen is NOT a complete protein — don't count it toward your daily protein goal.",
  },
  {
    id: "vitamin_c",
    name: "Vitamin C",
    compoundType: "supplement",
    categories: ["immune", "anti_aging"],
    description:
      "An essential antioxidant that supports immune function, collagen synthesis, and skin health. Crucial cofactor for collagen production. Most people benefit from supplementation, especially during stress or training.",
    mechanism:
      "Required cofactor for prolyl and lysyl hydroxylase — enzymes essential for collagen crosslinking and stability. Powerful antioxidant that neutralizes free radicals. Supports immune cell function (neutrophils, lymphocytes). Enhances iron absorption.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "General health & immune support",
        doseRange: "500-1000 mg",
        frequency: "1-2x daily",
        cycleDuration: "Ongoing",
        timing: "With meals to reduce GI upset. Split doses for better absorption (body saturates at ~200-500 mg per dose).",
      },
    ],
    sideEffects: ["GI upset at high doses", "Diarrhea (dose-dependent)", "Kidney stones risk at very high chronic doses"],
    stacksWith: ["collagen", "vitamin_d3k2", "omega3"],
    halfLife: "~2 hours. Body stores last 1-3 months.",
    storage: "Room temperature, dry place. Sensitive to moisture and light.",
    notes: "Mega-dosing (5g+) has no proven benefit and can cause kidney stones. 500-1000 mg/day covers most people's needs. Liposomal vitamin C has better absorption. Always take with collagen supplements for the synergy.",
  },
  {
    id: "coq10",
    name: "CoQ10 (Ubiquinol)",
    abbreviation: "CoQ10",
    compoundType: "supplement",
    categories: ["anti_aging", "recovery"],
    description:
      "A coenzyme essential for mitochondrial energy production and a powerful antioxidant. Levels decline with age and statin use. Ubiquinol is the active, reduced form — more bioavailable than ubiquinone.",
    mechanism:
      "Shuttles electrons in the mitochondrial electron transport chain (Complex I to III), directly supporting ATP production. As an antioxidant, protects cell membranes and LDL cholesterol from oxidation. Supports heart muscle function.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Anti-aging & energy",
        doseRange: "100-200 mg (ubiquinol form)",
        frequency: "Once daily",
        cycleDuration: "Ongoing",
        timing: "With a fat-containing meal (CoQ10 is fat-soluble). Morning preferred.",
      },
    ],
    sideEffects: ["Very well tolerated", "Mild insomnia (if taken late)", "GI upset (rare)"],
    stacksWith: ["nmn", "omega3", "vitamin_d3k2"],
    halfLife: "~33 hours.",
    storage: "Room temperature, away from light and heat. Softgels preferred.",
    notes: "Ubiquinol (reduced form) is 3-8x more bioavailable than ubiquinone (oxidized form). Essential supplement if you take statins (which deplete CoQ10). After age 40, your body's CoQ10 production drops significantly. One of the most important supplements for heart health.",
  },
  {
    id: "nmn",
    name: "NMN (Nicotinamide Mononucleotide)",
    abbreviation: "NMN",
    compoundType: "supplement",
    categories: ["anti_aging"],
    description:
      "A direct precursor to NAD+, the molecule essential for cellular energy, DNA repair, and sirtuin activation. NAD+ levels decline ~50% between ages 40-60. NMN aims to restore youthful levels.",
    mechanism:
      "Converted to NAD+ via the salvage pathway enzyme NMNAT. NAD+ activates sirtuins (especially SIRT1 and SIRT3), which regulate aging, metabolism, and stress resistance. Also supports PARP enzymes for DNA repair and mitochondrial function.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Anti-aging / NAD+ restoration",
        doseRange: "250-500 mg",
        frequency: "Once daily",
        cycleDuration: "Ongoing",
        timing: "Morning on an empty stomach. Sublingual absorption may be superior. Some prefer splitting into 2 doses.",
      },
    ],
    sideEffects: ["Mild nausea", "Flushing", "Headache", "GI discomfort"],
    stacksWith: ["coq10", "apigenin", "vitamin_d3k2"],
    halfLife: "~2-3 minutes in blood (rapidly converted to NAD+). NAD+ levels remain elevated for hours.",
    storage: "Refrigerate for best stability. Keep away from moisture and heat. Powder degrades faster than capsules.",
    notes: "NMN vs NR (nicotinamide riboside) is an ongoing debate — both raise NAD+. NMN may be more direct. Quality varies wildly — look for third-party tested products with >98% purity. David Sinclair's research popularized NMN, though human studies are still emerging.",
  },
  {
    id: "astaxanthin",
    name: "Astaxanthin",
    compoundType: "supplement",
    categories: ["anti_aging", "recovery"],
    description:
      "One of nature's most powerful antioxidants — 6,000x stronger than vitamin C. Derived from microalgae. Protects skin from UV damage, reduces inflammation, and supports eye and cardiovascular health.",
    mechanism:
      "Spans the entire cell membrane (unlike most antioxidants that only work on one side), providing complete protection against oxidative damage. Quenches singlet oxygen and scavenges free radicals without becoming pro-oxidant. Crosses the blood-brain and blood-retinal barriers.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "Antioxidant & skin protection",
        doseRange: "4-12 mg",
        frequency: "Once daily",
        cycleDuration: "Ongoing",
        timing: "With a fat-containing meal (it's fat-soluble). Morning preferred.",
      },
    ],
    sideEffects: ["Very safe", "Slight orange tint to skin at very high doses (rare)", "Mild GI upset"],
    stacksWith: ["omega3", "coq10", "collagen"],
    halfLife: "~16 hours.",
    storage: "Room temperature, away from light. Softgels preferred.",
    notes: "Natural astaxanthin (from Haematococcus pluvialis algae) is far superior to synthetic. Acts as an internal sunscreen — studies show it reduces UV skin damage after 4-6 weeks. Also popular among endurance athletes for reducing exercise-induced oxidative stress.",
  },

  // ===================== FOUNDATIONAL =====================
  {
    id: "vitamin_d3k2",
    name: "Vitamin D3 + K2",
    abbreviation: "D3/K2",
    compoundType: "supplement",
    categories: ["immune", "hormone", "recovery"],
    description:
      "The sunshine vitamin paired with K2 for proper calcium routing. D3 supports immune function, bone health, mood, and testosterone. K2 ensures calcium goes to bones, not arteries. Most people are deficient.",
    mechanism:
      "D3 acts as a hormone — binds to receptors in nearly every cell type. Upregulates antimicrobial peptides (cathelicidins) for immune defense. Supports testosterone by acting on Leydig cells. K2 activates osteocalcin (puts calcium in bones) and matrix GLA protein (removes calcium from arteries).",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "General health (most people)",
        doseRange: "2,000-5,000 IU D3 + 100-200 mcg K2 (MK-7)",
        frequency: "Once daily",
        cycleDuration: "Ongoing (especially fall-spring in northern latitudes)",
        timing: "With a fat-containing meal. Morning preferred. Get blood levels checked — target 40-60 ng/mL 25(OH)D.",
      },
    ],
    sideEffects: ["Very safe at recommended doses", "Hypercalcemia at very high doses (10,000+ IU daily for months)"],
    stacksWith: ["magnesium_glycinate", "zinc_magnesium", "omega3"],
    halfLife: "D3: ~2 weeks in blood. K2 (MK-7): ~3 days.",
    storage: "Room temperature, away from light. Softgels/oil-based preferred for absorption.",
    notes: "Get a 25(OH)D blood test before dosing — ~42% of US adults are deficient. D3 without K2 can cause calcium to deposit in soft tissues. Always take with fat for absorption. Darker skin, northern latitudes, and indoor lifestyles dramatically increase deficiency risk.",
  },
  {
    id: "omega3",
    name: "Omega-3 Fish Oil",
    abbreviation: "Omega-3",
    compoundType: "supplement",
    categories: ["recovery", "cognitive", "anti_aging"],
    description:
      "EPA and DHA — essential fatty acids that reduce inflammation, support brain function, and protect cardiovascular health. Most Western diets are severely deficient in omega-3s relative to omega-6s.",
    mechanism:
      "EPA reduces inflammation by competing with arachidonic acid (omega-6) for COX and LOX enzymes, producing less inflammatory eicosanoids. DHA is a structural component of brain cell membranes (makes up 40% of brain polyunsaturated fats). Both support cell membrane fluidity and signaling.",
    routes: ["oral"],
    dosingProtocols: [
      {
        purpose: "General health",
        doseRange: "2-3 g combined EPA+DHA",
        frequency: "Once daily (or split AM/PM)",
        cycleDuration: "Ongoing",
        timing: "With a fat-containing meal to maximize absorption. Refrigerate liquid fish oil after opening.",
      },
    ],
    sideEffects: ["Fishy burps (use enteric-coated or triglyceride form)", "Mild GI upset", "Increased bleeding time at very high doses"],
    stacksWith: ["vitamin_d3k2", "coq10", "astaxanthin"],
    halfLife: "DHA: ~2.5 days. EPA: ~2 days. Tissue levels take weeks to change.",
    storage: "Refrigerate after opening (liquid). Softgels at room temperature, away from heat and light.",
    notes: "Look at the EPA+DHA content, not total fish oil weight — a 1000 mg fish oil capsule might only have 300 mg EPA+DHA. Triglyceride form absorbs 70% better than ethyl ester form. If you eat fatty fish 3+ times/week, you may not need to supplement. IFOS certification ensures purity.",
  },
];
