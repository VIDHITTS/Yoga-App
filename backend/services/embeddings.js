const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate embeddings for text using Gemini
 * @param {string} text - Text to embed
 * @returns {Promise<number[]>} - Embedding vector
 */
const generateEmbedding = async (text) => {
  try {
    const model = genAI.getGenerativeModel({ model: "embedding-001" });
    const result = await model.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error("❌ Embedding Error:", error.message);
    throw error;
  }
};

module.exports = { generateEmbedding };
