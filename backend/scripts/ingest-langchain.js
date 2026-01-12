require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { OpenAIEmbeddings } = require("@langchain/openai");
const { PineconeStore } = require("@langchain/pinecone");
const { Document } = require("@langchain/core/documents");
const knowledgeBase = require("../data/yoga_knowledge.json");

/**
 * Ingest knowledge base into Pinecone using LangChain
 */
async function ingestKnowledgeBase() {
  console.log("\n" + "=".repeat(70));
  console.log("🧘 YOGA KNOWLEDGE BASE INGESTION TO PINECONE");
  console.log("=".repeat(70) + "\n");

  try {
    // 1. Initialize Pinecone Client
    console.log("📌 Initializing Pinecone...");
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    console.log(`✅ Connected to index: ${process.env.PINECONE_INDEX_NAME}\n`);

    // 2. Initialize OpenAI Embeddings
    console.log("🤖 Initializing OpenAI Embeddings...");
    const embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small", // 1536 dimensions
    });
    console.log("✅ OpenAI embeddings model ready\n");

    // 3. Convert knowledge base to LangChain Documents
    console.log(`📚 Processing ${knowledgeBase.length} articles...\n`);
    const documents = knowledgeBase.map((article, index) => {
      // Combine info and precautions for full content
      const fullContent = `${article.title}\n\n${article.info}\n\nPrecautions: ${article.precautions}`;

      return new Document({
        pageContent: fullContent,
        metadata: {
          id: article.id,
          title: article.title,
          source: article.source,
          page: article.page,
          info: article.info,
          precautions: article.precautions,
        },
      });
    });

    console.log(`✅ Converted ${documents.length} articles to documents\n`);

    // 4. Upload to Pinecone (LangChain handles embedding + upload automatically)
    console.log("⬆️  Generating embeddings and uploading to Pinecone...");
    console.log("   This will take a few moments...\n");

    await PineconeStore.fromDocuments(documents, embeddings, {
      pineconeIndex: pineconeIndex,
      maxConcurrency: 5, // Process 5 at a time to avoid rate limits
    });

    console.log("\n" + "=".repeat(70));
    console.log("📊 INGESTION SUMMARY");
    console.log("=".repeat(70));
    console.log(`Total Articles Processed: ${documents.length}`);
    console.log(`Embedding Model: text-embedding-3-small`);
    console.log(`Vector Dimensions: 1536`);
    console.log(`Index Name: ${process.env.PINECONE_INDEX_NAME}`);
    console.log("=".repeat(70));

    // 5. Verify upload
    console.log("\n📈 Fetching index statistics...");
    const stats = await pineconeIndex.describeIndexStats();
    console.log(`   Total vectors in index: ${stats.totalRecordCount || 0}`);
    console.log(`   Dimension: ${stats.dimension}`);

    console.log("\n✅ Knowledge base ingestion complete!");
    console.log("🎉 Your RAG system is ready to use.\n");
  } catch (error) {
    console.error("\n❌ Ingestion failed:", error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run ingestion
ingestKnowledgeBase();
