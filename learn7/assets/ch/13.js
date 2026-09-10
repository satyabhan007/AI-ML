/* AI-ML Learn — Part 7 · Chapter 13: Infrastructure as Code for ML Platforms */
window.CH[13] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>An ML platform is a pile of cloud resources: a Kubernetes cluster, GPU node pools, object-storage buckets for models and data, a container registry, ' +
      'a model-serving endpoint, IAM roles, networking. If those were created by clicking in a console, nobody can recreate them, review a change to them, or ' +
      'spin up an identical staging copy.</p>' +
      '<p><b>Infrastructure as Code (IaC)</b> describes all of it in text files, checked into git. Applying the files creates or updates the real resources; ' +
      'the files are the source of truth.</p>' +
      '<pre><code>main.tf:  a GPU node pool (type, min/max, taints), an S3 bucket (versioned, encrypted),\n' +
      '          an ECR repo, an IAM role scoped to the serving SA, a KServe namespace\n' +
      'terraform plan   → shows exactly what will change\n' +
      'terraform apply  → makes it so ; git history = every infra change, reviewed</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A building blueprint vs. remodelling by memory.</b> With a blueprint, any contractor can build the same ' +
      'house, changes are marked up and approved, and you can build a second identical one. "I think we moved a wall somewhere" is how console-clicked infra works.</p></div>',
      try: [
        ['📖 HashiCorp — what is Infrastructure as Code?', 'https://developer.hashicorp.com/terraform/intro', 'o'],
        ['🚀 Ch 4 — GitOps (the same idea for cluster workloads)', '#ch4', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>DECLARATIVE     describe the desired resources; the tool computes the diff (plan) and applies it.\n' +
      'STATE          a record of what IaC manages, so it knows create vs update vs destroy. Store it\n' +
      '               remotely + locked (S3+DynamoDB / TF Cloud / GCS) — never on a laptop, never in git.\n' +
      'MODULES        reusable parametrised units: "gpu-node-pool", "model-bucket", "serving-namespace".\n' +
      '               Compose them per environment.\n' +
      'ENVIRONMENTS   dev / staging / prod as separate state + a values file (workspaces or dirs).\n' +
      '               Same modules, different sizes/counts.\n' +
      'PLAN IN CI     terraform plan on every PR, posted as a comment; apply only after merge, via a\n' +
      '               pipeline with the cloud credentials (humans do not run apply from laptops).\n' +
      'POLICY AS CODE  OPA / Sentinel / Checkov: "no public buckets", "GPU nodes must be tainted",\n' +
      '               "encryption on" — enforced before apply.\n' +
      'DRIFT          terraform plan on a schedule detects out-of-band console changes.\n' +
      'SECRETS        never in .tf or state in plaintext — reference a secret manager (Ch 10).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard tools: <b>Terraform / OpenTofu</b> (or <b>Pulumi</b>, <b>Crossplane</b> for a ' +
      'Kubernetes-native flavour, cloud-native <b>CloudFormation / CDK / Bicep</b>). Linting/validation: <b>tflint</b>, <b>terraform validate</b>, <b>checkov</b> / <b>tfsec</b> ' +
      'for security, <b>OPA/Conftest</b> or <b>Sentinel</b> for policy. Remote, locked state is standard. Run <code>plan</code> in CI, <code>apply</code> from a pipeline. ' +
      'You write modules and policies; the engine is off the shelf.</p></div>',
      try: [
        ['📖 Terraform — remote state & locking', 'https://developer.hashicorp.com/terraform/language/state/remote', 'o'],
        ['📖 Checkov — IaC static analysis', 'https://www.checkov.io/1.Welcome/What%20is%20Checkov.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>"Can we get a staging environment?" — and it takes three weeks.</b> ' +
      'The prod platform was built by hand over a year. Reproducing it means archaeology. Fix: capture it as Terraform <b>modules</b> (<code>cluster</code>, ' +
      '<code>gpu-pool</code>, <code>model-store</code>, <code>serving-ns</code>, <code>iam</code>), parametrised by size. A new environment becomes a values file + ' +
      '<code>terraform apply</code> — 30 minutes, identical topology, and prod changes now go through <code>plan</code> review too.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The state file on a laptop.</b> ' +
      'One engineer keeps <code>terraform.tfstate</code> locally. They go on leave; someone else runs <code>apply</code> with an empty state and Terraform tries to ' +
      '<b>recreate the entire production cluster</b> because it thinks nothing exists. Caught by the plan output before disaster. Fix: <b>remote state</b> in S3 with ' +
      'DynamoDB locking, so state is shared, versioned, and only one apply runs at a time — and no one ever holds the only copy.</p></div>' +
      '<p><b>Policy-as-code earns its keep:</b> a Checkov/OPA rule "S3 buckets holding models must be private + encrypted + versioned" fails the PR the moment someone ' +
      'writes a public bucket, instead of a pen-tester finding it in six months.</p>',
      try: [
        ['📖 Terraform — modules & composition', 'https://developer.hashicorp.com/terraform/language/modules', 'o'],
        ['🏢 Part 9: platform engineering & the paved road', '../learn9/#ch1', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Click-ops in the console               All infra in IaC; console changes show as drift and are\n' +
      '                                       reverted or codified.\n' +
      'State on a laptop / in git             Remote, locked, versioned state (S3+DynamoDB / TF Cloud).\n' +
      'apply from a developer machine          Run plan in CI on the PR; apply only from a pipeline with\n' +
      '                                       scoped credentials.\n' +
      'Copy-pasted .tf per environment          Modules + per-env values (workspaces / dirs). Same code,\n' +
      '                                       different parameters.\n' +
      'No policy checks                         Checkov / tfsec / OPA gates: no public buckets, encryption on,\n' +
      '                                       GPU nodes tainted, least-privilege IAM.\n' +
      'Secrets in .tf or state                 Reference a secret manager; never plaintext. State can contain\n' +
      '                                       secrets — encrypt + restrict it.\n' +
      'Giant monolithic state                   Split by blast radius (network / cluster / data / apps);\n' +
      '                                       a mistake in one does not risk all.\n' +
      'No scheduled drift check                 terraform plan on a cron; alert on unexpected diffs.\n' +
      'Destroy not guarded                     Protect stateful resources (prevent_destroy), require an\n' +
      '                                       explicit approval for destructive plans.</code></pre>' +
      '<p><b>Same principle as GitOps (Ch 4), one layer down:</b> Git holds the desired state of the <i>infrastructure</i>; a pipeline reconciles the cloud to it; ' +
      'history is the audit log; DR is "apply the code to a new account".</p>',
      try: [
        ['📖 Terraform — recommended practices / workflow', 'https://developer.hashicorp.com/terraform/cloud-docs/recommended-practices', 'o'],
        ['📖 OpenTofu — open-source Terraform', 'https://opentofu.org/docs/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What does Infrastructure as Code give an ML platform?\n' +
      '   A: A reproducible, reviewable, version-controlled definition of the cluster, GPU pools, buckets,\n' +
      '   registry, endpoints and IAM. New environments are a values file + apply; every change is a reviewed\n' +
      "   diff; DR is applying the code to a fresh account.\n\n" +
      'Q: Why must Terraform state be remote and locked?\n' +
      '   A: State records what IaC manages. If it lives on one laptop it can be lost or diverge; an apply\n' +
      '   with empty state tries to recreate everything. Remote + locked state is shared, versioned, and\n' +
      '   serialises applies.\n\n' +
      'Q: Who runs terraform apply and from where?\n' +
      '   A: A CI/CD pipeline with scoped cloud credentials, after a merged PR whose plan was reviewed.\n' +
      '   Developers do not apply from laptops.\n\n' +
      'Q: How do you keep dev/staging/prod consistent in IaC?\n' +
      '   A: Reusable modules parametrised by size/count, plus a per-environment values file and separate\n' +
      '   state. Same modules everywhere; only the parameters differ.\n\n' +
      'Q: What is policy-as-code and give an ML-relevant rule.\n' +
      '   A: Automated checks (Checkov / OPA / Sentinel) that fail a plan violating a rule — e.g. "buckets\n' +
      '   holding models must be private, encrypted and versioned", or "GPU node pools must be tainted".\n\n' +
      'Q: How do you detect that someone changed infra in the console?\n' +
      '   A: Scheduled terraform plan (drift detection) that alerts on any diff between the code and reality;\n' +
      '   the change is then codified or reverted.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch4">Ch 4</a> (GitOps for workloads), <a href="#ch6">Ch 6</a> (the cluster IaC provisions), <a href="#ch10">Ch 10</a> (secrets, not in state), ' +
      '<a href="#ch14">Ch 14</a> (supply chain), <a href="../learn9/#ch1">Part 9 Ch 1</a> (the platform).</p>',
      try: [
        ['📖 Pulumi — infrastructure as code in real languages', 'https://www.pulumi.com/docs/iac/concepts/', 'o'],
        ['📖 Crossplane — Kubernetes-native control planes', 'https://docs.crossplane.io/latest/getting-started/introduction/', 'o']
      ] }
  ],

  quiz: [
    { q: 'Where must Terraform/OpenTofu state be stored for a team?',
      opts: [
        'On the lead engineer\'s laptop',
        'Remote and locked (e.g. S3 + DynamoDB, TF Cloud, GCS) so it is shared, versioned, and applies are serialised',
        'Committed to the git repo in plaintext',
        'Regenerated from scratch on every run'],
      ok: 1,
      why: 'State records what IaC manages. A single local copy can be lost or diverge, and an apply with empty state tries to recreate everything. Remote locked state prevents both.' },
    { q: 'Who should run `terraform apply` for production infrastructure?',
      opts: [
        'Any developer, from their laptop, whenever needed',
        'A CI/CD pipeline with scoped cloud credentials, after a merged PR whose `plan` output was reviewed',
        'Nobody — infra should be created by clicking in the console',
        'The cloud provider automatically'],
      ok: 1,
      why: 'Running apply from a pipeline keeps credentials off developer machines, ties every change to a reviewed diff, and makes the git history the audit log.' },
    { q: 'A rule that fails a plan if it would create a public, unencrypted model bucket is an example of what?',
      opts: [
        'A unit test',
        'Policy-as-code (Checkov / OPA / Sentinel) enforced before apply',
        'A load test',
        'A feature flag'],
      ok: 1,
      why: 'Policy-as-code encodes organisational guardrails as automated checks in the IaC pipeline, catching misconfigurations at PR time instead of in a later audit or incident.' }
  ]
};
