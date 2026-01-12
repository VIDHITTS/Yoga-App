import React from 'react';
import './SourcesList.css';

const SourcesList = ({ sources }) => {
  return (
    <div className="sources-container">
      <h3 className="sources-title">📚 Sources Used</h3>
      <p className="sources-subtitle">
        Information retrieved from authoritative yoga knowledge base
      </p>

      <div className="sources-list">
        {sources.map((source) => (
          <div key={source.id} className="source-card">
            <div className="source-header">
              <span className="source-number">Source {source.id}</span>
              <span className="relevance-score">
                {(source.relevanceScore * 100).toFixed(1)}% match
              </span>
            </div>

            <h4 className="source-title">{source.title}</h4>

            <div className="source-meta">
              <span className="meta-item">
                📖 {source.source}
              </span>
              {source.page && (
                <span className="meta-item">
                  📄 Page {source.page}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="citation-note">
        <p>
          All information is sourced from the <strong>Common Yoga Protocol</strong>,
          published by the Ministry of Ayush, Government of India.
        </p>
      </div>
    </div>
  );
};

export default SourcesList;
