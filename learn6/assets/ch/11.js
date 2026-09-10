/* AI-ML Learn — Part 6 · Chapter 11: Cost & Performance Tradeoffs */
window.CH[11] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Two systems can serve the same model with a 10× difference in bill. The gap is almost never the model — it is <b>how well the hardware is used</b>: ' +
      'batch size, precision, cache hits, idle GPUs, and whether you rented the right chip.</p>' +
      '<pre><code>cost per request ≈  (GPU $/hour × GPUs)  /  (requests/hour served)\n' +
      '                =  GPU $/hour  /  (throughput per GPU)\n' +
      '  → to cut cost: raise throughput per GPU, or lower GPU $/hour, or serve fewer model calls (cache).</code></pre>' +
      '<p>Performance is the same lever seen from the other side: the thing that makes a GPU cheaper per request (bigger batches, smaller weights, fewer tokens) ' +
      'usually also changes latency — sometimes for the better, sometimes not. You have to look at both.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A bus vs. a taxi.</b> A half-empty bus (batch size 1 on a big GPU) costs a fortune per passenger. ' +
      'Fill the seats (batching) and the per-passenger cost collapses — but each passenger waits a little longer at the stop. A smaller bus (quantized model) ' +
      'is cheaper to run but carries less nuance.</p></div>',
      try: [
        ['📖 The roofline model — explained', 'https://en.wikipedia.org/wiki/Roofline_model', 'o'],
        ['🐍 Part 1: quantization & the serving roofline from scratch', '../learn/#ch8', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>ROOFLINE     a kernel is either COMPUTE-bound or MEMORY-bandwidth-bound.\n' +
      '             LLM decode (batch 1) = memory-bound → the GPU is mostly idle waiting on weights.\n' +
      '             Batching adds work per weight load → moves you toward compute-bound → higher tokens/s/$.\n' +
      'QUANTIZATION  fp16 → int8 / fp8 / int4 (AWQ, GPTQ, SmoothQuant). ~2-4× smaller + faster, small quality\n' +
      '             loss. Weight-only vs weight+activation. Measure quality on YOUR evals after.\n' +
      'DISTILLATION  train a small model to mimic a big one. Big upfront cost, permanent inference savings.\n' +
      'SPECULATIVE DECODING   a draft model proposes tokens, the big model verifies in parallel → lower latency.\n' +
      'PRUNING / MoE   fewer active params per token.\n' +
      'HARDWARE $   on-demand > 1-yr commit/reserved (~40-60% off) > spot (~60-90% off, can be reclaimed).\n' +
      '             Right-size the GPU: a 7B model on an 80 GB card wastes most of it.\n' +
      'UTILISATION  the silent cost: GPUs allocated but idle. Bin-pack, share (MIG/MPS), scale down off-peak.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The analysis standard is the <b>roofline model</b> + a <b>benchmark</b> ' +
      '(vLLM/GenAI-Perf/MLPerf Inference) on your hardware. The optimisation standards: <b>continuous batching</b> (runtime), <b>int8/fp8 quantization</b> ' +
      '(TensorRT-LLM, AWQ, GPTQ, llm-compressor), <b>speculative decoding</b>, and <b>spot + committed-use pricing</b>. On the cost-management side, ' +
      'the <b>FinOps Foundation</b> practice (unit economics, showback). You measure and tune within these; you do not invent a new decoding scheme.</p></div>',
      try: [
        ['📖 NVIDIA — TensorRT-LLM (quantization, speculative decoding)', 'https://nvidia.github.io/TensorRT-LLM/', 'o'],
        ['📖 MLPerf Inference — benchmark results', 'https://mlcommons.org/benchmarks/inference-datacenter/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Batch size 1 is burning money.</b> ' +
      'An LLM endpoint runs at 8% GPU compute utilisation — classic memory-bound decode with no batching. Turning on <b>continuous batching</b> ' +
      'and allowing batches up to 32 takes throughput from ~180 to ~2 400 tokens/s on the same GPU (13×), so cost per 1k tokens drops ~13×. ' +
      'p50 latency rises ~15%, p99 ~30% — within SLO. One config change, an order-of-magnitude saving.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Quantize, but verify.</b> ' +
      'A team switches a 13B model from fp16 to int4 (AWQ): 3.5× less VRAM, fits on a cheaper GPU, ~2× throughput. ' +
      'But their extraction task\'s exact-match score drops from 91% to 84% — unacceptable. They step back to <b>int8 / fp8</b>: 2× smaller, ' +
      '~1.6× throughput, exact-match 90.4%. The lesson: quantization quality loss is task-dependent — always re-run <i>your</i> evals on the final quantized artifact.</p></div>' +
      '<p><b>Attack order (biggest lever first):</b> (1) cache to remove calls, (2) batch to fill the GPU, (3) right-size the GPU + commit/spot pricing, ' +
      '(4) quantize with eval verification, (5) speculative decoding / smaller or distilled model, (6) kill idle allocation. ' +
      'Re-derive <code>cost per successful request</code> after each step.</p>',
      try: [
        ['📖 vLLM — performance & benchmarking guide', 'https://docs.vllm.ai/en/latest/serving/benchmarks.html', 'o'],
        ['📡 Part 8: cost observability — cost per successful request', '../learn8/#ch13', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Optimise the model before the system   Cache + batching + utilisation usually dwarf model-level gains\n' +
      '                                       and are free. Do them first.\n' +
      'Quantize, ship, do not re-eval          Quality loss is task-specific. Run your eval suite on the exact\n' +
      '                                       quantized artifact; pick the least aggressive level that passes.\n' +
      'Biggest GPU "to be safe"               Right-size to the model + batch. Idle HBM is pure cost. Use MIG/\n' +
      '                                       MPS to share, or a smaller card.\n' +
      'All on-demand pricing                  Base load on 1-yr committed/reserved (~40-60% off); burst on\n' +
      '                                       spot (~60-90% off) with checkpointing + graceful preemption.\n' +
      'Batch size maxed for throughput        Bound it by the p99 SLO. Throughput-optimal batch can violate\n' +
      '                                       latency.\n' +
      'GPUs allocated 24/7 at 20% util         Autoscale down off-peak; bin-pack; move batch jobs to the trough.\n' +
      '                                       Utilisation is the hidden line item.\n' +
      'No unit-cost metric                    Track cost per successful request / per 1k tokens as a dashboard.\n' +
      '                                       You cannot optimise what you do not measure.\n' +
      'Distill/prune without a payback calc    Upfront training cost must amortise over projected inference\n' +
      '                                       volume within a sane horizon.</code></pre>' +
      '<p><b>Latency has its own knobs</b> that are not throughput: speculative decoding, prefix caching, a smaller model for the first draft, ' +
      'shorter max-tokens, and streaming (TTFT is what users feel). Optimise the metric the SLO names, not "speed" in the abstract.</p>',
      try: [
        ['📖 FinOps Foundation — cloud unit economics', 'https://www.finops.org/framework/capabilities/unit-economics/', 'o'],
        ['🏢 Part 9: FinOps at scale (GPU fleet economics)', '../learn9/#ch8', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: An LLM endpoint sits at 8% GPU compute utilisation. What is happening and what is the first fix?\n' +
      '   A: Memory-bandwidth-bound decode with little/no batching — the GPU idles waiting on weight loads.\n' +
      '   First fix is continuous batching: more work per weight load moves it toward compute-bound and can lift\n' +
      "   tokens/s/$ by an order of magnitude, for a modest latency increase you check against the SLO.\n\n" +
      'Q: Give the cost-per-request formula and the three ways to reduce it.\n' +
      '   A: cost/req ≈ (GPU $/hr × GPUs) / (requests/hr). Reduce by: raising throughput per GPU (batching,\n' +
      '   quantization, better kernels), lowering GPU $/hr (right-size, committed/spot pricing), or serving\n' +
      '   fewer model calls (caching).\n\n' +
      'Q: You quantized fp16 → int4 and a downstream task score dropped 7 points. What now?\n' +
      '   A: Back off to a lighter scheme (int8/fp8), which usually recovers most quality while still ~2×\n' +
      "   smaller/faster. Quantization loss is task-specific — pick the least aggressive level that passes your\n" +
      '   eval suite on the actual quantized artifact.\n\n' +
      'Q: When is spot / preemptible GPU capacity appropriate?\n' +
      '   A: For interruption-tolerant work — batch scoring, offline eval, training with checkpointing, and\n' +
      '   burst capacity above a committed baseline — with graceful preemption handling. Not for the\n' +
      "   latency-critical steady-state fleet unless you can absorb reclaims instantly.\n\n" +
      'Q: What is the "hidden" cost people miss?\n' +
      '   A: Utilisation — GPUs allocated but idle (over-provisioned, not scaled down off-peak, poor bin-packing,\n' +
      '   a 7B model alone on an 80 GB card). Often the single biggest saving.\n\n' +
      'Q: Latency SLO is "first token < 800 ms". Which optimisations help vs hurt?\n' +
      '   A: Help: prefix caching, speculative decoding, a smaller model, streaming, shorter prompts. Hurt:\n' +
      '   large batches (queue wait raises TTFT). Optimise for TTFT specifically, not generic throughput.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch2">Ch 2</a> (deriving GPU count), <a href="#ch4">Ch 4</a> (runtimes &amp; quantized formats), <a href="#ch8">Ch 8</a> (caching), ' +
      '<a href="../learn8/#ch13">Part 8 Ch 13</a> (cost observability), and <a href="../learn9/#ch8">Part 9 Ch 8</a> (fleet FinOps).</p>',
      try: [
        ['📖 NVIDIA — Multi-Instance GPU (MIG) & MPS', 'https://docs.nvidia.com/datacenter/tesla/mig-user-guide/', 'o'],
        ['📖 Speculative decoding — the paper (Leviathan et al.)', 'https://arxiv.org/abs/2211.17192', 'o']
      ] }
  ],

  quiz: [
    { q: 'An LLM inference GPU shows 8% compute utilisation. What is the cause and the highest-leverage fix?',
      opts: [
        'The model is too small; use a bigger model',
        'Decode is memory-bandwidth-bound with little batching — the GPU idles waiting on weights; enable continuous batching to do more work per weight load',
        'The GPU is broken; replace it',
        'Too many replicas; scale down'],
      ok: 1,
      why: 'Batch-1 LLM decode is memory-bound. Batching amortises the weight loads across many sequences, pushing toward compute-bound and multiplying tokens/s per GPU.' },
    { q: 'You quantized a model from fp16 to int4 and a key task metric fell sharply. Best response?',
      opts: [
        'Ship it anyway — quantization is always fine',
        'Step back to a lighter scheme (int8/fp8) and re-run your own eval suite on the exact quantized artifact, choosing the least aggressive level that still passes',
        'Return to fp32',
        'Retrain from scratch'],
      ok: 1,
      why: 'Quantization quality loss is task-dependent. The right process is to evaluate each candidate precision on your real tasks and pick the least aggressive one that meets quality.' },
    { q: 'Which is typically the largest hidden contributor to inference cost?',
      opts: [
        'The choice of programming language',
        'Low GPU utilisation — allocated-but-idle GPUs from over-provisioning, no off-peak scale-down, poor bin-packing, or oversized cards',
        'Logging verbosity',
        'The number of HTTP headers'],
      ok: 1,
      why: 'Paying for GPUs that sit idle is pure waste and often exceeds any model-level optimisation. Autoscaling, bin-packing, sharing (MIG/MPS) and right-sizing recover it.' }
  ]
};
