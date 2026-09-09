"""
embeddings/step1_meaning_as_geometry.py
=======================================
Meaning is a direction in space.

We hand-build 4-number vectors for a few words along interpretable
axes, then show that:
  - words that mean similar things point the same way (cosine ≈ 1)
  - "king - man + woman" lands on "queen" — analogy is just vector math
"""
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from embeddings import normalize, cosine, nearest, analogy

# 4 interpretable axes: [royalty, female, human, animal]
RAW = {
    "king":   [0.95, 0.05, 0.9, 0.0],
    "queen":  [0.95, 0.95, 0.9, 0.0],
    "man":    [0.10, 0.05, 0.9, 0.0],
    "woman":  [0.10, 0.95, 0.9, 0.0],
    "prince": [0.80, 0.05, 0.9, 0.0],
    "dog":    [0.00, 0.30, 0.0, 0.95],
    "puppy":  [0.00, 0.30, 0.0, 0.90],
    "cat":    [0.00, 0.55, 0.0, 0.95],
}
WORDS = {w: normalize(v) for w, v in RAW.items()}

print("Step 1 — meaning as geometry\n")
print("Axes: [royalty, female, human, animal]  (hand-assigned, unit-normalized)\n")

print("Cosine similarity — how aligned are two meanings?")
probes = [("king", "queen"), ("king", "man"), ("king", "dog"),
          ("dog", "puppy"), ("dog", "cat"), ("man", "woman")]
for a, b in probes:
    print(f"   cos({a:>5}, {b:<6}) = {cosine(WORDS[a], WORDS[b]):+.3f}")

print("\nNearest neighbours of 'king':")
for name, score in nearest(WORDS['king'], WORDS, k=3, exclude=('king',)):
    print(f"   {name:<7} {score:+.3f}")

print("\nAnalogy:  man → king   as   woman → ?")
res = analogy("man", "king", "woman", WORDS, k=3)
for name, score in res:
    print(f"   {name:<7} {score:+.3f}")

top = res[0][0]
print(f"\n=> 'man is to king as woman is to {top}'")

# checks
assert cosine(WORDS['king'], WORDS['queen']) > cosine(WORDS['king'], WORDS['dog'])
assert cosine(WORDS['dog'], WORDS['puppy']) > cosine(WORDS['dog'], WORDS['man'])
assert top == "queen", f"expected queen, got {top}"
print("\nPASS: similar meanings align, and analogy arithmetic recovers 'queen'")
