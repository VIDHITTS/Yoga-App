/**
 * Safety detection system for identifying potentially unsafe queries
 * Detects health conditions that require professional medical guidance
 */

const UNSAFE_KEYWORDS = {
  pregnancy: [
    'pregnant', 'pregnancy', 'expecting', 'trimester', 'postpartum', 
    'postnatal', 'prenatal', 'maternity', 'expecting baby'
  ],
  cardiovascular: [
    'high blood pressure', 'hypertension', 'heart disease', 'heart attack',
    'cardiac', 'heart condition', 'heart surgery', 'heart problem',
    'blood pressure', 'bp', 'cardiovascular'
  ],
  musculoskeletal: [
    'herniated disc', 'slipped disc', 'disc prolapse', 'spinal injury',
    'back surgery', 'neck surgery', 'spine surgery', 'fracture',
    'recent surgery', 'post surgery', 'operated', 'broken bone'
  ],
  chronicDiseases: [
    'diabetes', 'diabetic', 'glaucoma', 'epilepsy', 'seizure',
    'hernia', 'vertigo', 'dizziness', 'migraine', 'severe headache'
  ],
  neurologicalConditions: [
    'stroke', 'paralysis', 'neurological', 'parkinsons', 'multiple sclerosis',
    'ms', 'brain injury', 'head injury', 'concussion'
  ],
  cancer: [
    'cancer', 'chemotherapy', 'chemo', 'radiation therapy', 'tumor',
    'oncology', 'malignant', 'carcinoma'
  ],
  respiratoryIssues: [
    'severe asthma', 'copd', 'chronic bronchitis', 'emphysema',
    'severe respiratory', 'oxygen therapy'
  ],
  recentTrauma: [
    'recent injury', 'acute injury', 'fresh wound', 'inflammation',
    'swelling', 'sprain', 'strain', 'torn ligament', 'torn muscle'
  ]
};

/**
 * Check if a query contains unsafe keywords
 * @param {string} query - User's query
 * @returns {Object} - { isUnsafe: boolean, keywords: [], categories: [] }
 */
const detectUnsafeQuery = (query) => {
  const lowerQuery = query.toLowerCase();
  const detectedKeywords = [];
  const detectedCategories = [];

  // Check each category
  for (const [category, keywords] of Object.entries(UNSAFE_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerQuery.includes(keyword.toLowerCase())) {
        if (!detectedKeywords.includes(keyword)) {
          detectedKeywords.push(keyword);
        }
        if (!detectedCategories.includes(category)) {
          detectedCategories.push(category);
        }
      }
    }
  }

  return {
    isUnsafe: detectedKeywords.length > 0,
    keywords: detectedKeywords,
    categories: detectedCategories,
  };
};

/**
 * Generate a safety message based on detected conditions
 * @param {Array} categories - Array of detected condition categories
 * @returns {string} - Safety warning message
 */
const generateSafetyMessage = (categories) => {
  const categoryMessages = {
    pregnancy: "Pregnancy requires special modifications in yoga practice.",
    cardiovascular: "Heart conditions require careful monitoring during physical activity.",
    musculoskeletal: "Spinal and structural injuries need professional assessment before yoga practice.",
    chronicDiseases: "Chronic conditions require personalized modifications.",
    neurologicalConditions: "Neurological conditions require specialized guidance.",
    cancer: "Cancer treatment requires gentle, therapeutic approaches.",
    respiratoryIssues: "Respiratory conditions need breath-aware modifications.",
    recentTrauma: "Recent injuries require healing time before resuming practice."
  };

  const messages = categories.map(cat => categoryMessages[cat] || '').filter(Boolean);
  
  return `⚠️ IMPORTANT SAFETY NOTICE\n\n${messages.join(' ')}\n\nFor your safety, please consult with:\n• Your healthcare provider\n• A certified yoga therapist\n• A qualified instructor experienced with your condition\n\nYoga can be beneficial when practiced safely with professional guidance.`;
};

/**
 * Get safer alternative suggestions based on conditions
 * @param {Array} categories - Array of detected condition categories
 * @returns {Array} - Array of safe practice suggestions
 */
const getSafeAlternatives = (categories) => {
  const alternatives = {
    pregnancy: [
      "Prenatal yoga classes with certified instructors",
      "Gentle pelvic floor exercises (with guidance)",
      "Modified breathing techniques (avoid breath retention)",
      "Supported relaxation poses"
    ],
    cardiovascular: [
      "Gentle breathing exercises (no breath retention)",
      "Seated meditation",
      "Slow, mindful movements",
      "Relaxation techniques like Yoga Nidra"
    ],
    musculoskeletal: [
      "Chair yoga or supported poses",
      "Gentle awareness practices",
      "Breath-focused meditation",
      "Guided relaxation (avoiding affected areas)"
    ],
    chronicDiseases: [
      "Therapeutic yoga with qualified instructor",
      "Gentle breathing practices",
      "Meditation and mindfulness",
      "Restorative yoga poses"
    ],
    neurologicalConditions: [
      "Seated meditation",
      "Gentle breathing awareness",
      "Guided relaxation",
      "Mindfulness practices"
    ],
    cancer: [
      "Cancer-specific yoga programs",
      "Gentle restorative poses",
      "Breath awareness (gentle)",
      "Meditation and visualization"
    ],
    respiratoryIssues: [
      "Natural breathing observation",
      "Gentle, comfortable breathing",
      "Relaxation techniques",
      "Seated meditation"
    ],
    recentTrauma: [
      "Rest and healing first",
      "Gentle breathing awareness",
      "Meditation practices",
      "Gradual return with professional guidance"
    ]
  };

  // Collect unique alternatives
  const allAlternatives = new Set();
  categories.forEach(cat => {
    if (alternatives[cat]) {
      alternatives[cat].forEach(alt => allAlternatives.add(alt));
    }
  });

  return Array.from(allAlternatives).slice(0, 5); // Return top 5
};

module.exports = {
  detectUnsafeQuery,
  generateSafetyMessage,
  getSafeAlternatives,
  UNSAFE_KEYWORDS
};
