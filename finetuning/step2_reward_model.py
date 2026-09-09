"""
finetuning/step2_reward_model.py
================================
RLHF step 2: turn human preferences into a NUMBER.

Humans don't hand you a score — they hand you comparisons: "answer A
is better than answer B". A reward model learns a scalar r(response)
such that r(chosen) > r(rejected), trained with the Bradley-Terry
loss:  -log sigmoid(r_chosen - r_rejected).

Here a "response" is a 4-feature vector [helpful, harmless, concise,
on_topic]. A hidden utility decides the true preference; the reward
model never sees it and must recover the ranking from comparisons
alone.
"""
import sys
import random

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from finetuning import TrainableLinear, bt_loss, sgd, win_rate
from engine import Value

rng = random.Random(0)
FEATS = ["helpful", "harmless", "concise", "on_topic"]


def rand_response():
    return [round(rng.uniform(0, 1), 2) for _ in FEATS]


def hidden_utility(r):
    # the humans' (unknown to the model) preference rule
    return 2.0 * r[0] + 2.5 * r[1] + 0.5 * r[2] + 1.0 * r[3]


def make_pairs(n):
    pairs = []
    for _ in range(n):
        a, b = rand_response(), rand_response()
        if hidden_utility(a) >= hidden_utility(b):
            pairs.append((a, b))       # (chosen, rejected)
        else:
            pairs.append((b, a))
    return pairs


train_pairs = make_pairs(24)
test_pairs = make_pairs(24)

rm = TrainableLinear(len(FEATS), 1, seed=3, scale=0.1)


def score(resp):
    return rm([Value(x) for x in resp])[0]


def loss_fn():
    total = None
    for chosen, rejected in train_pairs:
        l = bt_loss(score(chosen), score(rejected))
        total = l if total is None else total + l
    return total * (1.0 / len(train_pairs))


print("Step 2 — learn a reward model from preference comparisons\n")
print(f"features: {FEATS}")
print(f"train pairs: {len(train_pairs)}   test pairs: {len(test_pairs)}\n")

print(f"before training  — test win-rate: {win_rate(score, test_pairs)*100:.1f}%")
sgd(rm.parameters(), loss_fn, steps=300, lr=0.3, log_every=100)
after_train = win_rate(score, train_pairs)
after_test = win_rate(score, test_pairs)
print(f"after training   — train win-rate: {after_train*100:.1f}%   "
      f"test win-rate: {after_test*100:.1f}%")

learned = [round(w.data, 2) for w in rm.parameters()[:len(FEATS)]]
print(f"\nlearned feature weights: {dict(zip(FEATS, learned))}")
print("(true rule weighted harmless and helpful highest — the model should agree)")

assert after_train >= 0.95, f"reward model underfit the training prefs: {after_train}"
assert after_test >= 0.80, f"reward model didn't generalise: {after_test}"
assert learned[1] == max(learned), "should learn that 'harmless' matters most"
print("\nPASS: the reward model recovered the human ranking from comparisons alone")
