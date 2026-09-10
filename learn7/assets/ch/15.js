/* AI-ML Learn — Part 7 · Chapter 15: Multi-Environment Promotion & Drift Control */
window.CH[15] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>"It worked in staging" only means something if staging is actually <i>like</i> production. If dev, staging, and prod have drifted apart — different image builds, ' +
      'different configs edited by hand, different dependency versions — then passing staging tells you nothing, and every prod deploy is a surprise.</p>' +
      '<pre><code>THE PROMOTION RULE:  build the artifact ONCE; move the SAME artifact through dev → staging → prod.\n' +
      'THE DIFFERENCE RULE: environments differ ONLY by configuration values (sizes, endpoints, limits),\n' +
      '                    expressed as data, never by hand-edited copies of manifests or ad-hoc changes.\n' +
      'DRIFT:              any un-tracked divergence — a kubectl edit, a console change, a stale value,\n' +
      '                    an environment nobody re-provisioned. Detect it, correct it.</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Rehearsing a play on the real set.</b> If the dress rehearsal is on a different stage with different props, ' +
      'it does not de-risk opening night. Promotion means the same actors and the same set move from rehearsal room to theatre; only the audience changes.</p></div>',
      try: [
        ['📖 Google — deployment environments & promotion', 'https://cloud.google.com/architecture/application-deployment-and-testing-strategies', 'o'],
        ['🚀 Ch 4 — GitOps config-as-data', '#ch4', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>ENVIRONMENTS   dev (fast iteration), staging/pre-prod (prod-like, integration + eval + load),\n' +
      '               prod. Optionally a canary/prod-shadow. Keep the count small.\n' +
      'PROMOTION       CI builds + tests + publishes ONE immutable artifact (image digest / model\n' +
      '               version / release manifest). Promotion = a PR bumping that reference in the next\n' +
      '               environment\'s values file. Same bytes, forward only.\n' +
      'CONFIG          base + per-env overlay (Kustomize) or values (Helm). Differences are DATA:\n' +
      '               replica counts, GPU types, DB endpoints, rate limits, feature-flag defaults,\n' +
      '               log level. No forked YAML.\n' +
      'GATES           each promotion passes gates for that stage: staging = eval gate (Ch 8) + load\n' +
      '               test (Ch 11) + integration; prod = progressive rollout (Ch 5) + approval.\n' +
      'PARITY           staging matches prod in: image, dependency versions, K8s version, autoscaler\n' +
      '               config shape, and realistic data volume (scaled but representative).\n' +
      'DRIFT CONTROL    GitOps self-heal + scheduled `plan` (infra) + config-diff between envs; alert\n' +
      '               on any resource OutOfSync or any value that exists in one env and not another.\n' +
      'SECRETS PER ENV  same references, different backing values from the secret manager (Ch 10).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard: an immutable artifact promoted through environments (the <b>build-once, deploy-many</b> ' +
      'principle from continuous delivery), config expressed with <b>Kustomize/Helm</b> overlays, gates per stage, and drift handled by <b>Argo CD/Flux self-heal</b> ' +
      'plus <b>Terraform plan</b> on a schedule. Promotion tooling: Argo CD ApplicationSets, <b>Kargo</b>, or a simple PR bot. You wire the pipeline; the model is standard CD.</p></div>',
      try: [
        ['📖 Continuous Delivery — build binaries once', 'https://continuousdelivery.com/principles/', 'o'],
        ['📖 Kargo — multi-stage GitOps promotion', 'https://kargo.io/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Green staging, broken prod.</b> ' +
      'A release sails through staging and breaks in prod. Root cause: staging ran Kubernetes 1.27 and an older sidecar image "because nobody updated it", while prod ' +
      'is on 1.30 with a newer sidecar that changed a default. Fix: <b>parity as code</b> — the K8s version, sidecar image, and dependency versions come from the ' +
      'shared base, so staging and prod cannot diverge on them; only sizing values differ. A quarterly parity audit compares the rendered manifests of each env.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The rebuilt artifact.</b> ' +
      'The pipeline rebuilds the image separately for each environment from the same branch. Between the staging build and the prod build, a transitive dependency ' +
      'published a new patch, so <b>prod runs different bytes than what passed staging</b> — and a subtle output change slips in. Fix: build the image (and model ' +
      'package) <b>exactly once</b>, promote the digest; environments never trigger their own builds.</p></div>' +
      '<p><b>Diff your environments regularly:</b> render each env\'s final manifests and config and compare. Any key present in prod but not staging (or with a ' +
      'surprising value) is drift to explain or fix before it bites.</p>',
      try: [
        ['📖 Argo CD — ApplicationSets for multi-env', 'https://argo-cd.readthedocs.io/en/stable/user-guide/application-set/', 'o'],
        ['🚀 Ch 12 — cutovers use the same parallel-run discipline', '#ch12', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Rebuild the artifact per environment    Build once; promote the same digest / model version /\n' +
      '                                       release manifest forward.\n' +
      'Environments differ by forked YAML      One base + per-env overlays/values. Differences are DATA.\n' +
      'Hand-edited config in an env            All config via PR; GitOps self-heal reverts manual edits.\n' +
      'Staging on a different K8s / dep version   Parity as code: version-defining settings come from the\n' +
      '                                       shared base, not per-env.\n' +
      'Staging with 100 rows                    Representative (scaled) data volume + realistic traffic\n' +
      '                                       shape, or the load/eval gates are meaningless.\n' +
      'No drift detection                       Argo self-heal + scheduled terraform plan + a rendered-\n' +
      '                                       manifest diff between envs, alerting on OutOfSync.\n' +
      'Promotion is a manual re-deploy          Promotion = a PR bumping one artifact reference; gates for\n' +
      '                                       that stage must pass.\n' +
      'Too many environments                    Each env is a parity + maintenance cost. Keep the minimum\n' +
      '                                       that gives real signal (usually dev, staging, prod).</code></pre>' +
      '<p><b>The test of a good setup:</b> you can point to the exact artifact reference and config diff for any environment, and "promote to prod" is a one-line, ' +
      'reviewed, revertible change — with no build, no manual step, and no doubt about parity.</p>',
      try: [
        ['📖 Humanitec / platform — environment management patterns', 'https://humanitec.com/blog/environment-management', 'o'],
        ['📖 12-Factor — dev/prod parity', 'https://12factor.net/dev-prod-parity', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: State the build-once, deploy-many principle and why it matters for ML.\n' +
      '   A: CI produces one immutable artifact (image digest / model version / release manifest); the SAME\n' +
      '   artifact is promoted through dev → staging → prod. Rebuilding per environment risks different\n' +
      '   dependency bytes — and for ML, different model behaviour — than what passed the gates.\n\n' +
      'Q: How should environments differ from each other?\n' +
      '   A: Only by configuration values expressed as data — replica counts, GPU types, endpoints, limits,\n' +
      '   flag defaults — via base + overlays/values. Never by forked manifests or hand edits.\n\n' +
      'Q: A release passed staging and broke prod. Common non-code cause?\n' +
      '   A: Environment drift — different Kubernetes version, sidecar image, or dependency version between\n' +
      '   staging and prod. Fix with parity-as-code: version-defining settings live in the shared base.\n\n' +
      'Q: What does "staging must be prod-like" concretely require?\n' +
      '   A: Same image + dependency + K8s versions, same autoscaler config shape, same rollout mechanism, and\n' +
      '   a scaled-but-representative data volume and traffic shape — otherwise the eval and load gates are not\n' +
      '   predictive.\n\n' +
      'Q: How do you detect drift?\n' +
      '   A: GitOps self-heal flags OutOfSync resources, a scheduled terraform plan catches infra drift, and a\n' +
      '   rendered-manifest/config diff between environments surfaces values that exist in one and not another.\n\n' +
      'Q: What does promotion look like in a good setup?\n' +
      '   A: A one-line PR bumping the artifact reference in the next environment\'s values file, gated by that\n' +
      "   stage's checks (eval, load, integration, approval), and revertible with git revert.</code></pre>" +
      '<p><b>↔ See also:</b> <a href="#ch4">Ch 4</a> (GitOps), <a href="#ch2">Ch 2</a> (the artifact reference), <a href="#ch8">Ch 8</a> / <a href="#ch11">Ch 11</a> (stage gates), ' +
      '<a href="#ch13">Ch 13</a> (IaC parity), <a href="#ch12">Ch 12</a> (cutovers).</p>',
      try: [
        ['📖 GitLab — environments & deployment tiers', 'https://docs.gitlab.com/ee/ci/environments/', 'o'],
        ['📖 AWS — environment parity & promotion pipelines', 'https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/welcome.html', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the "build-once, deploy-many" promotion principle?',
      opts: [
        'Rebuild the artifact fresh for each environment from the same branch',
        'CI produces one immutable artifact (image digest / model version / release manifest) and the exact same artifact is promoted through dev → staging → prod',
        'Only ever deploy to production',
        'Build a different artifact for every developer'],
      ok: 1,
      why: 'Rebuilding per environment can pull different dependency bytes — and for ML, different behaviour — than what passed the gates. Promoting the identical artifact makes staging predictive.' },
    { q: 'How should dev, staging, and prod be allowed to differ?',
      opts: [
        'By whatever each team edits directly in the cluster',
        'Only by configuration values expressed as data (replica counts, GPU types, endpoints, limits, flag defaults) via a shared base plus per-environment overlays/values',
        'By using completely separate manifest repositories with no shared base',
        'They should be byte-identical including replica counts'],
      ok: 1,
      why: 'Config-as-data keeps environments consistent where it matters (versions, topology, mechanisms) while allowing sizing to vary — and forbids the hand edits that cause drift.' },
    { q: 'A release passed staging but broke production, with no code difference. Most likely cause?',
      opts: [
        'The production users are different',
        'Environment drift — e.g. staging on an older Kubernetes/sidecar/dependency version than prod; fix with parity-as-code so version-defining settings come from the shared base',
        'The eval gate was too strict',
        'Production has more replicas'],
      ok: 1,
      why: 'If staging and prod have diverged on versions or configuration, staging stops being predictive. Parity-as-code plus drift detection keeps them aligned.' }
  ]
};
