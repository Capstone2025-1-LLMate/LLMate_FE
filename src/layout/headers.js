// src/layout/headers.js
import React, { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './headers.css';
import timerIcon from "../asset/timer-icon.png";

// 세션 타이머 훅
import { useSessionTimer } from '../utils/useSessionTimer';
import { authFetch } from '../utils/authFetch';

const Header = ({ hideLogin = false }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthed = !!localStorage.getItem("access_token");
  const isLoginPage = location.pathname === "/login";

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("access_token");
      await fetch("http://localhost:8000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
    } catch (err) {
      console.error("로그아웃 API 호출 실패:", err);
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_name");
      navigate("/landingpage", { replace: true });
    }
  };

  // 세션 만료 감지 및 남은 시간 표시
  const onExpire = useCallback(() => {
    localStorage.removeItem("access_token");
    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
    navigate("/login", { replace: true });
  }, [navigate]);

  const { label } = useSessionTimer({ onExpire });

  // 세션 연장
  const extendSession = async () => {
    try {
      const res = await authFetch("http://localhost:8000/auth/refresh", {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("refresh failed");
      const data = await res.json();
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
        alert("세션이 연장되었습니다.");
      }
    } catch (err) {
      console.error("세션 연장 실패:", err);
      onExpire();
    }
  };

  return (
    <header className="site-header">
      <div className="header-content">
        <div className="logo" onClick={() => navigate('/landingpage')}>
          <span className="logo-main">다:서</span>
          <span className="logo-sub">
            <span className="logo-accent">다多</span> 시점에서 <span className="logo-accent">자기소개서</span>를 보다
          </span>
        </div>

        <div className="header-buttons">
          {isAuthed ? (
            <>
              {/* 세션 남은 시간 표시 */}
              <div className="session-timer">
                <img src={timerIcon} alt="timer" className="timer-icon" />
                <span>{label}</span>
              </div>
              {/* <button className="mypage-button" onClick={extendSession}>연장</button> */}
              <button className="mypage-button" onClick={() => navigate('/mypage')}>마이페이지</button>
              <button className="logout-button" onClick={handleLogout}>로그아웃</button>
            </>
          ) : (
            // 로그인 페이지이거나 명시적으로 숨기라고 한 경우 버튼 숨김
            !hideLogin && !isLoginPage && (
              <button className="login-button" onClick={() => navigate('/login')}>로그인</button>
            )
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
