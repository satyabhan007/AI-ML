/* AI-ML Learn — Part 6 · Chapter 16: Walkthrough B — RAG Assistant, End to End */
window.CH[16] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>"Build an assistant that answers questions over our documents." The naive version — stuff everything into the prompt, or fine-tune the model on the docs — ' +
      'does not scale, goes stale, and cannot cite. The standard answer is <b>RAG</b>: retrieve the few relevant passages at question time, put them in the prompt, ' +
      'and have the model answer <i>from them</i>, with citations.</p>' +
      '<pre><code>OFFLINE:  docs → clean → chunk → embed → index (+ keyword index)\n' +
      'ONLINE:   question → (rewrite) → retrieve top-k → rerank → build prompt → LLM → answer + citations\n' +
      '                                                                              → guardrails → log for eval</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>An open-book exam.</b> The student (LLM) is smart but does not have your company\'s handbook memorised. ' +
      'RAG is handing them the three relevant pages right before they answer, and requiring them to point to the paragraph they used — so the answer is grounded and checkable.</p></div>',
      try: [
        ['📖 Lewis et al. — Retrieval-Augmented Generation (the paper)', 'https://arxiv.org/abs/2005.11401', 'o'],
        ['📗 Part 2: RAG, retrieval + grounding + refusal', '../learn2/#ch5', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>Walking the Ch 1 checklist for a RAG assistant:</p>' +
      '<pre><code>CLARIFY   who asks what; corpus size + update rate; latency ("first token < 2 s"); must cite;\n' +
      '          must refuse when unsupported; per-tenant data isolation; cost ceiling per answer.\n' +
      'METRICS   business = deflected support tickets / task success; system = answer correctness\n' +
      '          (LLM-judge + human sample), groundedness/faithfulness, retrieval recall@k, refusal\n' +
      '          correctness; guardrails = latency, hallucination rate, PII/leak rate, cost/answer.\n' +
      'DATA      the corpus itself + a labelled eval set of Q/(gold passages)/(gold answer). Log every\n' +
      '          production Q + retrieved chunks + answer + feedback → next eval set.\n' +
      'INGESTION clean (strip boilerplate), chunk (structure-aware, ~200-500 tokens, overlap, prepend\n' +
      '          title/section), embed, upsert to a vector DB + a BM25 index; re-embed on model change.\n' +
      'RETRIEVAL hybrid (dense + sparse) → RRF → cross-encoder rerank top ~50 → keep top 5-8. Metadata\n' +
      '          filter by tenant/ACL/date. (Ch 7.)\n' +
      'GENERATION prompt = system rules + retrieved chunks (with ids) + question; ask for citations;\n' +
      '          instruct "if the context does not contain the answer, say so". Stream the output.\n' +
      'GUARDRAILS input (injection, PII), output (citation check, PII scrub, policy), grounding check.\n' +
      'SERVE     online, behind the gateway; embed cache + retrieval cache + prompt-prefix cache (Ch 8);\n' +
      '          async only for very long research-style tasks (Ch 12).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The <b>retrieve → rerank → generate → guardrail → evaluate</b> pipeline is the ' +
      'industry-standard RAG architecture (documented by the frameworks — LangChain, LlamaIndex, Haystack — and every major model vendor\'s RAG guide). ' +
      '<b>Hybrid retrieval + cross-encoder reranking</b>, <b>structure-aware chunking</b>, <b>citation-required prompting</b>, and <b>RAG evaluation</b> ' +
      '(RAGAS-style faithfulness / answer-relevance / context-precision, plus an LLM judge and a human sample) are the standard components. ' +
      'You assemble and tune these; you do not invent RAG.</p></div>',
      try: [
        ['📖 RAGAS — RAG evaluation metrics', 'https://docs.ragas.io/en/stable/concepts/metrics/', 'o'],
        ['📗 Part 2: evals, guardrails & observability for LLM apps', '../learn2/#ch9', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The answer is confident and wrong.</b> ' +
      'Users report the assistant citing a real document but stating something it does not say. Investigation: retrieval recall@8 is 71% ' +
      '(the right passage often is not retrieved), and the prompt does not force abstention. Fixes: (1) retrieval — switch to hybrid + rerank, ' +
      'improve chunking (the answer spanned a chunk boundary; add overlap + prepend the section heading), raising recall@8 to 92%; ' +
      '(2) generation — require inline citations and add "if the context does not support an answer, reply that you don\'t know"; ' +
      '(3) add a <b>groundedness check</b> (a second pass / NLI model verifying each claim is entailed by a cited chunk) and refuse/flag when it fails. ' +
      'Hallucination rate on the eval set drops from 14% to 3%.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Cross-tenant leak via retrieval.</b> ' +
      'Tenant A gets an answer built from Tenant B\'s document because the vector query was not scoped. Fixes: <b>hard metadata filter</b> on <code>tenant_id</code> ' +
      'at query time (native filtered-ANN), <b>shard the index by tenant</b> so a query physically cannot reach another tenant\'s vectors (Ch 7), ' +
      'enforce ACLs again at the citation/render step, and add a test to the eval suite that asserts zero cross-tenant retrievals. ' +
      'Treat retrieval scoping as a security boundary, not a ranking nicety.</p></div>' +
      '<p><b>Latency budget ("first token &lt; 2 s"):</b> auth 20, query rewrite (optional small model) 150, embed query (cache) 5, hybrid retrieve 40, ' +
      'rerank top-50 (cross-encoder) 120, prompt build 10, LLM prefill/TTFT (prefix-cached system prompt) 900 = ~1 245 ms to first token; answer then streams.</p>',
      try: [
        ['📖 Anthropic — RAG & citations guidance', 'https://docs.anthropic.com/en/docs/build-with-claude/citations', 'o'],
        ['🏗️ Ch 7 — retrieval & vector search at scale', '#ch7', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>PITFALL                               FIX\n' +
      'Chunking as an afterthought             Structure-aware chunks, overlap, prepend title/section. Chunking\n' +
      '                                       often moves recall more than the index or the LLM.\n' +
      'Dense-only retrieval                    Hybrid (dense + BM25) + rerank. Exact terms, codes, names,\n' +
      '                                       negation need keyword signal (Ch 7).\n' +
      'No abstention                           Prompt for "say you don\'t know" + a groundedness/NLI check.\n' +
      '                                       A grounded "I can\'t find that" beats a fluent hallucination.\n' +
      'Retrieval scoping treated as ranking    It is a security boundary: hard metadata filters + per-tenant\n' +
      '                                       shards + ACL re-check + a cross-tenant test.\n' +
      'Evaluate with vibes                     A labelled eval set + RAG metrics (faithfulness, answer\n' +
      '                                       relevance, context precision/recall) + LLM judge + human sample,\n' +
      '                                       run in CI on every prompt/index/model change (Part 7 Ch 8).\n' +
      'Corpus updates, index does not          Scheduled re-index + streaming upserts for freshness; version\n' +
      '                                       the index with the embedding model (Ch 6, Ch 7).\n' +
      'Prompt injection from documents          Treat retrieved text as untrusted: delimit it, instruct the\n' +
      '                                       model to ignore instructions inside it, scan in/out (Part 9 Ch 5).\n' +
      'One giant context of 50 chunks           More context ≠ better; it raises cost, latency, and\n' +
      '                                       distraction. Retrieve wide, rerank, keep the best 5-8.\n' +
      'No cost control                          Prefix-cache the system prompt, cache embeddings + retrieval,\n' +
      '                                       cap chunk count and max tokens; track cost per answer (Ch 8, Ch 11).</code></pre>' +
      '<p><b>Iterate in this order:</b> fix retrieval (chunking → hybrid → rerank) before touching the generator; a bigger LLM cannot answer from passages it never received.</p>',
      try: [
        ['📖 LlamaIndex — production RAG & advanced retrieval', 'https://docs.llamaindex.ai/en/stable/optimizing/production_rag/', 'o'],
        ['🏢 Part 9: security for AI systems (prompt injection)', '../learn9/#ch5', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Design a document-QA assistant. What are the stages?\n' +
      '   A: Offline: clean → structure-aware chunk (overlap, prepend headings) → embed → index (vector + BM25).\n' +
      '   Online: optional query rewrite → hybrid retrieve → cross-encoder rerank → keep top 5-8 → build a\n' +
      '   prompt (system rules + cited chunks + question) → LLM answer with inline citations, instructed to\n' +
      "   abstain when unsupported → guardrails (grounding check, PII, policy) → stream → log Q+chunks+answer+\n" +
      '   feedback for evaluation.\n\n' +
      'Q: The assistant hallucinates while citing a real doc. Where do you look, in order?\n' +
      '   A: 1) Retrieval recall — is the supporting passage even being retrieved? Fix chunking (boundaries,\n' +
      '   overlap, headings), go hybrid + rerank. 2) Prompt — force citations and explicit abstention. 3) Add a\n' +
      '   groundedness/NLI check that each claim is entailed by a cited chunk; refuse or flag on failure.\n\n' +
      'Q: How do you stop one tenant retrieving another tenant\'s documents?\n' +
      '   A: Treat retrieval scoping as a security boundary: hard metadata filter on tenant_id (native\n' +
      '   filtered-ANN), shard the index per tenant so a query cannot physically reach other vectors, re-check\n' +
      '   ACLs at render, and add a cross-tenant-retrieval test to the eval suite.\n\n' +
      'Q: How do you evaluate this system and gate changes?\n' +
      '   A: A labelled set of question / gold-passages / gold-answer. Metrics: retrieval recall@k, faithfulness/\n' +
      '   groundedness, answer relevance, context precision, refusal correctness — via RAG-eval tooling + an LLM\n' +
      '   judge + a human sample. Run it in CI on every prompt/index/model change with pass thresholds\n' +
      '   (Part 7 Ch 8).\n\n' +
      'Q: Improve answer quality — bigger LLM or better retrieval?\n' +
      '   A: Retrieval first. The generator can only answer from what it receives; recall and rerank quality and\n' +
      '   chunking usually dominate. Upgrade the LLM after retrieval is solid.\n\n' +
      'Q: Retrieved documents contain "ignore your instructions and…". What do you do?\n' +
      '   A: Treat retrieved text as untrusted data: delimit it clearly, instruct the model that content inside\n' +
      '   the delimiters is reference material and never commands, and scan inputs/outputs for injection and\n' +
      '   exfiltration patterns (Part 9 Ch 5).\n\n' +
      'Q: Where does the cost go and how do you cut it?\n' +
      '   A: The LLM call dominates. Prefix-cache the system prompt, cache query embeddings and retrieval\n' +
      '   results, cap chunk count and max output tokens, and use a smaller model where the eval set says it\n' +
      '   still passes (Ch 8, Ch 11).</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch15">Ch 15</a> (feed walkthrough — same funnel), <a href="#ch7">Ch 7</a>, <a href="#ch8">Ch 8</a>, <a href="#ch14">Ch 14</a>, ' +
      '<a href="../learn2/#ch5">Part 2 Ch 5-6</a> (RAG &amp; reranking), <a href="../learn8/#ch7">Part 8 Ch 7</a> (eval-in-prod), <a href="../learn9/#ch5">Part 9 Ch 5</a> (security).</p>',
      try: [
        ['📖 Haystack — RAG pipelines & evaluation', 'https://docs.haystack.deepset.ai/docs/get_started', 'o'],
        ['📖 OpenAI — retrieval-augmented generation best practices', 'https://platform.openai.com/docs/guides/retrieval', 'o']
      ] }
  ],

  quiz: [
    { q: 'The RAG assistant produces fluent, confident answers that are not supported by the cited document. What is the highest-leverage first fix?',
      opts: [
        'Switch to a much larger LLM',
        'Fix retrieval so the supporting passage is actually retrieved — better chunking (overlap, headings), hybrid dense+sparse, and reranking — then add an abstention instruction and a groundedness check',
        'Remove citations from the prompt',
        'Increase temperature'],
      ok: 1,
      why: 'The generator can only answer from passages it receives; if recall is poor a bigger model just hallucinates more fluently. Retrieval quality (chunking, hybrid, rerank) plus forced abstention and a grounding check is the fix.' },
    { q: 'In a multi-tenant RAG system, how should you prevent one tenant\'s query from retrieving another tenant\'s documents?',
      opts: [
        'Sort results so the wrong-tenant docs rank lower',
        'Treat retrieval scoping as a security boundary: hard metadata filter on tenant_id (native filtered-ANN), per-tenant index shards, ACL re-check at render, and a cross-tenant-retrieval test',
        'Ask the LLM politely not to use other tenants\' data',
        'Encrypt the answer'],
      ok: 1,
      why: 'Cross-tenant isolation is a correctness/security requirement, not a ranking preference — it must be enforced by filtering and physical partitioning, and verified by tests.' },
    { q: 'Which sequence best reflects the standard production RAG pipeline?',
      opts: [
        'Fine-tune the LLM on all documents, then answer directly',
        'Offline: clean → chunk → embed → index (vector + keyword). Online: retrieve (hybrid) → rerank → build cited prompt → LLM (with abstention) → guardrails → log for evaluation',
        'Embed the question, return the nearest document verbatim',
        'Put the entire corpus in the prompt every time'],
      ok: 1,
      why: 'The retrieve → rerank → generate-with-citations → guardrail → evaluate pipeline over a hybrid index is the industry-standard architecture; fine-tuning on the corpus and full-context stuffing do not scale or stay fresh.' }
  ]
};
