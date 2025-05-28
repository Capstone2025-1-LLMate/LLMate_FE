import React from "react";
import { GoogleLogin } from "@react-oauth/google";

const GoogleLoginBtn = () => {
  const loginHandle = async (response) => {
    console.log("Google Response:", response);

    const accessToken = response.credential;

    try {
      const res = await fetch("http://localhost:8000/auth/google", { // ✅ 백엔드 엔드포인트로 수정
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "google",
          token: accessToken, // ✅ access_token 전달
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Server Response:", data);

      // 토큰 저장 (선택)
      localStorage.setItem("access_token", data.access_token);

    } catch (error) {
      console.error("Google login verification failed:", error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={loginHandle}
      onError={() => {
        console.log("Login Failed");
      }}
      width="400px"
      text="continue_with"
      locale="ko"
      shape="circle"
      theme="filled_blue"
      logo_alignment="left"
      useOneTap
    />
  );
};

export default GoogleLoginBtn;
