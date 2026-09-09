"""
embeddings/step3_vector_search.py
=================================
"Find the meaning" == "find the nearest vectors".

Brute force is O(n·d): score every item, every query. Fine for
thousands, hopeless for billions. Random-hyperplane LSH buckets
similar vectors together, so a query only scores its bucket-mates.

We build 2,000 random vectors, run both, and measure:
  - recall@5 of LSH vs the exact answer
  - how few candidates LSH actually scores (the speed-up)
"""
import sys
import random

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from embeddings import normalize, nearest, LSHIndex, recall_at_k

DIM = 24
N = 1000
N_QUERIES = 100
BITS = 10
PROBE = 2
rng = random.Random(7)

# a dataset with real structure: 20 cluster centres + jitter
centres = [[rng.gauss(0, 1) for _ in range(DIM)] for _ in range(20)]
items = {}
for i in range(N):
    c = centres[i % 20]
    items[f"v{i}"] = normalize([x + rng.gauss(0, 0.35) for x in c])

lsh = LSHIndex(DIM, bits=BITS, seed=3)
for name, v in items.items():
    lsh.add(name, v)

print("Step 3 — vector search: brute force vs LSH\n")
print(f"dataset: {N} vectors, dim {DIM}, 20 latent clusters")
print(f"LSH: {BITS} hyperplanes → up to {2**BITS} buckets, "
      f"{len(lsh.buckets)} non-empty; multi-probe = {PROBE}\n")

queries = [items[f"v{rng.randrange(N)}"] for _ in range(N_QUERIES)]
recalls, cand_counts = [], []
for q in queries:
    exact = nearest(q, items, k=5)
    approx, n_cand = lsh.query(q, k=5, probe=PROBE)
    recalls.append(recall_at_k(exact, approx, 5))
    cand_counts.append(n_cand)

avg_recall = sum(recalls) / len(recalls)
avg_cand = sum(cand_counts) / len(cand_counts)

print(f"exact search   : scores {N} candidates per query")
print(f"LSH ({PROBE}-probe)  : scores {avg_cand:.0f} candidates per query "
      f"({N / avg_cand:.0f}x fewer)")
print(f"LSH recall@5   : {avg_recall * 100:.1f}%  "
      f"(fraction of the true top-5 it still found)")

# one worked example
q = queries[0]
print("\nexample query — top 5:")
print("  exact:", [n for n, _ in nearest(q, items, k=5)])
print("  LSH:  ", [n for n, _ in lsh.query(q, k=5, probe=PROBE)[0]])

assert avg_recall > 0.80, f"recall too low: {avg_recall}"
assert avg_cand < N / 2, f"LSH scored too many candidates: {avg_cand}"
print(f"\nPASS: LSH kept {avg_recall*100:.0f}% recall while scoring "
      f"{N/avg_cand:.0f}x fewer vectors")
