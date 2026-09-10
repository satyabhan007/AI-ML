/* AI-ML Learn — Part 7 · Chapter 8: Eval-in-CI Release Gates */
window.CH[8] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Code has tests that go red when it breaks. A model change needs the same thing for <i>behaviour</i>: an automated check that says "this new model / prompt / ' +
      'retrieval config is not worse than what we run today" and <b>blocks the release</b> if it is.</p>' +
      '<pre><code>candidate model/prompt  →  run the eval suite on a frozen test set\n' +
      '                        →  compare each metric to the baseline (current prod)\n' +
      '                        →  PASS (within tolerance)  → allowed to promote\n' +
      '                           FAIL (a metric regressed) → release blocked, PR annotated</code></pre>' +
      '<p>Without a gate, quality regressions ship silently and you learn about them from users days later. The gate turns "we think it is fine" into "the numbers say so".</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A driving test before a licence renewal.</b> You do not get to keep driving just because you drove yesterday — ' +
      'you re-take the test on a fixed course. Pass and you are relicensed (promoted); fail and you are off the road until you fix it.</p></div>',
      try: [
        ['📖 OpenAI — Evals (framework & concepts)', 'https://github.com/openai/evals', 'o'],
        ['🚀 Ch 3 — CI for ML (where the gate lives)', '#ch3', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>THE EVAL SET     frozen, versioned, representative; includes hard cases, slices (language,\n' +
      '                segment, rare category), adversarial/red-team items, and a held-out slice the\n' +
      '                model authors never see. Reviewed like code; refreshed with a changelog.\n' +
      'METRICS         task metrics (exact match, F1, NDCG, BLEU/ROUGE where valid) +\n' +
      '                LLM-as-judge scores (faithfulness, helpfulness, format) + rule checks\n' +
      '                (schema valid, no PII, refuses when it should) + latency/cost.\n' +
      'BASELINE        compare to the CURRENT production model, not just an absolute floor.\n' +
      'THRESHOLDS      per metric; set from measured run-to-run variance (e.g. must not drop > 3σ /\n' +
      '                > x%). Separate "block" from "warn".\n' +
      'PAIRWISE        for generative tasks, judge candidate vs prod side-by-side (win/lose/tie) —\n' +
      '                more stable than absolute scoring.\n' +
      'FLAKE CONTROL   seed everything; fixed decoding params; N samples + confidence interval;\n' +
      '                re-run judges with a fixed judge model + prompt version.\n' +
      'GATE PLACEMENT  on merge to main / on the release PR / before the model alias flips to\n' +
      '                @production. Fast subset on the PR; full suite on the release.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard tooling: an eval framework — <b>OpenAI Evals</b>, <b>promptfoo</b>, <b>DeepEval</b>, ' +
      '<b>Ragas</b> (RAG), <b>lm-evaluation-harness</b> (benchmarks), or a hosted eval platform (<b>LangSmith</b>, <b>Braintrust</b>, <b>Humanloop</b>) — run as a ' +
      'CI job that fails non-zero on regression. <b>LLM-as-judge</b> with a pinned judge model + rubric, and <b>pairwise comparison</b>, are standard techniques. ' +
      'You assemble a suite; the methods are established.</p></div>',
      try: [
        ['📖 promptfoo — testing & eval for LLM apps', 'https://www.promptfoo.dev/docs/intro/', 'o'],
        ['📗 Part 2: evals, LLM-as-judge & guardrails', '../learn2/#ch9', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The gate that catches a prompt regression.</b> ' +
      'An engineer trims the system prompt to save tokens. Aggregate helpfulness is unchanged, so a naive gate passes — but the suite has a <b>slice</b> of ' +
      '"must refuse" safety prompts, and refusal-correctness drops from 98% to 76% because the trimmed prompt lost a guardrail sentence. The gate <b>blocks the PR</b> ' +
      'and links the failing cases. Cost saving deferred until the prompt is fixed. The slice, not the average, saved the release.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The flaky LLM-judge gate.</b> ' +
      'A gate uses an LLM judge with temperature 0.7 and a single sample; scores swing ±6 points run to run, so it blocks good PRs and passes bad ones. ' +
      'Fixes: pin the judge model + judge-prompt version, set temperature 0, take <b>N=5 samples</b> and use the mean with a confidence interval, switch to ' +
      '<b>pairwise</b> (candidate vs prod) judging, and set the block threshold outside the measured noise band. The gate becomes something people trust and enforce.</p></div>' +
      '<p><b>Keep humans in the loop for calibration:</b> periodically sample gate decisions for human review to confirm the judge and thresholds still track real quality — ' +
      'an eval suite drifts from reality if never audited.</p>',
      try: [
        ['📖 Ragas — evaluating RAG in CI', 'https://docs.ragas.io/en/stable/', 'o'],
        ['📡 Part 8: eval-in-prod feeding the eval set', '../learn8/#ch7', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Aggregate metric only                  Gate on slices/capabilities + safety/refusal + format checks.\n' +
      '                                       An average hides a broken slice.\n' +
      'Absolute threshold, no baseline         Compare to the current prod model; "not worse than today" is\n' +
      '                                       the real bar and it moves.\n' +
      'LLM judge: 1 sample, temp > 0           Pin judge model + prompt version, temp 0, N samples + CI,\n' +
      '                                       prefer pairwise. Threshold outside the noise band.\n' +
      'Eval set the authors can see fully      Keep a held-out slice hidden; refresh with a changelog so a\n' +
      '                                       score gain is not just an easier test.\n' +
      'Gate is slow → run it rarely            Fast subset on the PR, full suite on the release. Cache judge\n' +
      '                                       calls on unchanged items.\n' +
      '"skip eval" is routine                  Emergency-only, needs approval, is logged. Routine bypass = the\n' +
      '                                       gate is broken; fix it.\n' +
      'Never audited against humans             Periodically human-review a sample of gate decisions to keep\n' +
      '                                       the judge + thresholds calibrated.\n' +
      'Only quality, not latency/cost           Gate on p99 latency and cost/req too — a "better" model that\n' +
      '                                       is 2x slower or pricier may still fail the release.</code></pre>' +
      '<p><b>The gate is a contract, not a suggestion.</b> Wire it as a required status check on the release PR / a policy on the <code>@production</code> alias flip (Ch 2), ' +
      'so a regressed model physically cannot become production without a logged override.</p>',
      try: [
        ['📖 Anthropic — building evals & test suites', 'https://docs.anthropic.com/en/docs/test-and-evaluate/develop-tests', 'o'],
        ['📖 lm-evaluation-harness (EleutherAI)', 'https://github.com/EleutherAI/lm-evaluation-harness', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What is an eval-in-CI release gate and where does it sit?\n' +
      '   A: An automated job that runs an eval suite on a frozen test set, compares each metric to the current\n' +
      '   production baseline, and fails the release (blocks the alias flip / release PR) if a metric regresses\n' +
      '   beyond tolerance. Fast subset on the PR; full suite on the release.\n\n' +
      'Q: Why compare to the current prod model rather than an absolute threshold?\n' +
      '   A: The real question is "is this not worse than what we serve today". Absolute floors drift and let\n' +
      '   regressions through if they clear the bar.\n\n' +
      'Q: An LLM-as-judge gate is flaky. How do you stabilise it?\n' +
      '   A: Pin the judge model and judge-prompt version, decode at temperature 0, take N samples and use the\n' +
      '   mean with a confidence interval, prefer pairwise (candidate vs prod) judging, and set the block\n' +
      '   threshold outside the measured noise band.\n\n' +
      'Q: Aggregate quality is flat but you suspect a regression. What does a good suite include?\n' +
      '   A: Slices (language, segment, rare category), capability tests (negation, robustness), safety/refusal\n' +
      '   cases, format/schema checks, adversarial items, and a held-out slice hidden from the model authors.\n\n' +
      'Q: Developers keep bypassing the gate. What does that tell you?\n' +
      '   A: It is flaky or slow. Make it deterministic and fast (fast PR subset, cache unchanged judge calls),\n' +
      '   and make bypass an emergency-only, approved, logged action. A trusted gate is an enforced gate.\n\n' +
      'Q: Should the gate consider latency and cost?\n' +
      '   A: Yes — a quality win that ships a 2x slower or materially pricier model can still be the wrong\n' +
      '   release. Gate p99 latency and cost/request alongside quality.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3</a> (CI for ML), <a href="#ch5">Ch 5</a> (progressive rollout after the gate), <a href="#ch2">Ch 2</a> (gate the alias flip), ' +
      '<a href="../learn2/#ch9">Part 2 Ch 9</a> (LLM evals), <a href="../learn8/#ch7">Part 8 Ch 7</a> (eval-in-prod).</p>',
      try: [
        ['📖 Braintrust / LangSmith — eval platforms for CI', 'https://docs.smith.langchain.com/evaluation', 'o'],
        ['📖 DeepEval — unit testing for LLM outputs', 'https://docs.confident-ai.com/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What should an eval-in-CI release gate compare a candidate model against?',
      opts: [
        'A fixed absolute accuracy number chosen once',
        'The current production model, per metric, with tolerances set from measured run-to-run variance — "not worse than what we serve today"',
        'A random other model',
        'Nothing — just check it runs'],
      ok: 1,
      why: 'Absolute thresholds drift and can let regressions through. Gating against the live baseline directly answers whether the release is a step back.' },
    { q: 'An LLM-as-judge gate blocks good PRs and passes bad ones due to score swings. Best fixes?',
      opts: [
        'Remove the gate',
        'Pin the judge model + prompt version, decode at temperature 0, take N samples with a confidence interval, use pairwise (candidate vs prod) judging, and set the block threshold outside the noise band',
        'Raise the temperature so scores vary more',
        'Judge only one example'],
      ok: 1,
      why: 'Judge non-determinism and single-sample scoring make the gate noisy. Deterministic decoding, repeated sampling, pairwise comparison and a noise-aware threshold make it trustworthy.' },
    { q: 'Trimming a system prompt leaves aggregate helpfulness unchanged but the gate still fails. Why is that good?',
      opts: [
        'The gate is broken and should be ignored',
        'The suite has a safety/refusal slice; refusal-correctness dropped because the trim removed a guardrail sentence — the slice caught a real regression the average hid',
        'Prompts should never be changed',
        'Aggregate metrics are the only ones that matter'],
      ok: 1,
      why: 'Averages mask slice-level failures. A gate that evaluates safety, refusal and per-segment behaviour blocks regressions that would otherwise ship silently.' }
  ]
};
