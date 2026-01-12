const { pipeline } = require("@xenova/transformers");

/**
 * Local embeddings using Transformers.js - FREE, no API keys needed!
 * Uses all-MiniLM-L6-v2 model (384 dimensions)
 */

let embedder = null;

/**
 * Initialize the local embedding model (lazy loading)
 */
async function initEmbedder() {
  if (!embedder) {
    console.log(
      "🤖 Initializing local embedding model (first time may take a moment to download)..."
    );
    embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    console.log("✅ Local embeddings ready!");
  }
  return embedder;
}

/**
 * Generate embeddings locally without any API calls
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - 384-dimensional embedding vector
 */
async function generateLocalEmbedding(text) {
  const model = await initEmbedder();

  // Generate embedding
  const output = await model(text, { pooling: "mean", normalize: true });

  // Convert to regular array
  const embedding = Array.from(output.data);

  return embedding;
}

/**
 * Generate embeddings for multiple texts in batch
 * @param {string[]} texts - Array of texts to embed
 * @returns {Promise<number[][]>} - Array of embedding vectors
 */
async function generateLocalEmbeddingsBatch(texts) {
  const embeddings = [];

  for (const text of texts) {
    const embedding = await generateLocalEmbedding(text);
    embeddings.push(embedding);
  }

  return embeddings;
}

module.exports = {
  generateLocalEmbedding,
  generateLocalEmbeddingsBatch,
  initEmbedder,
};
