/* AI-ML Learn — Part 8 · Chapter 16: Incident Response & Postmortems for AI */
window.CH[16] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Everything in this part feeds one moment: something is wrong in production and people have to fix it, fast, without making it worse. A good incident process ' +
      'is a rehearsed sequence, and a good postmortem turns the pain into a permanent improvement — without blaming a person.</p>' +
      '<pre><code>DETECT   an SLO burn-rate alert (Ch 11) — ideally before customers notice\n' +
      'TRIAGE   severity? who is affected? declare an incident, assign roles\n' +
      'MITIGATE  stop the bleeding — roll back / flip a kill switch (Part 7 Ch 9). Fix root cause LATER.\n' +
      'RESOLVE   confirm the SLI is healthy again; stand down\n' +
      'LEARN    blameless postmortem → concrete action items with owners + dates</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A house fire.</b> You do not investigate the wiring while the kitchen burns — you put the fire out ' +
      '(mitigate), get everyone safe (resolve), <i>then</i> the fire marshal works out the cause and you fix the wiring everywhere (postmortem + actions). ' +
      'Nobody stands around blaming whoever left the stove on.</p></div>',
      try: [
        ['📖 Google SRE Book — Managing Incidents', 'https://sre.google/sre-book/managing-incidents/', 'o'],
        ['📡 Ch 11 — the burn-rate alert that starts it', '#ch11', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>ROLES (even for a small team)   Incident Commander (decides, delegates), Comms/Scribe (updates +\n' +
      '  timeline), Ops/Subject leads (investigate + act). One person can hold two, not all.\n' +
      'SEVERITY LEVELS   SEV1 (major outage / data or safety impact) → SEV3 (minor). Drives who is\n' +
      '  paged, cadence of updates, whether execs/customers are informed.\n' +
      'MITIGATE FIRST    the predefined rollback trigger (Part 7 Ch 9) may already be met — repoint the\n' +
      '  model alias, git revert, flip the kill switch. Root cause can wait.\n' +
      'THE THREE ARTEFACTS   a live incident channel, a running TIMELINE (from traces/logs/annotations,\n' +
      '  Ch 6/10), and a status page / stakeholder update.\n' +
      'BLAMELESS POSTMORTEM   what happened (timeline), impact (SLO minutes, users, $), detection &\n' +
      '  response timeline, ROOT CAUSE(S) (systemic, "5 whys" — never "person X erred"), what went\n' +
      '  well / badly / got lucky, ACTION ITEMS (owner + due date + tracked to done).\n' +
      'AI-SPECIFIC TWISTS   silent quality/safety regressions (no error — Ch 7/9); DELAYED labels hide\n' +
      '  the true impact window; drift vs data-bug ambiguity (Ch 8); a bad model version + a coupled\n' +
      '  client (Part 7 Ch 9); prompt/index change with no version bump (Part 7 Ch 2, Ch 10).</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard is the <b>Google SRE incident-management</b> model (roles, IC, blameless postmortems) and ' +
      '<b>ICS</b>-derived practice, tooled by <b>PagerDuty / Opsgenie / incident.io / FireHydrant / Rootly</b> (declare, roles, timeline, retro templates). ' +
      '<b>Blameless</b> postmortems are the industry norm. You run the process; the framework and templates are established.</p></div>',
      try: [
        ['📖 Google SRE Book — Postmortem Culture: Learning from Failure', 'https://sre.google/sre-book/postmortem-culture/', 'o'],
        ['📖 PagerDuty — Incident Response documentation', 'https://response.pagerduty.com/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>A textbook AI incident.</b> ' +
      '14:03 model v43 hits 50% canary. 16:10 a slow-burn SLO alert fires on the <b>groundedness quality SLI</b> (Ch 7) — no HTTP errors, latency normal. ' +
      'IC declared, SEV2. Timeline assembled from deploy annotations + sampled judge scores: groundedness fell from 94% → 82% at the canary step. ' +
      '<b>Mitigate:</b> repoint the model alias to v42 (Part 7 Ch 9) — SLI recovers by 16:35. <b>Root cause:</b> v43\'s prompt change dropped a "only use the provided ' +
      'context" instruction; the offline eval set had no groundedness slice so the gate passed (Part 7 Ch 8). <b>Actions:</b> add a groundedness slice to the eval gate; ' +
      'require prompt diffs in model PRs; add a quality-SLI fast-burn alert. Each with an owner and a date.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The impact window you could not see.</b> ' +
      'A fraud model regressed, but labels (chargebacks) lag 45 days, so the "impact" in the first postmortem draft was "unknown". The team used <b>prediction drift</b> ' +
      'and a <b>held-out labelled sample</b> to estimate the affected period and $ exposure, and added an action item to always maintain a fast-labelled sample for exactly this. ' +
      'AI postmortems often have to <i>estimate</i> impact from proxies and revise it when labels arrive.</p></div>' +
      '<p><b>Track actions to done.</b> A postmortem whose action items are never completed just documents that you will have the same incident again.</p>',
      try: [
        ['📖 incident.io — how to run a blameless postmortem', 'https://incident.io/guide/foundations/postmortems', 'o'],
        ['📡 Ch 8 — drift/proxy signals for estimating impact', '#ch8', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'Debug root cause during the outage      Mitigate first (rollback / kill switch); investigate after\n' +
      '                                       the SLI is healthy.\n' +
      'No incident roles                       Name an Incident Commander + Scribe even on a 3-person team;\n' +
      '                                       one voice decides, one records.\n' +
      'Postmortem names a person as cause       Blameless: systemic root cause(s). "Why was it possible for a\n' +
      '                                       prompt change to ship without a groundedness check?"\n' +
      'Impact = "some users, a while"           Quantify: SLO minutes burned, users/requests affected, $;\n' +
      '                                       for delayed-label systems, estimate from proxies and revise.\n' +
      'Only HTTP errors count as incidents      Silent quality/safety regressions are incidents — alert on\n' +
      '                                       quality/safety SLIs and treat their burn the same.\n' +
      'Action items with no owner/date          Every action item: owner, due date, tracked to completion;\n' +
      '                                       review open ones each week.\n' +
      'No timeline / relying on memory          Build it from deploy annotations, traces, logs, alert history\n' +
      '                                       — objective, not recollection.\n' +
      'Never rehearsed                          Game days / incident drills; on-call onboarding runs a mock\n' +
      '                                       incident end to end (Part 7 Ch 16).</code></pre>' +
      '<p><b>The measure of the process:</b> shorter MTTR over time, action items completed, and the <i>same</i> incident not recurring. If repeats keep happening, ' +
      'the postmortems are theatre.</p>',
      try: [
        ['📖 Google SRE Workbook — Incident Response', 'https://sre.google/workbook/incident-response/', 'o'],
        ['🏢 Part 9: reliability at scale, error-budget policy, game days', '../learn9/#ch9', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Walk through the phases of incident response.\n' +
      '   A: Detect (SLO burn-rate alert), triage (severity, who is affected, declare, assign roles), mitigate\n' +
      '   (stop the bleeding — rollback / kill switch, not root-cause fixing), resolve (confirm the SLI is\n' +
      '   healthy, stand down), learn (blameless postmortem → owned, dated action items tracked to done).\n\n' +
      'Q: Why mitigate before diagnosing?\n' +
      '   A: Every minute of impact burns error budget and hurts users. The predefined rollback trigger may\n' +
      '   already be met; roll back / flip the kill switch first, understand the cause afterward.\n\n' +
      'Q: What makes a postmortem "blameless" and why does it matter?\n' +
      '   A: It looks for systemic causes ("why was it possible for this to ship / go undetected") rather than\n' +
      '   "person X made a mistake". Blame drives hiding of information; blamelessness gets the real story and\n' +
      "   real fixes.\n\n" +
      'Q: What is AI-specific about these incidents?\n' +
      '   A: Silent quality/safety regressions with no errors; delayed labels hiding the true impact window;\n' +
      '   drift-vs-data-bug ambiguity; coupled model+client rollbacks; prompt/index changes with no version\n' +
      '   bump. Impact often has to be estimated from proxies and revised when labels land.\n\n' +
      'Q: A model regressed but labels lag 45 days. How do you state impact?\n' +
      '   A: Estimate from prediction drift and a fast-labelled held-out sample; give a range, note the\n' +
      '   assumptions, and revise the postmortem when labels arrive. Add an action item to always keep a\n' +
      "   fast-labelled sample.\n\n" +
      'Q: How do you know the incident process is working?\n' +
      '   A: MTTR trending down, action items actually completed, and the same incident not recurring.</code></pre>' +
      '<p><b>↔ See also:</b> every chapter of this part — detection (Ch 11), timeline (Ch 6, Ch 10), quality/safety incidents (Ch 7, Ch 9), impact estimation (Ch 8); ' +
      'plus <a href="../learn7/#ch9">Part 7 Ch 9</a> (rollback/kill switch), <a href="../learn7/#ch16">Part 7 Ch 16</a> (runbook), <a href="../learn9/#ch9">Part 9 Ch 9</a> (game days).</p>',
      try: [
        ['📖 Atlassian — incident postmortem template & guide', 'https://www.atlassian.com/incident-management/postmortem', 'o'],
        ['📖 Etsy — blameless postmortems (Debriefing Facilitation Guide)', 'https://github.com/etsy/DebriefingFacilitationGuide', 'o']
      ] }
  ],

  quiz: [
    { q: 'Why should you mitigate (roll back / flip a kill switch) before diagnosing root cause during an incident?',
      opts: [
        'Root cause never matters',
        'Every minute of impact burns error budget and harms users; the predefined rollback trigger may already be met, so stop the bleeding first and investigate once the SLI is healthy',
        'Diagnosis is impossible during an incident',
        'It looks better in the postmortem'],
      ok: 1,
      why: 'Mitigation and diagnosis are separate phases. Recovery is fast and often pre-decided (alias repoint, revert, kill switch); understanding the cause is important but not urgent.' },
    { q: 'What makes a postmortem "blameless"?',
      opts: [
        'It does not mention the incident',
        'It identifies systemic causes — "why was it possible for this change to ship / go undetected" — rather than attributing the incident to an individual\'s mistake',
        'It is written by the person who caused it',
        'It has no action items'],
      ok: 1,
      why: 'Blame makes people withhold information, so you never learn the real story. Focusing on the system that allowed the failure produces honest analysis and durable fixes.' },
    { q: 'A model regressed but ground-truth labels lag 45 days. How should the postmortem state impact?',
      opts: [
        'Wait 45 days before writing the postmortem',
        'Estimate the affected window and exposure from proxy signals (prediction drift, a fast-labelled held-out sample), state the assumptions and a range, and revise when labels arrive',
        'Record impact as "unknown" and move on',
        'Assume there was no impact'],
      ok: 1,
      why: 'Delayed labels are an AI-specific twist. Proxies give a defensible early estimate; the postmortem is updated as real data lands, and an action item ensures a fast-labelled sample exists next time.' }
  ]
};
