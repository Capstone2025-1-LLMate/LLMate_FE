// src/SignUp/SignUpPage.js
import React from "react";
import SignUpComponent from "./SignUpComponent";

function SignUpPage() {
  return (
    <div style={styles.container}>
      <h2>회원가입</h2>
      <SignUpComponent />
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "400px",
    margin: "100px auto",
    padding: "2rem",
    border: "1px solid #5984B0",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    textAlign: "center",
  },
};

export default SignUpPage;
