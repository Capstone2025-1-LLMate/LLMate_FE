// src/Login/login_component.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

function LoginComponent() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const navigate                = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", email, password);
    // TODO: 실제 로그인 처리 로직 연동
  };

  return (
    <form onSubmit={handleLogin} className="login-form">
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
        required
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="login-input"
        required
      />

      {/* ▶ 같은 가로열 중앙 정렬 + 동일 폭 */}
      <div className="login-actions">
        <button type="submit" className="btn btn--primary">로그인</button>
        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="btn btn--primary "
        >
          회원가입
        </button>
      </div>

      <div className="login-meta">
        <Link to="/forgot" className="login-link">비밀번호 찾기</Link>
        <span>
          계정이 없나요?{" "}
          <button
            type="button"
            className="btn btn--ghost"
            onClick={() => navigate("/signup")}
          >
            가입하기
          </button>
        </span>
      </div>
    </form>
  );
}

export default LoginComponent;
