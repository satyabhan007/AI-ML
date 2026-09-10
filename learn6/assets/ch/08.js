/* AI-ML Learn — Part 6 · Chapter 8: Caching for AI */
window.CH[8] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Model calls are the most expensive thing in the system — dollars and milliseconds. A <b>cache</b> stores the answer to work you have already done ' +
      'so the next identical (or similar) request skips the model entirely.</p>' +
      '<pre><code>request comes in\n' +
      '  → is the answer already cached?   yes → return it in 2 ms for $0\n' +
      '                                    no  → run the model, store the answer, return it</code></pre>' +
      '<p>Even a 30% hit rate cuts cost and latency by ~30%. For AI systems there are several distinct things worth caching, each with its own key and its own way of going stale.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A barista who remembers your order.</b> If you ask for "the usual", they skip taking the order ' +
      'and go straight to making it. But if you changed your usual last week and they did not update, you get last week\'s drink — that is a stale cache.</p></div>',
      try: [
        ['📖 AWS — caching best practices', 'https://aws.amazon.com/caching/best-practices/', 'o'],
        ['🏗️ Ch 2 — the latency budget caching protects', '#ch2', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>WHAT TO CACHE (AI-specific)\n' +
      '  Exact prompt/response   key = hash(model, params, full prompt). Trivial, safe, low hit rate on\n' +
      '                          free-text; high on templated/agent calls.\n' +
      '  Semantic cache          key = query embedding; return a prior answer if cosine similarity > τ.\n' +
      '                          Higher hit rate; risk of a wrong-but-close hit — tune τ, scope by user/tenant.\n' +
      '  Embedding cache         key = hash(text). Embeddings are deterministic → near-100% reusable.\n' +
      '  Retrieval cache         key = hash(query, filters, index_version). Cache the doc IDs.\n' +
      '  KV / prefix cache       reuse attention KV for a shared prompt prefix (system prompt, few-shot).\n' +
      '                          Runtime feature (vLLM, SGLang), not an app cache.\n' +
      '  Precomputed results     batch-scored recommendations / classifications served from a KV store.\n' +
      'POLICIES   TTL, LRU/LFU eviction, max size; negative caching (cache "no result" briefly).\n' +
      'LAYERS     in-process (fastest, per-pod) → shared (Redis/Memcached) → CDN (for public GET).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The infrastructure standard is <b>Redis</b> (or Memcached / a CDN for public content); ' +
      'the LLM-specific standards are <b>prefix / prompt caching</b> (built into vLLM, SGLang, and the major model APIs) and <b>semantic caching</b> ' +
      '(GPTCache and equivalents, or a vector DB you already run). Deterministic sub-results — embeddings, retrieval hits — get a plain keyed cache. ' +
      'You configure keys, TTLs and eviction; the store is off the shelf.</p></div>',
      try: [
        ['📖 vLLM — automatic prefix caching', 'https://docs.vllm.ai/en/latest/features/automatic_prefix_caching.html', 'o'],
        ['📖 GPTCache — semantic cache for LLMs', 'https://github.com/zilliztech/GPTCache', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Semantic cache returns a subtly wrong answer.</b> ' +
      'A support bot caches by query embedding with τ = 0.85. "How do I cancel my <b>Pro</b> plan?" hits a cached answer for "How do I cancel my <b>Free</b> plan?" — ' +
      'they are 0.9 similar but the answers differ. Fixes: raise τ, include structured context in the key (plan tier, locale), scope the cache per user segment, ' +
      'and only serve a semantic hit for <i>read-only, low-stakes</i> intents — never for account actions or anything personalised.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Prefix caching cuts LLM cost 40%.</b> ' +
      'Every request sends the same 1 800-token system prompt + tool schema, then a short user turn. Enabling <b>automatic prefix caching</b> in the runtime ' +
      'means the KV for those 1 800 tokens is computed once and reused across requests that share the prefix — prefill work and cost for the shared part drop to near zero. ' +
      'Keep the volatile bits (user message, retrieved chunks) <i>after</i> the stable prefix so the prefix actually matches.</p></div>' +
      '<p><b>Invalidation is the hard part.</b> Tie each cache to a version: <code>index_version</code> for retrieval, <code>model_version</code> + <code>prompt_version</code> ' +
      'for responses, a content hash for embeddings. Bump the version → the old entries are simply never matched, no explicit purge needed.</p>',
      try: [
        ['📖 Anthropic — prompt caching', 'https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching', 'o'],
        ['📡 Part 8: cache-hit rate as a first-class metric', '../learn8/#ch5', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Cache key omits model/params/version   Key MUST include model id, temperature/top-p, prompt/template\n' +
      '                                       version, index version. Otherwise you serve stale/mismatched answers.\n' +
      'Semantic cache for personalised or      Only cache read-only, low-stakes, non-personalised responses.\n' +
      '  stateful answers                      A close embedding is not a correct answer for "my account".\n' +
      'One global τ                            Tune τ per intent; measure wrong-hit rate on a labelled set,\n' +
      '                                       not just hit rate.\n' +
      'No TTL                                  Everything needs a max age. Stale-but-fast eventually becomes\n' +
      '                                       just stale.\n' +
      'Cache stampede on a hot key            Single-flight / request coalescing + a short lock so one miss\n' +
      '                                       recomputes while others wait, instead of 500 parallel model calls.\n' +
      'Volatile content before the stable      Put the fixed system prompt / few-shot FIRST so prefix caching\n' +
      '  prefix                                can match; user + retrieved text after.\n' +
      'Not measuring hit rate / savings       Export hit rate, wrong-hit rate, and $ saved. A cache you cannot\n' +
      '                                       measure you cannot trust or tune.\n' +
      'Caching errors / timeouts as answers    Negative-cache carefully and briefly; never cache a 5xx as if it\n' +
      '                                       were a real response.</code></pre>' +
      '<p><b>Order of impact:</b> embedding cache (free win, deterministic) → prefix/KV cache (big LLM win, runtime flag) → exact response cache ' +
      '(safe, modest hit rate) → semantic cache (highest hit rate, needs guardrails). Add them in that order.</p>',
      try: [
        ['📖 AWS — cache stampede / thundering herd mitigation', 'https://aws.amazon.com/builders-library/caching-challenges-and-strategies/', 'o'],
        ['🏗️ Ch 11 — where caching sits in the cost model', '#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What can you cache in an LLM application, from safest to riskiest?\n' +
      'A: Embeddings (deterministic, ~100% reusable) → prompt-prefix / KV cache (runtime feature, big cost cut\n' +
      "   on shared system prompts) → exact prompt→response (safe, low hit rate on free text) → semantic cache\n" +
      '   (embedding-similarity match, highest hit rate but can return a close-but-wrong answer).\n\n' +
      'Q: What MUST be in a response cache key?\n' +
      'A: Model id, sampling params (temperature/top-p), the full prompt or template + template version, and\n' +
      '   any retrieval index version. Miss one and you serve answers from a different model/config/corpus.\n\n' +
      'Q: A semantic cache returns the "cancel Free plan" answer for a "cancel Pro plan" question. Fixes?\n' +
      '   A: Raise the similarity threshold; add structured fields (plan tier, locale) to the key; scope the\n' +
      '   cache per user segment; and restrict semantic hits to read-only, low-stakes, non-personalised intents.\n\n' +
      'Q: How does prefix caching save money, and how do you make it hit?\n' +
      'A: The attention KV for a shared prompt prefix (system prompt, tool schema, few-shot) is computed once\n' +
      '   and reused, so prefill cost for that prefix drops to near zero. Make it hit by putting the stable\n' +
      '   content first and all volatile content (user turn, retrieved chunks) after it.\n\n' +
      'Q: How do you invalidate caches when the model, prompt, or corpus changes?\n' +
      "A: Version the key. Bump model_version / prompt_version / index_version and old entries simply stop\n" +
      '   matching — no explicit purge. Combine with a TTL as a backstop.\n\n' +
      'Q: 500 requests for the same uncached key arrive at once. What happens and how do you prevent the\n' +
      '   stampede?\n' +
      '   A: Without protection, all 500 miss and call the model in parallel. Use single-flight / request\n' +
      '   coalescing: the first miss computes, the rest wait on it, then all read the filled entry.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3</a> (precompute + serve-from-cache), <a href="#ch7">Ch 7</a> (retrieval &amp; embedding caches), ' +
      '<a href="#ch11">Ch 11</a> (cost model), and <a href="../learn8/#ch5">Part 8 Ch 5</a> (cache-hit telemetry).</p>',
      try: [
        ['📖 OpenAI — prompt caching', 'https://platform.openai.com/docs/guides/prompt-caching', 'o'],
        ['📖 Redis — key eviction policies', 'https://redis.io/docs/latest/develop/reference/eviction/', 'o']
      ] }
  ],

  quiz: [
    { q: 'Which value MUST be part of an LLM response cache key?',
      opts: [
        'Only the user\'s question text',
        'Model id, sampling params, the full prompt/template + its version, and any retrieval index version',
        'The current timestamp',
        'The server hostname'],
      ok: 1,
      why: 'If the key omits model/params/prompt-version/index-version, a cache hit can return an answer generated by a different model, configuration, or corpus.' },
    { q: 'What is the main risk of a semantic (embedding-similarity) cache that an exact cache does not have?',
      opts: [
        'It uses more memory',
        'A query that is close in embedding space but semantically different (e.g. "Pro plan" vs "Free plan") can get a wrong-but-plausible cached answer',
        'It cannot be stored in Redis',
        'It always misses'],
      ok: 1,
      why: 'Exact caches only return byte-identical matches; semantic caches match on similarity, so a too-low threshold or missing context in the key yields confidently wrong hits. Restrict them to low-stakes, non-personalised reads.' },
    { q: 'How does prompt-prefix / KV caching reduce LLM cost, and how do you make it effective?',
      opts: [
        'It compresses the model weights; put weights first',
        'It reuses the computed attention KV for a shared prompt prefix; put stable content (system prompt, few-shot) first and volatile content (user turn, retrieved text) after',
        'It disables attention for old tokens',
        'It only works with temperature 0'],
      ok: 1,
      why: 'The prefill work for a shared prefix is done once and reused across requests. That only happens if the prefix is actually identical, so all changing content must come after the stable block.' }
  ]
};
