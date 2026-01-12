require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");

/**
 * Check current Pinecone index and create new one if needed for local embeddings (384 dimensions)
 */
async function setupPineconeForLocalEmbeddings() {
  console.log("======================================================================");
  console.log("🔧 SETTING UP PINECONE FOR LOCAL EMBEDDINGS");
  console.log("======================================================================\n");

  try {
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = "yoga-wellness-local"; // New index for 384d local embeddings
    
    console.log("📋 Checking existing indexes...\n");
    const indexes = await pinecone.listIndexes();
    
    // Check if our index exists
    const existingIndex = indexes.indexes?.find(idx => idx.name === indexName);
    
    if (existingIndex) {
      console.log(`✅ Index "${indexName}" already exists`);
      console.log(`   Dimension: ${existingIndex.dimension}`);
      console.log(`   Metric: ${existingIndex.metric}`);
      
      if (existingIndex.dimension !== 384) {
        console.log("\n⚠️  Warning: Index has wrong dimension!");
        console.log("   Expected: 384, Found:", existingIndex.dimension);
        console.log("\n   You need to delete the old index and create a new one.");
        console.log(`   Run: pinecone delete index ${indexName}`);
        return false;
      }
    } else {
      console.log(`📝 Creating new index "${indexName}" with 384 dimensions...`);
      
      await pinecone.createIndex({
        name: indexName,
        dimension: 384, // all-MiniLM-L6-v2 dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      console.log("✅ Index created successfully!");
      console.log("   Waiting 30 seconds for index to initialize...");
      
      // Wait for index to be ready
      await new Promise(resolve => setTimeout(resolve, 30000));
    }
    
    console.log("\n✨ Pinecone is ready for local embeddings!");
    console.log(`   Index name: ${indexName}`);
    console.log("   Dimension: 384");
    console.log("   Model: all-MiniLM-L6-v2\n");
    
    // Update .env reminder
    console.log("📝 Remember to update your .env file:");
    console.log(`   PINECONE_INDEX_NAME=${indexName}`);
    console.log("   PINECONE_DIMENSION=384\n");
    
    return true;
    
  } catch (error) {
    console.error("\n❌ Setup failed:", error.message);
    throw error;
  }
}

// Run
setupPineconeForLocalEmbeddings();
