/* AI-ML Learn — Part 6 · Chapter 15: Walkthrough A — Feed Ranking, End to End */
window.CH[15] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>"Design the home feed" is the canonical ML system-design question. The user opens the app; you have ~200 ms to pick, from millions of candidate items, ' +
      'the ~20 they will most want to see. Doing that as "score every item with a big model" is impossible at that latency and cost. ' +
      'Real feeds use a <b>funnel</b>: many cheap stages that each throw away most of the candidates, then one expensive stage on what survives.</p>' +
      '<pre><code>millions  →  RETRIEVAL (cheap)  →  ~1000  →  LIGHT RANK  →  ~100  →  HEAVY RANK  →  ~20  →  POLICY  →  feed\n' +
      '                                                                                    (re-rank, dedupe, diversity, ads)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Hiring.</b> You do not do a 4-hour onsite with every applicant. A keyword filter (retrieval) ' +
      'cuts thousands to hundreds; a recruiter screen (light rank) cuts to dozens; the onsite (heavy rank) is reserved for the few. Each stage is cheap enough ' +
      'for its input size and good enough to not drop the eventual hire.</p></div>',
      try: [
        ['📖 Eugene Yan — system design for recommendations & search', 'https://eugeneyan.com/writing/system-design-for-discovery/', 'o'],
        ['🏗️ Ch 1 — the interview map applied here', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>Walking the Ch 1 checklist for a feed:</p>' +
      '<pre><code>CLARIFY   user-facing; p99 < 200 ms end-to-end; ~30k feed-loads/s peak; fresh content matters;\n' +
      '          no policy-violating or stale/seen items.\n' +
      'METRICS   business = weekly retained sessions / time-well-spent; model = ranking loss on\n' +
      '          engagement + a value model; guardrails = latency, diversity floor, integrity.\n' +
      'DATA      implicit labels: impressions + clicks/dwell/like/share/hide. Position bias — log the\n' +
      '          serving propensity. Delayed signals (a "save" watched later).\n' +
      'MODEL     retrieval: two-tower embeddings (ANN) + heuristic sources (follows, trending, fresh).\n' +
      '          light rank: small GBDT/DNN on ~1000. heavy rank: multi-task DNN predicting p(click),\n' +
      '          p(dwell>t), p(like), p(hide) → combine with a weighted "value" score.\n' +
      'SERVE     online. Two-tower USER embedding computed per request; ITEM embeddings + ANN index\n' +
      '          precomputed (batch, Ch 3). Features from the feature store (Ch 5).\n' +
      'SCALE     30k QPS → retrieval from a sharded ANN index + cache; heavy rank scores ~100 items/\n' +
      '          request → batch them on the GPU (Ch 4, Ch 9).\n' +
      'MONITOR   NDCG / engagement on held-out logs, feature + prediction drift, calibration, a shadow\n' +
      '          model, per-segment metrics (Part 8).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>This <b>multi-stage retrieval-and-ranking</b> pattern (candidate generation → ' +
      'coarse ranking → fine ranking → re-ranking/policy) is the industry standard — documented by YouTube, Meta, Pinterest, Instagram, LinkedIn and in ' +
      'the <b>TensorFlow Recommenders</b> / <b>RecSys</b> literature. <b>Two-tower</b> models for retrieval and <b>multi-task DNN</b> rankers are the default building blocks. ' +
      'You are assembling a known architecture and tuning it, not inventing feed ranking.</p></div>',
      try: [
        ['📖 Covington et al. — Deep Neural Networks for YouTube Recommendations', 'https://research.google/pubs/deep-neural-networks-for-youtube-recommendations/', 'o'],
        ['📕 Part 4: recommender systems & learning-to-rank', '../learn4/#ch5', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Retrieval budget vs. recall.</b> ' +
      'The ANN index has 80M items; you can afford to pull ~1 500 candidates in ~15 ms. Pure two-tower recall of the eventual top-20 at k=1 500 is 82%. ' +
      'Adding <b>heuristic sources</b> — items from accounts the user follows, trending in their network, fresh in the last hour — as parallel retrievers ' +
      'and merging (dedupe by item id) lifts top-20 recall to 94% for the same 1 500 budget, because the towers alone under-serve fresh and social content. ' +
      'Retrieval is a <i>union of specialised sources</i>, not one model.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The heavy ranker and the feedback loop.</b> ' +
      'The multi-task ranker is trained on click logs, so it learns to rank up what was already shown and clicked — a self-reinforcing loop that collapses ' +
      'diversity over weeks. Fixes: train with <b>inverse-propensity weighting</b> using the logged serving probability; add a small fraction of ' +
      '<b>randomised / exploration</b> traffic to gather unbiased data; and include an explicit <b>diversity term</b> (or a determinantal-point-process re-rank) ' +
      'in the policy stage. Monitor per-topic and per-creator distribution, not just aggregate engagement.</p></div>' +
      '<p><b>Latency budget (p99 200 ms):</b> LB+auth 15, feature fetch 30, user-tower embed 10, retrieval (ANN + heuristics, parallel) 20, ' +
      'light rank 15, heavy rank (batch 100 on GPU) 55, policy/re-rank 20, serialize+net 25 = 190 ms, 10 ms slack.</p>',
      try: [
        ['📖 Pinterest — multi-stage ranking / PinnerSage & retrieval', 'https://medium.com/pinterest-engineering/pinnersage-multi-modal-user-embedding-framework-for-recommendations-at-pinterest-bfd116b49475', 'o'],
        ['🏗️ Ch 7 — retrieval at scale (the ANN half)', '#ch7', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>PITFALL                               FIX\n' +
      'Single model over all candidates       Funnel: cheap wide stages, one expensive narrow stage. Latency\n' +
      '                                       and cost are otherwise impossible.\n' +
      'Retrieval = one two-tower model        Union of sources: towers + follows + trending + fresh + rules.\n' +
      '                                       Towers under-serve fresh & social.\n' +
      'Train ranker on raw click logs         Position/selection bias → feedback loop. Inverse-propensity\n' +
      '                                       weighting + exploration traffic + logged propensities.\n' +
      'Optimise one objective (clicks)         Multi-task (click, dwell, like, hide, report) + a value model.\n' +
      '                                       Clicks alone breed clickbait.\n' +
      'No diversity / integrity stage          Explicit re-rank: dedupe, per-creator caps, diversity term,\n' +
      '                                       policy filters, seen-item exclusion.\n' +
      'Offline NDCG up, ship it                Offline gain ≠ online gain. A/B test; watch guardrails and\n' +
      '                                       per-segment metrics (Part 4 Ch 11, Part 8).\n' +
      'Stale item embeddings                   Rebuild/refresh the ANN index on a schedule; stream new items\n' +
      '                                       in for freshness (Ch 6, Ch 7).\n' +
      'Uncalibrated scores fed to policy        Calibrate p(click) etc. so the value combination and ad\n' +
      '                                       auction math are meaningful.</code></pre>' +
      '<p><b>Where the parts of this course meet:</b> Ch 2 (budget), Ch 3 (batch-precompute + online), Ch 4/9 (GPU batching for heavy rank), Ch 5 (features), ' +
      'Ch 7 (ANN), Ch 8 (candidate/feature caches), Part 4 (the models), Part 7 (shipping a new ranker via canary), Part 8 (drift, calibration, per-segment).</p>',
      try: [
        ['📖 Meta — scaling the Instagram Explore recommendations system', 'https://engineering.fb.com/2023/08/09/ml-applications/scaling-instagram-explore-recommendations-system/', 'o'],
        ['📕 Part 4: A/B testing & online evaluation', '../learn4/#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Walk me through the architecture of a home feed at 30k QPS with a 200 ms budget.\n' +
      '   A: A funnel. Retrieval (ANN two-tower + heuristic sources: follows, trending, fresh) narrows millions\n' +
      '   to ~1000-1500. A light ranker (small GBDT/DNN) cuts to ~100. A heavy multi-task DNN ranker scores\n' +
      '   those ~100 (batched on GPU) predicting click/dwell/like/hide, combined into a value score. A policy\n' +
      '   stage dedupes, applies diversity + per-creator caps + integrity filters + seen-exclusion, and mixes\n' +
      '   ads. Item embeddings + ANN index are precomputed in batch; the user embedding and features are fetched\n' +
      '   per request.\n\n' +
      'Q: Why not just run the heavy ranker on everything?\n' +
      '   A: Cost and latency. Scoring millions of items with a big DNN per request cannot fit 200 ms or any\n' +
      '   sane GPU budget. Each funnel stage is cheap for its input size and accurate enough not to drop the\n' +
      "   items the next stage wants.\n\n" +
      'Q: Your engagement is up but the feed is getting repetitive and clickbaity. Causes and fixes?\n' +
      '   A: Single-objective (clicks) training and a feedback loop from biased logs. Fix: multi-task objectives\n' +
      '   including negative signals (hide/report) and a value model; inverse-propensity weighting + exploration\n' +
      '   traffic; an explicit diversity/integrity re-rank; and per-topic/per-creator distribution monitoring.\n\n' +
      'Q: How do you ship a new ranker safely?\n' +
      '   A: Shadow it first (score live traffic, do not serve), then a canary A/B on a small % with guardrail\n' +
      '   metrics (latency, diversity, integrity, per-segment engagement) and auto-rollback, expanding only if\n' +
      '   the online metric moves and no guardrail regresses (Part 7 Ch 5, Part 4 Ch 11).\n\n' +
      'Q: Retrieval recall of the eventual top-20 is only 82%. What do you do before touching the model?\n' +
      '   A: Add specialised retrieval sources (follows, in-network trending, fresh) in parallel and merge —\n' +
      '   towers under-serve social and fresh content, and the union usually lifts recall a lot for the same\n' +
      '   candidate budget.\n\n' +
      'Q: Where does the p99 budget actually go?\n' +
      '   A: Often feature fetch + heavy-rank batch dominate, not retrieval. Budget every hop; a cold feature\n' +
      '   cache or an oversized heavy-rank batch is the usual SLO breaker.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch16">Ch 16</a> (the RAG walkthrough — same funnel thinking), <a href="#ch7">Ch 7</a>, <a href="#ch3">Ch 3</a>, ' +
      '<a href="../learn4/#ch5">Part 4 Ch 5</a> (recsys models), <a href="../learn4/#ch6">Part 4 Ch 6</a> (learning to rank).</p>',
      try: [
        ['📖 LinkedIn — the feed ranking system', 'https://engineering.linkedin.com/blog/2020/understanding-feed-dwell-time', 'o'],
        ['📖 TensorFlow Recommenders — retrieval & ranking tutorials', 'https://www.tensorflow.org/recommenders', 'o']
      ] }
  ],

  quiz: [
    { q: 'Why do large feeds use a multi-stage funnel (retrieval → light rank → heavy rank → policy) instead of one model over all candidates?',
      opts: [
        'Because one model would be too accurate',
        'Scoring millions of items with a heavy model per request cannot meet the latency budget or GPU cost; each stage is cheap for its input size and accurate enough to preserve the items the next stage needs',
        'Because funnels are required by GDPR',
        'To make the system harder to debug'],
      ok: 1,
      why: 'The funnel is a cost/latency structure: progressively more expensive models on progressively fewer candidates, each stage tuned to not discard the eventual winners.' },
    { q: 'The feed\'s engagement rises but diversity collapses and content gets clickbaity. Best combination of fixes?',
      opts: [
        'Train harder on clicks only',
        'Multi-task objectives including negative signals (hide/report) + a value model, inverse-propensity weighting with exploration traffic, and an explicit diversity/integrity re-rank stage',
        'Remove the policy stage',
        'Increase the candidate count'],
      ok: 1,
      why: 'Single-objective click optimisation plus a biased-log feedback loop drives clickbait and homogeneity. Debiasing the training data, optimising multiple (incl. negative) objectives, and an explicit diversity re-rank counter it.' },
    { q: 'Retrieval recall of the eventual top-20 is 82% with a pure two-tower ANN model. First move?',
      opts: [
        'Retrain the two-tower model with more epochs',
        'Add specialised parallel retrieval sources (followed accounts, in-network trending, fresh items) and merge/dedupe — the union typically lifts recall a lot for the same candidate budget',
        'Serve the feed with only 82% of items',
        'Switch to exact nearest-neighbour search'],
      ok: 1,
      why: 'Two-tower models under-serve fresh and social content. Retrieval in production is a union of complementary sources, not a single model.' }
  ]
};
