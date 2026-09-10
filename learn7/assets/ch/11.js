/* AI-ML Learn — Part 7 · Chapter 11: Load, Soak & Capacity Testing */
window.CH[11] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>You did the capacity math (Part 6 Ch 2). But it rested on one guessed number — "a replica handles ~120 req/s at target latency". ' +
      '<b>Load testing</b> is how you replace the guess with a measurement, before real users do it for you during a launch.</p>' +
      '<pre><code>LOAD TEST     drive synthetic traffic at rising RPS; find where latency / errors break the SLO\n' +
      'STRESS TEST   push past that point; see HOW it fails (graceful shed? cascade? OOM?)\n' +
      'SOAK TEST     hold moderate load for hours/days; catch leaks, fragmentation, slow degradation\n' +
      'SPIKE TEST    sudden step up; does autoscaling + queueing cope, or does it drop requests?</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A bridge load rating.</b> Engineers do not open a bridge because it "looks strong". They drive ' +
      'ballast trucks across at increasing weight until they know the safe limit, then post a rating. Your load test is the ballast trucks; the capacity sign-off is the posted rating.</p></div>',
      try: [
        ['📖 k6 — load testing fundamentals', 'https://grafana.com/docs/k6/latest/testing-guides/', 'o'],
        ['🏗️ Part 6: capacity math this test verifies', '../learn6/#ch2', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>REALISTIC TRAFFIC   match the production MIX: payload sizes, prompt/context lengths, cache-hit\n' +
      '                    ratio, endpoint distribution, think-time, concurrency pattern. A test with\n' +
      '                    all-identical tiny requests measures nothing useful.\n' +
      'RAMP                step RPS up (e.g. +50/min); at each step record p50/p95/p99, error rate,\n' +
      '                    throughput, CPU/GPU util, queue depth. The knee = your per-replica capacity.\n' +
      'METRICS TO WATCH     latency percentiles (from histograms, never averaged), error rate + types,\n' +
      '                    saturation (GPU util, queue), and for LLMs TTFT + tokens/s + cost.\n' +
      'SOAK                 hours-to-days at ~70% of capacity; watch for RSS growth, GPU memory\n' +
      '                    fragmentation, fd leaks, cache unbounded growth, slow p99 creep.\n' +
      'SPIKE / STEP         2-5x instant; verify autoscaling reaction time, warm floor, bounded queue,\n' +
      '                    graceful 429s (Part 6 Ch 9).\n' +
      'ENVIRONMENT          test against a prod-like environment (same instance types, autoscaler config,\n' +
      '                    dependencies or realistic stubs). Results from a laptop are fiction.\n' +
      'SIGN-OFF             a written statement: "sustains X RPS at p99 < Y ms with N replicas at Z%\n' +
      '                    utilisation; degrades gracefully to 2X; recovers in T seconds after a spike."</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard tools: <b>k6</b>, <b>Locust</b>, <b>Gatling</b>, <b>vegeta</b>, <b>wrk2</b> for HTTP load; ' +
      '<b>vLLM bench</b> / <b>NVIDIA GenAI-Perf</b> / <b>llmperf</b> for LLM-specific metrics (TTFT, inter-token latency, tokens/s under concurrency); ' +
      '<b>MLPerf Inference</b> for comparable model/hardware numbers. Run load tests as a <b>CI job before a release / launch</b>. You script realistic traffic; the harnesses are off the shelf.</p></div>',
      try: [
        ['📖 NVIDIA GenAI-Perf — LLM benchmarking', 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/client/src/c%2B%2B/perf_analyzer/genai-perf/README.html', 'o'],
        ['📖 Locust — writing a locustfile', 'https://docs.locust.io/en/stable/writing-a-locustfile.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The load test that lied.</b> ' +
      'A pre-launch test drove 5 000 RPS of a fixed 20-token prompt and reported p99 = 90 ms — plenty of headroom. On launch day real prompts averaged 1 200 tokens ' +
      'with 15% cache misses and p99 hit 4 s. Fix: rebuild the test with a <b>sampled distribution of real production requests</b> (lengths, cache-hit ratio, endpoint mix); ' +
      'the corrected test showed the true capacity was ~800 RPS, and the fleet was resized before launch.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The soak test that saved a 3am page.</b> ' +
      'A service passed load testing easily. A 48-hour soak at 70% capacity showed RSS climbing ~40 MB/hour and p99 creeping from 180 ms to 260 ms — an unbounded ' +
      'in-process response cache. Found and fixed (added an LRU cap) before release. A 10-minute load test would never have surfaced it.</p></div>' +
      '<p><b>Also test the failure shape:</b> push past capacity and confirm the system <b>sheds gracefully</b> (bounded queue, fast 429 + Retry-After, degradation path) ' +
      'instead of cascading — and measure recovery time after you drop the load back (Part 6 Ch 9, Ch 10).</p>',
      try: [
        ['📖 k6 — test types (smoke, load, stress, soak, spike)', 'https://grafana.com/docs/k6/latest/testing-guides/test-types/', 'o'],
        ['🏗️ Part 6: load management & graceful degradation', '../learn6/#ch9', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'All-identical tiny requests            Sample a realistic distribution: payload/context lengths,\n' +
      '                                       cache-hit ratio, endpoint mix, think-time.\n' +
      'One big spike to N RPS                 Ramp in steps; the knee where p99 breaks the SLO is your\n' +
      '                                       per-replica capacity.\n' +
      'Average latency reported               Percentiles from histograms; report p50/p95/p99 + max.\n' +
      '                                       Averages hide the tail that pages you.\n' +
      'No soak test                            Hours-to-days at ~70%: catch leaks, fragmentation, p99 creep,\n' +
      '                                       unbounded caches.\n' +
      'Test against a scaled-down env          Prod-like instance types, autoscaler config, real/realistic\n' +
      '                                       dependencies. Small-env numbers do not extrapolate.\n' +
      'Only test the happy path                Stress past capacity: confirm graceful shed (429 + Retry-\n' +
      '                                       After, degradation), no cascade, measured recovery time.\n' +
      'Load test the model, not the system     Include the gateway, auth, feature fetch, retrieval — the\n' +
      '                                       model is often not the bottleneck.\n' +
      'No written sign-off                     Produce a capacity statement (sustained RPS, p99, replicas,\n' +
      '                                       utilisation, degradation + recovery). It is the launch\n' +
      '                                       go/no-go artifact.</code></pre>' +
      '<p><b>Close the loop:</b> feed the measured per-replica capacity and peak factor back into the autoscaler config (min/max, target metric) and the ' +
      'capacity model — and re-test after any model, hardware, or major dependency change.</p>',
      try: [
        ['📖 Gatling — simulation design & assertions', 'https://docs.gatling.io/concepts/simulation/', 'o'],
        ['📖 MLPerf Inference — methodology', 'https://mlcommons.org/benchmarks/inference-datacenter/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Your load test showed huge headroom but the launch fell over. Most likely cause?\n' +
      '   A: Unrealistic traffic — fixed tiny prompts, 100% cache hits, one endpoint. Real requests were\n' +
      '   longer, missed cache, and hit varied paths. Rebuild the test from a sampled distribution of real\n' +
      '   production requests.\n\n' +
      'Q: What does a soak test catch that a load test does not?\n' +
      '   A: Slow failures over time: memory leaks, GPU memory fragmentation, file-descriptor leaks, unbounded\n' +
      '   caches, and gradual p99 creep. Run hours-to-days at ~70% of capacity.\n\n' +
      'Q: How do you find per-replica capacity from a load test?\n' +
      '   A: Ramp RPS in steps against one replica (or a known count), recording percentiles/errors/saturation\n' +
      '   at each step. The knee where p99 crosses the SLO is the capacity; divide fleet size from it.\n\n' +
      'Q: Why must you stress past capacity, not just up to it?\n' +
      '   A: To verify the failure shape: bounded queue, fast 429 + Retry-After, degradation path, no cascade —\n' +
      '   and to measure how long recovery takes after load drops.\n\n' +
      'Q: What must be included besides the model in a serving load test?\n' +
      '   A: The whole request path: gateway, auth, feature fetch, retrieval, serialization. The model is\n' +
      '   frequently not the bottleneck — a cold feature cache or the gateway often is.\n\n' +
      'Q: What is the deliverable of capacity testing?\n' +
      '   A: A written sign-off: sustained RPS at p99 < X with N replicas at Y% utilisation, graceful\n' +
      '   degradation to 2X, recovery in T seconds — the launch go/no-go artifact, fed back into autoscaler\n' +
      '   config.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="../learn6/#ch2">Part 6 Ch 2</a> (capacity math), <a href="../learn6/#ch9">Part 6 Ch 9</a> (load management), <a href="#ch5">Ch 5</a> (perf as a rollout gate), ' +
      '<a href="#ch16">Ch 16</a> (sign-off in the runbook), <a href="../learn8/#ch3">Part 8 Ch 3</a> (the same metrics in prod).</p>',
      try: [
        ['📖 k6 — thresholds & pass/fail in CI', 'https://grafana.com/docs/k6/latest/using-k6/thresholds/', 'o'],
        ['📖 Google SRE Workbook — Non-Abstract Large System Design (load)', 'https://sre.google/workbook/non-abstract-design/', 'o']
      ] }
  ],

  quiz: [
    { q: 'A pre-launch load test reported plenty of headroom but the real launch collapsed. Most common cause?',
      opts: [
        'The test used too many machines',
        'Unrealistic synthetic traffic — fixed short prompts, 100% cache hits, one endpoint — so it never exercised the true request mix (lengths, cache misses, endpoint variety)',
        'The SLO was set too low',
        'Load testing always over-reports capacity'],
      ok: 1,
      why: 'Load test results are only as good as the traffic model. A realistic sampled distribution of production requests is what makes the measured capacity trustworthy.' },
    { q: 'What class of problem does a multi-hour soak test reveal that a short load test misses?',
      opts: [
        'The exact peak RPS',
        'Slow failures over time — memory/fd leaks, GPU memory fragmentation, unbounded caches, gradual p99 creep',
        'The number of CPU cores needed',
        'Whether the SLO document is formatted correctly'],
      ok: 1,
      why: 'A short test cannot surface accumulation effects. Holding sustained moderate load for hours or days exposes leaks and gradual degradation before production does.' },
    { q: 'Why deliberately stress the system past its capacity limit during testing?',
      opts: [
        'To break it permanently',
        'To verify the failure shape — bounded queue, fast 429 + Retry-After, degradation path, no cascade — and to measure recovery time after load returns to normal',
        'Stress testing has no purpose',
        'To increase the SLO'],
      ok: 1,
      why: 'Knowing capacity is not enough; you must know how the system behaves when exceeded and how quickly it recovers, so overload is a controlled event, not an outage.' }
  ]
};
