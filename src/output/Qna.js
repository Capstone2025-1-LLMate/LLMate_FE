import React from 'react';

import './SelfIntroPage.css';  

const Qna = ({ question, title, answer }) => {
  const combinedText = `${title}\n\n${answer}`;

  return (
    <div className="question-block">
      {/* 1) 문항(면접 질문) */}
      <h4 className="qHead">{question}</h4>

      {/* 2) 소제목 + 본문을 한 textarea 안에 합쳐서 출력 */}
      <textarea
        readOnly
        className="answer-textarea"
        value={combinedText}
      />
    </div>
  );
};
export default Qna;
