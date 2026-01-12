import React, { useState } from 'react';
import './QueryInput.css';

const QueryInput = ({ onSubmit, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSubmit(query.trim());
    }
  };

  const exampleQuestions = [
    "What are the benefits of Surya Namaskar?",
    "How do I start meditation practice?",
    "What yoga poses are good for back pain?",
    "Tell me about pranayama breathing techniques"
  ];

  const handleExampleClick = (example) => {
    setQuery(example);
  };

  return (
    <div className="query-input-container">
      <div className="input-header">
        <h1 className="title">🧘 Ask Me Anything About Yoga</h1>
        <p className="subtitle">
          Get accurate, safe yoga guidance powered by AI and authoritative sources
        </p>
      </div>

      <form onSubmit={handleSubmit} className="query-form">
        <div className="input-wrapper">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask your yoga question here..."
            className="query-textarea"
            rows="4"
            maxLength="500"
            disabled={isLoading}
          />
          <div className="char-count">
            {query.length}/500
          </div>
        </div>
        
        <button 
          type="submit" 
          className={`submit-button ${isLoading ? 'loading' : ''}`}
          disabled={!query.trim() || isLoading}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Thinking...
            </>
          ) : (
            <>
              <span className="icon">✨</span>
              Get Answer
            </>
          )}
        </button>
      </form>

      {!isLoading && (
        <div className="examples-section">
          <p className="examples-title">Try asking:</p>
          <div className="examples-grid">
            {exampleQuestions.map((example, index) => (
              <button
                key={index}
                className="example-button"
                onClick={() => handleExampleClick(example)}
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryInput;
