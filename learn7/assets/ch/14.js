/* AI-ML Learn — Part 7 · Chapter 14: Supply-Chain Security for Deploys */
window.CH[14] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>What actually runs in production is a stack of things you did not write: a base image, hundreds of transitive Python packages, model weights downloaded from ' +
      'a hub, CUDA libraries, GitHub Actions. Any one of them could be tampered with. <b>Supply-chain security</b> is being able to prove that what you deploy is ' +
      'what you built, from sources you trust.</p>' +
      '<pre><code>ask three questions about every artifact you ship:\n' +
      '  what is in it?     → an SBOM (bill of materials): every package + version\n' +
      '  where did it come from?  → provenance / attestation: this CI, this commit, these steps\n' +
      '  is it unmodified?   → a signature you verify before it runs</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Food supply chain.</b> A packaged meal lists its ingredients (SBOM), says which factory and batch it ' +
      'came from (provenance), and carries a tamper-evident seal (signature). A restaurant that skips all three is one bad shipment away from poisoning its customers.</p></div>',
      try: [
        ['📖 SLSA — Supply-chain Levels for Software Artifacts', 'https://slsa.dev/spec/v1.0/', 'o'],
        ['🚀 Ch 1 — reproducible, digest-pinned builds', '#ch1', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>SBOM             a machine-readable list of components (SPDX / CycloneDX) for the image AND\n' +
      '                 the model artifact. Generate at build (Syft / cdxgen); store with the artifact.\n' +
      'PROVENANCE        a signed attestation of HOW the artifact was built: source repo + commit,\n' +
      '                 builder identity, build steps (SLSA provenance / in-toto).\n' +
      'SIGNING           sign images + SBOMs + attestations (Sigstore cosign, keyless via OIDC).\n' +
      '                 Sign MODEL artifacts too.\n' +
      'VERIFICATION      the cluster admits only signed artifacts from trusted builders — an admission\n' +
      '                 controller (Kyverno / Sigstore policy-controller / Connaisseur / Ratify).\n' +
      'DEPENDENCY HYGIENE   hash-pinned lockfiles (Ch 1); a private proxy / allowlist to stop\n' +
      '                 dependency-confusion; scan for known CVEs (Trivy / Grype / Dependabot).\n' +
      'MODEL PROVENANCE   pin model weights by digest from a trusted registry; verify the hash; prefer\n' +
      '                 safetensors over pickle (arbitrary code execution risk); record source + license.\n' +
      'CI HARDENING       least-privilege tokens, pinned action SHAs, no secrets in logs, protected\n' +
      '                 branches, required reviews.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standards: <b>SLSA</b> (provenance levels), <b>in-toto</b> (attestations), <b>Sigstore/cosign</b> ' +
      '(keyless signing), <b>SPDX / CycloneDX</b> (SBOM formats), <b>Syft/Grype</b> and <b>Trivy</b> (SBOM + scanning), and an admission controller (<b>Kyverno</b>, ' +
      '<b>Sigstore policy-controller</b>, <b>Ratify</b>) to enforce "signed by a trusted builder" at deploy time. For models, <b>safetensors</b> + digest pinning + ' +
      'model cards. You adopt these; you do not invent a signing scheme.</p></div>',
      try: [
        ['📖 Sigstore — cosign (signing & verification)', 'https://docs.sigstore.dev/cosign/signing/overview/', 'o'],
        ['📖 CISA — SBOM', 'https://www.cisa.gov/sbom', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>A CVE lands in a base image.</b> ' +
      'A critical vulnerability is announced in a system library. Question: which of our 40 services ship it? With an <b>SBOM per image</b> stored alongside each ' +
      'artifact, it is one query — the affected services are identified in minutes, patched base images are rolled, and the reproducible builds (Ch 1) make the ' +
      'rebuild deterministic. Without SBOMs it is a week of manual <code>docker run ... dpkg -l</code> archaeology.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>A poisoned model file.</b> ' +
      'A team downloads weights from a public hub by name (a mutable tag), loaded via <code>torch.load</code> (pickle). An attacker publishes a look-alike repo / ' +
      'a compromised revision that executes code on load. Fixes: pin the model by <b>commit hash / digest</b>, verify the <b>checksum</b>, prefer <b>safetensors</b> ' +
      '(no code execution), pull through an internal mirror, and record the model\'s <b>provenance</b> (source, revision, license) in the registry entry (Ch 2).</p></div>' +
      '<p><b>Enforce, do not just generate:</b> an admission policy that <i>rejects</i> an unsigned image or one from an unknown builder turns all the SBOM/signing ' +
      'work into an actual control instead of a report nobody reads.</p>',
      try: [
        ['📖 Kyverno — verify image signatures & attestations', 'https://kyverno.io/docs/writing-policies/verify-images/', 'o'],
        ['📖 Hugging Face — safetensors (safe model serialization)', 'https://huggingface.co/docs/safetensors/index', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'No SBOM                                Generate one per image AND per model artifact; store it with\n' +
      '                                       the artifact. "Which services have CVE-X" must be a query.\n' +
      'Unsigned artifacts                     Sign images + SBOMs + provenance (cosign, keyless OIDC);\n' +
      '                                       sign model files too.\n' +
      'Sign but do not verify                 Admission controller rejects unsigned / untrusted-builder\n' +
      '                                       artifacts at deploy. Generation without enforcement is theatre.\n' +
      'Model pulled by mutable tag / pickle    Pin by digest, verify checksum, prefer safetensors, mirror\n' +
      '                                       internally, record provenance + license.\n' +
      'Unpinned deps / public index directly   Hash-pinned lockfiles + a private proxy / allowlist to block\n' +
      '                                       dependency confusion.\n' +
      'GitHub Actions pinned by tag (@v4)      Pin actions by commit SHA; least-privilege GITHUB_TOKEN;\n' +
      '                                       no long-lived cloud keys in CI (OIDC).\n' +
      'CVE scan only at build, once            Scan continuously (registry + running images); re-evaluate as\n' +
      '                                       new CVEs are published against stored SBOMs.\n' +
      'No provenance / attestation             SLSA provenance: which repo, commit, builder, steps — so a\n' +
      '                                       consumer can verify the chain, not just the bytes.</code></pre>' +
      '<p><b>Target state:</b> nothing runs in the cluster unless it is signed, its builder is trusted, its SBOM is on file, and its dependencies (and model) are ' +
      'pinned and scanned. Then a supply-chain incident is a bounded, queryable problem.</p>',
      try: [
        ['📖 SLSA — provenance & verification', 'https://slsa.dev/spec/v1.0/provenance', 'o'],
        ['🏢 Part 9: security for AI systems (threat model)', '../learn9/#ch5', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: A critical CVE is announced in a common library. How fast can you list the affected services, and\n' +
      '   what makes that possible?\n' +
      '   A: Minutes, if every image (and model artifact) ships an SBOM stored with it — you query the SBOMs\n' +
      '   for the package. Reproducible, digest-pinned builds then make the patched rebuild deterministic.\n\n' +
      'Q: What three properties do you want to be able to prove about a deployed artifact?\n' +
      '   A: Contents (SBOM), origin (signed provenance/attestation: repo, commit, builder, steps), and\n' +
      '   integrity (a signature you verify before it runs).\n\n' +
      'Q: Why is loading model weights via pickle / torch.load from a mutable hub tag dangerous?\n' +
      '   A: Pickle can execute arbitrary code on load, and a mutable tag can be repointed to a compromised\n' +
      '   revision. Pin by digest, verify the checksum, prefer safetensors, mirror internally, and record\n' +
      '   provenance.\n\n' +
      'Q: You generate SBOMs and sign images but incidents still slip through. What is missing?\n' +
      '   A: Enforcement. An admission controller must reject unsigned artifacts or ones from an untrusted\n' +
      '   builder at deploy time — otherwise the signing is just metadata.\n\n' +
      'Q: How should GitHub Actions be pinned, and why?\n' +
      '   A: By commit SHA, not a tag — tags are mutable and a compromised action runs in your CI with your\n' +
      '   tokens. Also least-privilege GITHUB_TOKEN and OIDC instead of long-lived cloud keys.\n\n' +
      'Q: What is SLSA provenance?\n' +
      '   A: A signed attestation describing how an artifact was built — source repo and commit, the builder\n' +
      '   identity, and the build steps — so a consumer can verify the whole chain, not just that the bytes\n' +
      '   are signed.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch1">Ch 1</a> (pinned, reproducible builds), <a href="#ch2">Ch 2</a> (model provenance in the registry), <a href="#ch13">Ch 13</a> (IaC policy-as-code), ' +
      '<a href="../learn9/#ch5">Part 9 Ch 5</a> (AI threat model).</p>',
      try: [
        ['📖 in-toto — supply-chain attestation framework', 'https://in-toto.io/', 'o'],
        ['📖 OpenSSF — Supply-chain security guides', 'https://openssf.org/', 'o']
      ] }
  ],

  quiz: [
    { q: 'A critical CVE is announced in a widely-used library. What lets you identify affected services in minutes rather than days?',
      opts: [
        'A faster CI runner',
        'An SBOM (software bill of materials) generated per image and model artifact and stored with it, so "which artifacts contain package X" is a query',
        'More replicas',
        'A bigger monitoring dashboard'],
      ok: 1,
      why: 'Without a component inventory you must inspect every running image by hand. SBOMs turn CVE impact analysis into a lookup, and reproducible builds make the patched rebuild deterministic.' },
    { q: 'Why is pulling model weights by a mutable hub tag and loading them via pickle/torch.load a supply-chain risk?',
      opts: [
        'It is slower than safetensors',
        'Pickle deserialization can execute arbitrary code on load, and a mutable tag can be repointed to a compromised revision — pin by digest, verify checksums, prefer safetensors, mirror internally',
        'It uses more disk space',
        'There is no risk'],
      ok: 1,
      why: 'Both the transport (mutable tag) and the format (pickle) are attack surfaces. Digest pinning, checksum verification and a code-free format like safetensors close them.' },
    { q: 'You generate SBOMs and sign every image, but a tampered artifact still reached production. What is missing?',
      opts: [
        'More SBOM formats',
        'Enforcement at deploy time — an admission controller that rejects unsigned artifacts or ones not built by a trusted builder',
        'A second signature',
        'A longer retention period for logs'],
      ok: 1,
      why: 'Signing and SBOMs are only evidence. A policy that actually blocks unverified artifacts from running is what turns them into a control.' }
  ]
};
