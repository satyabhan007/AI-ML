/* AI-ML Learn — Part 6 · Chapter 14: API Design for ML Services */
window.CH[14] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>The API is the contract between your model and everyone who uses it. A sloppy one leaks model internals to callers, breaks them on every retrain, ' +
      'and gives no way to roll back. A good one lets you swap the model underneath without a single client change.</p>' +
      '<pre><code>a good ML API answers, up front:\n' +
      '  • what do I send and what do I get back?      (a stable, typed schema)\n' +
      '  • which model / version answered?             (versioning + response metadata)\n' +
      '  • how do I stream a long answer?              (SSE / chunked)\n' +
      '  • what does an error mean and can I retry?    (typed errors, Retry-After)\n' +
      '  • how do I make a retry safe?                 (idempotency key)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A power socket.</b> Your appliances do not care which power station is running or whether they ' +
      'upgraded a turbine — the socket shape and voltage are the contract. Change the plant freely; keep the socket. The API is the socket for your model.</p></div>',
      try: [
        ['📖 Google — API design guide (resources, errors, versioning)', 'https://cloud.google.com/apis/design', 'o'],
        ['🏗️ Ch 3 — the gateway that fronts this API', '#ch3', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>CONTRACT       explicit request/response schema (JSON Schema / protobuf / OpenAPI). Validate inputs;\n' +
      '               reject malformed with a clear 422. Additive changes only within a version.\n' +
      'VERSIONING     URL (/v1/), header, or a model+version field. Support N and N-1 concurrently.\n' +
      '               "model": "ranker", "model_version": "2024-11-03" in the RESPONSE so callers can log it.\n' +
      'STREAMING      SSE / chunked transfer for token-by-token output; send a final "done" event with\n' +
      '               usage + finish_reason. Define behaviour on mid-stream error.\n' +
      'ERRORS         typed + machine-readable: {type, message, retryable, param?}. Distinguish\n' +
      '               client (4xx, do not retry) vs transient (429/503, retry with Retry-After).\n' +
      'DETERMINISM    expose seed / temperature; document that output is non-deterministic by default.\n' +
      'LIMITS         max input size / tokens, timeout, rate limits — in headers + docs, enforced.\n' +
      'METADATA       return latency, tokens in/out, model version, request_id (= trace_id), cache_hit.\n' +
      'PAGINATION / BATCH   an array input with per-item results + per-item errors (partial success).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The de-facto standards to adopt: the <b>OpenAI Chat Completions</b> shape for LLMs ' +
      '(messages, streaming deltas, <code>usage</code>, <code>finish_reason</code>, tool calls) and the <b>KServe Open Inference Protocol (v2)</b> for predict-style models — ' +
      'plus <b>OpenAPI/protobuf</b> for the schema, <b>RFC 9457 (problem+json)</b> for errors, and <b>Idempotency-Key</b> headers. ' +
      'Speaking a standard means existing SDKs, gateways and tests work unchanged.</p></div>',
      try: [
        ['📖 OpenAI — Chat Completions API reference', 'https://platform.openai.com/docs/api-reference/chat', 'o'],
        ['📖 RFC 9457 — Problem Details for HTTP APIs', 'https://www.rfc-editor.org/rfc/rfc9457.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The retrain that broke every client.</b> ' +
      'v1 of a classifier returned <code>{"label": "fraud", "score": 0.87}</code>. A retrain adds a third class and changes <code>score</code> from ' +
      '"probability of fraud" to "probability of the returned label". Clients that thresholded on <code>score</code> silently misbehave. ' +
      'Fix: that was a <b>breaking change</b> → ship it as <code>/v2/</code> with the new semantics documented, keep <code>/v1/</code> serving the old model/behaviour, ' +
      'announce a deprecation window, and put <code>model_version</code> in every response so the change is visible in logs.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Batch endpoint with no partial success.</b> ' +
      'A caller sends 500 texts to classify; one is malformed and the whole request 400s, wasting the 499 good ones. ' +
      'Fix: the batch response is an array of <code>{index, result?, error?}</code> with HTTP 200 (or 207) — good items succeed, the bad item carries a ' +
      'typed per-item error, and the caller retries just that one. Document the max batch size and the timeout for the whole call.</p></div>' +
      '<p><b>Idempotency + streaming together:</b> for a streamed generation, the <code>Idempotency-Key</code> maps to the <i>completed</i> result; a retry after a ' +
      'dropped stream replays the finished text (or resumes), it does not start a second billable generation.</p>',
      try: [
        ['📖 Stripe — API versioning strategy', 'https://stripe.com/blog/api-versioning', 'o'],
        ['🚀 Part 7: eval-in-CI gates on API/behaviour changes', '../learn7/#ch8', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Response mirrors model internals       Expose a stable domain schema. Raw logits / class indices /\n' +
      '  (logit vectors, class ids)            embedding dims leak the model and break on retrain.\n' +
      'No version in the response             Always return model + model_version + request_id. You cannot\n' +
      '                                       debug or attribute a regression without it.\n' +
      'Breaking change shipped as a patch      New semantics / removed field / changed meaning = a new major\n' +
      '                                       version. Run N and N-1 in parallel with a deprecation window.\n' +
      'Errors as plain 500 + string           Typed problem+json: {type, retryable, param}. Callers must be\n' +
      '                                       able to branch on it.\n' +
      'One malformed item fails the batch      Per-item results + per-item errors, partial success (200/207).\n' +
      'Unbounded input                         Enforce + document max tokens / size / timeout; reject early\n' +
      '                                       with 413/422.\n' +
      'Non-deterministic with no seed control   Expose seed + sampling params; document default non-determinism.\n' +
      'No contract tests                       Consumer-driven contract tests in CI so a schema change that\n' +
      '                                       breaks a client fails the build (Part 7 Ch 3).</code></pre>' +
      '<p><b>Design the API before the model.</b> Fix the request/response contract early from the consumer\'s domain language; then the model, its version, ' +
      'its framework and its hardware are all free to change behind it. The API outlives every model that serves it.</p>',
      try: [
        ['📖 Pact — consumer-driven contract testing', 'https://docs.pact.io/', 'o'],
        ['📖 Microsoft — REST API guidelines', 'https://github.com/microsoft/api-guidelines/blob/vNext/azure/Guidelines.md', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: What belongs in an ML API response beyond the prediction itself?\n' +
      '   A: model id + model_version, a request_id equal to the trace_id, latency, tokens in/out (for LLMs),\n' +
      '   finish_reason, and cache_hit. These make regressions debuggable and costs attributable.\n\n' +
      'Q: A retrain changes the meaning of the "score" field. Patch, minor, or major version?\n' +
      '   A: Major (new /v2/). Changing the semantics of an existing field is breaking. Keep /v1/ serving the\n' +
      '   old model + behaviour, publish a deprecation window, and surface model_version in every response.\n\n' +
      'Q: How should a batch endpoint handle one malformed item among 500?\n' +
      '   A: Partial success: return 200/207 with an array of {index, result?, error?}; the bad item carries a\n' +
      "   typed error and the caller retries only that one. Don't fail the whole request.\n\n" +
      'Q: How do idempotency and streaming interact?\n' +
      '   A: The Idempotency-Key maps to the completed generation. A retry after a dropped SSE stream replays\n' +
      '   the finished result (or resumes) rather than starting a new billable generation.\n\n' +
      'Q: Why design the API contract before choosing the model?\n' +
      '   A: The contract, written in the consumer\'s domain terms, is the stable thing. Fixing it first lets\n' +
      '   the model, version, framework and hardware change freely behind it; deriving the API from the model\n' +
      "   leaks internals and forces client migrations on every retrain.\n\n" +
      'Q: What makes an API error "good"?\n' +
      '   A: Machine-readable and typed (problem+json): a stable type, a retryable boolean, the offending param,\n' +
      '   and the right status class (4xx do-not-retry vs 429/503 retry-with-Retry-After) so callers can branch\n' +
      '   correctly.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch4">Ch 4</a> (OpenAI API / OIP as the runtime contract), <a href="#ch13">Ch 13</a> (idempotency &amp; typed errors), ' +
      '<a href="#ch12">Ch 12</a> (async job API), and <a href="../learn7/#ch3">Part 7 Ch 3</a> (contract tests in CI).</p>',
      try: [
        ['📖 Zalando — RESTful API guidelines', 'https://opensource.zalando.com/restful-api-guidelines/', 'o'],
        ['📖 OpenAPI Specification', 'https://spec.openapis.org/oas/latest.html', 'o']
      ] }
  ],

  quiz: [
    { q: 'A retrain changes what the existing "score" field means. How should this be released?',
      opts: [
        'As a transparent patch — clients will adapt',
        'As a new major API version (e.g. /v2/) with the new semantics documented, keeping /v1/ on the old behaviour during a deprecation window',
        'By deleting the score field',
        'By emailing users and changing it in place'],
      ok: 1,
      why: 'Changing the semantics of an existing field is a breaking change. Consumers thresholding on it will silently misbehave unless it is versioned and the old contract remains available.' },
    { q: 'What should a batch/array inference endpoint do when one of 500 items is malformed?',
      opts: [
        'Return HTTP 400 and process none of them',
        'Return partial success (200/207) with per-item {index, result?, error?}, so the 499 good items succeed and only the bad one is retried',
        'Silently drop the bad item and return 499 results with no indication',
        'Retry the whole batch forever'],
      ok: 1,
      why: 'All-or-nothing wastes the valid work. Per-item results with per-item typed errors let the caller recover precisely.' },
    { q: 'Why design the request/response contract before selecting the model?',
      opts: [
        'It is faster to type',
        'The contract (in the consumer\'s domain terms) is the stable interface; fixing it first lets the model, version, framework and hardware change behind it without client migrations',
        'Models cannot be chosen until the API exists',
        'It avoids writing documentation'],
      ok: 1,
      why: 'An API derived from model internals leaks logits/class-ids/embedding dims and breaks on every retrain. A stable domain contract makes the model an implementation detail.' }
  ]
};
