/* AI-ML Learn — Part 9 · Chapter 7: Responsible AI in Production */
window.CH[7] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Responsible AI is often a slide deck of principles. In production it has to be <b>running systems</b>: a fairness metric on a dashboard, an appeal button a real ' +
      'user can click, an audit log a regulator can read, an explanation a support agent can give. Principles that are not wired into the platform do not survive contact with a deadline.</p>' +
      '<pre><code>PRINCIPLE                         → PRODUCTION SYSTEM\n' +
      '  fairness / non-discrimination      per-group performance metrics + alerts (Part 8)\n' +
      '  explainability                     per-decision explanations available to users/agents\n' +
      '  contestability                     an appeal / human-review path with SLAs\n' +
      '  accountability                     an owner, an audit trail of every consequential decision\n' +
      '  human oversight                    a reviewer who can and does override, before real harm</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A restaurant\'s hygiene rating vs. its mission statement.</b> "We care about safety" on the wall is ' +
      'worthless; the inspection score by the door, the handwash logs, and the process for a customer to report illness are what actually protect people.</p></div>',
      try: [
        ['📖 NIST — AI RMF: characteristics of trustworthy AI', 'https://airc.nist.gov/AI_RMF_Knowledge_Base/Playbook', 'o'],
        ['📕 Part 4: responsible ML — fairness, explainability', '../learn4/#ch17', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>FAIRNESS IN PROD\n' +
      '  pick metrics that match the harm + the law: demographic parity, equal opportunity / equalised\n' +
      '  odds, calibration by group, predictive parity. They CONFLICT — you cannot satisfy all; choose\n' +
      '  and justify. Monitor per protected group over time (needs attribute data — Ch 4). Alert on gaps.\n' +
      'EXPLAINABILITY\n' +
      '  global (feature importance, SHAP summary) for review; local (why THIS decision) for the user /\n' +
      '  agent — reason codes, top contributing features, "what would change the outcome" (counterfactual).\n' +
      '  For LLMs: citations + the retrieved context (Part 6 Ch 16).\n' +
      'CONTESTABILITY\n' +
      '  a visible appeal path; a human re-decides within an SLA; the outcome + reason recorded; appeals\n' +
      '  feed back into evaluation.\n' +
      'HUMAN OVERSIGHT\n' +
      '  meaningful, not nominal: the reviewer has time, context, the explanation, authority to override,\n' +
      '  and is measured on override rate + agreement (not just throughput).\n' +
      'AUDIT TRAIL\n' +
      '  every consequential decision: inputs (or their hash), model + version + prompt version, output,\n' +
      '  explanation, who/what acted, any override. Immutable, retained per policy.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>Frameworks: <b>NIST AI RMF</b> trustworthiness characteristics, <b>OECD AI Principles</b>, ' +
      '<b>EU AI Act</b> human-oversight + transparency articles, <b>ISO/IEC 42001</b>. Tooling: <b>Fairlearn</b>, <b>AIF360</b>, <b>What-If Tool</b>, <b>SHAP</b> / ' +
      '<b>Captum</b> / <b>LIME</b>, fairness dashboards in <b>Arize / Fiddler / Aequitas</b>. You choose fairness definitions, wire the metrics and the appeal flow, and keep the audit log; the methods are standardised.</p></div>',
      try: [
        ['📖 Fairlearn — fairness metrics & mitigation', 'https://fairlearn.org/main/user_guide/index.html', 'o'],
        ['📖 Aequitas — bias & fairness audit toolkit', 'http://aequitas.dssg.io/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Fairness monitoring catches drift into disparity.</b> ' +
      'A loan-assistance model launched with equal-opportunity gap &lt; 2% across groups. Six months later a per-group monitor shows the approval-rate gap has grown to ' +
      '9% — a shift in the applicant population plus feedback effects. Because the gap is a <b>monitored metric with an alert</b> (and a fairness SLI with a budget, ' +
      'Part 8 Ch 4), it is caught and the model is re-examined and retrained. Without per-group monitoring, the aggregate accuracy looked fine the whole time.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Human oversight that was only nominal.</b> ' +
      'A high-risk decision system routes 100% of cases to a reviewer "for oversight" — but the reviewer sees 400 cases/hour, no explanation, and their override rate is ' +
      '0.1%. That is a rubber stamp, and it will not satisfy an auditor (or protect anyone). Fixes: route only <b>uncertain / high-impact / flagged</b> cases to humans, ' +
      'give the reviewer the explanation + full context + time, measure override rate and reviewer-vs-model agreement, and act if the reviewer is not actually engaging.</p></div>' +
      '<p><b>Feed contestation back:</b> every successful appeal is a labelled example of a model error — it belongs in the eval set (Part 7 Ch 8) and the fairness analysis.</p>',
      try: [
        ['📖 Google PAIR — People + AI Guidebook (explainability, feedback)', 'https://pair.withgoogle.com/guidebook/', 'o'],
        ['📡 Part 8: fairness/quality SLIs & alerting', '../learn8/#ch4', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Principles on a wiki, nothing wired     Each principle → a running system: fairness metric + alert,\n' +
      '                                       explanation endpoint, appeal flow, audit log, oversight path.\n' +
      'One fairness metric, unquestioned       Choose the definition(s) that match the harm and the law;\n' +
      '                                       state the trade-offs (they conflict); monitor per group over time.\n' +
      'Explainability = a SHAP plot for the      Local, decision-level explanations the user or agent can\n' +
      '  data-science team                       actually use (reason codes, counterfactuals, citations).\n' +
      'Human "in the loop" but overwhelmed      Route only uncertain/high-impact cases; give time + context +\n' +
      '                                       explanation + authority; measure override rate + agreement.\n' +
      'No appeal path                            A visible contestation route with an SLA; outcomes recorded\n' +
      '                                       and fed back into evaluation.\n' +
      'Audit log missing model/prompt version    Log inputs (or hash), model+version+prompt version, output,\n' +
      '                                       explanation, actor, overrides — immutable, retained.\n' +
      'Fairness checked once pre-launch          Continuous per-group monitoring; disparity can grow post-\n' +
      '                                       deploy from population shift + feedback loops.\n' +
      'Responsible AI owned by an ethics board    An owner per system + platform-level tooling; the board\n' +
      '                                       sets policy, the systems enforce it.</code></pre>' +
      '<p><b>Responsible AI in production is an engineering deliverable</b> — a set of endpoints, metrics, logs, and workflows on the platform — that the ethics/policy ' +
      'function specifies and audits, not a document it hands over.</p>',
      try: [
        ['📖 Microsoft — Responsible AI Standard & tooling', 'https://www.microsoft.com/en-us/ai/responsible-ai', 'o'],
        ['🏢 Ch 6 — the regulatory obligations this satisfies', '#ch6', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What does "responsible AI in production" mean concretely, beyond principles?\n' +
      '   A: Running systems: per-group fairness metrics with alerts, decision-level explanations available to\n' +
      '   users/agents, a contestation/appeal path with an SLA, an immutable audit trail of consequential\n' +
      '   decisions, and a meaningful human-oversight path.\n\n' +
      'Q: Why can you not just "make the model fair"?\n' +
      '   A: Fairness definitions (demographic parity, equal opportunity, calibration by group, predictive\n' +
      '   parity) mathematically conflict — you cannot satisfy all at once. You choose the definition(s) that\n' +
      '   match the harm and the law, justify the trade-off, and monitor per group over time.\n\n' +
      'Q: A high-risk system routes every case to a reviewer "for oversight". What is wrong?\n' +
      '   A: If the reviewer has no explanation, no time, and a ~0% override rate, it is a rubber stamp — not\n' +
      '   meaningful oversight and not audit-defensible. Route only uncertain/high-impact/flagged cases, give\n' +
      '   context + explanation + authority, and measure override rate and agreement.\n\n' +
      'Q: What belongs in the audit trail for a consequential decision?\n' +
      '   A: Inputs (or a hash), the model + version + prompt version, the output, the explanation, who or\n' +
      '   what acted, and any override — immutable and retained per policy.\n\n' +
      'Q: You checked fairness before launch. Why keep monitoring it?\n' +
      '   A: Disparity can grow after deployment from population shift and feedback loops. Per-group monitoring\n' +
      '   with an alert (and a fairness SLI + budget) catches it; aggregate accuracy will not.\n\n' +
      'Q: What do you do with successful appeals?\n' +
      '   A: Treat each as a labelled model error — add it to the eval set and the fairness analysis.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3</a> (governance review), <a href="#ch4">Ch 4</a> (attribute data for fairness), <a href="#ch6">Ch 6</a> (compliance / human-oversight duty), ' +
      '<a href="../learn4/#ch17">Part 4 Ch 17</a> (fairness &amp; explainability methods), <a href="../learn8/#ch4">Part 8 Ch 4</a> (fairness SLIs).</p>',
      try: [
        ['📖 ACM — fairness definitions & their trade-offs (Verma & Rubin)', 'https://fairware.cs.umass.edu/papers/Verma.pdf', 'o'],
        ['📖 Partnership on AI — responsible practices', 'https://partnershiponai.org/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What does "responsible AI in production" require beyond a set of principles?',
      opts: [
        'A longer principles document',
        'Running systems: per-group fairness metrics with alerts, decision-level explanations, a contestation/appeal path with an SLA, an immutable audit trail, and a meaningful human-oversight path',
        'A dedicated ethics board and nothing else',
        'A one-time pre-launch fairness check'],
      ok: 1,
      why: 'Principles only matter if they are wired into the platform as metrics, endpoints, logs and workflows that operate on every consequential decision.' },
    { q: 'Why can\'t a team simply "make the model fair" by optimising one fairness metric?',
      opts: [
        'Fairness metrics are illegal',
        'Common fairness definitions (demographic parity, equal opportunity, calibration by group, predictive parity) mathematically conflict — you must choose the ones that match the harm and the law, justify the trade-off, and monitor per group over time',
        'Fairness cannot be measured',
        'Only accuracy matters'],
      ok: 1,
      why: 'There is no single fairness metric; satisfying one often violates another. Responsible practice is an explicit, justified choice plus ongoing per-group monitoring.' },
    { q: 'A high-risk decision system sends 100% of cases to a reviewer who processes 400/hour with no explanation and overrides 0.1% of the time. What is the problem?',
      opts: [
        'The reviewer is too slow',
        'This is nominal, not meaningful, oversight — no time, no context, near-zero overrides makes it a rubber stamp that neither protects users nor satisfies an auditor',
        'There is no problem; a human is in the loop',
        'The model should be removed entirely'],
      ok: 1,
      why: 'Meaningful oversight means routing the cases that need it, giving the reviewer the explanation, context, time and authority to override, and measuring whether they actually do.' }
  ]
};
