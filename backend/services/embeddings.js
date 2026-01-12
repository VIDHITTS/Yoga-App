const { generateLocalEmbedding } = require("./local-embeddings");

/**
 * Generate embeddings for text using FREE local embeddings
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector (384 dimensions)
 */
const generateEmbedding = async (text) => {
  try {
    const vector = await generateLocalEmbedding(text);
    return vector;
  } catch (error) {
    console.error("❌ Embedding Error:", error.message);
    throw error;
  }
};

module.exports = { generateEmbedding };
