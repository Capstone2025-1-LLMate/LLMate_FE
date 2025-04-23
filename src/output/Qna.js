import React from 'react';

import './SelfIntroPage.css';  

const Qna = ({ question, answer }) => {
  return (
    <div className="question-block">
      <h4>{question}</h4>
      <textarea
        readOnly
        value={answer} 
      />
    </div>    
  );
};

export default Qna;
