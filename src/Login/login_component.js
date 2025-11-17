// src/Login/login_component.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./login.css";

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // 간단한 클라이언트 검증 (필요 시 삭제/수정)
    const nextErrors = {};
    if (!email.trim()) nextErrors.email = "이메일을 입력하세요.";
    if (!password.trim()) nextErrors.password = "비밀번호를 입력하세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    try {
      setIsSubmitting(true);
      console.log("로그인 시도:", email, password);
      // TODO: 로그인 연동
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="login-form"
      autoComplete="on"
      noValidate
    >
      <label className="login-label" htmlFor="email">이메일</label>
      <input
        id="email"
        type="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={`login-input ${errors.email ? "error" : ""}`}
        autoComplete="email"
        required
      />
      {errors.email && <p className="field-error">{errors.email}</p>}

      <label className="login-label" htmlFor="pwd">비밀번호</label>
      <input
        id="pwd"
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`login-input ${errors.password ? "error" : ""}`}
        autoComplete="current-password"
        required
      />
      {errors.password && <p className="field-error">{errors.password}</p>}

      {/* ▶ ‘로그인’은 기본 액션 — CSS에서 .login-actions .btn { width:100% } 처리 */}
      <div className="login-actions">
        <button type="submit" className="btn btn--primary" disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : "로그인"}
        </button>
      </div>

      {/* 보조 액션 영역 */}
      <div className="login-meta">
        <Link to="/forgot" className="login-link">비밀번호 찾기</Link>
        <span>
          계정이 없나요?{" "}
          <Link to="/signup" className="signup-link">회원가입</Link>
        </span>
      </div>
    </form>
  );
}

export default LoginComponent;
