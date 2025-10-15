// src/Login/LoginPage.js
import React from "react";
import LoginComponent from "./login_component";
import GoogleLoginBtn from "./googlelogin_component";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./login.css";
import Header from "../layout/headers";

function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="page-login">{/* ← 스코프 래퍼 추가 */}
        <Header hideLogin />
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
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;
