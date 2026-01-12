const express = require('express');
const router = express.Router();
const QueryLog = require('../models/QueryLog');

/**
 * POST /api/feedback
 * Submit feedback for a query response
 */
router.post('/', async (req, res) => {
  try {
    const { queryId, helpful } = req.body;

    // Validation
    if (!queryId) {
      return res.status(400).json({
        success: false,
        error: 'queryId is required'
      });
    }

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'helpful must be a boolean value (true/false)'
      });
    }

    // Find and update the query log
    const queryLog = await QueryLog.findById(queryId);

    if (!queryLog) {
      return res.status(404).json({
        success: false,
        error: 'Query not found'
      });
    }

    // Update feedback
    queryLog.feedback = {
      helpful,
      timestamp: new Date()
    };

    await queryLog.save();

    console.log(`📝 Feedback received for query ${queryId}: ${helpful ? '👍' : '👎'}`);

    res.json({
      success: true,
      message: 'Thank you for your feedback!',
      feedback: {
        queryId,
        helpful,
        timestamp: queryLog.feedback.timestamp
      }
    });

  } catch (error) {
    console.error('❌ Error in /api/feedback:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit feedback'
    });
  }
});

/**
 * GET /api/feedback/stats
 * Get feedback statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const totalWithFeedback = await QueryLog.countDocuments({
      'feedback.helpful': { $ne: null }
    });
    
    const helpfulCount = await QueryLog.countDocuments({
      'feedback.helpful': true
    });
    
    const unhelpfulCount = await QueryLog.countDocuments({
      'feedback.helpful': false
    });

    res.json({
      success: true,
      stats: {
        totalWithFeedback,
        helpful: helpfulCount,
        unhelpful: unhelpfulCount,
        helpfulPercentage: totalWithFeedback > 0 
          ? ((helpfulCount / totalWithFeedback) * 100).toFixed(2) 
          : 0
      }
    });

  } catch (error) {
    console.error('Error fetching feedback stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch feedback statistics'
    });
  }
});

module.exports = router;
