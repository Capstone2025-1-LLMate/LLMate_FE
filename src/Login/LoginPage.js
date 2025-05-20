// src/Login/LoginPage.js
import React from "react";
import LoginComponent from "./logincomponent";
import GoogleLoginBtn from "./googlelogin_component";

function LoginPage() {
  return (
    <div style={styles.container}>
      <h2>로그인</h2>
      <LoginComponent />
      <GoogleLoginBtn />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "2rem",
    border: "2px solid #5984B0",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
    color: "#5984B0"
  },
};

export default LoginPage;
