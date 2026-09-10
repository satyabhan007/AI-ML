/* AI-ML Learn — Part 8 · Chapter 15: Profiling & Continuous Profiling */
window.CH[15] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>A trace tells you <i>which span</i> is slow — "the model call took 900 ms". A <b>profile</b> tells you <i>which code</i> inside that span burned the time: ' +
      'which function, which line, which GPU kernel. It is the last zoom level, and it is where you find the hot 3% of code that costs 40% of the latency or the bill.</p>' +
      '<pre><code>METRICS   is something slow?          (aggregate)\n' +
      'TRACES    which step / service?        (per request)\n' +
      'PROFILES  which function / kernel / line?   (per CPU-second / GPU-second / byte allocated)\n' +
      'output: a FLAME GRAPH — width = time (or memory) spent in that call path.</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A household energy audit.</b> The bill says you use a lot of power (metric). Room sub-meters say it is ' +
      'the kitchen (trace). The audit with a clamp meter says it is the 20-year-old fridge running 24/7 (profile). Only the last one tells you what to actually replace.</p></div>',
      try: [
        ['📖 Brendan Gregg — flame graphs', 'https://www.brendangregg.com/flamegraphs.html', 'o'],
        ['📡 Ch 6 — traces localise the span; profiles localise the code', '#ch6', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>PROFILE TYPES\n' +
      '  CPU (on-CPU)     where CPU cycles go — sampling profiler (perf, pprof, py-spy, async-profiler).\n' +
      '  wall / off-CPU   where wall-clock goes incl. waiting (locks, I/O, GPU sync).\n' +
      '  memory / heap    allocations by call path — find leaks + churn.\n' +
      '  GPU              kernel time, occupancy, memory (Nsight Systems/Compute, PyTorch profiler,\n' +
      '                   torch.profiler, DCGM). "Is the GPU actually busy, and on what?"\n' +
      'CONTINUOUS PROFILING   sample a tiny % of every process ALL the time, store it, so you can ask\n' +
      '  "what was hot at 14:03 yesterday" and diff two time ranges / two deploys. Low overhead (~1-3%).\n' +
      'CORRELATION      link profiles to traces (span → the profile for that span) and to deploys.\n' +
      'FOR INFERENCE    common finds: tokenization / detokenization on the hot path, a Python pre/post-\n' +
      '                 process step blocking the GPU, small-batch kernels (GPU idle), a sync point,\n' +
      '                 an unbatched embedding call, JSON serialization of a huge response.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard: <b>sampling profilers</b> per language (pprof, py-spy, async-profiler, perf), ' +
      '<b>eBPF-based whole-fleet profilers</b> (<b>Parca</b>, <b>Pyroscope/Grafana</b>, <b>Polar Signals</b>, <b>Elastic Universal Profiling</b>), and for GPUs the ' +
      '<b>PyTorch profiler</b> + <b>NVIDIA Nsight</b> / <b>DCGM</b>. Continuous profiling is now part of the observability stack alongside metrics/traces/logs, and OTel ' +
      'has a profiling signal. You read flame graphs; the collectors are off the shelf.</p></div>',
      try: [
        ['📖 Grafana Pyroscope — continuous profiling', 'https://grafana.com/docs/pyroscope/latest/', 'o'],
        ['📖 PyTorch — profiler & trace viewer', 'https://pytorch.org/tutorials/recipes/recipes/profiler_recipe.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The GPU that was mostly idle.</b> ' +
      'An LLM endpoint has good throughput on paper but high cost per token. A GPU profile (Nsight / torch.profiler) shows the GPU is busy only 22% of the wall time — ' +
      'the rest is spent in a <b>Python post-processing</b> step (regex + JSON building on a 4k-token response) running on the CPU while the GPU waits, plus many ' +
      '<b>small-batch kernels</b>. Fixes: move post-processing off the hot path / vectorise it, raise the batch size, and overlap CPU work with GPU compute. ' +
      'Cost per token drops ~2.5x — invisible to metrics and traces, obvious in the profile.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The slow p99 that continuous profiling explained.</b> ' +
      'p99 latency stepped up after a deploy; the trace shows the model span is bigger but not why. <b>Diffing</b> the continuous profile before vs after the deploy shows ' +
      'a new call path: a tokenizer was reloaded per request instead of cached, adding 60 ms of CPU in <code>load_vocab</code>. A one-line fix (load once) removes it. ' +
      'The before/after profile diff is what pinned it to a specific function.</p></div>' +
      '<p><b>Workflow:</b> metric alert → trace to the slow/expensive span → profile (or the stored continuous profile for that window) to the function → fix → confirm ' +
      'with the next profile.</p>',
      try: [
        ['📖 Parca — continuous profiling with eBPF', 'https://www.parca.dev/docs/overview/', 'o'],
        ['📡 Ch 11 — the alert that starts this workflow', '#ch11', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Guess from metrics/traces which code    Profile it. "The model span is slow" is not "we know why".\n' +
      'One-off profiling only in a crisis      Continuous profiling (~1-3% overhead) so you can diff\n' +
      '                                       deploys and query "what was hot then".\n' +
      'CPU profile only                         Add wall/off-CPU (waiting on locks/I/O/GPU sync) and heap,\n' +
      '                                       and a GPU profile for inference.\n' +
      'Assume the GPU is busy                   Measure GPU occupancy/utilisation over wall time; a Python\n' +
      '                                       pre/post step often leaves it idle.\n' +
      'Profile not linked to traces/deploys     Correlate span → profile and overlay deploy annotations.\n' +
      'Micro-optimising a cold path             Flame-graph width tells you what actually costs; optimise\n' +
      '                                       the widest frames on the hot path.\n' +
      'Profiling overhead ignored               Sampling profilers are cheap; still cap rate and exclude the\n' +
      "                                       profiler from its own numbers.\n" +
      'Detok / serialization on the hot path    Move heavy pre/post-processing off the critical path or\n' +
      '                                       vectorise it; overlap CPU with GPU.</code></pre>' +
      '<p><b>The rule:</b> optimise the widest frame on the hot path, then re-profile. Repeat until the widest frame is something you cannot cheaply change ' +
      '(the model forward pass itself) — then the levers are Part 6 Ch 11 (quantization, batching, hardware).</p>',
      try: [
        ['📖 NVIDIA Nsight Systems — profiling GPU workloads', 'https://docs.nvidia.com/nsight-systems/', 'o'],
        ['🏗️ Part 6: cost & performance tradeoffs (roofline)', '../learn6/#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Where does profiling sit relative to metrics and traces?\n' +
      '   A: Metrics: is something slow (aggregate). Traces: which span/service (per request). Profiles: which\n' +
      '   function / kernel / line consumed the CPU-seconds, GPU-seconds or bytes — the last zoom level, shown\n' +
      '   as a flame graph.\n\n' +
      'Q: What is continuous profiling and why use it?\n' +
      '   A: Sampling a tiny % of every process all the time (~1-3% overhead) and storing it, so you can ask\n' +
      '   "what was hot at 14:03 yesterday", diff two time ranges, and compare before/after a deploy — without\n' +
      "   needing to reproduce the issue.\n\n" +
      'Q: An inference GPU has decent throughput but high cost per token. What might a profile show?\n' +
      '   A: Low GPU occupancy over wall time — a Python pre/post-processing step (tokenization, regex, JSON\n' +
      '   building) running on CPU while the GPU idles, plus small-batch kernels. Move that work off the hot\n' +
      '   path, raise batch size, overlap CPU and GPU.\n\n' +
      'Q: p99 stepped up after a deploy and the trace shows a bigger model span but not why. Next step?\n' +
      '   A: Diff the continuous profile before vs after the deploy; a new/heavier call path (e.g. a tokenizer\n' +
      '   reloaded per request) shows up as a widened frame, pinning it to a function.\n\n' +
      'Q: Which frame do you optimise first?\n' +
      '   A: The widest frame on the HOT path (a cold path is irrelevant no matter how slow). Fix it,\n' +
      '   re-profile, repeat until the widest frame is the model forward pass itself.\n\n' +
      'Q: CPU profile vs wall/off-CPU profile?\n' +
      '   A: CPU shows where cycles are spent; wall/off-CPU shows where wall-clock goes including waiting on\n' +
      '   locks, I/O, or GPU synchronisation — often the real latency source.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch6">Ch 6</a> (trace → span), <a href="#ch14">Ch 14</a> (span across services), <a href="#ch11">Ch 11</a> (the alert), ' +
      '<a href="../learn6/#ch11">Part 6 Ch 11</a> (roofline &amp; the deeper levers), <a href="../learn6/#ch4">Part 6 Ch 4</a> (serving runtimes).</p>',
      try: [
        ['📖 OpenTelemetry — profiling signal', 'https://opentelemetry.io/docs/specs/otel/profiles/', 'o'],
        ['📖 Polar Signals — continuous profiling guide', 'https://www.polarsignals.com/docs', 'o']
      ] }
  ],

  quiz: [
    { q: 'What does a profile tell you that a distributed trace does not?',
      opts: [
        'Which service handled the request',
        'Which function, code path, GPU kernel or allocation consumed the CPU-seconds / GPU-seconds / bytes within a span — shown as a flame graph',
        'The total request rate',
        'The HTTP status code'],
      ok: 1,
      why: 'A trace localises the slow span; a profile localises the code inside it. It is the zoom level where you find the hot function to actually change.' },
    { q: 'An inference GPU has acceptable throughput but a high cost per token. What is a common profiling finding?',
      opts: [
        'The GPU is 100% utilised and cannot go faster',
        'Low GPU occupancy over wall time because a CPU-side pre/post-processing step (tokenization, regex, JSON building) runs while the GPU idles, plus small-batch kernels',
        'The network card is saturated',
        'The disk is full'],
      ok: 1,
      why: 'Metrics and traces can look fine while the GPU sits idle waiting on Python. A GPU/wall profile exposes the idle time and the CPU work blocking it.' },
    { q: 'Which frame should you optimise first from a flame graph?',
      opts: [
        'The deepest frame in the stack',
        'The widest frame on the hot path — width is time (or memory) spent; a slow cold path does not matter — then re-profile and repeat',
        'The frame with the longest function name',
        'Any frame in third-party code'],
      ok: 1,
      why: 'Flame-graph width shows where the cost actually is. Optimising the widest hot-path frame yields the biggest gain; iterate until the widest frame is something you cannot cheaply change.' }
  ]
};
