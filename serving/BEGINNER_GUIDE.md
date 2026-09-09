# Quantization & Serving — The Amateur's Guide

> Training is a one-time cost. Serving is a bill that arrives every
> day, forever. This module is about making that bill small.

---

## 1. The shift in mindset

Once a model is trained, you stop caring about accuracy-per-epoch and
start caring about:

| question | lever |
|----------|-------|
| Does it fit in GPU memory? | **quantization** |
| Why is decoding so slow? | **KV-cache** |
| Is the expensive GPU actually busy? | **batching** |
| Am I compute-bound or memory-bound? | **roofline** |

---

## 2. Quantization — smaller numbers, same model

A weight is a 32-bit float. Most of those bits are wasted precision.
Store each weight as an **8-bit integer** plus a shared **scale**:

```
float  ≈  int8  ×  scale
0.734  ≈   94   ×  0.0078
```

- **4x smaller** at INT8, **8x** at INT4. A 7B model: 28 GB → 7 GB →
  3.5 GB. That's the difference between "needs an A100" and "runs on a
  laptop GPU".
- The cost is **rounding error**. `step1_quantization.py` measures it.

**Per-tensor vs per-channel.** One scale for a whole matrix is cheap
but brutal when rows have different magnitudes — the big row sets the
scale and the small rows get almost no levels:

```
             mean error relative to each weight
  INT8 per-tensor   : 41 %      <- small rows destroyed
  INT8 per-channel  : 1.1 %     <- one scale PER ROW: ~37x better
  INT4 per-channel  : 16 %      <- more compression, more error
```

Per-channel (a scale per output channel) is nearly free and standard.
GPTQ, AWQ and friends go further: they pick scales that minimise the
error *on real activations*, not just on the weights.

**Analogy — shoe sizes.** One size for the whole family (per-tensor)
fits nobody well. One size per person (per-channel) fits everyone, and
costs you a short list of numbers.

---

## 3. KV-cache — stop recomputing the past

To generate token N, attention needs the **keys and values** of tokens
1…N-1. Two options:

- **No cache:** re-project all N-1 past tokens every step → each token
  costs O(n·d²) → the whole generation is **O(n²·d²)**. This is why a
  naive loop crawls.
- **Cache:** compute each token's K and V once, store them, and only
  project the **one** new token per step → each step is O(d²) + O(n·d)
  for the attention → generation is **~O(n·d²)**.

`step2_kv_cache.py`, generating 128 tokens after a 256-token prompt:

```
without KV-cache : 3.4e10 FLOPs
with    KV-cache : 2.2e8  FLOPs      (~150x fewer)
```

And the shape of the cost:

```
doubling the context, per new token:
  no-cache   : x1.99   (re-projects the whole past — linear in context)
  with-cache : x1.25   (projections are constant; only attention grows)
```

That leftover growth — attention over an ever-longer cache — is exactly
why 100k-token generations still slow down, and why FlashAttention,
GQA/MQA (fewer KV heads → smaller cache) and PagedAttention exist.

**Analogy — a meeting secretary.** Without minutes, every latecomer
makes the whole room re-summarise the last hour. With minutes
(the cache), you hand them the notes and carry on. The notes still get
longer, so reading them isn't instant — but it beats re-running the
meeting.

**This is prefill vs decode.** The slow first token = *prefill*
(process the whole prompt, compute-bound). Then words stream = *decode*
(one token at a time, reading the cache, memory-bound).

---

## 4. Batching — keep the GPU full

A single user decoding one token barely touches the GPU's math units —
it's spent almost entirely **moving weights from memory** (see the
roofline below). The fix: serve many users at once, so one weight load
does work for everybody.

**Static batching:** load N requests, run them together, wait for the
**slowest** before loading the next N. A 5-token reply idles its lane
while a 500-token reply grinds on.

**Continuous batching (vLLM):** the instant a request finishes, admit
the next one into that lane.

`step3_serving_throughput.py`, 16 mixed-length requests on 4 lanes:

```
              steps   utilisation
  static        470       38 %
  continuous    200       90 %      <- 2.35x fewer steps, same hardware
```

**Analogy — a car wash.** Static: four cars go in, the doors don't open
until the dirtiest one is done. Continuous: the moment a car rolls out,
the next drives in. Same four bays, more than double the throughput.

---

## 5. Roofline — one number tells you what to optimise

**Arithmetic intensity** = FLOPs performed ÷ bytes moved.
**Ridge point** = peak FLOPs ÷ memory bandwidth.

- intensity **below** ridge → **memory-bound**: you're waiting on data.
  More cores won't help; quantize, cache, batch.
- intensity **above** ridge → **compute-bound**: you're doing real
  math. Bigger batches, better kernels, more FLOPs.

`step3` checks a 7B model generating one token: intensity ≈ 1, ridge ≈
156 → **memory-bound**. That single fact is why every trick in this
module (smaller weights, cached KV, bigger batches) targets *memory
traffic*, not raw compute.

**Analogy — a chef who cooks instantly but the pantry is far.** Adding
more chefs (FLOPs) does nothing; the bottleneck is trips to the pantry
(memory). Shrink the ingredients (quantize), keep prepped items on the
counter (cache), and cook many orders per pantry trip (batch).

---

## 6. The full serving stack

```
trained model
   │  quantize        → 4x smaller, fits the GPU
   ▼
prefill (prompt)      → compute-bound, one big pass
   │  KV-cache         → decode becomes ~O(n) instead of O(n²)
   ▼
decode (tokens)       → memory-bound
   │  continuous batching → one weight load serves many users
   ▼
tokens out, at a price you can afford
```

Every production LLM endpoint — OpenAI, Anthropic, Together, Fireworks,
a self-hosted vLLM server — is running this pipeline.

---

## 7. Run it

```bash
cd serving
python step1_quantization.py         # FP32 → INT8/INT4, per-tensor vs per-channel
python step2_kv_cache.py             # O(n²) → O(n) decoding
python step3_serving_throughput.py   # static vs continuous batching + roofline
```

Prereq ideas: **`matmul/`** (the FLOPs being counted) and **`attention/`**
(what the KV-cache is caching). This is the last module — from a scalar
`Value` to a served model.
