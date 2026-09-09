"""
finetuning/step1_lora.py
========================
LoRA — Low-Rank Adaptation.

Full fine-tuning retrains every weight. LoRA freezes them and trains a
tiny low-rank patch instead: y = W0 x + B (A x) * scale, where only A
and B learn.

Setup: a frozen 6x6 base map W0, and a target map that equals W0 plus
a genuine RANK-1 perturbation. A LoRA patch of rank 1 has exactly the
capacity to represent that correction — so it should drive the error
to ~0 while training a fraction of the weights.
"""
import sys
import random

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from finetuning import LoRALinear, sgd, mse

D = 5
rng = random.Random(1)

# frozen base weights
W0 = [[rng.uniform(-1, 1) for _ in range(D)] for _ in range(D)]

# target = base + a rank-1 perturbation  (u v^T, deliberately small)
u = [rng.uniform(-0.6, 0.6) for _ in range(D)]
v = [rng.uniform(-0.6, 0.6) for _ in range(D)]
W_target = [[W0[o][i] + u[o] * v[i] for i in range(D)] for o in range(D)]

# training data
XS = [[rng.uniform(-1, 1) for _ in range(D)] for _ in range(12)]
YS = [[sum(W_target[o][i] * x[i] for i in range(D)) for o in range(D)] for x in XS]

lora = LoRALinear(D, D, rank=1, alpha=2.0, base_W=W0, seed=7, a_scale=1.0)

def baseline_loss():
    err = 0.0
    for x, y in zip(XS, YS):
        pred = [sum(W0[o][i] * x[i] for i in range(D)) for o in range(D)]
        err += sum((p - t) ** 2 for p, t in zip(pred, y)) / D
    return err / len(XS)

def loss_fn():
    total = None
    for x, y in zip(XS, YS):
        l = mse(lora(x), y)
        total = l if total is None else total + l
    return total * (1.0 / len(XS))

print("Step 1 — LoRA vs full fine-tuning\n")
print(f"base map: {D}x{D} = {D*D} frozen weights")
print(f"LoRA rank 1 → {lora.n_trainable()} trainable weights")
print(f"a full fine-tune would retrain {lora.n_full_finetune()} weights")
print(f"  (at LLM scale: ~100M LoRA params vs ~175B full — 1000x fewer)\n")

before = baseline_loss()
print(f"frozen base, no adaptation : loss = {before:.5f}")
hist = sgd(lora.parameters(), loss_fn, steps=500, lr=0.3, log_every=100)
after = hist[-1]
print(f"after LoRA adaptation      : loss = {after:.5f}")
print(f"error cut to {after/before*100:.2f}% of the un-adapted baseline")

assert after < before * 0.15, f"LoRA barely helped: {after} vs {before}"
assert after < 0.005, f"LoRA did not converge: {after}"
assert lora.n_trainable() < lora.n_full_finetune()
print("\nPASS: a rank-1 patch on frozen weights fit the correction "
      "while training fewer weights than a full fine-tune")
