/* AI-ML Learn — Part 8 · Chapter 1: Observability 101 */
window.CH[1] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p><b>Monitoring</b> answers questions you thought of in advance: "is CPU high?", "is the error rate above 1%?". ' +
      '<b>Observability</b> is the property that lets you answer questions you did <i>not</i> think of in advance — ' +
      '"why is <i>this one tenant\'s</i> p99 bad only for requests that hit the reranker?" — without shipping new code.</p>' +
      '<p>You get there with three (really four) kinds of signal:</p>' +
      '<pre><code>LOGS      timestamped events / messages   "what happened, in detail, here"\n' +
      'METRICS   numbers aggregated over time    "how much / how many / how fast", cheap, great for alerts\n' +
      'TRACES    one request\'s path across        "where did the 900 ms go", span by span\n' +
      '          services, as a tree of spans\n' +
      'PROFILES  where CPU/GPU/memory goes         "which function / kernel is hot", flame graphs</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A hospital.</b> Metrics are the vital-signs monitor (heart rate, BP — a number, always on, beeps on threshold). Logs are the nurse\'s written notes. A trace is following <i>one patient</i> through admissions → X-ray → ward → discharge and timestamping each stop. Profiles are the detailed scan that shows which organ is the problem.</p></div>',
      try: [
        ['📖 Google SRE Book — Monitoring Distributed Systems', 'https://sre.google/sre-book/monitoring-distributed-systems/', 'o'],
        ['📕 Part 4: production monitoring & drift', '../learn4/#ch15', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>The three signals are correlated by shared IDs so you can pivot between them:</p>' +
      '<pre><code>a request gets a trace_id (and span_ids)\n' +
      '  -> logs for that request carry the same trace_id      (jump: metric spike -> logs)\n' +
      '  -> a metric can attach an "exemplar" = a trace_id     (jump: dashboard point -> the exact slow trace)\n' +
      '  -> the trace shows which span was slow / errored       (jump: span -> that service\'s logs)</code></pre>' +
      '<p>Instrument once, at the edges that matter: inbound handler, outbound calls (DB, vector store, model backend), and any queue hop. ' +
      'Prefer <b>structured</b> logs (JSON, key=value) over prose so they are queryable.</p>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The vendor-neutral standard is <b>OpenTelemetry (OTel)</b>: one set of SDKs + the ' +
      '<b>OTel Collector</b> emitting <b>OTLP</b>, so you are not locked to a backend. The common open reference stack: ' +
      '<b>Prometheus</b> (metrics), <b>Loki</b> (logs), <b>Tempo</b> or <b>Jaeger</b> (traces), <b>Pyroscope</b> (profiles), all viewed in <b>Grafana</b>. ' +
      'Managed equivalents (Datadog, Honeycomb, Grafana Cloud, cloud-native APM) speak the same concepts. You adopt OTel — you do not write your own agent or wire format.</p></div>',
      try: [
        ['📖 OpenTelemetry — observability primer', 'https://opentelemetry.io/docs/concepts/observability-primer/', 'o'],
        ['📖 OpenTelemetry — signals (traces, metrics, logs)', 'https://opentelemetry.io/docs/concepts/signals/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>"The API is slow" with only metrics.</b> ' +
      'A dashboard shows p99 latency doubled at 14:00. Metrics alone cannot say <i>why</i> — is it the DB, the vector search, the model, GC? ' +
      'With traces, you open a slow exemplar from that spike and see 780 ms of an 900 ms request sitting in the <code>embed()</code> span — ' +
      'the embedding service is the culprit. With only monitoring you would still be guessing (or adding <code>print</code> statements and redeploying).</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>One tenant, one code path.</b> ' +
      'Support says customer <code>acme</code> sees timeouts, but overall error rate is fine. Because logs and spans carry ' +
      '<code>tenant_id</code> and <code>route</code> as attributes, you filter traces to <code>tenant=acme AND route=/v2/answer</code> and find their ' +
      'requests pull 30k-token contexts that blow the model timeout. That question was never pre-aggregated into a metric — ' +
      'high-cardinality attributes on traces/logs are what made it answerable without a deploy.</p></div>' +
      '<p><b>Rule of thumb:</b> metrics for "is something wrong and how bad" (alerting, SLOs, capacity), traces for "where and why" ' +
      '(one request end-to-end), logs for "exact detail at the point of failure", profiles for "which line/kernel".</p>',
      try: [
        ['📖 Honeycomb — observability vs monitoring', 'https://www.honeycomb.io/blog/observability-101-terminology-and-concepts', 'o'],
        ['📡 Ch 6 — tracing an LLM / agent request', '#ch6', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                           FIX\n' +
      'Log everything at INFO, unstructured   Structured (JSON) logs, sane levels, sample the chatty ones.\n' +
      '                                       Logs are the most expensive signal per byte.\n' +
      'High-cardinality labels on METRICS      Cardinality kills Prometheus. Put user_id / request_id / prompt\n' +
      '  (user_id, prompt hash, ...)           on traces & logs (or exemplars), not on metric labels.\n' +
      'Averages and "avg of p95"               Never average percentiles across instances/time. Aggregate from\n' +
      '                                       histograms; report p50/p90/p99 and max.\n' +
      'Trace 100% of requests forever          Head- or tail-based sampling. Keep all errors + slow traces,\n' +
      '                                       sample the boring successes.\n' +
      'Dashboards with 60 panels               Start from golden signals; one screen answers "is it healthy".\n' +
      'Alert on causes (CPU 90%)               Alert on symptoms users feel (latency/error SLO burn). CPU 90%\n' +
      '                                       with healthy latency is not an incident.\n' +
      'Three tools that do not share IDs       Propagate one trace_id everywhere so you can pivot signal->signal.</code></pre>' +
      '<p><b>Cost reality:</b> observability data often costs more than the service it watches. Budget it: sample traces, ' +
      'cap log volume, keep metrics low-cardinality, set retention per signal (metrics long, traces/logs short).</p>',
      try: [
        ['📖 Prometheus — naming & cardinality warnings', 'https://prometheus.io/docs/practices/naming/', 'o'],
        ['📖 OTel — sampling', 'https://opentelemetry.io/docs/concepts/sampling/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Difference between monitoring and observability?\n' +
      'A: Monitoring = predefined checks on known failure modes (thresholds, dashboards, alerts). Observability =\n' +
      '   the system emits enough high-quality, correlated data (metrics + traces + logs, sharing IDs) that you\n' +
      '   can answer NEW questions about novel failures without shipping code. Monitoring is a subset/outcome.\n\n' +
      'Q: When do you reach for a trace instead of a metric?\n' +
      'A: When you need to know WHERE time or errors happen within a single request across services — a metric\n' +
      '   tells you p99 is bad, a trace shows the 780 ms was in the embedding call. Metrics = aggregate health;\n' +
      '   traces = per-request causality.\n\n' +
      'Q: Why not put user_id on a Prometheus metric label?\n' +
      'A: Cardinality. Each label-value combination is a separate time series; millions of users -> millions of\n' +
      '   series -> the TSDB falls over. Per-user detail belongs on traces/logs, or as an exemplar linking the\n' +
      '   metric to a sample trace.\n\n' +
      'Q: What is an exemplar?\n' +
      'A: A trace_id (and sometimes attributes) attached to a specific metric sample — usually a histogram bucket.\n' +
      '   It lets you click a latency spike on a dashboard and jump straight to an actual slow trace from that\n' +
      '   moment, closing the metric->trace gap.\n\n' +
      'Q: Your observability bill is higher than your compute bill. What do you cut first, without going blind?\n' +
      'A: Logs (highest $/byte): structure them, drop debug in prod, sample high-volume lines. Then trace\n' +
      '   sampling: keep 100% of errors and slow requests, sample the rest. Keep metrics (cheap, drive SLOs)\n' +
      '   but audit label cardinality. Tune retention per signal.\n\n' +
      'Q: What are the four golden signals?\n' +
      'A: Latency, traffic, errors, saturation. First dashboard, first alerts — everything else is detail.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3 — Golden signals, RED &amp; USE</a> puts these into the first dashboard, and ' +
      '<a href="#ch5">Ch 5 — LLM-specific telemetry</a> adds the signals classic APM misses. ' +
      '<a href="../learn7/#ch5">Part 7 Ch 5</a> uses these metrics to drive automated rollbacks.</p>',
      try: [
        ['📖 Google SRE Workbook — implementing SLOs', 'https://sre.google/workbook/implementing-slos/', 'o'],
        ['📖 OpenTelemetry — GenAI semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', 'o']
      ] }
  ],

  quiz: [
    { q: 'Which statement best captures the difference between monitoring and observability?',
      opts: [
        'They are synonyms',
        'Monitoring checks predefined failure modes; observability is emitting enough correlated data to answer new questions about novel failures without shipping code',
        'Observability is only for logs; monitoring is only for metrics',
        'Monitoring is for prod, observability is for staging'],
      ok: 1,
      why: 'Monitoring is threshold checks on known problems. Observability is a property of the system — rich, correlated signals that let you debug failures you never anticipated.' },
    { q: 'You want to know WHERE the latency went inside one slow request that crossed five services. Which signal?',
      opts: [
        'A counter metric',
        'A distributed trace — a tree of timed spans for that single request across services',
        'The CPU saturation gauge',
        'A log line that says "slow"'],
      ok: 1,
      why: 'Metrics give aggregate health; a trace breaks one request into spans so you can see which hop consumed the time.' },
    { q: 'Why is putting user_id as a Prometheus metric label a bad idea?',
      opts: [
        'Prometheus cannot store strings',
        'Cardinality explosion — every distinct label value is a new time series, so millions of users create millions of series and overwhelm the TSDB',
        'It is a security violation',
        'Labels are not allowed on metrics at all'],
      ok: 1,
      why: 'High-cardinality dimensions belong on traces and logs (or as exemplars). Metric labels must stay low-cardinality or the time-series database collapses.' }
  ]
};
