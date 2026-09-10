/* AI-ML Learn — Part 6 · Chapter 1: The ML System-Design Interview Map */
window.CH[1] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>An <b>ML system-design question</b> is open-ended on purpose: "design a system that recommends videos", "build a spam filter for 1B users". The interviewer is watching <i>how you scope and sequence</i>, not whether you name the trendiest model.</p>' +
      '<p>The winning move is to always walk the same road, out loud, in the same order:</p>' +
      '<pre><code>1  CLARIFY     who uses it, what "good" means, scale, latency, constraints\n' +
      '2  METRICS     one business metric + one model metric + guardrails\n' +
      '3  DATA        where labels come from, features, leakage, freshness\n' +
      '4  MODEL       a dumb baseline first, then one step up, and why\n' +
      '5  SERVE       online / batch / streaming, the request path\n' +
      '6  SCALE       QPS, latency budget, caching, cost\n' +
      '7  MONITOR     online metrics, drift, feedback loop, rollback</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A pilot\'s pre-flight checklist.</b> Pilots do not improvise the order they check the flaps and fuel — they run the same list every flight so nothing is skipped under pressure. Your seven steps are that list: boring, repeatable, and the reason you never freeze.</p></div>',
      try: [
        ['📖 Google — Machine Learning: rules & system design', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'o'],
        ['📕 Part 4: ML system design chapter', '../learn4/#ch9', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>Each step has a small set of things you must say. Memorise the prompts, not a script:</p>' +
      '<pre><code>CLARIFY   functional: what does one request do?  non-functional: QPS, p99 latency, availability, cost ceiling\n' +
      '          who is the user, is it user-facing (tight latency) or internal (batch ok)?\n' +
      'METRICS   business KPI (revenue, retention) --map--> model metric (AUC, recall@k, MAE)\n' +
      '          + guardrails you must NOT regress (latency, fairness, spam rate)\n' +
      'DATA      label source (explicit, implicit, human), class balance, PIT-correctness, drift, volume\n' +
      'MODEL     baseline (heuristic / logistic reg) -> candidate (GBDT / two-tower / fine-tune) -> why the jump\n' +
      'SERVE     online (sync), batch (precompute), streaming (near-real-time); the box diagram\n' +
      'SCALE     back-of-envelope QPS, latency budget split across hops, cache layers, GPU/CPU sizing\n' +
      'MONITOR   online eval, input/prediction drift, feedback capture, canary + rollback</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>You are not inventing a framework — you are using <b>the widely taught ML-system-design rubric</b> (Chip Huyen\'s <i>Designing Machine Learning Systems</i>, the Educative / <i>ML System Design Interview</i> books, Google\'s Rules of ML). Interviewers at every big tech company grade against roughly these buckets. Learn the standard checklist and spend your energy on the <i>tradeoffs inside each box</i>, not on the outline.</p></div>' +
      '<p>Say the checklist name up front — "I\'ll clarify, pick metrics, talk data, baseline then model, serving, scale, then monitoring" — and the interviewer relaxes because they know where you are going.</p>',
      try: [
        ['📖 Chip Huyen — ML Systems Design (course notes)', 'https://huyenchip.com/machine-learning-systems-design/toc.html', 'o'],
        ['📖 Google — Rules of ML (43 rules)', 'https://developers.google.com/machine-learning/guides/rules-of-ml', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<p>The map is only useful if it survives contact with a real prompt. Two runs:</p>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>"Design search ranking for an e-commerce site."</b> ' +
      'CLARIFY: user-facing, ~2k QPS peak, p99 &lt; 200&nbsp;ms end-to-end, must not show out-of-stock items. ' +
      'METRICS: business = revenue per search; model = NDCG@10; guardrail = latency + zero out-of-stock. ' +
      'DATA: labels = clicks + add-to-cart + purchases (implicit, position-biased — note it). ' +
      'MODEL: baseline = BM25 text match; step up = GBDT (LambdaMART) on query/item/user features. ' +
      'SERVE: two-stage — cheap retrieval (top 500) then ranker (top 10), online sync. ' +
      'SCALE: retrieval from an inverted index + cache; ranker is ~500 scorings/request → batch them. ' +
      'MONITOR: NDCG on held-out clicks daily, feature drift, a shadow model.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>"Design a system to flag fraudulent transactions."</b> ' +
      'CLARIFY: near-real-time (&lt;&nbsp;500&nbsp;ms in the payment path), extreme class imbalance (~0.1% positive), ' +
      'a false positive blocks a real customer. METRICS: business = $ fraud prevented − $ good txns blocked; ' +
      'model = precision@recall=0.9; guardrail = block rate on legit users. DATA: labels arrive <i>late</i> ' +
      '(chargebacks land 30–90 days later) → training data is always stale, plan for it. MODEL: baseline = rules; ' +
      'step up = GBDT + a few streaming aggregate features (txns in last 1h/24h). SERVE: streaming, feature store ' +
      'for the aggregates, synchronous score in the auth flow. SCALE: the feature lookup is the latency risk — cache hot keys. ' +
      'MONITOR: alert on score-distribution shift within hours, not on labels.</p></div>' +
      '<p>Notice the checklist is identical; only the <i>answers</i> change. That is the point — you never stare at a blank page.</p>',
      try: [
        ['📖 Eugene Yan — applied ML system design write-ups', 'https://eugeneyan.com/writing/system-design-for-discovery/', 'o'],
        ['📓 Part 5: point-in-time correctness & feature stores', '../learn5/#ch1', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<p>How candidates lose a strong-signal round even with the right checklist:</p>' +
      '<pre><code>ANTI-PATTERN                     FIX\n' +
      'Jump straight to "I\'d use a       Spend 3–4 min on CLARIFY. Wrong problem, wrong everything.\n' +
      '  transformer"\n' +
      'No baseline                       Always propose a heuristic / logistic-reg baseline first and\n' +
      '                                  say what it would miss — shows judgement, de-risks the design.\n' +
      'One metric only                   Name the business KPI, the model proxy for it, AND the\n' +
      '                                  guardrails you must not regress.\n' +
      'Hand-wave scale                   Do the arithmetic out loud: users x actions/day / 86400 = QPS;\n' +
      '                                  split the p99 budget across each hop.\n' +
      'Ignore the feedback loop          Say how labels are collected in production and how the model\n' +
      '                                  gets retrained — position bias, delayed labels, feedback loops.\n' +
      'Design v3 on a whiteboard         Ship v1 (rules + one model), then say what v2/v3 add. Scope control\n' +
      '                                  is the senior signal.\n' +
      'Forget rollback                   Every design ends with canary + shadow + a one-command rollback.</code></pre>' +
      '<p><b>Time budget for a 45-min round:</b> ~5 clarify, ~5 metrics + data, ~10 model + serving, ~10 scale, ' +
      '~5 monitoring, ~10 buffer for the interviewer\'s follow-ups (which is where the real grading happens — leave room).</p>',
      try: [
        ['📖 "Machine Learning System Design Interview" (Aminian & Xu) — outline', 'https://www.educative.io/blog/machine-learning-system-design-interview', 'o'],
        ['📕 Part 4: A/B testing & online evaluation', '../learn4/#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: You have 45 minutes and the prompt "design a system to recommend who to follow". Where do you start?\n' +
      'A: Clarify first. Who is the user (new vs established)? What is "good" — follow-backs, retained follows,\n' +
      '   DAU? Scale (registered users, recommendations/day -> QPS)? Latency (feed load budget)? Cold start?\n' +
      '   Only then metrics: business = retained follows at 7d; model = precision@k on accepted suggestions;\n' +
      '   guardrail = no latency regression, diversity floor. Then data, baseline, model, serving, scale, monitor.\n\n' +
      'Q: The interviewer says "assume 200M users, each opens the app 5x/day and we refresh suggestions each open".\n' +
      '   What QPS are you designing for?\n' +
      'A: 200e6 * 5 = 1e9 requests/day. /86400 ~= 11.6k QPS average; plan for ~3x peak ~= 35k QPS. That decides\n' +
      '   whether suggestions are precomputed (batch, cached per user, cheap) or scored online (needs a fleet).\n' +
      '   At 35k QPS I would precompute top-N per user nightly + a lightweight online re-rank.\n\n' +
      'Q: Why insist on a baseline before proposing the "real" model?\n' +
      'A: It sets a floor, exposes data problems early, is trivial to ship as v1, and quantifies the gain the\n' +
      '   complex model must justify. "Most-followed accounts in your country" is a shockingly hard baseline to beat.\n\n' +
      'Q: The design is done. The interviewer asks "what breaks first in production?"\n' +
      'A: Usually the feedback loop and drift: position bias makes the model recommend what it already recommends;\n' +
      '   label delay hides regressions; a feature pipeline silently goes stale. So: log propensities, monitor\n' +
      '   input + prediction drift, run a shadow model, and keep a one-command rollback.\n\n' +
      'Q: How do you keep scope under control when the interviewer keeps adding requirements?\n' +
      'A: Name versions. "v1 handles the core path; multi-language, real-time updates, and personalization of the\n' +
      '   ranking are v2 — here is where they plug in." Shows you can ship and still see the roadmap.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch2">Ch 2 — Requirements → SLOs → capacity math</a> turns the arithmetic above into a defensible number, ' +
      'and <a href="../learn8/">Part 8</a> covers the monitoring step in depth.</p>',
      try: [
        ['📖 Xu & Lam — "Machine Learning System Design Interview" (book site)', 'https://bytebytego.com/courses/machine-learning-system-design-interview', 'o'],
        ['📖 Stanford CS329S — ML systems design lectures', 'https://stanford-cs329s.github.io/syllabus.html', 'o']
      ] }
  ],

  quiz: [
    { q: 'In an ML system-design round, what should you do in the first ~5 minutes?',
      opts: [
        'Name a model architecture and start drawing its layers',
        'Clarify users, the definition of "good", scale, latency and constraints before designing anything',
        'Estimate the GPU bill',
        'List every feature you can think of'],
      ok: 1,
      why: 'The interviewer grades scoping and sequencing. Clarifying requirements first prevents designing the wrong system — every later choice depends on the answers.' },
    { q: 'Why propose a dumb baseline (heuristic or logistic regression) before the "real" model?',
      opts: [
        'It is required by company policy',
        'It sets a performance floor, surfaces data issues early, ships as v1, and quantifies the gain the complex model must justify',
        'Baselines always win, so you can stop there',
        'It makes the design take longer, which looks thorough'],
      ok: 1,
      why: 'A baseline de-risks the project and gives a concrete number to beat. Jumping straight to a large model with no baseline is a classic weak-signal move.' },
    { q: '200M users × 5 opens/day, one scoring request per open. Roughly what average QPS, and what does it imply?',
      opts: [
        '~1.6k QPS — score everything online with a single server',
        '~11.6k QPS average (plan ~35k peak) — likely precompute per-user results in batch and cache them, with a light online re-rank',
        '~1M QPS — impossible, redesign the product',
        'QPS does not matter for recommendations'],
      ok: 1,
      why: '1e9 requests/day ÷ 86,400 s ≈ 11.6k QPS, and you design for a ~3× peak. At that scale, precomputing top-N per user offline and caching it is far cheaper than online scoring every request.' }
  ]
};
