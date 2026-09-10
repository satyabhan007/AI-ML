/* AI-ML Learn — Part 6 · Chapter 9: Scaling & Load Management */
window.CH[9] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Traffic is never flat. A launch, a news mention, a retry storm — load doubles in a minute. A serving system needs two abilities: ' +
      '<b>add capacity when load rises</b> (autoscaling) and <b>stay standing when it rises faster than you can add capacity</b> (load management).</p>' +
      '<pre><code>SCALE OUT     more replicas / more GPUs, automatically, on a signal (QPS, queue depth, GPU util)\n' +
      'BATCH        merge concurrent requests into one model call → more throughput per GPU\n' +
      'QUEUE        hold a short backlog so a brief spike does not drop requests\n' +
      'BACKPRESSURE tell callers to slow down (HTTP 429) before you fall over\n' +
      'LOAD SHED    drop / degrade the least important work to protect the rest</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A busy ER.</b> You call in more staff (autoscale), you see patients in groups where you can (batch), ' +
      'there is a waiting room (queue), you tell walk-ins the wait is long (backpressure), and in a mass-casualty event you triage — ' +
      'critical cases first, sprained ankles wait (load shedding). Doing none of this means the whole ER seizes.</p></div>',
      try: [
        ['📖 Kubernetes — Horizontal Pod Autoscaler', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale/', 'o'],
        ['🏗️ Ch 2 — the capacity math autoscaling acts on', '#ch2', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>AUTOSCALING\n' +
      '  HPA          scale on CPU / custom metric (QPS, p99, queue depth). Reaction time: ~30-90 s.\n' +
      '  KEDA          scale on external signals (Kafka lag, SQS depth, Prometheus query). Scale-to-zero.\n' +
      '  Cluster AS / Karpenter   add NODES when pods cannot schedule (GPUs take minutes to join).\n' +
      '  GPU caveat    cold start = pull image + load a multi-GB model = 30-300 s. Keep a warm floor;\n' +
      '                use pre-provisioned / over-provisioned "pause" capacity for headroom.\n' +
      'BATCHING\n' +
      '  dynamic (Triton) / continuous (vLLM): bigger batch = more throughput, some added latency.\n' +
      '  Tune max batch size + max queue delay against your p99 SLO.\n' +
      'ADMISSION CONTROL\n' +
      '  concurrency limit per replica; a bounded queue; reject (429 + Retry-After) when full.\n' +
      '  Little\'s Law: if arrivals > service rate for long, the queue is unbounded — shed, don\'t buffer.\n' +
      'PRIORITIES     separate lanes / weights: interactive > batch; paid tier > free; critical > nice-to-have.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard toolkit: <b>HPA + KEDA</b> for pod autoscaling on real signals, ' +
      '<b>Cluster Autoscaler / Karpenter</b> for nodes, the serving runtime\'s <b>dynamic/continuous batching</b>, and the <b>SRE load-shedding patterns</b> ' +
      '(bounded queues, 429 + <code>Retry-After</code>, priority classes, graceful degradation). Retries use <b>exponential backoff + jitter</b> and a ' +
      '<b>retry budget</b>. You wire these together; the algorithms are well-established.</p></div>',
      try: [
        ['📖 KEDA — event-driven autoscaling', 'https://keda.sh/docs/latest/concepts/', 'o'],
        ['📖 Google SRE Book — Handling Overload', 'https://sre.google/sre-book/handling-overload/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The autoscaler is too slow for the spike.</b> ' +
      'A campaign drives 5× traffic in 90 seconds; the HPA scales on CPU with a 60 s window, and new GPU nodes take 3 minutes to join. ' +
      'For those 3 minutes, requests pile up and time out. Fixes: (1) a <b>warm floor</b> of replicas sized for a plausible spike, not for the average; ' +
      '(2) scale on <b>queue depth / QPS</b> (leading signal) not CPU (lagging); (3) <b>over-provision</b> low-priority "pause" pods that get evicted instantly ' +
      'to make room; (4) a bounded queue + 429 so the overflow is rejected fast instead of hanging.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>A retry storm turns a blip into an outage.</b> ' +
      'A 2-second dependency hiccup causes clients to retry 3× immediately with no jitter; effective load triples exactly when the system is weakest, ' +
      'and it never recovers. Fixes: <b>exponential backoff + full jitter</b>, a <b>retry budget</b> (e.g. retries capped at 10% of requests), ' +
      '<b>circuit breakers</b> (Ch 13) so clients stop hammering a failing backend, and server-side <b>load shedding</b> that sheds retried/low-priority traffic first.</p></div>' +
      '<p><b>Degrade gracefully:</b> under overload, return a cheaper answer — a smaller/cached model, fewer retrieved docs, a non-personalised default — ' +
      'rather than a 500. A worse answer on time beats a perfect answer that never comes (see Ch 10).</p>',
      try: [
        ['📖 AWS — timeouts, retries, and backoff with jitter', 'https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/', 'o'],
        ['🏗️ Ch 13 — retries, timeouts & circuit breakers', '#ch13', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Autoscale on CPU for a GPU model       Scale on QPS / queue depth / GPU util / TTFT — leading signals.\n' +
      '                                       CPU barely moves while the GPU and queue are saturated.\n' +
      'Warm floor = average load             Floor = a plausible spike you cannot scale into fast enough.\n' +
      '                                       GPU nodes take minutes; you must already be holding the buffer.\n' +
      'Unbounded queue "so we never drop"     An unbounded queue converts an overload into a latency\n' +
      '                                       catastrophe + OOM. Bound it; 429 the overflow.\n' +
      'Retries with no backoff / jitter        Exponential backoff + full jitter + a retry budget. Naive\n' +
      '                                       retries are a self-inflicted DDoS.\n' +
      'One queue for all traffic              Priority lanes: interactive vs batch, paid vs free, critical vs\n' +
      '                                       optional. Shed the low lane first.\n' +
      'Batch size cranked for throughput      Set it against the p99 SLO. Huge batches wreck tail latency.\n' +
      'No graceful degradation                Have a cheaper fallback path (small/cached model, fewer docs)\n' +
      '                                       for overload, instead of 5xx.\n' +
      'Scale-to-zero on latency-critical LLM   Keep ≥1 warm; scale-to-zero only for spiky, tolerant models.</code></pre>' +
      '<p><b>The overload truth:</b> when arrival rate exceeds service rate, no amount of buffering saves you — the queue grows without bound. ' +
      'The only stable responses are "add capacity fast enough" or "serve less" (shed/degrade). Design both before launch.</p>',
      try: [
        ['📖 Google SRE Book — Addressing Cascading Failures', 'https://sre.google/sre-book/addressing-cascading-failures/', 'o'],
        ['📡 Part 8: burn-rate alerting on the SLO', '../learn8/#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Why is CPU a poor autoscaling signal for a GPU inference service?\n' +
      "A: The GPU and the request queue saturate long before CPU does, so CPU-based HPA under-scales. Scale on\n" +
      '   QPS, queue depth, GPU utilisation, or TTFT — signals that actually track load and lead the SLO.\n\n' +
      'Q: Traffic 5×s in 90 s but GPU nodes take 3 minutes to join. How do you survive the gap?\n' +
      '   A: You must already be holding the buffer: a warm replica floor sized for a plausible spike, plus\n' +
      '   over-provisioned low-priority pods that evict instantly to free capacity. Meanwhile a bounded queue +\n' +
      '   429 rejects overflow fast instead of letting it hang.\n\n' +
      'Q: What is wrong with an unbounded request queue?\n' +
      'A: If arrival rate exceeds service rate, the queue grows without limit — latency explodes and the process\n' +
      '   OOMs. Bound the queue and shed (429 + Retry-After) once full. Buffering cannot fix a sustained overload.\n\n' +
      'Q: How do you stop a brief dependency blip becoming a retry-storm outage?\n' +
      '   A: Exponential backoff with full jitter, a retry budget (retries ≤ ~10% of traffic), circuit breakers\n' +
      '   so clients back off a failing backend, and server-side shedding that drops retried/low-priority\n' +
      '   requests first.\n\n' +
      'Q: You need higher GPU throughput. What does bigger batching cost you?\n' +
      "A: Tail latency. Larger batches raise throughput but add queue-wait and per-step time; set max batch\n" +
      '   size and max queue delay against the p99 SLO, not to maximise tokens/s in isolation.\n\n' +
      'Q: Define graceful degradation for an LLM service under overload.\n' +
      '   A: Instead of 5xx, serve a cheaper answer: a cached/semantic response, a smaller model, fewer\n' +
      '   retrieved documents, or a non-personalised default — a worse answer delivered on time.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch2">Ch 2</a> (sizing), <a href="#ch4">Ch 4</a> (batching in the runtime), <a href="#ch10">Ch 10</a> (fallback models &amp; degradation), ' +
      '<a href="#ch13">Ch 13</a> (client-side resilience), and <a href="../learn7/#ch6">Part 7 Ch 6</a> (K8s autoscaling).</p>',
      try: [
        ['📖 Kubernetes — pod priority & preemption', 'https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/', 'o'],
        ['📖 Karpenter — just-in-time node provisioning', 'https://karpenter.sh/docs/concepts/', 'o']
      ] }
  ],

  quiz: [
    { q: 'Which is the better autoscaling signal for a GPU-bound inference deployment?',
      opts: [
        'Container CPU utilisation',
        'QPS, request-queue depth, GPU utilisation, or time-to-first-token — signals that track actual load and lead the latency SLO',
        'Node disk usage',
        'Number of log lines per second'],
      ok: 1,
      why: 'A GPU model saturates the GPU and the queue while CPU stays low, so CPU-based scaling reacts late or not at all. Load- and latency-oriented signals scale in time.' },
    { q: 'Why is an unbounded request queue a bad way to "never drop a request"?',
      opts: [
        'Queues are not allowed in Kubernetes',
        'If arrival rate exceeds service rate for any sustained period, the queue grows without bound — latency explodes and the process runs out of memory',
        'It makes requests arrive out of order',
        'It disables autoscaling'],
      ok: 1,
      why: 'Buffering only smooths short bursts. A sustained overload must be met by adding capacity fast enough or by shedding/degrading load; an unbounded queue just converts overload into a worse failure.' },
    { q: 'A 2-second backend blip triggers immediate client retries and the system never recovers. Best combination of fixes?',
      opts: [
        'Retry more aggressively with no delay',
        'Exponential backoff with full jitter, a retry budget capping retries as a fraction of traffic, circuit breakers, and server-side shedding of retried/low-priority requests first',
        'Remove all timeouts so requests wait forever',
        'Scale to zero during the blip'],
      ok: 1,
      why: 'Naive synchronized retries multiply load exactly when the system is weakest. Backoff+jitter, a retry budget, circuit breaking and prioritised shedding break the feedback loop.' }
  ]
};
