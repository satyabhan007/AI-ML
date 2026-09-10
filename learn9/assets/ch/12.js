/* AI-ML Learn — Part 9 · Chapter 12: Vendor & Model Portability */
window.CH[12] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Foundation models change fast: prices drop, a better model ships, a provider has an outage or changes its terms. If switching models means rewriting your ' +
      'application, you have handed a critical dependency total leverage over you. <b>Portability</b> is designing so that changing or adding a model is a config change.</p>' +
      '<pre><code>ABSTRACTION LAYER   your app talks to ONE internal interface, not to a vendor SDK\n' +
      'MODEL GATEWAY       routes that interface to any provider/model, with fallback + policy\n' +
      'VENDOR-NEUTRAL ASSETS   prompts, evals, and the client contract do not assume one model\n' +
      'EXIT STRATEGY       a written, tested plan to move off any single provider within N weeks</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Standard plumbing fittings.</b> If your house is plumbed with one manufacturer\'s proprietary ' +
      'connectors, that manufacturer owns you. Standard fittings mean any pipe from any supplier drops in. The model gateway is the standard fitting for LLM providers.</p></div>',
      try: [
        ['🏗️ Part 6: the inference gateway & standard APIs', '../learn6/#ch14', 'o'],
        ['🚀 Part 7: managed vs self-hosted inference', '../learn7/#ch7', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>ABSTRACTION\n' +
      '  one internal API (adopt a de-facto standard — OpenAI-compatible chat/completions, or KServe OIP\n' +
      '  for predict models). App code never imports a vendor SDK directly.\n' +
      '  normalise: message format, tool-calling schema, streaming events, usage/cost fields, error types,\n' +
      '  finish reasons — so callers see one shape regardless of backend.\n' +
      'MODEL GATEWAY (Ch 10, Part 6 Ch 3)\n' +
      '  route by {capability, cost, latency, region, tenant policy}; multi-provider FALLBACK; per-team\n' +
      '  quotas; central metering; caching; retries. LiteLLM / Portkey / Kong AI Gateway / cloud AI gateway.\n' +
      'VENDOR-NEUTRAL ASSETS\n' +
      '  prompts in a registry, not tuned to one model\'s quirks where avoidable; a portable eval suite\n' +
      '  (Ch 10) you can run against any candidate model; the client contract (Part 6 Ch 14) is your\n' +
      '  schema, not the vendor\'s.\n' +
      'DATA & FINE-TUNES\n' +
      '  keep training/eval data and (where possible) open-weight or exportable fine-tunes; a fine-tune\n' +
      '  locked inside one provider is a lock-in.\n' +
      'EXIT PLAN\n' +
      '  documented: which alternative(s), the migration steps (re-point routes, re-run evals, adjust\n' +
      '  prompts, re-tune), the timeline, and a periodic drill of routing a slice to the alternative.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The de-facto API standards are <b>OpenAI-compatible chat/completions</b> and <b>KServe OIP</b>; ' +
      'model gateways (<b>LiteLLM</b>, <b>Portkey</b>, <b>Kong AI Gateway</b>, <b>Cloudflare AI Gateway</b>, cloud-native) implement multi-provider routing + fallback + ' +
      'metering behind them. This is the same "standard API at the front door" principle from Part 6 Ch 3/14, applied as a procurement/strategy control.</p></div>',
      try: [
        ['📖 LiteLLM — unified API for 100+ LLMs', 'https://docs.litellm.ai/docs/', 'o'],
        ['📖 Cloudflare — AI Gateway', 'https://developers.cloudflare.com/ai-gateway/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>A price cut you could actually take.</b> ' +
      'A competing provider releases a model at 60% of the cost with equivalent quality on the team\'s <b>portable eval suite</b>. Because the app talks to the internal ' +
      'gateway API and prompts live in a registry, the migration is: run the eval suite against the new model (pass), adjust two prompts that relied on the old model\'s ' +
      'formatting, shift 5% → 100% of traffic via the router with quality monitoring (Part 8 Ch 7), keep the old model as fallback for two weeks. Days, not a quarter — ' +
      'and the saving is real.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The provider outage that did not become your outage.</b> ' +
      'The primary model API has a 90-minute regional incident. The gateway\'s <b>fallback chain</b> (a second provider, then a self-hosted open-weight model) is ' +
      'exercised continuously (Part 6 Ch 10), so traffic reroutes automatically with a small quality dip flagged as <code>degraded</code>. Users stay served. ' +
      'Teams that had hard-coded the primary SDK were down for the full 90 minutes.</p></div>' +
      '<p><b>Portability is not free</b> — the abstraction, the gateway, keeping a portable eval suite, and avoiding model-specific prompt hacks all cost effort. ' +
      'Spend it in proportion to how strategic the dependency is; a throwaway internal tool does not need an exit plan, a core product feature does.</p>',
      try: [
        ['📖 Portkey — AI gateway & fallback routing', 'https://portkey.ai/docs', 'o'],
        ['🏗️ Part 6: fallback models & graceful degradation', '../learn6/#ch10', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'App imports a vendor SDK directly      One internal API (OpenAI-compatible / OIP); app never sees\n' +
      '                                       the vendor.\n' +
      'No model gateway                        Gateway with multi-provider routing + fallback + quotas +\n' +
      '                                       metering + caching behind the standard API.\n' +
      'Prompts hand-tuned to one model\'s        Keep prompts portable where feasible; track model-specific\n' +
      '  quirks everywhere                      overrides explicitly and re-evaluate on switch.\n' +
      'No portable eval suite                   A version-controlled eval suite you can run against any\n' +
      '                                        candidate model to decide a switch on evidence.\n' +
      'Fine-tune locked in one provider          Keep the training data; prefer open-weight / exportable\n' +
      '                                        fine-tunes for strategic use cases.\n' +
      'Fallback provider never exercised          Route 1-2% of traffic through it continuously; alert on its\n' +
      '                                        health (Part 6 Ch 10).\n' +
      'No exit plan                              A written, tested plan: alternatives, migration steps,\n' +
      '                                        timeline; drill it periodically.\n' +
      'Same portability effort for everything     Proportionate: strategic core features get the full\n' +
      '                                        abstraction; throwaway tools do not.</code></pre>' +
      '<p><b>The test:</b> could you move a core feature from provider A to provider B (or to self-hosted) in a few weeks — running your eval suite to prove parity, ' +
      're-pointing routes, adjusting a handful of prompts — without touching application code? If not, you have a lock-in to reduce.</p>',
      try: [
        ['📖 Kong — AI Gateway (multi-LLM, governance)', 'https://docs.konghq.com/gateway/latest/ai-gateway/', 'o'],
        ['🏢 Ch 8 — the cost case that portability lets you act on', '#ch8', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Why does foundation-model portability matter, and what does it consist of?\n' +
      '   A: Models and prices change fast and providers have outages and term changes; if switching means a\n' +
      '   rewrite, the dependency has total leverage. Portability = an internal abstraction API, a model\n' +
      '   gateway with multi-provider routing + fallback, vendor-neutral prompts/evals/contract, and a\n' +
      '   written, tested exit plan.\n\n' +
      'Q: What does the abstraction layer normalise?\n' +
      '   A: Message format, tool-calling schema, streaming events, usage/cost fields, error types, and finish\n' +
      '   reasons — so callers see one shape regardless of which backend served the request.\n\n' +
      'Q: A competitor releases an equivalent model at 60% of the cost. What does a portable setup let you do?\n' +
      '   A: Run the portable eval suite against it (prove parity), adjust the few model-specific prompts,\n' +
      '   shift traffic 5% → 100% via the router with quality monitoring, keep the old model as fallback for a\n' +
      '   bake period. Days, not a quarter — and the saving is real.\n\n' +
      'Q: How does portability help during a provider outage?\n' +
      '   A: The gateway fails over to a second provider or a self-hosted model automatically (a fallback chain\n' +
      '   exercised continuously), with any quality dip flagged as degraded — users stay served.\n\n' +
      'Q: What is a hidden form of model lock-in?\n' +
      '   A: A fine-tune that lives only inside one provider, and prompts hand-tuned to one model\'s quirks.\n' +
      '   Keep the training data and prefer open-weight/exportable fine-tunes for strategic use.\n\n' +
      'Q: Should every LLM use case get the full portability treatment?\n' +
      '   A: No — proportionate to how strategic it is. A core product feature warrants the abstraction and\n' +
      '   exit plan; a throwaway internal tool does not.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch10">Ch 10</a> (model gateway, portable evals), <a href="#ch8">Ch 8</a> (cost case), <a href="../learn6/#ch3">Part 6 Ch 3</a> / <a href="../learn6/#ch14">Ch 14</a> (gateway &amp; API), ' +
      '<a href="../learn6/#ch10">Part 6 Ch 10</a> (fallback), <a href="../learn7/#ch7">Part 7 Ch 7</a> (managed vs self-hosted).</p>',
      try: [
        ['📖 OpenAI — API reference (the de-facto interface)', 'https://platform.openai.com/docs/api-reference', 'o'],
        ['📖 KServe — Open Inference Protocol', 'https://kserve.github.io/website/latest/modelserving/data_plane/v2_protocol/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the core of foundation-model portability?',
      opts: [
        'Always using the cheapest model available',
        'An internal abstraction API, a model gateway with multi-provider routing and fallback, vendor-neutral prompts/evals/contract, and a written, tested exit plan',
        'Never using a hosted model',
        'Fine-tuning every model yourself'],
      ok: 1,
      why: 'Portability means changing or adding a model is a configuration change, not an application rewrite — achieved by talking to a standard internal interface and keeping assets vendor-neutral.' },
    { q: 'A competitor releases an equivalent-quality model at 60% of the cost. What does a portable architecture let you do?',
      opts: [
        'Nothing — switching requires a full rewrite',
        'Run your portable eval suite against it to prove parity, adjust the few model-specific prompts, shift traffic gradually via the router with quality monitoring, and keep the old model as fallback — a days-scale migration',
        'Only switch after a year-long project',
        'Switch instantly with no evaluation'],
      ok: 1,
      why: 'With an abstraction API, a registry of prompts, and a portable eval suite, adopting a cheaper equivalent model is a routing and prompt-tweak exercise validated by evals, not a code migration.' },
    { q: 'Which is a hidden form of model lock-in?',
      opts: [
        'Using OpenAI-compatible APIs',
        'A fine-tuned model that exists only inside one provider, plus prompts hand-tuned to that model\'s quirks — keep the training data and prefer open-weight/exportable fine-tunes for strategic use',
        'Running a portable eval suite',
        'Having a written exit plan'],
      ok: 1,
      why: 'Provider-locked fine-tunes and model-specific prompt engineering make a "portable" API non-portable in practice. Retaining data and favouring exportable weights preserves the exit.' }
  ]
};
