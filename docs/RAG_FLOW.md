# 🔄 RAG Pipeline Flow Documentation

This document explains the complete request-to-response flow of the Yoga Wellness RAG Application.

---

## 📊 Complete Flow Diagram

```mermaid
flowchart TD
    A[👤 User Query] --> B{Input Validation}
    B -->|Invalid| C[❌ 400 Error Response]
    B -->|Valid| D[🛡️ Safety Detection]

    D --> E{Contains Health Keywords?}
    E -->|Yes - Unsafe| F[🚨 Flag as Unsafe]
    E -->|No - Safe| G[Check Yoga Relevance]

    F --> H[🤖 Smart Safety LLM Check]
    H --> I[Generate Safety Analysis]

    G --> J{Is Yoga Related?}
    J -->|No| K[📝 Rejection Message]
    K --> L[Log to MongoDB]
    L --> M[Return Rejection Response]

    J -->|Yes| N[🔢 Generate Embedding]
    I --> N

    N --> O[Transformers.js<br/>all-MiniLM-L6-v2<br/>384 dimensions]
    O --> P[📚 Pinecone Vector Search]

    P --> Q[Cosine Similarity<br/>Top 5 Matches]
    Q --> R[Retrieved Context Chunks]

    R --> S{Is Query Unsafe?}
    S -->|Yes| T[🛡️ Generate Safety Pivot Response]
    S -->|No| U[🤖 Generate Normal Response]

    T --> V[Groq LLM<br/>llama-3.1-8b-instant]
    U --> V

    V --> W[AI Generated Answer]
    W --> X[📊 Prepare Response]

    X --> Y[Add Sources with Scores]
    Y --> Z[Add Safety Info if Unsafe]
    Z --> AA[💾 Log to MongoDB]

    AA --> BB[📤 JSON Response to Client]

    BB --> CC{Frontend Display}
    CC -->|Unsafe| DD[🔴 Red Safety Banner<br/>+ Doctor Consultation Advice<br/>+ Safe Alternatives]
    CC -->|Safe| EE[💬 Normal Response<br/>+ Source Citations]

    style A fill:#e1f5fe
    style D fill:#fff3e0
    style F fill:#ffebee
    style N fill:#e8f5e9
    style P fill:#f3e5f5
    style V fill:#fff8e1
    style BB fill:#e8f5e9
    style DD fill:#ffcdd2
    style EE fill:#c8e6c9
```

---

## 🔍 Detailed Step-by-Step Flow

### Phase 1: Request Validation

```mermaid
sequenceDiagram
    participant Client
    participant Express
    participant Validator

    Client->>Express: POST /api/ask {query: "..."}
    Express->>Validator: Check query

    alt Query is empty
        Validator-->>Client: 400 "Query is required"
    else Query > 500 chars
        Validator-->>Client: 400 "Query too long"
    else Valid
        Validator->>Express: Continue processing
    end
```

### Phase 2: Safety Detection

```mermaid
sequenceDiagram
    participant Route
    participant SafetyService
    participant SmartSafety
    participant Groq

    Route->>SafetyService: detectUnsafeQuery(query)
    SafetyService->>SafetyService: Check 50+ keywords<br/>across 8 categories

    alt Keywords Found
        SafetyService-->>Route: {isUnsafe: true, keywords: [...], categories: [...]}
        Route->>SmartSafety: checkSafetyWithLLM(query)
        SmartSafety->>Groq: Analyze safety risks
        Groq-->>SmartSafety: {detectedCondition, reason, modification}
        SmartSafety-->>Route: Smart safety data
    else No Keywords
        SafetyService-->>Route: {isUnsafe: false}
    end
```

### Phase 3: Embedding & Retrieval

```mermaid
sequenceDiagram
    participant Route
    participant LocalEmbeddings
    participant Transformers
    participant Pinecone

    Route->>LocalEmbeddings: generateEmbedding(query)
    LocalEmbeddings->>Transformers: pipeline("feature-extraction")
    Transformers->>Transformers: all-MiniLM-L6-v2 model
    Transformers-->>LocalEmbeddings: 384-dim vector
    LocalEmbeddings-->>Route: embedding[]

    Route->>Pinecone: query(embedding, topK=5)
    Pinecone->>Pinecone: Cosine similarity search
    Pinecone-->>Route: Top 5 matching chunks<br/>with scores & metadata
```

### Phase 4: Response Generation

```mermaid
sequenceDiagram
    participant Route
    participant Generation
    participant Groq
    participant Fallback

    Route->>Generation: generateResponse(query, chunks, isUnsafe)
    Generation->>Generation: Build context from chunks
    Generation->>Generation: Create prompt (safe/unsafe)

    Generation->>Groq: chat.completions.create()

    alt Groq Success
        Groq-->>Generation: AI response
    else Groq Error
        Generation->>Fallback: generateFallbackResponse()
        Fallback-->>Generation: Template-based response
    end

    Generation-->>Route: Final answer
```

