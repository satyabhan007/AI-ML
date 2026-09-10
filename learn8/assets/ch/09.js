/* AI-ML Learn — Part 8 · Chapter 9: Guardrail & Safety Metrics */
window.CH[9] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>A guardrail is a check around the model — on the input (block prompt injection, PII, disallowed requests) and the output (block toxicity, PII leaks, ' +
      'policy violations, unsupported claims). Guardrails that you cannot <b>measure</b> are guardrails you cannot trust: you do not know if they are firing too much, ' +
      'too little, or being bypassed.</p>' +
      '<pre><code>track over time, as rates:\n' +
      '  refusal rate            how often the system declines — rising = over-blocking or attack surge\n' +
      '  jailbreak / injection hits   detected attempts, and detected SUCCESSES\n' +
      '  PII in output           responses that leaked personal data before/after scrubbing\n' +
      '  toxicity / policy blocks    outputs the output filter caught\n' +
      '  hallucination proxy      responses failing a groundedness/citation check (Ch 7)\n' +
      '  guardrail latency/cost   the filter is in the request path</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A metal detector at an entrance.</b> You need to know how often it beeps (refusal rate), how many real ' +
      'weapons it caught vs missed (true/false negatives), and how many harmless keys it flagged (false positives). A detector nobody audits is security theatre.</p></div>',
      try: [
        ['📖 OWASP — Top 10 for LLM Applications', 'https://genai.owasp.org/llm-top-10/', 'o'],
        ['📗 Part 2: guardrails for LLM apps', '../learn2/#ch10', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>INPUT-SIDE METRICS\n' +
      '  prompt-injection detections (rate), by pattern/class; % blocked vs allowed-through.\n' +
      '  disallowed-intent requests (rate); PII-in-prompt detections; oversized/anomalous prompts.\n' +
      'OUTPUT-SIDE METRICS\n' +
      '  toxicity / self-harm / violence classifier hits (rate + score distribution).\n' +
      '  PII leak rate: entities detected in the RAW model output (pre-scrub) and post-scrub (should be ~0).\n' +
      '  policy / brand / competitor-mention violations caught.\n' +
      '  groundedness failures (unsupported-claim rate) — the practical hallucination proxy.\n' +
      '  citation validity: % of cited spans that actually support the claim.\n' +
      'EFFECTIVENESS\n' +
      '  false-positive rate (blocked a benign request) — from human review of a sample of blocks.\n' +
      '  bypass / escape rate — from red-team probes + reported incidents.\n' +
      '  time-to-detect a new jailbreak family.\n' +
      'SLO           e.g. "PII-in-output post-scrub = 0", "successful-jailbreak rate < X" with a tight budget.\n' +
      'BREAKDOWN     by model version, tenant, locale, feature, and prompt version.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>Frameworks: <b>OWASP LLM Top 10</b>, <b>NIST AI RMF</b>, <b>MITRE ATLAS</b> (adversarial ML). ' +
      'Guardrail toolkits: <b>NVIDIA NeMo Guardrails</b>, <b>Guardrails AI</b>, <b>Llama Guard / Prompt Guard</b>, <b>Azure AI Content Safety</b>, <b>OpenAI moderation</b>, ' +
      '<b>Presidio</b> (PII). These emit the metrics above; you turn them into rates, SLIs, and red-team coverage. You measure and tune; the detectors are off the shelf.</p></div>',
      try: [
        ['📖 NVIDIA — NeMo Guardrails', 'https://docs.nvidia.com/nemo/guardrails/', 'o'],
        ['📖 Microsoft Presidio — PII detection & anonymization', 'https://microsoft.github.io/presidio/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Refusal rate spikes — which kind?</b> ' +
      'The refusal rate jumps from 2% to 11% overnight. Two very different causes: (a) a prompt/model change made the system over-cautious (a <b>quality</b> problem — ' +
      'legitimate users blocked), or (b) a coordinated <b>jailbreak campaign</b> is hitting the input filter (working as intended). The metric alone is ambiguous; ' +
      'breaking refusal rate down by <b>reason code</b>, <b>tenant</b>, and <b>injection-pattern match</b> disambiguates it in one dashboard — and the response is opposite in each case.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The leak the output looked clean for.</b> ' +
      'Post-scrub PII-in-output is 0 on the dashboard — good. But <b>pre-scrub</b> PII detections are climbing: the model itself is increasingly emitting personal data ' +
      'from its context, and the scrubber is the only thing saving you. That is fragile. Measuring <i>both</i> pre- and post-scrub reveals the model behaviour change ' +
      'early; the fix is upstream (context minimisation, prompt) not a better scrubber.</p></div>' +
      '<p><b>Red-team continuously:</b> a standing suite of jailbreak/injection/PII probes runs against production (or a shadow) on a schedule; its <b>bypass rate</b> and ' +
      '<b>time-to-detect a new family</b> are the real measures of guardrail health — user-visible metrics only show what already got through.</p>',
      try: [
        ['📖 MITRE ATLAS — adversarial threat landscape for AI', 'https://atlas.mitre.org/', 'o'],
        ['🏢 Part 9: security for AI systems (threat model)', '../learn9/#ch5', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Guardrails on, never measured           Emit every check as a rate + score; build a safety dashboard;\n' +
      '                                       set SLOs (PII post-scrub = 0, jailbreak-success < X).\n' +
      'Refusal rate as one number              Break down by reason code, tenant, locale, prompt/model\n' +
      '                                       version, injection-pattern match — the causes are opposite.\n' +
      'Only post-filter metrics                Measure pre-filter too (raw model output): a rising pre-scrub\n' +
      '                                       leak rate is a model regression the filter is masking.\n' +
      'No false-positive tracking              Human-review a sample of blocks; over-blocking is a real\n' +
      '                                       quality + trust cost.\n' +
      'Bypass rate unknown                     Standing red-team probe suite in prod/shadow on a schedule;\n' +
      '                                       track bypass rate + time-to-detect new families.\n' +
      'Toxicity as pass/fail only              Track the score distribution; a shift toward the threshold\n' +
      '                                       predicts future breaches.\n' +
      'Guardrail latency ignored               It is in the request path — budget and monitor it (Ch 3).\n' +
      'No per-version cut                       A prompt/model change can move safety metrics sharply; gate\n' +
      '                                       releases on them (Part 7 Ch 8) and watch them per version.</code></pre>' +
      '<p><b>Safety metrics are quality metrics with teeth:</b> wire the critical ones (PII leak post-scrub, successful jailbreak, policy violation) as SLOs with tight ' +
      'error budgets and burn-rate alerts (Ch 4, Ch 11), so a regression triggers the same rollback discipline as an outage.</p>',
      try: [
        ['📖 NIST — AI Risk Management Framework', 'https://www.nist.gov/itl/ai-risk-management-framework', 'o'],
        ['📡 Ch 7 — groundedness as the hallucination proxy', '#ch7', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What guardrail metrics do you put on a safety dashboard?\n' +
      '   A: Refusal rate (by reason), prompt-injection/jailbreak detections and successes, PII-in-output pre-\n' +
      '   and post-scrub, toxicity/policy blocks (rate + score distribution), groundedness-failure rate,\n' +
      '   citation validity, guardrail latency/cost — all broken down by model/prompt version, tenant, locale.\n\n' +
      'Q: Refusal rate jumps from 2% to 11%. What do you check and why is the number ambiguous?\n' +
      '   A: It could be over-blocking from a prompt/model change (legit users harmed) or a jailbreak campaign\n' +
      '   (filter working). Break refusal rate down by reason code, tenant, and injection-pattern match — the\n' +
      '   correct response is opposite in each case.\n\n' +
      'Q: Post-scrub PII-in-output is zero. Why still measure pre-scrub?\n' +
      '   A: A rising pre-scrub leak rate means the model itself is emitting more PII and the scrubber is the\n' +
      '   only safety net — fragile. Pre-scrub metrics catch the model-behaviour regression early; the fix is\n' +
      '   upstream.\n\n' +
      'Q: How do you actually measure guardrail effectiveness, not just what got through?\n' +
      '   A: A standing red-team probe suite (jailbreak/injection/PII) run against prod or a shadow on a\n' +
      '   schedule, tracking bypass rate and time-to-detect new attack families.\n\n' +
      'Q: Why track the toxicity score distribution, not just the block count?\n' +
      '   A: A distribution shifting toward the threshold predicts future breaches and shows the model getting\n' +
      '   riskier before any single output crosses the line.\n\n' +
      'Q: How should the critical safety metrics be governed?\n' +
      '   A: As SLOs with tight error budgets and burn-rate alerts (PII post-scrub = 0, successful-jailbreak\n' +
      '   rate < X), and as release gates — so a regression triggers rollback like an outage.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch7">Ch 7</a> (groundedness / quality), <a href="#ch4">Ch 4</a> (safety SLOs), <a href="#ch11">Ch 11</a> (alerting), ' +
      '<a href="../learn7/#ch8">Part 7 Ch 8</a> (safety in the eval gate), <a href="../learn9/#ch5">Part 9 Ch 5</a> (AI security), <a href="../learn9/#ch7">Part 9 Ch 7</a> (responsible AI).</p>',
      try: [
        ['📖 Meta — Llama Guard & Prompt Guard', 'https://www.llama.com/docs/model-cards-and-prompt-formats/llama-guard-4/', 'o'],
        ['📖 Azure AI Content Safety', 'https://learn.microsoft.com/en-us/azure/ai-services/content-safety/overview', 'o']
      ] }
  ],

  quiz: [
    { q: 'The system-wide refusal rate jumps from 2% to 11% overnight. Why is that number alone not actionable?',
      opts: [
        'Refusal rate is never useful',
        'It could mean over-blocking from a prompt/model change (legitimate users harmed) OR a jailbreak campaign (filter working) — you must break it down by reason code, tenant, and injection-pattern match',
        'It always means an attack',
        'It always means the model got worse'],
      ok: 1,
      why: 'The two causes demand opposite responses (roll back the over-cautious change vs. tighten defenses). Only a breakdown disambiguates them.' },
    { q: 'Post-scrub PII-in-output is zero. Why still measure PII in the raw (pre-scrub) model output?',
      opts: [
        'It is required by the linter',
        'A rising pre-scrub leak rate means the model itself is emitting more PII and the scrubber is the sole safety net — a fragile state that the post-scrub metric hides',
        'Pre-scrub metrics are always zero too',
        'To make the dashboard look busier'],
      ok: 1,
      why: 'Measuring both layers separates "the filter is holding" from "the model regressed and we are one filter bug from a breach". The fix for the latter is upstream.' },
    { q: 'What is the best way to measure guardrail effectiveness (not just what slipped through to users)?',
      opts: [
        'Count user complaints',
        'A standing red-team probe suite (jailbreak/injection/PII) run against production or a shadow on a schedule, tracking bypass rate and time-to-detect new attack families',
        'Increase the refusal threshold',
        'Turn guardrails off and see what happens'],
      ok: 1,
      why: 'User-visible metrics only show failures that already escaped. Continuous adversarial probing measures the defenses directly and catches new bypass techniques early.' }
  ]
};
