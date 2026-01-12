# Yoga RAG Backend

Node.js + Express backend with Pinecone vector store and Gemini AI for RAG-powered yoga wellness queries.

## 🏗️ Architecture

```
Backend (Node.js + Express)
├── RAG Pipeline
│   ├── Embeddings (Gemini)
│   ├── Vector Search (Pinecone)
│   └── Generation (Gemini)
├── Safety Detection
│   └── Keyword-based health condition detection
├── Data Logging (MongoDB)
│   └── Query logs with feedback
└── REST API
    ├── POST /api/ask
    ├── POST /api/feedback
    └── GET /api/ask/stats
```

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```env
MONGODB_URI=your_mongodb_connection_string
PINECONE_API_KEY=your_pinecone_api_key
GEMINI_API_KEY=your_gemini_api_key
```

## 🚀 Usage

### 1. Ingest Knowledge Base

First, load the yoga knowledge base into Pinecone:

```bash
npm run ingest
```

This will:

- Process 50 yoga articles from `data/yoga_knowledge.json`
- Split into semantic chunks with overlap
- Generate embeddings using Gemini
- Upload to Pinecone vector store

### 2. Start Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 3. Test API

```bash
npm test
```

## 📡 API Endpoints

### POST /api/ask

Submit a yoga-related query.

**Request:**

```json
{
  "query": "What are the benefits of meditation?"
}
```

**Response:**

```json
{
  "success": true,
  "queryId": "507f1f77bcf86cd799439011",
  "answer": "Meditation provides numerous benefits...",
  "sources": [
    {
      "id": 1,
      "title": "Meditation - Introduction and Benefits",
      "source": "Common Yoga Protocol - Ministry of Ayush",
      "page": "49-50",
      "relevanceScore": 0.89
    }
  ],
  "safety": {
    "isUnsafe": false,
    "message": null,
    "alternatives": [],
    "detectedConditions": []
  },
  "metadata": {
    "responseTime": 1240,
    "chunksRetrieved": 5,
    "model": "gemini-pro"
  }
}
```

### POST /api/feedback

Submit feedback for a response.

**Request:**

```json
{
  "queryId": "507f1f77bcf86cd799439011",
  "helpful": true
}
```

### GET /api/ask/stats

Get query statistics.

**Response:**

```json
{
  "success": true,
  "stats": {
    "totalQueries": 150,
    "unsafeQueries": 12,
    "safeQueries": 138,
    "unsafePercentage": "8.00",
    "avgResponseTime": "1458"
  }
}
```

## 🛡️ Safety Detection

The system detects potentially unsafe queries mentioning:

- Pregnancy conditions
- Cardiovascular issues
- Musculoskeletal injuries
- Chronic diseases
- Neurological conditions
- Cancer/treatment
- Respiratory issues
- Recent trauma

When detected, the system:

1. ✅ Still retrieves relevant information
2. 🔴 Returns safety warning
3. 💡 Provides safer alternatives
4. 👨‍⚕️ Recommends professional consultation

## 📊 MongoDB Schema

```javascript
{
  query: String,
  embedding: [Number],
  retrievedChunks: [{
    chunkId: String,
    title: String,
    content: String,
    source: String,
    score: Number
  }],
  answer: String,
  isUnsafe: Boolean,
  safetyKeywords: [String],
  responseTime: Number,
  feedback: {
    helpful: Boolean,
    timestamp: Date
  },
  createdAt: Date
}
```

## 🔧 Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── pinecone.js          # Pinecone client
├── models/
│   └── QueryLog.js          # MongoDB schema
├── routes/
│   ├── ask.js               # Query endpoint
│   └── feedback.js          # Feedback endpoint
├── services/
│   ├── embeddings.js        # Gemini embeddings
│   ├── retrieval.js         # Pinecone search
│   ├── generation.js        # Gemini generation
│   └── safety.js            # Safety detection
├── scripts/
│   ├── ingest.js            # Knowledge base ingestion
│   └── test-query.js        # API testing
├── data/
│   └── yoga_knowledge.json  # 50 yoga articles
└── server.js                # Express app
```

## 🔬 RAG Pipeline Details

### 1. Chunking Strategy

- **Size**: 350 words
- **Overlap**: 50 words
- **Rationale**: Balances context and precision

### 2. Embeddings

- **Model**: Gemini text-embedding-004
- **Dimensions**: 768
- **Why**: High-quality semantic understanding

### 3. Retrieval

- **Store**: Pinecone
- **Metric**: Cosine similarity
- **Top-K**: 5 chunks
- **Why**: Managed, fast, production-ready

### 4. Generation

- **Model**: Gemini Pro
- **Temperature**: 0.3 (consistent responses)
- **Context**: Retrieved chunks + safety instructions

## 🐛 Troubleshooting

**MongoDB connection issues:**

- Check connection string format
- Verify network access in MongoDB Atlas

**Pinecone errors:**

- Ensure index is created (run `npm run ingest`)
- Verify API key is correct

**Gemini API errors:**

- Check API key validity
- Verify quota/billing

## 📝 License

Educational project for assignment purposes.
