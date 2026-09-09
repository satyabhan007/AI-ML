"""
embeddings/step2_learn_word_vectors.py
======================================
Nobody hand-assigns axes. You LEARN vectors from raw text.

Skip-gram with negative sampling (the Word2Vec recipe), hand-rolled
SGD, no numpy:
  - words that appear in the same contexts get pulled together
  - random word pairs get pushed apart

After training on a tiny themed corpus, royalty words should sit
closer (on average) to other royalty words than to animal words,
and vice-versa — with axes the model invented on its own.
"""
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from embeddings import train_embeddings, nearest, cosine

CORPUS = [
    "the king ruled the kingdom and the queen ruled the kingdom beside him",
    "the queen and the king wore a golden crown inside the royal palace",
    "the prince and the princess walked through the royal palace at dawn",
    "a loyal knight served the king and the queen inside the palace",
    "the king and the queen and the prince entered the royal palace",
    "the crown of the king and the crown of the queen shone in the palace",
    "the cat chased the dog around the garden all afternoon",
    "the dog and the cat slept together near the warm winter fire",
    "a small puppy and a small kitten played in the sunny garden",
    "the dog barked at the cat and the frightened kitten ran away",
    "the cat and the kitten and the dog and the puppy shared a bowl",
    "the puppy chased the kitten while the dog watched the cat",
]

print("Step 2 — learn word vectors from scratch (skip-gram + negatives)\n")
vocab = sorted(set(w for s in CORPUS for w in s.split()))
print(f"corpus: {len(CORPUS)} sentences, {len(vocab)} unique words\n")

emb = train_embeddings(CORPUS, dim=32, window=2, epochs=300, lr=0.05, neg=8, seed=1)

for probe in ("king", "cat"):
    print(f"nearest to '{probe}':")
    for name, score in nearest(emb[probe], emb, k=5, exclude=(probe,)):
        print(f"   {name:<10} {score:+.3f}")
    print()

royal = ["king", "queen", "prince", "princess", "crown", "palace", "royal", "kingdom"]
animal = ["cat", "dog", "puppy", "kitten", "garden"]


def mean_cos(word, group):
    others = [w for w in group if w != word]
    return sum(cosine(emb[word], emb[w]) for w in others) / len(others)


for w in ("king", "queen", "cat", "dog"):
    grp = royal if w in royal else animal
    other = animal if grp is royal else royal
    print(f"  {w:<6} mean-cos to own theme = {mean_cos(w, grp):+.3f}   "
          f"to other theme = {mean_cos(w, other):+.3f}")

# robust check: every probe word is, on average, closer to its own theme
for w in ("king", "queen", "cat", "dog"):
    grp = royal if w in royal else animal
    other = animal if grp is royal else royal
    assert mean_cos(w, grp) > mean_cos(w, other), f"{w} landed in the wrong cluster"

assert cosine(emb["king"], emb["queen"]) > cosine(emb["king"], emb["cat"])
assert cosine(emb["cat"], emb["dog"]) > cosine(emb["cat"], emb["king"])
print("\nPASS: co-occurrence alone organised words into royal vs animal clusters")
