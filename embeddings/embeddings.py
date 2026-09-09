"""
embeddings/embeddings.py
========================
Embeddings & vector search — meaning as geometry. Pure Python, zero deps.

The pipeline:

    words / sentences / images  →  vectors  →  nearest-neighbour search
        "things that mean          "a point       "who is closest
         the same..."               in space"      to me?"

Two ideas do all the work here:
  1. COSINE SIMILARITY — the angle between two vectors is how alike
     their meanings are. +1 = same direction, 0 = unrelated.
  2. NEAREST NEIGHBOUR — "find meaning" == "find the closest points".
     Brute force is O(n·d); LSH buckets similar vectors together so
     you only score a handful of candidates (the FAISS/ScaNN trick).
"""

import math
import random

# ── tiny vector helpers (lists of floats — no numpy, on purpose) ─────

def dot(a, b):
    return sum(x * y for x, y in zip(a, b))


def norm(a):
    return math.sqrt(dot(a, a)) or 1e-12


def normalize(a):
    n = norm(a)
    return [x / n for x in a]


def add(a, b):
    return [x + y for x, y in zip(a, b)]


def sub(a, b):
    return [x - y for x, y in zip(a, b)]


def cosine(a, b):
    """Similarity in [-1, 1]. Length is ignored — only direction (meaning)."""
    return dot(a, b) / (norm(a) * norm(b))


# ── brute-force nearest neighbour ────────────────────────────────────

def nearest(query, items, k=3, exclude=()):
    """
    items: dict {name: vector}.  Returns [(name, score), ...] top-k by cosine.
    O(n·d) — the honest baseline every approximate index is measured against.
    """
    scored = [(name, cosine(query, v)) for name, v in items.items()
              if name not in exclude]
    scored.sort(key=lambda t: t[1], reverse=True)
    return scored[:k]


def analogy(a, b, c, items, k=1):
    """
    'a is to b as c is to ?'  →  target ≈ b - a + c, then nearest.
    The famous  king - man + woman ≈ queen.
    """
    target = add(sub(items[b], items[a]), items[c])
    return nearest(target, items, k=k, exclude=(a, b, c))


# ── learn embeddings from scratch: skip-gram with negative sampling ──

def _sigmoid(x):
    if x < -60:
        return 0.0
    if x > 60:
        return 1.0
    return 1.0 / (1.0 + math.exp(-x))


def train_embeddings(sentences, dim=16, window=2, epochs=60, lr=0.05,
                     neg=5, seed=0):
    """
    Word2Vec (skip-gram, negative sampling) in ~30 lines, hand-rolled SGD.

    For every (center, context) pair in a window:
      push  center · context  UP     (they co-occur → should be close)
      push  center · random   DOWN   (negatives → should be far)

    Returns {word: unit_vector}.
    """
    rng = random.Random(seed)
    tokens = [w for s in sentences for w in s.split()]
    vocab = sorted(set(tokens))
    idx = {w: i for i, w in enumerate(vocab)}
    V = len(vocab)

    # two matrices, like the real thing: "center" and "context" vectors
    W = [[rng.uniform(-0.5, 0.5) / dim for _ in range(dim)] for _ in range(V)]
    C = [[rng.uniform(-0.5, 0.5) / dim for _ in range(dim)] for _ in range(V)]

    # unigram**0.75 sampling table (down-weights frequent words)
    from collections import Counter
    freq = Counter(tokens)
    table = []
    for w, f in freq.items():
        table += [idx[w]] * max(1, int((f ** 0.75) * 10))

    pairs = []
    for s in sentences:
        ws = [idx[w] for w in s.split()]
        for i, ci in enumerate(ws):
            for j in range(max(0, i - window), min(len(ws), i + window + 1)):
                if j != i:
                    pairs.append((ci, ws[j]))

    for _ in range(epochs):
        rng.shuffle(pairs)
        for ci, oi in pairs:
            targets = [(oi, 1.0)] + [(rng.choice(table), 0.0) for _ in range(neg)]
            c_vec = W[ci]
            for ti, label in targets:
                o_vec = C[ti]
                score = dot(c_vec, o_vec)
                g = (_sigmoid(score) - label) * lr
                for d in range(dim):
                    cd, od = c_vec[d], o_vec[d]
                    c_vec[d] -= g * od
                    o_vec[d] -= g * cd

    return {w: normalize(W[idx[w]]) for w in vocab}


# ── approximate nearest neighbour: random-hyperplane LSH ─────────────

class LSHIndex:
    """
    Locality-Sensitive Hashing with random hyperplanes.

    Each of `bits` random hyperplanes splits space in half; a vector's
    signature is which side it lands on for every plane. Similar vectors
    (small angle) collide in the same bucket with high probability, so a
    query only scores its bucket-mates instead of the whole dataset.

    This is the core idea inside FAISS / ScaNN / Annoy — "billion-scale
    search in a millisecond" is buckets + a short candidate list.
    """

    def __init__(self, dim, bits=16, seed=0):
        rng = random.Random(seed)
        self.planes = [[rng.gauss(0, 1) for _ in range(dim)] for _ in range(bits)]
        self.buckets = {}
        self.items = {}

    def _sig(self, v):
        return tuple(1 if dot(p, v) >= 0 else 0 for p in self.planes)

    def add(self, name, vector):
        v = normalize(vector)
        self.items[name] = v
        self.buckets.setdefault(self._sig(v), []).append(name)

    def query(self, vector, k=3, probe=1):
        """
        probe: also search buckets within `probe` bit-flips of the query
        signature (multi-probe LSH). probe=0 is the single home bucket.
        Returns (results, n_candidates_scored).
        """
        import itertools
        v = normalize(vector)
        sig = self._sig(v)
        bits = range(len(sig))
        cand = set()
        for flips in range(probe + 1):
            for combo in itertools.combinations(bits, flips):
                s = list(sig)
                for i in combo:
                    s[i] ^= 1
                cand.update(self.buckets.get(tuple(s), []))
        scored = sorted(((n, cosine(v, self.items[n])) for n in cand),
                        key=lambda t: t[1], reverse=True)
        return scored[:k], len(cand)


def recall_at_k(exact, approx, k):
    """Fraction of the true top-k that the approximate search also returned."""
    truth = {n for n, _ in exact[:k]}
    got = {n for n, _ in approx[:k]}
    return len(truth & got) / max(1, len(truth))


if __name__ == "__main__":
    # smoke test
    words = {
        "king":  [0.9, 0.1, 0.8, 0.1],
        "queen": [0.9, 0.9, 0.8, 0.1],
        "man":   [0.1, 0.1, 0.2, 0.9],
        "woman": [0.1, 0.9, 0.2, 0.9],
    }
    words = {w: normalize(v) for w, v in words.items()}
    got = analogy("man", "king", "woman", words)[0][0]
    print("king - man + woman  ≈ ", got)
    assert got == "queen", got
    print("PASS: analogy arithmetic works")
