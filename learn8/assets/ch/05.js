/* AI-ML Learn — Part 8 · Chapter 5: LLM-Specific Telemetry */
window.CH[5] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Classic APM measures "request took 240 ms, returned 200". For an LLM call that misses the things that actually matter: how many tokens, how much it cost, ' +
      'how long until the <i>first</i> token appeared, whether a cache saved the call, and how full the context window was.</p>' +
      '<pre><code>per LLM call, record:\n' +
      '  tokens_in / tokens_out        → cost + load\n' +
      '  cost_usd                      → the bill, per request\n' +
      '  ttft_ms  (time to first token) → what a streaming user feels\n' +
      '  tokens_per_second             → generation speed / capacity\n' +
      '  cache_hit  (prompt / semantic / KV)  → savings\n' +
      '  context_length / context_used_pct    → "am I about to hit the window limit"\n' +
      '  finish_reason  (stop / length / tool_call / content_filter)  → truncations & refusals</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A taxi meter, not just a stopwatch.</b> A stopwatch tells you the ride took 20 minutes. The meter tells you ' +
      'the distance, the fare, whether you sat in traffic (TTFT), and whether a coupon applied (cache hit). For LLMs you need the meter.</p></div>',
      try: [
        ['📖 OpenTelemetry — GenAI semantic conventions', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/', 'o'],
        ['🐍 Part 1: why tokens = cost (tokenizer + serving)', '../learn/#ch2', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>METRICS (aggregate, for dashboards + alerts)\n' +
      '  gen_ai.client.token.usage        histogram, by {model, type=input|output}\n' +
      '  cost_usd_total                   counter, by {model, tenant, route}\n' +
      '  gen_ai.server.time_to_first_token  histogram (streaming)\n' +
      '  gen_ai.server.time_per_output_token / tokens_per_second  histogram\n' +
      '  cache_hit_ratio                  by {cache_type}\n' +
      '  finish_reason_total              counter, by {reason}  ← length-truncations, content_filter blocks\n' +
      '  context_used_ratio              histogram  ← p95 near 1.0 = window pressure\n' +
      'SPAN ATTRIBUTES (per request, for traces — Ch 6)\n' +
      '  gen_ai.request.model, gen_ai.request.temperature/max_tokens,\n' +
      '  gen_ai.usage.input_tokens/output_tokens, gen_ai.response.finish_reasons,\n' +
      '  gen_ai.request.id, retrieval doc count, tool calls, cost.\n' +
      'DERIVED   cost per SUCCESSFUL request, cost per user/tenant/feature, $ per 1k output tokens,\n' +
      '          tokens/sec/GPU (capacity), % requests hitting max_tokens.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard is the <b>OpenTelemetry GenAI semantic conventions</b> (span + metric names for model calls, ' +
      'token usage, TTFT, tool calls) plus <b>OpenLLMetry</b> / vendor auto-instrumentation and LLM-observability tools (<b>Langfuse</b>, <b>Arize Phoenix</b>, <b>LangSmith</b>, ' +
      '<b>Helicone</b>, <b>Datadog LLM Observability</b>) that emit them. Serving runtimes (vLLM) already export token/throughput/cache metrics. You adopt the conventions; the names are agreed.</p></div>',
      try: [
        ['📖 OpenLLMetry — OTel instrumentation for LLMs', 'https://www.traceloop.com/docs/openllmetry/introduction', 'o'],
        ['📖 Langfuse — LLM tracing & metrics', 'https://langfuse.com/docs', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The silent cost blowup.</b> ' +
      'The monthly LLM bill jumps 3×. Latency and error dashboards show nothing. The <b>token</b> dashboard shows median <code>tokens_in</code> went from 900 to 3 100 two weeks ago — ' +
      'a RAG change started stuffing 12 chunks instead of 4, and a prompt tweak added a long few-shot block. Without per-request token + cost telemetry this is invisible until finance asks. ' +
      'An alert on <i>p50 tokens_in &gt; threshold</i> or <i>cost per request &gt; X</i> would have caught it the day it shipped.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>TTFT vs total latency.</b> ' +
      'Users complain the assistant "feels slow", but total request latency (p99 ~9 s for a long answer) is within SLO. The real problem is <b>TTFT p95 = 2.4 s</b> — ' +
      'they stare at a blank box before anything streams. Fixing TTFT (prefix caching, a smaller first-draft model, shorter system prompt) transforms perceived speed even though ' +
      'total latency is unchanged. Measure and SLO the metric the user actually feels.</p></div>' +
      '<p><b>Watch <code>finish_reason</code>:</b> a rising rate of <code>length</code> means answers are being truncated at <code>max_tokens</code>; a rising ' +
      '<code>content_filter</code> means guardrails are firing more (Ch 9). Both are quality incidents that never show as errors.</p>',
      try: [
        ['📖 Anthropic — usage & token counting', 'https://docs.anthropic.com/en/api/messages', 'o'],
        ['📡 Ch 13 — cost observability & FinOps for AI', '#ch13', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Only request latency + status         Add tokens in/out, cost, TTFT, tokens/sec, cache-hit,\n' +
      '                                       context-used %, finish_reason.\n' +
      'Total latency as the UX metric         For streaming, SLO on TTFT — that is what the user feels.\n' +
      '                                       Total latency for long answers is secondary.\n' +
      'No per-request cost                    Emit cost_usd per call (from token counts x price); derive\n' +
      '                                       cost per successful request, per tenant, per feature.\n' +
      'Token counts only in logs              Also a histogram metric → alert on p50/p95 token drift\n' +
      '                                       (a prompt/RAG change blowing up context).\n' +
      'Ignore finish_reason                   length = truncation, content_filter = guardrail — both are\n' +
      '                                       silent quality regressions; count and alert.\n' +
      'context_used not measured              Track it; p95 approaching 1.0 predicts truncation and errors\n' +
      '                                       before they happen.\n' +
      'Custom attribute names                 Use gen_ai.* semantic conventions so tools + dashboards are\n' +
      '                                       portable.\n' +
      'Cache-hit not attributed              Break hit ratio by cache_type (prompt/semantic/KV) so you know\n' +
      '                                       which layer is (not) working.</code></pre>' +
      '<p><b>The unit that ties it together:</b> <code>cost per successful request</code> = total spend / successful requests. It exposes token bloat, low cache hit rate, ' +
      'over-large models, and retries in one number — put it on the overview dashboard next to the golden signals (Ch 13).</p>',
      try: [
        ['📖 Arize Phoenix — LLM tracing & evals', 'https://docs.arize.com/phoenix', 'o'],
        ['📖 Helicone — LLM observability & cost tracking', 'https://docs.helicone.ai/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What does classic APM miss for an LLM service, and what do you add?\n' +
      '   A: Tokens in/out, cost per request, time-to-first-token, tokens/sec, cache-hit ratio (by layer),\n' +
      '   context-used %, and finish_reason. These drive cost, capacity, and perceived latency, none of which\n' +
      '   a status code + duration captures.\n\n' +
      'Q: The LLM bill tripled but latency/error dashboards are flat. How do you find it?\n' +
      '   A: The token dashboard — median tokens_in jumped when a RAG/prompt change increased context size.\n' +
      '   Per-request token histograms + an alert on p50 tokens_in or cost-per-request would have caught it on\n' +
      "   release day.\n\n" +
      'Q: Users say it feels slow but total latency is within SLO. What metric are you missing?\n' +
      '   A: TTFT (time to first token). For streaming, that is the felt latency; SLO it directly. Fix with\n' +
      '   prefix caching, a smaller first-draft model, or a shorter system prompt.\n\n' +
      'Q: Why watch finish_reason?\n' +
      '   A: A rising "length" rate means answers are truncated at max_tokens; a rising "content_filter" rate\n' +
      '   means guardrails are firing more. Both are quality regressions that never appear as HTTP errors.\n\n' +
      'Q: What single derived metric summarises LLM efficiency?\n' +
      '   A: Cost per successful request (total spend / successful requests). It moves with token bloat, low\n' +
      '   cache-hit rate, oversized models, and retries — one number on the overview dashboard.\n\n' +
      'Q: Why use the gen_ai.* semantic conventions?\n' +
      '   A: Portable dashboards, queries, and alerts across services and LLM-observability tools, instead of\n' +
      '   bespoke attribute names per service.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch6">Ch 6</a> (these as span attributes in a trace), <a href="#ch3">Ch 3</a> (golden signals), <a href="#ch13">Ch 13</a> (cost/FinOps), ' +
      '<a href="../learn6/#ch8">Part 6 Ch 8</a> (caches), <a href="../learn6/#ch11">Part 6 Ch 11</a> (throughput).</p>',
      try: [
        ['📖 OpenTelemetry — GenAI metrics conventions', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-metrics/', 'o'],
        ['📖 vLLM — production metrics', 'https://docs.vllm.ai/en/latest/serving/metrics.html', 'o']
      ] }
  ],

  quiz: [
    { q: 'Which set of metrics is specific to LLM serving (beyond latency/traffic/errors)?',
      opts: [
        'Disk IOPS, inode count, swap usage',
        'Tokens in/out, cost per request, time-to-first-token, tokens/sec, cache-hit ratio, context-used %, and finish_reason',
        'Number of Kubernetes nodes',
        'HTTP header count'],
      ok: 1,
      why: 'These drive cost, capacity and perceived latency for an LLM — dimensions a status code and total duration do not capture.' },
    { q: 'The LLM bill tripled with flat latency/error dashboards. Best way to find the cause?',
      opts: [
        'Add more replicas',
        'Look at per-request token histograms — a RAG or prompt change that increased context size raises tokens_in and cost without touching latency or error rate',
        'Restart the service',
        'Lower the SLO'],
      ok: 1,
      why: 'Cost is driven by tokens. Token metrics (and a cost-per-request alert) surface context-size regressions that are invisible to classic monitoring.' },
    { q: 'Users say a streaming assistant "feels slow" but total request latency meets the SLO. What is the metric to target?',
      opts: [
        'Total latency, harder',
        'Time-to-first-token (TTFT) — for streaming that is the felt latency; reduce it with prefix caching, a smaller first-draft model, or a shorter system prompt',
        'Tokens per second only',
        'The number of retries'],
      ok: 1,
      why: 'A long answer can legitimately take seconds to finish; what users experience as "slow" is the blank wait before the first token. SLO TTFT directly.' }
  ]
};
