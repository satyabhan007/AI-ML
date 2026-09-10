/* AI-ML Learn — Part 8 · Chapter 12: AI-Enriched Ops */
window.CH[12] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>The same LLMs you are operating can help you operate: summarise a 4 000-line log dump, cluster similar alerts, draft an incident timeline, suggest likely ' +
      'root causes, explain an unfamiliar stack trace. Used well, this cuts time-to-understanding. Used naively, it produces a confident, wrong RCA that sends the ' +
      'on-call down a rabbit hole.</p>' +
      '<pre><code>WHERE IT HELPS                         WHERE IT MISLEADS\n' +
      '  log/alert summarisation & clustering   inventing a root cause it cannot actually know\n' +
      '  "explain this error / config"          hallucinated commands / config that look plausible\n' +
      '  drafting timelines & postmortems       false confidence, no uncertainty signalled\n' +
      '  surfacing similar past incidents        anchoring the human on the first (wrong) hypothesis\n' +
      '  triage: severity / routing suggestion   acting autonomously on a mistaken diagnosis</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A sharp but overconfident junior engineer.</b> Great at "here is what these 500 log lines are saying" ' +
      'and "here are three things that could cause this". Dangerous if you let them run <code>kubectl delete</code> on their first guess without checking.</p></div>',
      try: [
        ['📗 Part 2: LLM apps — grounding, uncertainty, tool use', '../learn2/#ch5', 'o'],
        ['📡 Ch 16 — incident response the LLM assists', '#ch16', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>GOOD PATTERNS\n' +
      '  grounded, not free-form   feed it the actual logs/metrics/traces/runbook; ask it to cite which\n' +
      '                           line/span supports each statement (RAG over your telemetry).\n' +
      '  summarise + cluster       "what changed", "group these 200 alerts", "top 5 error signatures" —\n' +
      '                           reduction tasks, not divination.\n' +
      '  hypotheses WITH evidence  "possible causes, each with the observation that supports/refutes it"\n' +
      '                           — a checklist for the human, not a verdict.\n' +
      '  read-only by default      it proposes commands; a human runs them. Any write action = explicit\n' +
      '                           approval, audited, reversible (Part 7 Ch 9).\n' +
      '  draft, human edits        timelines, comms, postmortems — a first draft to correct, not to publish.\n' +
      'GUARDRAILS ON THE ASSISTANT ITSELF\n' +
      '  it is a production LLM feature: instrument it (Ch 5), eval it (Ch 7), guardrail it (Ch 9),\n' +
      '  measure whether it actually reduces MTTR vs a control.\n' +
      '  never feed it secrets; redact telemetry (Ch 2); scope its tool access tightly.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>This is <b>AIOps</b> re-tooled with LLMs. Standard building blocks: <b>anomaly detection</b> on ' +
      'metrics (already in Datadog/Dynatrace/New Relic/Grafana), <b>alert correlation/grouping</b>, and <b>LLM assistants</b> grounded on your observability data ' +
      '(<b>PagerDuty AI</b>, <b>Grafana / Datadog / Incident.io assistants</b>, or an in-house RAG over logs+runbooks). The discipline is standard: keep it grounded, ' +
      'read-only, evaluated, and measured against a baseline.</p></div>',
      try: [
        ['📖 Datadog — Watchdog (anomaly detection & RCA)', 'https://docs.datadoghq.com/watchdog/', 'o'],
        ['📖 PagerDuty — AI for incident management', 'https://www.pagerduty.com/platform/aiops/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Summarisation that saved 20 minutes.</b> ' +
      'An incident produces 12 000 log lines across 6 services in 4 minutes. An assistant, given the raw logs + the time window, returns: "3 distinct error signatures; ' +
      '#1 (81%) is a connection-pool-exhausted from service X to the vector DB starting 14:02:10; #2 and #3 are downstream timeouts caused by #1; the vector DB ' +
      'error rate rose at 14:01." Every claim links to log lines. On-call confirms in 2 minutes and goes to the vector DB. The LLM did <b>reduction and correlation</b>, not diagnosis magic.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The confident wrong RCA.</b> ' +
      'An un-grounded assistant is asked "why is latency high?" with no data. It answers, fluently, "likely a memory leak in the model server; restart the pods." ' +
      'On-call restarts pods — no effect — and loses 15 minutes. The actual cause was upstream (a slow retriever). Fixes: never ask for a verdict without the data; ' +
      'require evidence per hypothesis; present <i>multiple</i> possibilities with confidence; and A/B whether the assistant actually lowers MTTR before trusting it.</p></div>' +
      '<p><b>Measure it like any feature:</b> track assistant-assisted vs unassisted MTTR, on-call satisfaction, and how often its top hypothesis was correct. ' +
      'If it is not moving the numbers, it is a toy.</p>',
      try: [
        ['📖 Google SRE — the role of automation & tooling in incidents', 'https://sre.google/workbook/incident-response/', 'o'],
        ['📡 Ch 6 — telemetry the assistant should be grounded on', '#ch6', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Ask for a root cause with no data      Ground it: feed the actual logs/metrics/traces/runbook; it\n' +
      '                                       cites evidence per claim, or it does not claim.\n' +
      'Single confident verdict               Multiple hypotheses, each with supporting/refuting evidence\n' +
      '                                       and a confidence — a checklist, not a decision.\n' +
      'Assistant runs remediation autonomously   Read-only by default; proposes commands; human approves\n' +
      '                                       write actions; audited + reversible.\n' +
      'Anchoring on its first guess           Treat its output as one input; the on-call still forms and\n' +
      '                                       tests their own hypothesis.\n' +
      'Not instrumented / not evaluated        It is a prod LLM feature: instrument (Ch 5), eval (Ch 7),\n' +
      '                                       guardrail (Ch 9), and A/B it against no-assistant MTTR.\n' +
      'Feeding it secrets / raw PII            Redact telemetry before it goes in; scope tool access; the\n' +
      '                                       assistant is inside the trust boundary.\n' +
      'Auto-published postmortem               It drafts; humans review and own the analysis and actions.\n' +
      'Replacing on-call judgement            It accelerates understanding; humans still decide and act.</code></pre>' +
      '<p><b>The value is speed of comprehension, not autonomy.</b> Reduction (summarise 10k lines), correlation (group 200 alerts), retrieval (find the similar 2021 ' +
      'incident), and drafting are where LLMs reliably help ops. Autonomous diagnosis and action are where they burn you.</p>',
      try: [
        ['📖 Incident.io / Grafana — AI assistants for incidents', 'https://grafana.com/docs/grafana-cloud/alerting-and-irm/irm/', 'o'],
        ['📗 Part 2: RAG grounding & citations', '../learn2/#ch5', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Where do LLMs reliably help in ops, and where do they mislead?\n' +
      '   A: Help: summarising large log/trace dumps, clustering alerts, retrieving similar past incidents,\n' +
      '   explaining errors/config, drafting timelines and postmortems — reduction, correlation, retrieval.\n' +
      '   Mislead: inventing a root cause they cannot know, hallucinating plausible commands, projecting false\n' +
      '   confidence, anchoring the human on a wrong first hypothesis.\n\n' +
      'Q: How do you use an LLM assistant safely during an incident?\n' +
      '   A: Ground it on the actual telemetry + runbook and require evidence per statement; ask for multiple\n' +
      '   hypotheses with confidence, not a verdict; keep it read-only (it proposes, a human approves write\n' +
      '   actions); use its output as one input, not the decision.\n\n' +
      'Q: An un-grounded assistant confidently said "memory leak, restart pods" and it was wrong. What went\n' +
      '   wrong?\n' +
      '   A: It was asked for a diagnosis with no data, gave a single fluent verdict with no uncertainty, and\n' +
      '   the on-call acted on it (anchoring). Fixes: never ask without data, require evidence, present\n' +
      '   alternatives + confidence, and validate it lowers MTTR before trusting it.\n\n' +
      'Q: The ops assistant is itself a production LLM feature. What does that imply?\n' +
      '   A: Instrument it (tokens/cost/latency), evaluate its output quality, guardrail it, redact secrets/PII\n' +
      '   from what it ingests, scope its tools tightly, and A/B its impact on MTTR against a no-assistant\n' +
      "   baseline.\n\n" +
      'Q: How do you know the assistant is actually worth having?\n' +
      '   A: Measure assisted vs unassisted MTTR, how often its top hypothesis was correct, and on-call\n' +
      '   satisfaction. If the numbers do not move, it is a toy.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch6">Ch 6</a> (traces to ground on), <a href="#ch16">Ch 16</a> (incident response), <a href="../learn7/#ch9">Part 7 Ch 9</a> (never auto-remediate blindly), ' +
      '<a href="../learn2/#ch5">Part 2 Ch 5</a> (RAG grounding), <a href="../learn9/#ch5">Part 9 Ch 5</a> (assistant inside the trust boundary).</p>',
      try: [
        ['📖 Atlassian — AI in incident management', 'https://www.atlassian.com/incident-management', 'o'],
        ['📖 Gartner / industry — AIOps concepts', 'https://www.ibm.com/topics/aiops', 'o']
      ] }
  ],

  quiz: [
    { q: 'Which ops tasks do LLMs reliably help with?',
      opts: [
        'Autonomously diagnosing root cause and running the fix',
        'Reduction and correlation — summarising large log/trace dumps, clustering alerts, retrieving similar past incidents, explaining errors, drafting timelines',
        'Replacing the on-call engineer entirely',
        'Deciding whether to roll back without human review'],
      ok: 1,
      why: 'LLMs are strong at compressing and connecting large amounts of text and retrieving prior context. Autonomous diagnosis and remediation are where they produce confident, wrong actions.' },
    { q: 'How should an LLM incident assistant be constrained?',
      opts: [
        'Give it full cluster admin so it can fix things fast',
        'Ground it on actual telemetry + runbook with evidence required per claim, have it present multiple hypotheses with confidence, and keep it read-only (it proposes, a human approves any write action)',
        'Let it publish the postmortem directly',
        'Ask it for a single root cause with no data attached'],
      ok: 1,
      why: 'Grounding, evidence, alternatives-with-confidence, and human-in-the-loop for actions keep it an accelerator rather than a source of confident misdirection.' },
    { q: 'The ops assistant is itself an LLM feature in production. What follows?',
      opts: [
        'It is exempt from monitoring because it is internal',
        'It must be instrumented, evaluated, guardrailed, fed only redacted data, scoped in its tool access, and A/B-tested for actual MTTR improvement against a no-assistant baseline',
        'It only needs a dashboard',
        'It should never be measured to avoid bias'],
      ok: 1,
      why: 'An internal LLM assistant carries the same observability, evaluation, safety and data-handling requirements as any production model — plus proof that it moves the metric it exists to move.' }
  ]
};
