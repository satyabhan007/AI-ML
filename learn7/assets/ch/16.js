/* AI-ML Learn — Part 7 · Chapter 16: The Deployment Runbook */
window.CH[16] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>All 15 chapters of this part are pieces. The <b>deployment runbook</b> is the one page that assembles them: exactly how a model change goes from a merged ' +
      'pull request to fully rolled out, with every gate, every checkpoint, and every rollback point named. It exists so that <i>anyone on call</i> can ship or ' +
      'revert without paging the author.</p>' +
      '<pre><code>merged PR → CI (Ch 1,3) → artifact + registry (Ch 1,2) → eval gate (Ch 8)\n' +
      '  → promote to staging (Ch 15) → load test (Ch 11) → integration\n' +
      '  → promote to prod (Ch 4,15) → progressive rollout with auto-analysis (Ch 5)\n' +
      '  → bake → 100% → monitor (Part 8)\n' +
      '  rollback at any step: alias repoint / git revert / flag flip / rollout abort (Ch 9)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A pilot\'s checklist, again — but for the whole flight.</b> Chapter 1 was the pre-flight checklist for one ' +
      'question type; this is the full flight plan: taxi, takeoff, cruise, and the abort procedure written down before you need it, so any qualified pilot can fly it.</p></div>',
      try: [
        ['📖 Google SRE Workbook — writing runbooks / playbooks', 'https://sre.google/workbook/on-call/', 'o'],
        ['🚀 Ch 1 — packaging (the first link in the chain)', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>A DEPLOYMENT RUNBOOK NAMES, FOR THIS SERVICE:\n' +
      '  ARTIFACTS      what a "release" is (image digest + model version + prompt version +\n' +
      '                 index version + config), and where each lives.\n' +
      '  PIPELINE       the exact stages, in order, and what each gate checks + its owner.\n' +
      '  GATES          eval thresholds (Ch 8), load-test sign-off numbers (Ch 11), required approvals.\n' +
      '  ROLLOUT        strategy (canary steps % + bake time), the analysis metrics + abort thresholds\n' +
      '                 (Ch 5), and the traffic router.\n' +
      '  ROLLBACK       the ONE command / action per component, tested, with the predefined trigger\n' +
      '                 conditions (SLO burn, error spike, quality drop) (Ch 9).\n' +
      '  KILL SWITCHES  which flags disable which paths, and the safe fallback each routes to.\n' +
      '  OBSERVABILITY  the dashboard link, the alerts, the 3 metrics that mean "abort" (Part 8).\n' +
      '  CONTACTS       service owner, on-call rotation, escalation, dependency owners.\n' +
      '  FORWARD-ONLY   any migration in flight and its expand/contract state (Ch 12).\n' +
      'IT IS EXECUTABLE, VERSIONED, AND REHEARSED — not a wiki page last touched a year ago.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard is the <b>SRE runbook / playbook</b> practice: a per-service document (or, increasingly, ' +
      'a codified pipeline + <b>OpsLevel/Backstage</b>-style service catalog entry) that is linked from every alert, reviewed on change, and dry-run in staging. ' +
      'The deployment pipeline itself (GitOps + Argo Rollouts + gates) <i>is</i> most of the runbook, executable; the doc fills in the human decisions and contacts.</p></div>',
      try: [
        ['📖 PagerDuty — runbook best practices', 'https://www.pagerduty.com/resources/learn/what-is-a-runbook/', 'o'],
        ['📡 Part 8: the abort metrics & burn-rate alerts', '../learn8/#ch11', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>A full walkthrough — shipping a new ranker.</b> ' +
      '(1) PR merged → CI builds the image, runs unit + data + contract tests, publishes image digest + registers model v43. ' +
      '(2) Eval gate: v43 vs v42 on the frozen set — NDCG +0.4%, no slice regression, latency +3 ms → PASS. ' +
      '(3) Promote to staging (PR bumps the reference); integration + a k6 load test confirm 900 RPS at p99 190 ms → sign-off. ' +
      '(4) Promote to prod (PR flips <code>modelAlias</code> to <code>@candidate</code>); Argo Rollouts canaries 5% → 25% → 50% → 100%, ' +
      'pausing 30 min each; AnalysisTemplate watches p99, error rate, and result-CTR with abort thresholds. ' +
      '(5) CTR holds, no abort → 100%; alias moves to <code>@production</code>. ' +
      '(6) 24-hour watch on the dashboard. Rollback plan the whole time: <code>argocd app rollback</code> / repoint alias to v42.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The runbook in an incident.</b> ' +
      'Two hours after 100%, a burn-rate alert fires — p99 is degrading on one region. On-call opens the runbook: the predefined trigger ("SLO fast-burn for 10 min") ' +
      'is met, so they execute the named rollback (repoint <code>@production</code> to v42) — recovery in ~40 s — then file the incident. No debugging under pressure, ' +
      'no debate about whether to roll back. The runbook made it a procedure, not a judgement call.</p></div>' +
      '<p><b>Rehearse it:</b> run the full promotion + a rollback in staging as part of onboarding every on-call, and after any pipeline change.</p>',
      try: [
        ['📖 Atlassian — incident runbooks / playbooks', 'https://www.atlassian.com/incident-management/incident-response/incident-response-runbooks', 'o'],
        ['🚀 Ch 9 — rollback mechanisms the runbook invokes', '#ch9', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Runbook is tribal knowledge            One versioned doc + a codified pipeline; linked from every\n' +
      '                                       alert; reviewed on change.\n' +
      'Rollback described vaguely ("revert")   The exact command / action per component, tested, with the\n' +
      '                                       predefined trigger conditions.\n' +
      '"Release" is undefined                  Enumerate the artifact set (image + model + prompt + index +\n' +
      '                                       config versions) and where each lives.\n' +
      'Gates without owners / thresholds        Each gate names its check, its numeric threshold, and who\n' +
      '                                       signs off.\n' +
      'No abort metrics                        Name the 3 metrics + thresholds that mean "abort now" and wire\n' +
      '                                       them into the rollout analysis.\n' +
      'Never rehearsed                          Dry-run full promotion + rollback in staging on onboarding and\n' +
      '                                       after pipeline changes.\n' +
      'Stale after reorg                        Owner + on-call + escalation kept current; treat the runbook\n' +
      '                                       like code with a review cadence.\n' +
      'Migration state not recorded             If an expand/contract migration is mid-flight, the runbook\n' +
      '                                       says which phase and what that constrains.</code></pre>' +
      '<p><b>The ultimate test:</b> a new on-call engineer, at 3am, with only the runbook and the dashboard, can safely promote a release or roll one back. ' +
      'If they would need to wake the author, the runbook is incomplete.</p>',
      try: [
        ['📖 Google SRE Book — Being On-Call', 'https://sre.google/sre-book/being-on-call/', 'o'],
        ['🏢 Part 9: org design, on-call models & ownership', '../learn9/#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Walk me through how a model change reaches production in your system.\n' +
      '   A: Merged PR → CI (unit/data/contract tests) builds an immutable image + registers a model version →\n' +
      '   eval gate vs the current prod model on a frozen set → promote to staging (PR bumps the reference) →\n' +
      '   load test + integration sign-off → promote to prod (PR flips the model alias) → progressive rollout\n' +
      '   with automated analysis and abort thresholds → bake → 100% → 24h watch. Rollback available at every\n' +
      '   step.\n\n' +
      'Q: What must a deployment runbook contain to be useful at 3am?\n' +
      '   A: The artifact definition, the pipeline stages + gates + owners + thresholds, the rollout strategy\n' +
      '   and abort metrics, the exact tested rollback action per component with predefined triggers, the kill\n' +
      '   switches and their fallbacks, the dashboard/alerts, and current contacts/escalation.\n\n' +
      'Q: A burn-rate alert fires two hours after full rollout. What does the runbook let on-call do?\n' +
      '   A: Match the predefined trigger, execute the named rollback (e.g. repoint the model alias to the\n' +
      '   previous version) for a seconds-scale recovery, then file the incident — no debugging under pressure,\n' +
      '   no debate.\n\n' +
      'Q: Why keep the runbook executable and rehearsed rather than a wiki page?\n' +
      '   A: A doc that has never been run is a guess. Most of it should be the codified pipeline (GitOps +\n' +
      '   rollout + gates); the human parts are dry-run in staging on onboarding and after pipeline changes.\n\n' +
      'Q: How does the runbook handle a migration that is mid-flight?\n' +
      '   A: It records which expand/contract phase the migration is in and what that constrains (e.g.\n' +
      '   "dual-write active; do not remove column X; rollback of service Y must keep writing both formats").\n\n' +
      'Q: What is the acceptance test for the runbook?\n' +
      '   A: A new on-call engineer, with only the runbook and the dashboard, can safely promote or roll back a\n' +
      '   release without contacting the author.</code></pre>' +
      '<p><b>↔ See also:</b> every chapter of this part — the runbook is their assembly. Then <a href="../learn8/">Part 8</a> (the monitoring it points at) and ' +
      '<a href="../learn8/#ch16">Part 8 Ch 16</a> (incident response &amp; postmortems).</p>',
      try: [
        ['📖 Google SRE Workbook — Incident response', 'https://sre.google/workbook/incident-response/', 'o'],
        ['📖 Backstage — service catalog & TechDocs', 'https://backstage.io/docs/features/techdocs/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the purpose of a deployment runbook?',
      opts: [
        'To document the model architecture for researchers',
        'So anyone on call can take a model change from merged PR to full rollout — or roll it back — following named gates, thresholds and tested actions, without paging the author',
        'To list every training hyperparameter',
        'To replace the CI pipeline'],
      ok: 1,
      why: 'The runbook assembles the pieces (CI, registry, eval gate, promotion, progressive rollout, rollback) into one executable, rehearsed procedure that removes judgement calls during a deploy or incident.' },
    { q: 'A burn-rate alert fires two hours after a model reached 100%. What does a good runbook let on-call do?',
      opts: [
        'Start debugging the model internals and page the author',
        'Match a predefined trigger condition, execute the named, tested rollback (e.g. repoint the model alias to the previous version) for a seconds-scale recovery, then file the incident',
        'Wait for the next business day',
        'Increase the replica count and hope'],
      ok: 1,
      why: 'The runbook converts "should we roll back?" into an objective trigger and a one-action procedure, so recovery is immediate and does not depend on diagnosing root cause first.' },
    { q: 'What is the acceptance test for a deployment runbook?',
      opts: [
        'It is at least ten pages long',
        'A new on-call engineer, with only the runbook and the dashboard, can safely promote or roll back a release without contacting the original author',
        'It has been reviewed by legal',
        'It mentions every tool the company uses'],
      ok: 1,
      why: 'If executing it still requires tribal knowledge or waking the author, it is incomplete. Completeness means a qualified but unfamiliar operator can act safely from the document alone.' }
  ]
};
