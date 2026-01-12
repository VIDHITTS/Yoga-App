# 🧘 Wellness RAG Micro-App: Ask Me Anything About Yoga

A full-stack AI-powered wellness application that answers yoga and fitness-related queries using a Retrieval-Augmented Generation (RAG) pipeline with safety guardrails.

## 🎯 Project Overview

This application provides accurate, context-aware answers to yoga-related questions by:
- Retrieving relevant information from an authoritative knowledge base
- Using AI to generate safe, helpful responses
- Detecting potentially unsafe queries and providing appropriate warnings
- Logging all interactions for analysis and improvement

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │
│   (React)   │
└──────┬──────┘
       │ HTTP
       ↓
┌─────────────────────────────────────┐
│          Backend (Node.js)          │
│  ┌─────────────────────────────┐   │
│  │     Safety Detection        │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │   RAG Pipeline              │   │
│  │   1. Embed query (Gemini)   │   │
│  │   2. Retrieve (Pinecone)    │   │
│  │   3. Generate (Gemini)      │   │
│  └─────────────────────────────┘   │
└──────┬──────────────────────┬───────┘
       │                      │
       ↓                      ↓
┌─────────────┐      ┌─────────────┐
│   Pinecone  │      │   MongoDB   │
│ Vector Store│      │  Query Logs │
└─────────────┘      └─────────────┘
```

## 🧠 RAG Pipeline Design

### 1. Knowledge Base
**Source**: Common Yoga Protocol - Ministry of Ayush, Government of India

The knowledge base consists of 50+ carefully curated articles covering:
- Yoga fundamentals and philosophy
- Asanas (physical poses) with benefits and contraindications
- Pranayama (breathing techniques)
- Meditation and relaxation practices
- Safety guidelines and precautions
- Common conditions and modifications

### 2. Chunking Strategy
- **Chunk Size**: 300-400 tokens
- **Overlap**: 50 tokens
- **Method**: Semantic chunking with metadata preservation

**Rationale**: 
- 300-400 tokens provide sufficient context without overwhelming the model
- 50-token overlap ensures continuity across chunk boundaries
- Metadata (title, source, page) enables transparent source citation

### 3. Embeddings
- **Model**: Google Gemini text-embedding-004
- **Dimensions**: 768
- **Why Gemini**: High-quality embeddings with good semantic understanding for wellness content

### 4. Vector Store
- **Platform**: Pinecone
- **Index**: yoga-wellness-rag
- **Metric**: Cosine similarity
- **Top-K**: 5 most relevant chunks

### 5. Generation
- **Model**: Google Gemini Pro
- **Temperature**: 0.3 (for consistent, accurate responses)
- **System Prompt**: Includes safety guidelines and context-only instructions

## 🛡️ Safety & Guardrails

### Safety Detection System
Detects queries mentioning:
- **Pregnancy conditions**: All trimesters, postpartum
- **Chronic diseases**: Hypertension, diabetes, heart disease, glaucoma
- **Recent medical events**: Surgery, injury, herniated disc
- **Severe conditions**: Cancer treatment, neurological disorders

### Safety Response Protocol
When unsafe query is detected:
1. ✅ Still retrieve relevant context
2. 🔴 Display prominent warning banner
3. 💡 Provide safer alternatives when possible
4. 👨‍⚕️ Recommend professional consultation
5. ❌ Never provide medical diagnosis or treatment

### Example Safety Response
```
⚠️ SAFETY NOTICE
Your question involves a health condition that requires personalized guidance.

General Information:
[Context-based safe information]

Safer Alternatives:
- Gentle breathing exercises
- Meditation and relaxation
- Consult a certified yoga therapist

Please consult your healthcare provider before starting any yoga practice.
```

## 🗄️ MongoDB Schema

### QueryLog Collection
```javascript
{
  _id: ObjectId,
  query: String,                    // User's question
  embedding: Array<Number>,         // Query embedding
  retrievedChunks: [{
    chunkId: String,
    title: String,
    content: String,
    source: String,
    score: Number
  }],
  answer: String,                   // Generated response
  isUnsafe: Boolean,               // Safety flag
  safetyKeywords: [String],        // Detected keywords
  model: String,                   // AI model used
  responseTime: Number,            // ms
  feedback: {
    helpful: Boolean,
    timestamp: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account
- Pinecone account
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
