// src/Login/LoginPage.js
import React from "react";
import LoginComponent from "./login_component";
import GoogleLoginBtn from "./googlelogin_component"; 
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./login.css"; // 통합된 스타일 파일 import

function LoginPage() {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <div className="login-page-container">
        <h2 className="text-center">로그인</h2>
        <LoginComponent />
        <hr />
        <GoogleLoginBtn />
      </div>
    </GoogleOAuthProvider>
  );
}

export default LoginPage;
