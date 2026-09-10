/* AI-ML Learn — Part 7 · Chapter 6: Kubernetes for Model Workloads */
window.CH[6] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Kubernetes runs containers across a fleet of machines: it decides which node each pod lands on, restarts crashed pods, and scales copies up and down. ' +
      'Model workloads add three wrinkles ordinary web apps do not have: they want <b>GPUs</b> (scarce, expensive, not infinitely divisible), they have ' +
      '<b>long, slow startups</b> (loading multi-GB weights), and killing one abruptly can drop in-flight generations.</p>' +
      '<pre><code>Deployment   N identical replicas of your model container\n' +
      'Service      a stable address that load-balances across them\n' +
      'resources    each pod requests CPU / memory / GPU; the scheduler places it where that fits\n' +
      'HPA          add/remove replicas based on a metric\n' +
      'PDB          "never take more than X down at once" during maintenance</code></pre>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>A parking garage with a valet.</b> Kubernetes is the valet: you say "I need a spot with a charging ' +
      'station (GPU) and 3 m clearance (memory)", and it finds one, remembers where your car is, and fetches another if yours breaks down. GPU spots are rare, ' +
      'so the valet has to be careful who gets one.</p></div>',
      try: [
        ['📖 Kubernetes — scheduling GPUs', 'https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/', 'o'],
        ['🏗️ Part 6: serving runtimes that run in these pods', '../learn6/#ch4', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>RESOURCES     requests = what the scheduler reserves; limits = the hard cap. For GPUs, request =\n' +
      '              limit = whole GPUs (nvidia.com/gpu: 1) unless using MIG/MPS/time-slicing to share.\n' +
      '              Set memory requests near the real footprint; OOMKill is abrupt.\n' +
      'NODE POOLS    a dedicated GPU node group; taint it so only GPU workloads schedule there;\n' +
      '              tolerations + nodeSelector/affinity on the pods.\n' +
      'AUTOSCALING   HPA (replicas on a metric — use QPS / queue depth / GPU util, not CPU) +\n' +
      '              KEDA (event/queue-driven, scale-to-zero) + Cluster Autoscaler / Karpenter (add NODES\n' +
      '              when pods are Pending; GPU nodes take minutes to join → keep a warm buffer).\n' +
      'PROBES        readiness (not "Ready" until weights are loaded + a test inference passes) +\n' +
      '              liveness (restart on hang) + startupProbe (generous, for slow model loads).\n' +
      'GRACEFUL STOP  preStop hook + long terminationGracePeriodSeconds + SIGTERM handling so in-flight\n' +
      '              requests drain before the pod dies (critical for streaming/long generations).\n' +
      'PDB           minAvailable / maxUnavailable so node drains + rollouts do not evict too many at once.\n' +
      'SCHEDULING    topologySpreadConstraints across zones; podAntiAffinity so replicas are not all on\n' +
      '              one node; priorityClasses so serving preempts batch.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The standard stack: the <b>NVIDIA GPU Operator</b> (drivers, device plugin, MIG), ' +
      '<b>HPA + KEDA</b> for pods, <b>Cluster Autoscaler / Karpenter</b> for nodes, <b>PodDisruptionBudgets</b> + <b>topology spread</b> for resilience, and ' +
      '<b>KServe</b> or the serving runtime\'s own operator on top. Model-aware queue-based autoscaling is provided by KServe / <b>Kubernetes AI/Gateway API Inference Extension</b>. ' +
      'You configure these objects; you do not write a scheduler.</p></div>',
      try: [
        ['📖 NVIDIA — GPU Operator', 'https://docs.nvidia.com/datacenter/cloud-native/gpu-operator/latest/index.html', 'o'],
        ['📖 Kubernetes — Pod Disruption Budgets', 'https://kubernetes.io/docs/concepts/workloads/pods/disruptions/', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>Rollouts drop live generations.</b> ' +
      'Every deploy causes a spike of 5xx and truncated streaming responses. Cause: pods get SIGTERM and die in the default 30 s while 60-second generations are ' +
      'still running, and readiness flips to Ready before the model finishes loading so traffic hits a cold pod. Fixes: <code>terminationGracePeriodSeconds: 120</code>, ' +
      'a <code>preStop</code> sleep + connection draining, the app handling SIGTERM by finishing in-flight requests and refusing new ones, and a <b>readiness probe</b> ' +
      'that only passes after a real test inference succeeds. Deploys become invisible to users.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>GPU nodes cost a fortune at 20% utilisation.</b> ' +
      'Each 7B model gets its own 80 GB GPU pod; most sit near-idle. Fixes: enable <b>MIG</b> to slice the GPU into 3-7 instances, or <b>time-slicing / MPS</b> for ' +
      'bursty low-QPS models, and pack several models per physical GPU. Add a <b>priorityClass</b> so latency-critical serving can preempt batch scoring jobs sharing ' +
      'the pool, and Karpenter to consolidate under-used nodes. Utilisation goes from ~20% to ~70%.</p></div>' +
      '<p><b>Startup is the enemy of autoscaling.</b> If a new GPU pod takes 4 minutes to be Ready (node join + image pull + weight load), your HPA must have already ' +
      'scaled <i>before</i> the spike — keep a warm floor, pre-pull images, and consider a small over-provisioned "pause" deployment (Part 6 Ch 9).</p>',
      try: [
        ['📖 Kubernetes — pod lifecycle & termination', 'https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/', 'o'],
        ['📖 NVIDIA — Multi-Instance GPU (MIG) user guide', 'https://docs.nvidia.com/datacenter/tesla/mig-user-guide/', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'HPA on CPU for a GPU model             Scale on QPS / queue depth / GPU util / TTFT. CPU barely moves.\n' +
      'No startupProbe, tight readiness        Generous startupProbe for weight loading; readiness passes only\n' +
      '                                       after a real test inference.\n' +
      'Default 30 s termination grace          Raise it above p99 generation time; preStop drain; SIGTERM\n' +
      '                                       handler finishes in-flight, refuses new.\n' +
      'One GPU per small model                 MIG / MPS / time-slicing + bin-packing. Idle HBM is pure cost.\n' +
      'No PodDisruptionBudget                  Set maxUnavailable so node drains and rollouts do not evict the\n' +
      '                                       whole service.\n' +
      'Replicas all on one node/zone           topologySpreadConstraints + podAntiAffinity across zones.\n' +
      'Batch jobs starve serving                priorityClasses: serving > batch, with preemption.\n' +
      'memory limit == request, tight          Model memory spikes (long context, batching). Leave headroom\n' +
      '                                       or OOMKill drops the pod mid-request.\n' +
      'Autoscaler expected to handle the spike   GPU node join is minutes. Warm floor + pre-pulled images +\n' +
      '                                       over-provision buffer.</code></pre>' +
      '<p><b>KServe vs raw Deployment (recap from Part 6 Ch 4):</b> use KServe on a multi-model platform for request-driven autoscaling (incl. scale-to-zero), ' +
      'canary, and the standard protocol; a plain Deployment + HPA is fine for one steady high-QPS service and less machinery.</p>',
      try: [
        ['📖 Kubernetes — HPA on custom & external metrics', 'https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/', 'o'],
        ['📖 Kubernetes — Gateway API Inference Extension', 'https://gateway-api-inference-extension.sigs.k8s.io/', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Why is CPU-based HPA wrong for a GPU inference deployment?\n' +
      '   A: The GPU and the request queue saturate long before CPU does, so CPU-based scaling under-reacts.\n' +
      '   Scale on QPS, queue depth, GPU utilisation, or TTFT.\n\n' +
      'Q: Deploys cause truncated streaming responses and 5xx. What Kubernetes settings fix it?\n' +
      '   A: terminationGracePeriodSeconds above p99 generation time, a preStop drain hook, a SIGTERM handler\n' +
      '   that finishes in-flight and rejects new requests, and a readiness probe that only passes after a real\n' +
      '   test inference (so traffic never hits a cold pod).\n\n' +
      'Q: GPU utilisation is ~20% because each small model has its own GPU. Options?\n' +
      '   A: MIG to partition the GPU into isolated instances, or MPS/time-slicing for bursty low-QPS models,\n' +
      '   plus bin-packing several models per GPU and node consolidation (Karpenter). Add priorityClasses so\n' +
      '   serving preempts batch on shared pools.\n\n' +
      'Q: Why can the autoscaler alone not handle a sudden 5x spike?\n' +
      '   A: A new GPU pod needs a node to join (minutes), an image pull, and a multi-GB weight load. You must\n' +
      '   already hold a warm floor / over-provisioned buffer and pre-pull images.\n\n' +
      'Q: What does a PodDisruptionBudget protect against?\n' +
      '   A: Voluntary disruptions — node drains, cluster upgrades, rollouts — evicting too many replicas at\n' +
      '   once. minAvailable/maxUnavailable keeps enough capacity serving throughout.\n\n' +
      'Q: When do you reach for KServe instead of a plain Deployment + HPA?\n' +
      '   A: A multi-model platform needing request-based autoscaling (incl. scale-to-zero), canary, and a\n' +
      '   standard prediction protocol. For one steady high-QPS service, a Deployment + HPA is simpler.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="../learn6/#ch4">Part 6 Ch 4</a> (serving runtimes), <a href="../learn6/#ch9">Part 6 Ch 9</a> (scaling &amp; load management), ' +
      '<a href="#ch5">Ch 5</a> (rollouts on K8s), <a href="#ch13">Ch 13</a> (IaC for the cluster), <a href="../learn9/#ch9">Part 9 Ch 9</a> (multi-cluster).</p>',
      try: [
        ['📖 Karpenter — concepts (provisioning & consolidation)', 'https://karpenter.sh/docs/concepts/', 'o'],
        ['📖 KServe — deploying models on Kubernetes', 'https://kserve.github.io/website/latest/', 'o']
      ] }
  ],

  quiz: [
    { q: 'Model-serving deploys cause 5xx spikes and truncated streaming responses. Which Kubernetes fix set addresses this?',
      opts: [
        'Reduce the number of replicas',
        'Raise terminationGracePeriodSeconds above p99 generation time, add a preStop drain and SIGTERM handling, and make readiness pass only after a successful test inference',
        'Switch to a smaller container base image',
        'Disable the liveness probe'],
      ok: 1,
      why: 'The pod is killed before long generations finish, and traffic hits pods that report Ready before weights are loaded. Graceful termination plus a strict readiness probe make rollouts invisible to users.' },
    { q: 'GPU utilisation is ~20% because every small model has a dedicated GPU. Best approach?',
      opts: [
        'Buy more GPUs',
        'Partition/share the GPU with MIG or MPS/time-slicing, bin-pack multiple models per physical GPU, consolidate under-used nodes, and use priorityClasses so serving preempts batch',
        'Run the models on CPU only',
        'Increase each pod\'s memory limit'],
      ok: 1,
      why: 'Idle GPU memory is pure cost. Slicing/sharing the device and packing models onto it, plus node consolidation and priority-based preemption, raises utilisation substantially.' },
    { q: 'Why can a Horizontal Pod Autoscaler alone not absorb a sudden 5× traffic spike for a GPU service?',
      opts: [
        'HPAs only work on CPU',
        'A new GPU pod needs a node to join (minutes), an image pull, and a multi-GB weight load, so capacity must already be warm — a floor of replicas, over-provision buffer, pre-pulled images',
        'HPAs are disabled by default',
        'Spikes never last long enough to matter'],
      ok: 1,
      why: 'GPU cold-start latency is minutes. Reactive scaling cannot catch a 90-second spike; you must hold headroom in advance.' }
  ]
};
