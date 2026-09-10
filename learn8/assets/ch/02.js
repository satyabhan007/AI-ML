/* AI-ML Learn — Part 8 · Chapter 2: The Standards — OpenTelemetry & the Stack */
window.CH[2] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>If every service emits telemetry in its own format to its own backend, you cannot correlate anything and you are locked to whatever vendor you started with. ' +
      'The industry solved this with <b>OpenTelemetry (OTel)</b>: one vendor-neutral way to produce traces, metrics, and logs, and one wire format to ship them anywhere.</p>' +
      '<pre><code>your code → OTel SDK → OTLP (the wire format) → OTel Collector → any backend(s)\n' +
      '  (instrument once)                              (route, filter, batch)   (Prometheus / Grafana /\n' +
      '                                                                          Datadog / Jaeger / ...)</code></pre>' +
      '<p>Adopt OTel and switching or adding a backend is a Collector config change, not a re-instrumentation project.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>USB-C for telemetry.</b> Before, every device had its own charger (proprietary agent + format). ' +
      'OTel is the standard plug: instrument your app once, and any monitoring "charger" on the other end just works.</p></div>',
      try: [
        ['📖 OpenTelemetry — mission & overview', 'https://opentelemetry.io/docs/what-is-opentelemetry/', 'o'],
        ['📡 Ch 1 — the four signals', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>OTel COMPONENTS\n' +
      '  API + SDK      instrument code: spans, metrics (counter/histogram/gauge), logs, context.\n' +
      '  auto-instrumentation   drop-in for common libs (HTTP, gRPC, DB clients) — traces for free.\n' +
      '  Collector      a standalone process: receive (OTLP) → process (batch, filter, sample,\n' +
      '                 redact, tail-sampling) → export (to one or many backends). Run as agent\n' +
      '                 (per node) + gateway (central).\n' +
      '  OTLP           the protocol (gRPC/HTTP) everything speaks.\n' +
      '  semantic conventions   agreed attribute names (http.route, db.system, gen_ai.*) so\n' +
      '                 dashboards/queries are portable.\n' +
      'REFERENCE OPEN STACK\n' +
      '  metrics  Prometheus (pull) / Mimir  · logs  Loki  · traces  Tempo / Jaeger\n' +
      '  profiles Pyroscope  · dashboards + explore  Grafana  · alerts  Alertmanager\n' +
      'MANAGED EQUIVALENTS   Datadog, Honeycomb, New Relic, Grafana Cloud, Chronosphere, cloud APM —\n' +
      '  all ingest OTLP. Same concepts, someone else runs it.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p><b>OpenTelemetry</b> (CNCF, the second most active CNCF project) is <i>the</i> standard for producing telemetry — ' +
      'API/SDK, the Collector, OTLP, and semantic conventions (including <b>GenAI</b> conventions for LLM spans/metrics). The open backend reference stack is ' +
      '<b>Prometheus + Grafana + Loki + Tempo + Pyroscope</b>; managed vendors ingest the same OTLP. You instrument with OTel and pick a backend; you never write an agent or a wire format.</p></div>',
      try: [
        ['📖 OpenTelemetry — Collector architecture', 'https://opentelemetry.io/docs/collector/architecture/', 'o'],
        ['📖 OpenTelemetry — semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The Collector earns its place.</b> ' +
      'A team ships spans straight from the SDK to a SaaS backend. The bill explodes, PII leaks into span attributes, and switching vendors would mean editing 30 services. ' +
      'They insert an <b>OTel Collector gateway</b>: it does <b>tail-based sampling</b> (keep all errors + slow traces, sample the rest), <b>redacts</b> attributes matching PII ' +
      'patterns, <b>batches</b> exports, and fans out to the SaaS <i>and</i> a cheap cold-storage sink. Cost drops 70%, PII stops leaving the cluster, and the vendor is now one config line.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Semantic conventions make the dashboard reusable.</b> ' +
      'One service names its latency attribute <code>duration_ms</code>, another <code>elapsed</code>, a third <code>latencyMillis</code>. Every dashboard is bespoke. ' +
      'Adopting OTel <b>semantic conventions</b> (<code>http.server.request.duration</code>, <code>gen_ai.usage.input_tokens</code>, …) means one Grafana dashboard and one alert rule ' +
      'work across every service, and a new service is observable the day it ships.</p></div>' +
      '<p><b>Deploy shape:</b> a Collector <i>agent</i> as a DaemonSet (per node, low-latency receive, host metrics) feeding a Collector <i>gateway</i> deployment (sampling, ' +
      'redaction, routing) — so policy lives in one place.</p>',
      try: [
        ['📖 OpenTelemetry — sampling (head vs tail)', 'https://opentelemetry.io/docs/concepts/sampling/', 'o'],
        ['📡 Ch 14 — distributed tracing & context propagation', '#ch14', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Proprietary agent + format per team    OpenTelemetry SDK + OTLP everywhere; backend is swappable.\n' +
      'SDK exports straight to the backend     Route through a Collector gateway: sampling, redaction,\n' +
      '                                       batching, multi-export, cost control in one place.\n' +
      'Ad-hoc attribute names                  OTel semantic conventions (incl. gen_ai.*) → portable\n' +
      '                                       dashboards, queries, and alerts.\n' +
      'No PII policy on spans/logs             Collector processors that drop/redact attributes matching\n' +
      '                                       sensitive patterns before export.\n' +
      'Head sampling only                      Tail-based sampling in the Collector: keep all errors + slow\n' +
      '                                       traces, sample the boring successes.\n' +
      'One retention for all signals           Metrics long, traces/logs short; profiles shortest. Set per\n' +
      '                                       signal at the Collector / backend.\n' +
      'Manual instrumentation only             Use auto-instrumentation for framework/HTTP/DB spans; add\n' +
      '                                       manual spans only for business-meaningful steps.\n' +
      'Lock-in via vendor SDK                  If you must use a vendor, use their OTLP endpoint, not their\n' +
      '                                       proprietary SDK.</code></pre>' +
      '<p><b>The portability test:</b> could you move from your SaaS APM to the open stack (or vice versa) by changing the Collector\'s exporter config and nothing in your services? ' +
      'If not, you have re-introduced lock-in.</p>',
      try: [
        ['📖 OpenTelemetry Collector — processors (batch, filter, redaction, tailsampling)', 'https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor', 'o'],
        ['📖 Grafana — the LGTM stack (Loki, Grafana, Tempo, Mimir)', 'https://grafana.com/oss/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What problem does OpenTelemetry solve?\n' +
      '   A: Vendor-neutral, standard production of traces/metrics/logs — one SDK, one wire format (OTLP), and\n' +
      '   shared semantic conventions — so instrumentation is done once and any backend can consume it.\n\n' +
      'Q: What does the OTel Collector do and why run one?\n' +
      '   A: A standalone pipeline: receive OTLP, process (batch, filter, redact PII, tail-sample), export to\n' +
      '   one or many backends. Centralising this gives cost control, a PII boundary, sampling policy, and\n' +
      '   vendor-swappability in one place instead of per service.\n\n' +
      'Q: Head sampling vs tail-based sampling?\n' +
      '   A: Head sampling decides at span start (random %) — cheap but drops errors/slow traces\n' +
      '   indiscriminately. Tail-based sampling decides after the trace completes in the Collector — keep all\n' +
      '   errors and slow traces, sample the rest. Tail is what you want for debugging.\n\n' +
      'Q: Why do semantic conventions matter?\n' +
      '   A: Agreed attribute names (http.route, db.system, gen_ai.usage.*) make dashboards, queries and\n' +
      '   alerts portable across services and teams; a new service is observable on day one.\n\n' +
      'Q: How do you avoid observability vendor lock-in?\n' +
      '   A: Instrument only with the OTel SDK, send OTLP to a Collector, and keep backend choice in the\n' +
      "   Collector's exporter config. Never use a vendor's proprietary SDK or format in application code.\n\n" +
      'Q: What is the open reference backend stack?\n' +
      '   A: Prometheus (metrics), Loki (logs), Tempo/Jaeger (traces), Pyroscope (profiles), Grafana\n' +
      '   (dashboards + explore), Alertmanager (alerts).</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch1">Ch 1</a> (the signals), <a href="#ch6">Ch 6</a> (LLM spans &amp; GenAI conventions), <a href="#ch10">Ch 10</a> (Grafana dashboards), ' +
      '<a href="#ch14">Ch 14</a> (context propagation &amp; sampling), <a href="#ch13">Ch 13</a> (telemetry cost).</p>',
      try: [
        ['📖 OpenTelemetry — language SDKs & auto-instrumentation', 'https://opentelemetry.io/docs/languages/', 'o'],
        ['📖 CNCF — OpenTelemetry project', 'https://www.cncf.io/projects/opentelemetry/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the core value of adopting OpenTelemetry?',
      opts: [
        'It is the fastest monitoring backend',
        'Vendor-neutral, standard production of traces/metrics/logs — instrument once with one SDK and wire format (OTLP), and any backend can consume it',
        'It replaces the need for dashboards',
        'It only works with one cloud provider'],
      ok: 1,
      why: 'OTel standardises how telemetry is produced and transported. Backend choice becomes a configuration decision rather than a re-instrumentation project.' },
    { q: 'Why route telemetry through an OTel Collector gateway rather than exporting straight from each SDK?',
      opts: [
        'The SDK cannot send data over the network',
        'The Collector centralises sampling, PII redaction, batching, multi-backend export and cost control, and makes the backend swappable in one place',
        'It makes traces more accurate',
        'Backends only accept data from Collectors'],
      ok: 1,
      why: 'Per-service direct export scatters policy and lock-in. A Collector gateway is the single point for tail-sampling, redaction, routing and vendor choice.' },
    { q: 'What does tail-based sampling give you that head sampling does not?',
      opts: [
        'Lower CPU on the client',
        'The decision is made after the trace completes, so you can keep all error and slow traces and sample only the uninteresting successful ones',
        'It removes the need for a Collector',
        'It samples 100% of traces'],
      ok: 1,
      why: 'Head sampling decides at span start with no knowledge of the outcome, so it drops errors and slow traces at the same rate as everything else. Tail sampling preserves exactly the traces worth debugging.' }
  ]
};
