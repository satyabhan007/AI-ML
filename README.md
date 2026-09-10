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
- 🧪 **[The Interactive Playground](https://satyabhan007.github.io/AI-ML/lab/playground.html)** — 6 browser labs, zero install.
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
- **[Claude 101](https://academy.claude.com/courses/claude-101)** — Anthropic's introduction to working with Claude.
- **[Introduction to Claude Cowork](https://academy.claude.com/courses/introduction-to-claude-cowork)** — Anthropic's course on collaborating with Claude on real work.

---

## 🔄 Automatic repository sync

Changes to markdown, Python, and lab files in the workspace are picked
up by a background watcher and pushed to GitHub; `deploy-pages.yml` then
publishes the static site plus the raw lesson sources to GitHub Pages.

## License

MIT — see [`LICENSE`](LICENSE).
