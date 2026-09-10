/* AI-ML Learn — Part 7 · Chapter 9: Rollback & Kill Switches */
window.CH[9] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Every deploy is a bet. The question is not "will something eventually go wrong" but "when it does, how fast can we undo it". If reverting a bad model ' +
      'takes a rebuild, a retrain, or a scramble to remember what changed, your recovery time is measured in hours — and so is the damage.</p>' +
      '<pre><code>ROLLBACK       go back to the previous known-good version — model, prompt, config, or code\n' +
      'KILL SWITCH    a flag that instantly disables a feature / path without a deploy\n' +
      'GOAL           mean-time-to-recovery in SECONDS: one action, no build, no code change</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A circuit breaker in your house.</b> When something sparks, you do not rewire the wall — you flip ' +
      'one switch and the danger stops. Then you investigate at leisure. A kill switch is that breaker for a feature; a rollback is swapping back the appliance that worked.</p></div>',
      try: [
        ['📖 Google SRE Book — Emergency response & rollbacks', 'https://sre.google/sre-book/emergency-response/', 'o'],
        ['🚀 Ch 2 — the registry alias you repoint to roll back', '#ch2', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>WHAT YOU MIGHT NEED TO ROLL BACK (independently)\n' +
      '  model         repoint the @production alias to the previous version (Ch 2). Fast, no rebuild.\n' +
      '  prompt         prompt is a versioned artifact → revert to the prior version (Ch 2).\n' +
      '  retrieval index  keep the previous index; switch index_version back.\n' +
      '  serving config  git revert the values change; GitOps reconciles (Ch 4).\n' +
      '  application code  standard deploy rollback (previous image) — blue-green flip is instant.\n' +
      'KILL SWITCHES  feature flags for: the whole feature, a specific model/route, a tool an agent can\n' +
      '               call, streaming, a new prompt path. Default-safe; changeable in seconds; audited.\n' +
      'FORWARD-ONLY   some changes cannot be un-run (a data migration, a schema change). Use\n' +
      '               expand/contract migrations so the old code keeps working during the window (Ch 12).\n' +
      'PRE-CONDITIONS  keep N-1 warm/available; make changes backward-compatible for one version;\n' +
      '               rehearse rollback in staging as part of the release.\n' +
      'DECISION         predefine the rollback trigger (SLO burn, error spike, quality drop) so on-call\n' +
      '               acts without a debate at 3am.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard mechanisms: <b>GitOps revert</b> (Argo CD/Flux), <b>Argo Rollouts / blue-green</b> ' +
      'instant abort, <b>model-registry alias repoint</b>, and a <b>feature-flag platform</b> (LaunchDarkly, Unleash, Flagsmith, OpenFeature) for kill switches. ' +
      'The <b>expand/contract (parallel-change) migration</b> pattern keeps schema/data changes reversible. You wire these; the patterns are standard SRE + release engineering.</p></div>',
      try: [
        ['📖 OpenFeature — vendor-neutral feature flags', 'https://openfeature.dev/docs/reference/intro', 'o'],
        ['📖 Martin Fowler — parallel change (expand/contract)', 'https://martinfowler.com/bliki/ParallelChange.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The rollback that could not roll back.</b> ' +
      'A new model ships with a new response schema; a client was updated to match. The model turns out bad — but reverting the model breaks the updated client, ' +
      'and reverting the client breaks other things. Recovery takes 90 minutes of coordinated deploys. Fix for next time: make the change <b>backward-compatible</b> ' +
      '(new model still emits the old fields; client tolerates both), ship model and client changes as <b>separately revertible</b> steps, and only remove the old ' +
      'schema a version later once the new one is proven.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Kill switch beats rollback.</b> ' +
      'A newly enabled "AI summary" feature starts producing offensive output for a rare input class. A full rollback deploy would take ~15 minutes. Instead on-call ' +
      'flips the <code>ai_summary_enabled</code> <b>flag to off</b> — the path is disabled for everyone in ~5 seconds, users see the previous non-AI experience, ' +
      'and the team debugs without pressure. The flag existed <i>because it was added when the feature was built</i>, default-off, wired to a real fallback.</p></div>' +
      '<p><b>Rehearse it.</b> Every release plan includes the exact rollback command / flag and a staging dry-run. A rollback path you have never executed is a guess.</p>',
      try: [
        ['📖 Argo CD — rollback to a previous sync', 'https://argo-cd.readthedocs.io/en/stable/user-guide/commands/argocd_app_rollback/', 'o'],
        ['🚀 Ch 12 — migrations & cutovers (forward-only changes)', '#ch12', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Rollback = rebuild / retrain           Rollback = repoint an alias / git revert / flip a flag / blue-\n' +
      '                                       green flip. Seconds, not a pipeline run.\n' +
      'Model + client changed together, no     Ship each as a separately revertible step; keep the change\n' +
      '  compat                                backward-compatible for one version.\n' +
      'No kill switch on a new feature/tool     Add a default-safe flag when you build it, wired to a real\n' +
      '                                       fallback. Retrofitting one mid-incident is too late.\n' +
      'Irreversible migration on the hot path   Expand/contract: add new, dual-write/read, migrate, then\n' +
      '                                       remove old — each step reversible.\n' +
      'Rollback never rehearsed                Dry-run it in staging every release; put the exact command in\n' +
      '                                       the runbook.\n' +
      'N-1 not kept warm                        Keep the previous model/version available so failover is\n' +
      '                                       instant, not a cold load.\n' +
      'No predefined trigger                    Define the rollback condition (SLO burn rate, error spike,\n' +
      '                                       quality-metric drop) in advance so on-call acts immediately.\n' +
      'Flags never cleaned up                   Old flags rot into risk. Track owners + expiry; remove after\n' +
      '                                       the feature is stable.</code></pre>' +
      '<p><b>Rollback is a first-class design constraint.</b> "How do we undo this in one action?" is asked <i>before</i> a change ships, not discovered during the incident.</p>',
      try: [
        ['📖 Google SRE Workbook — Canarying releases & rollback', 'https://sre.google/workbook/canarying-releases/', 'o'],
        ['📡 Part 8: burn-rate alerts as a rollback trigger', '../learn8/#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What is the goal of a rollback strategy, concretely?\n' +
      '   A: Mean-time-to-recovery in seconds via a single action with no build, retrain, or code change —\n' +
      '   repoint a model alias, git-revert a config, flip a feature flag, or blue-green flip back.\n\n' +
      'Q: Difference between a rollback and a kill switch?\n' +
      '   A: A rollback returns a component (model/prompt/config/code) to its previous known-good version. A\n' +
      '   kill switch is a pre-built flag that disables a feature or path instantly with no deploy, routing to\n' +
      '   a safe fallback.\n\n' +
      'Q: A model and a client were changed together and now you cannot revert either cleanly. What went\n' +
      '   wrong?\n' +
      '   A: The change was not backward-compatible and the two were coupled. Fix: new model keeps emitting the\n' +
      '   old fields, client tolerates both, ship as separately revertible steps, remove the old schema a\n' +
      '   version later.\n\n' +
      'Q: How do you make a schema/data migration reversible?\n' +
      '   A: Expand/contract (parallel change): add the new structure, dual-write and read old+new, backfill,\n' +
      '   cut reads over, then remove the old — each step independently reversible and the old code keeps\n' +
      "   working throughout.\n\n" +
      'Q: When is a kill switch better than a rollback?\n' +
      '   A: When you need to stop harm in seconds (offensive output, a leak, a runaway cost) and a rollback\n' +
      '   deploy would take minutes — provided the flag was built in, default-safe, with a real fallback.\n\n' +
      'Q: Why predefine the rollback trigger?\n' +
      '   A: So on-call executes immediately on an objective condition (SLO burn rate, error spike, quality\n' +
      '   drop) instead of debating causation during the incident.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch2">Ch 2</a> (alias repoint), <a href="#ch4">Ch 4</a> (git revert), <a href="#ch5">Ch 5</a> (rollout auto-abort), <a href="#ch12">Ch 12</a> (reversible migrations), ' +
      '<a href="../learn8/#ch11">Part 8 Ch 11</a> (alerting triggers).</p>',
      try: [
        ['📖 LaunchDarkly — kill switches & feature management', 'https://docs.launchdarkly.com/home/getting-started', 'o'],
        ['📖 Google SRE Book — Postmortem culture', 'https://sre.google/sre-book/postmortem-culture/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the target recovery mechanism for a bad model in production?',
      opts: [
        'Retrain the previous model from scratch',
        'A single fast action with no build or code change — repoint the model-registry alias to the last good version (or git-revert the config / flip a flag)',
        'Rebuild the container image and redeploy through full CI',
        'Wait for the next scheduled release'],
      ok: 1,
      why: 'Rollback must be seconds, not a pipeline run. Alias repoint, git revert, feature-flag flip and blue-green flip are all near-instant and require keeping N-1 available.' },
    { q: 'A model change and a client change shipped together and now neither can be reverted cleanly. What is the fix for next time?',
      opts: [
        'Never change the client',
        'Make the change backward-compatible (new model still emits old fields, client accepts both) and ship the two as separately revertible steps, removing the old schema a version later',
        'Always deploy both at 3am',
        'Skip testing the client'],
      ok: 1,
      why: 'Coupled, non-backward-compatible changes have no safe individual rollback. Parallel-change keeps each step independently reversible.' },
    { q: 'A newly enabled feature produces harmful output for a rare input. A rollback deploy takes 15 minutes. Better immediate action?',
      opts: [
        'Wait for the rollback deploy',
        'Flip the pre-built, default-safe feature flag to off, disabling the path for everyone in seconds and routing to the existing fallback, then debug',
        'Push a hotfix commit straight to main',
        'Scale the deployment to zero replicas'],
      ok: 1,
      why: 'A kill switch stops harm immediately without a deploy — but only if it was built into the feature from the start, default-safe, and wired to a real fallback.' }
  ]
};
