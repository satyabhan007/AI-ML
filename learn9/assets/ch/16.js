/* AI-ML Learn — Part 9 · Chapter 16: Enterprise-Readiness Checklist */
window.CH[16] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>The final chapter of the course is one list. Before a model or an AI feature goes live at enterprise scale — or during a maturity review of an existing one — ' +
      'these are the questions someone will ask, across five areas. If you cannot answer a question with "yes, here", it is a gap.</p>' +
      '<pre><code>SECURITY · GOVERNANCE · RELIABILITY · COST · ORGANISATION\n' +
      'a go-live review walks all five; a red answer is a blocker or a documented, time-boxed exception</code></pre>' +
      '<p>Everything in Parts 6-9 exists to make the answers "yes". This chapter is how you check.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A pre-flight checklist for the whole aircraft.</b> Chapter 1 of Part 6 was the checklist for one ' +
      'design question; this is the walk-around before the plane carries passengers: control surfaces, fuel, avionics, safety equipment, crew briefed. Every item, every flight.</p></div>',
      try: [
        ['📖 Google — Practitioners guide to MLOps (readiness)', 'https://services.google.com/fh/files/misc/practitioners_guide_to_mlops_whitepaper.pdf', 'o'],
        ['🏢 Ch 15 — the architecture this checklist covers', '#ch15', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>SECURITY (Ch 5, P7 C10/C14)\n' +
      '  □ threat model done  □ prompt-injection / exfil defences layered  □ least-agency tools + sandbox\n' +
      '  □ secrets runtime-injected, rotatable  □ model/artifact signed + SBOM  □ red-team suite + safety metrics\n' +
      '  □ retrieval scoped by tenant  □ egress controls on the model/agent runtime\n' +
      'GOVERNANCE (Ch 3/4/6/7)\n' +
      '  □ risk tier assigned  □ model card + eval evidence  □ approval on record (committee for tier-1)\n' +
      '  □ data catalog + lineage + classification + retention  □ compliance regimes mapped to controls\n' +
      '  □ fairness metrics + appeal path + audit trail + human oversight for high-risk\n' +
      'RELIABILITY (P6 C9/C10, P7 all, P8 all, P9 C9)\n' +
      '  □ SLIs/SLOs + error budget + burn-rate alerts  □ golden signals + LLM + quality + safety dashboards\n' +
      '  □ progressive delivery + eval gate + one-action rollback + kill switches  □ load/soak sign-off\n' +
      '  □ multi-region / cell containment  □ DR tested by restore + a game day  □ deployment runbook\n' +
      'COST (P6 C11, P8 C13, P9 C8)\n' +
      '  □ cost per successful request tracked + attributed  □ per-team budgets + anomaly alerts + forecast\n' +
      '  □ utilisation managed  □ commitment/spot mix  □ showback (→ chargeback)\n' +
      'ORGANISATION (Ch 1/10/11/12/13/14)\n' +
      '  □ a named owner + on-call  □ built on the paved road  □ quotas/rate limits + tenancy\n' +
      '  □ portability: standard API + portable evals + exit plan  □ deprecation/change plan for what it replaces</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>This consolidates the standard readiness rubrics: the <b>Google SRE Production Readiness Review</b>, ' +
      'the <b>ML Test Score</b> (Breck et al.), <b>AWS/Azure Well-Architected</b> (+ ML Lens), the <b>NIST AI RMF</b> Manage function, and <b>ISO/IEC 42001</b> operational ' +
      'controls. Run it as a gated review (a go/no-go with sign-offs) proportionate to the model\'s risk tier.</p></div>',
      try: [
        ['📖 Google SRE Book — Launch Coordination / readiness', 'https://sre.google/sre-book/launch-checklist/', 'o'],
        ['📖 "The ML Test Score" — a rubric for production readiness', 'https://research.google/pubs/the-ml-test-score-a-rubric-for-ml-production-readiness-and-technical-debt-reduction/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>A go-live review that caught three gaps.</b> ' +
      'A tier-1 customer-facing assistant is up for launch. The review finds: (1) no <b>quality SLO</b> — only latency/availability, so a groundedness regression would ' +
      'not page (Part 8 Ch 4/7); (2) the <b>rollback</b> plan reverts the model but not the coupled prompt version (Part 7 Ch 2/9); (3) no <b>appeal path</b> for users ' +
      'who dispute an answer, which the AI-Act high-risk classification requires (Ch 6/7). Launch is held one week; the three are fixed and re-reviewed. The checklist ' +
      'turned three future incidents into a week of work.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Maturity review of an existing platform.</b> ' +
      'Not a launch — a quarterly assessment. Scoring each area 0-3: Security 3, Reliability 3, Cost 2 (no chargeback, utilisation ~40%), Governance 1 (no model ' +
      'inventory, ad-hoc approvals), Organisation 2 (central-team bottleneck). The low scores become the platform roadmap: a model inventory + tiered approval workflow, ' +
      'chargeback + a GPU scheduler, and moving model ownership to stream teams. Re-scored next quarter.</p></div>' +
      '<p><b>Proportionate, not bureaucratic:</b> a tier-3 internal tool passes with the automated eval gate + an owner + a dashboard. A tier-1 system that decides ' +
      'something about a person gets the full walk. The tier (Ch 3) sets the depth.</p>',
      try: [
        ['📖 AWS — Well-Architected reviews & the ML Lens', 'https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/well-architected-machine-learning-lifecycle.html', 'o'],
        ['🏢 Ch 3 — risk tiering sets the depth of this review', '#ch3', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Readiness check = a latency dashboard   Walk all five areas: security, governance, reliability,\n' +
      '                                       cost, organisation.\n' +
      'One bar for every model                 Depth proportionate to risk tier (Ch 3): tier-3 = light,\n' +
      '                                       tier-1 = the full walk with sign-offs.\n' +
      'Review once, at launch                  Also a periodic maturity review of live systems; low scores\n' +
      '                                       become the roadmap.\n' +
      'Gaps waved through informally           A red answer is a blocker OR a written, time-boxed exception\n' +
      '                                       with an owner and a date.\n' +
      'Checklist owned by no one               The review is a gated step with named sign-offs (owner,\n' +
      '                                       platform, security, governance for tier-1).\n' +
      'Checklist as pure paperwork             Each item points at the running system/control that satisfies\n' +
      "                                       it — evidence is a link, not a paragraph.\n" +
      'Rollback / kill switch "assumed"        Actually test them as part of the review.\n' +
      'No re-review on material change          Retrain, new use case, or drift re-enters the checklist\n' +
      '                                       proportionate to risk.</code></pre>' +
      '<p><b>The whole course, in one line:</b> build the primitives so you understand them (Parts 1-5), then operate the standard stack around them — designed, ' +
      'deployed, observed, and governed (Parts 6-9) — so that every answer on this checklist is "yes, here."</p>',
      try: [
        ['📖 NIST AI RMF — the Manage function', 'https://airc.nist.gov/AI_RMF_Knowledge_Base/AI_RMF/Core_And_Profiles/6-Sec-Manage', 'o'],
        ['📖 Microsoft — Responsible AI Impact Assessment template', 'https://www.microsoft.com/en-us/ai/responsible-ai-resources', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What areas does an enterprise AI-readiness review cover?\n' +
      '   A: Security (threat model, injection/exfil defences, least agency, secrets, signing, red-team),\n' +
      '   governance (risk tier, model card + eval evidence, approval on record, data governance, compliance\n' +
      '   mapping, fairness + appeal + audit + human oversight), reliability (SLOs + budgets + burn alerts,\n' +
      '   dashboards, progressive delivery + eval gate + rollback + kill switches, load sign-off, cell\n' +
      '   containment, tested DR, a runbook), cost (cost per successful request tracked + attributed, budgets\n' +
      '   + forecast, utilisation, commitment mix, showback), and organisation (owner + on-call, on the paved\n' +
      '   road, quotas + tenancy, portability + exit plan, a plan for what it replaces).\n\n' +
      'Q: How deep should the review be for a given model?\n' +
      '   A: Proportionate to its risk tier — a low-stakes internal tool passes with an eval gate + owner +\n' +
      '   dashboard; a tier-1 system that decides something about a person gets the full walk with sign-offs.\n\n' +
      'Q: Is this only a launch gate?\n' +
      '   A: No — also a periodic maturity review of live systems, scoring each area, where the low scores\n' +
      '   become the platform roadmap. And a re-review on any material change.\n\n' +
      'Q: What happens to a "red" answer?\n' +
      '   A: It is a blocker, or a written, time-boxed exception with an owner and a date — never an informal\n' +
      '   wave-through.\n\n' +
      'Q: How do you keep the checklist from being pure paperwork?\n' +
      '   A: Every item points at the running system or control that satisfies it, and rollback / kill switches\n' +
      '   are actually tested during the review — evidence is a link, not a paragraph.\n\n' +
      'Q: Summarise the whole course.\n' +
      '   A: Build the primitives from scratch to understand them (Parts 1-5); then operate the\n' +
      '   industry-standard stack around them — system design, deployment, observability, and enterprise\n' +
      '   governance (Parts 6-9) — until every answer on this checklist is "yes, here."</code></pre>' +
      '<p><b>↔ See also:</b> this checklist references every chapter of Parts 6-9. That is the end of the course — <a href="#/">back to all Part 9 chapters</a>, ' +
      'or revisit <a href="../learn/">Part 1</a> where it started.</p>',
      try: [
        ['📖 Google SRE Book — Reliable Product Launches at Scale', 'https://sre.google/sre-book/reliable-product-launches/', 'o'],
        ['📖 AWS Well-Architected Framework — the review process', 'https://docs.aws.amazon.com/wellarchitected/latest/framework/the-review-process.html', 'o']
      ] }
  ],

  quiz: [
    { q: 'What does an enterprise AI-readiness review cover?',
      opts: [
        'Just a latency and error-rate dashboard',
        'Five areas — security, governance, reliability, cost, and organisation — each with concrete items pointing at the running system or control that satisfies them',
        'Only the model\'s offline accuracy',
        'Whether the code compiles'],
      ok: 1,
      why: 'Production readiness at enterprise scale is multi-dimensional. A latency dashboard is one item under reliability; the review also checks security, governance, cost and organisational ownership.' },
    { q: 'How deep should a readiness review be for a specific model?',
      opts: [
        'Identical for every model regardless of impact',
        'Proportionate to its risk tier — a low-stakes internal tool passes with an eval gate, an owner and a dashboard; a tier-1 system that decides something about a person gets the full walk with sign-offs',
        'The deepest possible review for everything, always',
        'No review is needed if tests pass'],
      ok: 1,
      why: 'Risk tiering (from model governance) sets the depth. Applying the full enterprise review to a ticket-router wastes effort and gets bypassed; applying a light review to a credit-decision model is negligent.' },
    { q: 'During a readiness review, a required control (e.g. a quality SLO, a working rollback, or a user appeal path) is missing. What should happen?',
      opts: [
        'Wave it through and add a ticket for later',
        'It is a blocker, or a written, time-boxed exception with a named owner and a date — never an informal wave-through',
        'Cancel the project',
        'Ignore it because the model is accurate'],
      ok: 1,
      why: 'A red answer represents a real risk. Either it is fixed before go-live or it becomes an explicit, tracked exception with an expiry — so gaps are visible and get closed.' }
  ]
};
