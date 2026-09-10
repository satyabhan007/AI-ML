/* AI-ML Learn — Part 8 · Chapter 4: SLIs, SLOs & Error Budgets */
window.CH[4] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>"The service should be reliable" is not actionable. Reliability engineering turns it into three linked things:</p>' +
      '<pre><code>SLI  a measured indicator of user-experienced health   "% of requests served < 500 ms and 2xx"\n' +
      'SLO  the target for that SLI over a window            "99.5% over rolling 28 days"\n' +
      'ERROR BUDGET  1 − SLO = the failure you are ALLOWED   0.5% of 28 days ≈ 3h 22m of "bad"\n' +
      '                                                       to spend on risky changes, on purpose</code></pre>' +
      '<p>The error budget reframes reliability: you are not trying for zero failures (impossible, and infinitely expensive) — you have a budget, and you spend it deliberately on shipping.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A monthly entertainment budget.</b> You do not aim to spend $0 (that is not living) or ignore the limit ' +
      '(that is debt). You have an amount, you spend it on nights out you choose, and when it is gone you stay in until next month. The error budget is that, for risk.</p></div>',
      try: [
        ['📖 Google SRE Workbook — Implementing SLOs', 'https://sre.google/workbook/implementing-slos/', 'o'],
        ['📡 Ch 3 — the signals SLIs are built from', '#ch3', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>PICK SLIs FROM THE USER\'S VIEW\n' +
      '  availability   good_requests / valid_requests   (define "good": 2xx AND not a model error)\n' +
      '  latency        fraction of requests under a threshold (a RATIO, not a percentile value —\n' +
      '                 easier to combine into a budget). For LLMs: TTFT under X.\n' +
      '  quality        fraction of responses passing an online quality check (Ch 7) / groundedness bar.\n' +
      '  freshness      for batch/recsys: fraction served with data < N minutes old.\n' +
      'SET THE SLO       just below sustainable best-case; must survive a BAD day. Different SLOs per\n' +
      '                 tier (interactive vs batch, paid vs free).\n' +
      'WINDOW           rolling (e.g. 28d) for the budget; calendar for reporting.\n' +
      'ERROR BUDGET     1 − SLO over the window. Track BUDGET REMAINING and BURN RATE (how fast you are\n' +
      '                 spending vs the sustainable pace).\n' +
      'BUDGET POLICY     agreed in advance: budget healthy → ship freely; budget low/exhausted → freeze\n' +
      '                 feature launches, redirect to reliability, require sign-off for risky changes.\n' +
      'SLA vs SLO        SLA is the customer contract + penalty; set the SLO STRICTER so you fix things\n' +
      '                 before the SLA is at risk.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>This is the <b>Google SRE</b> SLO framework, now widely codified: <b>OpenSLO</b> spec, <b>Sloth</b> ' +
      '(generates Prometheus SLO + multi-window burn-rate rules), <b>Pyrra</b>, <b>Nobl9</b>, and native SLO features in Grafana/Datadog. The <b>error-budget policy</b> ' +
      '(what happens when it runs out) is part of the standard. You author SLIs/SLOs; the rule generation and burn-rate math are tooled.</p></div>',
      try: [
        ['📖 OpenSLO — the SLO specification', 'https://github.com/OpenSLO/OpenSLO', 'o'],
        ['📖 Sloth — Prometheus SLO generator', 'https://sloth.dev/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The SLO nobody believes.</b> ' +
      'A team sets availability at 99.99% because "four nines sounds serious". The service actually sustains ~99.7% on a good week, so the SLO is breached most months, ' +
      'the budget is always negative, and everyone ignores it. Fix: set the SLO from <b>measured</b> behaviour on a <i>bad</i> week (say 99.5%), commit to defending it, ' +
      'and only tighten it after you have earned the headroom. An SLO you meet 3 weeks in 4 is worse than none.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Spending the budget on purpose.</b> ' +
      'A risky model migration (Part 7 Ch 12) is planned. The team checks: error budget is 80% remaining with 3 weeks left in the window — enough to absorb a bad ' +
      'canary. They proceed, watching burn rate; a mid-rollout spike consumes 15% of the budget, still within tolerance, and they continue. Two months later the budget ' +
      'is at 5% and a similar migration is <b>deferred</b> per the policy until it recovers. Same decision, opposite answer — driven by the budget, not by vibes.</p></div>' +
      '<p><b>Quality SLOs for AI:</b> alongside latency/availability, define an SLI like "≥ 97% of sampled responses pass the groundedness check" (Ch 7) with its own budget — ' +
      'so a quality regression burns a budget and triggers the same freeze policy as an outage.</p>',
      try: [
        ['📖 Google SRE Workbook — Error budget policy', 'https://sre.google/workbook/error-budget-policy/', 'o'],
        ['📡 Ch 7 — online quality metrics feeding a quality SLO', '#ch7', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'SLO = aspirational "four nines"        SLO from measured bad-day behaviour; tighten only after\n' +
      '                                       earning headroom. A perpetually-breached SLO is ignored.\n' +
      'SLI measured server-side only          Measure as close to the user as possible (edge / client),\n' +
      '                                       incl. failures that never reached your server.\n' +
      'Latency SLI = "p99 < 500 ms"            Make it a ratio: "fraction of requests < 500 ms". Ratios\n' +
      '                                       compose into a budget; a percentile value does not.\n' +
      '"good" = HTTP 2xx                       Exclude model errors, guardrail refusals on valid input,\n' +
      '                                       empty/invalid output.\n' +
      'One SLO for all traffic                Per tier: interactive vs batch, paid vs free, per critical\n' +
      '                                       journey.\n' +
      'No error-budget policy                 Agree in advance what a low/empty budget triggers (freeze,\n' +
      '                                       reliability focus, sign-off). Otherwise the budget is decoration.\n' +
      'Track only budget remaining            Also track BURN RATE — a fast burn needs action now even if\n' +
      '                                       lots of budget remains.\n' +
      'No quality SLO for an AI product        Add a groundedness / online-quality SLI + budget so quality\n' +
      '                                       regressions get the same treatment as outages.</code></pre>' +
      '<p><b>The point of the budget is the conversation it forces:</b> "we can ship this risky thing" vs "we must slow down" becomes a data-driven, pre-agreed decision ' +
      'instead of a fight between product and ops.</p>',
      try: [
        ['📖 Google SRE Book — Service Level Objectives', 'https://sre.google/sre-book/service-level-objectives/', 'o'],
        ['📖 Pyrra — SLOs for Prometheus', 'https://github.com/pyrra-dev/pyrra', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Define SLI, SLO, and error budget.\n' +
      '   A: SLI: a measured indicator of user-experienced health (e.g. fraction of requests fast + successful).\n' +
      '   SLO: the target for that SLI over a window (e.g. 99.5% over 28 days). Error budget: 1 − SLO — the\n' +
      '   amount of failure you are allowed, to spend deliberately on risky changes.\n\n' +
      'Q: How do you choose the SLO value?\n' +
      '   A: From measured behaviour on a bad day, set just below what you can sustain and defend. An SLO you\n' +
      '   breach most months trains everyone to ignore it; tighten only after earning headroom.\n\n' +
      'Q: Why express a latency SLI as a ratio ("fraction < 500 ms") rather than a percentile value ("p99 <\n' +
      '   500 ms")?\n' +
      '   A: Ratios of good/total compose cleanly into an error budget and burn rate. A percentile value is a\n' +
      '   single number that does not aggregate or budget.\n\n' +
      'Q: What is an error-budget policy and why does it matter?\n' +
      '   A: A pre-agreed rule for what a low or exhausted budget triggers — freeze feature launches, redirect\n' +
      '   effort to reliability, require sign-off for risky changes. Without it the budget is just a number.\n\n' +
      'Q: Budget is 80% remaining but burning fast. Ship the risky change?\n' +
      '   A: Burn rate matters as much as remaining budget. A fast burn means investigate/mitigate now; adding\n' +
      '   risk on top is usually wrong even with budget left.\n\n' +
      'Q: Does an AI product need SLOs beyond latency and availability?\n' +
      '   A: Yes — a quality SLI (e.g. ≥97% of sampled responses pass a groundedness check) with its own\n' +
      '   budget, so a quality regression triggers the same freeze/response as an outage.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3</a> (signals), <a href="#ch11">Ch 11</a> (burn-rate alerting), <a href="#ch7">Ch 7</a> (quality SLIs), ' +
      '<a href="../learn6/#ch2">Part 6 Ch 2</a> (capacity for the SLO), <a href="../learn7/#ch9">Part 7 Ch 9</a> (budget as a rollback trigger).</p>',
      try: [
        ['📖 Google SRE Workbook — Alerting on SLOs', 'https://sre.google/workbook/alerting-on-slos/', 'o'],
        ['📖 Nobl9 / SLO best practices', 'https://www.nobl9.com/resources/slo-best-practices', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is an error budget?',
      opts: [
        'The money allocated to fix bugs',
        '1 − SLO over the window — the amount of failure you are allowed, to be spent deliberately on risky changes and maintenance',
        'The maximum number of open incidents',
        'The CPU reserved for error handling'],
      ok: 1,
      why: 'The budget reframes reliability: not zero failures, but a bounded, deliberate allowance. When it is healthy you ship; when it is spent, policy slows you down.' },
    { q: 'Why set an SLO from measured bad-day behaviour rather than an aspirational number like 99.99%?',
      opts: [
        'Lower numbers are always better',
        'An SLO you breach most months is ignored by everyone; it must be a level you can sustain and defend on a bad day, tightened only after earning headroom',
        '99.99% is illegal',
        'Aspirational SLOs cost more to compute'],
      ok: 1,
      why: 'A perpetually-negative error budget makes the whole framework meaningless. Credible SLOs are grounded in observed behaviour and are actually defended.' },
    { q: 'Your error budget is 80% remaining but burning unusually fast. What does that imply?',
      opts: [
        'Everything is fine — plenty of budget left',
        'Burn rate matters independently: a fast burn calls for investigation/mitigation now, and adding a risky change on top is usually the wrong call',
        'You should immediately tighten the SLO',
        'Burn rate is irrelevant if budget remains'],
      ok: 1,
      why: 'Remaining budget is a stock; burn rate is the flow. A rapid burn means something is wrong right now, regardless of how much budget is left.' }
  ]
};
