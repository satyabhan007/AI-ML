/* AI-ML Learn — Part 8 · Chapter 14: Distributed Tracing Across Services & Models */
window.CH[14] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Chapter 6 traced one request <i>inside</i> one service. Real systems span many: the gateway, the app, a retriever service, a feature store, a reranker, ' +
      'the model backend, an async worker. If each keeps its own trace, you get seven disconnected fragments and no way to see the whole journey. ' +
      '<b>Distributed tracing</b> is making all of them one trace by passing the trace context across every hop.</p>' +
      '<pre><code>gateway ──(traceparent header)──▶ app ──▶ retriever ──▶ vector DB\n' +
      '                                   │\n' +
      '                                   └──(queue message w/ traceparent)──▶ worker ──▶ model backend\n' +
      'one trace_id the whole way → one flame graph across service boundaries</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A relay race with one baton.</b> Each runner (service) does their leg, but it only counts as one race if ' +
      'the <i>same baton</i> (trace context) is handed off cleanly at every exchange. Drop the baton at a handoff and the timing for the rest of the race is lost.</p></div>',
      try: [
        ['📖 OpenTelemetry — context propagation', 'https://opentelemetry.io/docs/concepts/context-propagation/', 'o'],
        ['📡 Ch 6 — tracing within one service', '#ch6', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>PROPAGATION\n' +
      '  HTTP/gRPC   inject/extract the W3C `traceparent` (+ `tracestate`) header at every client &\n' +
      '              server boundary. Auto-instrumentation does this for common frameworks.\n' +
      '  QUEUES/KAFKA   put traceparent in the message headers; the consumer continues the trace\n' +
      '              (usually as a linked span or child, per your semantics).\n' +
      '  gateways/proxies   Envoy/Istio/ingress must forward (not strip) the trace headers; add their\n' +
      '              own span.\n' +
      '  cross-language   same W3C standard everywhere → Python app + Go retriever + Rust model server\n' +
      '              still form one trace.\n' +
      'SPAN LINKS    for fan-out/batch (one request → N downstream, or N messages → one batch job),\n' +
      '              use span LINKS, not a single parent.\n' +
      'SAMPLING (at scale)\n' +
      '  head    decide at the root (%). Simple; consistent across services (propagate the decision).\n' +
      '  tail    decide after the whole trace completes, in the Collector — keep all errors + slow +\n' +
      '          a sample of the rest. Needs the Collector to buffer spans by trace_id.\n' +
      '  parent-based   children respect the root\'s decision so traces are never half-sampled.\n' +
      'BAGGAGE       propagate a few business keys (tenant, feature) alongside context — sparingly.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p><b>W3C Trace Context</b> (traceparent/tracestate) is the propagation standard; <b>OpenTelemetry</b> ' +
      'propagators implement it across languages and transports, including messaging conventions for Kafka/SQS. <b>Tail-based sampling</b> lives in the <b>OTel Collector</b> ' +
      '(tailsamplingprocessor); <b>parent-based</b> sampling keeps traces whole. You configure propagators + a sampling policy; the wire standard is fixed.</p></div>',
      try: [
        ['📖 W3C — Trace Context specification', 'https://www.w3.org/TR/trace-context/', 'o'],
        ['📖 OpenTelemetry — messaging spans (Kafka/SQS) semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/messaging/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The trace that stopped at the queue.</b> ' +
      'A RAG pipeline hands long-document ingestion to an async worker. Traces of the API request look complete and fast — but they end at "enqueued". The ' +
      'ingestion worker\'s spans are a <i>separate</i> trace, so nobody can see that ingestion is where a 30-minute stall happens. Fix: inject <code>traceparent</code> ' +
      'into the queue message; the worker extracts it and its spans join (via a link) the original trace. Now one view shows request → enqueue → worker → model.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Half-sampled traces are useless.</b> ' +
      'Each service independently samples at 10%. A trace is kept by the gateway, dropped by the retriever, kept by the model backend — so the flame graph has holes ' +
      'exactly where you need to look. Fix: <b>parent-based sampling</b> — the root makes the decision and propagates it, so a trace is entirely kept or entirely dropped — ' +
      'and move to <b>tail sampling</b> in the Collector so every error/slow trace is complete.</p></div>' +
      '<p><b>Check the seams:</b> most "broken trace" bugs are a proxy stripping headers, a queue client not propagating, or a thread-pool/async boundary losing context. ' +
      'A quick test: fire one request with 100% sampling and confirm every hop appears.</p>',
      try: [
        ['📖 OpenTelemetry Collector — tail sampling processor', 'https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/processor/tailsamplingprocessor/README.md', 'o'],
        ['📡 Ch 2 — the Collector where tail sampling runs', '#ch2', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Each service has its own trace         Propagate W3C traceparent at every HTTP/gRPC and queue hop;\n' +
      '                                       one trace_id end to end.\n' +
      'Trace ends at the queue                Inject traceparent into the message; consumer continues it\n' +
      '                                       (child or linked span).\n' +
      'Independent per-service sampling        Parent-based sampling: root decides, children obey — no\n' +
      '                                       half-sampled traces.\n' +
      'Head sampling only, at scale            Add tail sampling in the Collector: keep all errors + slow +\n' +
      '                                       a % of the rest, decided after completion.\n' +
      'Proxy/ingress strips trace headers      Configure Envoy/Istio/ingress to forward them and add a span.\n' +
      'Fan-out modelled as one parent          Use span links for batch / fan-out / N→1 joins.\n' +
      'Context lost across async/threadpool     Use the language\'s context propagation (contextvars,\n' +
      '                                       Context, AsyncLocalStorage); test it.\n' +
      'Baggage carrying big/PII values          Baggage is for a few small business keys; it rides on every\n' +
      '                                       hop and can leak.</code></pre>' +
      '<p><b>The payoff for AI systems specifically:</b> one trace shows the gateway queue time, retrieval latency, rerank, each model call and tool call, and the ' +
      'async ingestion — so "why was this request slow / expensive / wrong" is answered across the whole distributed pipeline, not per service.</p>',
      try: [
        ['📖 OpenTelemetry — sampling (parent-based, ratio, tail)', 'https://opentelemetry.io/docs/concepts/sampling/', 'o'],
        ['📖 Grafana Tempo — trace discovery & TraceQL', 'https://grafana.com/docs/tempo/latest/traceql/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: How do spans from seven different services become one trace?\n' +
      '   A: The trace context (W3C traceparent) is injected at every outbound HTTP/gRPC call and queue\n' +
      '   message and extracted on the other side, so all services share one trace_id and build a single span\n' +
      '   tree. Auto-instrumentation handles common frameworks; proxies must forward the headers.\n\n' +
      'Q: A trace ends at "enqueued" and the async worker\'s spans are separate. Fix?\n' +
      '   A: Put traceparent in the message headers; the consumer extracts it and starts its spans as a child\n' +
      '   or linked span of the original trace, so the async work is visible in one view.\n\n' +
      'Q: Why are independently-sampled traces a problem, and what is the fix?\n' +
      '   A: One service keeps the trace, another drops it — the flame graph has gaps exactly where you need\n' +
      '   to look. Parent-based sampling makes the root decide and propagate, so traces are whole; tail\n' +
      '   sampling in the Collector keeps every error/slow trace complete.\n\n' +
      'Q: Head vs tail sampling?\n' +
      '   A: Head decides at the root (cheap, must propagate the decision). Tail decides after the trace\n' +
      '   completes, in the Collector, so you can keep exactly the interesting traces (errors, slow) and\n' +
      '   sample the rest — at the cost of buffering spans by trace_id.\n\n' +
      'Q: How do you model a fan-out (one request → many downstream calls) in a trace?\n' +
      '   A: Span links rather than a single parent, so the relationship is captured without forcing a tree.\n\n' +
      'Q: Where do broken distributed traces usually come from?\n' +
      '   A: A proxy stripping trace headers, a queue client not propagating context, or an async/threadpool\n' +
      '   boundary losing it. Test with one 100%-sampled request and confirm every hop appears.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch6">Ch 6</a> (spans in one service), <a href="#ch2">Ch 2</a> (Collector &amp; tail sampling), <a href="#ch15">Ch 15</a> (profiling the hot span), ' +
      '<a href="../learn6/#ch12">Part 6 Ch 12</a> (async/queue architecture), <a href="../learn6/#ch3">Part 6 Ch 3</a> (the gateway).</p>',
      try: [
        ['📖 OpenTelemetry — propagators & instrumentation', 'https://opentelemetry.io/docs/languages/js/propagation/', 'o'],
        ['📖 Jaeger — architecture & sampling', 'https://www.jaegertracing.io/docs/latest/architecture/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What makes spans from many different services form a single distributed trace?',
      opts: [
        'They are all sent to the same backend',
        'The trace context (W3C traceparent) is propagated — injected on every outbound HTTP/gRPC call and queue message and extracted on the other side — so all services share one trace_id',
        'They have similar timestamps',
        'They use the same programming language'],
      ok: 1,
      why: 'A shared, propagated trace context is what stitches per-service spans into one tree. Without propagation across each hop you get disconnected fragments.' },
    { q: 'Each service samples traces independently at 10%. Why is this bad?',
      opts: [
        'It uses too much CPU',
        'A trace can be kept by some services and dropped by others, leaving gaps in the flame graph exactly where you need to investigate — use parent-based sampling so the root decides for the whole trace',
        'Sampling should always be 100%',
        'It makes traces arrive out of order'],
      ok: 1,
      why: 'Half-sampled traces are close to useless. Parent-based sampling propagates one decision; tail sampling in the Collector then keeps every error/slow trace complete.' },
    { q: 'A distributed trace ends at "enqueued" and the async worker\'s spans are a separate trace. Correct fix?',
      opts: [
        'Make the worker synchronous',
        'Inject the traceparent into the queue message headers so the consumer extracts it and continues the same trace (as a child or linked span)',
        'Increase the sampling rate',
        'Give the worker its own dashboard'],
      ok: 1,
      why: 'Queue hops break context unless it is carried in the message. Propagating traceparent through the message lets async work appear in the same end-to-end trace.' }
  ]
};
