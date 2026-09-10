/* AI-ML Learn — Part 6 · Chapter 7: Retrieval & Vector Search at Scale */
window.CH[7] = {
  levels: [
    /* ---------- L1 · Amateur ---------- */
    { html:
      '<p>Half of a RAG system, a recommender, or a semantic search box is <b>retrieval</b>: given a query, find the handful of items most relevant to it, ' +
      'fast, out of millions or billions. The other half (the model) is only as good as what retrieval hands it.</p>' +
      '<pre><code>text/query  → embed → a vector → find the nearest vectors → return their documents\n' +
      '                                        (approximate nearest neighbour, "ANN")</code></pre>' +
      '<p>Exact nearest-neighbour search means comparing the query to every vector — fine for 10k, hopeless for 100M. ' +
      '<b>ANN indexes</b> trade a tiny bit of recall for 100–1000× speed by only looking at a smart subset.</p>' +
      '<div class="analogy"><span class="lbl">🎯 Analogy</span><p><b>Finding a friend in a stadium.</b> Exact search is checking every seat. ' +
      'ANN is: go to the right section (coarse cluster), then the right row (graph hop), then scan a few seats. You might occasionally miss them by one row — ' +
      'that is the recall you traded for not walking the whole stadium.</p></div>',
      try: [
        ['📖 Pinecone — what is a vector database / ANN', 'https://www.pinecone.io/learn/vector-database/', 'o'],
        ['🧠 Part 1: build LSH nearest-neighbour from scratch', '../learn/#ch5', 'o']
      ] },

    /* ---------- L2 · Beginner ---------- */
    { html:
      '<pre><code>INDEX TYPES\n' +
      '  Flat/brute-force   exact, O(N) per query. Baseline; fine up to ~10^5-10^6 vectors.\n' +
      '  IVF               partition into clusters, search the nearest few. Tune nprobe (recall↔speed).\n' +
      '  HNSW              navigable small-world graph. Great recall/latency; higher memory + build cost.\n' +
      '  PQ / OPQ          product quantization — compress vectors ~8-32×; pair with IVF for RAM savings.\n' +
      '  DiskANN           graph index that lives mostly on SSD — billions of vectors per node.\n' +
      'KNOBS               ef_search / nprobe (recall vs latency), M / nlist (build), metric (cosine/dot/L2).\n' +
      'HYBRID SEARCH       combine dense (vector) + sparse (BM25/keyword) and fuse scores (RRF). Catches\n' +
      '                   exact-term matches embeddings miss (codes, names, rare words).\n' +
      'FILTERING          pre- vs post-filter on metadata (tenant, language, date). Pre-filter is correct\n' +
      '                   but can wreck the index; native filtered-ANN is the goal.\n' +
      'FRESHNESS          new docs must be searchable in seconds → incremental upsert + periodic rebuild.</code></pre>' +
      '<div class="standard"><span class="lbl">📐 Standard</span><p>The library standard is <b>FAISS</b> (and <b>ScaNN</b>, <b>hnswlib</b>, <b>DiskANN</b>) for the index; ' +
      'the serving standard is a <b>vector database</b> — <b>pgvector</b>, <b>Milvus</b>, <b>Qdrant</b>, <b>Weaviate</b>, <b>Vespa</b>, <b>Elasticsearch/OpenSearch</b>, ' +
      '<b>Pinecone</b> — which wraps an ANN index with persistence, sharding, replication, metadata filtering and CRUD. HNSW and IVF+PQ are the two workhorse algorithms. ' +
      'You pick and tune an index; you do not implement ANN.</p></div>',
      try: [
        ['📖 FAISS — index types & guidelines', 'https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index', 'o'],
        ['📖 HNSW — the original paper (Malkov & Yashunin)', 'https://arxiv.org/abs/1603.09320', 'o']
      ] },

    /* ---------- L3 · Builder ---------- */
    { html:
      '<div class="reallife"><span class="lbl">🏭 Scenario A</span><p><b>RAG recall is bad on names and codes.</b> ' +
      'Users search "error KB-4471" or "policy for Acme Corp"; pure vector search returns fuzzy neighbours and misses the exact doc. ' +
      'Fix: <b>hybrid search</b> — run BM25 (keyword) and dense retrieval in parallel, fuse with Reciprocal Rank Fusion, then rerank the top ~50. ' +
      'Exact-term queries now hit; semantic queries still work. Recall@10 jumps without touching the embedding model.</p></div>' +
      '<div class="reallife"><span class="lbl">🏭 Scenario B</span><p><b>Multi-tenant filtering kills latency.</b> ' +
      '200M vectors across 5 000 tenants; every query must be scoped to one tenant. Post-filtering (ANN then drop other tenants) returns too few results ' +
      'for small tenants; naive pre-filtering scans huge subsets. Fix: <b>shard by tenant</b> (or tenant-group) so a query hits only that shard\'s index, ' +
      'and use a vector DB with native filtered-HNSW. Big tenants get dedicated shards; the long tail shares.</p></div>' +
      '<p><b>Sizing:</b> HNSW memory ≈ <code>(dim × 4 bytes + M × 8) × N</code>. 100M × 768-dim float32 ≈ 300 GB+ → either shard across nodes, ' +
      'quantize (PQ / int8, ~4-8× smaller), or use DiskANN. Measure recall@k on a labelled query set <i>after</i> quantization, not before.</p>',
      try: [
        ['📖 Elastic — reciprocal rank fusion (hybrid search)', 'https://www.elastic.co/guide/en/elasticsearch/reference/current/rrf.html', 'o'],
        ['🏗️ Ch 16 — the RAG assistant walkthrough', '#ch16', 'o']
      ] },

    /* ---------- L4 · Advanced ---------- */
    { html:
      '<pre><code>ANTI-PATTERN                          FIX\n' +
      'One HNSW index for 200M multi-tenant   Shard by tenant / tenant-group; route queries to one shard.\n' +
      '  vectors                              Native filtered-ANN for within-shard scoping.\n' +
      'Pure dense retrieval                   Add sparse (BM25) + fusion. Embeddings miss exact tokens, IDs,\n' +
      '                                       rare words, negation.\n' +
      'Measure recall before quantization      Quantization (PQ/int8) costs recall. Evaluate recall@k on a\n' +
      '                                       labelled set on the FINAL index config.\n' +
      'ef_search / nprobe left at default     Sweep them against a recall target; pick the smallest value that\n' +
      '                                       meets it → lowest latency.\n' +
      'Rebuild the whole index for every add   Incremental upserts for freshness + a scheduled full rebuild to\n' +
      '                                       reclaim graph quality and deleted space.\n' +
      'No reranker                            A cross-encoder rerank of the top 20-100 usually beats a bigger\n' +
      '                                       ANN k. Retrieve wide, rerank narrow.\n' +
      'Chunking as an afterthought             Chunk size/overlap and what you embed (title+section prepended)\n' +
      '                                       often matter more than the index. Test it.\n' +
      'Embedding model changed, index not      A new embedding model = re-embed and rebuild everything. Version\n' +
      '  rebuilt                               the index with the model.</code></pre>' +
      '<p><b>Retrieve wide, rerank narrow:</b> ANN to get 100 candidates cheaply, then a heavier cross-encoder / LLM reranker to order the top 5-10. ' +
      'This beats pushing the ANN index for high-k precision and is cheaper than a bigger embedding model.</p>',
      try: [
        ['📖 Milvus — scalability & sharding architecture', 'https://milvus.io/docs/architecture_overview.md', 'o'],
        ['📗 Part 2: RAG, reranking & retrieval quality', '../learn2/#ch6', 'o']
      ] },

    /* ---------- L5 · Interview drill ---------- */
    { html:
      '<p><b>Interview drill</b></p>' +
      '<pre><code>Q: Why ANN instead of exact nearest-neighbour at scale?\n' +
      'A: Exact search is O(N) per query — untenable past ~1M vectors at low latency. ANN (HNSW, IVF+PQ)\n' +
      '   inspects a smart subset, giving 100-1000× speed for a small, tunable recall loss.\n\n' +
      'Q: Vector search misses queries with exact IDs / rare terms. Fix?\n' +
      "A: Hybrid retrieval: run dense (vector) and sparse (BM25) in parallel and fuse (e.g. RRF), then rerank\n" +
      '   the merged top list. Embeddings are weak on exact tokens, codes, names and negation; keyword search\n' +
      '   covers them.\n\n' +
      'Q: 200M vectors, every query scoped to one of thousands of tenants. Architecture?\n' +
      "A: Shard by tenant (or tenant group) so a query only touches that shard's index; use native\n" +
      '   filtered-ANN within the shard. Dedicated shards for large tenants, shared shards for the long tail.\n' +
      '   Post-filtering a global index returns too few hits for small tenants.\n\n' +
      'Q: How do you choose ef_search / nprobe?\n' +
      'A: Sweep them on a labelled query set against a recall@k target and pick the smallest value that meets\n' +
      '   it — that gives the lowest latency for the accuracy you need.\n\n' +
      'Q: You switched embedding models. What has to happen to the index?\n' +
      "A: Re-embed every document and rebuild the index — vectors from different models aren't comparable.\n" +
      '   Version the index alongside the embedding model so the two never drift apart.\n\n' +
      'Q: "Retrieve wide, rerank narrow" — why?\n' +
      'A: A cheap ANN pass gets ~100 candidates; a heavier cross-encoder/LLM reranker then orders the top 5-10.\n' +
      '   That yields better final precision than forcing the ANN index to high-k accuracy, and costs less than\n' +
      '   a larger embedding model.\n\n' +
      'Q: What often matters more than the index choice for RAG quality?\n' +
      '   A: Chunking (size, overlap, and prepending title/section context) and the embedding model itself.</code></pre>' +
      '<p><b>↔ See also:</b> <a href="#ch8">Ch 8</a> (caching embeddings &amp; results), <a href="#ch16">Ch 16</a> (RAG end-to-end), ' +
      '<a href="../learn5/#ch14">Part 5 Ch 14</a> (vector DBs in production), and <a href="../learn2/#ch6">Part 2 Ch 6</a> (RAG &amp; reranking).</p>',
      try: [
        ['📖 Qdrant — filtering & payload indexing', 'https://qdrant.tech/documentation/concepts/filtering/', 'o'],
        ['📖 Google — ScaNN (efficient vector similarity search)', 'https://github.com/google-research/google-research/tree/master/scann', 'o']
      ] }
  ],

  quiz: [
    { q: 'Why do large-scale retrieval systems use approximate nearest-neighbour (ANN) indexes like HNSW or IVF+PQ?',
      opts: [
        'They are always more accurate than exact search',
        'Exact search is O(N) per query and does not scale; ANN inspects a smart subset for 100–1000× speed at a small, tunable recall cost',
        'They remove the need for embeddings',
        'They use less disk than storing the raw text'],
      ok: 1,
      why: 'Past ~1M vectors, comparing the query to every vector is too slow. ANN structures (graphs, coarse clusters) bound the work per query in exchange for occasionally missing a true neighbour.' },
    { q: 'Users search for exact error codes and company names, and pure vector search misses them. Best fix?',
      opts: [
        'Increase the embedding dimension',
        'Hybrid search — run dense and sparse (BM25) retrieval in parallel, fuse the rankings (e.g. RRF), then rerank',
        'Lower ef_search',
        'Switch cosine to L2 distance'],
      ok: 1,
      why: 'Embeddings are weak on exact tokens, IDs and rare terms; keyword (sparse) retrieval covers those, and score fusion combines the strengths of both.' },
    { q: 'You evaluated recall@10 on the float32 index, then enabled product quantization to fit memory. What must you do?',
      opts: [
        'Nothing — quantization does not affect recall',
        'Re-measure recall@k on the final quantized index config, since compression trades away some recall',
        'Delete the labelled evaluation set',
        'Switch to exact search'],
      ok: 1,
      why: 'PQ/int8 compression reduces recall by a config-dependent amount. Accuracy must be validated on the exact index configuration that will run in production.' }
  ]
};
