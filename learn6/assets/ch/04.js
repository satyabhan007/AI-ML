/* AI-ML Learn — Part 6 · Chapter 4: Model Serving Standards */
window.CH[4] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>You wrapped your model in a Flask app once. It worked, then it fell over: no batching, one request at a time, no GPU sharing, no metrics, a 4-minute cold start. ' +
      'A <b>serving runtime</b> is the piece of software that solves all of that so you do not re-solve it per model.</p>' +
      '<pre><code>a serving runtime gives you, out of the box:\n' +
      '  • an HTTP + gRPC API with a stable schema\n' +
      '  • dynamic batching (merge concurrent requests into one GPU call)\n' +
      '  • multi-model hosting on one GPU, model versioning, warm loading\n' +
      '  • health checks, Prometheus metrics, tracing hooks\n' +
      '  • GPU-aware concurrency, request queuing, timeouts</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A restaurant kitchen line vs. cooking one plate at a time.</b> ' +
      'Your Flask app is one cook making one dish start-to-finish before starting the next. A serving runtime is a line: orders batched by station, ' +
      'grills always hot, tickets queued, throughput many times higher for the same stoves.</p></div>',
      try: [
        ['📖 NVIDIA Triton — architecture overview', 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/architecture.html', 'o'],
        ['🐍 Part 1: what serving actually costs (KV-cache, batching)', '../learn/#ch8', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>The runtimes you will actually be asked about, and what each is <i>for</i>:</p>' +
      '<pre><code>vLLM          LLM inference. PagedAttention KV-cache + continuous batching → the throughput leader\n' +
      '              for open-weight LLMs. OpenAI-compatible API. Reach for this to self-host an LLM.\n' +
      'TGI           Hugging Face Text Generation Inference. Similar niche to vLLM; tight HF ecosystem fit.\n' +
      'SGLang        LLM serving with fast structured output / prefix caching; strong for agent + JSON workloads.\n' +
      'Triton        NVIDIA\'s general server. ANY framework (TensorRT, ONNX, PyTorch, Python), multi-model,\n' +
      '              model ensembles, best raw GPU utilisation for classic models. Not LLM-specialised (but\n' +
      '              has a TensorRT-LLM backend).\n' +
      'TorchServe    PyTorch-native serving. Simple for a single PyTorch model; less active lately.\n' +
      'BentoML       Packaging + serving framework: wrap any Python inference in a "Bento", get an API,\n' +
      '              adaptive batching, and build → containerise → deploy. Good developer ergonomics.\n' +
      'Ray Serve     Python-native, great for multi-step / multi-model pipelines and fractional GPUs.\n' +
      'KServe        NOT a runtime — a Kubernetes CRD (InferenceService) that RUNS the above with autoscaling\n' +
      '              (incl. scale-to-zero), canary, and a standard prediction protocol (Open Inference Protocol).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>Two standards make these interchangeable: the ' +
      '<b>Open Inference Protocol (OIP / KServe v2)</b> — one predict API shape across Triton, KServe and others — and the ' +
      '<b>OpenAI-compatible <code>/v1/chat/completions</code> API</b>, which vLLM, TGI, SGLang and most gateways now speak. ' +
      'Design against those APIs and you can swap the runtime underneath without touching callers.</p></div>',
      try: [
        ['📖 vLLM — docs & OpenAI-compatible server', 'https://docs.vllm.ai/en/latest/serving/openai_compatible_server.html', 'o'],
        ['📖 KServe — Open Inference Protocol (v2)', 'https://kserve.github.io/website/latest/modelserving/data_plane/v2_protocol/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Self-hosting an open-weight chat model.</b> ' +
      'Requirements: high tokens/sec/GPU, streaming, an OpenAI-shaped API so the existing SDK just works. Choice: <b>vLLM</b> ' +
      '(continuous batching + PagedAttention give the best throughput/$), deployed as a <b>KServe InferenceService</b> for autoscaling and canary. ' +
      'The gateway (Ch 3) speaks the same OpenAI API, so switching a route from a vendor to this self-hosted model is a config change.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Serving 30 small classic models (fraud, ranking, churn, CV) on shared GPUs.</b> ' +
      'These are ONNX / TensorRT / sklearn, not LLMs. Choice: <b>Triton</b> — one server hosts all 30 with per-model config, dynamic batching, ' +
      'concurrent model instances per GPU, and an ensemble that chains preprocess → model → postprocess in-server. One deployment, ' +
      'high GPU utilisation, per-model metrics. vLLM/TGI would be the wrong tool — they only serve LLMs.</p></div>' +
      '<p><b>Decision shortcut:</b> LLM you host yourself → vLLM/TGI/SGLang. Many/any-framework models on shared GPUs → Triton. ' +
      'Python pipeline with custom logic → BentoML or Ray Serve. Running any of them on Kubernetes with autoscaling/canary → wrap in KServe.</p>',
      try: [
        ['📖 Triton — model configuration & dynamic batching', 'https://docs.nvidia.com/deeplearning/triton-inference-server/user-guide/docs/user_guide/model_configuration.html', 'o'],
        ['🏗️ Ch 9 — batching, concurrency & autoscaling on GPU', '#ch9', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Hand-rolled Flask/FastAPI + torch      Fine for a prototype; in prod you will reinvent batching, model\n' +
      '                                       mgmt, metrics, GPU concurrency badly. Use a runtime.\n' +
      'vLLM for a ranking / CV / sklearn model  vLLM is LLM-only. Use Triton, BentoML, or a plain container.\n' +
      'Triton for one open-weight LLM          Works, but vLLM/TGI usually give more tokens/s/$ with less config.\n' +
      'Coupling callers to a runtime\'s native   Put a gateway in front and expose OIP or the OpenAI API. Swap\n' +
      '  API                                   the runtime later without a client migration.\n' +
      'One giant model instance per GPU        Set concurrent instances / batch size from a load test — often\n' +
      '                                       2–4 instances or batch 16–64 doubles throughput.\n' +
      'Scale-to-zero on a latency-critical      Cold start for a big model is 30–300 s. Keep ≥1 warm replica;\n' +
      '  LLM                                   scale-to-zero only for spiky, latency-tolerant models.\n' +
      'Ignoring the model format               TensorRT / TensorRT-LLM / AWQ / GPTQ compilation can 2–4× it —\n' +
      '                                       but adds a build step and a hardware lock. Measure, then decide.</code></pre>' +
      '<p><b>KServe vs "just a Deployment":</b> KServe adds request-driven autoscaling (incl. scale-to-zero via Knative), canary splits, ' +
      'and a standard protocol — worth it on a multi-model platform. For one steady high-QPS service, a plain Deployment + HPA is less machinery.</p>',
      try: [
        ['📖 KServe — autoscaling (Knative / KPA, scale-to-zero)', 'https://kserve.github.io/website/latest/modelserving/autoscaling/autoscaling/', 'o'],
        ['🚀 Part 7: Kubernetes for model workloads', '../learn7/#ch6', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What does a model serving runtime give you that a Flask wrapper does not?\n' +
      'A: Dynamic/continuous batching, GPU-aware concurrency and queuing, multi-model hosting + versioning + warm\n' +
      '   loading, a stable HTTP+gRPC schema, health checks, and Prometheus metrics — the throughput and\n' +
      '   operability work you would otherwise redo per model.\n\n' +
      'Q: vLLM vs Triton — when each?\n' +
      'A: vLLM (or TGI/SGLang) for serving open-weight LLMs: PagedAttention + continuous batching give the best\n' +
      "   tokens/s/$ and an OpenAI-compatible API. Triton for many models across frameworks (ONNX, TensorRT,\n" +
      "   PyTorch, Python) on shared GPUs, with ensembles and top raw utilisation — it's not LLM-specialised.\n\n" +
      'Q: What is KServe and how does it relate to those runtimes?\n' +
      'A: KServe is a Kubernetes layer (the InferenceService CRD), not a runtime. It runs vLLM/Triton/etc. with\n' +
      '   request-based autoscaling (including scale-to-zero), canary rollout, and a standard prediction protocol\n' +
      '   (Open Inference Protocol).\n\n' +
      'Q: Why expose the OpenAI API or the Open Inference Protocol instead of a runtime\'s native API?\n' +
      '   A: It decouples callers from the runtime. You can move a route from a hosted vendor to self-hosted vLLM,\n' +
      '   or swap Triton for something else, as a config change — no client migration.\n\n' +
      'Q: Is scale-to-zero a good default for LLM endpoints?\n' +
      'A: No. Cold-loading a multi-GB model onto a GPU takes tens of seconds to minutes. Keep at least one warm\n' +
      '   replica for anything latency-sensitive; reserve scale-to-zero for spiky, latency-tolerant models.\n\n' +
      'Q: You measured low GPU utilisation on a Triton deployment. First knobs?\n' +
      'A: Increase dynamic-batch max size / queue delay, run multiple concurrent model instances per GPU, check\n' +
      '   the model is on the GPU and using the right precision, and confirm the client sends enough concurrency\n' +
      '   to fill a batch.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch9">Ch 9</a> (batching &amp; autoscaling), <a href="#ch11">Ch 11</a> (quantized formats &amp; the roofline), ' +
      '<a href="#ch3">Ch 3</a> (the gateway in front), and <a href="../learn7/#ch6">Part 7 Ch 6</a> (running them on K8s).</p>',
      try: [
        ['📖 BentoML — docs', 'https://docs.bentoml.com/en/latest/', 'o'],
        ['📖 Hugging Face TGI — docs', 'https://huggingface.co/docs/text-generation-inference/index', 'o']
      ] }
  ],

  quiz: [
    { q: 'You want to self-host an open-weight chat LLM with the best throughput per GPU and an API your existing OpenAI SDK can call. Best choice?',
      opts: [
        'A hand-written FastAPI wrapper around transformers',
        'vLLM (or TGI/SGLang) — continuous batching + PagedAttention, exposing the OpenAI-compatible API',
        'TorchServe with batch size 1',
        'scikit-learn'],
      ok: 1,
      why: 'vLLM is purpose-built for LLM inference: PagedAttention and continuous batching maximise tokens/s/$, and it serves an OpenAI-compatible endpoint so clients need no changes.' },
    { q: 'What is KServe?',
      opts: [
        'A GPU driver',
        'A Kubernetes layer (InferenceService CRD) that runs serving runtimes like vLLM or Triton with autoscaling, scale-to-zero, canary, and a standard prediction protocol',
        'A replacement for vLLM that serves LLMs faster',
        'A model training framework'],
      ok: 1,
      why: 'KServe orchestrates existing runtimes on Kubernetes and adds request-driven autoscaling, canary rollout and the Open Inference Protocol — it is not itself an inference engine.' },
    { q: 'Why put a gateway speaking the OpenAI API or Open Inference Protocol in front of your model runtimes?',
      opts: [
        'It makes the model more accurate',
        'It decouples callers from the runtime, so you can swap or relocate the model (vendor ↔ self-hosted, Triton ↔ other) as a config change with no client migration',
        'It is required by Kubernetes',
        'It disables batching'],
      ok: 1,
      why: 'A standard API contract at the front door means the serving implementation can change underneath without breaking every client.' }
  ]
};
