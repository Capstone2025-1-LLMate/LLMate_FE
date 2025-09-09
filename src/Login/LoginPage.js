// src/Login/LoginPage.js
import React from "react";
import LoginComponent from "./login_component";
import GoogleLoginBtn from "./googlelogin_component";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./login.css";

function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <main className="login-hero">
        <section className="login-card">
          <h2 className="login-title">로그인</h2>
          <p className="login-subtitle">
            다양한 시선, <strong>완성</strong>된 자기소개서—<span className="accent">다:서</span>와 함께 시작하세요.
          </p>

          <LoginComponent />

          <div className="login-sep">또는</div>

          <GoogleLoginBtn />
        </section>
      </main>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;
