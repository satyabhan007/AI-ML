/* AI-ML Learn — Part 7 · Chapter 5: Progressive Delivery */
window.CH[5] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Flipping 100% of traffic to a new model at once means that if it is bad — slower, less accurate, a broken output format — <i>everyone</i> gets the bad version ' +
      'at the same moment, and you find out from an incident. <b>Progressive delivery</b> shifts traffic gradually, watches metrics at each step, and rolls back ' +
      'automatically if something regresses.</p>' +
      '<pre><code>CANARY       1% → 5% → 25% → 50% → 100%, pausing to check metrics between steps\n' +
      'BLUE-GREEN   run old (blue) + new (green) side by side; flip all traffic; flip back instantly on trouble\n' +
      'SHADOW       send a COPY of live traffic to the new model, do not use its output — pure safety test\n' +
      'A/B          split users, compare a business metric with statistics (Part 4 Ch 11)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Testing bathwater with a toe.</b> You do not jump in. A toe (canary 1%), then a foot, then a leg — ' +
      'and if it is scalding you pull back before you are in. Shadow traffic is holding your hand near the water without touching it, just to feel the heat.</p></div>',
      try: [
        ['📖 Argo Rollouts — canary & blue-green strategies', 'https://argo-rollouts.readthedocs.io/en/stable/features/canary/', 'o'],
        ['🚀 Ch 4 — the GitOps controller that triggers this', '#ch4', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>CANARY          incremental traffic weights + a pause (manual gate or automated analysis) per step.\n' +
      '                Auto-analysis: query Prometheus for error rate / p99 / a quality metric; if it\n' +
      '                breaches, ABORT and route back to stable.\n' +
      'BLUE-GREEN      instant cutover + instant rollback; needs 2× capacity briefly; good when you\n' +
      '                cannot split traffic finely or must switch atomically.\n' +
      'SHADOW / MIRROR  duplicate requests to the new version; discard its responses. Validates latency,\n' +
      '                crashes, output-shape, cost on real traffic with ZERO user risk. Watch for\n' +
      '                double side-effects (writes, LLM spend).\n' +
      'A/B / ONLINE EXPERIMENT   randomised user split; measure a business metric with a test; needs\n' +
      '                enough traffic + time for power. Different question: "is it BETTER", not "is it SAFE".\n' +
      'METRICS TO GATE ON   latency (p50/p99), error rate, saturation, AND a model-quality signal\n' +
      '                (eval-in-prod score, thumbs, groundedness) + business guardrails.\n' +
      'STICKINESS      pin a user to one variant for the rollout so their experience is consistent.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard controllers are <b>Argo Rollouts</b> and <b>Flagger</b> (canary/blue-green with automated ' +
      '<b>AnalysisTemplates</b> against Prometheus/Datadog), on top of a traffic router (a <b>service mesh</b> — Istio/Linkerd — or an ingress/Gateway API). ' +
      'For user-level A/B, a <b>feature-flag / experimentation platform</b> (LaunchDarkly, Unleash, Statsig, GrowthBook). ' +
      'You configure a rollout strategy + analysis; you do not write traffic-shifting logic.</p></div>',
      try: [
        ['📖 Flagger — progressive delivery operator', 'https://docs.flagger.app/', 'o'],
        ['📕 Part 4: A/B testing & online evaluation (stats)', '../learn4/#ch11', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Shadow catches the format break.</b> ' +
      'A new LLM version is mirrored to a shadow deployment for 24 h at 10% of traffic. Its responses are discarded, but logging shows 4% of them fail JSON parsing ' +
      '(the new model formats tool calls slightly differently) and p99 TTFT is 1.6× higher. The rollout is cancelled before a single user is affected; ' +
      'the prompt is adjusted and shadow re-run until clean. <b>Note:</b> shadow was configured to NOT execute tool calls or bill for generations — ' +
      'mirroring side-effecting traffic naively would have double-charged and double-acted.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Canary auto-abort on a quality metric.</b> ' +
      'A ranking model canaries at 5%. Latency and errors look fine, so a naive rollout would proceed — but the <b>AnalysisTemplate</b> also checks a live ' +
      '"click-through on ranked results" metric, which drops 8% on the canary slice. The rollout auto-aborts and routes back to stable within one analysis interval. ' +
      'Gating on system metrics alone would have shipped a quality regression.</p></div>' +
      '<p><b>Bake time matters:</b> hold each canary step long enough to see real traffic patterns (peak hours, batch jobs, the long tail of request types) — ' +
      'minutes for infra bugs, hours-to-days for quality and business effects.</p>',
      try: [
        ['📖 Argo Rollouts — analysis & automated rollback', 'https://argo-rollouts.readthedocs.io/en/stable/features/analysis/', 'o'],
        ['📡 Part 8: which metrics to gate a rollout on', '../learn8/#ch3', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Big-bang 0→100% deploy                 Canary or blue-green with metric gates + auto-rollback.\n' +
      'Gate only on latency + errors          Add a model-quality signal (eval-in-prod, thumbs, groundedness)\n' +
      '                                       and business guardrails. Infra-green ≠ good.\n' +
      'Canary steps with no bake time         Hold each step through real traffic variation; quality/business\n' +
      '                                       effects need hours, not seconds.\n' +
      'Shadow traffic that executes side       Shadow must not write, call tools, or bill. Otherwise you\n' +
      '  effects                               double-act and double-spend.\n' +
      'No stickiness                           Pin a user to one variant during the rollout; flipping them\n' +
      '                                       mid-session is a bad, noisy experience.\n' +
      'Confusing "safe" with "better"          Canary/shadow answer "is it safe to ship". A/B with statistics\n' +
      '                                       answers "is it an improvement". Do both.\n' +
      'Manual promote clicks only              Automate the analysis + abort; keep a manual approval gate only\n' +
      '                                       where a human judgement is genuinely needed.\n' +
      'Blue-green with no capacity headroom     You need ~2× briefly; plan it or the cutover starves.</code></pre>' +
      '<p><b>Sequence for a risky model change:</b> shadow (no user impact) → small canary with auto-analysis → wider canary / A/B for the business metric → 100%. ' +
      'Each stage answers a different question and each can abort cheaply.</p>',
      try: [
        ['📖 Google — canary analysis (Kayenta / ACA)', 'https://github.com/spinnaker/kayenta', 'o'],
        ['📖 Martin Fowler — progressive delivery / canary release', 'https://martinfowler.com/bliki/CanaryRelease.html', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Canary vs blue-green vs shadow — what does each give you?\n' +
      '   A: Canary: gradual traffic shift with metric gates and auto-rollback per step. Blue-green: run both\n' +
      '   versions, flip all traffic atomically, flip back instantly (needs ~2× capacity). Shadow: mirror a\n' +
      "   copy of live traffic to the new version and discard its output — a zero-risk test of latency,\n" +
      '   crashes, output shape and cost.\n\n' +
      'Q: What must a shadow deployment NOT do?\n' +
      '   A: Execute side effects — no writes, no tool calls, no billable generations. Naively mirroring\n' +
      '   side-effecting traffic double-acts and double-spends.\n\n' +
      'Q: A canary looks fine on latency and error rate. Why might it still be a bad release?\n' +
      '   A: Quality regressed. Gate the analysis on a model-quality signal too (eval-in-prod score, CTR on\n' +
      '   results, thumbs, groundedness) plus business guardrails — infra-green does not mean the model is\n' +
      '   good.\n\n' +
      'Q: How long should each canary step run?\n' +
      '   A: Long enough to see real traffic variation. Minutes catch infra bugs; quality and business effects\n' +
      "   need hours to days, and you should span peak and off-peak.\n\n" +
      'Q: Does a canary tell you the new model is better?\n' +
      '   A: No — it tells you it is safe. "Better" is a randomised A/B experiment with enough traffic and a\n' +
      '   statistical test on a business metric. Run canary/shadow for safety, then A/B for value.\n\n' +
      'Q: How does progressive delivery relate to GitOps?\n' +
      '   A: The GitOps controller applies the merged change; a rollout controller (Argo Rollouts/Flagger)\n' +
      '   then executes the traffic-shifting strategy and analysis, aborting back to stable on breach.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch4">Ch 4</a> (GitOps triggers the rollout), <a href="#ch8">Ch 8</a> (eval gates before rollout), <a href="#ch9">Ch 9</a> (rollback &amp; kill switches), ' +
      '<a href="../learn4/#ch11">Part 4 Ch 11</a> (A/B stats), <a href="../learn8/#ch3">Part 8 Ch 3</a> (gate metrics).</p>',
      try: [
        ['📖 Istio — traffic shifting / weighted routing', 'https://istio.io/latest/docs/tasks/traffic-management/traffic-shifting/', 'o'],
        ['📖 LaunchDarkly — progressive delivery with flags', 'https://launchdarkly.com/blog/what-is-progressive-delivery/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the defining property of shadow (mirror) traffic in a rollout?',
      opts: [
        'It sends 50% of users to the new version',
        'It sends a copy of live requests to the new version and discards its responses — validating latency, crashes, output shape and cost with zero user impact',
        'It replaces the old version immediately',
        'It only runs in staging'],
      ok: 1,
      why: 'Shadowing exercises the new version on real traffic without any user seeing its output. It must be configured to not perform side effects (writes, tool calls, billable generations).' },
    { q: 'A canary shows healthy latency and error rate. Why can it still be the wrong release to ship?',
      opts: [
        'Canaries are always safe to promote',
        'Model quality may have regressed — the analysis must also gate on a quality signal (eval-in-prod, CTR, thumbs, groundedness) and business guardrails',
        'Latency is the only thing that matters',
        'Error rate covers quality'],
      ok: 1,
      why: 'System metrics being green does not mean the model is producing good outputs. Automated canary analysis needs a quality metric alongside latency/errors/saturation.' },
    { q: 'Canary/shadow answer one question; A/B experiments answer another. Which is which?',
      opts: [
        'Both answer "is it better"',
        'Canary/shadow answer "is it safe to ship"; a randomised A/B with a statistical test on a business metric answers "is it an improvement"',
        'Both answer "is it safe"',
        'A/B answers "is it safe"; canary answers "is it better"'],
      ok: 1,
      why: 'Progressive delivery protects against regressions and outages; controlled experimentation measures whether the change actually moves the metric you care about. You typically need both.' }
  ]
};
