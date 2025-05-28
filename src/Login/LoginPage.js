import React from "react";
import LoginComponent from "./logincomponent";
import GoogleLoginBtn from "./googlelogin_component"; // 이름 일치하게 import
import { GoogleOAuthProvider } from "@react-oauth/google"; // Provider import

function LoginPage() {
  return (
    <GoogleOAuthProvider clientId="GOOGLE_CLIENT_ID"> {/* 실제 값으로 교체 */}
      <div style={styles.container}>
        <h2>로그인</h2>
        <LoginComponent />
        <hr />
        <GoogleLoginBtn /> {/* 여기 이름도 일치 */}
      </div>
    </GoogleOAuthProvider>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "2rem",
    border: "2px solid #5984B0",
    borderRadius: "8px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    textAlign: "center"
  }
};

export default LoginPage;
