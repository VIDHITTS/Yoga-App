require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { PineconeStore } = require("@langchain/pinecone");
const { Document } = require("@langchain/core/documents");
const knowledgeBase = require("../data/yoga_knowledge.json");

/**
 * Small test ingestion - just 5 articles to test the system
 */
async function ingestSmallTest() {
  console.log("======================================================================");
  console.log("🧪 SMALL TEST INGESTION - 5 ARTICLES");
  console.log("======================================================================\n");

  try {
    // Initialize Pinecone
    console.log("📌 Initializing Pinecone...");
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pinecone.Index(process.env.PINECONE_INDEX);
    console.log(`✅ Connected to index: ${process.env.PINECONE_INDEX}\n`);

    // Initialize OpenAI embeddings
    console.log("🤖 Initializing OpenAI Embeddings...");
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    });
    console.log("✅ OpenAI embeddings model ready\n");

    // Take only first 5 articles for testing
    const testArticles = knowledgeBase.slice(0, 5);
    console.log(`📚 Processing ${testArticles.length} test articles...\n`);

    // Convert to LangChain Document objects
    const documents = testArticles.map((article) => {
      const content = `Title: ${article.title}\n\nInformation:\n${article.info}\n\nPrecautions:\n${article.precautions}`;
      
      return new Document({
        pageContent: content,
        metadata: {
          id: article.id,
          title: article.title,
          category: article.category,
          source: "Common Yoga Protocol - Ministry of Ayush",
        },
      });
    });

    console.log(`✅ Converted ${documents.length} articles to documents\n`);

    // Upload to Pinecone using LangChain
    console.log("⬆️  Generating embeddings and uploading to Pinecone...");
    console.log("   Processing slowly with delays...\n");

    await PineconeStore.fromDocuments(documents, embeddings, {
      pineconeIndex: index,
      maxConcurrency: 1, // Very slow to avoid rate limits
    });

    console.log("✅ Test ingestion complete!\n");

    // Verify
    const stats = await index.describeIndexStats();
    console.log("📊 Index Statistics:");
    console.log(`   Total vectors: ${stats.totalRecordCount}`);
    console.log(`   Dimension: ${stats.dimension}`);
    console.log("\n✨ Test successful! System is working correctly.\n");

  } catch (error) {
    console.error("\n❌ Test ingestion failed:", error.message);
    throw error;
  }
}

// Run
ingestSmallTest();
