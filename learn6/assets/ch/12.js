/* AI-ML Learn — Part 6 · Chapter 12: Async & Event-Driven Inference */
window.CH[12] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Some inference is too slow to make a caller wait: transcribing an hour of audio, generating a video, running a 12-step agent, scoring a 50k-row file. ' +
      'Holding an HTTP connection open for two minutes wastes a server slot and times out anyway. The answer is <b>async</b>: accept the job, return a ticket, ' +
      'do the work in the background, deliver the result later.</p>' +
      '<pre><code>SYNC   client waits ──────────────► answer            (good for < ~1-2 s)\n' +
      'ASYNC  client ──► "job #123, pending" ──► ... work happens ... ──► poll or webhook ──► result</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A dry cleaner.</b> You do not stand at the counter while your suit is cleaned. ' +
      'You get a ticket and either come back to check (polling) or they text you when it is ready (webhook). The counter stays free for the next customer.</p></div>',
      try: [
        ['📖 Cloud — asynchronous request-reply pattern', 'https://learn.microsoft.com/en-us/azure/architecture/patterns/async-request-reply', 'o'],
        ['🏗️ Ch 3 — sync vs async in the serving picture', '#ch3', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>SHAPE\n' +
      '  POST /jobs        → 202 Accepted, {job_id, status:"queued"}   (enqueue, return immediately)\n' +
      '  GET  /jobs/{id}   → {status: queued|running|succeeded|failed, result_url?}   (polling)\n' +
      '  webhook / callback → POST to the client\'s URL on completion (push; needs ret/signing)\n' +
      '  streaming         → SSE / WebSocket for partial results as they are produced\n' +
      'COMPONENTS\n' +
      '  queue        SQS / RabbitMQ / Kafka / Redis Streams / a DB-backed outbox. At-least-once.\n' +
      '  workers      a pool consuming the queue, running the model, writing results + status.\n' +
      '  result store  object storage / DB for outputs; a short-TTL signed URL to fetch.\n' +
      '  DLQ           dead-letter queue for messages that fail N times → inspect, don\'t lose.\n' +
      'GUARANTEES\n' +
      '  idempotency key   so a redelivered message is not processed twice (see Ch 13).\n' +
      '  visibility timeout / lease   worker "owns" a message while processing; auto-requeue on crash.\n' +
      '  the OUTBOX pattern   write the job + an event in ONE DB transaction, relay the event after —\n' +
      '                       no lost jobs if the process dies between DB write and enqueue.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard building blocks: a <b>message queue</b> (SQS, RabbitMQ, Kafka, Redis Streams), ' +
      'a <b>worker pool</b> (KEDA-scaled on queue depth), a <b>result/object store</b>, a <b>dead-letter queue</b>, and the <b>transactional outbox</b> pattern ' +
      'for exactly-once-ish handoff. The API shape (<code>202</code> + job resource + poll/webhook) is the widely-used <b>async request-reply</b> pattern — ' +
      'it is what the big model APIs\' batch endpoints do. You assemble these; the semantics are well documented.</p></div>',
      try: [
        ['📖 microservices.io — the transactional outbox pattern', 'https://microservices.io/patterns/data/transactional-outbox.html', 'o'],
        ['📖 AWS — SQS visibility timeout & dead-letter queues', 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Bulk document classification.</b> ' +
      'A customer uploads a 40k-row CSV to be classified. Sync would time out and pin a request slot for minutes. ' +
      'Design: <code>POST /batch-jobs</code> stores the file, writes a job row, emits an event via the <b>outbox</b>; ' +
      'workers (KEDA-scaled on queue depth) process shards of ~500 rows with <b>dynamic batching</b> into the model, write partial progress, ' +
      'and on completion upload a results file and fire a <b>signed webhook</b>. The client polls <code>GET /batch-jobs/{id}</code> for progress. ' +
      'Failed shards go to a DLQ and are retried independently.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The webhook that got processed twice.</b> ' +
      'A worker completes a job, posts the webhook, then crashes before marking the job done. The message is redelivered; a second worker re-runs ' +
      'the (expensive) generation and posts a second webhook. The client double-charges a user. Fixes: an <b>idempotency key</b> on the job so the second ' +
      'run is a no-op that returns the stored result; mark-done and emit-webhook inside the same transaction (or via the outbox); ' +
      'and make the webhook payload carry a unique <code>event_id</code> so the client can dedupe too.</p></div>' +
      '<p><b>Backpressure still applies:</b> the queue smooths bursts, but if jobs arrive faster than workers drain them <i>for a sustained period</i>, ' +
      'queue depth (and wait time) grows without bound — autoscale workers on depth, cap the queue, and reject new jobs with a clear ETA when it is full.</p>',
      try: [
        ['📖 OpenAI — the Batch API (async job pattern)', 'https://platform.openai.com/docs/guides/batch', 'o'],
        ['🏗️ Ch 13 — idempotency keys in depth', '#ch13', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Long sync HTTP for a 60 s job          202 + job resource; poll or webhook. Free the connection slot.\n' +
      'Enqueue AFTER committing the DB row     They can diverge on a crash → lost or ghost jobs. Use the\n' +
      '  (or vice versa)                       transactional outbox: one commit, relay the event after.\n' +
      'At-least-once queue, non-idempotent      Redelivery WILL happen. Idempotency key → second run returns\n' +
      '  worker                                the stored result, no side effects.\n' +
      'No dead-letter queue                    Poison messages retry forever or vanish. DLQ after N attempts,\n' +
      '                                       with alerting.\n' +
      'Webhook with no ret/signing              Sign payloads (HMAC), retry with backoff, include event_id for\n' +
      '                                       client-side dedupe, and offer polling as a fallback.\n' +
      'Visibility timeout < job duration        The message re-appears mid-processing → duplicate work. Set the\n' +
      '                                       lease longer than p99 job time, or heartbeat-extend it.\n' +
      'Unbounded queue                          Cap it; reject new jobs with a clear retry-after when full.\n' +
      'One queue for 5 s and 5 h jobs           Separate queues / worker pools by expected duration and\n' +
      '                                       priority so short jobs are not stuck behind a marathon.</code></pre>' +
      '<p><b>Agents are async workloads.</b> A multi-step tool-using agent run (Part 2) is minutes long, non-deterministic in duration, and may need ' +
      'human-in-the-loop pauses — model it as a job with a state machine (or a durable-execution engine like Temporal), not a single request.</p>',
      try: [
        ['📖 Temporal — durable execution for long-running workflows', 'https://docs.temporal.io/temporal', 'o'],
        ['📗 Part 2: agents & multi-step orchestration', '../learn2/#ch7', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: When do you make inference async instead of sync?\n' +
      '   A: When the work is longer than ~1-2 s (long audio/video, large batches, multi-step agents), highly\n' +
      '   variable in duration, or needs pauses. Return 202 + a job resource; deliver via polling or webhook so\n' +
      '   you do not pin a connection/slot.\n\n' +
      'Q: What problem does the transactional outbox solve?\n' +
      '   A: The gap between "write the job to the DB" and "enqueue the message". If the process dies between\n' +
      '   them you get a lost job or a ghost message. The outbox writes the row and an event in ONE transaction;\n' +
      '   a relay publishes the event afterward, so the two never diverge.\n\n' +
      'Q: Your queue is at-least-once and a worker crashed after finishing but before acking. What breaks and\n' +
      '   how do you fix it?\n' +
      '   A: The message redelivers and the expensive job runs again (double webhook, double charge). Fix with\n' +
      '   an idempotency key so the re-run returns the stored result with no side effects, mark-done + emit in\n' +
      '   one transaction, and put an event_id in the webhook for client-side dedupe.\n\n' +
      'Q: What is a visibility timeout / message lease and how do you set it?\n' +
      '   A: The window during which a consumed message is hidden from other workers. Set it longer than p99 job\n' +
      "   duration (or heartbeat-extend it), or the message reappears mid-processing and a second worker\n" +
      '   duplicates the work.\n\n' +
      'Q: How do you keep a burst of jobs from unbounded queue growth?\n' +
      '   A: Autoscale workers on queue depth (KEDA), cap the queue length, and reject new submissions with a\n' +
      '   clear retry-after / ETA when full. A queue smooths bursts, not a sustained overload.\n\n' +
      'Q: Why route 5-second and 5-hour jobs to different queues?\n' +
      '   A: Head-of-line blocking — short interactive jobs should not wait behind a multi-hour batch. Separate\n' +
      '   pools by expected duration and priority.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch3">Ch 3</a> (queue-backed serving), <a href="#ch13">Ch 13</a> (idempotency, retries, timeouts), <a href="#ch9">Ch 9</a> (worker autoscaling on depth), ' +
      'and <a href="#ch14">Ch 14</a> (the async job API contract).</p>',
      try: [
        ['📖 Stripe — designing robust webhooks', 'https://docs.stripe.com/webhooks', 'o'],
        ['📖 Redis Streams — consumer groups & pending entries', 'https://redis.io/docs/latest/develop/data-types/streams/', 'o']
      ] }
  ],

  quiz: [
    { q: 'What does the transactional outbox pattern guarantee for an async inference job?',
      opts: [
        'The model runs faster',
        'The job record and its "process me" event are written in one atomic transaction, so a crash cannot leave a job with no event (lost) or an event with no job (ghost)',
        'Exactly-once delivery over the network',
        'That workers never crash'],
      ok: 1,
      why: 'Writing the DB row and enqueuing separately can diverge on failure. The outbox commits both together and a relay publishes the event afterward, eliminating that gap.' },
    { q: 'Your job queue is at-least-once. A worker finished the job but crashed before acknowledging the message. What must the worker design include?',
      opts: [
        'Nothing — at-least-once means it only runs once',
        'An idempotency key so the redelivered message results in a no-op that returns the already-computed result, with no duplicate side effects',
        'A faster GPU',
        'A longer HTTP timeout on the client'],
      ok: 1,
      why: 'At-least-once delivery means redelivery is expected. Without idempotency the expensive job re-runs and side effects (webhooks, charges) fire twice.' },
    { q: 'Why separate short interactive inference jobs and multi-hour batch jobs into different queues/worker pools?',
      opts: [
        'To use more memory',
        'To avoid head-of-line blocking — short jobs should not sit behind a marathon job in the same queue',
        'Because queues can only hold one job type',
        'It has no real benefit'],
      ok: 1,
      why: 'A single shared queue lets a long-running job delay every short job behind it. Partitioning by expected duration and priority keeps latency-sensitive work moving.' }
  ]
};
