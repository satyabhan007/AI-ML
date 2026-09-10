/* AI-ML Learn — Part 8 · Chapter 7: Online Quality & Eval-in-Prod */
window.CH[7] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Offline evals (Part 7 Ch 8) tell you a model is good <i>on the test set</i>. Production shows it real inputs the test set never had. ' +
      '<b>Eval-in-prod</b> is measuring answer quality on live traffic — continuously — so a regression is caught in hours, not from an angry customer next week.</p>' +
      '<pre><code>you cannot label every request, so:\n' +
      '  SAMPLE            grade a small % of live responses (LLM judge + human spot-check)\n' +
      '  FEEDBACK          collect explicit signals — thumbs, ratings, "regenerate", edits, escalations\n' +
      '  IMPLICIT          did the user act on it? copy it? retry? abandon? convert?\n' +
      '  → turn into a rate you can trend and alert on (a quality SLI, Ch 4)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A restaurant vs. its recipe test.</b> The test kitchen (offline eval) proves the dish works. ' +
      'But you still watch how many plates come back, read the reviews, and taste a few services a night — because real diners, real ingredients, and a tired line cook are not the test kitchen.</p></div>',
      try: [
        ['📗 Part 2: evals for LLM applications', '../learn2/#ch9', 'o'],
        ['🚀 Part 7: the offline eval gate this complements', '../learn7/#ch8', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>SIGNALS\n' +
      '  explicit feedback   thumbs up/down, 1-5, "report", "regenerate", accept/reject a suggestion.\n' +
      '                      Low volume, biased toward extremes — useful as a trend, not ground truth.\n' +
      '  implicit            copy, follow-through / task completion, dwell, edit distance on a draft,\n' +
      '                      escalation to a human, session abandonment, repeat question.\n' +
      '  automated judges    LLM-as-judge on sampled responses: helpfulness, correctness proxy,\n' +
      '                      groundedness/faithfulness (vs retrieved context), format/schema, tone,\n' +
      '                      refusal-appropriateness. Pinned judge model + rubric version.\n' +
      '  reference-free RAG   context precision/recall, answer-in-context, citation validity (Ragas-style).\n' +
      'SAMPLING            stratify by route/segment/model version so rare-but-important slices are covered.\n' +
      'HUMAN LOOP          a labelling queue reviews a sample + all judge-flagged + all user-reported;\n' +
      '                    used to calibrate the judge and to build next round\'s offline eval set.\n' +
      'QUALITY SLI          e.g. ">= 96% of sampled responses pass the groundedness bar over 7 days" +\n' +
      '                    an error budget (Ch 4). Trend per model version, per segment.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard toolchain: an <b>LLM-observability / eval platform</b> (<b>Langfuse</b>, <b>LangSmith</b>, ' +
      '<b>Arize Phoenix</b>, <b>Braintrust</b>, <b>Humanloop</b>) that samples production traces, runs <b>LLM-as-judge</b> + rule scorers, collects feedback, and feeds a ' +
      '<b>human review queue</b>; RAG metrics via <b>Ragas</b>. Online quality becomes a <b>quality SLI</b> (Ch 4) with burn-rate alerts (Ch 11). You assemble the loop; the methods are established.</p></div>',
      try: [
        ['📖 Ragas — reference-free RAG evaluation', 'https://docs.ragas.io/en/stable/concepts/metrics/', 'o'],
        ['📖 LangSmith — online evaluation & feedback', 'https://docs.smith.langchain.com/observability/how_to_guides/online_evaluations', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The regression thumbs-down would not have caught.</b> ' +
      'A prompt change ships. Thumbs-down rate is unchanged (most users never rate). But the <b>sampled LLM-judge groundedness score</b> drops from 94% to 81% within ' +
      'four hours, and the <b>human review queue</b> (which gets all judge-flagged responses) confirms the model started adding unsupported detail. The quality SLI burns ' +
      'its budget, a burn-rate alert fires, and the change is rolled back before most users notice. Sampled automated eval beat waiting for feedback.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Implicit signal reveals a silent win/loss.</b> ' +
      'A new model has slightly worse offline scores but ships in a canary. Explicit feedback is flat. The <b>implicit</b> metric — "task completed without escalation to ' +
      'a human agent" — is up 6% on the canary slice. The offline metric was not capturing what mattered (concise, actionable answers). The canary is promoted, and the ' +
      'offline eval set is updated with cases the model got right. Implicit behaviour is often the truest quality signal.</p></div>' +
      '<p><b>Feed it back:</b> production Q + retrieved context + response + label (judge + human) becomes the next offline eval set — closing the loop between prod and CI (Part 7 Ch 8).</p>',
      try: [
        ['📖 Chip Huyen — evaluation of LLM systems', 'https://huyenchip.com/2023/05/02/rlhf.html', 'o'],
        ['📡 Ch 4 — a quality SLI + error budget', '#ch4', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Rely on thumbs / ratings only          Very low volume + extreme bias. Use as a trend; add sampled\n' +
      '                                       LLM-judge scoring + implicit signals + a human queue.\n' +
      'Unpinned LLM judge                      Fix judge model + rubric version + temperature 0; re-baseline\n' +
      '                                       when you change it. A drifting judge = drifting metric.\n' +
      'Uniform random sampling                 Stratify by route/segment/model version so small critical\n' +
      '                                       slices are actually measured.\n' +
      'Judge scores never checked vs humans    Human-review a sample + all flagged; calibrate the judge;\n' +
      '                                       track judge-vs-human agreement.\n' +
      'Quality tracked as a chart, not an SLO   Make it a quality SLI with an error budget + burn-rate\n' +
      '                                       alert, so a regression triggers a response.\n' +
      'No per-version / per-segment cut         Break quality by model_version and segment; an aggregate can\n' +
      '                                       hide a broken cohort.\n' +
      'Prod labels not reused                  Feed labelled production data back into the offline eval set —\n' +
      "                                       it's the best source of hard cases.\n" +
      'Capturing raw responses without consent   Sample + redact; respect data-use policy (Part 9).</code></pre>' +
      '<p><b>Triangulate.</b> No single signal is trustworthy: explicit feedback is sparse and biased, LLM judges are noisy and can drift, implicit signals are ' +
      'confounded. Agreement across two or three of them is the real quality read.</p>',
      try: [
        ['📖 Braintrust — production monitoring & scoring', 'https://www.braintrust.dev/docs/guides/logging', 'o'],
        ['📕 Part 4: A/B testing & online metrics (confounders)', '../learn4/#ch11', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Why is an offline eval gate not enough, and what does eval-in-prod add?\n' +
      '   A: Production sees inputs the test set never had. Eval-in-prod continuously measures answer quality on\n' +
      '   live traffic — sampled LLM-judge scores + human spot-checks + explicit and implicit feedback — so a\n' +
      "   regression shows in hours as a quality-SLI burn, not from a customer complaint.\n\n" +
      'Q: Why not just use thumbs up/down?\n' +
      '   A: Very few users rate, and those who do skew to extremes. It is a useful trend but not ground truth;\n' +
      '   combine it with sampled automated scoring, implicit behaviour, and a human review queue.\n\n' +
      'Q: How do you keep an LLM-as-judge metric trustworthy?\n' +
      '   A: Pin the judge model + rubric version + temperature 0, stratify sampling, and regularly check\n' +
      '   judge-vs-human agreement on a reviewed sample. Re-baseline when the judge changes.\n\n' +
      'Q: A prompt change leaves thumbs-down flat but something is wrong. What catches it?\n' +
      '   A: The sampled groundedness/faithfulness score (judge + human-confirmed on flagged cases) dropping,\n' +
      '   burning the quality SLI and firing a burn-rate alert.\n\n' +
      'Q: What is an implicit quality signal, and why can it beat explicit feedback?\n' +
      '   A: Behaviour that reveals value without asking — task completion, no escalation, copy, low edit\n' +
      '   distance on a draft. It reflects what users actually got, and covers the silent majority.\n\n' +
      'Q: What do you do with labelled production data?\n' +
      '   A: Feed it back into the offline eval set — it is the richest source of realistic hard cases for the\n' +
      '   CI gate.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch4">Ch 4</a> (quality SLI), <a href="#ch9">Ch 9</a> (guardrail metrics), <a href="#ch8">Ch 8</a> (drift), <a href="#ch11">Ch 11</a> (alerting), ' +
      '<a href="../learn7/#ch8">Part 7 Ch 8</a> (offline gate), <a href="../learn2/#ch9">Part 2 Ch 9</a> (LLM evals).</p>',
      try: [
        ['📖 Humanloop — evaluation & monitoring in production', 'https://humanloop.com/docs/observability/overview', 'o'],
        ['📖 Arize Phoenix — online evals', 'https://docs.arize.com/phoenix/evaluation/llm-evals', 'o']
      ] }
  ],

  quiz: [
    { q: 'Why is an offline eval gate insufficient on its own, and what does eval-in-prod add?',
      opts: [
        'Offline evals are always wrong',
        'Production sees inputs the test set never had; eval-in-prod continuously scores live responses (sampled LLM-judge + human spot-checks + feedback) so regressions surface in hours',
        'It removes the need for offline evals',
        'It makes the model faster'],
      ok: 1,
      why: 'A frozen test set cannot anticipate real traffic. Measuring quality on sampled live responses turns "we think it is fine" into a trended, alertable SLI.' },
    { q: 'Why should you not rely on thumbs up/down as the primary quality metric?',
      opts: [
        'Users cannot be trusted at all',
        'Very few users rate, and those who do skew to extremes — it is a useful trend but must be triangulated with sampled automated scoring, implicit behaviour, and human review',
        'Thumbs data is illegal to collect',
        'It is too expensive to store'],
      ok: 1,
      why: 'Explicit feedback is sparse and biased. Combining it with LLM-judge sampling, implicit signals and a human queue gives a reliable read.' },
    { q: 'What keeps an LLM-as-judge online quality metric from silently drifting?',
      opts: [
        'Running it more often',
        'Pinning the judge model + rubric version + temperature 0, stratified sampling, and regularly checking judge-vs-human agreement on a reviewed sample',
        'Using a bigger judge model each week',
        'Only judging positive responses'],
      ok: 1,
      why: 'A judge whose model or prompt changes produces a moving metric. Version-pinning plus periodic human calibration keeps the score comparable over time.' }
  ]
};
