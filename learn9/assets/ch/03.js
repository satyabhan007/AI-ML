/* AI-ML Learn — Part 9 · Chapter 3: Model Lifecycle Governance */
window.CH[3] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>In a small team, "the model is good, ship it" is one person\'s call. At enterprise scale — regulated industries, brand risk, hundreds of models — you need a ' +
      '<b>governed lifecycle</b>: a defined path from "trained" to "allowed in production", with documented evidence, named approvers, and a record of every decision.</p>' +
      '<pre><code>proposed → developed → validated → REVIEWED & APPROVED → deployed → monitored → retired\n' +
      '                                       │\n' +
      '           model card + eval evidence + risk assessment + sign-off from the right people</code></pre>' +
      '<p>The point is not bureaucracy for its own sake — it is that when a model makes a consequential decision, someone can show <i>what it was tested on, who ' +
      'approved it, and why</i>.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A drug going to market.</b> A promising compound does not go straight to pharmacy shelves — trials, ' +
      'a dossier, a regulatory review board, an approval on file, and post-market surveillance. High-stakes models get a proportionate version of that.</p></div>',
      try: [
        ['📖 Google — Model Cards for model reporting', 'https://modelcards.withgoogle.com/about', 'o'],
        ['🚀 Part 7: the model registry this governance sits on', '../learn7/#ch2', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>MODEL CARD        purpose & intended use, out-of-scope uses, training data summary, evaluation\n' +
      '                 (metrics + slices + fairness), limitations, ethical considerations, owner,\n' +
      '                 version. Lives with the registry entry (Part 7 Ch 2).\n' +
      'RISK TIERING      classify each model by impact: does it affect money, safety, rights, or is it\n' +
      '                 low-stakes internal tooling? Tier drives how much review it needs.\n' +
      'APPROVAL WORKFLOW  tier 1 (high risk): eval evidence + risk assessment + model-risk committee\n' +
      '                 sign-off + legal/compliance where relevant. Tier 3: automated gate + owner sign-off.\n' +
      'MODEL RISK COMMITTEE (a.k.a. MRM / AI review board)  cross-functional (ML, product, legal, risk,\n' +
      '                 security); reviews tier-1 models pre-deploy and material changes; minutes recorded.\n' +
      'CHANGE CONTROL     a retrain / prompt change / threshold change is a governed change — re-review\n' +
      '                 proportionate to risk, not a silent push (Part 7 Ch 2, Ch 10).\n' +
      'INVENTORY          a register of every model in production: owner, tier, purpose, last review,\n' +
      '                 upstream/downstream systems (feeds Ch 4 lineage, Ch 6 compliance).\n' +
      'DECOMMISSIONING    a defined retirement path: dependants migrated, data retention handled, entry archived.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The frameworks: <b>NIST AI RMF</b> (Govern/Map/Measure/Manage), <b>ISO/IEC 42001</b> (AI management system), ' +
      'and — for finance — <b>SR 11-7 / Model Risk Management</b>. Artefacts: <b>Model Cards</b>, <b>datasheets for datasets</b>, <b>system cards</b>. Tooling: registry ' +
      '+ approval workflows (MLflow, Vertex, SageMaker Model Governance, or GRC platforms). You run a proportionate version of these; the structures are standardised.</p></div>',
      try: [
        ['📖 NIST — AI Risk Management Framework (AI RMF 1.0)', 'https://www.nist.gov/itl/ai-risk-management-framework', 'o'],
        ['📖 ISO/IEC 42001 — AI management system', 'https://www.iso.org/standard/81230.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Right-sizing the process.</b> ' +
      'A bank\'s first attempt puts every model — including an internal ticket-router — through a 6-week model-risk-committee review. Teams route around it. ' +
      'Fix: <b>risk tiering</b>. Tier 1 (credit decisions, anything touching customers\' money or rights) keeps the full review + committee + legal. Tier 2 (material ' +
      'internal impact) gets a lightweight review by a delegate. Tier 3 (low-stakes internal) needs only the automated eval gate (Part 7 Ch 8) + the owning lead\'s sign-off, ' +
      'recorded. Governance now scales with risk instead of blocking everything.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The silent prompt change that skipped review.</b> ' +
      'A tier-1 customer-facing assistant\'s system prompt is edited to "improve tone" — no version bump, no review. It subtly changes eligibility language and creates a ' +
      'compliance exposure. Fixes: treat <b>prompts, thresholds, and retrieval corpora as governed artefacts</b> (Part 7 Ch 2, Ch 10); a change to a tier-1 model\'s ' +
      'behaviour-defining config triggers a proportionate re-review; and the eval gate includes the regulated-language checks. Governance covers <i>behaviour</i>, not just weights.</p></div>' +
      '<p><b>Make the evidence a by-product, not extra work:</b> the model card is generated from the training run + eval harness; the approval is a recorded status ' +
      'transition on the registry alias (Part 7 Ch 2). If governance means re-typing everything into a Word doc, it will be gamed.</p>',
      try: [
        ['📖 Federal Reserve — SR 11-7: Guidance on Model Risk Management', 'https://www.federalreserve.gov/supervisionreg/srletters/sr1107.htm', 'o'],
        ['🏢 Ch 7 — responsible AI in production (the "why" behind the review)', '#ch7', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Same heavy review for every model      Risk tiering: full committee for tier 1, delegate review for\n' +
      '                                       tier 2, automated gate + owner sign-off for tier 3.\n' +
      'Governance = a Word doc re-typed       Generate the model card from the training run + eval harness;\n' +
      '                                       approvals = recorded registry status transitions.\n' +
      'Only weights are governed               Prompts, thresholds, retrieval corpora, tool access are\n' +
      '                                       behaviour-defining — govern changes to them proportionately.\n' +
      'No model inventory                      A register of every production model: owner, tier, purpose,\n' +
      '                                       last review, dependencies. You cannot govern what you cannot list.\n' +
      'Approval with no evidence standard      Define what tier-1 evidence must include (eval slices,\n' +
      '                                       fairness, robustness, limitations, monitoring plan).\n' +
      'Committee is a rubber stamp             Cross-functional membership, real authority to reject, minutes\n' +
      '                                       recorded, decisions auditable.\n' +
      'No re-review on material change          Retrain / distribution shift / new use case = re-review\n' +
      '                                       proportionate to risk.\n' +
      'No decommissioning path                 Defined retirement: migrate dependants, handle data retention,\n' +
      '                                       archive the entry.</code></pre>' +
      '<p><b>Governance is a control system, not a gate you pass once.</b> Approval, monitoring (Part 8), and change control are a loop: a model that drifts or is ' +
      'misused re-enters review, and the inventory is the always-current map of what is live and who owns it.</p>',
      try: [
        ['📖 Partnership on AI — model & system documentation practices', 'https://partnershiponai.org/workstream/abouts-model-documentation/', 'o'],
        ['📕 Part 4: responsible AI, fairness, model documentation', '../learn4/#ch17', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What is model lifecycle governance and why does it matter at enterprise scale?\n' +
      '   A: A defined, evidenced path from "trained" to "allowed in production" — model card, evaluation,\n' +
      '   risk assessment, named approvers, recorded decisions, ongoing monitoring, and a retirement path. It\n' +
      '   means that for any consequential model you can show what it was tested on, who approved it, and why.\n\n' +
      'Q: How do you keep governance from blocking everything?\n' +
      '   A: Risk tiering. Tier 1 (money, safety, rights, customer-facing) gets full review + a model-risk\n' +
      '   committee + legal; tier 2 a delegate review; tier 3 (low-stakes internal) just the automated eval\n' +
      '   gate + owner sign-off, recorded. Process scales with risk.\n\n' +
      'Q: A tier-1 assistant\'s prompt was edited with no review and created a compliance exposure. What was\n' +
      '   missing?\n' +
      '   A: Prompts (and thresholds, retrieval corpora, tool access) were not treated as governed,\n' +
      '   behaviour-defining artefacts. A change to a tier-1 model\'s behaviour must trigger a proportionate\n' +
      '   re-review, and the eval gate must include the regulated checks.\n\n' +
      'Q: What is a model risk committee?\n' +
      '   A: A cross-functional board (ML, product, legal, risk, security) that reviews tier-1 models and\n' +
      '   material changes before deployment, with real authority to reject and recorded minutes.\n\n' +
      'Q: What is in a model card?\n' +
      '   A: Intended and out-of-scope use, training-data summary, evaluation (metrics + slices + fairness),\n' +
      '   limitations, ethical considerations, owner, version — generated from the training run and eval\n' +
      '   harness, stored with the registry entry.\n\n' +
      'Q: Which frameworks underpin this?\n' +
      '   A: NIST AI RMF, ISO/IEC 42001, and SR 11-7 / Model Risk Management for finance.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch4">Ch 4</a> (data governance &amp; lineage), <a href="#ch6">Ch 6</a> (compliance), <a href="#ch7">Ch 7</a> (responsible AI), ' +
      '<a href="../learn7/#ch2">Part 7 Ch 2</a> (registry &amp; approvals), <a href="../learn8/#ch7">Part 8 Ch 7</a> (monitoring feeds re-review).</p>',
      try: [
        ['📖 OECD — AI system lifecycle & accountability', 'https://oecd.ai/en/dashboards/ai-principles/P8', 'o'],
        ['📖 Google — Model Cards toolkit', 'https://github.com/tensorflow/model-card-toolkit', 'o']
      ] }
  ],

  quiz: [
    { q: 'How do you prevent model governance from becoming a bottleneck that teams route around?',
      opts: [
        'Apply the same full model-risk-committee review to every model',
        'Risk tiering — full review + committee for high-impact models (money, safety, rights, customer-facing), a lightweight delegate review for medium impact, and just the automated eval gate + owner sign-off for low-stakes internal models',
        'Remove governance entirely',
        'Only review models after an incident'],
      ok: 1,
      why: 'Proportionate governance scales effort with risk. A one-size heavy process either blocks everything or gets bypassed.' },
    { q: 'A tier-1 customer-facing assistant\'s system prompt was edited with no review and created a compliance exposure. What was missing?',
      opts: [
        'A faster GPU',
        'Treating prompts (and thresholds, retrieval corpora, tool access) as governed, behaviour-defining artefacts, so a change to a tier-1 model\'s behaviour triggers proportionate re-review and hits the regulated-language checks',
        'A bigger model',
        'More replicas'],
      ok: 1,
      why: 'Governance must cover what determines behaviour, not just the weights. Prompt and config changes to high-risk models are governed changes.' },
    { q: 'What is the purpose of a model card stored with the registry entry?',
      opts: [
        'To advertise the model to customers',
        'To document intended/out-of-scope use, training-data summary, evaluation (metrics + slices + fairness), limitations, owner and version — the evidence an approver and later auditor needs',
        'To store the model weights',
        'To list the hyperparameters only'],
      ok: 1,
      why: 'The model card is the standardised evidence artefact: what the model is for, how it was evaluated, and where it should not be used — ideally generated from the training run and eval harness.' }
  ]
};
