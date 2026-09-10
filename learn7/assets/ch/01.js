/* AI-ML Learn — Part 7 · Chapter 1: Packaging & Reproducibility */
window.CH[1] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>"It worked on my laptop" is where most ML deploys die. A model that trained fine in a notebook fails in production because the Python version, a C library, the CUDA driver, or a package pin is subtly different.</p>' +
      '<p><b>Reproducibility</b> means anyone — or any server — can rebuild the exact same runtime and get the exact same result. The unit that carries it is a <b>container image</b>: your code, your dependencies, and a frozen slice of the OS, shipped as one file.</p>' +
      '<pre><code>your machine        --->   an image (code + deps + OS libs)   --->   runs identically in CI, staging, prod\n' +
      '(messy, mutable)           (immutable, versioned, hashed)              (no surprises)</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A meal kit, not a recipe.</b> A recipe (\"install numpy\") assumes your kitchen already has the right flour and a working oven. A meal kit ships the exact pre-measured ingredients in the box — cook it in any kitchen and you get the same dish.</p></div>',
      try: [
        ['📖 Docker — best practices for writing Dockerfiles', 'https://docs.docker.com/build/building/best-practices/', 'o'],
        ['📙 Part 3: MLOps & reproducible pipelines', '../learn3/#ch16', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<p>Four layers have to be pinned, from the outside in:</p>' +
      '<pre><code>OS / base image     pin by DIGEST, not tag:   python:3.11-slim@sha256:...   (":latest" is not reproducible)\n' +
      'system libs         apt packages with versions; for GPUs, the CUDA + cuDNN versions the framework needs\n' +
      'Python deps         a LOCKFILE (uv.lock / poetry.lock / requirements.txt from pip-compile) — exact ==, hashes\n' +
      'the model itself    a versioned artifact (weights + tokenizer + config) pulled by digest, NOT baked at random</code></pre>' +
      '<p>A minimal, honest inference image:</p>' +
      '<pre><code>FROM python:3.11-slim@sha256:9b2a...        # digest-pinned base\n' +
      'ENV PIP_NO_CACHE_DIR=1 PYTHONDONTWRITEBYTECODE=1\n' +
      'COPY requirements.lock .\n' +
      'RUN pip install --require-hashes -r requirements.lock   # fails if a hash does not match\n' +
      'COPY src/ /app/src/\n' +
      'ENV MODEL_URI=s3://models/ranker/v42                    # model pulled at start, pinned by version\n' +
      'USER 1000\n' +
      'ENTRYPOINT ["python", "-m", "src.serve"]</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The canonical tools: <b>Docker / OCI images</b> for the runtime, ' +
      '<b>uv / pip-tools / Poetry</b> for a hashed Python lockfile, and an <b>OCI-compliant model artifact</b> ' +
      '(the CNCF <i>model-spec</i> / an OCI artifact, or a framework format like SafeTensors + a config) pulled from a registry by digest. ' +
      'You do not invent a packaging format — you pin every layer of the standard one.</p></div>',
      try: [
        ['📖 uv — lockfiles & reproducible installs', 'https://docs.astral.sh/uv/concepts/projects/sync/', 'o'],
        ['📖 OCI Image Spec', 'https://github.com/opencontainers/image-spec/blob/main/spec.md', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>The Friday-afternoon CUDA mismatch.</b> ' +
      'Training runs on a box with CUDA 12.1; the base image for serving ships CUDA 11.8. PyTorch loads, ' +
      'but a fused kernel silently falls back to a slower path and p99 latency triples in prod. ' +
      'Fix: the serving image inherits <code>FROM nvidia/cuda:12.1.1-runtime-ubuntu22.04</code> and installs the ' +
      'matching <code>torch==2.3.1+cu121</code> from the correct index URL — both pinned in the lockfile. ' +
      'Add a startup assertion: <code>assert torch.version.cuda == "12.1"</code>.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>The image that can\'t be rebuilt.</b> ' +
      'Six months later a CVE forces a rebuild. The Dockerfile says <code>pip install -r requirements.txt</code> with ' +
      'unpinned versions; a transitive dep has since had a breaking release and the model output shifts. ' +
      'The build is not reproducible. Fix going forward: commit a fully hashed lockfile, pin the base image by digest, ' +
      'and store the built image in a registry so the <i>old</i> artifact is always retrievable while you fix the new one.</p></div>' +
      '<p><b>Build hygiene that pays off:</b> multi-stage builds (compile deps in one stage, copy only the venv into a slim final stage), ' +
      '<code>.dockerignore</code> the data/checkpoints, run as a non-root <code>USER</code>, and produce the same digest on repeated builds ' +
      '(set <code>SOURCE_DATE_EPOCH</code>, avoid <code>ADD</code> from URLs).</p>',
      try: [
        ['📖 NVIDIA — CUDA container images & framework matrix', 'https://docs.nvidia.com/deeplearning/frameworks/support-matrix/index.html', 'o'],
        ['📖 Reproducible builds — concepts', 'https://reproducible-builds.org/docs/', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'FROM python:latest                    Pin by digest. Rebuilds months later must be byte-identical.\n' +
      'pip install torch numpy               Lockfile with == and --require-hashes. No resolver surprises.\n' +
      'Bake a 12 GB model into the image     Keep images small; pull the model at startup by version from a\n' +
      '                                      registry / object store. Faster deploys, one image for many models.\n' +
      'Model version = "whatever was in       Model artifact has its own immutable version; the image records\n' +
      '  the bucket at build time"            which version it expects. Reproducible + auditable.\n' +
      'One giant single-stage build          Multi-stage: build deps once, ship a slim runtime layer.\n' +
      'Root user, secrets via ENV in         Non-root USER; secrets injected at runtime (mounted files /\n' +
      '  Dockerfile                          secret manager), never in a layer.\n' +
      'No provenance                         Emit an SBOM and sign the image (see Ch 14) so consumers can\n' +
      '                                      verify what they run.</code></pre>' +
      '<p><b>The reproducibility test:</b> can a teammate, on a clean machine, check out a git SHA and rebuild the exact image + ' +
      'exact model + exact eval score? If any of those three drifts, you cannot bisect a production regression.</p>',
      try: [
        ['📖 Docker multi-stage builds', 'https://docs.docker.com/build/building/multi-stage/', 'o'],
        ['📗 Part 2: deterministic pipelines & eval', '../learn2/#ch9', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: A model gives different predictions in staging vs prod on the same input. Where do you look first?\n' +
      'A: Environment drift. Compare: base image digest, Python version, the lockfile hash actually installed,\n' +
      '   CUDA/cuDNN versions, and the model artifact version each pod loaded. Nine times out of ten one of\n' +
      '   those differs. Pin all of them and add startup assertions.\n\n' +
      'Q: Why pin the base image by digest instead of a tag like python:3.11-slim?\n' +
      'A: Tags are mutable — the same tag points at a new image whenever the upstream is rebuilt (security\n' +
      '   patches, distro bumps). A digest (sha256:...) is content-addressed and immutable, so a rebuild in\n' +
      '   six months produces the same base.\n\n' +
      'Q: Should the model weights go inside the container image?\n' +
      'A: Usually no. Keep the image small and generic; pull the versioned model artifact at container start\n' +
      '   from a registry or object store. Benefits: fast deploys, one image serves many model versions,\n' +
      '   model rollback is just changing MODEL_URI. Exception: tiny models or fully air-gapped environments.\n\n' +
      'Q: What is in a Python lockfile and why does --require-hashes matter?\n' +
      'A: Every direct and transitive dependency pinned to an exact version plus a cryptographic hash of the\n' +
      '   artifact. --require-hashes makes pip refuse to install anything whose hash does not match — it blocks\n' +
      '   dependency-confusion / tampered-package attacks and guarantees the same bytes every build.\n\n' +
      'Q: How do you make a build reproducible enough to bisect a regression?\n' +
      'A: One git SHA must fully determine (image digest, model version, config). Digest-pinned base, hashed\n' +
      '   lockfile, model pulled by version, config in git. Then "good SHA vs bad SHA" is a real experiment.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch2">Ch 2 — Model &amp; artifact registries</a> for versioning the model itself, ' +
      '<a href="#ch14">Ch 14 — Supply-chain security</a> for signing what you built, and ' +
      '<a href="../learn6/#ch11">Part 6 Ch 11</a> for the cost side of image/model size.</p>',
      try: [
        ['📖 SLSA — supply-chain levels & provenance', 'https://slsa.dev/spec/v1.0/levels', 'o'],
        ['📖 Python packaging — hash-checking mode', 'https://pip.pypa.io/en/stable/topics/secure-installs/', 'o']
      ] }
  ],

  quiz: [
    { q: 'Why pin a base image by digest (python:3.11-slim@sha256:…) rather than by tag?',
      opts: [
        'Digests download faster',
        'Tags are mutable — the same tag is re-pointed at new images over time; a digest is immutable and content-addressed, so rebuilds stay identical',
        'Tags do not work in Kubernetes',
        'There is no practical difference'],
      ok: 1,
      why: 'A tag like 3.11-slim is updated in place whenever upstream rebuilds it. Only a sha256 digest guarantees the exact same base layer on a rebuild months later.' },
    { q: 'Where should large model weights live for a fleet that serves several model versions?',
      opts: [
        'Baked into each container image at build time',
        'As a versioned artifact in a registry/object store, pulled at container startup by version, with the image recording which version it expects',
        'Committed to the git repo',
        'Downloaded fresh from the internet on every request'],
      ok: 1,
      why: 'Keeping weights out of the image keeps images small and generic, makes deploys and rollbacks fast (just change the model URI), and lets one image serve many model versions.' },
    { q: 'What does installing with a hashed lockfile and --require-hashes guarantee?',
      opts: [
        'The install is faster',
        'Every dependency (direct and transitive) is the exact pinned version with a matching cryptographic hash — identical bytes every build, and tampered/confused packages are rejected',
        'You never need to update dependencies',
        'GPU support is automatic'],
      ok: 1,
      why: 'Hash-checking mode makes pip refuse anything whose artifact hash does not match the lockfile, giving byte-for-byte reproducible installs and blocking supply-chain substitution attacks.' }
  ]
};
