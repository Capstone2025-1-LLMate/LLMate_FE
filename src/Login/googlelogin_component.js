import React from "react";

const GoogleLoginBtn = () => {
  const redirectToGoogleLogin = () => {
    window.location.href = "http://localhost:8000/auth/login"; // ✅ 백엔드 OAuth 시작
  };

  return (
    <button onClick={redirectToGoogleLogin} style={styles.button}>
      구글로 로그인
    </button>
  );
};

const styles = {
  button: {
    width: "400px",
    height: "50px",
    borderRadius: "5px",
    backgroundColor: "#4285F4",
    color: "#fff",
    fontSize: "16px",
    border: "none",
    cursor: "pointer"
  }
};

export default GoogleLoginBtn;