### Phase 5: Logging & Response

```mermaid
sequenceDiagram
    participant Route
    participant MongoDB
    participant Client

    Route->>MongoDB: Save QueryLog
    Note over MongoDB: query, embedding, chunks,<br/>answer, safety flags,<br/>timestamps, responseTime
    MongoDB-->>Route: Saved with _id

    Route->>Client: JSON Response
    Note over Client: {success, queryId,<br/>answer, sources[],<br/>safety{}, metadata{}}
```

---

## 📁 Component Architecture

```mermaid
graph TB
    subgraph Frontend["🖥️ Frontend (React + Vite)"]
        UI[App.jsx - Chat UI]
        API[api.js - API Service]
        SW[SafetyWarning.jsx]
        SL[SourcesList.jsx]
    end

    subgraph Backend["⚙️ Backend (Node.js + Express)"]
        Server[server.js]
        Routes[routes/ask.js]

        subgraph Services["Services"]
            Embed[embeddings.js]
            LocalEmbed[local-embeddings.js]
            Retrieve[retrieval.js]
            Generate[generation.js]
            Safety[safety.js]
            SmartSafety[smart-safety.js]
            Fallback[fallback-generation.js]
        end

        Models[models/QueryLog.js]
    end

    subgraph External["☁️ External Services"]
        Pinecone[(Pinecone<br/>Vector DB)]
        MongoDB[(MongoDB<br/>Atlas)]
        Groq[Groq API<br/>LLM]
    end

    UI --> API
    API --> Server
    Server --> Routes
    Routes --> Embed
    Routes --> Safety
    Routes --> SmartSafety
    Embed --> LocalEmbed
    Routes --> Retrieve
    Retrieve --> Pinecone
    Routes --> Generate
    Generate --> Groq
    Generate --> Fallback
    Routes --> Models
    Models --> MongoDB

    style Frontend fill:#e3f2fd
    style Backend fill:#f3e5f5
    style External fill:#e8f5e9
```

---

## ⏱️ Performance Timeline

```mermaid
gantt
    title Request Processing Timeline (~2-3 seconds)
    dateFormat X
    axisFormat %L ms

    section Validation
    Input Validation     :0, 10
    Safety Keyword Check :10, 30

    section Embedding
    Local Embedding (Transformers.js) :30, 530

    section Retrieval
    Pinecone Vector Search :530, 700

    section Generation
    Smart Safety LLM (if unsafe) :700, 1200
    Main Response Generation :700, 1800

    section Logging
    MongoDB Save :1800, 1900

    section Response
    JSON Serialization :1900, 1950
```

---

## 🔐 Safety System Flow

```mermaid
flowchart LR
    subgraph Detection["🔍 Detection Layer"]
        K1[Pregnancy Keywords]
        K2[Cardiovascular]
        K3[Musculoskeletal]
        K4[Chronic Diseases]
        K5[Neurological]
        K6[Cancer]
        K7[Respiratory]
        K8[Recent Trauma]
    end

    subgraph Analysis["🧠 Smart Analysis"]
        LLM[Groq LLM Analysis]
        Risk[Risk Assessment]
        Alt[Safe Alternative Generation]
    end

    subgraph Response["📤 Response"]
        Banner[🔴 Safety Banner]
        Consult[👨‍⚕️ Doctor Consultation Advice]
        Alts[💡 Safe Alternatives]
        Answer[Modified AI Response]
    end

    K1 & K2 & K3 & K4 & K5 & K6 & K7 & K8 --> LLM
    LLM --> Risk
    Risk --> Alt
    Alt --> Banner
    Banner --> Consult
    Consult --> Alts
    Alts --> Answer

    style Detection fill:#ffebee
    style Analysis fill:#fff3e0
    style Response fill:#e8f5e9
```

---

## 📊 Data Flow Summary

| Step | Component        | Input            | Output          | Time        |
| ---- | ---------------- | ---------------- | --------------- | ----------- |
| 1    | Express Router   | HTTP POST        | Validated query | ~10ms       |
| 2    | Safety Service   | Query string     | Safety flags    | ~20ms       |
| 3    | Local Embeddings | Query string     | 384-dim vector  | ~400-500ms  |
| 4    | Pinecone         | Embedding vector | Top 5 chunks    | ~100-200ms  |
| 5    | Groq LLM         | Context + Query  | AI response     | ~800-1500ms |
| 6    | MongoDB          | Full query data  | Logged document | ~100ms      |
| 7    | Express          | Response object  | JSON to client  | ~10ms       |

**Total: ~1.5-2.5 seconds per query**

---

## 🎯 Key Design Decisions

1. **Local Embeddings**: Zero API cost, no quota limits
2. **Smart Safety**: LLM-powered risk analysis, not just keywords
3. **Fallback System**: Template responses when AI fails
4. **Complete Logging**: Every query tracked for analytics
5. **Source Attribution**: Transparent citations for trust

---

_Generated for Yoga Wellness RAG Application - Assignment Submission_
