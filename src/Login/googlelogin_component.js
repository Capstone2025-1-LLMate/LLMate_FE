import React from "react";
import { GoogleLogin } from "@react-oauth/google"; 
import { jwtDecode } from "jwt-decode";

const GoogleLoginBtn = () => {
  const loginHandle = async (response) => {
    console.log("Google Response:", response);

    const idToken = response.credential;

    // (선택) 토큰 디코드하여 사용자 정보 확인
    const decoded = jwtDecode(idToken);
    console.log("Decoded Token:", decoded);

    try {
      // 백엔드로 id_token 전송
      const res = await fetch("http://localhost:8000/api/v1/auth/google-verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_token: idToken })
      });

      const data = await res.json();
      console.log("Server Response:", data);

      // localStorage.setItem("access_token", data.access_token); // 원하면 저장
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
      locale="zh_CN"
      shape="circle"
      theme="filled_blue"
      logo_alignment="left"
      useOneTap
    />
  );
};

export default GoogleLoginBtn;
