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
      prompt = `You are a warm, knowledgeable yoga wellness guide speaking naturally to a friend.

IMPORTANT: The user mentioned these health conditions: ${safetyKeywords.join(", ")}

Reference Material:
${contextText}

User's Question: ${query}

RESPOND NATURALLY WITH THESE GUIDELINES:
- Write in a warm, conversational tone like you're chatting with a friend
- Acknowledge their health situation with empathy first
- Share gentle, safe practices they CAN try (breathing, meditation, restorative poses)
- Use simple, everyday English - avoid stiff or clinical language
- Keep it friendly and encouraging (about 100-120 words)
- End warmly with a reminder to check with their doctor or yoga therapist

Write your response:`;
    } else {
      prompt = `You are a friendly, knowledgeable yoga guide having a natural conversation.

Reference Material:
${contextText}

User's Question: ${query}

RESPOND NATURALLY:
- ONLY answer yoga-related questions (poses, breathing, meditation, wellness)
- If they just say "hi" or ask non-yoga questions, warmly redirect: "Hey there! I'm here to help with all things yoga - poses, breathing techniques, meditation, and more. What would you like to explore today?"
- Write like you're explaining to a curious friend, not reading from a textbook
- Use flowing, natural sentences - avoid bullet points or lists in your speech
- Keep it conversational and warm (100-120 words)
- Mention source names naturally when relevant, like "According to the Common Yoga Protocol..."
- Never give medical advice

Write your response:`;
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
