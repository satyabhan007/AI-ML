/* AI-ML Learn — Part 8 · Chapter 8: Drift & Data Quality */
window.CH[8] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>A model does not "break" like code. It <b>drifts</b>: the world moves, the inputs stop looking like the training data, and accuracy quietly slides — ' +
      'no error, no exception, just worse decisions. And it can be poisoned by a broken pipeline feeding it garbage. Monitoring for both is how you catch a rotting model ' +
      'before the business does.</p>' +
      '<pre><code>DATA QUALITY   are the inputs even valid? (nulls, ranges, schema, freshness, volume)\n' +
      'INPUT DRIFT    do incoming feature distributions differ from training/reference?\n' +
      'PREDICTION DRIFT   has the model\'s OUTPUT distribution shifted?\n' +
      'CONCEPT DRIFT  has the relationship between inputs and the correct answer changed?\n' +
      '               (only fully confirmable once labels arrive)\n' +
      'EMBEDDING DRIFT   for text/LLM: are the embeddings of live inputs moving away from the reference cloud?</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A thermostat calibrated for winter.</b> Nothing is "broken" when spring comes — the device works perfectly, ' +
      'it is just tuned for a world that no longer exists, so the house is too cold. Drift is your model still answering yesterday\'s question.</p></div>',
      try: [
        ['📖 Google — data validation & skew/drift detection (TFDV)', 'https://www.tensorflow.org/tfx/guide/tfdv', 'o'],
        ['📕 Part 4: production monitoring & drift', '../learn4/#ch15', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>DATA-QUALITY CHECKS (on the served feature vector, logged per prediction — Part 6 Ch 5)\n' +
      '  null / missing rate, out-of-range, unexpected categories, schema change, row/volume\n' +
      '  anomaly, feature freshness (staleness of each feature vs its SLA).\n' +
      'DRIFT METRICS (live window vs a fixed reference: training set or a known-good period)\n' +
      '  PSI (Population Stability Index)   < 0.1 stable, 0.1-0.25 moderate, > 0.25 significant shift.\n' +
      '  KL / JS divergence, Wasserstein distance, KS test (numeric), chi-square (categorical).\n' +
      '  embedding drift: distance between live-batch centroid and reference; % out of an outlier boundary.\n' +
      'PREDICTION DRIFT   score distribution, class balance, average confidence, refusal rate over time.\n' +
      'PERFORMANCE (delayed)   once labels land (chargebacks, resolutions), recompute AUC/F1/MAE by cohort.\n' +
      'PROXY WHILE WAITING   input + prediction drift + calibration are early warnings before labels exist.\n' +
      'SEGMENTATION   compute drift per segment/tenant/region; a shift in one cohort is hidden in the aggregate.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard metrics are <b>PSI</b>, <b>KL/JS divergence</b>, <b>KS</b> and <b>chi-square</b> tests; ' +
      'tools: <b>Evidently</b>, <b>NannyML</b>, <b>whylogs / WhyLabs</b>, <b>Arize</b>, <b>Fiddler</b>, <b>deepchecks</b>, or <b>Great Expectations</b> for the data-quality half. ' +
      'They compute drift on a schedule, expose it as metrics, and alert. You pick a reference window and thresholds; the statistics are textbook.</p></div>',
      try: [
        ['📖 Evidently — data drift & model monitoring', 'https://docs.evidentlyai.com/', 'o'],
        ['📖 NannyML — post-deployment performance estimation', 'https://nannyml.readthedocs.io/en/stable/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Drift alert without a drift.</b> ' +
      'A fraud model fires a PSI alert on <code>merchant_category</code>. Investigation: it is not the world changing — an upstream pipeline started sending a new ' +
      'code format (numeric vs string), so every value maps to "unknown". This is a <b>data-quality</b> failure masquerading as drift. Fix: a schema/category check on ' +
      'the served features (Part 6 Ch 5) that would have fired first and more precisely; and drift monitors should exclude / flag "unknown" surges as a data issue, not concept drift.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Prediction drift as an early warning.</b> ' +
      'A churn model\'s labels take 60 days. Waiting for AUC means waiting two months to learn it regressed. Instead: the <b>predicted-churn-rate</b> distribution shifts ' +
      '(mean probability jumps 0.12 → 0.19) and <b>calibration</b> degrades within a week — a proxy signal. It turns out a marketing campaign changed the user mix. ' +
      'The team retrains on recent data before the delayed AUC would ever have flagged it.</p></div>' +
      '<p><b>Alert on the actionable thing:</b> raw drift is noisy. Alert when drift is <i>large AND sustained AND correlated with a quality/proxy metric moving</i> — ' +
      'or on a hard data-quality breach (schema, freshness SLA). A PSI blip on one feature for one hour is not a page.</p>',
      try: [
        ['📖 Evidently — PSI, KL, and data drift methods', 'https://www.evidentlyai.com/ml-in-production/data-drift', 'o'],
        ['🏗️ Part 6: feature stores, served-feature logging & skew', '../learn6/#ch5', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Wait for labels to notice a problem    Monitor input + prediction drift + calibration as early\n' +
      '                                       proxies; labels confirm later.\n' +
      'Drift monitor with no data-quality      Half of "drift" alerts are broken pipelines. Check schema,\n' +
      '  layer                                nulls, ranges, freshness FIRST (Part 6 Ch 5, Ch 6).\n' +
      'Reference = "all of training"           Use a representative, recent good period; refresh it\n' +
      '                                       deliberately (with a changelog) as the world legitimately moves.\n' +
      'Aggregate drift only                    Compute per segment/tenant/region; a shifted cohort hides in\n' +
      '                                       the average.\n' +
      'Alert on any PSI > 0.1                  Alert on large + sustained + correlated-with-quality drift, or\n' +
      '                                       a hard data-quality breach. Tune to reduce noise.\n' +
      'Drift on served features not logged      Log the exact feature vector per prediction; you cannot\n' +
      '                                       measure drift on data you did not record.\n' +
      'No retrain trigger defined               Predefine: sustained drift + proxy degradation → retrain on\n' +
      '                                       recent data / investigate; do not just watch the graph.\n' +
      'Embedding drift ignored for LLM apps     Track distance of live-input embeddings from the reference\n' +
      '                                       cloud; new topics / attack patterns show up here first.</code></pre>' +
      '<p><b>Drift is a signal, not a diagnosis.</b> It tells you the inputs or outputs moved; you still have to decide whether it is a real world change (retrain), ' +
      'a pipeline bug (fix data), a seasonal pattern (expected), or an attack (Ch 9).</p>',
      try: [
        ['📖 whylogs — data logging & drift profiling', 'https://whylogs.readthedocs.io/en/latest/', 'o'],
        ['📡 Ch 9 — when "drift" is an adversarial pattern', '#ch9', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Types of drift and how each is detected?\n' +
      '   A: Input/covariate drift — feature distributions vs a reference (PSI, KL, KS, chi-square).\n' +
      '   Prediction drift — the model\'s output distribution/confidence over time. Concept drift — the\n' +
      '   input→label relationship changed, only fully confirmable once labels arrive. Embedding drift — live\n' +
      '   text embeddings moving away from the reference cloud.\n\n' +
      'Q: Labels take 60 days. How do you know the model regressed before then?\n' +
      '   A: Proxy signals: input drift, prediction-distribution shift, and calibration degradation are early\n' +
      '   warnings. Delayed performance metrics confirm later.\n\n' +
      'Q: A drift alert fires but the world has not changed. Likely cause?\n' +
      '   A: A data-quality failure — an upstream schema/format change making values map to "unknown",\n' +
      '   nulls spiking, a stale feature. Check schema/nulls/ranges/freshness on the served features first;\n' +
      '   they are more precise than a drift score.\n\n' +
      'Q: Why is "alert on any PSI > 0.1" a bad rule?\n' +
      '   A: Too noisy — minor, transient shifts fire constantly and get ignored. Alert on drift that is\n' +
      '   large, sustained, and correlated with a quality/proxy metric moving, or on a hard data-quality breach.\n\n' +
      'Q: How do you choose the reference distribution?\n' +
      '   A: A representative recent good period (or the training set), refreshed deliberately with a changelog\n' +
      "   as the world legitimately evolves — not frozen forever, not sliding automatically.\n\n" +
      'Q: Drift confirmed and real. What are the possible responses?\n' +
      '   A: Retrain on recent data (real world change), fix the pipeline (data bug), accept it (known\n' +
      '   seasonality), or treat it as an attack signal (Ch 9). Drift is a trigger to investigate, not an\n' +
      '   automatic retrain.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="../learn6/#ch5">Part 6 Ch 5</a> (served-feature logging), <a href="#ch7">Ch 7</a> (quality signals), <a href="#ch9">Ch 9</a> (adversarial drift), ' +
      '<a href="#ch4">Ch 4</a> (drift burning a quality SLI), <a href="../learn7/#ch3">Part 7 Ch 3</a> (data checks in CI).</p>',
      try: [
        ['📖 Arize — ML observability: drift & performance', 'https://docs.arize.com/arize/machine-learning/machine-learning', 'o'],
        ['📖 deepchecks — data & model validation', 'https://docs.deepchecks.com/stable/', 'o']
      ] }
  ],

  quiz: [
    { q: 'Labels for your model arrive 60 days late. How do you detect a regression before then?',
      opts: [
        'You cannot — wait for the labels',
        'Monitor proxy signals: input/feature drift, prediction-distribution shift, and calibration degradation, which move well before delayed performance metrics',
        'Retrain daily regardless',
        'Increase the model size'],
      ok: 1,
      why: 'Input drift, output-distribution shift and calibration decay are leading indicators. The delayed performance metric only confirms what the proxies already suggested.' },
    { q: 'A drift alert fires on a categorical feature, but nothing about the real world changed. Most likely cause?',
      opts: [
        'The model spontaneously degraded',
        'A data-quality failure — an upstream schema/format change (e.g. codes now arriving in a different type) making values map to "unknown"',
        'The reference window is too large',
        'Users are behaving adversarially'],
      ok: 1,
      why: 'Broken pipelines produce distribution shifts that look like drift. Schema/null/range/freshness checks on the served features catch these faster and more precisely.' },
    { q: 'Why is "alert whenever PSI > 0.1 on any feature" a poor alerting rule?',
      opts: [
        'PSI is never meaningful',
        'It is too noisy — minor, transient shifts fire constantly and get ignored; alert on drift that is large, sustained, and correlated with a quality/proxy metric moving (or a hard data-quality breach)',
        '0.1 is too high a threshold',
        'PSI cannot be computed in production'],
      ok: 1,
      why: 'Raw drift fluctuates. Actionable alerting combines magnitude, persistence, and correlation with an outcome signal, so pages correspond to real problems.' }
  ]
};
