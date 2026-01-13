# AI Prompts & Tools Documentation

This document lists all AI prompts, tools, and techniques used to build the **Yoga Wellness RAG Micro-App**.

> **Transparency:** AI assistance was used for code scaffolding, data formatting, and brainstorming. Core RAG architecture, safety logic, and prompt engineering were designed and verified manually.

---

## 1. Knowledge Base Preparation

**Tool:** Google Gemini  
**Purpose:** Format raw text from Ministry of Ayush Yoga Protocol into structured JSON.

**Prompt:**
```
I have raw text for the yoga pose 'Tadasana' from the official protocol. Format it into clean JSON with these fields:
- id, title, info, precautions, source, page
Do NOT summarize or alter medical facts, just structure the data.
```

---

## 2. RAG Response Generation

**Tool:** Groq API (LLaMA 3.3 70B)  
**Purpose:** Generate natural, context-aware yoga guidance.

### Safe Query Prompt:
```
You are a friendly, knowledgeable yoga guide having a natural conversation.

Reference Material:
{retrieved_chunks}

User's Question: {query}

RESPOND NATURALLY:
- Write like you're explaining to a curious friend
- Use flowing, natural sentences
- Keep it conversational and warm (100-120 words)
- Mention source names naturally when relevant
- Never give medical advice

Write your response:
```

### Unsafe Query Prompt:
```
You are a warm, knowledgeable yoga wellness guide speaking naturally to a friend.

IMPORTANT: The user mentioned these health conditions: {safety_keywords}

Reference Material:
{retrieved_chunks}

User's Question: {query}

RESPOND NATURALLY:
- Acknowledge their health situation with empathy first
- Share gentle, safe practices they CAN try
- Use simple, everyday English
- Keep it friendly and encouraging (100-120 words)
- End warmly with a reminder to check with their doctor

Write your response:
```

---

## 3. Smart Safety Pivot (LLM-Based)

**Tool:** Groq API  
**Purpose:** Analyze queries for health risks and generate context-aware safe alternatives.

**Prompt:**
```
Analyze this yoga-related query for safety risks.

Query: "{query}"

Check for these SAFETY RISKS:
- Pregnancy / Post-natal / Trimester mentions
- Surgery, Hernia, Fracture, Injury
- Heart conditions, High Blood Pressure
- Glaucoma, Eye problems
- Chronic conditions (diabetes, epilepsy, vertigo)

RESPOND IN VALID JSON ONLY:

If RISK DETECTED:
{
  "isUnsafe": true,
  "detectedCondition": "brief condition name",
  "reason": "A gentle 1-sentence explanation of the risk",
  "modification": "A specific safer alternative practice"
}

If SAFE:
{
  "isUnsafe": false,
  "detectedCondition": null,
  "reason": null,
  "modification": null
}
```

---

## 4. Safety Keywords Generation

**Tool:** Google Gemini  
**Purpose:** Brainstorm comprehensive list of medical keywords for heuristic filter.

**Prompt:**
```
Generate a list of 30 common medical keywords that should trigger a safety warning in a fitness app. Include terms for:
- Pregnancy (trimesters, prenatal, postpartum)
- Cardiovascular (hypertension, heart condition)
- Injuries (hernia, fracture, surgery)
- Chronic conditions (diabetes, epilepsy, glaucoma)

Output as a raw string array.
```

---

## 5. Frontend UI Components

**Tool:** Google Gemini  
**Purpose:** Generate React component scaffolding.

**Prompt:**
```
Create a React component for a safety warning banner:
- Full-width bar at the top of the screen
- Red gradient background for visibility
- AlertTriangle icon with close button
- Framer Motion animations for slide-in effect
- Props: message, isVisible, onClose, autoClose
```

---

## 6. Technology Stack

| Component | Technology | Rationale |
|-----------|------------|-----------|
| **Embeddings** | Xenova/Transformers (all-MiniLM-L6-v2) | Free, runs locally, 384 dimensions |
| **Vector DB** | Pinecone | Serverless, fast retrieval |
| **LLM** | Groq (LLaMA 3.3 70B) | Fast inference, good quality |
| **Backend** | Node.js + Express | Non-blocking I/O for RAG |
| **Frontend** | React + Vite + Tailwind | Modern, fast development |
| **Database** | MongoDB Atlas | Flexible schema for logging |

---

## 7. Development Tools

| Tool | Usage |
|------|-------|
| Google Gemini | Code scaffolding, data formatting |
| Claude | Documentation and prompts |

---

## 8. Research & Conceptual Prompts

### RAG Architecture Research
**Prompt:**
```
Explain the trade-offs between using FAISS (local) vs Pinecone (cloud) for a small-scale RAG application with ~100 documents. What are the latency, cost, and maintenance considerations?
```

### Chunking Strategy
**Prompt:**
```
What is the optimal chunk size for yoga-related content when using all-MiniLM-L6-v2 embeddings? Should I use fixed-size chunking or semantic chunking for instructional content?
```

### Safety System Design
**Prompt:**
```
Compare keyword-based safety detection vs LLM-based classification for health-related queries. What are the false positive/negative trade-offs? When should I use a hybrid approach?
```

### MongoDB Schema Design
**Prompt:**
```
What fields should I log for a RAG chatbot to enable future analytics? Consider: query patterns, retrieval quality metrics, response latency, and user feedback tracking.
```

### Prompt Engineering Best Practices
**Prompt:**
```
How do I prevent an LLM from hallucinating medical advice while still being helpful? What guardrails should I include in the system prompt for a wellness application?
```

---

*This document fulfills the "AI Tools & Prompts" requirement for submission.*
