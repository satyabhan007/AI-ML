/* AI-ML Learn — Part 7 · Chapter 2: Model & Artifact Registries */
window.CH[2] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>"Which model is in production right now, and can I get the exact one that shipped last Tuesday?" If the answer is "let me check a Slack thread" or ' +
      '"it\'s <code>final_v3_really.pt</code> on someone\'s laptop", you have no registry — and no way to roll back or audit.</p>' +
      '<p>A <b>model registry</b> is a catalogue of every trained model version, each with its file, its metrics, the data and code that produced it, and a ' +
      '<b>stage</b> (staging / production / archived). It is the single source of truth for "what model, where".</p>' +
      '<pre><code>registry entry:  name=ranker  version=42  stage=Production\n' +
      '                 artifact=s3://models/ranker/42/  metrics={auc:0.91}  \n' +
      '                 git_sha=abc123  data_snapshot=2024-11-01  created_by=alice</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A library catalogue.</b> Books (model files) live on shelves (object storage); the catalogue ' +
      'tells you the exact edition, where it sits, who checked it out, and which editions are on the recommended shelf (Production) vs. in the archive. ' +
      'Without the catalogue you are wandering the stacks.</p></div>',
      try: [
        ['📖 MLflow — Model Registry', 'https://mlflow.org/docs/latest/model-registry.html', 'o'],
        ['🚀 Ch 1 — packaging & reproducibility', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>WHAT A MODEL VERSION BINDS TOGETHER\n' +
      '  the artifact        weights + tokenizer + config + a signature (input/output schema)\n' +
      '  provenance          git sha, training run id, dataset version/snapshot, hyperparams, base model\n' +
      '  evaluation          offline metrics + the eval set id they were computed on\n' +
      '  stage / alias       None → Staging → Production → Archived (or aliases: @champion, @challenger)\n' +
      '  lineage             which experiment produced it; which deployments use it\n' +
      'VERSION EVERYTHING TOGETHER   model + prompt + retrieval-index + serving-config as ONE release\n' +
      '                             manifest, so "deploy release 2024-11-05" is unambiguous.\n' +
      'STORAGE                       artifacts in object storage / an OCI registry; metadata in the registry DB.\n' +
      'IMMUTABILITY                  a published version is never overwritten; a fix is a new version.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard tools: <b>MLflow Model Registry</b>, <b>Weights &amp; Biases Artifacts / Model Registry</b>, ' +
      '<b>SageMaker / Vertex Model Registry</b>, or an <b>OCI registry</b> (models as OCI artifacts) for a GitOps-native flow. For experiment provenance, ' +
      '<b>MLflow Tracking</b> / <b>W&amp;B</b> / <b>DVC</b>. The pattern — immutable versions, a stage/alias, bound provenance + metrics, one release manifest — ' +
      'is common across all of them. You use a registry; you do not build a metadata store.</p></div>',
      try: [
        ['📖 Weights & Biases — Model Registry', 'https://docs.wandb.ai/guides/model_registry', 'o'],
        ['📖 DVC — data & model versioning', 'https://dvc.org/doc/use-cases/versioning-data-and-models', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>"Just retrain and redeploy" — but which data?</b> ' +
      'A production regression appears. The team wants to compare against the previous model, but the old training data was overwritten in place and ' +
      'the notebook that built it changed. They cannot reproduce the good model. Fix going forward: every registry version records a <b>dataset snapshot id</b> ' +
      '(an immutable pointer — a Delta/Iceberg version, a DVC hash, a dated export) and the <b>git sha</b> of the training code. Now "roll back to v41" also means ' +
      '"and here is exactly how to rebuild it".</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The prompt changed but the "model version" didn\'t.</b> ' +
      'An LLM feature regresses. The model artifact is identical to last week — but the system prompt was edited directly in a config file with no version bump. ' +
      'Nobody can say what the prompt looked like before. Fix: treat the <b>prompt as a versioned artifact</b> in the same registry (or a prompt registry), ' +
      'and ship model + prompt + retrieval-index + config as one <b>release manifest</b> with a single id. Rolling back the release rolls back all of it together.</p></div>' +
      '<p><b>Promotion is a controlled transition:</b> a model moves <code>Staging → Production</code> only via an approval action (a person or an automated gate — Ch 8), ' +
      'which is recorded (who, when, why). The deployment system watches the <code>@production</code> alias, not a hard-coded version.</p>',
      try: [
        ['📖 MLflow — model aliases & stage transitions', 'https://mlflow.org/docs/latest/model-registry.html#deploy-and-organize-models-with-aliases-and-tags', 'o'],
        ['📗 Part 2: prompt/version management for LLM apps', '../learn2/#ch3', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Model file named by convention on S3   A registry entry per version: artifact + provenance + metrics +\n' +
      '                                       stage. Filenames are not a source of truth.\n' +
      'Overwrite a published version           Versions are immutable. A fix is version N+1. Overwrites destroy\n' +
      '                                       reproducibility and audit.\n' +
      'Model versioned, data/code not          Bind a dataset snapshot id + git sha to every version, or you\n' +
      '                                       cannot reproduce or bisect.\n' +
      'Prompt / index / config edited in place   Version them alongside the model as one release manifest with\n' +
      '                                       a single id; roll back the release, not just the weights.\n' +
      'Deployment pins a hard version          Deployment tracks an alias (@production). Promotion = repoint\n' +
      '                                       the alias; rollback = repoint it back.\n' +
      'Anyone can promote to Production        Promotion is an explicit, recorded approval (person or gate),\n' +
      '                                       with who/when/why.\n' +
      'No model signature                      Record the input/output schema; a shape/type mismatch should be\n' +
      '                                       caught at registration, not in prod.\n' +
      'Registry and container registry unlinked   The image records the model version it expects; the model\n' +
      '                                       version records compatible runtimes. (Ch 1)</code></pre>' +
      '<p><b>The registry is the seam between training and serving.</b> Training writes versions + metrics; CD reads the <code>@production</code> alias. ' +
      'Neither side needs to know the other\'s internals — the registry entry is the contract.</p>',
      try: [
        ['📖 Google — MLOps: model & artifact management', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'o'],
        ['🏢 Part 9: model lifecycle governance & approvals', '../learn9/#ch3', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What does a model registry give you that storing weights in a bucket does not?\n' +
      '   A: Immutable versioned entries, each binding the artifact to its provenance (git sha, dataset\n' +
      '   snapshot, hyperparams), its evaluation metrics + eval-set id, a stage/alias, and lineage to the\n' +
      '   experiment and deployments. It is the single source of truth for "what model is where".\n\n' +
      'Q: A production model regressed and you cannot reproduce the previous good one. What was missing?\n' +
      '   A: A dataset snapshot id and the training-code git sha bound to each registry version. Without an\n' +
      '   immutable data pointer and code reference, "roll back to v41" is not reproducible.\n\n' +
      'Q: An LLM feature regressed but the model artifact is unchanged. Where do you look?\n' +
      '   A: The prompt, retrieval index, or serving config — edited in place with no version bump. Fix by\n' +
      '   versioning those as artifacts and shipping model+prompt+index+config as one release manifest with a\n' +
      '   single id, so rollback covers all of it.\n\n' +
      'Q: Why should the deployment track an alias (@production) rather than a specific version number?\n' +
      '   A: Promotion becomes "repoint the alias" and rollback becomes "repoint it back" — atomic, auditable,\n' +
      '   and decoupled from the CD config. The alias is the contract between training and serving.\n\n' +
      'Q: Can you overwrite version 42 with a small fix?\n' +
      '   A: No. Published versions are immutable. The fix is version 43. Overwriting breaks reproducibility,\n' +
      '   audit trails, and anyone who pinned or is running 42.\n\n' +
      'Q: What is a model signature and where is it enforced?\n' +
      '   A: The declared input/output schema (names, types, shapes). It is checked at registration and by the\n' +
      "   serving runtime, so a mismatch fails early rather than at inference time.</code></pre>" +
      '<p><b>↔ See also:</b> <a href="#ch1">Ch 1</a> (image ↔ model version), <a href="#ch4">Ch 4</a> (CD reads the alias), <a href="#ch8">Ch 8</a> (eval gates promote), ' +
      '<a href="#ch9">Ch 9</a> (rollback = repoint alias), and <a href="../learn9/#ch3">Part 9 Ch 3</a> (governed promotion).</p>',
      try: [
        ['📖 SageMaker — Model Registry & model packages', 'https://docs.aws.amazon.com/sagemaker/latest/dg/model-registry.html', 'o'],
        ['📖 ML Metadata (MLMD) — lineage tracking', 'https://www.tensorflow.org/tfx/guide/mlmd', 'o']
      ] }
  ],

  quiz: [
    { q: 'What must a model registry version bind together to make rollback and bisection possible?',
      opts: [
        'Just the model weights file',
        'The artifact plus its provenance (git sha, dataset snapshot id, hyperparams), evaluation metrics + eval-set id, a stage/alias, and lineage',
        'Only the accuracy number',
        'The name of the engineer who trained it'],
      ok: 1,
      why: 'Rollback needs the exact artifact; reproduction and bisection need the immutable data + code references and the metrics context. A registry entry ties all of it to one version.' },
    { q: 'An LLM feature regressed but the model artifact is byte-identical to last week. Most likely cause and fix?',
      opts: [
        'The GPU changed; buy a new one',
        'The prompt, retrieval index, or serving config was edited in place with no version bump — version those as artifacts and ship model+prompt+index+config as one release manifest',
        'The model registry is down',
        'Nothing changed; it is random'],
      ok: 1,
      why: 'If only the weights are versioned, prompt/index/config drift is invisible and un-rollbackable. Bundling them into one versioned release makes the whole thing reproducible and reversible.' },
    { q: 'Why should the deployment system track an alias like @production instead of pinning version 42?',
      opts: [
        'Aliases load faster',
        'Promotion becomes an atomic "repoint the alias" and rollback becomes "repoint it back", decoupled from CD config and fully auditable',
        'Version numbers are not allowed in production',
        'It removes the need for a registry'],
      ok: 1,
      why: 'An alias is a stable indirection: training publishes versions, serving follows the alias, and moving models in/out of production is a single recorded action.' }
  ]
};
