/* AI-ML Learn — Part 9 · Chapter 10: LLMOps Specifics */
window.CH[10] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Most of this course applies to any ML system. But LLM applications add a few things that need their own platform primitives at org scale: <b>prompts</b> are ' +
      'now a versioned asset teams reuse, <b>evals</b> for open-ended output need a shared platform, <b>RAG corpora</b> drift and must be governed, and <b>agents</b> ' +
      'with tools need guardrail policy enforced centrally.</p>' +
      '<pre><code>PROMPT REGISTRY    prompts as versioned, reviewed, reusable artifacts (not strings in code)\n' +
      'EVAL PLATFORM      a shared way to define, run, and gate evals for generative output\n' +
      'RAG DATA GOVERNANCE   the retrieval corpus is a living dataset: freshness, provenance, access, PII\n' +
      'AGENT / GUARDRAIL POLICY   central control of what tools agents may call and what filters apply\n' +
      'MODEL GATEWAY     one routed entry point to many models/providers with policy + metering (Ch 12, Ch 14)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A shared test kitchen and pantry for a restaurant group.</b> Every location could improvise, but a ' +
      'central recipe book (prompt registry), a standard tasting panel (eval platform), an inspected pantry (RAG governance), and rules about which knives the trainees ' +
      'get (agent guardrails) keep quality consistent across 50 kitchens.</p></div>',
      try: [
        ['📗 Part 2: prompting, RAG, agents, evals, guardrails', '../learn2/#ch1', 'o'],
        ['🏢 Ch 1 — the platform these primitives live on', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>PROMPT REGISTRY   prompt = {id, version, template, variables, model constraints, owner}. Immutable\n' +
      '  versions; changes reviewed + pass the eval gate (Part 7 Ch 8); rendered at runtime; the version\n' +
      '  served is logged (Part 8 Ch 5). Shared library so 12 teams do not each invent a "summarise" prompt.\n' +
      'EVAL PLATFORM   shared datasets + scorers (task metrics, LLM-judge with pinned judge, rubric checks,\n' +
      '  RAG metrics), run in CI (Part 7 Ch 8) AND online (Part 8 Ch 7). Datasets versioned + owned; a\n' +
      '  held-out slice; results comparable across teams and model versions.\n' +
      'RAG DATA REFRESH   the corpus is a dataset: source provenance, ingestion pipeline (Part 6 Ch 6),\n' +
      '  re-embed on model change, freshness SLA, per-tenant scoping (Ch 2), PII classification (Ch 4),\n' +
      '  a "remove this document / redact" path, and eval of retrieval quality on refresh.\n' +
      'AGENT GUARDRAIL GOVERNANCE   a central policy: which tools each agent class may call, approval\n' +
      '  requirements for consequential actions, sandbox + egress rules, budget/rate caps, injection/exfil\n' +
      '  filters (Ch 5, Part 6 Ch 13). Changes reviewed; every tool call logged.\n' +
      'MODEL GATEWAY   route by model+version, provider fallback, cost/latency policy, per-team quotas,\n' +
      '  a standard API (Part 6 Ch 3, Ch 14; Ch 12).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>Tooling: prompt registries + eval platforms (<b>LangSmith</b>, <b>Langfuse</b>, <b>Braintrust</b>, ' +
      '<b>Humanloop</b>, <b>PromptLayer</b>, <b>Arize Phoenix</b>); RAG eval (<b>Ragas</b>); agent guardrails (<b>NeMo Guardrails</b>, <b>Guardrails AI</b>); model gateways ' +
      '(<b>LiteLLM</b>, <b>Portkey</b>, <b>Kong AI Gateway</b>, cloud AI gateways). These are "LLMOps" — the same MLOps discipline (versioning, CI, monitoring, governance) applied to prompts, evals, corpora and agents. You assemble the platform; the primitives are standard.</p></div>',
      try: [
        ['📖 LangSmith — prompt hub & evaluation', 'https://docs.smith.langchain.com/', 'o'],
        ['📖 Ragas — RAG evaluation', 'https://docs.ragas.io/en/stable/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Twelve teams, twelve "summarise" prompts, no consistency.</b> ' +
      'Each product team hand-writes and tweaks its own summarisation prompt in code; quality and tone vary wildly, safety instructions are inconsistent, and a fix has ' +
      'to be made 12 times. Fix: a <b>prompt registry</b> with a reviewed, evaluated shared <code>summarise/v4</code> that teams reference by id; team-specific ' +
      'variations are explicit overrides, also versioned and evaluated. A safety-instruction fix ships once.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The stale RAG corpus that gave wrong policy answers.</b> ' +
      'A support assistant\'s knowledge base is ingested by a one-off script run "when someone remembers". A policy changed 5 weeks ago; the corpus still has the old ' +
      'version; the assistant confidently cites the outdated document. Fixes: treat the corpus as a <b>governed, pipelined dataset</b> — scheduled + event-driven ' +
      'ingestion, a <b>freshness SLA</b> with an alert (Part 8 Ch 8), provenance per document, a redaction/removal path, and a retrieval-quality eval on every refresh.</p></div>' +
      '<p><b>These primitives are shared platform, not per-team:</b> a central prompt registry, eval platform, RAG-ingestion service, agent-guardrail policy, and model ' +
      'gateway are the "paved road" (Ch 1) for LLM apps — teams get consistency and governance for free by using them.</p>',
      try: [
        ['📖 Anthropic — prompt engineering & evaluation guide', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview', 'o'],
        ['🏗️ Part 6: the RAG assistant walkthrough', '../learn6/#ch16', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Prompts as strings in code, edited      Prompt registry: versioned, reviewed, eval-gated,\n' +
      '  freely                                referenced by id, version logged per request.\n' +
      'Each team invents its own eval           Shared eval platform: common datasets + scorers + a pinned\n' +
      '                                        judge; comparable across teams and model versions.\n' +
      'RAG corpus ingested by a manual script   Governed pipeline: scheduled + event-driven, provenance,\n' +
      '                                        re-embed on model change, freshness SLA + alert, removal path.\n' +
      'Every team sets its own agent tool       Central guardrail policy: allowed tools per agent class,\n' +
      '  access                                approval for consequential actions, sandbox/egress, budget\n' +
      '                                        caps, injection filters; changes reviewed.\n' +
      'Direct calls to model providers          Model gateway: routing, provider fallback, cost/latency\n' +
      '                                        policy, per-team quotas, one standard API.\n' +
      'Prompt / corpus change skips the gate    Any behaviour-defining change hits the eval gate (Part 7\n' +
      '                                        Ch 8) and the governance review proportionate to risk (Ch 3).\n' +
      'No per-request lineage for LLM output     Log model+version, prompt version, retrieved doc ids, tool\n' +
      '                                        calls, guardrail results — needed for debugging + audit.\n' +
      'Treating LLMOps as different from MLOps    Same discipline (version, test, monitor, govern) applied\n' +
      '                                        to prompts, evals, corpora, agents.</code></pre>' +
      '<p><b>The unifying idea:</b> everything that determines an LLM app\'s behaviour — prompt, model, retrieval corpus, tool set, guardrails — becomes a ' +
      '<i>versioned, evaluated, governed, monitored</i> artefact on a shared platform, exactly like a model.</p>',
      try: [
        ['📖 Chip Huyen — building LLM applications for production', 'https://huyenchip.com/2023/04/11/llm-engineering.html', 'o'],
        ['🏢 Ch 12 — the model gateway & provider portability', '#ch12', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What LLM-specific primitives does an org-scale platform need beyond standard MLOps?\n' +
      '   A: A prompt registry (prompts as versioned, reviewed, eval-gated artefacts), a shared eval platform\n' +
      '   for generative output, RAG-corpus governance (pipelined ingestion, provenance, freshness SLA,\n' +
      '   re-embed on model change, removal path), central agent/guardrail policy, and a model gateway.\n\n' +
      'Q: Twelve teams each maintain their own summarisation prompt. What is the fix?\n' +
      '   A: A prompt registry with a reviewed, evaluated shared prompt referenced by id; team variations are\n' +
      '   explicit, versioned, evaluated overrides. A safety fix then ships once.\n\n' +
      'Q: A support assistant cites an outdated policy document. Root cause and fix?\n' +
      '   A: The RAG corpus is ingested ad hoc with no freshness guarantee. Treat it as a governed dataset:\n' +
      '   scheduled + event-driven ingestion, per-document provenance, a freshness SLA with an alert, a\n' +
      '   redaction/removal path, and retrieval-quality eval on every refresh.\n\n' +
      'Q: How should agent tool access be managed across many teams?\n' +
      '   A: A central guardrail policy defining allowed tools per agent class, approval for consequential\n' +
      '   actions, sandbox and egress rules, budget/rate caps, and injection/exfil filters — changes reviewed,\n' +
      "   every tool call logged. Not each team's own decision.\n\n" +
      'Q: How is LLMOps different from MLOps?\n' +
      '   A: It is not a different discipline — it is the same versioning, CI, monitoring and governance\n' +
      '   applied to the new behaviour-defining artefacts: prompts, evals, retrieval corpora, and agents.\n\n' +
      'Q: What lineage do you log per LLM request for audit and debugging?\n' +
      '   A: Model + version, prompt version, retrieved document ids, tool calls, and guardrail results.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch1">Ch 1</a> (paved road), <a href="#ch3">Ch 3</a> (governance), <a href="#ch5">Ch 5</a> (agent security), <a href="#ch12">Ch 12</a> (model gateway), ' +
      '<a href="../learn7/#ch8">Part 7 Ch 8</a> (eval gate), <a href="../learn8/#ch7">Part 8 Ch 7</a> (eval-in-prod), <a href="../learn6/#ch16">Part 6 Ch 16</a> (RAG).</p>',
      try: [
        ['📖 Portkey / LiteLLM — model gateway & LLMOps', 'https://docs.litellm.ai/', 'o'],
        ['📖 Langfuse — prompt management & datasets', 'https://langfuse.com/docs/prompts/get-started', 'o']
      ] }
  ],

  quiz: [
    { q: 'How should prompts be managed on an org-scale LLM platform?',
      opts: [
        'As string literals in each service\'s source code, edited freely',
        'In a prompt registry — versioned, reviewed, eval-gated artefacts referenced by id, with the version served logged per request, and a shared library so teams do not each reinvent common prompts',
        'In the secret manager',
        'Only in the model weights'],
      ok: 1,
      why: 'A prompt defines model behaviour, so it needs the same versioning, review, evaluation and traceability as a model — and a shared registry gives consistency and single-fix updates across teams.' },
    { q: 'A support assistant confidently cites a policy document that changed five weeks ago. What is the governance fix?',
      opts: [
        'Use a bigger model',
        'Treat the RAG corpus as a governed, pipelined dataset: scheduled + event-driven ingestion, per-document provenance, a freshness SLA with an alert, a removal/redaction path, and retrieval-quality eval on each refresh',
        'Lower the retrieval k',
        'Add more replicas'],
      ok: 1,
      why: 'A retrieval corpus is a living dataset. Ad-hoc ingestion with no freshness guarantee produces stale, confidently-cited answers; it needs the same pipeline and governance discipline as any dataset.' },
    { q: 'How is "LLMOps" best understood relative to MLOps?',
      opts: [
        'A completely separate discipline with its own principles',
        'The same discipline — versioning, CI, monitoring, governance — applied to the new behaviour-defining artefacts: prompts, evals, retrieval corpora, and agents',
        'A replacement that makes MLOps obsolete',
        'Only relevant to model training'],
      ok: 1,
      why: 'The primitives are new (prompts, corpora, agent tool sets) but the practices are the same MLOps practices applied to them.' }
  ]
};
