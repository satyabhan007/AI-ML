/* AI-ML Learn — Part 8 · Chapter 6: Tracing an LLM / Agent Request */
window.CH[6] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>An LLM feature is rarely one call. A single user question might trigger: a query rewrite, an embedding, a vector search, a rerank, a prompt build, ' +
      'the model call, two tool calls, and a guardrail check. When it is slow or wrong, "the request took 6 seconds" tells you nothing. A <b>trace</b> breaks that one ' +
      'request into a tree of timed <b>spans</b> so you can see exactly where the 6 seconds went and which step misbehaved.</p>' +
      '<pre><code>trace: answer_question (6.1s)\n' +
      ' ├─ rewrite_query        120ms\n' +
      ' ├─ embed_query           40ms\n' +
      ' ├─ vector_search        180ms   (k=50)\n' +
      ' ├─ rerank               210ms\n' +
      ' ├─ llm_call           4900ms   ← here\n' +
      ' │   ├─ tool: get_order  380ms\n' +
      ' │   └─ tool: lookup_kb  240ms\n' +
      ' └─ guardrail_check       90ms</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A package tracking page.</b> "Delivered in 5 days" is useless when it is late. The scan history — ' +
      'left warehouse, cleared customs (18h), sat on a truck (2 days) — tells you where it stuck. A trace is that scan history for one request.</p></div>',
      try: [
        ['📖 OpenTelemetry — traces & spans', 'https://opentelemetry.io/docs/concepts/signals/traces/', 'o'],
        ['📡 Ch 5 — the attributes you put on the llm_call span', '#ch5', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>SPAN            a timed operation: name, start/end, status, attributes, events, parent.\n' +
      'TRACE          all spans sharing a trace_id; a tree via parent span_ids.\n' +
      'CONTEXT PROP.  the trace_id + span_id flow across function calls, threads, HTTP/gRPC headers,\n' +
      '               and queue messages (traceparent header / W3C Trace Context).\n' +
      'WHAT TO SPAN (LLM app)   the request root; retrieval (rewrite, embed, search, rerank);\n' +
      '               each model call; each tool/function call; guardrail/eval checks; the outer\n' +
      '               agent loop + each step/iteration.\n' +
      'GenAI ATTRIBUTES   gen_ai.request.model, temperature, max_tokens; gen_ai.usage.input_tokens/\n' +
      '               output_tokens; gen_ai.response.finish_reasons; tool name + args size; retrieved\n' +
      '               doc ids/count; cache_hit; cost.\n' +
      'EVENTS          point-in-time notes on a span: "guardrail_triggered", "retry", "fallback_model".\n' +
      'PROMPT/COMPLETION   capture (sampled + redacted) for debugging — behind a flag; never raw PII.\n' +
      'ERRORS          set span status = ERROR + record the exception on the failing span, so the tree\n' +
      '               shows exactly which step failed.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard is <b>OpenTelemetry tracing</b> with the <b>GenAI semantic conventions</b> for model/tool/agent spans, ' +
      '<b>W3C Trace Context</b> for propagation, and a trace backend (<b>Tempo</b>, <b>Jaeger</b>, or an LLM-tracing tool — <b>Langfuse</b>, <b>LangSmith</b>, <b>Phoenix</b>, ' +
      '<b>Braintrust</b> — which render agent/RAG traces natively). Auto-instrumentation covers HTTP/DB spans; you add manual spans for the AI steps. You do not build a tracer.</p></div>',
      try: [
        ['📖 OpenTelemetry — GenAI spans (model, tool, agent)', 'https://opentelemetry.io/docs/specs/semconv/gen-ai/gen-ai-spans/', 'o'],
        ['📖 W3C — Trace Context', 'https://www.w3.org/TR/trace-context/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The slow agent run.</b> ' +
      'An agent occasionally takes 40 s instead of 6 s. Aggregate latency shows a fat p99 tail but no cause. Opening a slow trace: the <b>agent loop</b> span has ' +
      '7 iterations instead of the usual 2 — the model keeps calling a <code>search</code> tool that returns nothing, re-reasoning, and calling it again. ' +
      'The trace makes the loop visible; the fix is a better tool result + a max-iterations cap + a "no new info" break condition. Without per-iteration spans this is a guessing game.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Attributing cost to a step.</b> ' +
      'Cost per request is too high. The trace shows the <code>rerank</code> step is fine, but the model is called <b>twice</b> per request — once to plan, once to answer — ' +
      'and the planning call sends the full 8k-token context it does not need. Span-level <code>gen_ai.usage.input_tokens</code> pinpoints the wasteful call; ' +
      'the fix is to pass only the question to the planner. Cost drops 35%. Traces localise cost, not just latency.</p></div>' +
      '<p><b>Exemplars close the loop:</b> a latency-spike point on a Grafana panel carries a <code>trace_id</code>; one click opens exactly that slow trace (Ch 10). ' +
      'Metrics say "something is slow"; the trace says "this span, this request".</p>',
      try: [
        ['📖 Langfuse — tracing agents & RAG pipelines', 'https://langfuse.com/docs/tracing', 'o'],
        ['📗 Part 2: agents & tool-calling loops', '../learn2/#ch7', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'One span for the whole request        Span every step: retrieval sub-steps, each model call, each\n' +
      '                                       tool call, guardrails, each agent iteration.\n' +
      'Context not propagated across a queue   Inject traceparent into the message; the worker continues\n' +
      '                                       the same trace (Ch 14).\n' +
      'No token/cost attributes on spans       Add gen_ai.usage.*, cost, finish_reason so a trace localises\n' +
      '                                       cost and truncation, not just time.\n' +
      'Capturing raw prompts/completions        Sample + redact behind a flag; PII in traces is a breach and\n' +
      '                                       a cost.\n' +
      'Error only on the root span             Set ERROR status + record the exception on the SPECIFIC\n' +
      '                                       failing span so the tree points at it.\n' +
      '100% trace retention forever            Tail-sample (keep errors + slow), short retention; exemplars\n' +
      '                                       link the sampled ones from metrics.\n' +
      'Agent loop invisible                     Span the loop + each iteration + the stop reason; runaway\n' +
      '                                       loops are the top agent failure mode.\n' +
      'No link between metric spike and trace   Emit exemplars so a dashboard point opens the exact trace.</code></pre>' +
      '<p><b>Trace-first debugging for AI:</b> reproduce or find one bad request, open its trace, read top-down. The wrong span (too slow, errored, wrong token count, ' +
      'extra iteration, empty retrieval) is almost always obvious, and it points at the fix.</p>',
      try: [
        ['📖 OpenTelemetry — context propagation', 'https://opentelemetry.io/docs/concepts/context-propagation/', 'o'],
        ['📡 Ch 14 — distributed tracing across services & model backends', '#ch14', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What does a trace give you for an LLM/agent request that metrics do not?\n' +
      '   A: A per-request tree of timed spans — retrieval sub-steps, each model call, each tool call,\n' +
      '   guardrails, each agent iteration — so you can see exactly which step consumed the time, errored, sent\n' +
      '   too many tokens, or looped.\n\n' +
      'Q: An agent occasionally takes 40 s instead of 6 s. How does tracing find it?\n' +
      '   A: Open a slow trace: the agent-loop span shows extra iterations (e.g. the model repeatedly calling a\n' +
      '   tool that returns nothing). Per-iteration spans make the runaway loop visible; without them it is\n' +
      "   guesswork.\n\n" +
      'Q: How do you attribute cost to a specific step with tracing?\n' +
      '   A: Put gen_ai.usage.input_tokens/output_tokens and cost on each model-call span. A trace then shows,\n' +
      '   e.g., a planning call sending the full context it does not need — the wasteful span is explicit.\n\n' +
      'Q: How does a trace continue across a queue hop?\n' +
      '   A: Inject the W3C traceparent (trace_id + span_id) into the message; the consumer extracts it and\n' +
      '   starts its spans as children, so the whole async flow is one trace.\n\n' +
      'Q: Should you capture full prompts and completions in spans?\n' +
      '   A: Only sampled and redacted, behind a flag. Raw prompts/completions can contain PII — storing them\n' +
      '   in traces is a privacy and cost problem.\n\n' +
      'Q: How do you get from a latency spike on a dashboard to the offending request?\n' +
      '   A: Exemplars — the histogram bucket carries a trace_id, so clicking the spike opens that exact slow\n' +
      '   trace.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch5">Ch 5</a> (span attributes), <a href="#ch2">Ch 2</a> (OTel + Collector), <a href="#ch10">Ch 10</a> (exemplars on dashboards), ' +
      '<a href="#ch14">Ch 14</a> (cross-service propagation &amp; sampling), <a href="#ch15">Ch 15</a> (profiling the hot span).</p>',
      try: [
        ['📖 Jaeger — analysing traces', 'https://www.jaegertracing.io/docs/latest/', 'o'],
        ['📖 Arize Phoenix — LLM trace analysis', 'https://docs.arize.com/phoenix/tracing/llm-traces', 'o']
      ] }
  ],

  quiz: [
    { q: 'Why is a distributed trace essential for debugging an LLM/agent request?',
      opts: [
        'It reduces the number of model calls',
        'It breaks one request into a tree of timed spans (retrieval steps, model calls, tool calls, guardrails, agent iterations) so you can see exactly which step was slow, errored, looped, or sent too many tokens',
        'It compresses the prompt',
        'It replaces the need for metrics entirely'],
      ok: 1,
      why: 'A single duration number cannot tell you where 6 seconds went across a multi-step pipeline. Per-step spans make the cause obvious.' },
    { q: 'An agent sometimes takes far longer than usual. What does the trace typically reveal?',
      opts: [
        'The GPU is broken',
        'Extra iterations in the agent-loop span — e.g. the model repeatedly calling a tool that returns nothing and re-reasoning — visible only with per-iteration spans',
        'The network is down',
        'Nothing; agents are just random'],
      ok: 1,
      why: 'Runaway loops are the top agent failure mode. Spanning the loop and each iteration (with a stop reason) exposes them; a max-iteration cap and a break condition fix them.' },
    { q: 'How should full prompts and completions be handled in spans?',
      opts: [
        'Always captured in full for every request',
        'Only sampled and redacted, behind a flag — raw prompts/completions can contain PII, and storing all of them is a privacy and cost problem',
        'Never captured under any circumstances',
        'Stored only in metrics'],
      ok: 1,
      why: 'Prompt/completion capture is valuable for debugging but sensitive and voluminous; sample it, redact PII, and gate it behind configuration.' }
  ]
};
