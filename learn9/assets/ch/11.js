/* AI-ML Learn — Part 9 · Chapter 11: Org Design for ML */
window.CH[11] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>How you split people into teams determines what your platform looks like (Conway\'s Law) and how fast anything ships. At ML scale the recurring question is: ' +
      'should each product team own its full ML stack, or should there be a central ML team? The answer is usually <b>neither extreme</b> — a small set of team types with ' +
      'clear responsibilities.</p>' +
      '<pre><code>THREE TEAM TYPES (Team Topologies)\n' +
      '  STREAM-ALIGNED   owns a product / customer-facing ML feature end to end. Most teams are this.\n' +
      '  PLATFORM         builds the paved road (Ch 1) so stream teams ship without deep infra work.\n' +
      '  ENABLING         helps stream teams level up a capability (evals, MLOps, responsible AI), then leaves.\n' +
      '  (+ COMPLICATED-SUBSYSTEM for a genuinely hard shared component, e.g. the core serving/retrieval engine)\n' +
      'INTERACTION MODES  collaboration (short, to figure something out) · X-as-a-Service (platform serves\n' +
      '  stream teams) · facilitating (enabling team coaches).</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A city.</b> Utilities and roads are the platform team (everyone uses them, run as a service). ' +
      'Individual businesses are stream-aligned (own their storefront). Consultants who help a shop get up to code and then move on are the enabling team. ' +
      'Nobody wants every shop digging its own sewer.</p></div>',
      try: [
        ['📖 Team Topologies — key concepts', 'https://teamtopologies.com/key-concepts', 'o'],
        ['🏢 Ch 1 — the platform the platform team builds', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>WHO OWNS WHAT (typical)\n' +
      '  stream-aligned team   the model/feature, its prompts, its evals, its SLOs, its on-call,\n' +
      '                        its cost. Uses the platform for serving, CI, monitoring, registry.\n' +
      '  platform team          serving runtime, gateway, feature store, model registry, eval platform,\n' +
      '                        observability, CI templates, GPU capacity, golden paths. Internal customers.\n' +
      '  enabling team          time-boxed uplift: "help team X stand up an eval gate / drift monitor /\n' +
      '                        responsible-AI review", then hand off.\n' +
      '  central functions      governance / model-risk committee (Ch 3), security (Ch 5), FinOps (Ch 8),\n' +
      '                        legal/compliance (Ch 6) — set policy, the platform + stream teams enforce it.\n' +
      'RACI per activity        e.g. "promote a model to prod": stream team Responsible, platform Consulted,\n' +
      '                        governance Accountable for tier-1, security Consulted. Write it down.\n' +
      'ON-CALL                  stream team owns its model\'s pages; platform team owns platform pages;\n' +
      '                        a clear escalation path between them (Part 8 Ch 16).\n' +
      'COGNITIVE LOAD           if a stream team is drowning in infra, the platform is too thin or the\n' +
      '                        team boundary is wrong — that is the signal to adjust.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The reference model is <b>Team Topologies</b> (stream-aligned / platform / enabling / complicated-subsystem; ' +
      'the three interaction modes; minimising team cognitive load), plus <b>RACI</b> per key activity and the <b>SRE</b> on-call/ownership model. It is the same "paved road" ' +
      'idea from Ch 1 seen through the org. You adapt these to your context; the patterns are established.</p></div>',
      try: [
        ['📖 Team Topologies — the four team types', 'https://teamtopologies.com/key-concepts-content/what-are-the-four-team-types', 'o'],
        ['📖 Team Topologies — the three interaction modes', 'https://teamtopologies.com/key-concepts-content/what-are-the-three-team-interaction-modes', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The central-ML bottleneck.</b> ' +
      'All model work goes through one central ML team; product teams file tickets and wait weeks. The team is overloaded and context-switching, product teams have no ' +
      'ownership, and models rot after handover. Fix: convert most of the central team\'s work into a <b>platform</b> (paved road for serving/CI/monitoring/registry) plus ' +
      'a small <b>enabling</b> team; move model ownership into <b>stream-aligned</b> product teams who now own their model, its SLOs, and its on-call. Central ML keeps ' +
      'only genuinely hard shared subsystems (the retrieval engine) and governance.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Every team reinvents MLOps.</b> ' +
      'The opposite failure: full autonomy, no platform. Twelve teams each build their own CI, serving, and monitoring — badly, differently, and the security team cannot ' +
      'get consistent controls. Fix: a <b>platform team</b> run as a product (Ch 1) with adoption as its KPI, an <b>enabling</b> team to migrate the twelve, and central ' +
      'functions (security, governance, FinOps) that set policy the platform enforces by default.</p></div>' +
      '<p><b>Conway\'s Law is a design tool:</b> if you want a clean model-gateway boundary and consistent telemetry, put one team in charge of the gateway and telemetry ' +
      'as a service. The org chart becomes the architecture whether you plan it or not — so plan it.</p>',
      try: [
        ['📖 Team Topologies — platform as a product', 'https://teamtopologies.com/key-concepts-content/what-is-a-platform-team', 'o'],
        ['🏢 Ch 13 — driving change across many stream teams', '#ch13', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'One central ML team does everything    Platform (paved road) + enabling (time-boxed uplift) +\n' +
      '                                       stream-aligned teams owning their models end to end.\n' +
      'Full team autonomy, no platform         A platform team run as a product with adoption as its KPI;\n' +
      '                                       central functions set policy the platform enforces.\n' +
      'Platform team far from its users        X-as-a-Service with a roadmap, docs, support, SLAs,\n' +
      '                                       satisfaction surveys — internal engineers are customers.\n' +
      'Enabling team becomes permanent          Time-box the engagement; hand the capability back and leave.\n' +
      'No RACI for key activities               Define Responsible/Accountable/Consulted/Informed per\n' +
      '                                       activity (promote a model, change a prompt, handle an incident).\n' +
      'Model handed off after launch            The team that ships it owns it — SLOs, on-call, cost, drift.\n' +
      '                                       Handover-to-nobody is why models rot.\n' +
      'Governance / security as gatekeepers     They set policy; the platform + stream teams implement it by\n' +
      '                                       default; reviews are proportionate to risk (Ch 3).\n' +
      'Ignoring cognitive load                  A drowning stream team means the platform is too thin or the\n' +
      '                                       boundary is wrong — adjust, do not just add people.</code></pre>' +
      '<p><b>The measure:</b> stream teams ship ML features quickly with low infra toil; the platform has high adoption and positive internal NPS; governance/security ' +
      'controls are enforced by defaults, not by queues. If model work routes through a central bottleneck or every team is reinventing infra, the org design is wrong.</p>',
      try: [
        ['📖 Team Topologies (book site)', 'https://teamtopologies.com/book', 'o'],
        ['📖 Google — DevOps: Westrum organizational culture', 'https://cloud.google.com/architecture/devops/devops-culture-westrum-organizational-culture', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Central ML team vs. every product team owning its own stack — which is right?\n' +
      '   A: Neither extreme. Use stream-aligned teams that own their models end to end (SLOs, on-call, cost),\n' +
      '   a platform team providing the paved road as a service, an enabling team for time-boxed capability\n' +
      '   uplift, and a complicated-subsystem team only for genuinely hard shared components.\n\n' +
      'Q: All model work routes through one central team and product teams wait weeks. Fix?\n' +
      '   A: Convert the central team\'s work into a platform + a small enabling team; move model ownership into\n' +
      '   the product (stream-aligned) teams; keep central ML only for hard shared subsystems and governance.\n\n' +
      'Q: What are the three team interaction modes?\n' +
      '   A: Collaboration (short, joint problem-solving), X-as-a-Service (platform serves stream teams with\n' +
      '   minimal friction), and facilitating (an enabling team coaches another team then leaves).\n\n' +
      'Q: How do you keep a platform team from becoming an ivory tower?\n' +
      '   A: Run it as a product: internal engineers are customers, with a roadmap, docs, support, SLAs, and a\n' +
      '   satisfaction metric; adoption is its KPI.\n\n' +
      'Q: How does Conway\'s Law inform ML org design?\n' +
      '   A: The team boundaries become the architecture. If you want a clean gateway boundary and consistent\n' +
      '   telemetry, put one team in charge of them as a service — otherwise the architecture will mirror\n' +
      "   whatever the org chart happens to be.\n\n" +
      'Q: What signals that the org design is wrong?\n' +
      '   A: Stream teams drowning in infra toil (platform too thin / boundary wrong), a central bottleneck\n' +
      '   for model work, or every team reinventing MLOps differently.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch1">Ch 1</a> (platform engineering), <a href="#ch13">Ch 13</a> (org-scale change), <a href="#ch3">Ch 3</a> (governance functions), ' +
      '<a href="../learn8/#ch16">Part 8 Ch 16</a> (on-call &amp; incident roles), <a href="../learn7/#ch16">Part 7 Ch 16</a> (runbook ownership).</p>',
      try: [
        ['📖 Team Topologies — cognitive load', 'https://teamtopologies.com/key-concepts-content/how-to-use-team-cognitive-load-to-improve-team-and-organization-design', 'o'],
        ['📖 Matthew Skelton / Manuel Pais — articles', 'https://teamtopologies.com/news', 'o']
      ] }
  ],

  quiz: [
    { q: 'In the Team Topologies model applied to ML, who typically owns a customer-facing ML feature end to end (its model, prompts, evals, SLOs, on-call, cost)?',
      opts: [
        'A single central ML team for the whole company',
        'The stream-aligned (product) team, using the platform team\'s paved road for serving, CI, monitoring and the registry',
        'The security team',
        'Nobody — models are shared infrastructure'],
      ok: 1,
      why: 'Stream-aligned teams own their product\'s ML end to end; the platform team provides the shared capabilities as a service, and an enabling team helps teams level up specific skills.' },
    { q: 'All model work routes through one overloaded central ML team and product teams wait weeks. What is the fix?',
      opts: [
        'Hire more people into the central team',
        'Convert the central team\'s work into a platform (paved road) plus a small enabling team, and move model ownership into the product (stream-aligned) teams; keep central ML only for hard shared subsystems and governance',
        'Give every team full autonomy with no shared platform',
        'Stop shipping ML features'],
      ok: 1,
      why: 'A central team as a bottleneck kills throughput and ownership. Platforming its capabilities and pushing model ownership to stream teams scales delivery; the opposite extreme (no platform) just reinvents MLOps 12 times.' },
    { q: 'How does Conway\'s Law inform ML org design?',
      opts: [
        'It says teams should never talk to each other',
        'Team boundaries become the architecture, so if you want a clean model-gateway boundary and consistent telemetry, put one team in charge of them as a service — plan the org to produce the architecture you want',
        'It requires a flat organisation',
        'It only applies to open-source projects'],
      ok: 1,
      why: 'Systems mirror the communication structure of the org that builds them. You can use that deliberately by aligning team ownership with the interfaces and boundaries you want in the platform.' }
  ]
};
