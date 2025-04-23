import React from 'react';
import './layout.css'; 

const LayoutAside = () => {
  return (
    <aside className="sidebar">
      <div className="back-button">←</div>
      <div className="field">
        <h3>기업</h3>
        <p>네이버</p>
      </div>
      <div className="field">
        <h3>직무</h3>
        <p>백엔드 개발</p>
      </div>
      <div className="skills">
        <span className="skill dev">개발 역량</span>
        <span className="skill comm">소통 능력</span>
        <span className="skill growth">성장 의지</span>
      </div>
    </aside>
  );
};

export default LayoutAside;