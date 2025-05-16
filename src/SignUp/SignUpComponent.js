// src/SignUp/SignUpComponent.js
import React, { useState } from "react";

function SignUpComponent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSignUp = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    console.log("회원가입 정보:", email, password);
    // 회원가입 처리 로직
  };

  return (
    <form onSubmit={handleSignUp} style={styles.form}>
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
      <input
        type="password"
        placeholder="비밀번호 확인"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={styles.input}
        required
      />
      <button type="submit" style={styles.button}>
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
};

export default SignUpComponent;
