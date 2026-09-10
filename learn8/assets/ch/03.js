/* AI-ML Learn — Part 8 · Chapter 3: Golden Signals, RED & USE for Inference */
window.CH[3] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>You could put 200 metrics on a dashboard. Nobody would read it, and at 3am nobody could tell if the service is healthy. The industry converged on a tiny ' +
      'set of signals that answer "is it working?" at a glance.</p>' +
      '<pre><code>THE FOUR GOLDEN SIGNALS (Google SRE)\n' +
      '  LATENCY      how long requests take — split successful vs failed\n' +
      '  TRAFFIC      how much demand — requests/sec (or tokens/sec for LLMs)\n' +
      '  ERRORS       rate of failed requests — by type\n' +
      '  SATURATION   how "full" the system is — GPU util, queue depth, memory\n' +
      'RED  (per service)  Rate, Errors, Duration     — the request-view\n' +
      'USE  (per resource) Utilisation, Saturation, Errors  — the resource-view (CPU, GPU, disk, NIC)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A car dashboard.</b> Not 50 gauges — speed, fuel, engine temp, warning lights. Four things that tell you ' +
      'whether to keep driving or pull over. Golden signals are that for a service; everything else is the diagnostic scan you run <i>after</i> a light comes on.</p></div>',
      try: [
        ['📖 Google SRE Book — Monitoring: the four golden signals', 'https://sre.google/sre-book/monitoring-distributed-systems/#xref_monitoring_golden-signals', 'o'],
        ['📡 Ch 1 — signals vs. observability', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>APPLIED TO AN INFERENCE SERVICE\n' +
      '  LATENCY      p50/p90/p99 of request duration, SUCCESS ONLY (errors are often fast → hide\n' +
      '               real latency). For LLMs also: TTFT (time to first token) and per-token latency.\n' +
      '  TRAFFIC      requests/sec; for LLMs also input tokens/sec + output tokens/sec (cost + load).\n' +
      '  ERRORS       rate by class: 4xx (client), 5xx (server), timeouts, model errors\n' +
      '               (empty/invalid output, guardrail block, tool failure), upstream (retriever/DB).\n' +
      '  SATURATION   GPU utilisation + GPU memory, request queue depth / wait time, batch fill %,\n' +
      '               KV-cache occupancy, connection pool, worker concurrency vs limit.\n' +
      'HISTOGRAMS     record latency as a histogram; compute percentiles at query time. NEVER average\n' +
      '               percentiles across pods/time — it is meaningless.\n' +
      'LABELS         model + version, route, tenant (low-cardinality only), status. High-cardinality\n' +
      '               (user, request id) goes on traces/exemplars, not metric labels.\n' +
      'EXEMPLARS      attach a trace_id to histogram buckets → click a latency spike, land on the slow trace.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The <b>four golden signals</b> (Google SRE), <b>RED</b> (Weaveworks — request-centric) and <b>USE</b> ' +
      '(Brendan Gregg — resource-centric) are the standard methods. Implement with <b>Prometheus histograms</b> + recording rules and a <b>Grafana</b> "service overview" ' +
      'dashboard; expose <b>exemplars</b> to jump metric→trace. Serving runtimes (vLLM, Triton, KServe) already emit most of these. You wire the standard dashboard; the taxonomy is fixed.</p></div>',
      try: [
        ['📖 Weaveworks — the RED method', 'https://www.weave.works/blog/the-red-method-key-metrics-for-microservices-architecture/', 'o'],
        ['📖 Brendan Gregg — the USE method', 'https://www.brendangregg.com/usemethod.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The latency graph that lied.</b> ' +
      'A dashboard shows p99 latency <i>dropping</i> during an incident — looks great, is terrible. Cause: the service started failing fast (timeouts return in 20 ms), ' +
      'and those fast failures dragged the percentile down. Fix: split latency into <b>success-only</b> and <b>error-only</b> series. Now the success p99 spikes (the real story) ' +
      'and the error rate spikes alongside it. Always separate the two.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Saturation is the leading indicator.</b> ' +
      'An LLM service\'s latency and errors are fine, but <b>queue wait time</b> has been creeping up and GPU utilisation sits at 96%. RED alone says "healthy"; ' +
      'the USE/saturation view says "about to tip". An alert on <i>queue depth &gt; N for 5 min</i> pages before the latency SLO breaks, giving time to scale. ' +
      'Latency/errors are lagging; saturation leads.</p></div>' +
      '<p><b>Error taxonomy matters for AI:</b> a 200 response can still be a failure — empty output, invalid JSON, a guardrail refusal on a valid request, a hallucination flag. ' +
      'Count "model errors" as a first-class error class, not just HTTP status.</p>',
      try: [
        ['📖 Prometheus — histograms & quantiles', 'https://prometheus.io/docs/practices/histograms/', 'o'],
        ['📡 Ch 5 — LLM-specific telemetry', '#ch5', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'One latency series for all requests    Split success-only vs error-only; errors are fast and skew\n' +
      '                                       the percentile the wrong way.\n' +
      'avg latency / avg(p99)                 Percentiles from histograms, computed at query time. Never\n' +
      '                                       average a percentile.\n' +
      'Errors = HTTP 5xx only                 Add model errors (empty/invalid output, guardrail block, tool\n' +
      '                                       failure) and upstream errors as classes.\n' +
      'No saturation metrics                  GPU util + memory, queue depth/wait, batch fill, KV-cache,\n' +
      '                                       concurrency-vs-limit. Saturation LEADS latency.\n' +
      'High-cardinality metric labels         tenant is borderline; user/request-id go on traces +\n' +
      '                                       exemplars, not labels.\n' +
      'RED without USE (or vice versa)        RED = request view, USE = resource view. You need both to\n' +
      '                                       tell "users hurt" from "why".\n' +
      'Dashboard with 60 panels               One "service overview": the 4 signals, big, first. Detail\n' +
      '                                       panels below the fold.\n' +
      'No exemplars                            Attach trace_ids to histogram buckets so a spike links to a\n' +
      '                                       real slow trace (Ch 10, Ch 14).</code></pre>' +
      '<p><b>The order to read them:</b> traffic (is demand normal?) → errors (are requests failing?) → latency success-only (are the good ones slow?) → ' +
      'saturation (is a resource full, and which?). That sequence localises almost any incident in under a minute.</p>',
      try: [
        ['📖 Google SRE Workbook — Monitoring', 'https://sre.google/workbook/monitoring/', 'o'],
        ['📡 Ch 11 — alerting on these signals (burn rate)', '#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Name the four golden signals and what each answers.\n' +
      '   A: Latency (how long requests take), Traffic (how much demand), Errors (rate of failures), Saturation\n' +
      '   (how full the system is). Together they answer "is the service healthy" without a wall of graphs.\n\n' +
      'Q: RED vs USE?\n' +
      '   A: RED (Rate, Errors, Duration) is the request/service view — what users experience. USE (Utilisation,\n' +
      '   Saturation, Errors) is the per-resource view — CPU, GPU, disk, NIC. RED tells you users are hurting;\n' +
      '   USE tells you which resource is why.\n\n' +
      'Q: Why split latency into success-only and error-only series?\n' +
      '   A: Errors often return very fast (timeouts, fast rejects). Mixed into one series they pull the\n' +
      '   percentile DOWN during an incident, hiding the real latency spike on successful requests.\n\n' +
      'Q: Your dashboard says latency and errors are fine but something feels wrong. What do you check?\n' +
      '   A: Saturation — GPU utilisation near 100%, growing queue depth / wait time, batch fill, KV-cache\n' +
      '   occupancy. Saturation is a leading indicator; latency and errors lag it.\n\n' +
      'Q: Is a 200 response always a success for an ML service?\n' +
      '   A: No. Empty or invalid output, a guardrail refusal on a valid request, a failed tool call, or a\n' +
      '   hallucination flag are failures. Track "model errors" as a first-class error class alongside HTTP\n' +
      '   status.\n\n' +
      'Q: Why not average percentiles across pods?\n' +
      '   A: Percentiles are not additive. Aggregate from the underlying histograms and compute the percentile\n' +
      '   once over the merged distribution.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch4">Ch 4</a> (turning signals into SLOs), <a href="#ch5">Ch 5</a> (LLM signals), <a href="#ch10">Ch 10</a> (the overview dashboard), ' +
      '<a href="#ch11">Ch 11</a> (alerting), <a href="../learn6/#ch2">Part 6 Ch 2</a> (capacity &amp; saturation math).</p>',
      try: [
        ['📖 Grafana — building a RED-method dashboard', 'https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/', 'o'],
        ['📖 OpenTelemetry — metrics semantic conventions (HTTP server)', 'https://opentelemetry.io/docs/specs/semconv/http/http-metrics/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What are the four golden signals?',
      opts: [
        'CPU, memory, disk, network',
        'Latency, traffic, errors, saturation',
        'Precision, recall, F1, AUC',
        'Requests, responses, retries, rollbacks'],
      ok: 1,
      why: 'Latency, traffic, errors and saturation are the minimal set that answers "is the service healthy" at a glance; everything else is detail you consult after one of these moves.' },
    { q: 'Why should request latency be split into success-only and error-only series?',
      opts: [
        'To use fewer metrics',
        'Errors often return very fast, so mixing them into one latency series pulls the percentile down during an incident and hides the real slowdown on successful requests',
        'Error latency is always higher',
        'It is required by Prometheus'],
      ok: 1,
      why: 'Fast failures (timeouts, fast rejects) distort a combined percentile the wrong way. Separating them makes the success-path p99 spike visible.' },
    { q: 'Latency and error rate look fine but the service feels close to trouble. Which signal is the leading indicator to check?',
      opts: [
        'Number of log lines',
        'Saturation — GPU utilisation, request queue depth / wait time, batch fill, KV-cache occupancy',
        'The size of the container image',
        'The number of dashboard panels'],
      ok: 1,
      why: 'Saturation rises before latency and errors do. Alerting on queue depth or GPU utilisation gives lead time to scale before the SLO breaks.' }
  ]
};
