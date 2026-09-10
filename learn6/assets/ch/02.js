/* AI-ML Learn — Part 6 · Chapter 2: Requirements → SLOs → Capacity Math */
window.CH[2] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>"It should be fast and always up" is not a requirement — it is a wish. Engineering starts when you turn wishes into <b>numbers you can measure and defend</b>: how many requests per second, how many milliseconds each is allowed, how often it may fail.</p>' +
      '<pre><code>wish                 number\n' +
      '"fast"               p99 latency ≤ 200 ms\n' +
      '"handles our load"   1 200 requests/second at peak\n' +
      '"reliable"           99.9% of requests succeed each 30-day window\n' +
      '"affordable"         ≤ $0.002 per request</code></pre>' +
      '<p>Those four — throughput, latency, availability, cost — size every serving system. Everything else (how many GPUs, how many replicas, how big a cache) is arithmetic on top of them.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A restaurant kitchen.</b> "Serve customers quickly" means nothing to a chef. "200 covers a night, tables turn in 90 minutes, mains out in 12" tells them how many stoves, how many cooks, and how much fridge space. Capacity planning is that, for requests.</p></div>',
      try: [
        ['📖 Google SRE Workbook — Implementing SLOs', 'https://sre.google/workbook/implementing-slos/', 'o'],
        ['🏗️ Ch 1 — the ML system-design map', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>The vocabulary, precisely:</p>' +
      '<pre><code>SLI  Service Level Indicator — the metric itself     e.g. "fraction of requests < 300 ms"\n' +
      'SLO  Service Level Objective — the target for it    e.g. "99% of requests < 300 ms over 28 days"\n' +
      'SLA  Service Level Agreement — a contract + penalty  (business, not engineering)\n' +
      'error budget = 1 − SLO   → 99.9% availability = 43.2 min/month of allowed failure</code></pre>' +
      '<p><b>Capacity math</b>, the back-of-envelope every design needs:</p>' +
      '<pre><code>QPS_avg   = daily_requests / 86 400\n' +
      'QPS_peak  = QPS_avg × peak_factor        (2–5× for consumer apps; measure yours)\n' +
      'replicas  = ceil( QPS_peak / per_replica_capacity × (1 / target_utilisation) )\n' +
      "per_replica_capacity ≈ concurrency / mean_latency_s        (Little's Law: L = λ·W)\n" +
      'GPU count = ceil( QPS_peak × tokens_per_req / (tokens_per_sec_per_gpu) )   for LLMs</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The canonical framework is <b>Google\'s SRE practice</b>: pick SLIs from the user\'s point of view (latency, availability, quality), set SLOs slightly looser than observed best-case, and manage change against the <b>error budget</b>. For the queuing arithmetic the standard tool is <b>Little\'s Law</b> (<code>L = λW</code>) plus a load test to measure <code>per_replica_capacity</code> rather than guessing it. You do not invent a capacity model — you measure one number (throughput per replica at target latency) and divide.</p></div>',
      try: [
        ['📖 Little\'s Law — explained', 'https://en.wikipedia.org/wiki/Little%27s_law', 'o'],
        ['📖 Google SRE Book — Service Level Objectives', 'https://sre.google/sre-book/service-level-objectives/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Sizing a classic-model ranking service.</b> ' +
      'Product says 40M users, ~6 ranked feed loads/user/day. <code>daily = 240M</code> → <code>QPS_avg ≈ 2 780</code>; ' +
      'observed peak factor 3× → <code>QPS_peak ≈ 8 340</code>. A load test shows one replica holds ~120 req/s at p99 = 180 ms with 4 vCPU. ' +
      'Target 60% utilisation for headroom: <code>replicas = ceil(8340 / 120 / 0.6) = 116</code>. Round to 128 across 3 zones, ' +
      'set the HPA to scale on QPS between 40 and 150 pods, and re-test quarterly.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Sizing an LLM endpoint.</b> ' +
      'Target 50 req/s steady, mean 800 input + 400 output tokens. On the chosen GPU, the served model does ~2 500 output tokens/s at batch 16 ' +
      '(from a benchmark, not a datasheet). Output throughput needed: <code>50 × 400 = 20 000 tok/s</code> → <code>8 GPUs</code> for decode, ' +
      '+1 for prefill headroom and failover → provision 10, autoscale 6–14. Latency check: at batch 16 the p99 TTFT is 600 ms and ' +
      'inter-token 40 ms → a 400-token answer streams in ~16 s. If the SLO is "first token < 1 s", this passes; if it is ' +
      '"full answer < 5 s", you need a smaller model or fewer tokens.</p></div>' +
      '<p><b>Latency budgeting:</b> write the p99 target at the edge, then subtract each hop — LB 5 ms, auth 10 ms, feature fetch 30 ms, ' +
      'model 120 ms, serialization 10 ms, network 15 ms = 190 ms, leaving 10 ms of slack against a 200 ms SLO. If any hop grows, something must give.</p>',
      try: [
        ['📖 vLLM — performance benchmarking', 'https://docs.vllm.ai/en/latest/serving/benchmarks.html', 'o'],
        ['🏗️ Ch 11 — cost & performance tradeoffs', '#ch11', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Size for average QPS                   Size for peak (measured peak factor), then autoscale down.\n' +
      '                                       Averages hide the spike that pages you.\n' +
      'per_replica_capacity from a datasheet   Load-test the real build on the real hardware with the real\n' +
      '                                       payload distribution. Datasheets are best-case, batch-1 or\n' +
      '                                       batch-∞, wrong context length.\n' +
      'Plan for 100% utilisation              Target 50–70%. Queues explode as utilisation → 1 (M/M/1:\n' +
      '                                       wait time ∝ ρ/(1−ρ)). Headroom is not waste, it is latency.\n' +
      'One p99 number for the whole system    Budget it hop-by-hop; the model is usually NOT the largest term.\n' +
      'SLO = best day ever                    Set the SLO where you can sustain it on a bad day. An SLO you\n' +
      '                                       breach monthly trains everyone to ignore it.\n' +
      'Averaging percentiles across pods       Aggregate from histograms. avg(p99) is meaningless.\n' +
      'No error budget policy                 Decide in advance what happens when it is spent (freeze\n' +
      '                                       features, focus on reliability) — see Part 8.</code></pre>' +
      '<p><b>Cost per request:</b> <code>(replica_hourly_cost × replicas) / (QPS_avg × 3600)</code>. Sanity-check it against revenue per request early — ' +
      'a design that costs more than it earns is a redesign, not an optimisation task.</p>',
      try: [
        ['📖 Brendan Gregg — the USE method & saturation', 'https://www.brendangregg.com/usemethod.html', 'o'],
        ['📡 Part 8: SLIs, SLOs & error budgets', '../learn8/#ch4', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: 10M DAU, each triggers 8 model calls/day, peak factor 4. What QPS do you design for?\n' +
      'A: 10e6 × 8 = 80e6/day → /86400 ≈ 926 QPS average → ×4 peak ≈ 3 700 QPS. Design the fleet + autoscaler\n' +
      '   ceiling for ~3 700; let it scale down toward ~900 off-peak.\n\n' +
      'Q: A replica handles 200 req/s at your latency target. How many replicas for 3 700 QPS?\n' +
      'A: At 100% you would need ceil(3700/200)=19. But target ~60% utilisation for latency headroom and failover:\n' +
      '   ceil(3700/200/0.6) ≈ 31, spread across ≥3 AZs, plus N+1 so one AZ loss is survivable.\n\n' +
      'Q: Why not run replicas at 95% CPU to save money?\n' +
      "A: Queuing delay grows as 1/(1−utilisation). Past ~70–80% the p99 latency curve goes vertical, and you have\n" +
      '   no room to absorb a spike or a failed node before you breach the SLO. The "saved" machines cost you an\n' +
      '   incident.\n\n' +
      'Q: SLO is 99.9% availability. How much downtime is that, and what is the error budget for?\n' +
      'A: ~43 min/month. The budget is spent deliberately: risky deploys, migrations, load tests. When it is gone,\n' +
      '   policy kicks in — freeze feature launches, prioritise reliability work — until it recovers.\n\n' +
      'Q: How do you get per_replica_capacity for a model you have not deployed yet?\n' +
      "A: You don't guess — you load-test a candidate build on the target instance with a realistic request mix\n" +
      '   (payload sizes, context lengths, cache-hit ratio) and read throughput at the point where p99 hits your\n' +
      '   target. That single number drives the whole fleet size.\n\n' +
      'Q: The p99 SLO is 200 ms and the model alone is 120 ms. Is that fine?\n' +
      'A: Only if the rest of the path (LB, auth, feature fetch, serialization, network) fits in 80 ms with slack.\n' +
      '   Budget every hop; often the feature fetch or a cold cache, not the model, is what blows the budget.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch9">Ch 9 — scaling &amp; load management</a> turns these numbers into autoscaler config, ' +
      '<a href="#ch11">Ch 11</a> into a cost model, and <a href="../learn8/#ch4">Part 8 Ch 4</a> into an error-budget policy.</p>',
      try: [
        ['📖 Google SRE Workbook — Alerting on SLOs (burn rate)', 'https://sre.google/workbook/alerting-on-slos/', 'o'],
        ['📖 The Art of Capacity Planning (concepts)', 'https://www.oreilly.com/library/view/the-art-of/9781491939444/', 'o']
      ] }
  ],

  quiz: [
    { q: 'You have daily request volume and a measured peak factor. Which number sizes the fleet and the autoscaler ceiling?',
      opts: [
        'Average QPS — autoscaling handles the rest',
        'Peak QPS (average × peak factor), with the fleet able to serve it at target latency and utilisation',
        'Minimum QPS',
        'Total requests per day, undivided'],
      ok: 1,
      why: 'Design for the peak so the system stays within its latency/availability SLO when it matters; autoscaling then scales the fleet back down during quiet periods.' },
    { q: 'Why target ~60–70% replica utilisation instead of ~95%?',
      opts: [
        'Cloud providers require it',
        'Queuing delay rises sharply as utilisation approaches 1 (wait ∝ ρ/(1−ρ)), so headroom is what keeps p99 latency flat and absorbs spikes and node failures',
        'It has no effect on latency',
        '95% is impossible to reach'],
      ok: 1,
      why: 'Near full utilisation the latency curve goes vertical and there is no slack for a traffic spike or a lost node — the "extra" capacity is buying you your latency SLO.' },
    { q: 'How should you obtain per_replica_capacity (throughput one replica can serve at target latency)?',
      opts: [
        'Read it from the model or GPU datasheet',
        'Load-test the real build on the target hardware with a realistic request mix, and read throughput where p99 hits the latency target',
        'Assume 1000 req/s',
        'Divide total RAM by request size'],
      ok: 1,
      why: 'Datasheet numbers are best-case and use unrealistic batch sizes / context lengths. Only a load test with representative traffic gives the number the whole fleet-sizing calculation depends on.' }
  ]
};
