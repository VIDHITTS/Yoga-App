const mongoose = require('mongoose');

const queryLogSchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
    trim: true,
  },
  embedding: {
    type: [Number],
    required: false,
  },
  retrievedChunks: [{
    chunkId: String,
    title: String,
    content: String,
    source: String,
    page: String,
    score: Number,
  }],
  answer: {
    type: String,
    required: true,
  },
  isUnsafe: {
    type: Boolean,
    default: false,
  },
  safetyKeywords: [{
    type: String,
  }],
  safetyMessage: {
    type: String,
  },
  model: {
    type: String,
    default: 'gemini-pro',
  },
  responseTime: {
    type: Number, // milliseconds
  },
  feedback: {
    helpful: {
      type: Boolean,
      default: null,
    },
    timestamp: {
      type: Date,
    },
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes for efficient querying
queryLogSchema.index({ createdAt: -1 });
queryLogSchema.index({ isUnsafe: 1 });
queryLogSchema.index({ 'feedback.helpful': 1 });

// Virtual for response summary
queryLogSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    query: this.query,
    isUnsafe: this.isUnsafe,
    hasAnswer: !!this.answer,
    sourceCount: this.retrievedChunks.length,
    createdAt: this.createdAt,
  };
});

const QueryLog = mongoose.model('QueryLog', queryLogSchema);

module.exports = QueryLog;
