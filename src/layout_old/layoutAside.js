// src/components/layout/layoutAside.js
import React, { useState } from 'react';
import './layout.css';

const LayoutAside = ({ hideText = false }) => {
  const [collapsed, setCollapsed] = useState(false);

  // 텍스트가 보여질 조건
  const showContent = !hideText && !collapsed;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${hideText ? 'no-text' : ''}`}>
      {/* 접기/펼치기 버튼 */}
      <button
      className="back-button"
      onClick={() => setCollapsed(prev => !prev)}
      aria-label={collapsed ? '펼치기' : '접기'}
      />


      {/* hideText 또는 collapsed 시 콘텐츠 숨김 */}
      {showContent && (
        <>
          <div className="field mt50">
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
        </>
      )}
    </aside>
  );
};

export default LayoutAside;
