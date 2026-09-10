# AI-ML — From-Scratch AI Engineering Curriculum
[![GitHub Pages](https://img.shields.io/badge/Live%20Site-GitHub%20Pages-252932?logo=githubpages&labelColor=252932&color=3b82f6)](https://satyabhan007.github.io/AI-ML/)
[![Course](https://img.shields.io/badge/Course-8%20chapters%20%C3%97%205%20levels-8b5cf6)](https://satyabhan007.github.io/AI-ML/learn/)
[![AI Lab Tests](https://github.com/satyabhan007/AI-ML/actions/workflows/lab-tests.yml/badge.svg)](https://github.com/satyabhan007/AI-ML/actions/workflows/lab-tests.yml)
[![Python 3.13](https://img.shields.io/badge/Python-3.13-3776ab?logo=python&logoColor=white)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> Hands-on, zero-black-box implementations of modern AI/ML — from a scalar
> autograd engine to a quantized model served in production — in pure
> Python, no dependencies.

**Ways in:**
- 🌐 **[Course · Part 1 — Fundamentals](https://satyabhan007.github.io/AI-ML/learn/)** — 8 chapters × 5 levels (analogy → expert), built from scratch, with live labs.
- 📗 **[Course · Part 2 — Applied](https://satyabhan007.github.io/AI-ML/learn2/)** — 15 chapters × 5 levels on shipping LLM systems: structured output, tool calling, context engineering, vector DBs, RAG, reranking, agents, MCP, deterministic pipelines, evals, guardrails, caching, observability, fine-tuning.
- 📙 **[Course · Part 3 — The Python Stack (interview edition)](https://satyabhan007.github.io/AI-ML/learn3/)** — 16 chapters × 5 levels on NumPy, pandas, Matplotlib/Seaborn, SciPy, statsmodels, scikit-learn, XGBoost/LightGBM/CatBoost, SHAP, Optuna, PyTorch, Keras, Hugging Face, spaCy, OpenCV, time series and MLOps — each chapter ends in an interview drill.
- 📕 **[Course · Part 4 — ML Interviews & Production Systems](https://satyabhan007.github.io/AI-ML/learn4/)** — 17 chapters × 5 levels on the ML interview map, probability & stats, classical ML theory, DL architectures & training, recommenders, search & ranking, A/B testing, causal inference, ML system design, SQL, distributed training, production monitoring & drift, and responsible AI — each ending in a deep interview drill.
- 📓 **[Course · Part 5 — Databases & Data Systems](https://satyabhan007.github.io/AI-ML/learn5/)** — 18 chapters × 5 levels on SQL, NoSQL, vector & graph databases with production depth: data modeling, indexes & query planners, transactions & isolation, replication, sharding, CAP/PACELC, PostgreSQL, Redis/DynamoDB, MongoDB, Cassandra, LSM vs B-tree, the lakehouse, Elasticsearch, vector DBs, graph DBs, Kafka/CDC, datastore selection, and DB operations — each ending in an interview drill with two production scenarios per chapter.
- 🏗️ **[Course · Part 6 — AI/ML System Design](https://satyabhan007.github.io/AI-ML/learn6/)** — 16 chapters × 5 levels on designing AI/ML systems at scale: capacity math & SLOs, online/batch/streaming serving, the inference gateway, KServe/Triton/vLLM/TGI/BentoML, feature stores & training-serving skew, retrieval at scale, caching for AI, GPU autoscaling & backpressure, multi-region & fallback models, cost/perf tradeoffs, and two end-to-end design walkthroughs — each ending in an interview drill.
- 🚀 **[Course · Part 7 — Production Deployment & Delivery](https://satyabhan007.github.io/AI-ML/learn7/)** — 16 chapters × 5 levels on shipping AI/ML: containers & reproducibility, model/artifact registries, CI for ML, GitOps CD (Argo CD / Flux), progressive delivery (canary, blue-green, shadow traffic), Kubernetes for model workloads, managed inference, eval-in-CI release gates, rollback & kill switches, load testing, migrations, IaC, and supply-chain security — each ending in an interview drill.
- 📡 **[Course · Part 8 — AI Observability & Production Metrics](https://satyabhan007.github.io/AI-ML/learn8/)** — 16 chapters × 5 levels on OpenTelemetry, Prometheus & Grafana, golden signals / RED / USE, SLOs & error budgets, LLM telemetry (tokens, cost/request, TTFT, cache-hit), tracing an agent request, eval-in-prod, drift & data quality, guardrail & safety metrics, dashboards, burn-rate alerting, AI-enriched ops, and cost observability / FinOps — each ending in an interview drill.
- 🏢 **[Course · Part 9 — Enterprise-Scale AI/ML in Production](https://satyabhan007.github.io/AI-ML/learn9/)** — 16 chapters × 5 levels on platform engineering & the paved road, multi-tenancy & quotas, model & data governance, security for AI systems, compliance (EU AI Act, NIST AI RMF, ISO/IEC 42001, SOC 2), responsible AI, FinOps at scale, reliability & cell architecture, LLMOps, org design, vendor portability, a reference architecture, and an enterprise-readiness checklist — each ending in an interview drill.
- 🧪 **[The Interactive Playground](https://satyabhan007.github.io/AI-ML/lab/playground.html)** — 6 browser labs, zero install.

> **Standard, not from-scratch.** Parts 1–5 build the primitives in pure Python. Parts 6–9 teach the *industry-standard* production stack — Kubernetes, OpenTelemetry, Prometheus, Argo, Terraform, KServe — configured and operated, not reimplemented. Each Part 6–9 chapter names the canonical tool and ships minimal, CI-validated config under `learnN/labs/`.
- 📂 Or read the source below, module by module.

---

## 🗺️ Repository structure

```
AI-ML/
├── micrograd/     # 1 · Autograd engine & neural nets (engine.py, nn.py, step1–3)
├── tokenizer/     # 2 · Byte-pair encoding tokenizer (bpe.py, step1–3)
├── matmul/        # 3 · Matrix multiply: naive → tiled → Strassen → matvec (step1–4)
├── attention/     # 4 · Self-attention & the transformer block (attention.py, step1–3)
├── embeddings/    # 5 · Cosine, skip-gram Word2Vec, LSH nearest-neighbour (step1–3)
├── rag/           # 6 · Prompt templates, retrieval + grounding, a ReAct agent (step1–3)
├── finetuning/    # 7 · LoRA, Bradley-Terry reward model, DPO — on the micrograd engine (step1–3)
├── serving/       # 8 · INT8 quantization, KV-cache, continuous batching, roofline (step1–3)
│
├── learn/         # Course Part 1 — Fundamentals: 8 chapters × 5 levels (static site)
├── learn2/        # Course Part 2 — Applied: 15 chapters × 5 levels (tool calling, RAG,
│                  #   agents, MCP, evals, guardrails, caching, observability, fine-tuning, …)
├── learn3/        # Course Part 3 — Python Stack, interview edition: 16 chapters × 5 levels
│                  #   (NumPy, pandas, sklearn, boosting, SHAP, PyTorch, HF, spaCy, CV, TS, MLOps)
├── learn4/        # Course Part 4 — ML Interviews & Production Systems: 17 chapters × 5 levels
│                  #   (interview map, prob/stats, ML theory, DL, recsys, ranking, A/B, causal,
│                  #    system design, SQL, distributed training, monitoring/drift, responsible AI)
├── learn5/        # Course Part 5 — Databases & Data Systems: 18 chapters × 5 levels
│                  #   (modeling, indexes, transactions, replication, sharding, CAP, Postgres,
│                  #    Redis, Mongo, Cassandra, LSM/B-tree, lakehouse, Elasticsearch, vector,
│                  #    graph, Kafka/CDC, datastore choice, DB ops)
├── learn6/        # Course Part 6 — AI/ML System Design: 16 chapters × 5 levels + labs/
│                  #   (capacity/SLOs, serving architectures, KServe/Triton/vLLM, feature stores,
│                  #    retrieval at scale, caching, autoscaling, multi-region, cost/perf)
├── learn7/        # Course Part 7 — Production Deployment & Delivery: 16 chapters × 5 levels + labs/
│                  #   (containers, registries, CI for ML, GitOps, progressive delivery, K8s,
│                  #    managed inference, release gates, rollback, load testing, IaC, supply chain)
├── learn8/        # Course Part 8 — AI Observability & Production Metrics: 16 chapters × 5 levels + labs/
│                  #   (OpenTelemetry, Prometheus/Grafana, golden signals, SLOs, LLM telemetry,
│                  #    tracing, eval-in-prod, drift, guardrail metrics, alerting, FinOps)
├── learn9/        # Course Part 9 — Enterprise-Scale AI/ML: 16 chapters × 5 levels + labs/
│                  #   (platform engineering, multi-tenancy, governance, security, compliance,
│                  #    responsible AI, FinOps at scale, reliability, LLMOps, org design)
│                  #
│                  # learn6-9 share /assets/course.{css,js} (one renderer, lazy per-chapter data)
├── lab/           # playground.html (6 live labs) + scenarios_tester.py (69 checks)
└── *.md           # Root explainer guides mirrored from micrograd/ (REPORT, VISUAL_GUIDE, …)
```

Every module has the same shape: a core `.py` library, three or four
`stepN_*.py` walkthroughs you can run standalone, and a
`BEGINNER_GUIDE.md` with everyday analogies.

---

## ⚡ Quick start

```bash
git clone https://github.com/satyabhan007/AI-ML.git
cd AI-ML

# 1. run the full test suite — 69 checks, ~10s, zero deps
python lab/scenarios_tester.py

# 2. open the playground (no server needed)
#    double-click lab/playground.html

# 3. walk any module
python micrograd/step3_full_network.py
python attention/step3_mini_transformer.py
python embeddings/step2_learn_word_vectors.py
python rag/step3_agent_loop.py
python finetuning/step1_lora.py
python serving/step2_kv_cache.py
```

`lab/scenarios_tester.py` runs two passes:

- **Part 1 · layer-by-layer unit tests** — every engine op's gradient vs
  numerical differentiation · Neuron/Layer/MLP anatomy · a fresh MLP
  trains to 100% · BPE roundtrips · softmax / √d / causal mask /
  positional encoding · naive = tiled = Strassen, exact flop counts ·
  cosine + analogy + LSH recall · RAG retrieval routing, grounding,
  refusal, safe tools · sigmoid / Bradley-Terry / LoRA · INT8 quant,
  KV-cache speed-up, continuous batching.
- **Part 2 · real-world scenarios** — ☂ umbrella · 📧 spam on unseen
  mail · 🏠 house prices · 💬 API billing · 🔬 autograd unit test ·
  🌡 temperature sampling · 👤 pronoun resolution · 📈 O(n²) cost ·
  🎭 causal-mask proof · 🤖 mini transformer trained end-to-end.

---

## 📚 Explainer guides

| Guide | Topic |
|---|---|
| [`micrograd/REPORT.md`](micrograd/REPORT.md) | Autograd & backprop — 1800+ line reference |
| [`micrograd/BEGINNER_GUIDE.md`](micrograd/BEGINNER_GUIDE.md) | Neural nets 101 — plain-English analogies |
| [`micrograd/VISUAL_GUIDE.md`](micrograd/VISUAL_GUIDE.md) | DAG backward-pass walkthroughs |
| [`tokenizer/BEGINNER_GUIDE.md`](tokenizer/BEGINNER_GUIDE.md) | BPE tokenization — bytes → tokens, compression, UTF-8 |
| [`matmul/BEGINNER_GUIDE.md`](matmul/BEGINNER_GUIDE.md) | Why matmul is 80% of a forward pass, and how tiling helps |
| [`attention/BEGINNER_GUIDE.md`](attention/BEGINNER_GUIDE.md) | Queries, keys, values — and the O(n²) bill |
| [`embeddings/BEGINNER_GUIDE.md`](embeddings/BEGINNER_GUIDE.md) | Meaning as geometry; skip-gram; LSH for billion-scale search |
| [`rag/BEGINNER_GUIDE.md`](rag/BEGINNER_GUIDE.md) | Prompt templates, retrieval + grounding + refusal, the ReAct loop |
| [`finetuning/BEGINNER_GUIDE.md`](finetuning/BEGINNER_GUIDE.md) | LoRA vs full fine-tune, reward models, DPO without RL |
| [`serving/BEGINNER_GUIDE.md`](serving/BEGINNER_GUIDE.md) | INT8 quantization, KV-cache O(n), continuous batching, roofline |

---

## 🎓 Keep learning

- **[Course · Part 1](https://satyabhan007.github.io/AI-ML/learn/)** (this repo) — the eight topics above as a guided 8 × 5 course.
- **[Course · Part 2](https://satyabhan007.github.io/AI-ML/learn2/)** (this repo) — applied AI engineering, 15 × 5: tool calling, context engineering, vector DBs, RAG, reranking, agents, MCP, deterministic pipelines, evals, guardrails, caching, observability, fine-tuning.
- **[Course · Part 3](https://satyabhan007.github.io/AI-ML/learn3/)** (this repo) — the Python DS/ML library stack, 16 × 5, interview edition: NumPy, pandas, viz, SciPy, statsmodels, scikit-learn, boosting, SHAP, Optuna, PyTorch, Keras, Hugging Face, spaCy, OpenCV, time series, MLOps.
- **[Course · Part 4](https://satyabhan007.github.io/AI-ML/learn4/)** (this repo) — ML interviews & production systems, 17 × 5: interview map, probability/stats, classical ML theory, DL architectures & training, recommenders, search/ranking, A/B testing, causal inference, ML system design, SQL, distributed training, production monitoring & drift, responsible AI.
- **[Course · Part 5](https://satyabhan007.github.io/AI-ML/learn5/)** (this repo) — databases & data systems, 18 × 5: SQL/NoSQL/vector/graph with production depth — modeling, indexes, transactions, replication, sharding, CAP, Postgres, Redis, Mongo, Cassandra, LSM vs B-tree, lakehouse, Elasticsearch, vector DBs, graph DBs, Kafka/CDC, datastore selection, DB operations.
- **[Course · Part 6](https://satyabhan007.github.io/AI-ML/learn6/)** (this repo) — AI/ML system design, 16 × 5: capacity math & SLOs, serving architectures, KServe/Triton/vLLM, feature stores & training-serving skew, retrieval at scale, caching, GPU autoscaling & backpressure, multi-region & fallback models, cost/perf, two end-to-end walkthroughs.
- **[Course · Part 7](https://satyabhan007.github.io/AI-ML/learn7/)** (this repo) — production deployment & delivery, 16 × 5: containers & reproducibility, registries, CI for ML, GitOps CD, progressive delivery, Kubernetes for model workloads, managed inference, eval-in-CI gates, rollback & kill switches, load testing, migrations, IaC, supply-chain security.
- **[Course · Part 8](https://satyabhan007.github.io/AI-ML/learn8/)** (this repo) — AI observability & production metrics, 16 × 5: OpenTelemetry, Prometheus/Grafana, golden signals/RED/USE, SLOs & error budgets, LLM telemetry, tracing an agent request, eval-in-prod, drift & data quality, guardrail & safety metrics, dashboards, burn-rate alerting, AI-enriched ops, FinOps.
- **[Course · Part 9](https://satyabhan007.github.io/AI-ML/learn9/)** (this repo) — enterprise-scale AI/ML, 16 × 5: platform engineering & the paved road, multi-tenancy & quotas, model & data governance, security for AI systems, compliance (EU AI Act, NIST AI RMF, ISO/IEC 42001, SOC 2), responsible AI, FinOps at scale, reliability & cell architecture, LLMOps, org design, vendor portability, reference architecture, readiness checklist.
- **[Claude 101](https://academy.claude.com/courses/claude-101)** — Anthropic's introduction to working with Claude.
- **[Introduction to Claude Cowork](https://academy.claude.com/courses/introduction-to-claude-cowork)** — Anthropic's course on collaborating with Claude on real work.

---

## 🔄 Automatic repository sync

Changes to markdown, Python, and lab files in the workspace are picked
up by a background watcher and pushed to GitHub; `deploy-pages.yml` then
publishes the static site plus the raw lesson sources to GitHub Pages.

## License

MIT — see [`LICENSE`](LICENSE).
