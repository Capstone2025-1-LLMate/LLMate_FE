// layoutAside.js
import React, { useState } from "react";
import "./layout.css";

// const LayoutAside = ({ hideText = false, children }) => {
//   const [collapsed, setCollapsed] = useState(false);
const LayoutAside = ({ hideText = false, defaultCollapsed = false, children }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  const showContent = !hideText && !collapsed;

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* 접기/펼치기 버튼 */}
      <button
        className="back-button"
        onClick={() => setCollapsed(prev => !prev)}
        aria-label={collapsed ? "펼치기" : "접기"}
      />

      {/* children을 통해 컨텐츠 주입 */}
      {showContent && children}
    </aside>
  );
};

export default LayoutAside;
