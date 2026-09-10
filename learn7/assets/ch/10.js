/* AI-ML Learn — Part 7 · Chapter 10: Secrets, Config & Prompt Management */
window.CH[10] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Three kinds of "settings" travel with a model service, and mixing them up causes outages and breaches:</p>' +
      '<pre><code>SECRETS   API keys, DB passwords, tokens, signing keys — must be encrypted, access-controlled, rotatable\n' +
      'CONFIG    model alias, batch size, timeouts, feature flags, thresholds — non-sensitive, changes often\n' +
      'PROMPTS   system prompts, tool schemas, few-shot examples — behaviour-defining, must be versioned + evaluated</code></pre>' +
      '<p>The rule for all three: <b>injected at runtime, never baked into the image</b>, and <b>versioned</b> (so you can see what changed and roll back). ' +
      'A key in a Dockerfile layer is a key in every registry that ever pulled it.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>House keys vs. the thermostat schedule vs. the recipe on the fridge.</b> You do not glue your keys to the ' +
      'front door (secret in the image). The thermostat schedule (config) you tweak often. The recipe (prompt) you keep versions of, because changing it changes dinner.</p></div>',
      try: [
        ['📖 OWASP — Secrets Management Cheat Sheet', 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html', 'o'],
        ['🚀 Ch 1 — why secrets must not be in image layers', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>SECRETS\n' +
      '  store        a secret manager: Vault, AWS/GCP/Azure Secrets Manager, K8s Secrets + KMS.\n' +
      '  delivery     mounted file / env at pod start via the External Secrets Operator or CSI driver;\n' +
      '               or short-lived credentials via workload identity (no static key at all).\n' +
      '  in git       only ciphertext (SOPS, Sealed Secrets) or a REFERENCE, never plaintext.\n' +
      '  rotation     automatic, on a schedule; app reloads without redeploy; revoke on leak.\n' +
      '  least priv   one identity per service; scoped policies; audit every access.\n' +
      'CONFIG\n' +
      '  config as data (Ch 4): base + per-env values; changes via PR; hot-reload where safe.\n' +
      '  runtime flags via a feature-flag service (Ch 9) for things that must change without deploy.\n' +
      'PROMPTS\n' +
      '  a prompt is a versioned artifact (Ch 2): id + version + hash, stored in a registry / repo.\n' +
      '  every prompt change runs the eval gate (Ch 8) and ships in a release manifest with the model.\n' +
      '  render at runtime from (template version + variables); log which prompt version served each call.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>Standard tools: <b>HashiCorp Vault</b> / cloud secret managers with the ' +
      '<b>External Secrets Operator</b> or <b>Secrets Store CSI driver</b>; <b>SOPS</b> / <b>Sealed Secrets</b> for git; <b>workload identity</b> (IRSA / GKE WI / Azure ' +
      'workload identity) to avoid static keys entirely; a <b>feature-flag platform</b> for runtime config; and a <b>prompt registry</b> (LangSmith / Humanloop / ' +
      'PromptLayer, or just versioned files) with prompts under the eval gate. You configure these; you do not build a KMS.</p></div>',
      try: [
        ['📖 External Secrets Operator', 'https://external-secrets.io/latest/', 'o'],
        ['📖 Kubernetes — Secrets Store CSI Driver', 'https://secrets-store-csi-driver.sigs.k8s.io/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The leaked key that could not be rotated fast.</b> ' +
      'A vendor API key was set as an env var in a Helm values file committed to git and baked into the running config. It leaks. Rotating it means a values-file PR + ' +
      'a full redeploy of every service that uses it — 40 minutes while the old key is still valid. Fix: keys live in a secret manager, delivered to pods via the ' +
      'External Secrets Operator, with <b>automatic rotation</b> and <b>app-side hot reload</b>; on leak, revoke in the manager and every pod picks up the new key in ' +
      'seconds, no deploy.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Which prompt answered this?</b> ' +
      'A support-bot answer is reported as wrong. The system prompt has been edited five times this month directly in a config map, with no history. Nobody can say ' +
      'what it looked like on the day of the bad answer. Fix: prompts become <b>versioned artifacts</b> — <code>prompt_id + version</code> in a registry, changes go ' +
      'through the eval gate, and every response logs the <code>prompt_version</code> it used (Part 8). Now "what prompt served request X" is one query.</p></div>' +
      '<p><b>Config vs prompt is a real line:</b> config changes are safe to hot-reload and do not need an eval; prompt changes alter model behaviour and must be ' +
      'evaluated and shipped like a model version.</p>',
      try: [
        ['📖 HashiCorp Vault — dynamic secrets & rotation', 'https://developer.hashicorp.com/vault/docs/secrets/databases', 'o'],
        ['📗 Part 2: prompt management & versioning', '../learn2/#ch3', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Secret in a Dockerfile / image layer   It is in every registry copy forever. Inject at runtime from a\n' +
      '                                       secret manager; rebuild + rotate if already leaked.\n' +
      'Plaintext secret in git / values.yaml   SOPS / Sealed Secrets (ciphertext) or a reference. Scan repos\n' +
      '                                       (gitleaks) in CI.\n' +
      'Long-lived static API keys              Prefer workload identity / short-lived tokens. If static,\n' +
      '                                       auto-rotate + hot-reload + scoped + audited.\n' +
      'Rotation requires a redeploy            App reloads secrets without restart; rotation is a\n' +
      '                                       secret-manager action, not a deploy.\n' +
      'One shared credential for many services   One identity per service, least-privilege policy, per-service\n' +
      '                                       audit trail.\n' +
      'Prompt edited in place, no history       Prompt = versioned artifact under the eval gate; log the\n' +
      '                                       prompt_version served with each request.\n' +
      'Config change needs a full deploy        Runtime config / flags via a flag service for anything that\n' +
      '                                       must change fast; the rest via GitOps PR.\n' +
      'Secrets printed in logs / error traces   Redact at the logging layer; never echo config that may hold\n' +
      '                                       a secret.</code></pre>' +
      '<p><b>Blast radius thinking:</b> assume any single secret will leak eventually. Design so the leak is (a) detected, (b) scoped to one service, and ' +
      '(c) revocable + rotatable in seconds without a deploy.</p>',
      try: [
        ['📖 gitleaks — secret scanning in CI', 'https://github.com/gitleaks/gitleaks', 'o'],
        ['🏢 Part 9: security for AI systems (secrets, supply chain)', '../learn9/#ch5', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Where should an API key live for a model service, and how does it get to the pod?\n' +
      '   A: In a secret manager (Vault / cloud). Delivered to the pod as a mounted file or env at start via\n' +
      '   the External Secrets Operator or CSI driver, or better, no static key at all — short-lived\n' +
      '   credentials via workload identity. Git holds only ciphertext or a reference.\n\n' +
      'Q: A key leaked. Why might rotation be slow, and how do you make it fast?\n' +
      '   A: Slow if the key is an env var in a committed values file baked into config — rotation needs a PR +\n' +
      '   full redeploy. Fast if the key is in a secret manager with automatic rotation and app-side hot\n' +
      '   reload: revoke + rotate in the manager, pods pick it up in seconds, no deploy.\n\n' +
      'Q: How are config and prompts different in how they are managed?\n' +
      '   A: Config (timeouts, batch size, thresholds, flags) is non-sensitive, changes often, safe to\n' +
      '   hot-reload, no eval needed. A prompt defines model behaviour: it is a versioned artifact, must pass\n' +
      '   the eval gate, ships in a release manifest with the model, and the version served is logged per\n' +
      '   request.\n\n' +
      'Q: Why not put a secret in a Docker image layer even temporarily?\n' +
      '   A: Layers are content-addressed and cached in every registry and node that pulled the image; the\n' +
      '   secret is effectively permanent and widely copied. It must be injected at runtime.\n\n' +
      'Q: What is the benefit of one identity per service for secret access?\n' +
      '   A: Least privilege (a compromise is scoped to that service), per-service audit trails, and the\n' +
      '   ability to revoke one service without affecting others.\n\n' +
      'Q: How do you know which prompt produced a given production answer?\n' +
      '   A: Every response logs the prompt_id + prompt_version it rendered from; prompts are stored\n' +
      '   immutably in a registry, so you can retrieve the exact text.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch1">Ch 1</a> (no secrets in images), <a href="#ch2">Ch 2</a> (prompt as versioned artifact), <a href="#ch4">Ch 4</a> (config as data in GitOps), ' +
      '<a href="#ch8">Ch 8</a> (prompt changes hit the eval gate), <a href="../learn9/#ch5">Part 9 Ch 5</a> (security).</p>',
      try: [
        ['📖 AWS — IAM Roles for Service Accounts (IRSA)', 'https://docs.aws.amazon.com/eks/latest/userguide/iam-roles-for-service-accounts.html', 'o'],
        ['📖 Mozilla SOPS — encrypted secrets in git', 'https://github.com/getsops/sops', 'o']
      ] }
  ],

  quiz: [
    { q: 'How should a vendor API key be provided to a running model-serving pod?',
      opts: [
        'Baked into the container image as an ENV instruction',
        'Stored in a secret manager and injected at pod start (mounted file/env via External Secrets/CSI), or replaced entirely by short-lived workload-identity credentials',
        'Committed to the Helm values file in plaintext',
        'Hard-coded in the application source'],
      ok: 1,
      why: 'Secrets must be runtime-injected and access-controlled. Image layers and git are copied and cached widely; a secret placed there is effectively permanent.' },
    { q: 'Why can a leaked key be slow to rotate in a poorly designed setup?',
      opts: [
        'Secret managers are inherently slow',
        'If the key is an env var in a committed values file baked into config, rotation requires a PR plus a full redeploy of every consuming service while the old key stays valid',
        'Keys cannot be rotated at all',
        'Rotation always requires a new GPU'],
      ok: 1,
      why: 'Secrets in a secret manager with auto-rotation and app-side hot reload can be revoked and replaced in seconds with no deploy; secrets embedded in config cannot.' },
    { q: 'How should prompts be managed compared to ordinary runtime config?',
      opts: [
        'Identically — both are just strings',
        'As versioned artifacts that pass the eval gate and ship in a release manifest with the model, with the prompt version logged per request — because a prompt change alters model behaviour',
        'Prompts should be hard-coded so they never change',
        'Prompts belong in the secret manager'],
      ok: 1,
      why: 'Config is non-behavioural and safe to hot-reload; a prompt defines what the model does, so it needs versioning, evaluation, and per-request traceability like a model.' }
  ]
};
