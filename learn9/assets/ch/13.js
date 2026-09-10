/* AI-ML Learn — Part 9 · Chapter 13: Change Management at Org Scale */
window.CH[13] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Rolling out a change to one service is a deploy (Part 7). Rolling out a change across <b>50 teams and hundreds of models</b> — a new serving runtime, a ' +
      'mandatory eval gate, a deprecated API, a policy — is a <b>campaign</b>. Done badly it drags on for a year with a long tail of stragglers and a fork nobody can ' +
      'delete. Done well it completes.</p>' +
      '<pre><code>a change campaign needs:  a reason teams WANT it (or a hard deadline) · a paved path to adopt it\n' +
      '                         · visible progress · migration help · and an END (the old thing is removed)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A city switching to a new recycling system.</b> New bins delivered to every door (paved path), ' +
      'clear instructions, a hotline for confused residents (enabling team), a public "% of neighbourhoods switched" map, and a firm date after which the old bins stop ' +
      'being collected. Skip the date and half the city never switches.</p></div>',
      try: [
        ['📖 Google — DevOps: change management & deployment', 'https://cloud.google.com/architecture/devops', 'o'],
        ['🚀 Part 7: migrations & cutovers (single service)', '../learn7/#ch12', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>PLAN A CAMPAIGN\n' +
      '  motivation   carrot (it is faster / cheaper / safer and the migration is easy) beats stick;\n' +
      '               if it must be a mandate, pair it with a hard, announced deadline + exec backing.\n' +
      '  paved path   a codemod / script / template / generated PR that does 80-100% of the work per team\n' +
      '               (Part 7 Ch 4, Ch 15). Adoption cost per team must be hours, not weeks.\n' +
      '  cohorts      roll to friendly early adopters → the bulk → the long tail. Learn + fix the paved\n' +
      '               path between cohorts.\n' +
      '  visibility   a live dashboard: % of models/teams migrated, who is blocked and why, ETA. Name the\n' +
      '               stragglers (kindly) — social proof drives the tail.\n' +
      '  support      an enabling team + office hours + a channel; treat each blocker as a paved-path bug.\n' +
      '  the END      a deprecation date after which the old path is removed / stops working; enforce it\n' +
      '               (block new use first, then break remaining use in a controlled window).\n' +
      'DEPRECATION MECHANICS   announce → warn (logs/headers/emails) → make the new the default →\n' +
      '  block new adoption → remove. Never skip straight to removal.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The techniques are standard large-scale-change engineering: <b>automated migration (codemods / ' +
      'bulk PRs)</b> as used for monorepo-wide changes, <b>cohort rollout</b>, an <b>adoption dashboard / scorecard</b>, an <b>enabling team</b> (Ch 11), and a ' +
      '<b>deprecation policy</b> (announce → warn → default → block → remove). GitOps + the paved road (Ch 1) make the "apply to N teams" step mechanical. You run the campaign; the playbook is known.</p></div>',
      try: [
        ['📖 Google — Software Engineering at Google: large-scale changes', 'https://abseil.io/resources/swe-book/html/ch22.html', 'o'],
        ['📖 Stripe / GitHub engineering — large migration write-ups', 'https://stripe.com/blog/engineering', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Mandatory eval gate for all tier-1 models.</b> ' +
      'Governance requires every customer-facing model to have an eval gate (Part 7 Ch 8). Campaign: (1) the platform team ships a <b>generated eval-gate template</b> ' +
      'so adoption is a ~2-hour task; (2) a dashboard tracks "% of tier-1 models with a passing eval gate"; (3) an enabling team runs weekly office hours and files ' +
      'paved-path bugs; (4) cohorts — 5 friendly teams, then 30, then the tail; (5) a <b>hard date</b>: after it, a tier-1 model cannot be promoted (the registry alias ' +
      'flip is blocked) without a gate. It completes in 10 weeks with zero permanent exceptions.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Deprecating the old serving API.</b> ' +
      'A v1 inference API must go. The team skips the ceremony and just announces "v1 off in 30 days" — chaos, because 40 services still use it and nobody has time. ' +
      'Re-run properly: announce (90 days) → add deprecation warnings in responses + weekly usage reports to owners → make v2 the default in the SDK → <b>block new v1 ' +
      'onboarding</b> → for the last holdouts, provide a shim + a codemod → remove v1 in a scheduled window with the owners on call. The staged path is what makes the ' +
      'removal actually happen.</p></div>' +
      '<p><b>The long tail is the whole problem.</b> Getting to 80% is easy; the last 20% (busy teams, weird edge cases, orphaned services) is where campaigns die. ' +
      'Budget most of the effort — paved-path fixes, direct help, and the enforced deadline — for the tail.</p>',
      try: [
        ['📖 Martin Fowler — branch by abstraction (large refactors)', 'https://martinfowler.com/bliki/BranchByAbstraction.html', 'o'],
        ['🏢 Ch 11 — the enabling team that runs the campaign', '#ch11', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Announce a mandate, no paved path       A codemod / template / generated PR that does most of the\n' +
      '                                       work; adoption cost = hours per team.\n' +
      'No deadline / no enforcement             A hard, announced date; enforce by blocking new use first,\n' +
      '                                       then removing. Voluntary migrations never finish.\n' +
      'Skip straight to removal                 announce → warn → default → block new → remove. Each step\n' +
      '                                       gives teams and you a chance to react.\n' +
      'No visibility                            A live adoption dashboard: % migrated, who is blocked, why,\n' +
      '                                       ETA. Social proof drives the tail.\n' +
      'No migration support                     Enabling team + office hours + a channel; every blocker is a\n' +
      '                                       paved-path bug to fix, not the team\'s problem.\n' +
      'Big-bang to all teams at once            Cohorts: early adopters → bulk → tail, fixing the paved path\n' +
      '                                       between cohorts.\n' +
      'Effort front-loaded on the easy 80%      Budget most effort for the last 20% — that is where\n' +
      '                                       campaigns stall.\n' +
      'Permanent exceptions granted             Time-box every exception with a new date; a permanent\n' +
      '                                       exception is a permanent fork.</code></pre>' +
      '<p><b>A change campaign has succeeded only when the old thing is gone.</b> If v1 still runs "for a few stragglers" a year later, you have two systems to maintain, ' +
      'a security surface, and a precedent that deadlines do not matter. Completion is the goal.</p>',
      try: [
        ['📖 Google — Software Engineering at Google (deprecation)', 'https://abseil.io/resources/swe-book/html/ch15.html', 'o'],
        ['📡 Part 8: usage metrics that track adoption/deprecation', '../learn8/#ch13', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What does a platform change need to actually complete across 50 teams?\n' +
      '   A: A reason teams want it (or a hard deadline + exec backing), a paved path (codemod / template /\n' +
      '   generated PR that does most of the work), cohort rollout, a live adoption dashboard, an enabling\n' +
      '   team for support, and an enforced end date after which the old path is removed.\n\n' +
      'Q: Why is "announce the old API is off in 30 days" a bad plan?\n' +
      '   A: It skips the staged deprecation (warn → default → block new → remove) and provides no migration\n' +
      '   help, so busy teams cannot comply and the deadline collapses. Stage it over 90 days with warnings,\n' +
      '   usage reports, an SDK default flip, blocking new onboarding, a shim/codemod for holdouts, then a\n' +
      "   scheduled removal.\n\n" +
      'Q: Where do change campaigns usually stall, and what do you do about it?\n' +
      '   A: The long tail — the last ~20% (busy teams, edge cases, orphaned services). Budget most of the\n' +
      '   effort there: fix the paved path for each blocker, offer direct help, and rely on the enforced\n' +
      "   deadline.\n\n" +
      'Q: Carrot or stick?\n' +
      '   A: Carrot where possible — make the new path faster/cheaper/safer with an easy migration. Where it\n' +
      '   must be a mandate (security, compliance), pair it with a hard announced deadline and enforcement.\n\n' +
      'Q: How do you enforce a deprecation deadline without breaking everyone at once?\n' +
      '   A: Block new adoption of the old path first; then break remaining use in a controlled, scheduled\n' +
      '   window with the affected owners on call and a rollback ready.\n\n' +
      'Q: When has the campaign succeeded?\n' +
      '   A: When the old thing is removed. "A few stragglers still on v1" a year later means two systems, a\n' +
      '   security surface, and a precedent that deadlines are optional.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch1">Ch 1</a> (paved road), <a href="#ch11">Ch 11</a> (enabling team), <a href="#ch9">Ch 9</a> (cell-by-cell rollout), ' +
      '<a href="../learn7/#ch12">Part 7 Ch 12</a> (single-service migration), <a href="../learn7/#ch15">Part 7 Ch 15</a> (promotion &amp; drift).</p>',
      try: [
        ['📖 Thoughtworks — evolutionary architecture & large-scale change', 'https://www.thoughtworks.com/insights/books/building-evolutionary-architectures', 'o'],
        ['📖 Increment — migrations issue (real campaign stories)', 'https://increment.com/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What does a platform-wide change need to actually complete across many teams?',
      opts: [
        'A strongly-worded email',
        'A reason teams want it (or a hard deadline with exec backing), a paved path that does most of the migration work per team, cohort rollout, an adoption dashboard, an enabling team for support, and an enforced end date that removes the old path',
        'Enough time — it will finish eventually on its own',
        'A single big-bang cutover for all teams at once'],
      ok: 1,
      why: 'Voluntary migrations without a paved path, visibility, support, and an enforced deadline drag on indefinitely with a long tail. Completion requires all of those.' },
    { q: 'Where do org-scale change campaigns typically stall?',
      opts: [
        'At the very beginning',
        'In the long tail — the last ~20% (busy teams, edge cases, orphaned services); most of the campaign effort should be budgeted there',
        'They never stall',
        'At exactly 50%'],
      ok: 1,
      why: 'Getting to 80% adoption is comparatively easy; the remaining teams have real blockers or no time, and that is where the paved-path fixes, direct help, and enforced deadline earn their keep.' },
    { q: 'What is the correct sequence for deprecating an old API used by many services?',
      opts: [
        'Announce removal in 30 days, then remove it',
        'Announce (with lead time) → warn (logs/headers/usage reports) → make the new path the default → block new adoption → provide a shim/codemod for holdouts → remove in a scheduled window',
        'Remove it immediately and let teams file tickets',
        'Keep it forever for stragglers'],
      ok: 1,
      why: 'A staged deprecation gives teams time and tooling to migrate and gives you signal to react. Skipping to removal breaks dependants; never removing it leaves a permanent fork.' }
  ]
};
