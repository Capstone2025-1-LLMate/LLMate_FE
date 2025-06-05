// layoutAside.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "./layout.css";

const LayoutAside = ({ hideText = false, defaultCollapsed = false, children }) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  // (선택) userName을 localStorage에서 꺼낼 때 사용
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    setIsLoggedIn(!!token);

    // (선택) 만약 로그인할 때 localStorage.setItem("user_name", 이름) 해 두었다면:
    const storedName = localStorage.getItem("user_name");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  const showContent = !hideText && !collapsed;
  
  const handleLogout = () => {
    // 토큰 등 모든 로그인 관련 데이터 지우기
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_name"); 
    setIsLoggedIn(false);
    // 로그인 페이지로 이동
    navigate("/login");
  };

  const handleLoginClick = () => {
    navigate("/login");
  };

  const handleMyPageClick = () => {
    navigate("/mypage");
  };

    return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* 접기/펼치기 버튼 */}
      <button
        className="back-button"
        onClick={() => setCollapsed(prev => !prev)}
        aria-label={collapsed ? "펼치기" : "접기"}
      />

      {showContent && (
        <div className="sidebar-content">
          {/* 로그인/로그아웃 표시 영역 */}
          <div className="auth-section" style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {isLoggedIn ? (
              <>
                {/* 이름 클릭 시 마이페이지로 이동 */}
                <span
                  onClick={handleMyPageClick}
                  className="user-name"
                  style={{ cursor: "pointer", fontWeight: "bold" }}
                >
                  {userName}님
                </span>
                {/* 로그아웃 버튼 */}
                <button onClick={handleLogout} className="auth-button">
                  로그아웃
                </button>
              </>
            ) : (
              <button onClick={handleLoginClick} className="auth-button">
                로그인
              </button>
            )}
          </div>

          {/* 기존 children 콘텐츠 */}
          <div className="create-link-wrapper">
            <a href="/input" className="btn-create">
              자기소개서 제작하기
            </a>
          </div>
          {children}
        </div>
      )}
    </aside>
  );
};

export default LayoutAside;
