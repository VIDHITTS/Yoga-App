require("dotenv").config();
const { Pinecone } = require("@pinecone-database/pinecone");
const { generateLocalEmbedding } = require("../services/local-embeddings");
const knowledgeBase = require("../data/yoga_knowledge.json");

/**
 * Ingest knowledge base using FREE local embeddings - no API costs!
 */
async function ingestWithLocalEmbeddings() {
  console.log(
    "======================================================================"
  );
  console.log("🧘 YOGA KNOWLEDGE BASE INGESTION - FREE LOCAL EMBEDDINGS");
  console.log(
    "======================================================================\n"
  );

  try {
    // Initialize Pinecone
    console.log("📌 Initializing Pinecone...");
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    console.log(`✅ Connected to index: ${process.env.PINECONE_INDEX_NAME}\n`);

    console.log(`📚 Processing ${knowledgeBase.length} articles...\n`);

    let successCount = 0;
    let failCount = 0;

    // Process each article
    for (let i = 0; i < knowledgeBase.length; i++) {
      const article = knowledgeBase[i];

      try {
        // Create content for embedding
        const content = `Title: ${article.title}\n\nInformation:\n${article.info}\n\nPrecautions:\n${article.precautions}`;

        // Generate embedding locally (FREE!)
        console.log(
          `[${i + 1}/${knowledgeBase.length}] Embedding: ${article.title}`
        );
        const embedding = await generateLocalEmbedding(content);

        // Prepare vector for Pinecone
        const vector = {
          id: article.id,
          values: embedding,
          metadata: {
            title: article.title,
            category: article.category,
            info: article.info.substring(0, 500), // Pinecone metadata size limit
            precautions: article.precautions.substring(0, 500),
            source: "Common Yoga Protocol - Ministry of Ayush",
          },
        };

        // Upload to Pinecone
        await index.upsert([vector]);

        successCount++;

        // Progress indicator
        if ((i + 1) % 10 === 0) {
          console.log(
            `   ✓ Progress: ${i + 1}/${knowledgeBase.length} articles uploaded`
          );
        }
      } catch (error) {
        console.error(
          `   ✗ Failed to process ${article.title}:`,
          error.message
        );
        failCount++;
      }
    }

    console.log(
      "\n======================================================================"
    );
    console.log("✅ INGESTION COMPLETE!");
    console.log(
      "======================================================================"
    );
    console.log(`✓ Successfully uploaded: ${successCount} articles`);
    if (failCount > 0) {
      console.log(`✗ Failed: ${failCount} articles`);
    }
    console.log("\n📊 Verifying index statistics...");

    // Verify
    const stats = await index.describeIndexStats();
    console.log(`   Total vectors in Pinecone: ${stats.totalRecordCount}`);
    console.log(`   Dimension: ${stats.dimension}`);
    console.log("\n✨ Your RAG system is ready to use!\n");
  } catch (error) {
    console.error("\n❌ Ingestion failed:", error.message);
    console.error(error);
    throw error;
  }
}

// Run
ingestWithLocalEmbeddings();
