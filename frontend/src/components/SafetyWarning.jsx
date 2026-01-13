import React from "react";
import "./SafetyWarning.css";

const SafetyWarning = ({ safety }) => {
  return (
    <div className="safety-warning">
      <div className="warning-header">
        <span className="warning-icon">⚠️</span>
        <h3 className="warning-title">Safety Notice</h3>
      </div>

      {safety.message && (
        <div className="warning-message">
          {safety.message.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      )}

      {safety.alternatives && safety.alternatives.length > 0 && (
        <div className="alternatives-section">
          <h4 className="alternatives-title">💡 Safer Alternatives:</h4>
          <ul className="alternatives-list">
            {safety.alternatives.map((alternative, index) => (
              <li key={index}>{alternative}</li>
            ))}
          </ul>
        </div>
      )}

      {safety.detectedConditions && safety.detectedConditions.length > 0 && (
        <div className="conditions-detected">
          <span className="conditions-label">Detected Conditions:</span>
          <div className="conditions-tags">
            {safety.detectedConditions.map((condition, index) => (
              <span key={index} className="condition-tag">
                {condition}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="warning-footer">
        <div className="consult-box">
          <span className="consult-icon">👨‍⚕️</span>
          <p className="consult-text">
            <strong>
              Please consult a doctor or certified yoga instructor
            </strong>{" "}
            before attempting any yoga practice. They can provide personalized
            guidance based on your specific health condition.
          </p>
        </div>
        <p className="footer-text">
          ⓘ This information is educational only and not medical advice.
        </p>
      </div>
    </div>
  );
};

export default SafetyWarning;
