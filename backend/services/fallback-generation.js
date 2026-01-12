/**
 * Fallback response generator - no API required!
 * Used when AI APIs are unavailable (quota limits, etc.)
 */

/**
 * Generate a response using retrieved context without external APIs
 * This creates a structured response from the knowledge base content
 */
const generateFallbackResponse = (
  query,
  retrievedChunks,
  isUnsafe,
  safetyKeywords
) => {
  if (retrievedChunks.length === 0) {
    return "I don't have specific information about that in my knowledge base. Please consult with a certified yoga instructor or healthcare provider for personalized guidance.";
  }

  let response = "";

  // Add safety warning for unsafe queries
  if (isUnsafe && safetyKeywords && safetyKeywords.length > 0) {
    response += `⚠️ I notice your question involves health conditions (${safetyKeywords.join(
      ", "
    )}). Please note that this is general educational information only.\n\n`;
  }

  // Add introduction
  response += `Based on the Common Yoga Protocol by the Ministry of Ayush, here's what I found:\n\n`;

  // Add content from top retrieved chunks
  retrievedChunks.slice(0, 3).forEach((chunk, idx) => {
    response += `**${chunk.title}**\n\n`;

    // Add the content safely
    if (chunk.content && typeof chunk.content === "string") {
      const cleanContent = chunk.content.trim();
      if (cleanContent.length > 0) {
        response += `${cleanContent}\n\n`;
      }
    }

    if (idx < retrievedChunks.length - 1 && idx < 2) {
      response += `---\n\n`;
    }
  });

  // Add safety footer for unsafe queries
  if (isUnsafe) {
    response += `\n\n⚠️ **Important Safety Note:** Since your question involves health conditions, please consult with your healthcare provider or a certified yoga therapist before starting any new practice. They can provide personalized guidance based on your specific situation.`;
  } else {
    response += `\n\nRemember to practice mindfully and listen to your body. If you have any health concerns, please consult with a healthcare provider before starting a new yoga practice.`;
  }

  return response;
};

module.exports = {
  generateFallbackResponse,
};
