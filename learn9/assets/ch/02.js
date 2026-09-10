/* AI-ML Learn — Part 9 · Chapter 2: Multi-Tenancy */
window.CH[2] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>One model platform, many "tenants" — different customers, or different internal teams. The moment they share infrastructure, three questions decide whether the ' +
      'platform is usable: can one tenant <b>see</b> another\'s data? can one tenant <b>starve</b> another of capacity? and can you tell <b>who used what</b>?</p>' +
      '<pre><code>ISOLATION    tenant A must never read tenant B\'s data, prompts, models, logs, or cache entries\n' +
      'FAIRNESS     one tenant\'s spike / abuse must not degrade everyone else ("noisy neighbour")\n' +
      'METERING     every request is attributed to a tenant → quotas, rate limits, billing, showback</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>An apartment building.</b> Locked doors between units (isolation), enough water pressure that a long ' +
      'shower on floor 6 does not freeze floor 2 (fairness), and a meter per unit so everyone pays for their own usage (metering). Get any one wrong and tenants leave.</p></div>',
      try: [
        ['📖 AWS — SaaS multi-tenancy architecture', 'https://docs.aws.amazon.com/whitepapers/latest/saas-architecture-fundamentals/tenant-isolation.html', 'o'],
        ['🏢 Ch 1 — the platform this runs on', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>ISOLATION MODELS (weakest/cheapest → strongest/costliest)\n' +
      '  pooled + row-level    one deployment, one DB; every query/row/vector/cache key carries tenant_id;\n' +
      '                        enforced by app + policy. Cheapest, densest; a bug = a cross-tenant leak.\n' +
      '  namespace/schema      shared cluster, per-tenant namespace / DB schema / index; RBAC boundaries.\n' +
      '  silo                  dedicated deployment / cluster / account per tenant. Strongest isolation,\n' +
      '                        highest cost; for regulated or largest customers.\n' +
      '  hybrid               pooled for the long tail, silo for enterprise / regulated.\n' +
      'FAIRNESS / NOISY NEIGHBOUR\n' +
      '  per-tenant rate limits + token/QPS quotas + concurrency caps (Ch 14); priority classes;\n' +
      '  fair-queuing / weighted scheduling; circuit-break a misbehaving tenant.\n' +
      'RETRIEVAL ISOLATION   hard metadata filter on tenant_id + per-tenant index shards (Part 6 Ch 7,\n' +
      '                      Part 6 Ch 16). Treat it as a security boundary, not ranking.\n' +
      'METERING              tag every call {tenant, model, feature}; emit per-request cost (Part 8 Ch 13);\n' +
      '                      aggregate to quotas + showback/chargeback (Ch 8).\n' +
      'DATA-PLANE KEYS       per-tenant encryption keys (BYOK) for silo/regulated tenants.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard framing is the <b>AWS/Azure SaaS tenant-isolation</b> models (pooled / bridge / silo), ' +
      '<b>Kubernetes multi-tenancy</b> (namespaces, RBAC, NetworkPolicy, ResourceQuota, vCluster / Capsule), ' +
      '<b>Kubernetes API Priority and Fairness</b> and <b>fair-queuing</b> for capacity, and per-tenant <b>rate limiting</b> at the gateway. ' +
      'You choose an isolation model per tenant tier and enforce fairness + metering; the patterns are well documented.</p></div>',
      try: [
        ['📖 Kubernetes — multi-tenancy', 'https://kubernetes.io/docs/concepts/security/multi-tenancy/', 'o'],
        ['📖 Azure — multitenant SaaS architectural approaches', 'https://learn.microsoft.com/en-us/azure/architecture/guide/multitenant/overview', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The noisy neighbour that took everyone down.</b> ' +
      'A shared LLM gateway has no per-tenant limits. One customer runs a nightly bulk job that sends 50x their normal volume; the shared GPU pool saturates, ' +
      'the request queue fills, and <i>every</i> tenant\'s p99 blows the SLO for two hours. Fixes: per-tenant <b>QPS + token-per-minute quotas</b> and a <b>concurrency cap</b> ' +
      'at the gateway (Ch 14), a <b>fair queue</b> so no tenant can occupy more than its share of workers, and a <b>circuit breaker</b> that sheds a tenant exceeding its ' +
      'burst allowance with a clear 429 + Retry-After — their bulk job slows down, nobody else notices.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The cache that leaked across tenants.</b> ' +
      'A semantic response cache keys on the query embedding only. Tenant A asks "what is our refund policy?" and gets tenant B\'s cached answer, built from B\'s documents. ' +
      'Fixes: <b>tenant_id in every cache key</b> (Part 6 Ch 8), separate cache namespaces per tenant, and no cross-tenant semantic matching. The same rule applies to ' +
      'retrieval indexes, logs, traces, and metrics labels — <i>every</i> shared store needs the tenant dimension baked into its key/partition.</p></div>' +
      '<p><b>Test isolation like a security control:</b> an automated suite that, as tenant A, attempts to read B\'s data through every path (API, retrieval, cache, ' +
      'logs, admin endpoints) and asserts it cannot.</p>',
      try: [
        ['📖 Kubernetes — API Priority and Fairness', 'https://kubernetes.io/docs/concepts/cluster-administration/flow-control/', 'o'],
        ['🏗️ Part 6: retrieval scoping as a security boundary', '../learn6/#ch16', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Isolation enforced only in app code    Defence in depth: app checks + DB row-level security + policy\n' +
      '                                       engine + per-tenant shards/namespaces + isolation tests.\n' +
      'No per-tenant limits                    Per-tenant QPS / token / concurrency quotas + fair queuing +\n' +
      '                                       circuit-break the abuser (Ch 14).\n' +
      'Shared cache without tenant in the key   tenant_id in every cache/retrieval/log/metric key; no\n' +
      '                                       cross-tenant semantic matching.\n' +
      'One isolation model for all tenants     Tier it: pooled for the long tail, silo for enterprise /\n' +
      '                                       regulated / BYOK.\n' +
      'Metering as a billing afterthought      Attribute every request at the gateway; per-request cost\n' +
      '                                       metric; quotas + showback from day one.\n' +
      'Aggregate SLOs only                     Per-tenant SLOs (or at least per-tier); an enterprise tenant\n' +
      '                                       degraded is invisible in the aggregate (Part 8 Ch 10).\n' +
      'Isolation never tested                  A standing cross-tenant access test suite in CI + prod.\n' +
      'Onboarding a tenant is manual            Automated tenant provisioning (namespace, keys, quotas,\n' +
      '                                       index) — it will be done often and must be identical each time.</code></pre>' +
      '<p><b>The density/cost vs. isolation/blast-radius trade is explicit and per-tenant.</b> Pooled is cheap and dense but a single bug is a multi-tenant breach; ' +
      'silo is safe but expensive. Write the tiering rule down (who gets what) so it is a policy, not an ad-hoc favour.</p>',
      try: [
        ['📖 AWS — SaaS tenant isolation strategies', 'https://docs.aws.amazon.com/whitepapers/latest/saas-tenant-isolation-strategies/saas-tenant-isolation-strategies.html', 'o'],
        ['🏢 Ch 14 — access, quota & rate-limit design', '#ch14', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What are the three core requirements of a multi-tenant model platform?\n' +
      '   A: Isolation (no tenant can access another\'s data/models/prompts/cache/logs), fairness (no noisy\n' +
      '   neighbour can degrade others), and metering (every request attributed to a tenant for quotas,\n' +
      "   limits, and billing/showback).\n\n" +
      'Q: Describe the isolation models from cheapest to strongest.\n' +
      '   A: Pooled with row-level tenant_id (dense, cheap, a bug = a leak) → per-tenant namespace/schema/index\n' +
      '   with RBAC → silo (dedicated deployment/cluster/account, strongest, costliest). Hybrid: pooled for the\n' +
      "   long tail, silo for enterprise/regulated.\n\n" +
      'Q: One tenant\'s bulk job degrades everyone. What controls prevent this?\n' +
      '   A: Per-tenant QPS/token/concurrency quotas and burst limits at the gateway, fair/weighted queuing so\n' +
      '   no tenant exceeds its share of workers, priority classes, and a circuit breaker that sheds the\n' +
      '   over-limit tenant with 429 + Retry-After.\n\n' +
      'Q: A semantic cache returned tenant B\'s answer to tenant A. Root cause and fix?\n' +
      '   A: The cache key omitted tenant_id (and did cross-tenant semantic matching). Put tenant_id in every\n' +
      '   cache/retrieval/log/metric key, use per-tenant namespaces, and forbid cross-tenant matches. Every\n' +
      '   shared store needs the tenant dimension.\n\n' +
      'Q: How do you assure tenant isolation?\n' +
      '   A: Defence in depth (app + DB row-level security + policy engine + per-tenant shards) plus a standing\n' +
      '   automated test that, as tenant A, tries to reach B through every path and asserts failure.\n\n' +
      'Q: Should every tenant get the same isolation model?\n' +
      '   A: No — tier it by risk and value: pooled for the long tail, silo/BYOK for enterprise and regulated\n' +
      '   tenants. Write the tiering rule down as policy.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch1">Ch 1</a> (the platform), <a href="#ch14">Ch 14</a> (quotas &amp; rate limits), <a href="#ch8">Ch 8</a> (chargeback), <a href="#ch5">Ch 5</a> (security), ' +
      '<a href="../learn6/#ch8">Part 6 Ch 8</a> (cache keys), <a href="../learn8/#ch10">Part 8 Ch 10</a> (per-tenant dashboards).</p>',
      try: [
        ['📖 Capsule / vCluster — Kubernetes multi-tenancy operators', 'https://capsule.clastix.io/docs/', 'o'],
        ['📖 Google Cloud — multi-tenant SaaS on GKE', 'https://cloud.google.com/kubernetes-engine/docs/best-practices/enterprise-multitenancy', 'o']
      ] }
  ],

  quiz: [
    { q: 'What are the three core requirements of a shared multi-tenant model platform?',
      opts: [
        'Speed, accuracy, and cost',
        'Isolation (no cross-tenant access), fairness (no noisy neighbour degrades others), and metering (every request attributed for quotas and billing)',
        'GPUs, storage, and networking',
        'Logging, tracing, and metrics'],
      ok: 1,
      why: 'These three determine whether the platform is safe to share: tenants must not see each other\'s data, must not starve each other of capacity, and must be individually accountable.' },
    { q: 'One tenant\'s nightly bulk job saturates the shared GPU pool and blows everyone\'s p99. Best fix set?',
      opts: [
        'Ask the tenant to stop',
        'Per-tenant QPS/token/concurrency quotas and burst limits at the gateway, fair/weighted queuing, priority classes, and a circuit breaker that sheds the over-limit tenant with 429 + Retry-After',
        'Add more GPUs permanently',
        'Move everyone to a bigger model'],
      ok: 1,
      why: 'Noisy-neighbour protection is per-tenant quotas plus fair scheduling so no single tenant can consume more than its share, with graceful shedding for the offender.' },
    { q: 'A semantic response cache returned one tenant\'s answer to another. Root cause?',
      opts: [
        'The model was too small',
        'The cache key omitted tenant_id (and allowed cross-tenant semantic matching); every shared store — cache, retrieval index, logs, metrics — needs the tenant dimension in its key/partition',
        'The GPU overheated',
        'The prompt was too long'],
      ok: 1,
      why: 'Tenant isolation must be baked into every shared data structure\'s key. A cache keyed only on the query embedding will serve cross-tenant hits.' }
  ]
};
