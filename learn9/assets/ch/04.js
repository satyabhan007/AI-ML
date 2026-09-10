/* AI-ML Learn — Part 9 · Chapter 4: Data Governance */
window.CH[4] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Models are made of data. At enterprise scale you have to be able to answer, for any dataset feeding any model: <b>where did it come from, what is in it, ' +
      'who is allowed to use it, and how long can we keep it?</b> If you cannot, you cannot pass an audit, respond to a deletion request, or trust a model\'s inputs.</p>' +
      '<pre><code>LINEAGE     raw source → transforms → feature → training set → model → prediction  (the full chain)\n' +
      'CATALOG     a searchable inventory of datasets: owner, schema, description, classification, freshness\n' +
      'CLASSIFICATION   is this PII? special-category? confidential? public? → drives access + handling\n' +
      'ACCESS      who/what can read each dataset — least privilege, RBAC/ABAC, audited\n' +
      'RETENTION   how long you keep it, and the deletion path (right to erasure, contractual limits)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A library with a provenance record for every book.</b> Not just "we have this book" but where it was ' +
      'printed, whether it is restricted, who has borrowed it, and when it must be returned or pulped. Data governance is that catalogue for every dataset.</p></div>',
      try: [
        ['📖 DAMA — Data Management Body of Knowledge (DMBOK) overview', 'https://www.dama.org/cpages/body-of-knowledge', 'o'],
        ['🏢 Ch 3 — model governance depends on this', '#ch3', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>CATALOG & DISCOVERY   central metadata store; every dataset has an owner, description, schema,\n' +
      '                     tags, classification, freshness, and a link to its lineage.\n' +
      'LINEAGE               automatically captured from pipelines (Part 6 Ch 6) — column-level where\n' +
      '                     possible — so "which models used table X" and "what feeds feature Y" are queries.\n' +
      'CLASSIFICATION        PII / PHI / PCI / special-category / confidential / internal / public. Auto-\n' +
      '                     detect (Presidio, DLP) + human confirm. Propagate the tag down the lineage.\n' +
      'ACCESS CONTROL        RBAC (role → dataset) and/or ABAC (attributes: purpose, region, sensitivity);\n' +
      '                     purpose-binding ("this data may be used for fraud modelling, not marketing");\n' +
      '                     every grant + access logged.\n' +
      'RETENTION & DELETION  per-dataset retention policy; a working erasure path (find every copy incl.\n' +
      '                     backups, features, embeddings, caches, training snapshots).\n' +
      'MINIMISATION & MASKING  collect only what is needed; pseudonymise / tokenise / mask PII in\n' +
      '                     non-production and wherever the raw value is not required.\n' +
      'CONSENT & PURPOSE     record the lawful basis / consent for personal data and enforce that the\n' +
      '                     use matches it.\n' +
      'QUALITY               governance overlaps data quality (Part 6 Ch 6, Part 8 Ch 8) — same catalog.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>Standards & tools: <b>DAMA-DMBOK</b> and the <b>DCAM</b> framework; catalogs (<b>DataHub</b>, <b>OpenMetadata</b>, ' +
      '<b>Amundsen</b>, <b>Collibra</b>, <b>Unity Catalog</b>, <b>Purview</b>); lineage via <b>OpenLineage</b>; access via <b>RBAC/ABAC</b> + policy engines (<b>OPA</b>, ' +
      '<b>Immuta</b>, lake permissions); PII detection via <b>Presidio</b> / cloud DLP. Regulations (GDPR, CCPA, HIPAA) set the retention/erasure/purpose requirements (Ch 6). You operate the catalog; the model is standard data management.</p></div>',
      try: [
        ['📖 OpenMetadata — data catalog & governance', 'https://docs.open-metadata.org/', 'o'],
        ['📖 OpenLineage — lineage standard', 'https://openlineage.io/docs/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The erasure request that could not be honoured.</b> ' +
      'A customer invokes their right to deletion. Their rows are removed from the primary DB — but their data also lives in: a training snapshot from March, engineered ' +
      'features in the feature store, an embedding in the vector index, six weeks of logs, and a semantic cache. Without <b>lineage</b> and a <b>catalog of copies</b>, ' +
      'the team cannot even enumerate them. Fix: lineage from raw → every derived artefact, a per-dataset retention + erasure runbook, and (where feasible) not training ' +
      'on raw PII in the first place (minimisation, tokenisation).</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Purpose violation via a shared feature.</b> ' +
      'A feature built from data collected for fraud detection gets reused by a marketing model because it is "just a feature in the store". That may breach the consent ' +
      'basis. Fix: <b>purpose-binding</b> tags on datasets/features enforced by the access-control policy (ABAC), so a model tagged <code>purpose=marketing</code> cannot ' +
      'read a feature tagged <code>purpose=fraud-only</code> — and the attempt is logged and blocked.</p></div>' +
      '<p><b>Propagate classification down the lineage:</b> if a source is tagged PII, every feature, embedding, and cache derived from it inherits handling rules ' +
      'automatically — you do not re-classify each derivative by hand.</p>',
      try: [
        ['📖 GDPR — right to erasure (Article 17)', 'https://gdpr-info.eu/art-17-gdpr/', 'o'],
        ['🏗️ Part 6: feature stores, lineage & pipelines', '../learn6/#ch6', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'No data catalog                        A catalog with owner/schema/classification/freshness/lineage\n' +
      '                                       per dataset. You cannot govern an inventory you do not have.\n' +
      'Lineage stops at the training set       Extend it to features, embeddings, caches, snapshots, logs,\n' +
      '                                       and the models + predictions — that is where erasure and impact\n' +
      '                                       analysis need it.\n' +
      'Classify sources by hand, once          Auto-detect + confirm, and PROPAGATE the tag down the lineage\n' +
      '                                       to every derivative.\n' +
      'RBAC only, no purpose                   Add purpose-binding (ABAC): data collected for X cannot be used\n' +
      '                                       for Y; enforced + logged.\n' +
      'Train on raw PII                        Minimise, tokenise, pseudonymise; keep raw PII out of training\n' +
      '                                       sets and non-prod where possible.\n' +
      'No erasure runbook                      A tested path to find and delete a subject\'s data across every\n' +
      '                                       copy, including backups within policy.\n' +
      'Access grants not logged                Every grant + every access audited; periodic access reviews.\n' +
      'Governance owned by no one              A data-owner per domain + a governance function; it is a\n' +
      '                                       standing role, not a project.</code></pre>' +
      '<p><b>Data governance is the substrate for model governance (Ch 3) and compliance (Ch 6):</b> a model card\'s "training data summary", an AI-Act data-quality ' +
      'obligation, and a deletion request all resolve to "query the catalog and the lineage". Build that once.</p>',
      try: [
        ['📖 EU AI Act — data & data governance (Article 10)', 'https://artificialintelligenceact.eu/article/10/', 'o'],
        ['🏢 Ch 6 — compliance obligations that consume this', '#ch6', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What must you be able to answer about any dataset feeding a model?\n' +
      '   A: Where it came from (lineage), what is in it (schema + classification), who may use it and for\n' +
      '   what purpose (access + purpose-binding), and how long you keep it plus the deletion path (retention).\n\n' +
      'Q: A customer requests erasure. Why is deleting their DB rows not enough?\n' +
      '   A: Their data also lives in training snapshots, engineered features, embeddings, logs and caches.\n' +
      '   Without lineage and a catalog of copies you cannot even enumerate them. The fix is lineage to every\n' +
      '   derivative, a tested erasure runbook, and minimising raw PII upstream.\n\n' +
      'Q: A feature built for fraud detection gets reused by a marketing model. What control prevents this?\n' +
      '   A: Purpose-binding (ABAC): datasets/features carry a purpose tag, and the access policy blocks a\n' +
      '   model tagged for a different purpose from reading it — with the attempt logged.\n\n' +
      'Q: How do you keep classification manageable across thousands of derived datasets?\n' +
      '   A: Auto-detect and confirm on sources, then propagate the tag down the lineage so every feature,\n' +
      '   embedding and cache inherits handling rules automatically.\n\n' +
      'Q: How does data governance relate to model governance and compliance?\n' +
      "   A: It's the substrate. A model card's data summary, an AI-Act data-quality obligation, and a\n" +
      '   deletion request all resolve to queries over the catalog and lineage.\n\n' +
      'Q: RBAC vs ABAC for data access?\n' +
      '   A: RBAC maps roles to datasets — simple, coarse. ABAC decides from attributes (purpose, region,\n' +
      '   sensitivity, clearance) — needed for purpose-binding, data-residency, and fine-grained control.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3</a> (model governance), <a href="#ch6">Ch 6</a> (compliance), <a href="#ch5">Ch 5</a> (security), <a href="#ch7">Ch 7</a> (fairness needs labelled attributes), ' +
      '<a href="../learn6/#ch6">Part 6 Ch 6</a> (pipelines &amp; lineage), <a href="../learn8/#ch8">Part 8 Ch 8</a> (data quality).</p>',
      try: [
        ['📖 LinkedIn DataHub — metadata & lineage platform', 'https://datahubproject.io/docs/', 'o'],
        ['📖 NIST Privacy Framework', 'https://www.nist.gov/privacy-framework', 'o']
      ] }
  ],

  quiz: [
    { q: 'A customer invokes their right to erasure. Why is deleting their rows from the primary database insufficient?',
      opts: [
        'Databases cannot delete rows',
        'Their data also persists in training snapshots, engineered features, embeddings, logs and caches — without lineage and a catalog of copies you cannot even enumerate them',
        'Erasure requests do not apply to ML systems',
        'The model already forgot them'],
      ok: 1,
      why: 'Personal data propagates into many derived artefacts. Honouring erasure requires lineage to every copy, a tested runbook, and minimising raw PII upstream.' },
    { q: 'A feature built from fraud-detection data is reused by a marketing model. Which control prevents this?',
      opts: [
        'A faster feature store',
        'Purpose-binding via ABAC — datasets/features carry a purpose tag and the access policy blocks a model tagged for a different purpose from reading it, with the attempt logged',
        'Encrypting the feature',
        'Renaming the feature'],
      ok: 1,
      why: 'Consent/lawful basis is tied to purpose. Attribute-based access control can enforce that data collected for one purpose is not used for another.' },
    { q: 'How do you keep data classification manageable across thousands of derived datasets?',
      opts: [
        'Classify every dataset manually every quarter',
        'Auto-detect and confirm classification on sources, then propagate the tag down the lineage so every feature, embedding and cache inherits the handling rules',
        'Only classify the final training set',
        'Assume everything is public'],
      ok: 1,
      why: 'Manual re-classification of every derivative does not scale. Tag the source and let lineage carry the classification (and its handling rules) to all downstream artefacts.' }
  ]
};
