/* AI-ML Learn — Part 8 · Chapter 13: Cost Observability / FinOps for AI */
window.CH[13] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Most teams discover their AI cost problem from a finance email at month-end. By then the spike has been running for three weeks. <b>Cost observability</b> ' +
      'makes spend a real-time metric on the same dashboards as latency and errors, attributed to the thing that caused it.</p>' +
      '<pre><code>the metric that matters: COST PER SUCCESSFUL REQUEST\n' +
      '  = total spend (GPU + tokens + infra) / successful requests\n' +
      'break it down by:  model · feature · tenant/team · route · request type\n' +
      'trend it, alert on it, and show it next to the golden signals — not once a month, per minute.</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A utility bill with a live meter vs. a surprise at the end of the month.</b> A live meter (and an alert ' +
      'at $X/day) lets you notice the immersion heater stuck on the day it happens. A quarterly statement just tells you it has been expensive for a while.</p></div>',
      try: [
        ['📖 FinOps Foundation — framework overview', 'https://www.finops.org/framework/', 'o'],
        ['📡 Ch 5 — token & cost telemetry per request', '#ch5', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>COST SOURCES (for an AI system)\n' +
      '  GPU/CPU compute   $/hour x instances x time; utilisation is the multiplier (idle = waste).\n' +
      '  model tokens      input + output tokens x price (self-hosted: amortised GPU; API: per-token).\n' +
      '  retrieval/vector DB, feature store, cache, storage, egress, observability itself.\n' +
      'UNIT ECONOMICS\n' +
      '  cost per successful request · cost per 1k output tokens · cost per user/session/task ·\n' +
      '  cost per resolved ticket / per conversion  (tie to a business outcome).\n' +
      'ATTRIBUTION\n' +
      '  tag/label every call with model, feature, tenant, route, environment. Cloud cost allocation\n' +
      '  tags + per-request cost emitted as a metric/span attribute (Ch 5, Ch 6).\n' +
      'SHOWBACK / CHARGEBACK   report (showback) or bill (chargeback) each team/tenant for their spend.\n' +
      'BUDGETS & ALERTS   per-team/feature monthly budget; alert on daily burn-rate and on\n' +
      '  cost-per-request crossing a threshold (a token blowup, a cache-hit collapse, a retry storm).\n' +
      'FORECAST            project month-end from current burn; flag overruns early.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The framework is the <b>FinOps Foundation</b> practice (inform → optimise → operate; unit economics; ' +
      'showback/chargeback). Tools: cloud cost tools (<b>AWS Cost Explorer / CUR</b>, <b>GCP</b>, <b>Azure Cost Management</b>), <b>Kubecost / OpenCost</b> for K8s/GPU allocation, ' +
      'and <b>LLM-cost dashboards</b> (Helicone, Langfuse, Datadog LLM Obs, vendor usage APIs). You emit per-request cost and attribute it; the accounting model is standard.</p></div>',
      try: [
        ['📖 OpenCost — Kubernetes cost monitoring (CNCF)', 'https://www.opencost.io/docs/', 'o'],
        ['📖 FinOps Foundation — unit economics capability', 'https://www.finops.org/framework/capabilities/unit-economics/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Cost per request caught the regression latency did not.</b> ' +
      'A prompt change adds a long few-shot block. Latency +40 ms (within SLO), errors flat — no alert. But <b>cost per successful request</b> jumps from $0.0021 to ' +
      '$0.0058 and the daily-burn alert fires within hours. Attribution by feature points straight at the changed endpoint; the few-shot block is trimmed. ' +
      'Without a cost-per-request metric this is a $40k/month surprise.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Chargeback changes behaviour.</b> ' +
      'A shared model gateway serves 12 internal teams; spend is a single central line item and grows 15%/quarter with nobody owning it. Switching to <b>showback</b> ' +
      '(then chargeback) — each team sees and is billed for its own cost per request and monthly total — surfaces that two teams were sending 10x-larger prompts than ' +
      'needed and one had no caching. Within a quarter, total spend drops 22% with no central mandate: visibility + ownership did it.</p></div>' +
      '<p><b>Put cost on the overview dashboard</b> (Ch 10), next to latency and errors, and give it an SLO-style budget with a burn-rate alert (Ch 4, Ch 11). ' +
      'A cost regression should trigger the same discipline as an availability one.</p>',
      try: [
        ['📖 Kubecost — GPU & workload cost allocation', 'https://docs.kubecost.com/', 'o'],
        ['🏢 Part 9: FinOps at scale (GPU fleet economics, commitments)', '../learn9/#ch8', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Learn cost from the monthly bill       Emit per-request cost as a metric; trend it live; daily\n' +
      '                                       burn-rate + cost-per-request alerts.\n' +
      'One central cost line item              Attribute by model/feature/tenant/route via tags; showback,\n' +
      '                                       then chargeback.\n' +
      'Cost per request (all)                  Cost per SUCCESSFUL request — failed/retried work should not\n' +
      '                                       flatter the number.\n' +
      'No business-outcome unit                Also track cost per resolved ticket / per conversion, so\n' +
      '                                       "expensive" is judged against value.\n' +
      'Ignore idle GPU                         Track utilisation as a cost driver; allocated-but-idle GPUs\n' +
      '                                       are usually the biggest line (Part 6 Ch 11).\n' +
      'Observability cost unmeasured            It can exceed the service it watches — sample traces, cap\n' +
      '                                       logs, tune retention (Ch 2).\n' +
      'No forecast                              Project month-end from current burn; flag overruns while\n' +
      '                                       there is time to act.\n' +
      'Cost owned by nobody                     A named owner per team/feature budget; cost reviewed in the\n' +
      '                                       same cadence as reliability.</code></pre>' +
      '<p><b>FinOps loop:</b> <i>inform</i> (attributed, real-time cost + unit economics) → <i>optimise</i> (caching, batching, right-sizing, quantization, commitments — ' +
      'Part 6 Ch 11, Part 9 Ch 8) → <i>operate</i> (budgets, alerts, chargeback, ownership). Observability is the "inform" step that makes the other two possible.</p>',
      try: [
        ['📖 AWS — Cost and Usage Report (CUR) & allocation tags', 'https://docs.aws.amazon.com/cur/latest/userguide/what-is-cur.html', 'o'],
        ['📖 FinOps Foundation — anomaly management', 'https://www.finops.org/framework/capabilities/anomaly-management/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What is the key unit metric for AI cost observability and how is it computed?\n' +
      '   A: Cost per successful request = total spend (GPU + tokens + supporting infra) / successful requests.\n' +
      '   "Successful" so failed and retried work does not flatter it. Break it down by model, feature,\n' +
      '   tenant, route, request type.\n\n' +
      'Q: A prompt change raises latency only 40 ms (within SLO) but something is wrong. What catches it?\n' +
      '   A: Cost per request — a longer few-shot block or more retrieved chunks spikes token cost with almost\n' +
      '   no latency impact. A daily burn-rate / cost-per-request alert fires within hours; feature-level\n' +
      "   attribution names the endpoint.\n\n" +
      'Q: Why does showback/chargeback reduce spend even without a mandate?\n' +
      '   A: It creates ownership. When each team sees and is billed for its own cost per request and monthly\n' +
      '   total, the teams sending oversized prompts or running without caching fix it themselves.\n\n' +
      'Q: What is usually the largest hidden AI cost line?\n' +
      '   A: Idle GPU — allocated but under-utilised capacity from over-provisioning, no off-peak scale-down,\n' +
      '   or oversized instances. Track utilisation as a first-class cost driver.\n\n' +
      'Q: Should observability cost itself be monitored?\n' +
      '   A: Yes — traces and logs can cost more than the service. Sample traces, cap log volume, and tune\n' +
      '   per-signal retention; treat it as a budget line.\n\n' +
      'Q: Where does cost belong on the dashboards?\n' +
      '   A: On the overview, next to the golden signals, with an SLO-style budget and a burn-rate alert — a\n' +
      '   cost regression should trigger the same response discipline as an availability one.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch5">Ch 5</a> (per-request cost telemetry), <a href="#ch10">Ch 10</a> (cost on the overview), <a href="#ch4">Ch 4</a> / <a href="#ch11">Ch 11</a> (budget &amp; burn alerts), ' +
      '<a href="../learn6/#ch11">Part 6 Ch 11</a> (optimisation levers), <a href="../learn9/#ch8">Part 9 Ch 8</a> (FinOps at scale).</p>',
      try: [
        ['📖 FinOps Foundation — reporting & analytics', 'https://www.finops.org/framework/capabilities/reporting-analytics/', 'o'],
        ['📖 Datadog — Cloud Cost Management', 'https://docs.datadoghq.com/cloud_cost_management/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the central unit metric for AI cost observability?',
      opts: [
        'Total monthly cloud bill',
        'Cost per successful request — total spend (GPU + tokens + supporting infra) divided by successful requests, broken down by model / feature / tenant / route',
        'Number of GPUs owned',
        'Cost per line of code'],
      ok: 1,
      why: 'A single unit cost, attributed to what drives it and excluding failed/retried work, makes regressions visible in real time and comparable across features.' },
    { q: 'A prompt change adds latency of only 40 ms (within SLO) and errors are flat. Which signal catches the problem?',
      opts: [
        'CPU utilisation',
        'Cost per request — more few-shot text or retrieved chunks raises token cost sharply with little latency impact, and a daily burn-rate / cost-per-request alert fires',
        'Pod restart count',
        'Disk space'],
      ok: 1,
      why: 'Token-driven cost regressions are nearly invisible to latency/error monitoring. A per-request cost metric with an alert surfaces them the day they ship.' },
    { q: 'Why does introducing showback/chargeback often cut spend without any central mandate?',
      opts: [
        'It makes the models cheaper',
        'It creates ownership — when each team sees and is billed for its own cost per request and monthly total, teams with oversized prompts or no caching fix it themselves',
        'It disables expensive models',
        'It reduces the number of teams'],
      ok: 1,
      why: 'A shared, unattributed cost line has no owner. Attributed, visible cost turns optimisation into each team\'s own interest.' }
  ]
};
