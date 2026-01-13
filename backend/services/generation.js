const Groq = require("groq-sdk");
const { generateFallbackResponse } = require("./fallback-generation");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

/**
 * Generate answer using Gemini with retrieved context
 */
const generateResponse = async (
  query,
  retrievedChunks,
  isUnsafe,
  safetyKeywords
) => {
  try {
    // Construct context from retrieved chunks
    const contextText = retrievedChunks
      .map(
        (chunk, idx) => `[Source ${idx + 1}: ${chunk.title}]\n${chunk.content}`
      )
      .join("\n\n---\n\n");

    // Build prompt based on safety status
    let prompt = "";

    if (isUnsafe) {
      prompt = `You are a knowledgeable yoga wellness assistant providing SAFE guidance.

CRITICAL: User mentioned health conditions: ${safetyKeywords.join(", ")}

Context from Authoritative Sources:
${contextText}

User Question: ${query}

SAFETY-FIRST INSTRUCTIONS:
1. Start by acknowledging the health condition mentioned
2. Provide ONLY general information from the context - NO specific medical advice
3. Suggest safer alternatives (breathing exercises, gentle poses, meditation)
4. Keep response under 150 words
5. End with: "Please consult your healthcare provider or certified yoga therapist before practicing."

Provide a brief, safe response:`;
    } else {
      prompt = `You are a knowledgeable yoga wellness assistant with STRICT boundaries.

Context from Ministry of Ayush - Common Yoga Protocol:
${contextText}

User Question: ${query}

CRITICAL INSTRUCTIONS:
1. ONLY answer if the question is about yoga, meditation, pranayama, asanas, or wellness practices
2. If the question is NOT related to yoga (e.g., "hi", "hello", random topics), respond EXACTLY with:
   "I'm a yoga wellness assistant and can only answer questions about yoga practice, poses, breathing techniques, and meditation. Please ask me something related to yoga!"
3. If the context doesn't contain relevant information for a yoga question, say:
   "I don't have specific information about that in my yoga knowledge base. Please ask about common yoga poses, breathing techniques, or meditation practices."
4. Keep responses concise (100-150 words maximum)
5. Reference sources naturally when answering
6. NEVER provide medical diagnosis or treatment

Provide a focused answer ONLY if it's about yoga:`;
    }

    // Generate response with Groq (llama-3.3-70b is the current model)
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: 1024,
      top_p: 0.95,
    });

    const answer = completion.choices[0]?.message?.content || "Unable to generate response.";
    return answer;
  } catch (error) {
    console.error("❌ Groq API Error:", error.message);
    console.log("🔄 Using fallback response generator...");

    // Use fallback when Groq API fails (quota, network, etc.)
    const fallbackAnswer = generateFallbackResponse(
      query,
      retrievedChunks,
      isUnsafe,
      safetyKeywords
    );

    return fallbackAnswer;
  }
};

module.exports = { generateResponse };
