const { Pinecone } = require('@pinecone-database/pinecone');

let pineconeClient = null;

const initPinecone = async () => {
  if (pineconeClient) {
    return pineconeClient;
  }

  try {
    pineconeClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    console.log('✅ Pinecone Client Initialized');
    return pineconeClient;
  } catch (error) {
    console.error('❌ Pinecone Initialization Error:', error.message);
    throw error;
  }
};

const getIndex = async () => {
  const client = await initPinecone();
  const index = client.index(process.env.PINECONE_INDEX_NAME);
  return index;
};

module.exports = { initPinecone, getIndex };
