/* AI-ML Learn — Part 6 · Chapter 3: Serving Architectures — Online, Batch, Streaming */
window.CH[3] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>There are only three ways to run a model in production, and picking the wrong one is the most expensive mistake in the design:</p>' +
      '<pre><code>ONLINE     a request comes in, you score it now, you answer now     (chatbot, fraud check, search rank)\n' +
      'BATCH      score a big pile on a schedule, store the results       (nightly recommendations, churn scores)\n' +
      'STREAMING  score events as they flow through a pipeline            (clickstream features, anomaly flags)</code></pre>' +
      '<p>The question that decides it: <b>does a human (or a live request) need the answer within a second, right now?</b> ' +
      'If yes → online. If "sometime today is fine" → batch. If "as the data arrives, continuously" → streaming.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Photo printing.</b> Online is the instant photo booth — you wait, you walk out with the print. ' +
      'Batch is dropping a roll at the lab and picking up prints tomorrow — far cheaper per photo. Streaming is a security camera that ' +
      'processes every frame as it comes, forever.</p></div>',
      try: [
        ['📖 Chip Huyen — batch vs online prediction', 'https://huyenchip.com/2020/12/27/real-time-machine-learning.html', 'o'],
        ['🏗️ Ch 1 — the system-design map (the SERVE step)', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>Cross-cutting choices layered on top:</p>' +
      '<pre><code>SYNC vs ASYNC       sync = caller blocks for the result (online). async = caller gets a ticket, polls\n' +
      '                   or gets a webhook later (long jobs — see Ch 12).\n' +
      'REQUEST/RESPONSE   direct HTTP/gRPC to the model service. Simple, tight latency, backpressure = 429.\n' +
      'QUEUE-BACKED       producer → queue → worker pool → model. Absorbs spikes, decouples, at-least-once.\n' +
      'THE INFERENCE GATEWAY   one front door for all models: authn/z, rate limits, routing by model+version,\n' +
      '                   request/response logging, retries, fallback, cost metering. (Envoy / an API gateway /\n' +
      '                   a purpose-built LLM gateway.)</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard shape for online serving is <b>a stateless model service behind a gateway</b>: ' +
      'Kubernetes <code>Deployment</code> + <code>Service</code>, an ingress/API gateway (or <b>Envoy</b>) doing auth, routing and retries, and an ' +
      'HPA/KEDA autoscaler. For batch, the standard is an <b>orchestrator</b> (Airflow / Dagster / a Kubernetes <code>Job</code> / Spark) writing to a store. ' +
      'For streaming, <b>Kafka + a stream processor</b> (Flink / Kafka Streams / Spark Structured Streaming). ' +
      'You are assembling these components, not writing a serving framework.</p></div>' +
      '<p>Many real systems are hybrids: <b>precompute in batch, serve online from the cache</b> (candidate lists, embeddings), ' +
      'and fall back to online scoring only for cache misses or cold users.</p>',
      try: [
        ['📖 Envoy — what is Envoy / edge & service proxy', 'https://www.envoyproxy.io/docs/envoy/latest/intro/what_is_envoy', 'o'],
        ['📖 Confluent — stream processing concepts', 'https://developer.confluent.io/courses/stream-processing/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Recommendations: batch-precompute + online re-rank.</b> ' +
      'Full personalised ranking for 40M users online would need a huge GPU fleet. Instead a nightly <b>batch</b> job scores each user\'s top ~500 candidates ' +
      'and writes them to a KV store. At request time an <b>online</b> service reads the 500, applies a small real-time re-ranker with fresh signals ' +
      '(time of day, last few clicks), and returns 10. 95% of the cost moved to cheap off-peak batch; the online path is a fast lookup + tiny model.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Fraud: streaming features, online decision.</b> ' +
      'The score must return inside the payment authorization (&lt; 300 ms), so the decision is <b>online</b>. But the useful features — ' +
      '"transactions in the last 1h / 24h for this card" — are aggregates that must be current. A <b>streaming</b> job (Flink on the transaction topic) ' +
      'maintains those windows and writes them to a low-latency store; the online scorer just reads them. Online for the verdict, streaming for the inputs.</p></div>' +
      '<p><b>The gateway earns its keep here:</b> both scenarios route through one inference gateway that enforces the per-caller rate limit, ' +
      'attaches a <code>trace_id</code>, tries the primary model then a fallback, logs the request/response pair for eval, and meters cost per team.</p>',
      try: [
        ['📖 Uber — Michelangelo (batch + online serving)', 'https://www.uber.com/blog/michelangelo-machine-learning-platform/', 'o'],
        ['🏗️ Ch 5 — feature stores & the offline/online split', '#ch5', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Online-score everything "to be safe"   If the answer is only consumed on a schedule or can be stale for\n' +
      '                                       minutes, batch it — 10–100× cheaper, simpler, no latency SLO.\n' +
      'Batch job that is really 1000s of       If it must react within seconds of an event, that is streaming.\n' +
      '  tiny cron runs                        Batch is for volume on a cadence, not for freshness.\n' +
      'Direct client → model, no gateway       You lose central auth, rate limiting, routing, fallback, logging,\n' +
      '                                       cost attribution. Add the front door before you have 5 callers.\n' +
      'Queue-backed everything                 A queue adds latency + at-least-once duplicates + ordering\n' +
      '                                       questions. Use it to absorb spikes / decouple slow work, not by\n' +
      '                                       default for a 50 ms request.\n' +
      'Stateful model pods (session in RAM)   Keep pods stateless; put session/context in a store so any pod\n' +
      '                                       can serve any request and autoscaling/rollout is safe.\n' +
      'Sync call to a 30 s job                 Make it async: return a job id, deliver via poll or webhook\n' +
      '                                       (Ch 12). Holding an HTTP connection for 30 s wastes capacity.</code></pre>' +
      '<p><b>Freshness vs cost is the real axis.</b> Rank options by how stale the output may be: seconds → online/streaming; ' +
      'hours → batch. Then pick the cheapest architecture that meets that bound.</p>',
      try: [
        ['📖 Google — MLOps: continuous delivery & automation pipelines', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'o'],
        ['🏗️ Ch 12 — async & event-driven inference', '#ch12', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: How do you decide online vs batch vs streaming?\n' +
      'A: By the freshness the consumer needs. A live request/human needs it in <1 s → online. "Sometime today"\n' +
      '   and consumed on a schedule → batch (much cheaper). Must react continuously as events arrive → streaming.\n' +
      '   Many systems combine: batch-precompute, serve online from cache, stream the fast-changing features.\n\n' +
      'Q: What does an inference gateway do and why not let clients call the model directly?\n' +
      'A: One front door: authentication/authorization, rate limiting & quotas, routing by model+version,\n' +
      '   retries + fallback model, request/response logging for eval, and cost metering per caller. Direct\n' +
      '   client→model means reimplementing all of that per client and having no central control point.\n\n' +
      'Q: When is a queue-backed architecture worth its downsides?\n' +
      'A: When you must absorb bursty load without dropping work, decouple a slow/expensive step from the\n' +
      '   caller, or get ret/replay for reliability. Downsides: added latency, at-least-once duplicates (need\n' +
      '   idempotency), and ordering caveats. Not for a plain 50 ms sync request.\n\n' +
      'Q: Recommendations for 50M users with tight feed-load latency — architecture?\n' +
      'A: Batch-precompute each user\'s candidate set + base scores nightly into a KV store; online path reads\n' +
      '   the candidates and runs a lightweight re-ranker with real-time signals. Cost sits in cheap off-peak\n' +
      '   batch; the online hop is a lookup plus a small model.\n\n' +
      'Q: Your fraud model must score inside a 300 ms payment call but needs "spend in last hour" features.\n' +
      'A: Online decision, streaming features. A stream processor maintains the rolling-window aggregates from\n' +
      "   the transaction topic and writes them to a fast store; the online scorer reads them — it doesn't\n" +
      '   compute them in the request path.\n\n' +
      'Q: Why keep model pods stateless?\n' +
      'A: So any replica can serve any request, autoscaling and rolling deploys are safe, and a pod crash loses\n' +
      '   nothing. Session/context/KV state goes in an external store, not pod memory.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch4">Ch 4</a> for what runs inside the model service, <a href="#ch8">Ch 8</a> for the precompute cache, ' +
      '<a href="#ch14">Ch 14</a> for the gateway\'s API contract, and <a href="#ch5">Ch 5</a> for the feature store both paths read.</p>',
      try: [
        ['📖 AWS — batch vs real-time inference (SageMaker)', 'https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html', 'o'],
        ['📖 Netflix — system architectures for personalization', 'https://netflixtechblog.com/system-architectures-for-personalization-and-recommendation-e081aa94b5d8', 'o']
      ] }
  ],

  quiz: [
    { q: 'A recommendation list is refreshed once per day and read from a cache on every page load. Which serving mode fits best?',
      opts: [
        'Online synchronous scoring on every page load',
        'Batch — score on a schedule, write results to a store, serve them from the cache',
        'Streaming per keystroke',
        'It cannot be served at all'],
      ok: 1,
      why: 'If the output only needs to be as fresh as "daily" and is consumed from a cache, batch scoring is far cheaper and simpler than scoring online for every request.' },
    { q: 'What is the primary role of an inference gateway?',
      opts: [
        'To train models faster',
        'A single front door for all model traffic: auth, rate limiting/quotas, routing by model+version, retries/fallback, logging, and cost metering',
        'To store model weights',
        'To replace Kubernetes'],
      ok: 1,
      why: 'The gateway centralises the cross-cutting concerns so every client does not reimplement auth, limits, routing, fallback and logging — and so you have one place to observe and control model traffic.' },
    { q: 'A fraud score must be returned within the 300 ms payment authorization but needs up-to-the-second "spend in the last hour" features. Best split?',
      opts: [
        'Batch-score the transaction overnight',
        'Online decision in the request path; a streaming job maintains the rolling-window aggregates and writes them to a fast store the scorer reads',
        'Compute the hour-long aggregate inside the 300 ms request by scanning all transactions',
        'Drop the time-window features'],
      ok: 1,
      why: 'The verdict is latency-critical (online), but recomputing rolling aggregates in-request is too slow — a stream processor keeps them current out-of-band so the online scorer just reads them.' }
  ]
};
