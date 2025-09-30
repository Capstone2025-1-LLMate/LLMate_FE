// src/components/EvaluationPage.js
import React, { useState } from 'react';
import './eval.css';
import chatgptIcon from '../asset/gptLogo.png';
import geminiIcon from '../asset/gemLogo.png';
import claudeIcon from '../asset/claudeLogo.png';

const icons = {
    ChatGPT: chatgptIcon,
    Gemini: geminiIcon,
    Claude: claudeIcon,
};

const Evaluation = ({ evaluations = [] }) => {
  const modelMap = {
    "gpt-4o-mini": "ChatGPT",
    "gemini": "Gemini",
    "claude": "Claude"
  };

  return (
    <div className="evaluation-container">
      <div className="evaluation-list">
        {evaluations.map(({ feedback_id, llm_model, feedback_text }) => {
          const reviewerName = modelMap[llm_model] || llm_model;
          return (
            <div key={feedback_id} className="evaluation-item">
              <div className="avatar">
                <img
                  src={icons[reviewerName]}
                  alt={reviewerName}
                  className="avatar-img"
                />
              </div>
              <div className="bubble">
                <span className="reviewer-name">{reviewerName}</span>
                {/* <p className="review-text">{feedback_text}</p> */}
                 {(feedback_text || '')
                  .split('\n')
                  .filter(line => line.trim() !== '')
                  .map((line, idx) => {
                    const trimmed = line.trim();
                    const prefix = trimmed.startsWith('-') || trimmed.startsWith('→') ? '' : '- ';
                    return (
                      <React.Fragment key={idx}>
                        {prefix + trimmed}
                        <br />
                      </React.Fragment>
                    );
                  })} 
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default Evaluation;

