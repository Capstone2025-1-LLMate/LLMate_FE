// src/Login/login_component.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // 통합된 스타일 파일 import

function LoginComponent() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const navigate                = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", email, password);
    // 실제 로그인 처리 로직을 여기에 추가하세요.
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
      <button type="submit" className="login-button">
        로그인
      </button>
      <button
        type="button"
        onClick={() => navigate("/signup")}
        className="login-button"
      >
        회원가입
      </button>
    </form>
  );
}

export default LoginComponent;
