/* AI-ML Learn — Part 6 · Chapter 13: Idempotency, Retries, Timeouts, Circuit Breakers */
window.CH[13] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Model calls fail and hang more than ordinary API calls — GPUs get busy, a node dies mid-generation, a cold replica takes 40 seconds. ' +
      'Four small patterns on the <i>caller</i> side stop one flaky model call from taking down everything that depends on it:</p>' +
      '<pre><code>TIMEOUT          give up waiting after N ms — never wait forever\n' +
      'RETRY           try again on a transient failure — with backoff + jitter, and a limit\n' +
      'IDEMPOTENCY     make "try again" safe — a retried call must not double-charge / double-send\n' +
      'CIRCUIT BREAKER  stop calling a backend that is clearly down — fail fast, recover, retry later</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Phoning a shop that keeps not answering.</b> You do not let it ring forever (timeout). ' +
      'You call back a couple of times, waiting a bit longer each time (retry with backoff). If you were placing an order, calling twice must not order twice (idempotency). ' +
      'After ten dead calls you stop dialling for a while and try later (circuit breaker).</p></div>',
      try: [
        ['📖 AWS — timeouts, retries, and backoff with jitter', 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', 'o'],
        ['🏗️ Ch 9 — how retry storms cause outages', '#ch9', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>TIMEOUTS       per-attempt timeout < the caller\'s overall deadline. Budget it (Ch 2). Separate\n' +
      '               connect vs read timeouts; for streaming, an inactivity timeout, not a total one.\n' +
      'RETRIES        only on transient/idempotent failures: timeouts, 429, 502/503/504, connection reset.\n' +
      '               NOT on 400/401/403/422 or a business "no". Exponential backoff + FULL jitter.\n' +
      '               Cap attempts (2-3) AND a retry budget (retries ≤ ~10% of requests).\n' +
      '               Respect Retry-After. Hedged requests: fire a 2nd try at p95 latency, take the first win.\n' +
      'IDEMPOTENCY    client sends an Idempotency-Key header; server stores key → response for a TTL and\n' +
      '               replays it on a repeat. Natural keys: (user, request_hash). Essential for POST /\n' +
      '               generation / charge / send.\n' +
      'CIRCUIT BREAKER  CLOSED (normal) → OPEN (fail fast, no calls) after an error-rate/threshold trip →\n' +
      '               HALF-OPEN (let a few probes through) → CLOSED if they pass. Pair with a fallback.\n' +
      'BULKHEAD       separate connection pools / concurrency limits per dependency so one slow backend\n' +
      '               cannot exhaust all your threads.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>These are the <b>stability patterns</b> from <i>Release It!</i> and the ' +
      '<b>AWS Builders\' Library</b>, implemented for you in service meshes and libraries: <b>Envoy / Istio</b> (retries, timeouts, outlier detection = circuit breaking), ' +
      '<b>gRPC</b> built-in retry configs, <b>resilience4j / Polly / Hystrix-style</b> libraries, and <b>Idempotency-Key</b> headers as popularised by Stripe. ' +
      'You configure them; you do not hand-roll a circuit breaker.</p></div>',
      try: [
        ['📖 Stripe — idempotent requests', 'https://docs.stripe.com/api/idempotent_requests', 'o'],
        ['📖 Envoy — outlier detection (circuit breaking) & retries', 'https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/outlier', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The double-generated (and double-billed) response.</b> ' +
      'A client\'s 30 s timeout fires while the LLM is still generating; it retries; both generations complete; the user is charged twice and sees a duplicate message. ' +
      'Fixes: an <b>Idempotency-Key</b> per logical request — the server returns the in-flight/stored result for the retry instead of starting a new generation; ' +
      'set the client timeout above p99 generation time (or stream, so you see progress); and make "charge" a downstream step keyed by the same id.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>One slow dependency freezes the whole service.</b> ' +
      'The reranker backend degrades to 8 s latency. Every request waits on it, all worker threads fill up, and the <i>entire</i> API — including calls that ' +
      'do not need the reranker — stops responding. Fixes: a tight <b>timeout</b> on the reranker call (say 300 ms) with a <b>fallback</b> to no-rerank; ' +
      'a <b>circuit breaker</b> that opens after sustained errors so calls fail fast; and a <b>bulkhead</b> — a bounded, separate pool for reranker calls so ' +
      'they cannot consume every thread.</p></div>' +
      '<p><b>Retry only what is safe.</b> A GET or an idempotent POST (with a key) can be retried. A non-idempotent action without a key must not be — ' +
      'return the failure and let a human or an idempotent redesign handle it.</p>',
      try: [
        ['📖 Michael Nygard — Release It! stability patterns (overview)', 'https://pragprog.com/titles/mnee2/release-it-second-edition/', 'o'],
        ['📖 gRPC — retry & hedging policy', 'https://grpc.io/docs/guides/retry/', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'No timeout (or timeout > deadline)     Per-attempt timeout strictly inside the caller\'s deadline; budget\n' +
      '                                       every hop. Infinite waits become cascading hangs.\n' +
      'Retry everything, including 4xx         Retry only transient/idempotent failures (timeouts, 429, 5xx,\n' +
      '                                       resets). Retrying a 400 just wastes capacity.\n' +
      'Fixed-interval retries, no jitter       Exponential backoff + full jitter, or synchronized clients\n' +
      '                                       hammer the backend in lockstep (retry storm).\n' +
      'Unbounded retries                       Cap attempts AND enforce a retry budget (fraction of total\n' +
      '                                       traffic). Otherwise retries dominate load during an incident.\n' +
      'Non-idempotent POST retried             Require an Idempotency-Key; server dedupes by key → stored\n' +
      '                                       response. No key → do not retry.\n' +
      'No circuit breaker                      Add outlier detection / a breaker so a dead backend fails fast\n' +
      '                                       instead of consuming timeouts on every request.\n' +
      'Shared thread pool for all deps         Bulkheads: per-dependency concurrency limits so one slow\n' +
      '                                       backend cannot starve the rest.\n' +
      'Retry at every layer                    Retry at ONE layer (usually closest to the failure). Nested\n' +
      '                                       retries multiply: 3 × 3 × 3 = 27 attempts.</code></pre>' +
      '<p><b>Deadline propagation:</b> pass the remaining time budget down the call chain (gRPC deadlines / a header). Each hop uses only what is left, ' +
      'so a request that has already spent 180 ms of a 200 ms budget does not start a fresh 200 ms attempt downstream.</p>',
      try: [
        ['📖 Google SRE Book — Addressing Cascading Failures', 'https://sre.google/sre-book/addressing-cascading-failures/', 'o'],
        ['🏗️ Ch 10 — client behaviour during failover', '#ch10', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Which failures are safe to retry, and how?\n' +
      '   A: Transient + idempotent: timeouts, connection resets, 429, 502/503/504. Use exponential backoff\n' +
      '   with full jitter, cap attempts (2-3), enforce a retry budget (retries ≤ ~10% of traffic), and respect\n' +
      '   Retry-After. Never retry 400/401/403/422 or a business "no".\n\n' +
      'Q: A client timeout fires mid-generation, it retries, and the user is charged twice. Fix?\n' +
      '   A: Idempotency-Key per logical request: the server maps key → in-flight/stored result and replays it\n' +
      '   for the retry instead of generating again. Key the downstream charge with the same id. Also raise the\n' +
      '   timeout above p99 or switch to streaming.\n\n' +
      'Q: One slow dependency makes the whole service unresponsive. What patterns prevent this?\n' +
      '   A: A tight timeout on that call with a fallback, a circuit breaker that opens on sustained errors so\n' +
      '   calls fail fast, and a bulkhead (separate bounded concurrency pool) so it cannot exhaust all threads.\n\n' +
      'Q: Explain the circuit-breaker states.\n' +
      '   A: CLOSED = calls flow normally. On tripping an error-rate/latency threshold it goes OPEN = fail fast\n' +
      '   with no calls (serve a fallback). After a cooldown it goes HALF-OPEN = allow a few probe calls; if\n' +
      "   they succeed → CLOSED, else back to OPEN.\n\n" +
      'Q: Why is retrying at every layer of the stack dangerous?\n' +
      '   A: Retries multiply: 3 attempts at each of 3 layers = 27 calls to the bottom service during an\n' +
      '   incident. Retry at one layer, ideally closest to the failure, and propagate deadlines so downstream\n' +
      '   hops use only the remaining budget.\n\n' +
      'Q: What is a hedged request?\n' +
      '   A: Send a second identical (idempotent) request once the first exceeds ~p95 latency; use whichever\n' +
      '   returns first, cancel the other. Cuts tail latency at the cost of some extra load — bound it.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch12">Ch 12</a> (idempotency keys for async jobs), <a href="#ch9">Ch 9</a> (retry budgets &amp; storms), ' +
      '<a href="#ch10">Ch 10</a> (fallbacks), and <a href="#ch2">Ch 2</a> (the latency budget timeouts live inside).</p>',
      try: [
        ['📖 AWS — implementing health checks & circuit breakers', 'https://aws.amazon.com/builders-library/implementing-health-checks/', 'o'],
        ['📖 resilience4j — core modules (retry, circuitbreaker, bulkhead)', 'https://resilience4j.readme.io/docs/getting-started', 'o']
      ] }
  ],

  quiz: [
    { q: 'Which set of failures is appropriate to retry (with backoff + jitter and a cap)?',
      opts: [
        'Any failure, including HTTP 400 and 403',
        'Transient/idempotent failures only: timeouts, connection resets, 429, and 502/503/504',
        'Only successful responses',
        'Business rejections like "insufficient funds"'],
      ok: 1,
      why: 'Retrying a deterministic client error (400/401/403/422) or a business "no" just wastes capacity. Retries are for transient conditions that a later attempt might succeed on.' },
    { q: 'A caller times out mid-generation, retries, and both generations complete — double message, double charge. Best fix?',
      opts: [
        'Disable retries entirely',
        'Require an Idempotency-Key per logical request so the server returns the in-flight/stored result on the retry, and key the downstream charge with the same id',
        'Use a bigger GPU',
        'Increase the number of replicas'],
      ok: 1,
      why: 'Idempotency keys make "try again" safe: the second call is recognised and replayed rather than re-executed, so side effects happen once.' },
    { q: 'What does a circuit breaker in the OPEN state do?',
      opts: [
        'Retries the failing call as fast as possible',
        'Stops sending calls to the failing backend and fails fast (serving a fallback), then after a cooldown allows a few probe calls (HALF-OPEN) to test recovery',
        'Restarts the backend',
        'Increases the timeout to infinity'],
      ok: 1,
      why: 'Once a backend is clearly down, continuing to call it just burns timeouts on every request. OPEN fails fast; HALF-OPEN periodically probes so the breaker can close again when the backend recovers.' }
  ]
};
