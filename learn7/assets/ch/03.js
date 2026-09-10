/* AI-ML Learn — Part 7 · Chapter 3: CI for ML */
window.CH[3] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Regular CI runs on every pull request: lint, unit tests, build. It answers "is this code broken?". <b>CI for ML</b> has to answer more, ' +
      'because an ML change can be green on all the code tests and still ship a worse model or a broken data assumption.</p>' +
      '<pre><code>a good ML PR pipeline checks, before merge:\n' +
      '  code       lint, type-check, unit tests (incl. the data-transform functions)\n' +
      '  data       schema of inputs, null rates, ranges, leakage checks on the training set\n' +
      '  contract   the model API request/response schema still matches\n' +
      '  eval       offline metrics on a fixed eval set are above a threshold (no silent regression)\n' +
      '  perf       a smoke test: model loads, answers, p50 latency under a ceiling\n' +
      '  artifacts   image builds, model packages, everything is reproducible</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Airport security for changes.</b> Code CI is the metal detector. ML CI adds the ' +
      'liquids check (data), the boarding-pass match (contract), the "does the plane actually fly" test (eval + perf smoke). All of them, every time, before the change boards.</p></div>',
      try: [
        ['📖 Google — CI/CD & test automation for ML (MLOps)', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'o'],
        ['📙 Part 3: MLOps & pipeline testing', '../learn3/#ch16', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>WHAT TO TEST (fast → slow)\n' +
      '  unit         pure functions: feature transforms, parsing, prompt templating, post-processing.\n' +
      '  data         schema + statistics of the training/eval data (Great Expectations, TFDV, pandera).\n' +
      '  contract     API schema (OpenAPI/proto) + consumer-driven contract tests (Pact).\n' +
      '  behavioural   invariants / "golden" cases: known inputs → expected outputs; capability tests\n' +
      '               (CheckList-style: negation, typos, robustness) rather than only aggregate metrics.\n' +
      '  eval gate    metrics on a frozen eval set vs a threshold or vs the current prod model.\n' +
      '  perf smoke   load the model, N requests, assert p50/p99 + memory under a ceiling.\n' +
      '  integration   a tiny end-to-end run against a stub / small fixture.\n' +
      'PIPELINE CI    the training/serving PIPELINE code is also software — test its components + a\n' +
      '               short end-to-end pipeline run on sample data.\n' +
      'DETERMINISM    seed everything; pin deps (Ch 1); tests must not be flaky on randomness.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard runners are <b>GitHub Actions / GitLab CI / Jenkins</b>; the ML-specific test tools are ' +
      '<b>Great Expectations / TFDV / pandas-based checks</b> for data, <b>Pact</b> for contracts, <b>pytest</b> + behavioural/CheckList-style tests for the model, ' +
      'and a small <b>eval harness</b> (or a hosted eval platform) for the metric gate. <b>DVC / CML</b> wire data + model steps into CI. ' +
      'You compose these into a pipeline; the practices are from standard software CI plus the ML testing literature.</p></div>',
      try: [
        ['📖 "The ML Test Score" (Breck et al., Google) — a rubric', 'https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/', 'o'],
        ['📖 CheckList — behavioural testing of NLP models', 'https://arxiv.org/abs/2005.04118', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Green tests, worse model.</b> ' +
      'A PR tweaks a feature transform. All unit tests pass; it merges; two days later engagement is down. The transform now drops rows with a rare category. ' +
      'Fixes: a <b>data validation step</b> in CI (row count / category coverage of the eval set must not drop &gt; X%) and an <b>eval gate</b> that trains-or-scores ' +
      'on a frozen eval set and fails the PR if the primary metric regresses beyond a tolerance vs the current prod model. The bad PR now fails at review time.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The flaky eval gate everyone ignores.</b> ' +
      'An eval gate uses a fresh random sample and a tight threshold, so it fails ~20% of the time for no real reason. Developers add <code>[skip eval]</code> to every PR. ' +
      'Fixes: <b>freeze the eval set</b> (a fixed, versioned slice), <b>seed</b> all randomness, set the threshold from the observed run-to-run variance (e.g. mean − 3σ), ' +
      'and compare against a stored baseline. A gate that is trusted is a gate that is enforced.</p></div>' +
      '<p><b>Keep it fast.</b> Full retraining rarely belongs in PR CI (minutes-to-hours). PR CI runs unit + data + contract + a cheap eval (score a small model or a ' +
      'held-out set) + perf smoke; the heavy retrain + full eval runs on merge to main or nightly, gating the release rather than the merge.</p>',
      try: [
        ['📖 Great Expectations — validating data in a pipeline', 'https://docs.greatexpectations.io/docs/core/introduction/', 'o'],
        ['🚀 Ch 8 — eval-in-CI release gates', '#ch8', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Only code tests on an ML PR             Add data-schema/stat checks, API contract tests, behavioural\n' +
      '                                       tests, an eval gate, and a perf smoke.\n' +
      'Aggregate metric only                   Also test slices/capabilities (negation, rare categories,\n' +
      '                                       robustness, per-segment) — an average can hide a broken slice.\n' +
      'Eval gate on a fresh random sample      Frozen, versioned eval set + seeded randomness; threshold from\n' +
      '                                       measured variance. Flaky gates get bypassed.\n' +
      'Full retrain in PR CI                   PR CI = fast checks + cheap eval. Heavy retrain/full eval gates\n' +
      '                                       the release (on merge / nightly), not the PR.\n' +
      'Data checks read live prod data         Use a pinned fixture / snapshot so CI is deterministic and does\n' +
      '                                       not depend on prod state.\n' +
      'No baseline comparison                  Compare metrics to the CURRENT production model, not just an\n' +
      '                                       absolute number — "not worse than prod" is the real gate.\n' +
      'Contract tests missing                  A schema change that breaks a client should fail the build\n' +
      '                                       (consumer-driven contracts), not production.\n' +
      '"skip eval" as a habit                  Emergency-only, requires an approval, and is logged. If it is\n' +
      '                                       routine, the gate is broken — fix the gate.</code></pre>' +
      '<p><b>Treat the eval set like production code:</b> version it, review changes to it, keep a held-out slice the model authors never see, and refresh it ' +
      'deliberately (with a changelog) so a "metric improvement" is never just an easier test.</p>',
      try: [
        ['📖 Pact — consumer-driven contract testing', 'https://docs.pact.io/', 'o'],
        ['📗 Part 2: evals & LLM-as-judge', '../learn2/#ch9', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What does CI for an ML change need beyond normal code CI?\n' +
      '   A: Data checks (schema, statistics, leakage on the training/eval set), API contract tests,\n' +
      '   behavioural/slice tests, an offline eval gate against a threshold or the current prod model, a perf\n' +
      '   smoke test, and reproducible artifact builds.\n\n' +
      'Q: A PR passes all tests but ships a worse model. What was missing and how do you catch it next time?\n' +
      '   A: A data-validation step (the change silently dropped rows/categories) and an eval gate on a frozen\n' +
      "   eval set that fails when the primary metric regresses vs prod beyond tolerance.\n\n" +
      'Q: Developers keep bypassing the eval gate. Why, and how do you fix it?\n' +
      '   A: It is flaky — fresh random sample + tight threshold. Freeze and version the eval set, seed\n' +
      '   randomness, set the threshold from measured run-to-run variance, and compare to a stored baseline.\n' +
      '   A trusted gate is an enforced gate.\n\n' +
      'Q: Should full retraining run in PR CI?\n' +
      '   A: Usually not — too slow. PR CI runs fast checks + a cheap eval + perf smoke; the full retrain and\n' +
      '   full eval run on merge or nightly and gate the RELEASE, not the merge.\n\n' +
      'Q: Why compare metrics to the current production model, not just an absolute threshold?\n' +
      '   A: The real question is "is this not worse than what we run today". Absolute thresholds drift out of\n' +
      '   date and let regressions through if they clear the bar.\n\n' +
      'Q: Why test slices/capabilities and not just the aggregate metric?\n' +
      '   A: An aggregate can improve while a critical slice (a language, a rare category, negation handling)\n' +
      '   collapses. Behavioural and per-segment tests catch that.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch8">Ch 8</a> (the eval gate in depth), <a href="#ch4">Ch 4</a> (what happens after a green build), <a href="#ch11">Ch 11</a> (perf/load testing), ' +
      '<a href="#ch1">Ch 1</a> (reproducible artifacts), and <a href="../learn8/#ch7">Part 8 Ch 7</a> (eval-in-prod).</p>',
      try: [
        ['📖 GitHub Actions — CI workflows', 'https://docs.github.com/en/actions/automating-builds-and-tests', 'o'],
        ['📖 CML (Continuous Machine Learning)', 'https://cml.dev/doc', 'o']
      ] }
  ],

  quiz: [
    { q: 'Which check is specific to ML CI (beyond lint/unit/build)?',
      opts: [
        'Checking that the README exists',
        'A data-schema-and-statistics check plus an offline eval gate that fails the PR if the primary metric regresses versus the current production model',
        'Running the linter twice',
        'Counting lines of code'],
      ok: 1,
      why: 'An ML change can be code-green and still degrade the model or break a data assumption. Data validation and a metric gate against prod are what catch that.' },
    { q: 'An eval gate fails ~20% of runs for no real reason and developers routinely skip it. Best fix?',
      opts: [
        'Delete the eval gate',
        'Freeze and version the eval set, seed all randomness, set the threshold from measured run-to-run variance, and compare to a stored baseline',
        'Lower the threshold to 0',
        'Only run it on Fridays'],
      ok: 1,
      why: 'Flakiness comes from a fresh random sample plus a tight threshold. A deterministic, versioned eval set with a variance-informed threshold makes the gate trustworthy and therefore enforceable.' },
    { q: 'Where should a full model retrain typically run in the CI/CD flow?',
      opts: [
        'On every pull request, blocking the merge',
        'On merge to main or nightly, gating the release — while PR CI runs fast checks plus a cheap eval and a perf smoke',
        'Never — retraining should be manual only',
        'Only in production'],
      ok: 1,
      why: 'Retraining is minutes-to-hours; putting it in PR CI stalls development. Fast checks gate the merge; the heavy retrain and full eval gate the release.' }
  ]
};
