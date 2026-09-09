# Embeddings & Vector Search — The Amateur's Guide

> Meaning is a place. Similar things live near each other. Search is
> just "who are my neighbours?"

---

## 1. The one-sentence idea

An **embedding** turns a thing (a word, a sentence, an image, a user)
into a list of numbers — a **vector** — arranged so that *things that
mean similar things end up close together*.

```
"king"   -> [ 0.71, -0.22,  0.09, ... ]   (say, 1536 numbers)
"queen"  -> [ 0.68, -0.19,  0.31, ... ]   <- very close to "king"
"banana" -> [-0.44,  0.90, -0.12, ... ]   <- nowhere near either
```

Once meaning is geometry, hard language problems become easy geometry
problems: *search* is "find nearby points", *classification* is "which
cluster is this in?", *recommendation* is "what else is near what you
liked?".

---

## 2. How close is close? — cosine similarity

Two vectors, same direction → same meaning. The angle between them is
the score. We measure it with **cosine similarity**:

```
cos(a, b) = (a · b) / (|a| * |b|)
```

| cosine | meaning |
|-------:|---------|
| `+1.0` | identical direction — synonyms |
| `~0.0` | unrelated — "cat" vs "invoice" |
| `-1.0` | opposite — rare in practice |

**Analogy — a compass, not a ruler.** We care which *way* a vector
points, not how *long* it is. "very very very happy" and "happy" point
the same way; the extra length shouldn't change the meaning. Cosine
divides the length out.

> `step1_meaning_as_geometry.py` builds vectors by hand along readable
> axes `[royalty, female, human, animal]` and shows `king - man +
> woman` lands on `queen` — analogy is literally vector addition.

---

## 3. Nobody hand-assigns axes — you learn them

Real embeddings are **learned from raw text** by a simple rule:

> **You shall know a word by the company it keeps.**
> Words that appear in the same contexts should get similar vectors.

**Word2Vec (skip-gram + negative sampling)** — the recipe in
`step2_learn_word_vectors.py`:

1. Slide a window over the text. Every `(center, neighbour)` pair is a
   *positive* example — pull those two vectors together.
2. Pick a few random words as *negatives* — push those apart.
3. Nudge with gradient descent. Repeat over the whole corpus.

That's it. No labels, no grammar rules. After a few hundred passes
over a tiny themed corpus, royalty words cluster with royalty words
and animal words with animal words — using axes *the model invented*.

**Analogy — a seating chart from gossip.** You never told anyone where
to sit. You just repeatedly moved people who are always mentioned
together closer, and strangers further apart. The room self-organises
into friend-groups.

Modern sentence embeddings (OpenAI `text-embedding-3`, Sentence-BERT,
`bge`, `e5`) are the same instinct with a transformer doing the
encoding and contrastive training on billions of pairs.

---

## 4. Finding neighbours — brute force vs LSH

You have 100 million document vectors. A user query comes in as a
vector. Which 5 documents are closest?

**Brute force:** score all 100M, sort, take the top 5. Correct, simple,
`O(n·d)` — and way too slow past a few hundred thousand items.

**LSH (locality-sensitive hashing)** — `step3_vector_search.py`:

- Draw `b` random hyperplanes through the origin.
- For any vector, record which **side** of each plane it's on → a
  `b`-bit **signature** (e.g. `1011...0`).
- Vectors with a small angle between them almost always get the **same
  signature**, so drop each vector into a bucket keyed by its signature.
- A query only scores the handful of vectors in its own bucket (plus,
  for **multi-probe LSH**, a few neighbouring buckets that differ by
  one or two bits).

In the lab: **1,000 vectors, ~115 candidates scored per query (9x
fewer), ~89% of the true top-5 still found.** Scale that gap to a
billion vectors and that is the difference between 1 ms and 10 minutes.

**Analogy — a library.** You don't read every book to find one about
Rome. You go to the History shelf (the bucket), maybe glance at the
two shelves either side (multi-probe), and scan a few spines. You might
miss a Rome book that got mis-shelved under Travel (the ~11% recall
miss) — the trade you make for not reading the whole library.

Real systems (**FAISS, ScaNN, Annoy, HNSW, pgvector, Pinecone,
Weaviate**) use fancier structures — inverted files, product
quantization, small-world graphs — but the bargain is always the same:
**give up a little accuracy for a massive speed-up by only looking near
the query.**

---

## 5. Where you already rely on this

| App | What the embedding does |
|-----|-------------------------|
| Spotify / Netflix "more like this" | your taste and each track/film are nearby vectors |
| Google Photos "search: beach" | image embeddings near the text embedding of "beach" |
| ChatGPT with your files / RAG | your question's vector retrieves the nearest document chunks (see the `rag/` module) |
| Gmail / Outlook smart reply | your email embeds near a cluster of canned responses |
| Face unlock | your face is a vector; unlock = "close enough to the stored one" |
| Fraud / anomaly detection | normal behaviour clusters; the outlier is far from every cluster |

---

## 6. Gotchas the pros watch for

- **You must use the same encoder for the query and the corpus.**
  Mixing embedding models silently scrambles distances.
- **Normalise.** Store unit vectors so cosine == dot product and the
  index math stays simple.
- **Cosine ≠ meaning-identical.** High similarity can mean "same topic,
  opposite stance" ("I love this" vs "I hate this" share a lot of
  direction). Retrieval finds *relevant*, not *true*.
- **Dimensions aren't interpretable** in learned embeddings — don't
  expect "axis 7 = gender". Only *distances* carry meaning.
- **Recall is a dial.** More probes / bigger candidate lists → higher
  recall, slower queries. Pick the point your product can afford.

---

## 7. Run it

```bash
cd embeddings
python step1_meaning_as_geometry.py   # cosine + king-man+woman=queen
python step2_learn_word_vectors.py    # skip-gram learns clusters from text
python step3_vector_search.py         # brute force vs LSH: recall vs speed
```

Next stop: **`rag/`** — use this nearest-neighbour search to feed a
language model the right context at answer time.
