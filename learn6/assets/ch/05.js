/* AI-ML Learn — Part 6 · Chapter 5: Feature Stores & Training/Serving Skew */
window.CH[5] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Your model trains on a feature called <code>avg_order_value_30d</code>. A data scientist computed it in a notebook with a pandas one-liner. ' +
      'In production, an engineer re-implements "average order value over 30 days" in Java, in the request path. The two definitions differ slightly — ' +
      'different timezone, includes refunds or not, rounds differently. The model now sees inputs it was never trained on. This is <b>training/serving skew</b>, ' +
      'and it silently wrecks accuracy.</p>' +
      '<p>A <b>feature store</b> fixes it by making a feature <i>defined once</i> and readable both ways:</p>' +
      '<pre><code>define avg_order_value_30d ONCE\n' +
      '  → OFFLINE store: full history, for training (point-in-time correct)\n' +
      '  → ONLINE store: latest value per entity, low-latency, for serving</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>One recipe, two kitchens.</b> The cooking school (training) and the restaurant (serving) ' +
      'must use the <i>same</i> recipe card. If the school teaches one method and the restaurant improvises another, the dish that graduates is not the dish that ships.</p></div>',
      try: [
        ['📖 Feast — what is a feature store?', 'https://docs.feast.dev/', 'o'],
        ['📓 Part 5: point-in-time correctness in SQL', '../learn5/#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>OFFLINE store   columnar / warehouse (BigQuery, Snowflake, Parquet on S3). Big, slow, full history.\n' +
      '                Used to build training sets and backfills.\n' +
      'ONLINE store    low-latency KV (Redis, DynamoDB, Cassandra). Latest feature value per entity key.\n' +
      '                Read in the request path, single-digit ms.\n' +
      'FEATURE DEF     one transformation authored once (SQL / Python), materialised to BOTH stores.\n' +
      'ENTITY          the key you look up by (user_id, item_id, (user_id,item_id)).\n' +
      'POINT-IN-TIME   for training row at time T, join the feature value as it was AT T — never later.\n' +
      '  JOIN          Using "today\'s" value leaks the future and inflates offline metrics.\n' +
      'MATERIALISATION scheduled/streaming job that keeps the online store fresh from the source.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The reference open tool is <b>Feast</b> (feature definitions in code, an offline store + an online store, ' +
      '<code>get_historical_features</code> for training and <code>get_online_features</code> for serving). Managed/streaming-first options: <b>Tecton</b>, ' +
      '<b>Databricks Feature Store</b>, <b>Vertex AI Feature Store</b>, <b>Hopsworks</b>, <b>SageMaker Feature Store</b>. The pattern is standard across all of them: ' +
      'define once, materialise to two stores, join point-in-time for training. You are not building the join engine.</p></div>' +
      '<p>Not every project needs one. A single model with batch features and no real-time signals can live with a shared feature library + a table. ' +
      'A feature store pays off when features are <b>reused across models</b>, <b>need real-time freshness</b>, or the team keeps hitting skew bugs.</p>',
      try: [
        ['📖 Feast — point-in-time joins & data model', 'https://docs.feast.dev/getting-started/concepts/point-in-time-joins', 'o'],
        ['📖 "What is a Feature Store?" — Tecton / feature-store.org', 'https://www.featurestore.org/what-is-a-feature-store', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The leaked label.</b> ' +
      'A churn model shows AUC 0.95 offline, 0.70 in production. Investigation: the training join used <code>support_tickets_count</code> as of ' +
      '<i>scoring day</i>, but many of those tickets were filed <i>because</i> the user was already churning — after the label window. ' +
      'Fix: a <b>point-in-time join</b> that takes each feature as it stood at the row\'s event timestamp. Offline AUC drops to 0.71 — now it matches reality, ' +
      'and the model can actually be trusted.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Stale online features.</b> ' +
      'A recommendation model uses <code>items_viewed_last_1h</code>. The materialisation job runs hourly, so at serving time the value can be ~59 minutes old — ' +
      'useless for a "last hour" signal. Fix: move that feature to <b>streaming materialisation</b> (update the online store from the clickstream within seconds), ' +
      'keep the slow-changing features (e.g. <code>account_age_days</code>) on the cheap hourly job. Match the refresh cadence to how fast the feature actually moves.</p></div>' +
      '<p><b>Detecting skew:</b> log the exact feature vector served with each prediction, then compare its distribution to the training distribution ' +
      '(per-feature mean, null rate, quantiles). A drift alert on the <i>served</i> features catches a broken pipeline before accuracy tanks — see Part 8 Ch 8.</p>',
      try: [
        ['📖 Google — data validation & training-serving skew (TFX)', 'https://www.tensorflow.org/tfx/data_validation/get_started', 'o'],
        ['📡 Part 8: drift & data quality', '../learn8/#ch8', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Feature computed twice (notebook +     Define once as a shared transformation; materialise to offline +\n' +
      '  request path)                        online. Skew disappears by construction.\n' +
      'Training join uses "current" feature    Point-in-time join: feature value AS OF the row\'s timestamp.\n' +
      '  values                               Using later values leaks the future → inflated offline metrics.\n' +
      'One refresh cadence for all features    Cadence per feature: streaming for "last 5 min", hourly/daily\n' +
      '                                       for slow ones. Freshness SLA per feature.\n' +
      'Online store is the source of truth     It is a cache/projection. The source is the event log / warehouse;\n' +
      '                                       the online store must be rebuildable from it.\n' +
      'No served-feature logging               Log the exact vector used for each prediction — required for\n' +
      '                                       debugging, skew detection, and building next round\'s training set.\n' +
      'Feature store for a single batch model  Overkill. A shared feature module + a table is enough until you\n' +
      '                                       have reuse across models or real-time needs.\n' +
      'Unbounded feature TTL                   Expire/refresh online values; a feature frozen since last outage\n' +
      '                                       is worse than a missing one (at least missing is detectable).</code></pre>' +
      '<p><b>The core invariant:</b> the transformation that produced a training feature and the one that produces it at serving time must be ' +
      '<i>the same code path</i>, or provably equivalent. Everything the feature store does is in service of that.</p>',
      try: [
        ['📖 Feast — data sources, streaming & materialization', 'https://docs.feast.dev/getting-started/architecture-and-components/overview', 'o'],
        ['🏗️ Ch 6 — data & feature pipelines', '#ch6', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What is training/serving skew and how does a feature store prevent it?\n' +
      'A: The feature values a model trains on differ from those it sees in production, because the two were\n' +
      '   computed by different code (notebook vs request-path reimplementation) or with different freshness.\n' +
      '   A feature store defines each feature once and materialises it to an offline store (training) and an\n' +
      '   online store (serving), so both paths use the same definition.\n\n' +
      'Q: What is a point-in-time (as-of) join and why does it matter?\n' +
      'A: For a training example with timestamp T, you join each feature\'s value as it was at T, not its current\n' +
      "   value. Skipping this leaks post-T information into the features and produces offline metrics that\n" +
      '   collapse in production.\n\n' +
      'Q: Offline AUC 0.95, production 0.70. Feature-store angle?\n' +
      '   A: Suspect a leaked feature — a training join using values that only existed after the label was\n' +
      '   determined (e.g. support tickets filed because the user was churning). Redo with a strict\n' +
      '   point-in-time join; expect offline metrics to fall to a realistic level.\n\n' +
      'Q: A "views in the last hour" feature is nearly an hour stale at serving time. Fix?\n' +
      "A: Its materialisation cadence doesn't match how fast it changes. Move it to streaming materialisation\n" +
      '   (update the online store from the event stream within seconds); leave slow features on cheap batch jobs.\n\n' +
      'Q: Is the online store the source of truth?\n' +
      'A: No — it is a low-latency projection. The source is the event log / warehouse, and the online store\n' +
      '   must be fully rebuildable from it (for recovery, backfills, and definition changes).\n\n' +
      'Q: When do you NOT need a feature store?\n' +
      'A: A single model with batch-only features and no cross-model reuse — a shared feature module plus a\n' +
      '   table is simpler. Introduce a store when features are reused, need real-time freshness, or skew\n' +
      '   bugs keep recurring.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch6">Ch 6</a> (the pipelines that materialise features), <a href="#ch3">Ch 3</a> (streaming features for an online decision), ' +
      'and <a href="../learn8/#ch8">Part 8 Ch 8</a> (drift monitoring on served features).</p>',
      try: [
        ['📖 Uber — scaling Michelangelo\'s feature store (Palette)', 'https://www.uber.com/blog/michelangelo-machine-learning-platform/', 'o'],
        ['📖 feature-store.org — comparison of feature stores', 'https://www.featurestore.org/', 'o']
      ] }
  ],

  quiz: [
    { q: 'Training/serving skew most directly comes from what?',
      opts: [
        'Using a GPU for training but a CPU for serving',
        'The feature values seen in production differ from those used in training — usually because the transformation was reimplemented or has different freshness',
        'The model being too large',
        'Too many training epochs'],
      ok: 1,
      why: 'Skew is a data problem: the same feature computed two different ways (or at two different freshness levels) means the model is scored on inputs it never learned from.' },
    { q: 'What does a point-in-time (as-of) join do when building a training set?',
      opts: [
        'Joins every feature at its current value',
        'Joins each feature at the value it held at the training row\'s event timestamp, so no post-event information leaks in',
        'Removes all timestamps',
        'Uses only the newest 1000 rows'],
      ok: 1,
      why: 'Using current values leaks the future into the features and inflates offline metrics; the as-of join reconstructs what the model would actually have seen at that moment.' },
    { q: 'A "views in the last hour" online feature is served nearly an hour stale. Best fix?',
      opts: [
        'Increase the model size',
        'Match materialisation cadence to the feature: stream updates into the online store within seconds for fast-changing features, keep slow features on batch',
        'Delete the feature',
        'Serve the training-time value'],
      ok: 1,
      why: 'A rolling-window feature needs near-real-time materialisation; an hourly job makes it meaningless. Cadence should be chosen per feature.' }
  ]
};
