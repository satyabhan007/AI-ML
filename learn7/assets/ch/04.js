/* AI-ML Learn — Part 7 · Chapter 4: CD & GitOps */
window.CH[4] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>How does a green build actually become "running in production"? If the answer is "someone runs <code>kubectl apply</code> from their laptop" or ' +
      '"clicks deploy in a UI", nobody can say for certain what is deployed, and reverting means remembering what you changed.</p>' +
      '<p><b>GitOps</b> makes <b>Git the single source of truth</b> for what should be running. A file in a repo describes the desired state ' +
      '(this image, this model version, these replicas, this config); a controller in the cluster continuously makes reality match that file.</p>' +
      '<pre><code>you: open a PR that changes desired-state.yaml → review → merge\n' +
      'controller (Argo CD / Flux): sees the change → applies it → reports "synced" or "drift detected"\n' +
      'rollback = git revert the commit</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A thermostat.</b> You set the target temperature (Git); the thermostat (the GitOps controller) ' +
      'keeps adjusting the heating until the room matches, and notices if someone opens a window (drift). You never touch the boiler directly.</p></div>',
      try: [
        ['📖 OpenGitOps — principles', 'https://opengitops.dev/', 'o'],
        ['🚀 Ch 2 — the registry alias CD watches', '#ch2', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>PRINCIPLES (OpenGitOps)\n' +
      '  declarative     desired state is described, not scripted.\n' +
      '  versioned+immutable   the desired state lives in Git; history = audit log.\n' +
      '  pulled automatically   agents pull the state and apply it (no CI with cluster creds pushing).\n' +
      '  continuously reconciled   drift is detected and corrected (or alerted).\n' +
      'CONFIG AS DATA   environments differ only by values (Kustomize overlays / Helm values), not\n' +
      '                 by forked YAML. dev/staging/prod share the base.\n' +
      'PROMOTION        promote an artifact by updating an image tag / model alias / release id in the\n' +
      '                 env\'s values file — via PR. Same artifact moves dev → staging → prod.\n' +
      'SECRETS          never plaintext in Git — Sealed Secrets / SOPS / external secret operator (Ch 10).\n' +
      'APP-OF-APPS      one root definition points at many app definitions → the whole platform in Git.\n' +
      'SYNC WAVES / HOOKS   ordering (DB migration before app), health checks before "synced".</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard controllers are <b>Argo CD</b> and <b>Flux</b> (both CNCF graduated). ' +
      'Config is templated with <b>Helm</b> or <b>Kustomize</b>; secrets via <b>Sealed Secrets / SOPS / External Secrets Operator</b>; progressive rollout via ' +
      '<b>Argo Rollouts / Flagger</b> (Ch 5). Model-serving CRDs (<b>KServe</b>) fit the same flow. The four GitOps principles above are the ' +
      '<b>OpenGitOps</b> standard. You adopt this pattern; you do not write a reconciler.</p></div>',
      try: [
        ['📖 Argo CD — core concepts & architecture', 'https://argo-cd.readthedocs.io/en/stable/core_concepts/', 'o'],
        ['📖 Flux — GitOps toolkit', 'https://fluxcd.io/flux/concepts/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The undocumented hotfix.</b> ' +
      'During an incident an engineer runs <code>kubectl edit</code> to bump replicas and change an env var. It fixes the issue. Three weeks later a routine deploy ' +
      'reverts both changes (they were never in Git) and the incident recurs. With GitOps + <b>drift detection</b>, the manual edit shows as "OutOfSync" within ' +
      'seconds and either auto-reverts or pages — forcing the fix into a PR. The cluster can no longer diverge silently from the repo.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Promoting a model through environments.</b> ' +
      'A new ranker passes staging. Promotion to prod is a <b>one-line PR</b> to <code>envs/prod/values.yaml</code> changing <code>modelAlias: "@candidate"</code> to ' +
      '<code>"@production"</code> (or bumping an image tag). Reviewers see exactly what changes; merge triggers Argo CD to roll it out (via Argo Rollouts, Ch 5); ' +
      'a bad outcome is <code>git revert</code>. The <i>same artifact</i> that ran in staging runs in prod — no rebuild, no drift.</p></div>' +
      '<p><b>CI and CD split cleanly:</b> CI builds + tests + pushes an immutable artifact and opens a PR to the deploy repo with the new tag. ' +
      'CD (the controller, pull-based) applies merged changes. CI never holds cluster credentials.</p>',
      try: [
        ['📖 Argo CD — automated sync, self-heal & drift', 'https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/', 'o'],
        ['🚀 Ch 15 — multi-environment promotion & drift control', '#ch15', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'CI pushes to the cluster with creds    Pull-based CD: the in-cluster controller pulls Git. CI only\n' +
      '                                       opens a PR with the new artifact reference.\n' +
      'kubectl apply / edit from a laptop      All changes via PR to the deploy repo. Enable drift detection\n' +
      '                                       + self-heal so manual edits are reverted or alert.\n' +
      'Forked YAML per environment             One base + overlays (Kustomize) or one chart + values (Helm).\n' +
      '                                       Environments differ by DATA, not by copy.\n' +
      'Rebuild the artifact per environment     Build once; promote the SAME image/model reference through\n' +
      '                                       dev → staging → prod.\n' +
      'Plaintext secrets in Git                Sealed Secrets / SOPS / External Secrets Operator. Git holds\n' +
      '                                       ciphertext or references only.\n' +
      'No ordering between resources            Sync waves / hooks: run migrations before the app; wait for\n' +
      '                                       health before marking synced.\n' +
      '"Synced" = applied, not healthy          Gate on health checks / readiness, not just "kubectl applied\n' +
      '                                       without error".\n' +
      'One giant repo, no boundaries            App-of-apps / per-team repos with clear ownership; the root\n' +
      '                                       still composes the whole platform.</code></pre>' +
      '<p><b>The payoff:</b> the deploy repo\'s git history <i>is</i> the deployment audit log — every prod change is a reviewed, attributable, revertible commit, ' +
      'and disaster recovery is "point a fresh cluster at the repo".</p>',
      try: [
        ['📖 Weaveworks — GitOps: what you need to know', 'https://www.weave.works/technologies/gitops/', 'o'],
        ['🚀 Ch 13 — infrastructure as code (same idea for infra)', '#ch13', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What is GitOps in one sentence, and what are its core principles?\n' +
      '   A: Git is the single source of truth for desired system state, and an in-cluster controller\n' +
      '   continuously reconciles reality to it. Principles: declarative, versioned + immutable, pulled\n' +
      '   automatically, continuously reconciled.\n\n' +
      'Q: Why is pull-based CD (controller pulls Git) preferred over CI pushing to the cluster?\n' +
      '   A: CI never needs cluster credentials (smaller blast radius), the cluster self-heals toward Git,\n' +
      '   and drift is detected and corrected. Push-based CD spreads credentials and has no drift control.\n\n' +
      'Q: How do dev, staging and prod stay consistent without forked YAML?\n' +
      '   A: Config as data: one base plus per-environment overlays (Kustomize) or values (Helm). Environments\n' +
      '   differ only by parameter values; the same manifests and the same artifact flow through all of them.\n\n' +
      'Q: How do you promote a model from staging to production, and roll back?\n' +
      '   A: A PR changing the model alias / image tag in the prod values file. Merge → the controller rolls it\n' +
      '   out. Rollback = git revert that commit. The same artifact that ran in staging runs in prod.\n\n' +
      'Q: Someone ran kubectl edit during an incident. What does GitOps do about it?\n' +
      '   A: Drift detection flags the resource OutOfSync; with self-heal it reverts to the Git state (or\n' +
      '   alerts), forcing the change into a reviewed PR so the cluster cannot silently diverge.\n\n' +
      'Q: What does "synced" need to mean for it to be trustworthy?\n' +
      '   A: Not just "applied without error" — the resources passed health/readiness checks, and ordered\n' +
      "   steps (migrations before app) ran via sync waves/hooks.</code></pre>" +
      '<p><b>↔ See also:</b> <a href="#ch5">Ch 5</a> (progressive rollout the controller triggers), <a href="#ch9">Ch 9</a> (rollback = git revert), ' +
      '<a href="#ch10">Ch 10</a> (secrets in GitOps), <a href="#ch13">Ch 13</a> (IaC), <a href="#ch15">Ch 15</a> (promotion &amp; drift).</p>',
      try: [
        ['📖 Argo Rollouts — progressive delivery with Argo CD', 'https://argo-rollouts.readthedocs.io/en/stable/', 'o'],
        ['📖 CNCF — GitOps Working Group', 'https://github.com/gitops-working-group/gitops-working-group', 'o']
      ] }
  ],

  quiz: [
    { q: 'In GitOps, how does a change reach production?',
      opts: [
        'An engineer runs kubectl apply from their machine',
        'A merged PR updates the desired-state repo; an in-cluster controller (Argo CD / Flux) pulls the change and reconciles the cluster to match',
        'CI SSHes into each node and restarts services',
        'A cron job copies files nightly'],
      ok: 1,
      why: 'Git holds the desired state; a pull-based controller continuously makes the cluster match it. The deploy repo history becomes the audit log, and rollback is git revert.' },
    { q: 'Why is pull-based CD (controller pulls Git) generally preferred over CI pushing to the cluster?',
      opts: [
        'It is the only way Kubernetes works',
        'CI never needs cluster credentials, the cluster self-heals toward Git, and configuration drift is detected and corrected',
        'It makes deploys slower on purpose',
        'It removes the need for tests'],
      ok: 1,
      why: 'Push-based CD spreads cluster credentials into CI and has no ongoing drift control. A pull-based reconciler keeps credentials in-cluster and continuously enforces the declared state.' },
    { q: 'How should dev, staging, and prod configuration be organised?',
      opts: [
        'A separate hand-maintained copy of all YAML per environment',
        'One base plus per-environment overlays/values (Kustomize/Helm) — environments differ by parameter values, and the same built artifact is promoted through all of them',
        'Only a prod config; other environments are optional',
        'Environment settings hard-coded in the container image'],
      ok: 1,
      why: 'Config-as-data keeps environments consistent: shared manifests, differences expressed as values, and a single immutable artifact flowing dev → staging → prod.' }
  ]
};
