# Semantic cache key (Part 6 Ch 8)

A cache entry is stored as a Redis HASH with these fields — the ones in **bold**
are the key dimensions a lookup filters on *before* the vector KNN:

| field       | example                        | why |
|-------------|--------------------------------|-----|
| **tenant**  | `acme`                         | never serve one tenant a cross-tenant hit (Ch 2) |
| **model**   | `ranker-llm`                   | a different model gives a different answer |
| **prompt_v**| `2024-11-05`                   | a prompt change invalidates old entries |
| **params**  | `t0.0`                         | sampling params change the output |
| `answer`    | `To cancel your Pro plan...`   | the cached response |
| `embedding` | 384-float vector of the query  | for the similarity match |

Lookup:

```
FT.SEARCH idx:sem "(@tenant:{acme} @model:{ranker-llm} @prompt_v:{2024-11-05} @params:{t0.0})=>[KNN 1 @embedding $q AS score]" \
  PARAMS 2 q <query-embedding> DIALECT 2
```

Serve the hit **only if** `score` (cosine distance) is below the per-intent
threshold **and** the intent is read-only / low-stakes / non-personalised.
