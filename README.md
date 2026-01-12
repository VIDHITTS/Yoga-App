# 🧘 Yoga Wellness Assistant - RAG Application

A comprehensive Retrieval-Augmented Generation (RAG) system that provides personalized yoga guidance based on authoritative sources. Built with modern AI technologies including Pinecone vector database, Google Gemini embeddings and generation, and MongoDB for query logging.

## 🎯 Features

- **Intelligent RAG Pipeline**: Semantic search over 100 curated yoga articles using vector embeddings
- **Safety-First Design**: Built-in safety detection for 8 medical condition categories
- **Source Transparency**: Every response includes source citations with page references
- **Query Analytics**: MongoDB logging tracks all queries and user feedback
- **Responsive UI**: Beautiful gradient-based React interface with smooth animations
- **Production-Ready**: Rate limiting, error handling, health checks, and graceful shutdown

## 🏗️ Architecture

### RAG Pipeline Flow

```
User Query → Safety Check → Generate Embedding (768d) →
Vector Search (Pinecone) → Retrieve Top 5 Context →
Generate Response (Gemini Pro) → Return with Sources
```

### Technology Stack

**Backend:**

- Node.js + Express.js
- Pinecone (Vector Database)
- Google Gemini AI (text-embedding-004, gemini-pro)
- MongoDB Atlas (Query Logging)
- Security: Helmet, CORS, Rate Limiting

**Frontend:**

- React 18.2.0
- Axios for API calls
- CSS3 with gradient animations
- Responsive design (mobile-first)

## 🧠 RAG Pipeline Design

### 1. Knowledge Base

**Source**: Common Yoga Protocol - Ministry of Ayush, Government of India

The knowledge base contains **100 comprehensive articles** covering:

- Yoga fundamentals and philosophy
- 12 Surya Namaskar positions with detailed instructions
- 15+ fundamental asanas (standing, sitting, prone, supine)
- 5 pranayama breathing techniques
- Meditation and relaxation practices
- Safety guidelines for special conditions (pregnancy, hypertension, cardiac, spinal disorders)
- Warm-up and cool-down sequences

### 2. Chunking Strategy

- **Chunk Size**: 350 words
- **Overlap**: 50 words
- **Method**: Semantic chunking with metadata preservation

**Rationale**:

- 350-word chunks provide sufficient context without overwhelming the model
- 50-word overlap ensures continuity across chunk boundaries
- Metadata (title, source, page) enables transparent source citation

### 3. Embeddings

- **Model**: Google Gemini text-embedding-004
- **Dimensions**: 768
- **Why Gemini**: High-quality embeddings with excellent semantic understanding for wellness content and superior performance on domain-specific queries

### 4. Vector Store

- **Platform**: Pinecone
- **Index**: yoga-knowledge
- **Metric**: Cosine similarity
- **Top-K**: 5 most relevant chunks
- **Cloud**: AWS us-east-1 (serverless)

### 5. Generation

- **Model**: Google Gemini Pro
- **Temperature**: 0.3 (for consistent, accurate responses)
- **System Prompt**: Includes safety guidelines and context-only instructions
- **Max Tokens**: 1000

## 🛡️ Safety & Guardrails

### Safety Detection System

Detects queries mentioning 8 condition categories:

- **Heart Conditions**: Cardiac disease, heart attack, angina, arrhythmia
- **Pregnancy**: All trimesters, postpartum period
- **Blood Pressure**: Hypertension, hypotension
- **Spinal Disorders**: Herniated disc, sciatica, spondylolisthesis, stenosis
- **Joint Problems**: Arthritis, rheumatoid arthritis, osteoarthritis
- **Respiratory Issues**: Asthma, COPD, breathing difficulties
- **Chronic Pain**: Fibromyalgia, chronic back pain, neck pain
- **Recent Surgery/Injury**: Post-operative, fractures, sprains

### Safety Response Protocol

When unsafe query is detected:

1. ✅ Still retrieve relevant context
2. 🔴 Display prominent warning banner with gradient alert
3. 💡 Provide safer alternatives when possible
4. 👨‍⚕️ Recommend professional consultation
5. ❌ Never provide medical diagnosis or treatment
6. 📋 Show detected conditions as tags

### Example Safety Response

```
⚠️ IMPORTANT: Professional Guidance Recommended
Your question involves: HEART CONDITIONS, HIGH BLOOD PRESSURE

General Information:
[Context-based safe information about gentle practices]

Safer Alternatives:
• Gentle breathing exercises without retention
• Supported relaxation poses
• Meditation and visualization
• Practice under qualified yoga therapist

⚠️ This is general information, not medical advice. Please consult your healthcare provider before starting any yoga practice.
```

## 🗄️ MongoDB Schema

### QueryLog Collection

