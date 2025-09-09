// src/output/googlelogin_component.js
import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import "../login/login.css"; // Login 폴더의 login.css import

const GoogleLoginBtn = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken = tokenResponse.access_token;

        // 백엔드 /auth/login?provider=google&token=<googleToken> 호출
        const url = new URL("http://localhost:8000/auth/login");
        url.searchParams.set("provider", "google");
        url.searchParams.set("token", googleToken);

        const resp = await fetch(url.toString(), {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        });

        if (!resp.ok) {
          throw new Error(`서버 에러: ${resp.status}`);
        }

        // 3) 백엔드에서 리턴한 JWT(access_token)를 받아서 로컬 스토리지에 저장
        const data = await resp.json();
        console.log("백엔드 응답 전체:", data);
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_name", data.name);

        navigate("/input2");
      } catch (err) {
        console.error("로그인 중 에러 발생:", err);
      }
    },
    onError: (error) => {
      console.error("구글 로그인 실패:", error);
    },
  });

  return (
    <button onClick={() => login()} className="google-login-btn">
      구글로 로그인
    </button>
  );
};

export default GoogleLoginBtn;


