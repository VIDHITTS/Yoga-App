import React, { useState } from 'react';
import { submitFeedback } from '../services/api';
import SafetyWarning from './SafetyWarning';
import SourcesList from './SourcesList';
import './ResponseDisplay.css';

const ResponseDisplay = ({ response, onNewQuery }) => {
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null);

  const handleFeedback = async (helpful) => {
    try {
      await submitFeedback(response.queryId, helpful);
      setFeedbackSubmitted(true);
      setFeedbackType(helpful);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  return (
    <div className="response-container">
      {/* Safety Warning */}
      {response.safety.isUnsafe && (
        <SafetyWarning safety={response.safety} />
      )}

      {/* Answer Section */}
      <div className="answer-card">
        <div className="answer-header">
          <h2 className="answer-title">✨ Answer</h2>
          <div className="metadata">
            <span className="metadata-item">
              ⏱️ {response.metadata.responseTime}ms
            </span>
            <span className="metadata-item">
              🤖 {response.metadata.model}
            </span>
          </div>
        </div>

        <div className="answer-content">
          <p>{response.answer}</p>
        </div>

        {/* Feedback Section */}
        <div className="feedback-section">
          {!feedbackSubmitted ? (
            <>
              <p className="feedback-question">Was this helpful?</p>
              <div className="feedback-buttons">
                <button
                  onClick={() => handleFeedback(true)}
                  className="feedback-button positive"
                >
                  👍 Yes
                </button>
                <button
                  onClick={() => handleFeedback(false)}
                  className="feedback-button negative"
                >
                  👎 No
                </button>
              </div>
            </>
          ) : (
            <p className="feedback-thanks">
              {feedbackType ? '✅' : '📝'} Thank you for your feedback!
            </p>
          )}
        </div>
      </div>

      {/* Sources */}
      {response.sources && response.sources.length > 0 && (
        <SourcesList sources={response.sources} />
      )}

      {/* New Query Button */}
      <div className="action-section">
        <button onClick={onNewQuery} className="new-query-button">
          ✨ Ask Another Question
        </button>
      </div>
    </div>
  );
};

export default ResponseDisplay;
