"""
finetuning/finetuning.py
========================
Teaching a trained model NEW behaviour, three ways:

  1. LoRA        — freeze the big weights, train a tiny low-rank patch
  2. Reward model — learn a score for "which answer do humans prefer?"
  3. DPO         — optimise the model directly on preference pairs,
                   no reward model, no reinforcement-learning loop

All built on the scalar autograd `Value` from micrograd/ — the same
engine that trained the MLP in Phase 1. Pure Python, zero deps.
"""

import os
import sys
import random

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "micrograd"))
from engine import Value   # noqa: E402


# ── helpers on top of the autograd engine ──────────────────────────

def sigmoid(v):
    """1 / (1 + e^-v), as a differentiable Value expression."""
    if not isinstance(v, Value):
        v = Value(v)
    return (1.0 + (-v).exp()) ** -1


def bt_loss(score_chosen, score_rejected, beta=1.0):
    """
    Bradley-Terry / DPO preference loss:
        -log sigmoid( beta * (s_chosen - s_rejected) )
    Minimised when the chosen item scores well above the rejected one.
    """
    margin = (score_chosen - score_rejected) * beta
    return -(sigmoid(margin).log())


def mse(preds, targets):
    n = len(preds)
    return sum((p - Value(t)) ** 2 for p, t in zip(preds, targets)) * (1.0 / n)


# ── a plain trainable linear layer (all weights are Values) ─────────

class TrainableLinear:
    def __init__(self, in_dim, out_dim, seed=0, scale=0.1):
        rng = random.Random(seed)
        self.W = [[Value(rng.uniform(-scale, scale)) for _ in range(in_dim)]
                  for _ in range(out_dim)]
        self.b = [Value(0.0) for _ in range(out_dim)]

    def __call__(self, x):
        return [sum(self.W[o][i] * x[i] for i in range(len(x))) + self.b[o]
                for o in range(len(self.W))]

    def parameters(self):
        return [p for row in self.W for p in row] + self.b


# ── LoRA: frozen base + trainable low-rank patch ───────────────────

class LoRALinear:
    """
    y = W0 x  +  (B (A x)) * (alpha / rank)

    W0 is FROZEN (plain floats — never gets a gradient).
    A (rank x in) and B (out x rank) are the ONLY trainable weights.
    B starts at zero, so at step 0 the patch is a no-op and the model
    behaves exactly like the frozen base (the real LoRA convention).
    """

    def __init__(self, in_dim, out_dim, rank=1, alpha=1.0, base_W=None, seed=0,
                 a_scale=1.0):
        rng = random.Random(seed)
        self.in_dim, self.out_dim, self.rank = in_dim, out_dim, rank
        self.scale = alpha / rank
        self.W0 = base_W or [[rng.uniform(-1, 1) for _ in range(in_dim)]
                             for _ in range(out_dim)]
        # A ~ random, B = 0  → the patch starts as a no-op (LoRA convention)
        self.A = [[Value(rng.uniform(-a_scale, a_scale)) for _ in range(in_dim)]
                  for _ in range(rank)]
        self.B = [[Value(0.0) for _ in range(rank)] for _ in range(out_dim)]

    def __call__(self, x):
        ax = [sum(self.A[r][i] * x[i] for i in range(self.in_dim))
              for r in range(self.rank)]
        out = []
        for o in range(self.out_dim):
            base = sum(self.W0[o][i] * x[i] for i in range(self.in_dim))
            delta = sum(self.B[o][r] * ax[r] for r in range(self.rank)) * self.scale
            out.append(base + delta)
        return out

    def parameters(self):
        return ([p for row in self.A for p in row] +
                [p for row in self.B for p in row])

    def n_trainable(self):
        return self.rank * self.in_dim + self.out_dim * self.rank

    def n_full_finetune(self):
        return self.out_dim * self.in_dim + self.out_dim


# ── a minimal SGD training loop ────────────────────────────────────

def sgd(params, loss_fn, steps=300, lr=0.05, log_every=0):
    history = []
    for t in range(steps):
        loss = loss_fn()
        for p in params:
            p.grad = 0.0
        loss.backward()
        for p in params:
            p.data -= lr * p.grad
        history.append(loss.data)
        if log_every and t % log_every == 0:
            print(f"   step {t:>4}  loss {loss.data:.5f}")
    return history


def win_rate(score_fn, pairs):
    """Fraction of (chosen, rejected) pairs the scorer ranks correctly."""
    wins = sum(1 for c, r in pairs if score_fn(c).data > score_fn(r).data)
    return wins / len(pairs)


if __name__ == "__main__":
    # sigmoid + BT loss sanity
    assert abs(sigmoid(0.0).data - 0.5) < 1e-9
    lo = bt_loss(Value(5.0), Value(0.0))
    hi = bt_loss(Value(0.0), Value(5.0))
    assert lo.data < hi.data
    print("PASS: sigmoid + Bradley-Terry preference loss behave")
