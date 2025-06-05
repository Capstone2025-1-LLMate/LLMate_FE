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
  return (
    <div className="evaluation-container">
      <h2 className="evaluation-title">평가</h2>

      <div className="evaluation-list">
        {evaluations.map(({ id, reviewer, text }) => (
          <div key={id} className="evaluation-item">
            <div className="avatar">
              <img
                src={icons[reviewer]}
                alt={reviewer}
                className="avatar-img"
              />
            </div>
            <div className="bubble">
              <span className="reviewer-name">{reviewer}</span>
              <p className="review-text">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Evaluation;

