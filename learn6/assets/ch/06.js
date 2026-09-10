/* AI-ML Learn — Part 6 · Chapter 6: Data & Feature Pipelines */
window.CH[6] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>A model is only as good as the data flowing into it — and that data does not arrive by magic. A <b>pipeline</b> is the plumbing that moves raw ' +
      'events from where they land (logs, a database, a queue) to where the model can use them (a training table, an online feature store), ' +
      'transforming and checking them on the way.</p>' +
      '<pre><code>source            transform             sink\n' +
      'clicks, orders,   clean, join,          training warehouse (offline)\n' +
      'app events    →   aggregate, encode  →  feature store online + offline\n' +
      '(Kafka, DB, S3)   validate              a scored-results table</code></pre>' +
      '<p>Two shapes: <b>batch</b> (run every hour/day over a chunk of data) and <b>streaming</b> (process each event as it arrives). ' +
      'Most platforms run both — batch for volume and history, streaming for freshness.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A water treatment plant.</b> River water (raw events) is pumped through filters and ' +
      'chemical checks (transform + validate) before it reaches taps (the model). If a filter clogs or a sensor lies, everyone downstream drinks bad water — ' +
      'so the plant tests continuously and can shut a stage without stopping the whole supply.</p></div>',
      try: [
        ['📖 Google — MLOps pipelines (levels 0-2)', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'o'],
        ['🏗️ Ch 5 — feature stores (the sink these pipelines fill)', '#ch5', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>ORCHESTRATION   a DAG of tasks with dependencies, retries, schedules, backfills, alerting.\n' +
      '                Standard: Airflow, Dagster, Prefect, Flyte, or Kubeflow Pipelines.\n' +
      'BATCH COMPUTE   SQL in the warehouse (dbt), or Spark for big/complex transforms.\n' +
      'STREAM COMPUTE  Flink, Spark Structured Streaming, Kafka Streams — windowed aggregates,\n' +
      '                joins, dedup, exactly-once sinks.\n' +
      'DATA CONTRACT   an agreed schema + semantics for each source; breaking it should fail CI.\n' +
      'VALIDATION      row counts, null rates, ranges, referential checks, freshness — every run.\n' +
      '                Standard: Great Expectations, dbt tests, Soda, Pandera, TFDV.\n' +
      'IDEMPOTENCY     re-running a partition produces the same result (overwrite partition, MERGE).\n' +
      'BACKFILL        recompute historical partitions after a bug fix or a new feature, safely.\n' +
      'LINEAGE         which raw tables → which features → which model. (OpenLineage / catalog.)</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The canonical stack is an <b>orchestrator</b> (Airflow/Dagster) running ' +
      '<b>dbt or Spark</b> for batch and <b>Flink/Spark Structured Streaming</b> for streaming, with <b>Great Expectations / dbt tests</b> as validation gates ' +
      'and <b>OpenLineage</b> for lineage. Idempotent, partitioned writes and schema-checked sources are the baseline patterns. ' +
      'You compose these; you do not write a scheduler or a streaming engine.</p></div>',
      try: [
        ['📖 dbt — tests & data quality', 'https://docs.getdbt.com/docs/build/data-tests', 'o'],
        ['📖 Apache Airflow — core concepts (DAGs, backfill)', 'https://airflow.apache.org/docs/apache-airflow/stable/core-concepts/index.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The silent schema break.</b> ' +
      'An upstream team renames <code>user_country</code> → <code>country_code</code> and drops the old column. The nightly feature job does not error — ' +
      'it just fills <code>user_country</code> with nulls. The model\'s geo features go dead; accuracy sags for a week before anyone notices. ' +
      'Fix: a <b>data contract</b> test on the source (required columns + types) that fails the pipeline loudly on run 1, plus a validation check ' +
      '"null rate for user_country &lt; 1%" that pages. Cheap to add, expensive to skip.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The backfill that double-counted.</b> ' +
      'A bug in <code>orders_30d</code> is fixed; someone re-runs the last 90 days. The job <i>appends</i> instead of <i>overwriting</i> partitions, ' +
      'so every backfilled day now has 2× the orders. Downstream training silently learns from corrupted features. ' +
      'Fix: make writes <b>idempotent</b> — write full partitions with overwrite, or <code>MERGE</code> on a key — so a re-run is safe by design, ' +
      'and add a post-run check that daily order totals match the source.</p></div>' +
      '<p><b>Freshness SLAs:</b> declare, per dataset, "must be no more than N minutes/hours behind the source", emit a <code>data_freshness_seconds</code> metric, ' +
      'and alert on it. A stale pipeline is an outage even when nothing has errored.</p>',
      try: [
        ['📖 Great Expectations — core concepts', 'https://docs.greatexpectations.io/docs/core/introduction/', 'o'],
        ['📡 Part 8: freshness & data-quality monitoring', '../learn8/#ch8', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Append-only writes                     Idempotent partitioned overwrite / MERGE. Re-runs and backfills\n' +
      '                                       must be safe to repeat.\n' +
      'Trust upstream schemas                 Data contract + schema check that FAILS the run on a breaking\n' +
      '                                       change, rather than filling nulls.\n' +
      'Validate only at the end               Check at each stage (source, post-transform, pre-sink). Fail fast,\n' +
      '                                       localise the break.\n' +
      'One giant DAG task                     Small tasks with clear inputs/outputs → partial retries, parallelism,\n' +
      '                                       and a readable lineage graph.\n' +
      'No freshness metric                    Emit + alert on lag per dataset. "No error" is not "up to date".\n' +
      'Streaming for everything               Streaming is operationally heavy (state, checkpoints, watermarks).\n' +
      '                                       Use it only for features that must be seconds-fresh.\n' +
      'Backfill by hand, ad hoc               Parameterise the pipeline by date range; backfills use the same\n' +
      '                                       code path as scheduled runs.\n' +
      'No lineage                             Track raw → feature → model. When a source is wrong you need to\n' +
      '                                       know every model to retrain and every prediction to distrust.</code></pre>' +
      '<p><b>Late & out-of-order data</b> is the streaming tax: events arrive after their window closed. Handle it with <b>watermarks</b> + a bounded ' +
      'allowed-lateness, and accept that very late events are dropped or sent to a correction path — do not pretend event time equals arrival time.</p>',
      try: [
        ['📖 Flink — event time & watermarks', 'https://nightlies.apache.org/flink/flink-docs-stable/docs/concepts/time/', 'o'],
        ['📖 OpenLineage — data lineage standard', 'https://openlineage.io/docs/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Why must pipeline writes be idempotent?\n' +
      'A: Retries, catch-up runs, and backfills will re-execute the same logic over the same partition. If a\n' +
      '   re-run appends instead of replacing, you double-count. Overwrite whole partitions or MERGE on a key so\n' +
      '   repeating a run is a no-op.\n\n' +
      'Q: An upstream column was renamed and your job now emits nulls instead of failing. What do you add?\n' +
      'A: A data contract / schema check on the source that fails the run on a breaking change, plus a\n' +
      '   validation assertion (null-rate / range) on the derived feature that alerts. Fail loudly on run 1,\n' +
      "   don't degrade silently for a week.\n\n" +
      'Q: How do you run a safe backfill after fixing a feature bug?\n' +
      "A: The pipeline is parameterised by date range and writes idempotently, so the backfill uses the exact\n" +
      '   same code path as scheduled runs. Recompute affected partitions with overwrite, then a post-run check\n' +
      '   reconciles totals against the source. Track which models used the bad data and retrain them.\n\n' +
      'Q: When do you choose streaming over batch for a feature pipeline?\n' +
      'A: Only when the feature must be seconds-to-minutes fresh (rolling-window counts, real-time flags).\n' +
      '   Streaming adds state, checkpointing, watermarks and late-data handling — cost you pay for freshness.\n' +
      '   Slow-moving features stay on cheap batch.\n\n' +
      'Q: What is a freshness SLA and why does it matter if nothing errored?\n' +
      '   A: A declared max lag behind the source per dataset, exported as a metric and alerted on. A pipeline\n' +
      '   that silently stopped 6 hours ago has thrown no error but is feeding the model stale inputs — an\n' +
      '   outage you only see if you measure lag.\n\n' +
      'Q: Why is lineage (raw → feature → model) worth maintaining?\n' +
      "A: When a source dataset is found to be wrong, lineage tells you exactly which features are tainted,\n" +
      '   which models to retrain, and which predictions to distrust or recompute.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch5">Ch 5</a> (feature stores these pipelines fill), <a href="#ch7">Ch 7</a> (the retrieval index they build), ' +
      '<a href="../learn7/#ch3">Part 7 Ch 3</a> (data tests in CI), and <a href="../learn8/#ch8">Part 8 Ch 8</a> (drift &amp; freshness alerts).</p>',
      try: [
        ['📖 Dagster — data assets, partitions & backfills', 'https://docs.dagster.io/concepts/partitions-schedules-sensors/partitions', 'o'],
        ['📖 Google — data validation for ML (TFDV)', 'https://www.tensorflow.org/tfx/guide/tfdv', 'o']
      ] }
  ],

  quiz: [
    { q: 'Why must feature-pipeline writes be idempotent (partition overwrite / MERGE rather than append)?',
      opts: [
        'It makes the pipeline run faster',
        'Retries, catch-up runs and backfills re-execute the same logic over the same data; without idempotency a re-run double-counts and corrupts downstream features',
        'Append is not supported by data warehouses',
        'It reduces storage cost'],
      ok: 1,
      why: 'Pipelines will re-run partitions (failures, backfills). Idempotent writes make repeating a run harmless; append-style writes silently duplicate rows.' },
    { q: 'An upstream schema change makes your job emit nulls instead of erroring, and accuracy quietly drops for a week. Best prevention?',
      opts: [
        'Retrain the model weekly no matter what',
        'A data contract / schema check on the source that fails the run on a breaking change, plus a null-rate/range assertion on the derived feature that alerts',
        'Increase the pipeline schedule frequency',
        'Add more features'],
      ok: 1,
      why: 'You want the pipeline to fail loudly on run one, not degrade invisibly. Source schema checks plus downstream validation assertions catch it immediately.' },
    { q: 'When is streaming (vs batch) the right choice for a feature pipeline?',
      opts: [
        'Always — streaming is strictly better',
        'Only when the feature must be seconds-to-minutes fresh; streaming adds state, checkpoints, watermarks and late-data handling that slow-moving features do not need',
        'Only for image data',
        'Never — batch can do everything'],
      ok: 1,
      why: 'Streaming buys freshness at real operational cost. Reserve it for rolling-window and real-time features; keep slow features on cheaper batch jobs.' }
  ]
};
