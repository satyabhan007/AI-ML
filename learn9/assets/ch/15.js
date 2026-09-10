/* AI-ML Learn — Part 9 · Chapter 15: Reference Architecture */
window.CH[15] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>This chapter assembles the whole course into one picture: the components of an enterprise AI platform and how they connect. It is a checklist for "what does ' +
      'a complete platform have", not a product to copy — every org draws it slightly differently.</p>' +
      '<pre><code>                    ┌─────────────── governance + security + FinOps (cross-cutting) ───────────────┐\n' +
      ' clients ─▶ MODEL GATEWAY ─▶ SERVING (runtimes, GPUs, autoscale) ─▶ models\n' +
      '            (auth, routing,        │                                   ▲\n' +
      '             quotas, fallback)     ├─▶ RETRIEVAL (vector DB, rerank)    │\n' +
      '                                   ├─▶ FEATURE STORE (online/offline)   │\n' +
      '                                   ├─▶ CACHES (prompt/semantic/KV)      │\n' +
      '                                   └─▶ GUARDRAILS (in/out filters)      │\n' +
      '  REGISTRY (models+prompts) · EVAL PLATFORM · PIPELINES (data/feature/RAG) · OBSERVABILITY (OTel)\n' +
      '  CI/CD (GitOps) · IaC · SECRETS · TENANT ROUTER + CELLS</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A blueprint of a hospital.</b> Wards, theatres, pharmacy, records, sterilisation, power, ' +
      'and the corridors between them. You would not build a hospital without the blueprint; you also would not copy another hospital\'s exactly.</p></div>',
      try: [
        ['📖 Google — MLOps reference architecture', 'https://cloud.google.com/architecture/mlops-continuous-delivery-and-automation-pipelines-in-machine-learning', 'o'],
        ['🏢 Ch 1 — this is what the platform team builds', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>COMPONENT (→ where it was covered)\n' +
      '  model gateway         auth, routing by model+version, provider fallback, per-tenant quotas +\n' +
      '                        rate limits, metering, caching, one standard API   (P6 C3/C14, P9 C10/C12/C14)\n' +
      '  serving               runtimes (vLLM/Triton/KServe), GPU pools + autoscaling, dynamic batching,\n' +
      '                        graceful termination                              (P6 C4/C9, P7 C6)\n' +
      '  retrieval             vector DB (sharded, filtered), hybrid + rerank, per-tenant scoping (P6 C7/C16)\n' +
      '  feature store         offline + online, point-in-time joins, freshness SLAs   (P6 C5)\n' +
      '  caches                prompt / semantic / embedding / retrieval / KV, versioned keys   (P6 C8)\n' +
      '  guardrails            input + output filters, injection/PII/policy, safety metrics   (P8 C9, P9 C5)\n' +
      '  registry              models + prompts, immutable versions, aliases, release manifests   (P7 C2, P9 C10)\n' +
      '  eval platform         shared datasets + scorers, CI gate + eval-in-prod   (P7 C8, P8 C7, P9 C10)\n' +
      '  pipelines             data / feature / RAG ingestion, orchestrated, idempotent, lineage   (P6 C6, P9 C4/C10)\n' +
      '  observability         OTel → metrics/traces/logs/profiles, dashboards, SLOs, burn-rate alerts   (P8 all)\n' +
      '  CI/CD + IaC           GitOps, progressive delivery, eval gates, Terraform, policy-as-code   (P7 C3-C5/C13)\n' +
      '  secrets               secret manager, workload identity, no secrets in images   (P7 C1/C10)\n' +
      '  tenancy               tenant router → cells, isolation, shuffle sharding   (P9 C2/C9)\n' +
      '  cross-cutting         governance + risk committee, data governance, security, compliance, FinOps,\n' +
      '                        responsible-AI systems, org design   (P9 C3-C8/C11/C13)</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>This mirrors published reference architectures: <b>Google Cloud MLOps</b>, <b>AWS ML Lens / SageMaker</b>, ' +
      '<b>Azure ML architecture</b>, <b>Databricks</b>, and the <b>MLOps / LLMOps</b> community stacks. The component list is stable across all of them; the choices ' +
      '(build vs buy, which tool per box, how many cells) are yours. Use it as a coverage checklist.</p></div>',
      try: [
        ['📖 AWS — Machine Learning Lens (Well-Architected)', 'https://docs.aws.amazon.com/wellarchitected/latest/machine-learning-lens/machine-learning-lens.html', 'o'],
        ['📖 Azure — machine learning architecture & MLOps', 'https://learn.microsoft.com/en-us/azure/architecture/ai-ml/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Build vs buy, box by box.</b> ' +
      'A mid-size company sizing its platform: <b>buy/adopt</b> the commodities — Kubernetes + KServe, a managed vector DB, an OTel + Grafana stack, MLflow registry, ' +
      'Terraform, a model gateway (LiteLLM/Portkey), an eval platform (Langfuse/Braintrust). <b>Build</b> only the thin integration + golden-path templates that encode ' +
      'their policy: the tenant router + cell layout, the eval-gate template, the RAG-ingestion service wired to their data governance, and the approval workflow on the ' +
      'registry alias. A bespoke PaaS would be a multi-year mistake.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Reading a request through the architecture.</b> ' +
      'A user question enters the <b>gateway</b> (auth, tenant → cell, quota check, route to model v-current). In the <b>cell</b>: <b>guardrails</b> scan the input; ' +
      '<b>retrieval</b> (tenant-scoped, hybrid + rerank) and the <b>feature store</b> supply context; <b>caches</b> are checked; the <b>serving</b> layer runs the model ' +
      '(batched, autoscaled); <b>guardrails</b> scan the output; the response streams back with cost + version metadata. Throughout, <b>observability</b> traces every ' +
      'span, meters cost, and feeds SLOs; the <b>registry</b> says which model + prompt version answered. Every box in the diagram did one job.</p></div>' +
      '<p><b>Draw your own version</b> and mark, per box: the tool, build/buy, the owning team (Ch 11), and the governance/security controls that apply. That annotated ' +
      'diagram is the platform RFC.</p>',
      try: [
        ['📖 Databricks — the big book of MLOps', 'https://www.databricks.com/resources/ebook/the-big-book-of-mlops', 'o'],
        ['🏗️ Part 6: the two end-to-end walkthroughs (feed, RAG)', '../learn6/#ch15', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>DESIGN CHECKS FOR THE WHOLE PLATFORM\n' +
      '  every request path   has auth, tenant scoping, quotas, guardrails, tracing, cost metering.\n' +
      '  every model           in the registry with a card, a tier, an owner, an eval gate, monitoring.\n' +
      '  every dataset/corpus   in the catalog with owner, classification, lineage, retention.\n' +
      '  every shared store     has the tenant dimension in its key/partition.\n' +
      '  blast radius           bounded by cells + shuffle sharding + cell-by-cell deploys + kill switches.\n' +
      '  rollback              one action per component (alias / revert / flag), tested.\n' +
      '  secrets               none in images; runtime-injected; rotatable without deploy.\n' +
      '  portability            standard API at the gateway; portable prompts + evals; an exit plan.\n' +
      '  observability          RED/USE + LLM signals + quality + safety + cost, on SLOs with burn alerts.\n' +
      '  governance             risk tiering, approval workflow, audit trail, human oversight for high-risk.\n' +
      'ANTI-PATTERN: BUILD A BESPOKE PaaS   Assemble standard components; build only the thin\n' +
      '  integration + golden paths that encode YOUR policy (Ch 1).</code></pre>' +
      '<p><b>The reference architecture is a coverage test.</b> Walk a request through it and a model through its lifecycle; if any box has no owner, no tool, or no ' +
      'control, that is the gap to close before scale exposes it.</p>',
      try: [
        ['📖 CNCF — Cloud Native AI white paper', 'https://www.cncf.io/reports/cloud-native-artificial-intelligence-whitepaper/', 'o'],
        ['🏢 Ch 16 — turn this into a readiness checklist', '#ch16', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Sketch the components of an enterprise AI platform.\n' +
      '   A: A model gateway (auth, routing, quotas/limits, fallback, metering, standard API) in front of a\n' +
      '   serving layer (runtimes, GPU pools, autoscaling, batching) and models; supported by retrieval (vector\n' +
      '   DB + rerank), a feature store, caches, and guardrails. Around it: a model+prompt registry, an eval\n' +
      '   platform, data/feature/RAG pipelines, observability (OTel), CI/CD (GitOps) + IaC, secrets\n' +
      '   management, and a tenant router into cells. Cross-cutting: governance, data governance, security,\n' +
      "   compliance, FinOps, responsible-AI systems, and the org design that owns it.\n\n" +
      'Q: Build vs buy?\n' +
      '   A: Buy/adopt the commodities (K8s + KServe, vector DB, OTel + Grafana, registry, Terraform, a model\n' +
      '   gateway, an eval platform). Build only the thin integration + golden-path templates that encode your\n' +
      '   policy (tenant/cell layout, eval-gate template, RAG-ingestion wired to data governance, approval\n' +
      '   workflow). A bespoke PaaS is almost always a mistake.\n\n' +
      'Q: How do you use the reference architecture in practice?\n' +
      '   A: As a coverage checklist. Walk a request through every box and a model through its lifecycle;\n' +
      '   wherever a box has no owner, no tool, or no control, that is a gap to close before scale exposes it.\n\n' +
      'Q: Name design checks that must hold platform-wide.\n' +
      '   A: Every request path has auth + tenant scoping + quotas + guardrails + tracing + cost metering;\n' +
      '   every model is registered with a card/tier/owner/eval-gate/monitoring; every shared store has the\n' +
      '   tenant dimension in its key; blast radius is bounded by cells; rollback is one tested action per\n' +
      "   component.\n\n" +
      'Q: Which published references does this resemble?\n' +
      '   A: Google Cloud MLOps, AWS ML Lens / SageMaker, Azure ML architecture, Databricks — the component\n' +
      '   list is stable across all of them; the tool and build/buy choices differ.</code></pre>' +
      '<p><b>↔ See also:</b> this chapter references nearly every chapter of Parts 6-9. Next: <a href="#ch16">Ch 16</a> turns it into a go-live readiness checklist.</p>',
      try: [
        ['📖 Google — Practitioners guide to MLOps (white paper)', 'https://services.google.com/fh/files/misc/practitioners_guide_to_mlops_whitepaper.pdf', 'o'],
        ['📖 ml-ops.org — the MLOps stack canvas', 'https://ml-ops.org/content/mlops-stack-canvas', 'o']
      ] }
  ],

  quiz: [
    { q: 'What is the best way to use an enterprise AI reference architecture?',
      opts: [
        'Copy another company\'s implementation exactly',
        'As a coverage checklist — walk a request through every component and a model through its lifecycle, and close any box that has no owner, no tool, or no control',
        'As a mandatory product specification',
        'Ignore it and build ad hoc'],
      ok: 1,
      why: 'The component list is stable across published references; the tool and build/buy choices are context-specific. The value is ensuring nothing is missing before scale exposes the gap.' },
    { q: 'For most of the boxes in the architecture (Kubernetes/KServe, vector DB, OTel + Grafana, registry, Terraform, model gateway, eval platform), what is the right build-vs-buy call?',
      opts: [
        'Build every component in-house for full control',
        'Buy/adopt the commodity components and build only the thin integration and golden-path templates that encode your organisation\'s policy',
        'Buy a single vendor\'s complete platform and never customise',
        'Build a bespoke internal PaaS from scratch'],
      ok: 1,
      why: 'The commodities are well-served by mature tools. The differentiated work is the integration and the golden paths that bake in your tenancy, governance, and eval policy — not reimplementing Kubernetes or Prometheus.' },
    { q: 'Which platform-wide design check is correct?',
      opts: [
        'Only the model needs an owner; shared stores do not need a tenant dimension',
        'Every request path has auth + tenant scoping + quotas + guardrails + tracing + cost metering; every model is registered with a card/tier/owner/eval-gate/monitoring; every shared store has the tenant dimension in its key; blast radius is bounded by cells; rollback is one tested action per component',
        'Secrets can live in images as long as the repo is private',
        'Observability is optional if the SLOs are documented'],
      ok: 1,
      why: 'These invariants — applied to every request and every model — are what make the platform safe to operate at scale; a box without an owner, tool, or control is the gap to fix first.' }
  ]
};
