/* AI-ML Learn — Part 9 · Chapter 1: Platform Engineering for ML */
window.CH[1] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>When one team ships one model, they can do everything by hand. When twenty teams ship two hundred models, ' +
      '"everyone figures out deployment themselves" produces twenty subtly different, half-broken pipelines and a security team in tears.</p>' +
      '<p><b>Platform engineering</b> is building an internal product — the <b>paved road</b> (aka <b>golden path</b>) — ' +
      'so that the <i>easy</i> way to ship a model is also the <i>safe, observable, compliant</i> way. Teams opt in because it saves them work, not because a policy forces them.</p>' +
      '<pre><code>without a platform            with a paved road\n' +
      'each team: CI, serving,       one "ml deploy" that gives you: reproducible build, canary rollout,\n' +
      'secrets, monitoring,           metrics + traces wired, secrets injected, model registered,\n' +
      'rollback, on their own         audit log written, rollback ready — by default</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A well-run airport vs. everyone flying their own plane from a field.</b> ' +
      'The airport gives you runways, air-traffic control, fuel and customs in one place. You <i>can</i> still fly your own way, ' +
      'but almost nobody wants to once the shared infrastructure exists.</p></div>',
      try: [
        ['📖 Team Topologies — platform teams & the Thinnest Viable Platform', 'https://teamtopologies.com/key-concepts', 'o'],
        ['📖 CNCF — Platforms white paper', 'https://tag-app-delivery.cncf.io/whitepapers/platforms/', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>A paved road is defined by what it makes free (default) vs. what it makes possible (opt-out with justification):</p>' +
      '<pre><code>DEFAULT, FREE                          OPT-OUT (needs a reason, logged)\n' +
      'reproducible container build           custom base image\n' +
      'canary rollout + auto-rollback         big-bang deploy\n' +
      'OTel metrics/traces/logs wired         bring-your-own telemetry\n' +
      'model registered + versioned           unregistered artifact\n' +
      'secrets from the secret manager        env-var secrets\n' +
      'eval gate in CI                        skip eval (emergency only)\n' +
      'cost + usage attributed to your team   —</code></pre>' +
      '<p>The platform is a <b>product</b>: it has users (ML/product engineers), a roadmap, docs, support, SLAs, and adoption metrics. ' +
      'It is run by a <b>platform team</b> whose customers are internal.</p>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The reference model is <b>Team Topologies</b> ' +
      '(platform / enablement / stream-aligned teams; the <i>Thinnest Viable Platform</i>) plus the <b>CNCF Platforms</b> guidance and ' +
      '<b>Internal Developer Platform</b> practice (a portal like Backstage, golden-path templates, self-service). ' +
      'For ML specifically it wraps the standard tools from Parts 6–8 — Kubernetes/KServe, a model registry, a feature store, an eval platform, ' +
      'OTel — behind one self-service interface. You assemble standard parts; you do not build a bespoke PaaS.</p></div>',
      try: [
        ['📖 Internal Developer Platform — internaldeveloperplatform.org', 'https://internaldeveloperplatform.org/', 'o'],
        ['📖 Backstage — software templates (golden paths)', 'https://backstage.io/docs/features/software-templates/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Twelve monitoring setups, zero coverage.</b> ' +
      'An incident review finds that of 12 model services, 3 have dashboards, 5 have partial metrics, 4 have nothing — ' +
      'and no two use the same latency definition. The platform team ships a serving template that emits the golden signals + ' +
      'LLM telemetry via OTel <i>by default</i>, plus a generated Grafana dashboard per service. Six weeks later new services are covered on day one; ' +
      'the team backfills the old ones by migrating them onto the template. The win was making "instrumented" the path of least resistance.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The paved road nobody uses.</b> ' +
      'A platform team spends two quarters building a beautiful deploy system — and adoption is 10%. Root cause: it only supported ' +
      'TensorFlow serving, required a 40-page onboarding, and had no migration help. They pivot: support the top-3 frameworks, ' +
      'ship a <code>cookiecutter</code>/Backstage template that scaffolds a working service in minutes, run "office hours", and ' +
      'measure adoption as an OKR. A platform with no users is a cost centre — treat adoption as the product metric.</p></div>' +
      '<p><b>Signals a paved road is working:</b> time-to-first-deploy for a new service drops from weeks to hours; ' +
      'the number of distinct CI/serving patterns shrinks; security/compliance controls are enforced by the template, not by review; ' +
      'platform NPS from internal teams is positive.</p>',
      try: [
        ['📖 Google — "Enabling teams" & platform as a product', 'https://cloud.google.com/architecture/devops/devops-tech-cloud-infrastructure', 'o'],
        ['📕 Part 4: ML system design & org tradeoffs', '../learn4/#ch9', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Mandate the platform by policy         Make it the easiest option. Mandates without ergonomics breed\n' +
      '                                       shadow infra.\n' +
      'One-size-fits-all, no escape hatch     Provide opt-outs with a logged justification. Rigidity pushes\n' +
      '                                       teams off the road entirely.\n' +
      'Platform team far from users           Treat internal engineers as customers: roadmap, docs, support,\n' +
      '                                       SLAs, office hours, satisfaction surveys.\n' +
      'Build everything in-house              Assemble standard tools (K8s, registry, feature store, OTel).\n' +
      '                                       The value is integration + golden paths, not a new PaaS.\n' +
      'Ship the platform, skip migration      Fund migration of existing services. A platform only new\n' +
      '                                       projects use never pays back.\n' +
      '"Thickest possible platform"           Thinnest Viable Platform: start with the 2-3 pain points that\n' +
      '                                       hurt most (deploy, monitoring, secrets), expand from evidence.\n' +
      'No adoption metric                     Adoption / time-to-deploy / pattern-count are the product KPIs.</code></pre>' +
      '<p><b>Conway\'s Law cuts both ways:</b> the platform\'s API becomes the org\'s de-facto architecture. Design the golden path ' +
      'to encourage the boundaries you want (clear service ownership, standard telemetry, isolated tenants) because teams will build to its shape.</p>',
      try: [
        ['📖 Team Topologies — platform as a product', 'https://teamtopologies.com/key-concepts-content/what-is-a-platform-team', 'o'],
        ['📖 Thoughtworks — platform engineering & golden paths', 'https://www.thoughtworks.com/insights/blog/platforms/how-to-build-an-internal-developer-platform', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What is a "paved road" / "golden path" and why not just write a policy document?\n' +
      'A: A supported, opinionated, self-service way to build+ship a service where the easy path is also the safe,\n' +
      '   observable, compliant one. Policies without ergonomics get worked around (shadow IT); a good paved road\n' +
      '   wins by saving teams work, so controls are enforced by the template, not by review gates.\n\n' +
      'Q: How do you measure whether a platform team is succeeding?\n' +
      'A: Adoption rate, time-to-first-deploy for a new service, reduction in the number of distinct CI/serving\n' +
      '   patterns, % of services with standard telemetry/security by default, and internal-customer satisfaction.\n' +
      '   Not "features shipped".\n\n' +
      'Q: A team wants to deviate from the golden path. What do you do?\n' +
      'A: Allow it via a documented opt-out with a logged justification, and feed the reason back into the roadmap.\n' +
      '   Frequent deviations for the same reason mean the road has a gap to pave.\n\n' +
      'Q: What is the "Thinnest Viable Platform"?\n' +
      'A: The smallest set of shared capabilities that removes the biggest current friction for stream-aligned\n' +
      '   teams — often just deploy + monitoring + secrets. You expand it from evidence, not by pre-building\n' +
      '   everything.\n\n' +
      'Q: How does Conway\'s Law apply to an ML platform?\n' +
      "A: The platform's interfaces become the org's real architecture — teams build to the shape you expose. So\n" +
      '   design the golden path to produce the boundaries you want: clear ownership, standard telemetry,\n' +
      '   tenant isolation, one model-gateway abstraction.\n\n' +
      'Q: Build vs. buy for the platform components?\n' +
      'A: Buy/adopt the commodities (Kubernetes, registry, OTel, a feature store, an eval tool); build only the\n' +
      '   thin integration + golden-path templates that encode your org\'s policy. Building a bespoke PaaS is\n' +
      '   almost always a mistake.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch11">Ch 11 — Org design for ML</a> (who runs the platform), ' +
      '<a href="#ch2">Ch 2 — Multi-tenancy</a> (how it stays fair), and ' +
      '<a href="#ch15">Ch 15 — Reference architecture</a> (the components it wraps). ' +
      'Parts <a href="../learn6/">6</a>–<a href="../learn8/">8</a> are the tools the paved road standardises.</p>',
      try: [
        ['📖 Team Topologies (book site)', 'https://teamtopologies.com/book', 'o'],
        ['📖 CNCF Platform Engineering maturity model', 'https://tag-app-delivery.cncf.io/whitepapers/platform-eng-maturity-model/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the defining property of a well-designed "paved road" / golden path?',
      opts: [
        'It is legally mandatory for all teams',
        'The easy, low-effort way to ship is also the safe, observable and compliant way — so teams opt in because it saves them work',
        'It supports exactly one framework',
        'It removes all ability to customize'],
      ok: 1,
      why: 'A paved road wins on ergonomics: controls are enforced by the template because using it is the least-effort path, not because a policy forces it.' },
    { q: 'A platform team has shipped many features but adoption is 10%. What is the most likely fix?',
      opts: [
        'Add more features',
        'Treat internal engineers as customers: support the frameworks they actually use, provide scaffolding templates and migration help, and track adoption as the key metric',
        'Mandate the platform by executive order and disable alternatives',
        'Shut the platform team down'],
      ok: 1,
      why: 'Low adoption almost always means poor fit and no migration path. A platform with no users is a cost centre; adoption, time-to-deploy and pattern-count are its real KPIs.' },
    { q: 'What does "Thinnest Viable Platform" mean?',
      opts: [
        'The platform with the fewest engineers',
        'The smallest set of shared capabilities that removes the biggest current friction for teams, expanded later from evidence',
        'A platform that only runs on one server',
        'Documentation with no tooling'],
      ok: 1,
      why: 'You start by paving the 2–3 paths that hurt most (often deploy, monitoring, secrets) and grow the platform based on observed demand rather than pre-building everything.' }
  ]
};
