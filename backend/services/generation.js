const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate answer using Gemini with retrieved context
 */
const generateResponse = async (query, retrievedChunks, isUnsafe, safetyKeywords) => {
  try {
    // Construct context from retrieved chunks
    const contextText = retrievedChunks
      .map((chunk, idx) => `[Source ${idx + 1}: ${chunk.title}]\n${chunk.content}`)
      .join('\n\n---\n\n');

    // Build prompt based on safety status
    let prompt = '';
    
    if (isUnsafe) {
      prompt = `You are a knowledgeable and helpful yoga wellness assistant. 

IMPORTANT: This query mentions health conditions (${safetyKeywords.join(', ')}). You must provide safe, general information without medical advice.

Context from Knowledge Base:
${contextText}

User Question: ${query}

CRITICAL SAFETY INSTRUCTIONS:
1. Start with: "I notice your question involves a health condition that requires personalized guidance."
2. Provide ONLY general educational information from the context
3. Suggest SAFER alternatives (breathing, meditation, gentle movements)
4. End with: "Please consult your healthcare provider or a certified yoga therapist before practicing."
5. NEVER diagnose, prescribe, or give specific medical advice

Provide a safe, informative response:`;
    } else {
      prompt = `You are a knowledgeable and helpful yoga wellness assistant.

Context from Knowledge Base:
${contextText}

User Question: ${query}

INSTRUCTIONS:
1. Answer using ONLY the information from the context above
2. If the context doesn't fully answer the question, acknowledge that
3. Be warm, encouraging, and supportive
4. Reference the sources when providing information
5. Never provide medical diagnosis or treatment advice

Provide a helpful answer:`;
    }

    // Generate response with Gemini
    const model = genAI.getGenerativeModel({ model: process.env.GENERATION_MODEL || 'gemini-pro' });
    
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    const response = await result.response;
    const answer = response.text();

    return answer;
  } catch (error) {
    console.error('❌ Generation Error:', error.message);
    throw new Error('Failed to generate response');
  }
};

module.exports = { generateResponse };
