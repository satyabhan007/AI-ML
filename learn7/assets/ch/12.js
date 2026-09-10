/* AI-ML Learn — Part 7 · Chapter 12: Migrations & Cutovers */
window.CH[12] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Sometimes the change is not "deploy a new version" but "replace a whole thing": swap the embedding model (and re-index everything), move from one vector DB ' +
      'to another, change the serving stack, migrate a feature store. A <b>big-bang cutover</b> — turn off the old, turn on the new, hope — is how migrations become outages.</p>' +
      '<pre><code>SAFE MIGRATION = run old and new SIDE BY SIDE, shift gradually, keep a way back at every step:\n' +
      '  1 stand up the new system (empty / backfilling)\n' +
      '  2 dual-write to both; backfill history into the new one\n' +
      '  3 shadow-read from new, compare to old (do not serve new yet)\n' +
      '  4 shift read traffic old → new gradually, watching metrics\n' +
      '  5 new is source of truth; old kept as fallback for a bake period\n' +
      '  6 decommission old</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Moving house without a night on the street.</b> You get the new place ready, move things over in loads, ' +
      'sleep in the new bed for a few nights while still holding the old lease, and only hand back the old keys once everything works. You never stand outside with all your furniture in the rain.</p></div>',
      try: [
        ['📖 Martin Fowler — parallel change / expand-contract', 'https://martinfowler.com/bliki/ParallelChange.html', 'o'],
        ['🚀 Ch 9 — rollback & forward-only changes', '#ch9', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>EXPAND / CONTRACT (schema, API, feature)\n' +
      '  expand    add the new field/column/route; old code ignores it.\n' +
      '  migrate   dual-write; backfill; dual-read (prefer new, fall back to old).\n' +
      '  contract  once new is proven, remove the old field/route/code.\n' +
      '  → every step is independently deployable and reversible.\n' +
      'SHADOW / DARK READ   query the new system in parallel with the old, compare results, log\n' +
      '                     diffs — WITHOUT serving the new answer. Quantifies correctness before cutover.\n' +
      'BACKFILL             recompute / re-embed / re-import history into the new system; idempotent,\n' +
      '                     resumable, rate-limited so it does not starve live traffic (Part 6 Ch 6).\n' +
      'TRAFFIC SHIFT        a % dial (feature flag / router) old → new; roll back the dial on trouble.\n' +
      'DATA MIGRATIONS      forward-only: never an in-place destructive ALTER on the hot path.\n' +
      '                     Additive change + backfill + later cleanup.\n' +
      'CONSISTENCY          define how divergence between old and new is reconciled during dual-write.\n' +
      'FREEZE / CUTOVER WINDOW   for the rare step that truly needs one, keep it minutes and rehearsed.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The patterns are standard: <b>expand/contract (parallel change)</b>, <b>dual-write + shadow-read + ' +
      'gradual cutover</b>, and the <b>Strangler Fig</b> pattern for replacing a system incrementally. Tooling: <b>feature flags</b> for the traffic dial, ' +
      'idempotent <b>backfill jobs</b> in an orchestrator (Airflow/Dagster), and diff/consistency checkers. You apply these; they are documented release-engineering practice.</p></div>',
      try: [
        ['📖 Martin Fowler — Strangler Fig application', 'https://martinfowler.com/bliki/StranglerFigApplication.html', 'o'],
        ['📖 GitHub — how we migrated (dual-run) examples', 'https://github.blog/engineering/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Swapping the embedding model.</b> ' +
      'A better embedding model is available, but vectors from the old and new models are not comparable, so the entire index must be rebuilt. Plan: ' +
      '(1) build a <b>parallel index</b> with the new model; (2) <b>backfill</b> all documents (idempotent, rate-limited) and keep it updated via dual-write from the ' +
      'ingestion pipeline; (3) <b>shadow-read</b> — run both retrievers on live queries, log recall/rank diffs, gate on an eval set; (4) shift query traffic 5%→100% ' +
      'behind a flag, watching answer quality; (5) keep the old index for a week; (6) delete it. No downtime, reversible at every step.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The destructive migration that had no way back.</b> ' +
      'A team ran an in-place <code>ALTER</code> that dropped a column and rewrote a table during a "quick maintenance window". A bug in the new code path surfaced ' +
      '20 minutes later — but the old column was gone and the window\'s writes were already in the new format. Recovery meant a restore from backup and lost data. ' +
      'Fix: <b>expand/contract</b> — add the new column, dual-write, backfill, verify, cut reads over, and only drop the old column days later once the new path is proven.</p></div>' +
      '<p><b>Rehearse the cutover in staging</b> with production-shaped data, including the rollback of the traffic dial and (if any) the freeze window. A migration runbook ' +
      'you have never executed is a wish.</p>',
      try: [
        ['📖 Stripe — online migrations at scale (4-phase)', 'https://stripe.com/blog/online-migrations', 'o'],
        ['🏗️ Part 6: idempotent, resumable backfills', '../learn6/#ch6', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Big-bang cutover                       Dual-run: stand up new, dual-write, shadow-read, shift traffic\n' +
      '                                       gradually, keep old as fallback, then decommission.\n' +
      'Destructive in-place ALTER on hot path   Expand/contract: additive change + backfill + later cleanup.\n' +
      '                                       Every step reversible.\n' +
      'Backfill not idempotent / not resumable   Overwrite by key / MERGE; checkpoint progress; rate-limit so\n' +
      '                                       it does not starve live traffic.\n' +
      'Cut over without shadow comparison       Dark-read the new system first and quantify the diff rate\n' +
      '                                       against the old before serving it.\n' +
      'No consistency plan during dual-write     Define which store wins and how divergence is reconciled.\n' +
      'Old system deleted at cutover            Keep it as a fallback through a bake period; deletion is the\n' +
      '                                       last, separate step.\n' +
      'Long freeze window                       Minimise it; most migrations need none. If required, keep it\n' +
      '                                       minutes and rehearsed.\n' +
      'Runbook never rehearsed                  Dry-run the whole cutover + rollback in staging with\n' +
      '                                       production-shaped data.</code></pre>' +
      '<p><b>The invariant:</b> at every moment during the migration there is a working system serving users and a defined way to fall back. If you cannot draw that ' +
      'for each step, the plan is not ready.</p>',
      try: [
        ['📖 Shopify — moving to a new datastore incrementally', 'https://shopify.engineering/', 'o'],
        ['🚀 Ch 15 — promotion & drift across environments', '#ch15', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Outline a safe migration to a new vector database.\n' +
      '   A: Stand up the new DB; dual-write from ingestion; backfill history (idempotent, rate-limited);\n' +
      '   shadow-read (run both, compare recall/rank, gate on an eval set) without serving new; shift query\n' +
      '   traffic gradually behind a flag while watching answer quality; keep the old DB as fallback for a bake\n' +
      '   period; then decommission.\n\n' +
      'Q: What is expand/contract and why use it for schema changes?\n' +
      '   A: Expand: add the new structure, old code ignores it. Migrate: dual-write, backfill, dual-read.\n' +
      '   Contract: remove the old once new is proven. Every step is independently deployable and reversible —\n' +
      '   unlike a destructive in-place ALTER.\n\n' +
      'Q: Why re-index everything when swapping the embedding model?\n' +
      '   A: Vectors from different models are not comparable, so old and new embeddings cannot coexist in one\n' +
      '   similarity space. You build a parallel index and cut over.\n\n' +
      'Q: What does shadow (dark) read give you before a cutover?\n' +
      '   A: A measured diff rate — you run the new system in parallel on live traffic, compare its results to\n' +
      "   the old, and only cut over when the divergence is understood and acceptable.\n\n" +
      'Q: A quick maintenance-window ALTER dropped a column and the new code had a bug. Why was recovery so\n' +
      '   bad, and what should have happened?\n' +
      '   A: The change was destructive and irreversible, and window writes were already in the new format —\n' +
      '   recovery needed a restore and lost data. Expand/contract would have kept the old column and a working\n' +
      '   fallback throughout.\n\n' +
      'Q: What must be true at every moment of a migration?\n' +
      '   A: There is a working system serving users and a defined, tested way to fall back. If you cannot\n' +
      '   state that per step, the plan is not ready.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch9">Ch 9</a> (reversibility &amp; forward-only), <a href="#ch4">Ch 4</a> (GitOps promotion), <a href="#ch15">Ch 15</a> (multi-env), ' +
      '<a href="../learn6/#ch6">Part 6 Ch 6</a> (backfills), <a href="../learn6/#ch7">Part 6 Ch 7</a> (re-indexing).</p>',
      try: [
        ['📖 PlanetScale — safe online schema migrations', 'https://planetscale.com/docs/concepts/nonblocking-schema-changes', 'o'],
        ['📖 Martin Fowler — evolutionary database design', 'https://martinfowler.com/articles/evodb.html', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the safe general shape of a system migration (e.g. new vector DB or embedding model)?',
      opts: [
        'Turn off the old system, turn on the new one, and monitor',
        'Run old and new side by side: dual-write, backfill history, shadow-read and compare, shift traffic gradually behind a flag, keep old as fallback, then decommission',
        'Delete the old data first to save space',
        'Do it all in a long overnight freeze window'],
      ok: 1,
      why: 'Parallel running with a gradual, reversible traffic shift means there is always a working system and a way back — the opposite of a big-bang cutover.' },
    { q: 'Why use expand/contract (parallel change) instead of a destructive in-place ALTER for a schema change on a hot path?',
      opts: [
        'It is faster to type',
        'Each step (add new, dual-write, backfill, dual-read, later remove old) is independently deployable and reversible, so a bug never leaves you with lost data and no way back',
        'ALTER statements are not supported',
        'It avoids writing any migration code'],
      ok: 1,
      why: 'A destructive ALTER is irreversible and any window writes are already converted; expand/contract keeps the old structure and a working fallback until the new path is proven.' },
    { q: 'What does shadow (dark) reading provide before cutting traffic over to a new system?',
      opts: [
        'Nothing useful',
        'A measured divergence rate — the new system runs in parallel on live traffic and its results are compared to the old, so you cut over only when the diff is understood and acceptable',
        'Automatic data backup',
        'A performance boost for the old system'],
      ok: 1,
      why: 'Serving an unverified new system is a gamble. Dark reads quantify correctness against the incumbent on real traffic before any user sees the new answers.' }
  ]
};
