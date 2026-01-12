require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/database");
const { initPinecone } = require("./config/pinecone");

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Initialize Pinecone
initPinecone().catch((err) => {
  console.error("Failed to initialize Pinecone:", err);
});

// Middleware
app.use(helmet()); // Security headers
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? ["https://your-frontend-domain.com"]
        : ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev")); // Logging

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 30,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/", limiter);

// Routes
const askRoutes = require("./routes/ask");
const feedbackRoutes = require("./routes/feedback");

app.use("/api/ask", askRoutes);
app.use("/api/feedback", feedbackRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "Yoga RAG API",
    version: "1.0.0",
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "🧘 Welcome to Yoga Wellness RAG API",
    version: "1.0.0",
    endpoints: {
      ask: "POST /api/ask",
      feedback: "POST /api/feedback",
      stats: "GET /api/ask/stats",
      feedbackStats: "GET /api/feedback/stats",
      health: "GET /health",
    },
    documentation: "See README.md for detailed API documentation",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Endpoint not found",
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Global Error Handler:", err);

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n" + "=".repeat(60));
  console.log("🧘 YOGA WELLNESS RAG API SERVER");
  console.log("=".repeat(60));
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}`);
  console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
  console.log("=".repeat(60) + "\n");
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\nSIGINT signal received: closing HTTP server");
  process.exit(0);
});

module.exports = app;
