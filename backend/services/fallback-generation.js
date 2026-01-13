/**
 * Fallback response generator - no API required!
 * Used when AI APIs are unavailable (quota limits, etc.)
 * CONCISE VERSION - summarizes instead of dumping raw content
 */

/**
 * Generate a CONCISE response using retrieved context without external APIs
 */
const generateFallbackResponse = (
  query,
  retrievedChunks,
  isUnsafe,
  safetyKeywords
) => {
  if (retrievedChunks.length === 0) {
    return "I don't have specific information about that in my knowledge base. Please try asking about yoga poses, breathing techniques, or meditation practices.";
  }

  // Get the top chunk (most relevant)
  const topChunk = retrievedChunks[0];

  // Extract just the title and a brief summary (first 200 chars of content)
  const briefContent = topChunk.content
    ? topChunk.content.substring(0, 250).trim() + "..."
    : "";

  let response = "";

  // Add safety prefix for unsafe queries (short version)
  if (isUnsafe && safetyKeywords && safetyKeywords.length > 0) {
    response += `Since you mentioned ${safetyKeywords[0]}, please practice carefully. `;
  }

  // Add concise response
  response += `Based on ${topChunk.title}: ${briefContent}`;

  // Short safety footer
  if (isUnsafe) {
    response += `\n\nPlease consult your doctor or a certified yoga therapist before practicing.`;
  } else {
    response += `\n\nPractice mindfully and listen to your body.`;
  }

  return response;
};

module.exports = {
  generateFallbackResponse,
};
