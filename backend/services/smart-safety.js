const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Smart Safety Check using LLM
 * Returns structured safety analysis with safe alternatives
 */
const checkSafetyWithLLM = async (query) => {
  try {
    const safetyPrompt = `Analyze this yoga-related query for safety risks.

Query: "${query}"

Check for these SAFETY RISKS:
- Pregnancy / Post-natal / Trimester mentions
- Surgery, Hernia, Fracture, Injury, Post-operative
- Heart conditions, High Blood Pressure, Cardiovascular issues
- Glaucoma, Eye problems
- Chronic conditions (diabetes, epilepsy, vertigo)
- Recent trauma or acute pain

RESPOND IN VALID JSON ONLY (no markdown, no explanation):

If RISK DETECTED:
{
  "isUnsafe": true,
  "detectedCondition": "brief condition name",
  "reason": "A gentle 1-sentence explanation of the risk",
  "modification": "A specific safer alternative practice (breathing, gentle poses, meditation)"
}

If SAFE:
{
  "isUnsafe": false,
  "detectedCondition": null,
  "reason": null,
  "modification": null
}`;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: safetyPrompt }],
      model: "gpt-4o-mini",
      temperature: 0.1,
      max_tokens: 256,
    });

    const responseText = completion.choices[0]?.message?.content || "{}";

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { isUnsafe: false };
  } catch (error) {
    console.error("❌ LLM Safety Check Error:", error.message);
    // Fallback to keyword-based check
    return null;
  }
};

/**
 * Generate a safety pivot response (Warning + Safe Alternative)
 */
const generateSafetyPivotResponse = (safetyData, query) => {
  const response = `I appreciate you reaching out about your yoga practice! Since you mentioned ${safetyData.detectedCondition}, I want to make sure you stay safe.

${safetyData.reason}

💡 **Safe Alternative:** ${safetyData.modification}

These gentler practices can still provide wonderful benefits while keeping you comfortable and safe. 🙏`;

  return response;
};

/**
 * Generate safety message with doctor/instructor consultation advice
 */
const generateSmartSafetyMessage = (safetyData) => {
  return `⚠️ ${safetyData.reason}\n\n👨‍⚕️ Please consult a doctor or certified yoga instructor before attempting any yoga practice. They can provide personalized guidance based on your specific health condition.`;
};

module.exports = {
  checkSafetyWithLLM,
  generateSafetyPivotResponse,
  generateSmartSafetyMessage,
};
