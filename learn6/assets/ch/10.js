/* AI-ML Learn — Part 6 · Chapter 10: Multi-Region, Failover & Graceful Degradation */
window.CH[10] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>A single region will, eventually, have a bad day: a zone outage, a fibre cut, a botched deploy, a GPU capacity shortage. ' +
      'If your whole service lives there, your service has a bad day too. <b>Multi-region</b> and <b>failover</b> are how you keep serving when one location is gone; ' +
      '<b>graceful degradation</b> is how you keep serving <i>something</i> when even the model is unavailable.</p>' +
      '<pre><code>ACTIVE-PASSIVE   region A serves; region B is warm and takes over on failure   (simpler, some downtime)\n' +
      'ACTIVE-ACTIVE    A and B both serve; lose one, the other absorbs the load     (no downtime, must be sized for it)\n' +
      'DEGRADE          model down? → cached answer / smaller model / static default  (worse, but up)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A hospital generator.</b> Grid power is region A. The generator (region B) either idles ready to start ' +
      '(active-passive) or already carries half the load (active-active). And if both fail, you still have flashlights and manual equipment — not full service, ' +
      'but not darkness. That is graceful degradation.</p></div>',
      try: [
        ['📖 AWS — disaster recovery strategies (RTO/RPO)', 'https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/disaster-recovery-options-in-the-cloud.html', 'o'],
        ['🏗️ Ch 9 — load management under a regional shift', '#ch9', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>RTO   Recovery Time Objective — how fast you must be back up.\n' +
      'RPO   Recovery Point Objective — how much recent data you can afford to lose.\n' +
      'DR PATTERNS (cost ↑ / RTO ↓):  backup&restore → pilot light → warm standby → active-active (multi-site).\n' +
      'STATELESS TIER   model pods: replicate the deployment per region; easy.\n' +
      'STATEFUL DEPS    feature store, vector index, KV cache, DB — need cross-region replication\n' +
      '                 (async → RPO > 0) or a globally-distributed store.\n' +
      'MODEL ARTIFACTS  the weights + config + tokenizer must be in every region\'s registry / bucket.\n' +
      'TRAFFIC STEERING  DNS / global load balancer / anycast; health-check based failover; geo-routing.\n' +
      'FALLBACK MODEL   a cheaper/older/hosted model behind the same API, tried when the primary errors\n' +
      '                 or times out. Test it constantly (shadow traffic) so it works when you need it.\n' +
      'GRACEFUL DEGRADATION   tiers: full → smaller model → cached → rules/default → static message.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard framing is <b>RTO/RPO + the AWS/Azure/GCP DR tiers</b> ' +
      '(backup-restore → pilot light → warm standby → active-active). Traffic steering uses a <b>global load balancer / DNS failover</b> with health checks. ' +
      'For AI specifically, the pattern is a <b>gateway with a fallback chain</b> (primary model → secondary → cached → default) and <b>region-replicated ' +
      'stateless model pods</b> over regionally-replicated stores. You choose a tier per your RTO/RPO and budget; the patterns are off the shelf.</p></div>',
      try: [
        ['📖 Google SRE Book — Data Integrity & disaster recovery', 'https://sre.google/sre-book/data-integrity/', 'o'],
        ['📖 AWS — multi-region application architecture', 'https://docs.aws.amazon.com/whitepapers/latest/aws-multi-region-fundamentals/aws-multi-region-fundamentals.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The untested standby.</b> ' +
      'A team runs active-passive with a warm standby region. During a real outage they fail over — and the standby has an old model version, ' +
      'a stale feature-store snapshot, and no capacity headroom because it was sized for "just in case". Recovery takes 40 minutes instead of 5. ' +
      'Fixes: deploy to <b>both</b> regions in the same pipeline (same model, same config), replicate the feature/vector stores continuously, ' +
      'size the standby for real load, and run a <b>quarterly game day</b> that actually fails over.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The fallback that no one exercised.</b> ' +
      'A gateway is configured to fall back from the self-hosted LLM to a hosted API on error. When the self-hosted fleet actually goes down, ' +
      'the fallback path 500s — the API key had expired, the prompt format was slightly different, and rate limits were set to near-zero. ' +
      'Fix: send <b>1-2% of live traffic through the fallback continuously</b> (shadow / canary), alert if its success rate drops, ' +
      'and keep its config in the same tests as the primary.</p></div>' +
      '<p><b>Degradation ladder, concretely:</b> primary model (full context, personalised) → smaller/faster model → last cached answer → ' +
      'rule-based default → "we\'re experiencing issues, try again" — each step still returns a 200 with a <code>degraded: true</code> flag so clients and dashboards know.</p>',
      try: [
        ['📖 AWS — chaos engineering & game days', 'https://aws.amazon.com/blogs/architecture/chaos-engineering-and-resiliency-testing-of-your-applications/', 'o'],
        ['📡 Part 8: incident response & postmortems', '../learn8/#ch16', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Standby region deployed manually       Same CI/CD pipeline deploys all regions. Drift = failed failover.\n' +
      'Standby sized "just in case"           Size it for the real load it must carry. Under-sized standby just\n' +
      '                                       moves the outage.\n' +
      'Failover never tested                  Quarterly game day that actually shifts traffic. An untested DR\n' +
      '                                       plan is a hope, not a plan.\n' +
      'Fallback model path never exercised     Route 1-2% of live traffic through it always; alert on its health.\n' +
      'Synchronous cross-region replication     Adds latency to every write and couples regions\' fate. Prefer\n' +
      '  for everything                        async (accept RPO > 0) unless the data truly needs RPO 0.\n' +
      'Degrade = return 500                    Degrade = return a cheaper 200 with a degraded flag. Availability\n' +
      '                                       is measured by successful responses.\n' +
      'DNS TTL of 1 hour                       Short TTL (30-60 s) on failover records, or use a GLB with\n' +
      '                                       sub-minute health-check failover.\n' +
      'No data-consistency plan on failback     Define how the passive region\'s writes reconcile when the\n' +
      '                                       primary returns.</code></pre>' +
      '<p><b>Cost vs resilience is an explicit choice.</b> Active-active roughly doubles steady-state infra cost but gives near-zero RTO; ' +
      'pilot light is cheap but slow. Pick per the business impact of an hour of downtime — and write it down so it is a decision, not an accident.</p>',
      try: [
        ['📖 Azure — Well-Architected reliability & regions', 'https://learn.microsoft.com/en-us/azure/well-architected/reliability/regions-availability-zones', 'o'],
        ['🏢 Part 9: reliability at scale & cell architecture', '../learn9/#ch9', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Active-passive vs active-active for a model serving tier?\n' +
      'A: Active-passive: one region serves, a warm standby takes over on failure — simpler, cheaper, non-zero\n' +
      '   RTO. Active-active: both serve and one can absorb the other\'s load — near-zero RTO but ~2× steady\n' +
      "   cost and you must size each region for failover load. Choose by the cost of an hour's downtime.\n\n" +
      'Q: The stateless model pods are easy to replicate. What is hard about multi-region?\n' +
      '   A: The stateful dependencies — feature store, vector index, KV cache, databases. They need cross-region\n' +
      '   replication (async → RPO > 0) or a globally distributed store, plus the model artifacts present in\n' +
      "   every region's registry.\n\n" +
      'Q: Why do failovers so often take longer than planned?\n' +
      '   A: The standby drifted: old model version, stale data snapshot, under-provisioned capacity, untested\n' +
      '   path. Fix by deploying every region from the same pipeline, replicating stores continuously, sizing\n' +
      '   for real load, and running game days.\n\n' +
      'Q: You have a fallback model behind the gateway. How do you know it works?\n' +
      "A: Send 1-2% of live traffic through it continuously and alert on its success rate. A fallback you only\n" +
      '   invoke during an incident is where you discover the expired key and the wrong prompt format.\n\n' +
      'Q: Define graceful degradation and why it counts as staying available.\n' +
      '   A: A ladder of cheaper responses — smaller model → cached answer → rule default → static message —\n' +
      '   each returning a successful 200 (with a degraded flag). Availability SLOs count successful responses;\n' +
      '   a timely worse answer keeps the number green and the user unblocked.\n\n' +
      'Q: What is RPO and when do you accept RPO > 0?\n' +
      '   A: RPO is the amount of recent data you can afford to lose. You accept RPO > 0 (async replication)\n' +
      '   whenever synchronous cross-region writes would add unacceptable latency and the data can tolerate\n' +
      '   losing the last few seconds on a hard region loss.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch9">Ch 9</a> (absorbing the shifted load), <a href="#ch13">Ch 13</a> (client failover behaviour), ' +
      '<a href="../learn9/#ch9">Part 9 Ch 9</a> (cell architecture &amp; game days), and <a href="../learn8/#ch16">Part 8 Ch 16</a> (incident response).</p>',
      try: [
        ['📖 AWS Builders\' Library — static stability using AZs', 'https://aws.amazon.com/builders-library/static-stability-using-availability-zones/', 'o'],
        ['📖 Google SRE Workbook — Managing Load', 'https://sre.google/workbook/managing-load/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is usually the hard part of making a model-serving system multi-region?',
      opts: [
        'Replicating the stateless model pods',
        'The stateful dependencies — feature store, vector index, caches, databases — which need cross-region replication or a globally distributed store, plus model artifacts in every region',
        'Choosing a container base image',
        'Writing the Dockerfile'],
      ok: 1,
      why: 'Stateless replicas are trivial to duplicate per region. Consistency, replication lag (RPO), and having every dependency and artifact present in each region are the real work.' },
    { q: 'Why route 1–2% of live traffic through the fallback model path continuously?',
      opts: [
        'To increase overall cost',
        'So the fallback is proven working (keys valid, prompt format correct, rate limits adequate) before you have to rely on it during an incident',
        'To train the fallback model',
        'To reduce primary-model latency'],
      ok: 1,
      why: 'A fallback exercised only during outages is where you discover the expired credential and the subtly different request format. Continuous small traffic plus alerting keeps it real.' },
    { q: 'Under graceful degradation, the model is down and you return a cached or rule-based answer with a "degraded: true" flag and HTTP 200. Why 200 and not 500?',
      opts: [
        'To hide the incident from monitoring',
        'Availability SLOs count successful responses; a timely, lower-quality answer keeps users unblocked and is genuinely a success, while the degraded flag still surfaces the state',
        'HTTP 500 is not allowed for AI services',
        'It makes retries faster'],
      ok: 1,
      why: 'Degradation is about still serving something useful. A successful response (flagged as degraded) preserves availability and user function; a 500 does neither.' }
  ]
};
