// src/Login/LoginComponent.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("로그인 시도:", email, password);
    // 로그인 처리 로직
  };

  return (
    <form onSubmit={handleLogin} style={styles.form}>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
        required
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
        required
      />
      <button type="submit" style={styles.button}>
        로그인
      </button>

      {/* 회원가입 페이지로 이동하는 버튼 */}
      <button
        type="button"
        onClick={() => navigate("/signup")}
        style={styles.button}
      >
        회원가입
      </button>
    </form>
  );
}

const styles = {
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
    padding: "1rem",
  },
  input: {
    padding: "0.75rem",
    fontSize: "1rem",
    border: "1px solid #5984B0",
    borderRadius: "4px",
  },
  button: {
    padding: "0.75rem",
    backgroundColor: "#F2EBE5",
    border: "1px solid #5984B0",
    fontWeight: "bold",
    cursor: "pointer",
  },
  linkButton: {
    background: "none",
    border: "none",
    color: "#5984B0",
    cursor: "pointer",
    textDecoration: "underline",
    fontSize: "0.9rem",
  },
};

export default LoginComponent;
