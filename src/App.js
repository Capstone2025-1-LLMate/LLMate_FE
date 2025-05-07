// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginPage from "./Login/LoginPage";
import SignUpPage from "./SignUp/SignUpPage";
import OutputPage from './output/outputPage';
import InputPage from './input/inputPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/output" element={<OutputPage />} /> */}
          
          {/* <Route path="/input" element={<InputPage />} /> */}
        </Routes>
        <OutputPage />
        {/* <InputPage/> */}
      </div>
    </Router>
  );
}

export default App;