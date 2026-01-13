# 🛠️ AI Tools & Prompts Documentation

This document transparently outlines the AI tools and prompts used during the development of the **Wellness RAG Micro-App**. 

> **Policy Statement:** AI assistance (Google Gemini) was strictly limited to **data formatting**, **generating boilerplate UI code**, and **brainstorming safety keywords**. The core RAG architecture, embedding strategy (Xenova), and final safety logic were implemented and verified manually to ensure system robustness.

---

## 1. Knowledge Base Preparation (Human-in-the-Loop)

**Tool:** Google Gemini
**Purpose:** To format raw, authoritative text from the *Ministry of Ayush Yoga Protocol* into clean, consistent JSON/Text files for the RAG pipeline.

**Prompt Used:**
> "I have raw text for the yoga pose 'Tadasana' from the official protocol. Please format it into a clean structure with these specific headers: 'Technique', 'Benefits', 'Contraindications', and 'Breathing'. Do NOT summarize or change the medical facts, just fix the indentation and line breaks."

*Verification:* All generated data was manually reviewed against the original PDF to ensure zero hallucinations regarding medical contraindications.

---

## 2. Embedding Strategy & RAG Logic

**Tool:** Hugging Face (`@xenova/transformers`)
**Model:** `all-MiniLM-L6-v2`
**Purpose:** Implementation of local, cost-effective embeddings instead of relying on external paid APIs.

**Implementation Details:**
AI was not used to write the core logic. I chose `Xenova` to run embeddings locally within the Node.js environment for lower latency and zero cost.

**Boilerplate Assistance (Gemini):**
> "Show me the syntax for initializing a `feature-extraction` pipeline using `@xenova/transformers` in a Node.js environment. I need to convert text chunks into vector arrays."

---

## 3. Safety Guardrails (Hybrid Approach)

**Tool:** Google Gemini
**Purpose:** To brainstorm a comprehensive list of medical keywords for the heuristic safety filter.

**Prompt Used:**
> "Generate a list of 30 common medical keywords that should trigger a safety warning in a fitness application. Include terms related to pregnancy (trimesters), cardiovascular issues (angina, high bp), and acute injuries (hernia, fracture). Output as a raw string array."

*Refinement:* I manually filtered this list to remove generic terms (like "tired") to prevent false positives in the application.

---

## 4. Frontend UI Scaffolding

**Tool:** Google Gemini
**Purpose:** To rapidly generate React component structures and CSS for the "Medical Warning" banner.

**Prompt Used:**
> "Create a React component snippet that takes a `isUnsafe` prop. If true, display a red alert box with a warning icon. If false, display the children components. Use inline styles for a clean, minimal look."

---

## 5. Technology Stack Summary

| Component | Technology / Tool | Choice Rationale |
| :--- | :--- | :--- |
| **Embeddings** | **Xenova/Transformers** (Hugging Face) | Zero cost, runs locally, no API latency. |
| **Vector DB** | **Pinecone** | Serverless scalability and fast retrieval. |
| **Backend** | **Node.js + Express** | Non-blocking I/O ideal for handling RAG requests. |
| **Code Assist** | **Google Gemini** | Used for regex patterns, data formatting, and CSS modules. |

---

*This document serves to meet the "AI Tools & Prompts" requirement of the assignment submission.*