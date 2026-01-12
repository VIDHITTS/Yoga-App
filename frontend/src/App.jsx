import React, { useState } from 'react';
import QueryInput from './components/QueryInput';
import ResponseDisplay from './components/ResponseDisplay';
import { askQuestion } from './services/api';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);

  const handleQuery = async (query) => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const data = await askQuestion(query);
      setResponse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNewQuery = () => {
    setResponse(null);
    setError(null);
  };

  return (
    <div className="app">
      <div className="app-container">
        {/* Header */}
        <header className="app-header">
          <div className="logo-section">
            <span className="logo-icon">🧘‍♀️</span>
            <span className="logo-text">Yoga Wellness Assistant</span>
          </div>
          <div className="header-badge">
            Powered by AI & Ayush Protocol
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {!response && !loading && (
            <QueryInput onSubmit={handleQuery} isLoading={loading} />
          )}

          {loading && (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Searching knowledge base and generating answer...</p>
              <p className="loading-subtext">This usually takes 2-3 seconds</p>
            </div>
          )}

          {error && (
            <div className="error-container">
              <div className="error-icon">❌</div>
              <h3 className="error-title">Something went wrong</h3>
              <p className="error-message">{error}</p>
              <button onClick={handleNewQuery} className="error-button">
                Try Again
              </button>
            </div>
          )}

          {response && !loading && (
            <ResponseDisplay response={response} onNewQuery={handleNewQuery} />
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p className="footer-text">
            Built with ❤️ using RAG technology • Knowledge from Ministry of Ayush, Govt. of India
          </p>
          <p className="footer-disclaimer">
            This application provides educational information only. Always consult healthcare professionals for medical advice.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
