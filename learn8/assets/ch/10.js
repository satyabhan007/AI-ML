/* AI-ML Learn — Part 8 · Chapter 10: Dashboards That Get Read */
window.CH[10] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>A dashboard with 60 panels is a graveyard: nobody looks at it, and in an incident nobody can find the one graph that matters. A dashboard that gets read ' +
      'answers one question at a glance — <b>"is this service healthy, and if not, where do I look next?"</b> — and gets out of the way.</p>' +
      '<pre><code>THE LAYERS\n' +
      '  1  overview   4 golden signals, big, above the fold. Green/amber/red at a glance.\n' +
      '  2  breakdowns  the same signals sliced by model version, tenant, route, region.\n' +
      '  3  drill-in    per-dependency panels, LLM telemetry, saturation detail — below the fold.\n' +
      '  4  exemplars   every latency/error panel links to a real trace for that spike.</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A hospital chart at the foot of the bed.</b> Not the full medical history — vitals, trend arrows, ' +
      'and "see attending if X". Anyone walking in gets the state in three seconds and knows whether to act. Deep records exist, but not on that page.</p></div>',
      try: [
        ['📖 Grafana — dashboard best practices', 'https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/', 'o'],
        ['📡 Ch 3 — the golden signals the overview shows', '#ch3', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>OVERVIEW ROW      request rate · error rate (by class) · latency success-only p50/p95/p99 ·\n' +
      '                 saturation (GPU util, queue). For LLM: + TTFT, tokens/s, cost/req, cache-hit.\n' +
      'SLO ROW          SLI vs target · error budget remaining · burn rate (multi-window). (Ch 4, Ch 11)\n' +
      'QUALITY ROW      online quality score, groundedness-failure rate, refusal rate, drift indicator.\n' +
      'BREAKDOWNS       template variables: $model_version, $tenant, $route, $region — one dashboard,\n' +
      '                 many cuts. Top-N tables for "worst tenant / route by p99".\n' +
      'EXEMPLARS        histogram panels show trace_id dots → click → open the trace (Ch 6).\n' +
      'ANNOTATIONS      deploys, model promotions, incidents overlaid on the timeline → "it changed at\n' +
      '                 the deploy" is instant.\n' +
      'AUDIENCES        an exec view (SLO + cost + trend) and an engineer view (signals + drill-in);\n' +
      '                 do not force one dashboard to serve both.\n' +
      'AS CODE          dashboards in git (Grafana JSON / Terraform / Grafonnet), reviewed, templated,\n' +
      '                 generated per service from a standard template.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard: <b>Grafana</b> dashboards defined <b>as code</b> (JSON model, Terraform provider, ' +
      'Grafonnet, or <b>Perses</b>), one <b>service-overview template</b> generated per service (RED/USE + SLO + LLM rows), <b>exemplars</b> wired metric→trace, and ' +
      '<b>annotations</b> from the deploy pipeline. Mixin libraries (kube-prometheus, per-runtime dashboards) give you most panels. You compose from the template; the layout conventions are established.</p></div>',
      try: [
        ['📖 Grafana — exemplars', 'https://grafana.com/docs/grafana/latest/fundamentals/exemplars/', 'o'],
        ['📖 Grafana — provisioning dashboards as code', 'https://grafana.com/docs/grafana/latest/administration/provisioning/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The 3am dashboard test.</b> ' +
      'A burn-rate alert pages a new on-call engineer. They open the service dashboard. Within 15 seconds: request rate normal, <b>error rate red</b> (spike in ' +
      '"model errors" class), latency success-only fine, saturation fine. They click an exemplar on the error panel → a trace showing the <b>retriever</b> span erroring → ' +
      'the retriever dashboard (linked) shows a dependency outage. Total time to "it is the vector DB, not us": under two minutes. That is a dashboard that got read.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The aggregate that hid the incident.</b> ' +
      'Overall p99 looks fine. But the <b>$tenant</b> breakdown + a "worst tenants by p99" top-N table shows one enterprise customer at p99 = 6 s — they send 20k-token ' +
      'contexts that blow the model timeout. The aggregate drowned them (they are 0.5% of traffic). Per-tenant and per-route cuts, as template variables on the same ' +
      'dashboard, surface cohort problems the overview cannot.</p></div>' +
      '<p><b>Annotate deploys.</b> With model-promotion and deploy events overlaid on every panel, "the p99 stepped up exactly at 14:03, which is when v43 went to 50%" ' +
      'is a glance, not an investigation.</p>',
      try: [
        ['📖 Grafana — templating with variables', 'https://grafana.com/docs/grafana/latest/dashboards/variables/', 'o'],
        ['📡 Ch 11 — alerts link to the right dashboard panel', '#ch11', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      '60-panel wall                          One overview screen: 4 signals + SLO + quality, big, first.\n' +
      '                                       Detail below the fold or on linked dashboards.\n' +
      'Aggregate only                          Template vars ($model_version/$tenant/$route/$region) +\n' +
      '                                       top-N "worst by p99/error" tables.\n' +
      'No exemplars                            Wire histogram panels to trace_ids; a spike must be one click\n' +
      '                                       from the offending trace.\n' +
      'No deploy annotations                   Overlay deploys + model promotions + incidents on the\n' +
      '                                       timeline from the CD pipeline.\n' +
      'One dashboard for execs and engineers    Separate views: SLO/cost/trend vs signals/drill-in.\n' +
      'Hand-built per service                   Generate from a standard template; dashboards as code in\n' +
      '                                       git, reviewed.\n' +
      'Latency shown as average                Success-only percentiles from histograms.\n' +
      'Panels with no threshold / units         Every panel: units, a threshold line, and a title that says\n' +
      '                                       what "bad" looks like.\n' +
      'Stale dashboard after the service changed   Owned, reviewed on change, linked from the runbook\n' +
      '                                       (Part 7 Ch 16).</code></pre>' +
      '<p><b>The test:</b> hand the dashboard to someone who has never seen the service. Can they say, in 15 seconds, whether it is healthy — and if not, which panel to ' +
      'click next? If not, it has too much or the wrong thing on top.</p>',
      try: [
        ['📖 Google SRE Workbook — Monitoring (dashboards & consoles)', 'https://sre.google/workbook/monitoring/', 'o'],
        ['📖 Perses — open dashboards as code', 'https://perses.dev/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What goes on the top row of a service dashboard, and why?\n' +
      '   A: The four golden signals — request rate, error rate (by class), success-only latency percentiles,\n' +
      '   saturation — big and above the fold, so anyone can judge health in seconds. For an LLM service, add\n' +
      '   TTFT, tokens/s, cost/req and cache-hit.\n\n' +
      'Q: An aggregate p99 looks fine but a customer is complaining. How does the dashboard help?\n' +
      '   A: Template variables ($tenant/$route/$region) and a "worst-by-p99" top-N table surface the cohort —\n' +
      '   a small-volume enterprise tenant sending huge contexts is drowned in the aggregate but obvious in\n' +
      "   the breakdown.\n\n" +
      'Q: What is an exemplar on a dashboard and why does it matter?\n' +
      '   A: A trace_id attached to a histogram bucket. Clicking a latency/error spike opens the exact slow or\n' +
      '   failed trace — it closes the gap from "something is wrong" to "this request, this span".\n\n' +
      'Q: Why annotate deploys and model promotions on every panel?\n' +
      '   A: So "the metric stepped at exactly the time v43 went to 50%" is a glance rather than an\n' +
      '   investigation.\n\n' +
      'Q: One dashboard for execs and engineers — good idea?\n' +
      '   A: No. Execs want SLO attainment, cost, and trend; engineers want the signals and drill-in. Separate\n' +
      '   views; a single dashboard serving both serves neither.\n\n' +
      'Q: What is the acceptance test for a dashboard?\n' +
      '   A: Someone who has never seen the service can say in ~15 seconds whether it is healthy and, if not,\n' +
      '   which panel to click next.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3</a> (signals), <a href="#ch4">Ch 4</a> (SLO row), <a href="#ch5">Ch 5</a> (LLM row), <a href="#ch6">Ch 6</a> (exemplars→traces), ' +
      '<a href="#ch11">Ch 11</a> (alerts→dashboard), <a href="../learn7/#ch16">Part 7 Ch 16</a> (runbook links).</p>',
      try: [
        ['📖 Grafana — Grafonnet (dashboards as Jsonnet)', 'https://grafana.github.io/grafonnet/', 'o'],
        ['📖 kube-prometheus — dashboard mixins', 'https://github.com/prometheus-operator/kube-prometheus', 'o']
      ] }
  ],

  quiz: [
    { q: 'What belongs on the top (above-the-fold) row of a service dashboard?',
      opts: [
        'Every metric the service emits',
        'The four golden signals — request rate, error rate by class, success-only latency percentiles, saturation — big enough to judge health at a glance',
        'A list of recent git commits',
        'The full trace of the last request'],
      ok: 1,
      why: 'A dashboard that gets read answers "is it healthy, and where next?" instantly. That means the four signals first; detail goes below the fold or on linked dashboards.' },
    { q: 'Aggregate p99 looks healthy but one customer reports timeouts. Which dashboard feature surfaces this?',
      opts: [
        'A bigger time range',
        'Per-tenant/route/region template variables plus a "worst-by-p99" top-N table — a low-volume cohort with bad latency is invisible in the aggregate',
        'More decimal places on the average',
        'Disabling percentiles'],
      ok: 1,
      why: 'Cohort problems hide in aggregates. Breakdowns and top-N tables on the same dashboard make the affected segment obvious.' },
    { q: 'What is the practical test of whether a dashboard is well-designed?',
      opts: [
        'It has more than 40 panels',
        'Someone who has never seen the service can tell in ~15 seconds whether it is healthy and, if not, which panel to click next',
        'It uses every Grafana panel type',
        'It only shows data from the last hour'],
      ok: 1,
      why: 'Dashboards exist for fast judgement, especially during incidents. If a newcomer cannot orient in seconds, the layout is wrong.' }
  ]
};
