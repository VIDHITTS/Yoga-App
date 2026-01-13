const express = require("express");
const router = express.Router();
const QueryLog = require("../models/QueryLog");
const { generateEmbedding } = require("../services/embeddings");
const { retrieveContext } = require("../services/retrieval");
const { generateResponse } = require("../services/generation");
const {
  detectUnsafeQuery,
  generateSafetyMessage,
  getSafeAlternatives,
} = require("../services/safety");

/**
 * POST /api/ask
 * Main endpoint for processing yoga-related queries
 */
router.post("/", async (req, res) => {
  const startTime = Date.now();

  try {
    const { query } = req.body;

    // Validation
    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Query is required and must be a non-empty string",
      });
    }

    if (query.length > 500) {
      return res.status(400).json({
        success: false,
        error: "Query is too long. Please keep it under 500 characters.",
      });
    }

    console.log(`\n🔍 Processing Query: "${query}"`);
    
    // Step 1: Safety Detection (do this FIRST before boundary check)
    const safetyCheck = detectUnsafeQuery(query);
    console.log(
      `🛡️  Safety Check: ${safetyCheck.isUnsafe ? "⚠️ UNSAFE" : "✅ SAFE"}`
    );

    if (safetyCheck.isUnsafe) {
      console.log(`   Detected Keywords: ${safetyCheck.keywords.join(", ")}`);
      console.log(`   Categories: ${safetyCheck.categories.join(", ")}`);
    }
    
    // BOUNDARY CHECK: Only answer yoga-related questions (but allow safety queries through)
    const yogaKeywords = ['yoga', 'asana', 'pose', 'poses', 'pranayama', 'meditation', 'breathing', 'breath', 'namaste', 'chakra', 'mindfulness', 'stretch', 'flexibility', 'wellness', 'practice', 'spiritual', 'exercise', 'exercises', 'surya', 'namaskar', 'shavasana', 'tadasana', 'relaxation', 'health', 'benefits', 'technique', 'techniques', 'recommend', 'suggestion', 'can i', 'should i', 'is it safe'];
    const isYogaRelated = yogaKeywords.some(keyword => query.toLowerCase().includes(keyword));
    
    // Allow through if it's yoga-related OR if it's a safety-flagged query (health conditions asking about yoga)
    if (!isYogaRelated && !safetyCheck.isUnsafe && query.trim().length < 100) {
      console.log("⛔ Non-yoga query detected - rejecting");
      
      const rejectionMessage = "I'm a yoga wellness assistant and can only answer questions about yoga practice, poses, breathing techniques, and meditation. Please ask me something related to yoga!";
      
      // Still log to MongoDB for tracking
      const queryLog = new QueryLog({
        query: query.trim(),
        embedding: [],
        retrievedChunks: [],
        answer: rejectionMessage,
        isUnsafe: false,
        safetyKeywords: [],
        safetyMessage: null,
        responseTime: Date.now() - startTime,
        ipAddress: req.ip,
        userAgent: req.get("user-agent"),
      });

      await queryLog.save();
      console.log(`📝 Query logged to MongoDB (ID: ${queryLog._id})`);
      
      return res.json({
        success: true,
        queryId: queryLog._id,
        answer: rejectionMessage,
        sources: [],
        safety: {
          isUnsafe: false,
          message: null,
          alternatives: [],
          detectedConditions: [],
        },
        metadata: {
          responseTime: Date.now() - startTime,
          chunksRetrieved: 0,
          model: "boundary-check",
        },
      });
    }

    // Step 2: Generate Embedding
    console.log("🔢 Generating embedding...");
    const embedding = await generateEmbedding(query);
    console.log(`   ✅ Embedding generated (${embedding.length} dimensions)`);

    // Step 3: Retrieve Relevant Context
    console.log("📚 Retrieving relevant context from Pinecone...");
    const retrievedChunks = await retrieveContext(embedding);
    console.log(`   ✅ Retrieved ${retrievedChunks.length} relevant chunks`);

    retrievedChunks.forEach((chunk, idx) => {
      console.log(
        `   ${idx + 1}. ${chunk.title} (score: ${chunk.score.toFixed(4)})`
      );
    });

    // Step 4: Generate Response
    console.log("🤖 Generating AI response...");
    const answer = await generateResponse(
      query,
      retrievedChunks,
      safetyCheck.isUnsafe,
      safetyCheck.keywords
    );
    console.log("   ✅ Response generated");

    // Step 5: Prepare Safety Information
    let safetyMessage = null;
    let safeAlternatives = [];

    if (safetyCheck.isUnsafe) {
      safetyMessage = generateSafetyMessage(safetyCheck.categories);
      safeAlternatives = getSafeAlternatives(safetyCheck.categories);
    }

    // Step 6: Log to MongoDB
    const responseTime = Date.now() - startTime;
    console.log(`⏱️  Response time: ${responseTime}ms`);

    const queryLog = new QueryLog({
      query: query.trim(),
      embedding: embedding.slice(0, 100), // Store only first 100 dims to save space
      retrievedChunks: retrievedChunks.map((chunk) => ({
        chunkId: chunk.chunkId,
        title: chunk.title,
        content: chunk.content.substring(0, 200), // Store truncated content
        source: chunk.source,
        page: chunk.page,
        score: chunk.score,
      })),
      answer,
      isUnsafe: safetyCheck.isUnsafe,
      safetyKeywords: safetyCheck.keywords,
      safetyMessage,
      responseTime,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get("user-agent"),
    });

    await queryLog.save();
    console.log(`💾 Query logged to MongoDB (ID: ${queryLog._id})`);

    // Step 7: Send Response
    res.json({
      success: true,
      queryId: queryLog._id,
      answer,
      sources: retrievedChunks.map((chunk, idx) => ({
        id: idx + 1,
        title: chunk.title,
        source: chunk.source,
        page: chunk.page,
        relevanceScore: chunk.score,
      })),
      safety: {
        isUnsafe: safetyCheck.isUnsafe,
        message: safetyMessage,
        alternatives: safeAlternatives,
        detectedConditions: safetyCheck.categories,
      },
      metadata: {
        responseTime,
        chunksRetrieved: retrievedChunks.length,
        model: "gemini-pro",
      },
    });
  } catch (error) {
    console.error("❌ Error in /api/ask:", error);

    // Log error to database
    try {
      const errorLog = new QueryLog({
        query: req.body.query || "Error: Query not captured",
        answer: `Error: ${error.message}`,
        isUnsafe: false,
        responseTime: Date.now() - startTime,
        retrievedChunks: [],
      });
      await errorLog.save();
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    res.status(500).json({
      success: false,
      error: "An error occurred while processing your query. Please try again.",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

/**
 * GET /api/ask/stats
 * Get query statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const totalQueries = await QueryLog.countDocuments();
    const unsafeQueries = await QueryLog.countDocuments({ isUnsafe: true });
    const avgResponseTime = await QueryLog.aggregate([
      { $group: { _id: null, avgTime: { $avg: "$responseTime" } } },
    ]);

    res.json({
      success: true,
      stats: {
        totalQueries,
        unsafeQueries,
        safeQueries: totalQueries - unsafeQueries,
        unsafePercentage:
          totalQueries > 0
            ? ((unsafeQueries / totalQueries) * 100).toFixed(2)
            : 0,
        avgResponseTime: avgResponseTime[0]?.avgTime?.toFixed(0) || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch statistics" });
  }
});

module.exports = router;
