# Fine-tuning & RLHF — The Amateur's Guide

> Prompting changes what you *say* to the model. Fine-tuning changes
> the model. RLHF is fine-tuning where the training signal is human
> taste instead of a right answer.

---

## 1. When prompting and RAG run out

| Problem | Reach for |
|---------|-----------|
| Model doesn't know your facts | **RAG** (`rag/`) |
| Model doesn't follow your *format* or *tone* reliably | **fine-tuning** |
| Model won't behave — too verbose, unsafe, off-brand | **RLHF / DPO** |
| You need it smaller / cheaper to run | **quantization** (`serving/`) |

Fine-tuning nudges the **weights** so the behaviour is baked in and
doesn't cost prompt tokens every call.

---

## 2. LoRA — don't retrain the whole model

A 7-billion-parameter model has 7 billion knobs. Full fine-tuning
adjusts all of them: huge memory, huge storage, one copy per task.

**LoRA (Low-Rank Adaptation)** freezes the original weights `W0` and
learns a small **patch** instead:

```
y = W0 · x  +  (B · A · x) · scale
     └─frozen─┘   └── trainable, tiny ──┘
```

`A` is `rank × in`, `B` is `out × rank`, with `rank` as small as 1–16.
`B` starts at **zero**, so the patched model *starts identical to the
base* and only drifts as far as training pushes it.

`step1_lora.py` sets up a frozen `5×5` map whose target differs by a
genuine **rank-1** correction, then fits it with a rank-1 patch:

```
base map: 25 frozen weights
LoRA rank 1 → 10 trainable weights   (a full fine-tune = 30)
loss: 0.012  →  0.0008   (error cut to ~9% of the un-adapted baseline)
```

At real scale the ratio is brutal in your favour: a LoRA adapter for a
7B model is a few *megabytes* and trains on one GPU; the full model is
tens of gigabytes. You keep one frozen base and swap tiny adapters per
task.

**Analogy — sticky notes on a textbook.** You don't rewrite the
textbook to add your course's spin. You add margin notes. The book is
shared; everyone's notes are their own and small.

---

## 3. RLHF — training on preference, not on answers

For "write a good reply" there's no single correct label. What you
*can* get is **comparisons**: shown two replies, a human picks the
better one. Classic RLHF is three stages:

1. **SFT** — supervised fine-tune on demonstration data (normal
   fine-tuning).
2. **Reward model** — learn a scalar `r(response)` from the
   comparisons (`step2_reward_model.py`).
3. **RL** — let the model generate, and use `r` as the reward in a
   policy-gradient loop (PPO).

### The reward model (step 2)

Train `r` with the **Bradley-Terry loss**:

```
loss = -log sigmoid( r(chosen) - r(rejected) )
```

Low when `chosen` scores well above `rejected`. In the lab a "response"
is a 4-feature vector `[helpful, harmless, concise, on_topic]`; a
hidden human rule decides each preference and the model never sees it:

```
before training — test win-rate: 58%
after training  — train 100%, test 100%
learned weights: harmless 4.5, helpful 3.0, on_topic 2.0, concise 0.9
```

From comparisons *alone* it recovered that "harmless" and "helpful"
matter most — exactly the hidden rule.

**Analogy — a wine judge.** Nobody tells the judge the "true score" of
a wine. They taste pairs, say which is better, and over hundreds of
pairs a consistent scoring palate forms.

---

## 4. DPO — skip the reward model and the RL loop

The RL stage of RLHF is finicky (reward hacking, instability, careful
tuning). **Direct Preference Optimisation** proves you don't need it:
optimise the policy *directly* on the pairs with one supervised loss.

```
loss = -log sigmoid( beta · ( s_policy(chosen) - s_policy(rejected) ) )
```

Same Bradley-Terry shape as the reward model — but now it trains **the
model you'll ship**, not a separate scorer. `step3_preference_optimization.py`
runs it on a frozen base scorer + a rank-1 LoRA patch:

```
before DPO — win-rate  train 85%  test 75%   margin +0.27
after DPO  — win-rate  train 100% test 100%  margin +9.7
```

One loss, one loop, no reward model, no sampling. This is why DPO (and
cousins: IPO, KTO, ORPO) took over open-model alignment.

**Analogy — learning to cook for your family.** RLHF-with-RL: hire a
food critic (reward model), then cook thousands of dishes chasing the
critic's score. DPO: your family just points at the better of two
plates each night, and you adjust straight from that.

---

## 5. The whole ladder

```
pretraining        → learn language from the internet        (not here)
     ↓
SFT / fine-tuning  → learn a task's format and tone          (LoRA, step 1)
     ↓
reward model       → learn human taste as a number           (step 2)
     ↓
RLHF (PPO)  ── or ──  DPO   → move the policy onto that taste  (step 3)
     ↓
quantization + serving → make it cheap to run                 (serving/)
```

Every instruction-tuned model you've used — ChatGPT, Claude, Llama-Instruct,
Mistral-Instruct — climbed some version of this ladder.

---

## 6. Gotchas

- **Catastrophic forgetting** — fine-tune too hard on a narrow task and
  general ability degrades. LoRA's small capacity and the `B=0` start
  both help.
- **Preference data is the product.** Noisy or biased comparisons →
  a confidently wrong reward model → a confidently wrong policy.
- **Reward hacking** — the policy finds inputs that fool `r` without
  being genuinely better (e.g. always answering at max length). DPO
  reduces but doesn't remove this.
- **You still need a base worth patching.** Fine-tuning shapes
  behaviour; it doesn't add knowledge the base never had — use RAG for
  that.

---

## 7. Run it

```bash
cd finetuning
python step1_lora.py                    # frozen base + rank-1 patch
python step2_reward_model.py            # Bradley-Terry reward from prefs
python step3_preference_optimization.py # DPO: pairs → policy, no RL
```

Built on the `Value` engine from **`micrograd/`**. Next stop:
**`serving/`** — quantize the finished model and serve it cheaply.
