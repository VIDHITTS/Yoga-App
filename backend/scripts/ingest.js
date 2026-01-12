require('dotenv').config();
const { Pinecone } = require('@pinecone-database/pinecone');
const { generateEmbedding } = require('../services/embeddings');
const knowledgeBase = require('../data/yoga_knowledge.json');

/**
 * Ingest knowledge base into Pinecone vector store
 * Creates chunks, generates embeddings, and uploads to Pinecone
 */

const CHUNK_SIZE = parseInt(process.env.CHUNK_SIZE) || 350;
const CHUNK_OVERLAP = parseInt(process.env.CHUNK_OVERLAP) || 50;

/**
 * Split text into overlapping chunks
 */
function chunkText(text, chunkSize = CHUNK_SIZE, overlap = CHUNK_OVERLAP) {
  const words = text.split(' ');
  const chunks = [];
  
  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    if (chunk.trim().length > 0) {
      chunks.push(chunk);
    }
  }
  
  return chunks;
}

/**
 * Process articles into chunks with metadata
 */
function processKnowledgeBase(articles) {
  const processedChunks = [];
  
  articles.forEach((article, articleIdx) => {
    // For shorter articles, use the entire content as one chunk
    if (article.content.split(' ').length <= CHUNK_SIZE) {
      processedChunks.push({
        id: `${article.id}_chunk_0`,
        title: article.title,
        content: article.content,
        source: article.source,
        page: article.page,
        articleId: article.id,
        chunkIndex: 0,
        totalChunks: 1
      });
    } else {
      // Split longer articles into chunks
      const chunks = chunkText(article.content);
      chunks.forEach((chunk, chunkIdx) => {
        processedChunks.push({
          id: `${article.id}_chunk_${chunkIdx}`,
          title: article.title,
          content: chunk,
          source: article.source,
          page: article.page,
          articleId: article.id,
          chunkIndex: chunkIdx,
          totalChunks: chunks.length
        });
      });
    }
  });
  
  return processedChunks;
}

/**
 * Main ingestion function
 */
async function ingestKnowledgeBase() {
  console.log('\n' + '='.repeat(70));
  console.log('🧘 YOGA KNOWLEDGE BASE INGESTION TO PINECONE');
  console.log('='.repeat(70) + '\n');

  try {
    // Initialize Pinecone
    console.log('📡 Initializing Pinecone...');
    const pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });

    const indexName = process.env.PINECONE_INDEX_NAME || 'yoga-wellness-rag';
    
    // Check if index exists, create if not
    console.log(`🔍 Checking for index: ${indexName}...`);
    const existingIndexes = await pinecone.listIndexes();
    
    if (!existingIndexes.indexes.find(idx => idx.name === indexName)) {
      console.log(`📝 Creating new index: ${indexName}...`);
      await pinecone.createIndex({
        name: indexName,
        dimension: 768, // Gemini embedding dimension
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      console.log('✅ Index created successfully!');
      console.log('⏳ Waiting for index to be ready (30 seconds)...');
      await new Promise(resolve => setTimeout(resolve, 30000));
    } else {
      console.log('✅ Index already exists');
    }

    const index = pinecone.index(indexName);

    // Process knowledge base
    console.log('\n📚 Processing knowledge base...');
    console.log(`   Articles: ${knowledgeBase.length}`);
    
    const chunks = processKnowledgeBase(knowledgeBase);
    console.log(`   Generated chunks: ${chunks.length}`);
    console.log(`   Chunk size: ${CHUNK_SIZE} words`);
    console.log(`   Overlap: ${CHUNK_OVERLAP} words\n`);

    // Generate embeddings and upload
    console.log('🔢 Generating embeddings and uploading to Pinecone...\n');
    
    const batchSize = 100;
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const vectors = [];

      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chunks.length / batchSize)} (${batch.length} chunks)...`);

      for (const chunk of batch) {
        try {
          // Generate embedding
          const embedding = await generateEmbedding(chunk.content);
          
          // Prepare vector for upload
          vectors.push({
            id: chunk.id,
            values: embedding,
            metadata: {
              title: chunk.title,
              content: chunk.content,
              source: chunk.source,
              page: chunk.page,
              articleId: chunk.articleId,
              chunkIndex: chunk.chunkIndex,
              totalChunks: chunk.totalChunks
            }
          });

          successCount++;
          process.stdout.write(`   ✓ ${chunk.id}\n`);
          
          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (error) {
          errorCount++;
          console.error(`   ✗ Error processing ${chunk.id}:`, error.message);
        }
      }

      // Upload batch to Pinecone
      if (vectors.length > 0) {
        try {
          await index.upsert(vectors);
          console.log(`   📤 Uploaded batch to Pinecone\n`);
        } catch (error) {
          console.error(`   ❌ Error uploading batch:`, error.message);
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 INGESTION SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total Articles: ${knowledgeBase.length}`);
    console.log(`Total Chunks: ${chunks.length}`);
    console.log(`Successfully Processed: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Index Name: ${indexName}`);
    console.log('='.repeat(70) + '\n');

    // Get index stats
    console.log('📈 Fetching index statistics...');
    const stats = await index.describeIndexStats();
    console.log(`   Total vectors in index: ${stats.totalRecordCount}`);
    console.log(`   Dimension: ${stats.dimension}`);
    console.log('\n✅ Knowledge base ingestion complete!\n');

  } catch (error) {
    console.error('\n❌ Ingestion failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run ingestion if this script is executed directly
if (require.main === module) {
  ingestKnowledgeBase()
    .then(() => {
      console.log('🎉 All done! Your RAG system is ready to use.\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Fatal error:', error);
      process.exit(1);
    });
}

module.exports = { ingestKnowledgeBase, chunkText, processKnowledgeBase };
