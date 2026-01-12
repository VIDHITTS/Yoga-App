const { getIndex } = require('../config/pinecone');

/**
 * Retrieve relevant chunks from Pinecone based on query embedding
 * @param {Array<Number>} queryEmbedding - The embedded query vector
 * @param {Number} topK - Number of results to retrieve
 * @returns {Array} Retrieved chunks with metadata
 */
const retrieveContext = async (queryEmbedding, topK = 5) => {
  try {
    const index = await getIndex();
    
    // Query Pinecone for similar vectors
    const queryResponse = await index.query({
      vector: queryEmbedding,
      topK: parseInt(process.env.TOP_K_RESULTS) || 5,
      includeMetadata: true,
    });

    // Format results
    const retrievedChunks = queryResponse.matches.map(match => ({
      chunkId: match.id,
      title: match.metadata.title,
      content: match.metadata.content,
      source: match.metadata.source,
      page: match.metadata.page,
      score: match.score,
    }));

    return retrievedChunks;
  } catch (error) {
    console.error('❌ Retrieval Error:', error.message);
    throw new Error('Failed to retrieve relevant information');
  }
};

module.exports = { retrieveContext };
