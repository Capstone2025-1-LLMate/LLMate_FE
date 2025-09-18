import React from 'react';
import { useNavigate } from 'react-router-dom';
import './headers.css';

const Header = () => {
  const navigate = useNavigate();
  const isAuthed = !!localStorage.getItem("access_token"); // 🔹 로그인 여부 확인

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.error("로그아웃 API 호출 실패:", err);
    } finally {
      // localStorage 정리
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_name");
      // 랜딩페이지 이동
      navigate("/landingpage", { replace: true });
    }
  };

  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/landingpage')}>
          <span className="logo-main">다:서</span>
          <span className="logo-sub">다多시점에서 자기소개서를 보다</span>
        </div>

        <div className="header-buttons">
          {isAuthed ? (
            <>
              <button
                className="mypage-button"
                onClick={() => navigate('/mypage')}
              >
                마이페이지
              </button>
              <button className="logout-button" onClick={handleLogout}>
                로그아웃
              </button>
            </>
          ) : (
            <button
              className="login-button"
              onClick={() => navigate('/login')}
            >
              로그인
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
