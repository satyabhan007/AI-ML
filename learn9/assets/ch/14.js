/* AI-ML Learn — Part 9 · Chapter 14: Access, Quota & Rate-Limit Design */
window.CH[14] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>A shared model gateway serving many teams needs three gates at the front door: <b>who are you</b> (authentication + authorization), <b>how much may you use</b> ' +
      '(quotas), and <b>how fast</b> (rate limits). Get these right and one team\'s mistake or growth cannot hurt everyone else, and finance can predict the bill.</p>' +
      '<pre><code>AUTH        every request carries a verifiable identity (team / service / user) + a scope\n' +
      'QUOTA       a budget over a period: tokens/month, requests/day, $/month — hard or soft cap\n' +
      'RATE LIMIT  a ceiling on instantaneous demand: requests/sec, tokens/minute, concurrency\n' +
      'result:     fairness (Ch 2), cost predictability (Ch 8), and abuse containment (Ch 5)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A gym membership.</b> Your keycard identifies you (auth), your plan says how many visits a month ' +
      'you get (quota), and there is a limit on how many people can be on the treadmills at once (rate limit / concurrency). Without the last one, one CrossFit class ' +
      'ruins everyone\'s workout.</p></div>',
      try: [
        ['📖 Cloudflare — rate limiting best practices', 'https://developers.cloudflare.com/waf/rate-limiting-rules/', 'o'],
        ['🏢 Ch 2 — multi-tenancy & noisy-neighbour protection', '#ch2', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>AUTH / AUTHZ   short-lived tokens (OIDC / mTLS / signed JWT) per service; scopes = which models,\n' +
      '               which features, which data classes. Rotate; audit every call (Ch 5).\n' +
      'RATE-LIMIT ALGORITHMS\n' +
      '  token bucket   steady rate + a burst allowance. The usual default.\n' +
      '  sliding window  smooth, no burst. leaky bucket = strict shaping.\n' +
      '  distributed     enforce across gateway replicas (Redis / a limiter service); approximate is ok.\n' +
      'DIMENSIONS TO LIMIT   requests/sec, INPUT+OUTPUT tokens/minute (the real cost driver for LLMs),\n' +
      '  concurrent requests, and $/period. Limit per {tenant, API key, user, model, route}.\n' +
      'QUOTAS   monthly/daily budgets in tokens or $; soft (warn at 80%, alert owner) then hard (429 /\n' +
      '  degrade to a cheaper model). Roll over or not — decide and document.\n' +
      'TIERS & OVERRIDES   plans (free / standard / enterprise) with default limits; a request-and-approve\n' +
      '  flow for increases; emergency burst grants that expire.\n' +
      'RESPONSES   429 with Retry-After + a clear error type + which limit was hit + current usage headers\n' +
      '  (X-RateLimit-*). Never fail silently or with a generic 500 (Part 6 Ch 14).\n' +
      'FAIRNESS   combine with fair-queuing / weighted scheduling so limits are a floor, not just a cap.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>Standard mechanisms: <b>token-bucket</b> rate limiting (the classic), distributed limiters ' +
      '(<b>Redis</b>, Envoy <b>ratelimit</b> service, cloud API-gateway limits), <b>OAuth2 / OIDC / mTLS</b> for identity + scopes, and <b>X-RateLimit-*</b> / ' +
      '<b>Retry-After</b> response conventions. Model gateways (LiteLLM, Portkey, Kong AI Gateway) bundle per-key token/cost quotas. You set the policy and tiers; the enforcement primitives are off the shelf.</p></div>',
      try: [
        ['📖 Envoy — global rate limiting', 'https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/other_features/global_rate_limiting', 'o'],
        ['📖 IETF — RateLimit header fields draft', 'https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Rate-limiting requests, not tokens, missed the real load.</b> ' +
      'A gateway limits each team to 50 req/s. One team\'s requests each send a 30k-token context and ask for 4k output — 34k tokens/request. At 50 req/s that is ' +
      '1.7M tokens/s, which melts the GPU pool, while a team doing tiny 500-token calls at the same 50 req/s is fine. Fix: limit on <b>tokens per minute</b> (input + output) ' +
      'as the primary dimension, with req/s and concurrency as secondary guards. Token throughput is what actually costs money and capacity.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Hard quota with no soft warning = a production outage.</b> ' +
      'A team hits its monthly token quota at 2pm on the 20th; the gateway starts returning 429 for everything; their customer-facing feature is down. Nobody knew they ' +
      'were close. Fixes: a <b>soft threshold</b> at 80% that alerts the team owner and FinOps (Ch 8), a <b>graceful-degrade</b> option (route overflow to a cheaper ' +
      'model or a cached response instead of hard 429), and a fast <b>request-more</b> flow. Quotas should be a managed conversation, not a cliff.</p></div>' +
      '<p><b>Return usage in every response</b> (<code>X-RateLimit-Remaining</code>, quota used %) so clients can self-throttle and dashboards show approach-to-limit ' +
      'before it becomes an incident.</p>',
      try: [
        ['📖 Stripe — designing rate limiters', 'https://stripe.com/blog/rate-limiters', 'o'],
        ['🏢 Ch 8 — quotas feed budgets, showback & forecasting', '#ch8', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Limit requests/sec only                Primary limit on INPUT+OUTPUT tokens/minute (the cost + load\n' +
      '                                       driver); req/s + concurrency as secondary guards.\n' +
      'Hard quota, no soft warning            Soft threshold (80%) alerts the owner + FinOps; then hard cap\n' +
      '                                       or graceful degrade — never a silent cliff.\n' +
      'Hard 429 on quota exhaustion            Offer degrade-to-cheaper-model / cached response, plus a fast\n' +
      '                                       request-more flow.\n' +
      'Generic 500 / silent drop on limit      429 + Retry-After + error type + which limit + X-RateLimit-*\n' +
      '                                       usage headers (Part 6 Ch 14).\n' +
      'Per-replica limits only                 Distributed enforcement (Redis / limiter service) so the\n' +
      '                                       limit is global, not per gateway pod.\n' +
      'Limits as only a cap                    Pair with fair-queuing so a tenant\'s share is also a FLOOR\n' +
      '                                       under contention (Ch 2).\n' +
      'Long-lived, broad API keys              Short-lived scoped tokens (models / features / data classes);\n' +
      '                                       rotate; audit (Ch 5).\n' +
      'Manual quota changes in a config file    A request-and-approve flow with expiry for temporary bursts;\n' +
      '                                       changes logged.</code></pre>' +
      '<p><b>The design goal:</b> no single caller — through growth, a bug, a bulk job, or abuse — can degrade others or blow the budget, and every caller can see ' +
      'exactly where it stands against its limits. Limits are a fairness and cost-control system, not just a spam filter.</p>',
      try: [
        ['📖 Kong — rate limiting & consumer groups', 'https://docs.konghq.com/hub/kong-inc/rate-limiting-advanced/', 'o'],
        ['📖 Google Cloud — API quotas & rate limits design', 'https://cloud.google.com/apis/design/design_patterns#quotas', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What are the three front-door gates on a shared model gateway?\n' +
      '   A: Authentication + authorization (verifiable identity + scopes), quotas (a budget over a period —\n' +
      '   tokens/$/requests), and rate limits (a ceiling on instantaneous demand — req/s, tokens/minute,\n' +
      '   concurrency). Together: fairness, cost predictability, abuse containment.\n\n' +
      'Q: Why limit on tokens/minute rather than requests/second for LLM traffic?\n' +
      '   A: Token throughput is the real cost and capacity driver. 50 req/s of 34k-token requests is 1.7M\n' +
      '   tokens/s and melts the pool; 50 req/s of 500-token requests is trivial. Limit tokens primarily,\n' +
      '   with req/s and concurrency as secondary guards.\n\n' +
      'Q: A team hit its monthly token quota at 2pm and their customer feature went down. What was missing?\n' +
      '   A: A soft threshold (80%) alerting the owner and FinOps, a graceful-degrade path (cheaper model /\n' +
      '   cached response) instead of a hard 429 cliff, and a fast request-more flow. Quotas should be a\n' +
      '   managed conversation.\n\n' +
      'Q: What should a rate-limited response contain?\n' +
      '   A: HTTP 429, Retry-After, a machine-readable error type, which limit was hit, and X-RateLimit-*\n' +
      '   usage headers — never a generic 500 or a silent drop.\n\n' +
      'Q: Why enforce limits in a distributed limiter rather than per gateway replica?\n' +
      '   A: Per-replica limits multiply by the replica count, so the effective limit is wrong and drifts as\n' +
      '   the gateway scales. A shared limiter (Redis / limiter service) enforces the global limit.\n\n' +
      'Q: How do limits and fairness relate?\n' +
      '   A: A limit alone is a cap. Combined with fair/weighted queuing, a tenant\'s allocation also becomes a\n' +
      '   floor it is guaranteed under contention (Ch 2).</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch2">Ch 2</a> (multi-tenancy &amp; fairness), <a href="#ch8">Ch 8</a> (quotas → budgets &amp; forecasting), <a href="#ch5">Ch 5</a> (scoped tokens, abuse), ' +
      '<a href="#ch10">Ch 10</a> / <a href="#ch12">Ch 12</a> (model gateway), <a href="../learn6/#ch14">Part 6 Ch 14</a> (429 semantics), <a href="../learn6/#ch9">Part 6 Ch 9</a> (load shedding).</p>',
      try: [
        ['📖 LiteLLM — budgets, rate limits & virtual keys', 'https://docs.litellm.ai/docs/proxy/users', 'o'],
        ['📖 AWS — throttling & usage plans (API Gateway)', 'https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-request-throttling.html', 'o']
      ] }
  ],

  quiz: [
    { q: 'For a shared LLM gateway, why limit primarily on tokens-per-minute rather than requests-per-second?',
      opts: [
        'Requests are hard to count',
        'Token throughput is the real cost and capacity driver — 50 req/s of 34k-token requests is orders of magnitude more load and money than 50 req/s of tiny requests',
        'Requests-per-second cannot be enforced',
        'Tokens are cheaper to process'],
      ok: 1,
      why: 'Request count says nothing about payload size. Limiting input+output tokens/minute controls the dimension that actually consumes GPU capacity and generates the bill; req/s and concurrency are secondary guards.' },
    { q: 'A team hit its hard monthly token quota mid-afternoon and its customer-facing feature immediately started returning 429s. What was missing?',
      opts: [
        'A bigger quota, permanently',
        'A soft threshold (e.g. 80%) that alerts the owner and FinOps, a graceful-degrade path (cheaper model / cached response) instead of a hard cliff, and a fast request-more flow',
        'More gateway replicas',
        'A faster model'],
      ok: 1,
      why: 'Quotas should be a managed conversation with early warning and a soft-landing option, not an unannounced cliff that takes a production feature down.' },
    { q: 'Why enforce rate limits with a distributed limiter rather than independently on each gateway replica?',
      opts: [
        'It is easier to code',
        'Per-replica limits effectively multiply by the number of replicas, so the global limit is wrong and drifts as the gateway autoscales; a shared limiter enforces the true limit',
        'Replicas cannot count requests',
        'Distributed limiters are always exact'],
      ok: 1,
      why: 'If each of 10 replicas enforces "1000 req/s", the real limit is ~10,000 and changes with scaling. A shared store (Redis / limiter service) enforces one global limit.' }
  ]
};
