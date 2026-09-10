/* AI-ML Learn — Part 9 · Chapter 8: FinOps at Scale */
window.CH[8] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Part 8 made cost a real-time metric per request. At enterprise scale the questions get bigger: how many GPUs do we buy for next year, on what commitment ' +
      'terms? How do we make dozens of teams care about spend they do not see? How do we cut the AI bill 20% without breaking anything?</p>' +
      '<pre><code>FinOps AT SCALE = three moving parts\n' +
      '  FLEET ECONOMICS   own vs rent GPUs; reserved / committed / on-demand / spot mix; utilisation.\n' +
      '  ALLOCATION        every dollar attributed to a team/product/tenant → showback, then chargeback.\n' +
      '  GOVERNANCE        budgets, forecasts, approval for large asks, a capacity + commitment plan,\n' +
      '                    a FinOps function that owns the loop.</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Running a shared vehicle fleet for a large company.</b> You decide how many vans to lease vs. own vs. ' +
      'hire per-trip (commitment mix), you meter each department\'s mileage and bill it back (chargeback), and a fleet manager forecasts next year\'s need and signs the leases. ' +
      'Without that, everyone "just needs one more van" and the lot is full of idle vehicles.</p></div>',
      try: [
        ['📖 FinOps Foundation — framework (inform / optimise / operate)', 'https://www.finops.org/framework/', 'o'],
        ['📡 Part 8: cost per successful request (the unit metric)', '../learn8/#ch13', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>FLEET / PROCUREMENT\n' +
      '  on-demand   flexible, most expensive. Baseline load should not sit here.\n' +
      '  reserved / committed-use / savings plans   ~40-60% off for a 1-3yr commitment. Size to the\n' +
      '              stable floor of demand, not the peak.\n' +
      '  spot / preemptible   ~60-90% off, can be reclaimed → training, batch eval, burst, checkpointed\n' +
      '              work. Not the latency-critical steady fleet.\n' +
      '  own hardware   viable at very large, steady scale; adds capex, ops, depreciation, refresh.\n' +
      '  right-sizing + sharing (MIG/MPS)   a 7B model alone on an 80GB card is ~90% waste (Part 6 Ch 11).\n' +
      'UTILISATION   the true cost lever: allocated-but-idle GPUs. Bin-pack, autoscale down off-peak,\n' +
      '  queue batch into the trough, reclaim orphaned reservations.\n' +
      'ALLOCATION   cost-allocation tags on everything; per-team/product cost dashboards; OpenCost/\n' +
      '  Kubecost for shared clusters + GPUs. SHOWBACK (visibility) → CHARGEBACK (billed).\n' +
      'BUDGETS & FORECAST   per-team monthly budget, anomaly alerts, month-end projection from burn,\n' +
      '  and a rolling capacity + commitment plan reviewed with finance.\n' +
      'UNIT ECONOMICS   cost per successful request / per resolved ticket / per conversion — tie spend\n' +
      '  to value so "expensive" is judged against outcome (Part 8 Ch 13).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The <b>FinOps Foundation</b> framework (inform → optimise → operate; unit economics; ' +
      'rate + usage optimisation) is the standard. Tooling: cloud native (<b>Cost Explorer / CUR</b>, GCP, Azure Cost Management, Savings Plans/CUDs), ' +
      '<b>OpenCost/Kubecost</b> for K8s + GPU allocation, GPU schedulers (<b>Run:ai</b>, Kueue, Volcano) for utilisation, and LLM-cost dashboards. You run the loop; the discipline is defined.</p></div>',
      try: [
        ['📖 FinOps Foundation — rate & usage optimization', 'https://www.finops.org/framework/domains/optimize-cloud-usage-cost/', 'o'],
        ['📖 AWS — Savings Plans & Reserved Instances', 'https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The commitment plan.</b> ' +
      'A company runs ~120 GPUs on-demand, cost growing 12%/quarter. Analysis of a year of usage shows the demand <b>floor</b> is ~70 GPUs 24/7 and the peak is ~150. ' +
      'Plan: put the 70-GPU floor on a 1-year <b>committed-use</b> discount (~50% off that portion), run the 70→110 band on <b>spot</b> for batch/burst-tolerant work, ' +
      'and keep ~40 <b>on-demand</b> for latency-critical peak. Net ~30% saving with no capacity loss — and a forecast reviewed quarterly so the commitment tracks reality.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Chargeback drives a 22% cut with no mandate.</b> ' +
      '(As in Part 8 Ch 13, at org scale.) A shared model gateway\'s spend is one central line item growing unchecked. Switching to <b>showback</b> — every team sees its ' +
      'own cost per request and monthly total — then <b>chargeback</b> makes the two teams sending 10x-oversized prompts and the one with no caching fix themselves. ' +
      'Total spend drops 22% in a quarter. Add per-team budgets + anomaly alerts so a regression is caught in hours, not at month-end.</p></div>' +
      '<p><b>The FinOps loop at org scale:</b> <i>inform</i> (allocation + unit economics + forecast) → <i>optimise</i> (commitment mix, utilisation, per-service levers ' +
      'from Part 6 Ch 11) → <i>operate</i> (budgets, chargeback, ownership, quarterly capacity review with finance).</p>',
      try: [
        ['📖 FinOps Foundation — forecasting', 'https://www.finops.org/framework/capabilities/forecasting/', 'o'],
        ['🏗️ Part 6: per-service cost & performance levers', '../learn6/#ch11', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Baseline load on on-demand pricing     Commit/reserve the stable demand FLOOR (1-3yr, ~40-60% off);\n' +
      '                                       spot for burst/batch; on-demand only for peak headroom.\n' +
      'Commit to the peak                      You will pay for idle capacity most of the time. Commit the\n' +
      '                                       floor; flex the rest.\n' +
      'Utilisation ignored                     Idle GPUs are usually the biggest line. Bin-pack, share\n' +
      '                                       (MIG/MPS), scale down off-peak, reclaim orphans, GPU scheduler.\n' +
      'One central cost line                   Cost-allocation tags everywhere; per-team dashboards;\n' +
      '                                       showback then chargeback.\n' +
      'No budgets / no forecast                Per-team budgets + anomaly alerts + month-end projection from\n' +
      '                                       burn; quarterly capacity + commitment review with finance.\n' +
      'Cost measured, value not                Track unit economics (cost per successful request / resolved\n' +
      '                                       ticket / conversion) so cuts are judged against outcome.\n' +
      'FinOps owned by nobody                  A FinOps function + a cost owner per team; cost reviewed on\n' +
      '                                       the same cadence as reliability.\n' +
      'Optimise once, then drift                It is a continuous loop — usage and prices move; re-run it.</code></pre>' +
      '<p><b>Order of impact:</b> kill idle utilisation → right-size hardware + commitment mix → per-service levers (caching, batching, quantization, smaller models — ' +
      'Part 6 Ch 11) → chargeback to align incentives. Re-derive cost per successful request after each.</p>',
      try: [
        ['📖 FinOps Foundation — allocation & chargeback', 'https://www.finops.org/framework/capabilities/allocation/', 'o'],
        ['📖 Run:ai / Kueue — GPU scheduling & fair share', 'https://kueue.sigs.k8s.io/docs/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: How do you decide the reserved / committed / spot / on-demand mix for a GPU fleet?\n' +
      '   A: Commit/reserve the STABLE FLOOR of demand for the discount (1-3yr, ~40-60% off); run the\n' +
      '   burst/batch/interruption-tolerant band on spot (~60-90% off, checkpointed); keep on-demand only for\n' +
      '   latency-critical peak headroom. Commit the floor, flex the rest — never commit to the peak.\n\n' +
      'Q: What is usually the single biggest saving at fleet scale?\n' +
      '   A: Utilisation — allocated-but-idle GPUs from over-provisioning, no off-peak scale-down, poor\n' +
      '   bin-packing, oversized cards, orphaned reservations. Fix with sharing (MIG/MPS), autoscaling, a GPU\n' +
      '   scheduler, and reclamation.\n\n' +
      'Q: Why does showback/chargeback cut spend without a mandate?\n' +
      '   A: It creates ownership. When each team sees and is billed for its own cost per request and monthly\n' +
      '   total, the teams with oversized prompts or no caching optimise themselves.\n\n' +
      'Q: A company on all on-demand pricing wants ~30% off with no capacity loss. Plan?\n' +
      '   A: Analyse a year of usage for the demand floor and peak. Commit the 24/7 floor (~50% off that\n' +
      '   portion), run the mid band on spot for tolerant work, keep on-demand for peak. Review the forecast\n' +
      '   quarterly so the commitment tracks reality.\n\n' +
      'Q: Why track unit economics alongside total spend?\n' +
      '   A: So "expensive" is judged against value — cost per successful request / resolved ticket /\n' +
      '   conversion. A rising bill with falling unit cost and rising volume can be fine.\n\n' +
      'Q: Who owns FinOps?\n' +
      '   A: A dedicated FinOps function plus a cost owner per team, with cost reviewed on the same cadence as\n' +
      '   reliability — it is a standing loop, not a one-off project.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="../learn8/#ch13">Part 8 Ch 13</a> (cost observability), <a href="../learn6/#ch11">Part 6 Ch 11</a> (per-service levers), <a href="#ch2">Ch 2</a> (per-tenant metering), ' +
      '<a href="#ch14">Ch 14</a> (quotas), <a href="#ch1">Ch 1</a> (the platform).</p>',
      try: [
        ['📖 FinOps Foundation — unit economics', 'https://www.finops.org/framework/capabilities/unit-economics/', 'o'],
        ['📖 GCP — Committed use discounts', 'https://cloud.google.com/docs/cuds', 'o']
      ] }
  ],

  quiz: [
    { q: 'How should you set the reserved/committed vs. spot vs. on-demand mix for a GPU fleet?',
      opts: [
        'Commit to the peak demand so you never run short',
        'Commit/reserve the stable demand FLOOR for the discount, run burst/batch/interruption-tolerant work on spot, and keep on-demand only for latency-critical peak headroom',
        'Everything on on-demand for maximum flexibility',
        'Everything on spot to minimise cost'],
      ok: 1,
      why: 'Committing to the floor captures the discount on capacity you always use; committing to the peak means paying for mostly-idle hardware. Spot covers the flexible middle.' },
    { q: 'What is typically the largest single cost saving available at GPU-fleet scale?',
      opts: [
        'Switching programming languages',
        'Improving utilisation — eliminating allocated-but-idle GPUs via sharing (MIG/MPS), autoscaling, a GPU scheduler, right-sizing, and reclaiming orphaned reservations',
        'Reducing log verbosity',
        'Using a cheaper monitoring vendor'],
      ok: 1,
      why: 'Paying for GPUs that sit idle usually dwarfs any per-model optimisation. Utilisation is the first and biggest lever.' },
    { q: 'Why does introducing showback/chargeback across many teams reduce total AI spend even without a central mandate?',
      opts: [
        'It makes GPUs cheaper',
        'It creates ownership — teams that can see and are billed for their own cost per request and monthly total optimise their own oversized prompts and missing caches',
        'It forces teams to use smaller models',
        'It reduces the number of teams'],
      ok: 1,
      why: 'An unattributed central cost has no owner. Attributed, visible cost makes optimisation each team\'s own interest.' }
  ]
};
