/* AI-ML Learn — Part 9 · Chapter 9: Reliability at Scale */
window.CH[9] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>One service in one region has one big failure mode: that region has a bad day. A platform serving hundreds of models for thousands of tenants across ' +
      'many regions has a subtler problem — a single bad deploy, a poisoned config, or one runaway tenant can take down <i>everything at once</i>. Reliability at scale is ' +
      'about <b>containing blast radius</b> so no single fault is global.</p>' +
      '<pre><code>MULTI-REGION / MULTI-CLUSTER   survive losing a region or a cluster (Part 6 Ch 10)\n' +
      'CELL ARCHITECTURE             partition into independent "cells"; a fault stays inside one cell\n' +
      'DR + GAME DAYS               a tested recovery plan, rehearsed on a schedule\n' +
      'ERROR-BUDGET POLICY WITH TEETH   what actually happens org-wide when reliability slips (Part 8 Ch 4)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Watertight compartments in a ship.</b> A hull breach floods one compartment, not the whole vessel, ' +
      'because the bulkheads hold. Cells are bulkheads for a platform: a bad deploy or a hot tenant floods one cell, and the other cells sail on.</p></div>',
      try: [
        ['📖 AWS — cell-based architecture / reducing blast radius', 'https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/reducing-scope-of-impact-with-cell-based-architecture.html', 'o'],
        ['🏗️ Part 6: multi-region, failover & degradation', '../learn6/#ch10', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>CELLS (bulkheads)\n' +
      '  a cell = a full, independent stack (gateway + models + stores) serving a SUBSET of tenants.\n' +
      '  cells share nothing on the request path; a thin router maps tenant → cell.\n' +
      '  faults (bad deploy, corrupt cache, overloaded model, noisy tenant) are contained to one cell.\n' +
      '  deploy CELL BY CELL (a form of canary — Part 7 Ch 5): a bad release hits 1 cell, not all.\n' +
      '  size cells so losing one is an acceptable % of traffic; add cells to grow, do not grow a cell forever.\n' +
      'MULTI-CLUSTER / MULTI-REGION   cells across regions; active-active where possible; global routing\n' +
      '  with health-based failover; regionally-replicated stores (RPO). (Part 6 Ch 10)\n' +
      'SHUFFLE SHARDING   assign each tenant a random small subset of workers so one bad tenant degrades\n' +
      '  only the few tenants who share its shard, not everyone.\n' +
      'DR   RTO/RPO per tier; runbooks; backups tested by RESTORE, not by existing.\n' +
      'GAME DAYS / CHAOS   scheduled: kill a cell, fail a region, inject latency, revoke a dependency —\n' +
      '  verify containment, failover, and the runbook, with humans.\n' +
      'ERROR-BUDGET POLICY   org-wide + per-cell: budget spent → feature freeze, reliability focus,\n' +
      '  exec visibility. Enforced, not advisory.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The patterns: <b>cell-based / bulkhead architecture</b> and <b>shuffle sharding</b> (AWS Builders\' Library), ' +
      '<b>multi-cluster</b> (fleet management, service mesh federation), <b>chaos engineering / game days</b> (Principles of Chaos, tools like Chaos Mesh / Gremlin / ' +
      'AWS FIS), and the <b>Google SRE error-budget policy</b>. You design the cell boundary and cadence; the architecture is established practice.</p></div>',
      try: [
        ['📖 AWS Builders\' Library — shuffle sharding', 'https://aws.amazon.com/builders-library/workload-isolation-using-shuffle-sharding/', 'o'],
        ['📖 Principles of Chaos Engineering', 'https://principlesofchaos.org/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>A bad model deploy that only hit 12% of tenants.</b> ' +
      'A new serving-runtime version has a memory leak that crashes pods under load. With <b>cell-by-cell deployment</b>, it rolls to cell 1 (of 8) first; within 20 minutes ' +
      'the cell\'s error budget burns, the automated analysis aborts the rollout (Part 7 Ch 5), and cell 1 is rolled back. Cells 2-8 never got the bad version. ' +
      'Blast radius: 1/8 of tenants, 20 minutes — instead of a total outage.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The game day that found the broken assumption.</b> ' +
      'A quarterly game day fails region us-east. The router is supposed to shift traffic to us-west — but us-west\'s vector index replica was 6 hours stale (a broken ' +
      'replication job nobody had alerted on), so RAG answers degraded badly. The game day caught it in a controlled window; the fixes were a replication-lag alert ' +
      '(Part 8) and a pre-failover freshness check. An untested DR plan would have failed for real, at 3am.</p></div>' +
      '<p><b>Cells also bound cost and noisy-neighbour blast radius:</b> a runaway tenant, a cache-poisoning bug, or a config error is contained to its cell — ' +
      'the platform degrades by 1/N, not to zero.</p>',
      try: [
        ['📖 Slack — service architecture & cells / shards', 'https://slack.engineering/', 'o'],
        ['📡 Part 8: incident response, game days, error budgets', '../learn8/#ch16', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'One global stack for all tenants      Cells: independent stacks each serving a tenant subset; a\n' +
      '                                       fault is contained to one cell.\n' +
      'Deploy to 100% at once                 Deploy cell by cell (canary at the cell level); a bad release\n' +
      '                                       hits one cell.\n' +
      'Grow one cell forever                  Cap cell size; add cells to scale so losing one stays an\n' +
      '                                       acceptable fraction of traffic.\n' +
      'Shared dependency on the request path   Cells share nothing hot; a thin router is the only common\n' +
      '                                       component (and it must be trivially reliable).\n' +
      'One bad tenant degrades everyone        Shuffle sharding: each tenant gets a random small worker\n' +
      '                                       subset, so blast radius is a few co-sharded tenants.\n' +
      'DR plan never executed                 Game days on a schedule: kill a cell, fail a region, inject\n' +
      '                                       latency — verify containment + failover + runbook with humans.\n' +
      'Backups verified by existing            Verify by RESTORE. An untested backup is a hope.\n' +
      'Error-budget policy is advisory         Enforced org-wide: budget spent → feature freeze + reliability\n' +
      '                                       focus + exec visibility (Part 8 Ch 4).</code></pre>' +
      '<p><b>The design question at scale is always "what is the blast radius of X?"</b> — a bad deploy, a poisoned config, a hot tenant, a lost region, a bad model. ' +
      'If the honest answer to any of them is "everything", add a boundary (a cell, a shard, a region, a canary, a kill switch) until it is not.</p>',
      try: [
        ['📖 AWS re:Invent — cell-based architecture deep dives', 'https://aws.amazon.com/builders-library/', 'o'],
        ['🏢 Ch 13 — change management across many cells / teams', '#ch13', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What is a cell (bulkhead) architecture and what does it buy you?\n' +
      '   A: The platform is partitioned into independent full stacks (cells), each serving a subset of\n' +
      '   tenants and sharing nothing on the request path except a thin router. A fault — bad deploy, corrupt\n' +
      '   cache, overloaded model, noisy tenant — is contained to one cell instead of being global.\n\n' +
      'Q: How do cells change how you deploy?\n' +
      '   A: You roll out cell by cell (canary at the cell level). A bad release hits one cell, its error\n' +
      '   budget burns, the rollout auto-aborts, and the other cells never receive it.\n\n' +
      'Q: What is shuffle sharding?\n' +
      '   A: Each tenant is assigned a random small subset of workers. A misbehaving or overloaded tenant\n' +
      '   degrades only the handful of tenants who happen to share its shard, not the whole fleet.\n\n' +
      'Q: Why run game days instead of just writing a DR plan?\n' +
      '   A: Untested plans encode broken assumptions — a stale replica, a missing alert, a router that does\n' +
      '   not actually fail over. A scheduled game day (kill a cell, fail a region, inject latency) surfaces\n' +
      "   those in a controlled window with humans, before a real 3am event.\n\n" +
      'Q: How do you size a cell?\n' +
      '   A: So that losing one cell is an acceptable percentage of total traffic; cap its size and add cells\n' +
      '   to grow rather than letting one cell expand without limit.\n\n' +
      'Q: What makes an error-budget policy "have teeth" at org scale?\n' +
      '   A: It is enforced, not advisory: when the budget is spent, feature launches freeze, effort shifts to\n' +
      '   reliability, and it is visible to leadership — per cell and org-wide.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch2">Ch 2</a> (tenant isolation), <a href="#ch13">Ch 13</a> (org-scale rollout across cells), <a href="../learn6/#ch10">Part 6 Ch 10</a> (multi-region), ' +
      '<a href="../learn7/#ch5">Part 7 Ch 5</a> (progressive delivery), <a href="../learn8/#ch4">Part 8 Ch 4</a> (error budgets), <a href="../learn8/#ch16">Part 8 Ch 16</a> (incidents).</p>',
      try: [
        ['📖 Google SRE Workbook — Error budget policy', 'https://sre.google/workbook/error-budget-policy/', 'o'],
        ['📖 Netflix — chaos engineering & regional failover', 'https://netflixtechblog.com/tagged/chaos-engineering', 'o']
      ] }
  ],

  quiz: [
    { q: 'What does a cell (bulkhead) architecture provide for a large multi-tenant platform?',
      opts: [
        'Faster individual requests',
        'Blast-radius containment — the platform is split into independent full stacks each serving a tenant subset, so a bad deploy, corrupt cache, or noisy tenant is confined to one cell instead of being global',
        'Lower storage cost',
        'A simpler codebase'],
      ok: 1,
      why: 'Cells are bulkheads: sharing nothing on the request path except a thin router means a fault floods one compartment, not the whole ship.' },
    { q: 'How does cell architecture change deployment?',
      opts: [
        'You deploy everywhere simultaneously for consistency',
        'You roll out cell by cell (a cell-level canary), so a bad release hits one cell, its error budget burns, the rollout auto-aborts, and the other cells never receive it',
        'You can no longer deploy at all',
        'You deploy only once per year'],
      ok: 1,
      why: 'Cell-by-cell rollout is a coarse-grained canary: the maximum damage from a bad release is one cell\'s worth of tenants for the time it takes to detect and abort.' },
    { q: 'Why run scheduled game days rather than relying on a written DR plan?',
      opts: [
        'Game days are cheaper than documentation',
        'Untested plans encode broken assumptions (stale replicas, missing alerts, a router that does not actually fail over); a controlled game day surfaces them with humans before a real outage does',
        'Written plans are not allowed by auditors',
        'Game days replace the need for backups'],
      ok: 1,
      why: 'A DR plan that has never been executed is a hope. Deliberately failing a cell or region on a schedule proves containment, failover and the runbook actually work.' }
  ]
};
