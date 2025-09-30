// src/Login/googlelogin_component.js
import React from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import googleBtn from "../asset/web_light_rd_ctn@4x.png";
import "./login.css";

const GoogleLoginBtn = () => {
  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const googleToken = tokenResponse.access_token;

        const url = new URL("http://localhost:8000/auth/login");
        url.searchParams.set("provider", "google");
        url.searchParams.set("token", googleToken);

        const resp = await fetch(url.toString(), {
          method: "GET",
          headers: { Accept: "application/json" },
        });

        if (!resp.ok) throw new Error(`서버 에러: ${resp.status}`);

        const data = await resp.json();
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user_name", data.name);

        // ✅ 로그인 후 마이페이지 이동
        navigate("/mypage", { replace: true });
      } catch (err) {
        console.error("로그인 중 에러 발생:", err);
      }
    },
    onError: (error) => console.error("구글 로그인 실패:", error),
  });

  return (
    <img
      src={googleBtn}
      alt="Continue with Google"
      onClick={() => login()}
      style={{
        cursor: "pointer",
        width: "auto",
        height: "50px",
        display: "block",
        margin: "0 auto",
      }}
    />
  );
};

export default GoogleLoginBtn;