```javascript
{
  _id: ObjectId,
  query: String,                    // User's question
  embedding: Array<Number>,         // Query embedding (768d)
  retrievedContext: [{
    chunkId: String,
    title: String,
    content: String,
    source: String,
    page: Number,
    similarityScore: Number
  }],
  answer: String,                   // Generated response
  sources: [{                       // Deduplicated sources
    title: String,
    source: String,
    page: Number
  }],
  safetyCheck: {
    isUnsafe: Boolean,
    detectedConditions: [String],
    keywords: [String],
    message: String,
    alternatives: [String]
  },
  model: {
    embedding: String,              // "text-embedding-004"
    generation: String              // "gemini-pro"
  },
  responseTime: Number,             // ms
  feedback: {
    isHelpful: Boolean,
    providedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## � Project Structure

```
Yoga-App/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── pinecone.js          # Pinecone client setup
│   ├── data/
│   │   └── yoga_knowledge.json  # 100 curated articles
│   ├── models/
│   │   └── QueryLog.js          # MongoDB schema
│   ├── routes/
│   │   ├── ask.js               # Main RAG endpoint
│   │   └── feedback.js          # User feedback endpoint
│   ├── scripts/
│   │   ├── ingest.js            # Populate Pinecone
│   │   └── test-query.js        # Test RAG pipeline
│   ├── services/
│   │   ├── embeddings.js        # Generate embeddings
│   │   ├── retrieval.js         # Vector search
│   │   ├── generation.js        # AI response generation
│   │   └── safety.js            # Medical condition detection
│   ├── .env                     # Environment variables
│   ├── .gitignore
│   ├── package.json
│   └── server.js                # Express app entry
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueryInput.jsx & .css
│   │   │   ├── ResponseDisplay.jsx & .css
│   │   │   ├── SafetyWarning.jsx & .css
│   │   │   └── SourcesList.jsx & .css
│   │   ├── services/
│   │   │   └── api.js           # Backend API integration
│   │   ├── App.jsx              # Main React component
│   │   ├── App.css
│   │   └── index.js
│   ├── package.json
│   └── .gitignore
├── knowledge/
│   └── Common Yoga Protocol Book-English.pdf
└── README.md
```

## �🚀 Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Pinecone account (Free tier works)
- Google AI (Gemini) API key

### 1. Clone Repository

```bash
git clone https://github.com/VIDHITTS/Yoga-App.git
cd Yoga-App
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=yoga-wellness-rag
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=development
```

Initialize vector database:

```bash
npm run ingest
```

Start backend:

```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

Access application at: `http://localhost:3000`

## 📁 Project Structure

```
yoga-app/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── pinecone.js          # Pinecone client setup
│   ├── models/
│   │   └── QueryLog.js          # MongoDB schema
│   ├── routes/
│   │   ├── ask.js               # Query endpoint
│   │   └── feedback.js          # Feedback endpoint
│   ├── services/
│   │   ├── embeddings.js        # Gemini embeddings
│   │   ├── retrieval.js         # Pinecone search
│   │   ├── generation.js        # Gemini text generation
│   │   └── safety.js            # Safety detection
│   ├── scripts/
│   │   └── ingest.js            # Knowledge base ingestion
│   ├── data/
│   │   └── yoga_knowledge.json  # Curated articles
│   └── server.js                # Express app
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── QueryInput.jsx
│   │   │   ├── ResponseDisplay.jsx
│   │   │   ├── SourcesList.jsx
│   │   │   └── SafetyWarning.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.js
│   └── package.json
├── knowledge/
│   └── Common Yoga Protocol Book-English.pdf
└── README.md
```

## 🎥 Demo Video

[Link to 3-minute demo video]

**Video Content**:

1. Problem statement and solution overview (30s)
2. RAG pipeline walkthrough (60s)
3. Safety detection demonstration (60s)
4. MongoDB logging showcase (30s)

## 🤖 AI Tools Used

This project was developed with assistance from AI tools. Below is a list of key prompts used:

### RAG Architecture Prompts

1. "Design a RAG pipeline for yoga wellness queries with safety considerations"
2. "What's the optimal chunk size and overlap for yoga instruction documents?"
3. "Create a system prompt for an LLM that provides safe yoga guidance without medical advice"

### Safety System Prompts

1. "List medical conditions that require yoga modifications or contraindications"
2. "Write professional safety disclaimers for a yoga guidance application"
3. "Design a keyword-based safety detection system for wellness queries"

### Code Implementation Prompts

1. "Implement Pinecone vector search with Gemini embeddings in Node.js"
2. "Create Express.js API endpoints for RAG query handling with error handling"
3. "Build a React component that displays retrieved sources with metadata"

### Documentation Prompts

1. "Write a professional README for a RAG-based wellness application"
2. "Explain chunking strategy and RAG architecture for technical evaluators"
3. "Create MongoDB schema documentation for query logging"

## 🧪 Testing

### Test Safety Detection

```bash
# Backend running at http://localhost:5000
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "Is headstand safe during pregnancy?"}'
```

Expected: Safety warning + gentle alternatives

### Test Normal Query

```bash
curl -X POST http://localhost:5000/api/ask \
  -H "Content-Type: application/json" \
  -d '{"query": "What are the benefits of Surya Namaskar?"}'
```

Expected: Detailed answer with sources

## 📊 Key Features

✅ **RAG Pipeline**: Semantic retrieval with Pinecone + Gemini  
✅ **Safety First**: Keyword detection + professional disclaimers  
✅ **Transparency**: Always shows sources used  
✅ **Data Logging**: All queries logged to MongoDB  
✅ **Clean UI**: Simple, professional interface  
✅ **Error Handling**: Comprehensive error handling throughout  
✅ **Performance**: Response times logged and optimized

## 🎯 Design Choices

### Why Pinecone?

- Managed service (no infrastructure overhead)
- Fast similarity search at scale
- Excellent metadata filtering
- Production-ready with monitoring

### Why Gemini?

- High-quality embeddings
- Strong safety features built-in
- Good understanding of wellness content
- Cost-effective for this use case

### Why MongoDB?

- Flexible schema for logging diverse data
- Easy querying for analytics
- Excellent Node.js integration
- Atlas cloud service simplifies deployment

## 📝 Citations

**Primary Knowledge Source**:

- Common Yoga Protocol, Ministry of Ayush, Government of India
- International Day of Yoga - Official Publication
- Public domain educational content

## 👥 Author

Vidhitt S

- GitHub: [@VIDHITTS](https://github.com/VIDHITTS)

## 📄 License

This project is developed as part of an assignment for educational purposes.

---

Built with ❤️ for promoting safe and accessible yoga education.
