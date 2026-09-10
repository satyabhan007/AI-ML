/* AI-ML Learn — Part 7 · Chapter 7: Managed & Serverless Inference */
window.CH[7] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>You do not always have to run the Kubernetes, the GPUs, and the serving runtime yourself. <b>Managed inference</b> means a cloud service hosts the model ' +
      'behind an endpoint: you upload (or pick) a model, they handle the hardware, scaling, and patching; you pay per hour or per request.</p>' +
      '<pre><code>SELF-HOSTED        you run K8s + GPUs + vLLM/Triton. Max control, max ops burden, best $/token at scale.\n' +
      'MANAGED ENDPOINT   cloud runs it (SageMaker / Vertex / Azure ML endpoints). Less ops, some lock-in.\n' +
      'SERVERLESS         scale-to-zero, pay per request/duration. Great for spiky/low traffic; cold starts.\n' +
      'MODEL-AS-API       a vendor\'s hosted model (Bedrock / OpenAI / Anthropic / Vertex). Zero infra, per-token.</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Car ownership vs. rental vs. taxi.</b> Self-hosting is owning: cheapest per mile if you drive a lot, ' +
      'but you handle insurance, servicing and parking. A managed endpoint is a long rental. Serverless is a taxi you can leave idling for free. Model-as-API is just calling a ride whenever you need one.</p></div>',
      try: [
        ['📖 AWS — SageMaker inference options', 'https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html', 'o'],
        ['🚀 Ch 6 — the self-hosted alternative on Kubernetes', '#ch6', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>MANAGED ENDPOINT TYPES (SageMaker naming; Vertex/Azure similar)\n' +
      '  real-time        always-on instances behind an endpoint; predictable latency; you pay while up.\n' +
      '  serverless       scales 0→N per request; pay per ms of compute; COLD START on first hit / scale-up.\n' +
      '  async            queue + result to object storage; for large payloads / long jobs (Part 6 Ch 12).\n' +
      '  batch transform   score a dataset, no persistent endpoint.\n' +
      'COLD START     loading a multi-GB model = seconds to minutes. Mitigate: provisioned concurrency /\n' +
      '               min-instances, keep-warm pings, smaller model, snapshot/lazy-load.\n' +
      'DECISION AXES  traffic shape (steady vs spiky), scale ($/token at volume), latency SLO, control\n' +
      '               (custom kernels? quantization? routing?), compliance/data-residency, team ops capacity,\n' +
      '               portability / exit cost.\n' +
      'PORTABILITY    put a gateway + a standard API (OpenAI / OIP) in front so the backend can be swapped\n' +
      '               (Part 6 Ch 3, Ch 14). Keep prompts, evals, and the client contract vendor-neutral.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard managed platforms: <b>AWS SageMaker</b> (real-time / serverless / async / batch), ' +
      '<b>GCP Vertex AI Endpoints</b>, <b>Azure ML Online Endpoints</b>, and vendor <b>model APIs</b> (<b>Bedrock</b>, OpenAI, Anthropic, Vertex model garden). ' +
      'The portability standard is fronting them with the <b>OpenAI-compatible API</b> or <b>KServe OIP</b> plus a gateway. You choose per workload; the trade axes are well understood.</p></div>',
      try: [
        ['📖 GCP — Vertex AI predictions & endpoints', 'https://cloud.google.com/vertex-ai/docs/predictions/overview', 'o'],
        ['📖 Azure ML — managed online endpoints', 'https://learn.microsoft.com/en-us/azure/machine-learning/concept-endpoints-online', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Spiky internal tool → serverless wins.</b> ' +
      'An internal document-summariser gets ~200 requests during business hours and zero overnight. A self-hosted GPU deployment would idle 60%+ of the time. ' +
      'A <b>serverless endpoint</b> (or a per-token model API) costs near-zero off-peak. The cold-start penalty (~8 s on first morning hit) is acceptable for an ' +
      'internal tool; a small <b>provisioned-concurrency floor of 1</b> during work hours removes it for the common case.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>High steady volume → self-host, but keep the exit open.</b> ' +
      'A product feature runs 400 req/s, 24/7, on an open-weight LLM. At that volume, self-hosted vLLM on reserved GPUs is ~4-6× cheaper per token than a managed ' +
      'endpoint and lets the team use quantization + custom routing. They still put the <b>OpenAI-compatible gateway</b> in front and keep a <b>hosted model API as ' +
      'the configured fallback</b> — so a capacity incident or a future migration is a config change, not a rewrite.</p></div>' +
      '<p><b>Hybrid is normal:</b> baseline steady load on self-hosted, burst overflow to a managed/API backend, and the gateway routes by cost/latency/availability.</p>',
      try: [
        ['📖 AWS — SageMaker Serverless Inference & provisioned concurrency', 'https://docs.aws.amazon.com/sagemaker/latest/dg/serverless-endpoints.html', 'o'],
        ['🏗️ Part 6: the inference gateway & fallback chain', '../learn6/#ch10', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Self-host everything by default        For spiky/low/uncertain traffic, managed or serverless is cheaper\n' +
      '                                       and far less ops. Self-host when volume + control justify it.\n' +
      'Managed endpoint for 24/7 heavy load   At high steady volume, self-hosted on reserved/spot GPUs is\n' +
      '                                       usually 3-6× cheaper per token and allows quantization/routing.\n' +
      'Serverless with no warm floor          Provisioned concurrency / min-instances for the latency-critical\n' +
      '                                       path; accept cold starts only for tolerant workloads.\n' +
      'Coupling clients to a vendor SDK/format   Gateway + standard API (OpenAI/OIP). Keep prompts + evals +\n' +
      '                                       contract vendor-neutral so you can switch.\n' +
      'No cost model before choosing           Compute $/req for each option at your real traffic profile\n' +
      '                                       (steady + peak), including idle time and egress.\n' +
      'Ignoring data residency / compliance     Managed/API backends may process data in other regions or\n' +
      '                                       retain it. Check contractual + regulatory constraints (Part 9).\n' +
      'One backend, no fallback                Configure a secondary (managed or API) behind the gateway and\n' +
      '                                       exercise it continuously (Part 6 Ch 10).\n' +
      'Assuming managed = no tuning             You still own instance type, autoscaling limits, concurrency,\n' +
      '                                       timeouts, and (for endpoints) the container.</code></pre>' +
      '<p><b>The real trade is control vs. ops burden vs. unit cost, weighted by traffic shape.</b> Write the cost + latency + control comparison down for <i>your</i> ' +
      'numbers before committing — and keep the abstraction that lets you change your mind (Part 9 Ch 12).</p>',
      try: [
        ['📖 AWS — Bedrock (fully managed model API)', 'https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html', 'o'],
        ['🏢 Part 9: vendor & model portability', '../learn9/#ch12', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: When is a managed/serverless endpoint the right call over self-hosting on Kubernetes?\n' +
      '   A: Spiky, low, or uncertain traffic; a small team without GPU-ops capacity; or when time-to-market\n' +
      '   matters more than unit cost. Self-host when volume is high and steady and you need control\n' +
      '   (quantization, custom kernels, routing) — it is usually several times cheaper per token at scale.\n\n' +
      'Q: What is a cold start here and how do you mitigate it?\n' +
      '   A: Loading a multi-GB model onto a freshly provisioned instance — seconds to minutes on the first\n' +
      '   request or a scale-up. Mitigate with provisioned concurrency / min-instances, keep-warm traffic, a\n' +
      '   smaller model, or snapshot/lazy loading. Accept it only for latency-tolerant workloads.\n\n' +
      'Q: How do you keep the option to switch backends later?\n' +
      '   A: Put a gateway speaking a standard API (OpenAI-compatible / OIP) in front, keep prompts, evals and\n' +
      '   the client contract vendor-neutral, and configure a fallback backend you exercise continuously.\n\n' +
      'Q: 400 req/s, 24/7, open-weight LLM. Managed endpoint or self-host?\n' +
      '   A: Self-host on reserved (plus spot) GPUs with vLLM — at that steady volume it is typically 3-6×\n' +
      '   cheaper per token and lets you quantize and route. Still front it with a gateway + a hosted-API\n' +
      '   fallback.\n\n' +
      'Q: "Managed means no tuning" — true?\n' +
      '   A: No. You still choose instance type, autoscaling min/max, concurrency, timeouts, and (for custom\n' +
      '   endpoints) the serving container. Managed removes the cluster, not the configuration.\n\n' +
      'Q: What non-cost factor often decides this?\n' +
      '   A: Data residency / compliance — some managed or API backends process or retain data in other\n' +
      '   regions; contractual and regulatory constraints can rule an option out (Part 9 Ch 6).</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch6">Ch 6</a> (self-hosted on K8s), <a href="../learn6/#ch10">Part 6 Ch 10</a> (fallback), <a href="../learn6/#ch11">Part 6 Ch 11</a> (cost model), ' +
      '<a href="../learn9/#ch12">Part 9 Ch 12</a> (portability), <a href="../learn9/#ch6">Part 9 Ch 6</a> (compliance).</p>',
      try: [
        ['📖 GCP — Vertex AI Model Garden & managed APIs', 'https://cloud.google.com/vertex-ai/generative-ai/docs/model-garden/explore-models', 'o'],
        ['📖 AWS — choosing a SageMaker inference option', 'https://docs.aws.amazon.com/sagemaker/latest/dg/deploy-model.html#deploy-model-options', 'o']
      ] }
  ],

  quiz: [
    { q: 'For an internal tool with ~200 requests during business hours and none overnight, which option is usually most cost-effective?',
      opts: [
        'A dedicated always-on GPU deployment',
        'Serverless / scale-to-zero (or a per-token model API), optionally with a small provisioned-concurrency floor during work hours to hide cold starts',
        'Two self-hosted GPU clusters for redundancy',
        'Batch transform once a week'],
      ok: 1,
      why: 'A workload that is idle most of the day wastes an always-on GPU. Pay-per-request serverless costs near-zero off-peak; a tiny warm floor removes the cold-start hit for the common case.' },
    { q: 'You choose a managed endpoint now but want to avoid lock-in. What do you do?',
      opts: [
        'Use the vendor SDK everywhere for convenience',
        'Front the backend with a gateway speaking a standard API (OpenAI-compatible / OIP), keep prompts/evals/contract vendor-neutral, and configure a fallback backend you exercise continuously',
        'Copy the vendor\'s proprietary response format into your database schema',
        'Nothing — migration is always easy'],
      ok: 1,
      why: 'A standard API contract at the gateway plus vendor-neutral prompts, evals and client contracts makes switching or adding a backend a configuration change rather than a rewrite.' },
    { q: 'At 400 req/s of steady 24/7 traffic on an open-weight LLM, why is self-hosting typically chosen over a managed endpoint?',
      opts: [
        'Managed endpoints cannot serve LLMs',
        'At high steady volume, self-hosted vLLM on reserved/spot GPUs is usually several times cheaper per token and allows quantization and custom routing',
        'Self-hosting requires no operations work',
        'Managed endpoints have worse accuracy'],
      ok: 1,
      why: 'Managed convenience carries a per-token premium that dominates at high steady volume; owning the serving stack unlocks cost levers (quantization, batching config, routing) too.' }
  ]
};
