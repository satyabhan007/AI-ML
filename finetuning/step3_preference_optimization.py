"""
finetuning/step3_preference_optimization.py
===========================================
DPO — Direct Preference Optimisation.

Classic RLHF is three stages: supervised fine-tune -> train a reward
model (step 2) -> reinforcement-learning loop against it. DPO collapses
the last two into ONE supervised loss on the preference pairs directly:

    loss = -log sigmoid( beta * ( s_policy(chosen) - s_policy(rejected) ) )

No reward model. No RL. No sampling loop. Just the Bradley-Terry loss
pushing the policy to prefer chosen over rejected.

The policy here is a frozen base scorer + a trainable LoRA patch. The
scores stand in for the log-probability ratios a real DPO setup uses.
We watch the win-rate and the chosen-vs-rejected margin move.
"""
import sys
import random

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from finetuning import LoRALinear, bt_loss, sgd, win_rate
from engine import Value

rng = random.Random(1)
FEATS = ["helpful", "harmless", "concise", "on_topic"]


def rand_response():
    return [round(rng.uniform(0, 1), 2) for _ in FEATS]


def hidden_utility(r):
    return 2.0 * r[0] + 2.5 * r[1] + 0.4 * r[2] + 1.2 * r[3]


def make_pairs(n):
    out = []
    for _ in range(n):
        a, b = rand_response(), rand_response()
        out.append((a, b) if hidden_utility(a) >= hidden_utility(b) else (b, a))
    return out


train_pairs = make_pairs(20)
test_pairs = make_pairs(20)

# frozen base scorer (random) + rank-1 LoRA patch = the policy
policy = LoRALinear(len(FEATS), 1, rank=1, alpha=2.0, seed=5, a_scale=1.0)


def score(resp):
    return policy([Value(x) for x in resp])[0]


def margin(pairs):
    return sum(score(c).data - score(r).data for c, r in pairs) / len(pairs)


def loss_fn():
    total = None
    for c, r in train_pairs:
        l = bt_loss(score(c), score(r), beta=1.0)
        total = l if total is None else total + l
    return total * (1.0 / len(train_pairs))


print("Step 3 — Direct Preference Optimisation (DPO-style)\n")
print(f"policy = frozen base scorer + LoRA rank-1 patch "
      f"({policy.n_trainable()} trainable weights)")
print(f"train pairs: {len(train_pairs)}   test pairs: {len(test_pairs)}\n")

wr0_tr, wr0_te = win_rate(score, train_pairs), win_rate(score, test_pairs)
print(f"before DPO  — win-rate  train {wr0_tr*100:5.1f}%  test {wr0_te*100:5.1f}%"
      f"   margin train {margin(train_pairs):+.3f}")

sgd(policy.parameters(), loss_fn, steps=300, lr=0.3, log_every=100)

wr1_tr, wr1_te = win_rate(score, train_pairs), win_rate(score, test_pairs)
print(f"after DPO   — win-rate  train {wr1_tr*100:5.1f}%  test {wr1_te*100:5.1f}%"
      f"   margin train {margin(train_pairs):+.3f}")

assert wr1_tr > wr0_tr and wr1_tr >= 0.95, f"DPO didn't fit train prefs: {wr1_tr}"
assert wr1_te >= wr0_te and wr1_te >= 0.80, f"DPO didn't generalise: {wr1_te}"
assert margin(train_pairs) > 0.3, "chosen-vs-rejected margin should widen clearly"
print("\nPASS: one Bradley-Terry loss on the pairs — no reward model, no RL — "
      "moved the policy onto the human preference")
