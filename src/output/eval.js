// src/components/EvaluationPage.js
import React, { useState } from 'react';
import './eval.css';
import chatgptIcon from '../asset/gptLogo.png';
import perplexityIcon from '../asset/perLogo.png';
import claudeIcon from '../asset/claudeLogo.png';

const icons = {
    ChatGPT: chatgptIcon,
    Perplexity: perplexityIcon,
    Claude: claudeIcon,
};
  

const evaluations = [
  { id: 1, reviewer: 'ChatGPT', text: '핵심 경험은 잘 드러났지만, 지원 동기와 직무 연관성이 조금 약합니다. 문장 구조는 매끄럽지만, 차별화된 강점이 더 강조되면 좋겠습니다. 전체적으로 성실한 인상이지만, 임팩트 있는 마무리가 부족합니다.' },
  { id: 2, reviewer: 'Perplexity', text: '핵심 경험은 잘 드러났지만, 지원 동기와 직무 연관성이 조금 약합니다. 문장 구조는 매끄럽지만, 차별화된 강점이 더 강조되면 좋겠습니다. 전체적으로 성실한 인상이지만, 임팩트 있는 마무리가 부족합니다.' },
  { id: 3, reviewer: 'Claude', text: '핵심 경험은 잘 드러났지만, 지원 동기와 직무 연관성이 조금 약합니다. 문장 구조는 매끄럽지만, 차별화된 강점이 더 강조되면 좋겠습니다. 전체적으로 성실한 인상이지만, 임팩트 있는 마무리가 부족합니다.' },
];

const Evaluation = () => {
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

