/* AI-ML Learn — Part 9 · Chapter 6: Compliance & Regulation */
window.CH[6] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>At enterprise scale, "can we ship this model?" is partly a legal question. A handful of frameworks now govern how AI systems must be built, documented, and ' +
      'monitored — and the obligations scale with how much the system can hurt someone.</p>' +
      '<pre><code>EU AI ACT        risk tiers: unacceptable (banned) · high-risk (heavy obligations) · limited\n' +
      '                (transparency: tell users it is AI) · minimal. Extra rules for general-purpose models.\n' +
      'NIST AI RMF     voluntary US framework: Govern · Map · Measure · Manage. A common backbone.\n' +
      'ISO/IEC 42001  a certifiable AI management system (like ISO 27001, but for AI governance).\n' +
      'SECTOR RULES    finance (SR 11-7 model risk), health (HIPAA, FDA SaMD), hiring (NYC Local Law 144),\n' +
      '                privacy (GDPR/CCPA — Ch 4), plus internal SOC 2 for the platform.</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Building codes by building type.</b> A garden shed needs almost nothing; a hospital needs fire ' +
      'suppression, accessibility, structural sign-off and inspections. AI regulation is graduated the same way — the shed model just needs a label; the "decides who ' +
      'gets a loan" model needs the full dossier.</p></div>',
      try: [
        ['📖 EU AI Act — official text & explorer', 'https://artificialintelligenceact.eu/', 'o'],
        ['🏢 Ch 3 — model governance is how you meet many of these', '#ch3', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>STEP 1 CLASSIFY   for each system: which regimes apply (jurisdiction, sector, use case)? what\n' +
      '                 risk tier (AI Act) / model tier (Ch 3)? Is it a "high-risk" use (credit,\n' +
      '                 employment, biometrics, essential services, safety components)?\n' +
      'STEP 2 MAP OBLIGATIONS   high-risk under the AI Act, for example, expects: a risk-management\n' +
      '                 system, data governance (Art.10), technical documentation, logging/traceability,\n' +
      '                 transparency to users, human oversight, accuracy/robustness/cybersecurity, a\n' +
      '                 quality-management system, and a conformity assessment.\n' +
      'STEP 3 IMPLEMENT AS CONTROLS   most obligations map to things earlier parts already build:\n' +
      '                 model cards + risk tiering (Ch 3), data catalog + lineage + retention (Ch 4),\n' +
      '                 security (Ch 5), monitoring + logging + drift + incident response (Part 8),\n' +
      '                 eval gates + change control (Part 7), human-in-the-loop (Ch 7).\n' +
      'STEP 4 EVIDENCE   keep an audit-ready trail: the inventory, the model cards, approval minutes,\n' +
      '                 eval results, monitoring dashboards, incident postmortems, access logs.\n' +
      'STEP 5 OPERATE   re-assess on material change; watch the regulatory landscape; a compliance owner.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The anchors: <b>EU AI Act</b>, <b>NIST AI RMF 1.0</b> (+ the Generative AI profile), <b>ISO/IEC 42001</b> ' +
      'and <b>ISO/IEC 23894</b> (AI risk), plus <b>SOC 2</b>, <b>GDPR/CCPA</b>, and sector regimes. Practically: a <b>GRC platform</b> or a control matrix mapping each ' +
      'obligation to an implemented control + evidence. Legal/compliance owns interpretation; engineering owns the controls. You do not invent the requirements — you map and evidence them.</p></div>',
      try: [
        ['📖 NIST — AI RMF & the Generative AI Profile', 'https://www.nist.gov/itl/ai-risk-management-framework', 'o'],
        ['📖 EU AI Act — high-risk requirements (Chapter III)', 'https://artificialintelligenceact.eu/chapter/3/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Classifying a system under the AI Act.</b> ' +
      'A company builds an assistant that screens job applications and ranks candidates. That is a <b>high-risk</b> use (employment). Obligations kick in: documented ' +
      'risk management, data governance for the training data (representativeness, bias examination — Art.10), technical documentation, event logging for traceability, ' +
      '<b>human oversight</b> (a recruiter must be able to review and override), accuracy/robustness testing with published metrics, and a conformity assessment. ' +
      'A generic chatbot on the same platform is <b>limited-risk</b> — it mostly needs to disclose that it is AI. Same platform, very different bars, decided by <i>use</i>.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The audit that went fine because evidence was a by-product.</b> ' +
      'An ISO 42001 / SOC 2 audit asks: show your model inventory, the risk assessment and approval for model X, its evaluation evidence, the monitoring in place, ' +
      'and the last incident review. Because the team generates model cards from training runs, records approvals as registry status transitions (Part 7 Ch 2), and ' +
      'keeps dashboards + postmortems (Part 8), the answer to each is a link, not a scramble. Compliance is cheap when the controls are the way you already work.</p></div>' +
      '<p><b>Map, don\'t duplicate:</b> build one control matrix — obligation → the control that satisfies it (usually already built) → where the evidence lives. ' +
      'One control often satisfies several regimes.</p>',
      try: [
        ['📖 EU AI Act — data & data governance (Article 10)', 'https://artificialintelligenceact.eu/article/10/', 'o'],
        ['📖 NYC — Local Law 144 (automated employment decision tools)', 'https://www.nyc.gov/site/dca/about/automated-employment-decision-tools.page', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'One compliance bar for all models      Classify per system (jurisdiction, sector, use, risk tier);\n' +
      '                                       obligations scale with potential harm.\n' +
      'Compliance as a separate paperwork      Map each obligation to an existing engineering control\n' +
      '  exercise                              (model card, lineage, monitoring, eval gate, human oversight).\n' +
      'Evidence assembled at audit time        Evidence is a by-product: generated model cards, recorded\n' +
      '                                       approvals, live dashboards, postmortems — linkable on demand.\n' +
      'Ship then classify                       Classify BEFORE build; high-risk obligations (human\n' +
      '                                       oversight, logging, documentation) shape the design.\n' +
      'Ignore transparency duties               Even limited-risk systems must disclose AI use / label\n' +
      '                                       synthetic content.\n' +
      'No human oversight for a high-risk use   Design a real review + override path a human actually uses;\n' +
      '                                       "a human is technically in the loop" is not enough.\n' +
      'One-time conformity, never revisited     Re-assess on material change (retrain, new use, drift);\n' +
      '                                       maintain the quality-management system.\n' +
      'Legal owns it alone / eng owns it alone   Legal interprets, engineering implements + evidences,\n' +
      '                                       reviewed together (Ch 11).</code></pre>' +
      '<p><b>The reframe:</b> most of what regulation asks for — know your models, govern your data, test for accuracy and bias, log and monitor, keep a human able to ' +
      'intervene, document it — is <i>good engineering you should do anyway</i>. Compliance mostly makes it mandatory and auditable.</p>',
      try: [
        ['📖 ISO/IEC 42001 — AI management system (overview)', 'https://www.iso.org/standard/81230.html', 'o'],
        ['📖 AICPA — SOC 2 trust services criteria', 'https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: How does the EU AI Act structure obligations?\n' +
      '   A: By risk: unacceptable uses are banned; high-risk uses (credit, employment, biometrics, essential\n' +
      '   services, safety components) carry heavy obligations — risk management, data governance,\n' +
      '   documentation, logging, transparency, human oversight, accuracy/robustness/security, a QMS, and a\n' +
      "   conformity assessment; limited-risk needs transparency (tell users it's AI); minimal needs little.\n\n" +
      'Q: Same platform hosts a CV-screening assistant and a generic chatbot. Different obligations?\n' +
      '   A: Yes — CV screening is a high-risk employment use with the full obligation set including human\n' +
      '   oversight and bias examination; the chatbot is limited-risk and mainly needs to disclose it is AI.\n' +
      '   Risk is decided by the use, not the tech.\n\n' +
      'Q: How do you implement compliance without a parallel paperwork exercise?\n' +
      '   A: A control matrix mapping each obligation to an existing engineering control — model cards + risk\n' +
      '   tiering (Ch 3), data catalog + lineage + retention (Ch 4), security (Ch 5), monitoring + logging +\n' +
      '   incident response (Part 8), eval gates + change control (Part 7), human-in-the-loop (Ch 7) — plus\n' +
      '   where the evidence lives.\n\n' +
      'Q: What makes an audit cheap?\n' +
      '   A: Evidence being a by-product of how you work: generated model cards, approvals as registry status\n' +
      '   transitions, live dashboards, postmortems — every audit question answered with a link.\n\n' +
      'Q: Which frameworks would you cite as the backbone?\n' +
      '   A: NIST AI RMF (Govern/Map/Measure/Manage), ISO/IEC 42001 (certifiable AI management system), the\n' +
      '   EU AI Act for legal obligations, plus SOC 2, GDPR/CCPA, and sector rules (SR 11-7, HIPAA, LL144).\n\n' +
      'Q: Who owns compliance?\n' +
      '   A: Shared — legal/compliance interprets the requirements, engineering implements and evidences the\n' +
      '   controls, reviewed jointly; a named compliance owner tracks the landscape.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3</a> (governance), <a href="#ch4">Ch 4</a> (data), <a href="#ch5">Ch 5</a> (security), <a href="#ch7">Ch 7</a> (responsible AI / human oversight), ' +
      '<a href="../learn7/#ch8">Part 7 Ch 8</a> (eval evidence), <a href="../learn8/#ch16">Part 8 Ch 16</a> (incident records).</p>',
      try: [
        ['📖 EU AI Act — timeline & obligations by role', 'https://artificialintelligenceact.eu/implementation-timeline/', 'o'],
        ['📖 OECD.AI — national AI policies & regulation tracker', 'https://oecd.ai/en/dashboards', 'o']
      ] }
  ],

  quiz: [
    { q: 'How does the EU AI Act decide how much regulation applies to a given AI system?',
      opts: [
        'By the size of the model in parameters',
        'By the risk of its use — unacceptable uses are banned, high-risk uses (credit, employment, biometrics, essential services) carry heavy obligations, limited-risk needs transparency, minimal-risk needs little',
        'By which cloud provider hosts it',
        'By the programming language used'],
      ok: 1,
      why: 'Obligations scale with potential harm from the use case, not the technology. The same model can be high-risk in one application and minimal-risk in another.' },
    { q: 'What is the efficient way to implement AI compliance obligations?',
      opts: [
        'Run a separate documentation project disconnected from engineering',
        'Build a control matrix mapping each obligation to an existing engineering control (model cards, lineage, monitoring, eval gates, human-in-the-loop) and record where the evidence lives',
        'Wait until an auditor asks',
        'Assume compliance is legal\'s problem only'],
      ok: 1,
      why: 'Most obligations correspond to good engineering practices already built in earlier parts. Mapping and evidencing them — rather than duplicating them as paperwork — keeps compliance cheap.' },
    { q: 'A platform hosts both a CV-screening assistant and a generic customer chatbot. What follows for compliance?',
      opts: [
        'Both need the same minimal transparency notice',
        'The CV-screening use is high-risk (employment) with the full obligation set including human oversight and bias examination; the chatbot is limited-risk and mainly needs to disclose it is AI',
        'Neither is regulated because they share a platform',
        'Both are banned'],
      ok: 1,
      why: 'Risk classification is per use case. A high-risk application carries heavy obligations even if it runs on the same infrastructure as a low-risk one.' }
  ]
};
